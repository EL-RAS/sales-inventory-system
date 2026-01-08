<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
  /**
   * Display a listing of orders
   */
  public function index(Request $request): JsonResponse
  {
    $query = Order::with(['customer', 'user', 'orderItems.product']);

    // Filter by status
    if ($request->has('status')) {
      $query->where('order_status', $request->status);
    }

    // Filter by date range
    if ($request->has('start_date')) {
      $query->whereDate('order_date', '>=', $request->start_date);
    }

    if ($request->has('end_date')) {
      $query->whereDate('order_date', '<=', $request->end_date);
    }

    // Search by customer name
    if ($request->has('customer')) {
      $query->whereHas('customer', function ($q) use ($request) {
        $q->where('full_name', 'like', "%{$request->customer}%");
      });
    }

    // Order by latest
    $query->orderBy('created_at', 'desc');

    // Pagination
    $perPage = $request->get('per_page', 10);
    $orders = $query->paginate($perPage);

    return response()->json([
      'success' => true,
      'data' => $orders
    ]);
  }

  /**
   * Store a newly created order
   */
  public function store(Request $request): JsonResponse
  {
    $validated = $request->validate([
      'customer_id' => 'required|exists:customers,id',
      'payment_method' => 'required|string|max:20',
      'items' => 'required|array|min:1',
      'items.*.product_id' => 'required|exists:products,id',
      'items.*.quantity' => 'required|integer|min:1',
    ]);

    // Start transaction
    DB::beginTransaction();

    try {
      $user = Auth::user();

      // Create order
      $order = Order::create([
        'customer_id' => $validated['customer_id'],
        'user_id' => $user ? $user->id : null,
        'order_date' => now(),
        'total_amount' => 0, // Will be calculated
        'payment_method' => $validated['payment_method'],
        'order_status' => 'Pending',
      ]);

      $totalAmount = 0;

      // Process each item
      foreach ($validated['items'] as $item) {
        $product = Product::find($item['product_id']);

        // Check available stock
        $availableStock = Inventory::where('product_id', $item['product_id'])
          ->sum('quantity');

        if ($availableStock < $item['quantity']) {
          throw new \Exception("Insufficient stock for product: {$product->product_name}. Available: {$availableStock}, Requested: {$item['quantity']}");
        }

        // Deduct from inventory (FIFO)
        $this->deductFromInventory($item['product_id'], $item['quantity']);

        // Calculate subtotal
        $subtotal = $item['quantity'] * $product->unit_price;

        // Create order item
        OrderItem::create([
          'order_id' => $order->id,
          'product_id' => $item['product_id'],
          'quantity' => $item['quantity'],
          'unit_price' => $product->unit_price,
          'subtotal' => $subtotal,
        ]);

        $totalAmount += $subtotal;
      }

      // Update order total
      $order->update(['total_amount' => $totalAmount]);

      // Commit transaction
      DB::commit();

      // Load relationships
      $order->load(['customer', 'user', 'orderItems.product']);

      return response()->json([
        'success' => true,
        'message' => 'Order created successfully',
        'data' => $order
      ], 201);
    } catch (\Exception $e) {
      // Rollback transaction on error
      DB::rollBack();

      Log::error('Order creation failed: ' . $e->getMessage());

      return response()->json([
        'success' => false,
        'message' => 'Order creation failed: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Deduct quantity from inventory using FIFO
   */
  private function deductFromInventory($productId, $quantity)
  {
    $inventories = Inventory::where('product_id', $productId)
      ->where('quantity', '>', 0)
      ->orderBy('created_at')
      ->get();

    $remaining = $quantity;

    foreach ($inventories as $inventory) {
      if ($remaining <= 0) break;

      $deduct = min($inventory->quantity, $remaining);
      $inventory->decrement('quantity', $deduct);
      $remaining -= $deduct;
    }
  }

  /**
   * Display the specified order
   */
  public function show(Order $order): JsonResponse
  {
    $order->load(['customer', 'user', 'orderItems.product']);

    return response()->json([
      'success' => true,
      'data' => $order
    ]);
  }

  /**
   * Update the specified order status
   */
  public function update(Request $request, Order $order): JsonResponse
  {
    $validated = $request->validate([
      'order_status' => 'required|in:Pending,Processing,Shipped,Delivered,Cancelled',
    ]);

    // If cancelling, return stock to inventory
    if ($validated['order_status'] === 'Cancelled' && $order->order_status !== 'Cancelled') {
      $this->returnToInventory($order);
    }

    $order->update($validated);

    return response()->json([
      'success' => true,
      'message' => 'Order status updated successfully',
      'data' => $order
    ]);
  }

  /**
   * Return stock to inventory when order is cancelled
   */
  private function returnToInventory(Order $order)
  {
    foreach ($order->orderItems as $item) {
      // Add to first warehouse
      $inventory = Inventory::where('product_id', $item->product_id)
        ->orderBy('created_at')
        ->first();

      if ($inventory) {
        $inventory->increment('quantity', $item->quantity);
      }
    }
  }

  /**
   * Get sales statistics
   */
  public function salesStats(Request $request): JsonResponse
  {
    $startDate = $request->get('start_date', now()->startOfMonth());
    $endDate = $request->get('end_date', now()->endOfMonth());

    $stats = Order::whereBetween('order_date', [$startDate, $endDate])
      ->where('order_status', '!=', 'Cancelled')
      ->select([
        DB::raw('COUNT(*) as total_orders'),
        DB::raw('SUM(total_amount) as total_revenue'),
        DB::raw('AVG(total_amount) as avg_order_value'),
        DB::raw('MAX(total_amount) as max_order_value'),
        DB::raw('MIN(total_amount) as min_order_value'),
      ])
      ->first();

    // Top selling products
    $topProducts = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
      ->join('products', 'order_items.product_id', '=', 'products.id')
      ->whereBetween('orders.order_date', [$startDate, $endDate])
      ->where('orders.order_status', '!=', 'Cancelled')
      ->select([
        'products.product_name',
        DB::raw('SUM(order_items.quantity) as total_quantity'),
        DB::raw('SUM(order_items.subtotal) as total_revenue'),
      ])
      ->groupBy('products.id', 'products.product_name')
      ->orderBy('total_quantity', 'desc')
      ->limit(10)
      ->get();

    return response()->json([
      'success' => true,
      'data' => [
        'statistics' => $stats,
        'top_products' => $topProducts,
      ]
    ]);
  }
}
