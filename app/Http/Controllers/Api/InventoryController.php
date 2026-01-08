<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InventoryController extends Controller
{
  /**
   * Display a listing of inventory
   */
  public function index(Request $request): JsonResponse
  {
    $query = Inventory::with(['product', 'warehouse']);

    // Filter by warehouse
    if ($request->has('warehouse_id')) {
      $query->where('warehouse_id', $request->warehouse_id);
    }

    // Filter by product
    if ($request->has('product_id')) {
      $query->where('product_id', $request->product_id);
    }

    // Low stock filter
    if ($request->has('low_stock')) {
      $threshold = $request->get('threshold', 10);
      $query->where('quantity', '<=', $threshold);
    }

    // Pagination
    $perPage = $request->get('per_page', 10);
    $inventory = $query->paginate($perPage);

    return response()->json([
      'success' => true,
      'data' => $inventory
    ]);
  }

  /**
   * Store a newly created inventory record
   */
  public function store(Request $request): JsonResponse
  {
    $validated = $request->validate([
      'product_id' => 'required|exists:products,id',
      'warehouse_id' => 'required|exists:warehouses,id',
      'quantity' => 'required|integer|min:0',
    ]);

    // Check if combination already exists
    $existing = Inventory::where('product_id', $validated['product_id'])
      ->where('warehouse_id', $validated['warehouse_id'])
      ->first();

    if ($existing) {
      return response()->json([
        'success' => false,
        'message' => 'Inventory record for this product and warehouse already exists'
      ], 400);
    }

    $inventory = Inventory::create($validated);
    $inventory->load(['product', 'warehouse']);

    return response()->json([
      'success' => true,
      'message' => 'Inventory record created successfully',
      'data' => $inventory
    ], 201);
  }

/**
 * Update the specified inventory record
 */
public function update(Request $request, Inventory $inventory): JsonResponse
{
    $validated = $request->validate([
        'product_id' => 'required|exists:products,id',
        'warehouse_id' => 'required|exists:warehouses,id',
        'quantity' => 'required|integer|min:0',
    ]);

    // If the warehouse or product is changed
    if ($inventory->warehouse_id != $validated['warehouse_id'] ||
        $inventory->product_id != $validated['product_id']) {

        // Check if the new mix already exists
        $existing = Inventory::where('product_id', $validated['product_id'])
            ->where('warehouse_id', $validated['warehouse_id'])
            ->first();

        if ($existing && $existing->id != $inventory->id) {
            return response()->json([
                'success' => false,
                'message' => 'Inventory record for this product and warehouse already exists'
            ], 400);
        }

        // If it is the same record, allow the update
    }

    $inventory->update($validated);
    $inventory->load(['product', 'warehouse']);

    return response()->json([
        'success' => true,
        'message' => 'Inventory updated successfully',
        'data' => $inventory
    ]);
}

  /**
   * Remove the specified inventory record
   */
  public function destroy(Inventory $inventory): JsonResponse
  {
    $inventory->delete();

    return response()->json([
      'success' => true,
      'message' => 'Inventory record deleted successfully'
    ]);
  }

  /**
   * Update stock quantity (add or remove)
   */
  public function updateStock(Request $request, Inventory $inventory): JsonResponse
  {
    $validated = $request->validate([
      'quantity' => 'required|integer',
      'operation' => 'required|in:add,subtract,set',
      'reason' => 'nullable|string|max:255',
    ]);

    $newQuantity = match ($validated['operation']) {
      'add' => $inventory->quantity + $validated['quantity'],
      'subtract' => $inventory->quantity - $validated['quantity'],
      'set' => $validated['quantity'],
    };

    // Ensure quantity doesn't go below 0
    if ($newQuantity < 0) {
      return response()->json([
        'success' => false,
        'message' => 'Stock quantity cannot be negative'
      ], 400);
    }

    $inventory->update(['quantity' => $newQuantity]);

    // Log stock movement (you can create a StockMovement model for this)
    // StockMovement::create([
    //     'inventory_id' => $inventory->id,
    //     'quantity' => $validated['quantity'],
    //     'operation' => $validated['operation'],
    //     'reason' => $validated['reason'],
    //     'user_id' => auth()->id(),
    // ]);

    $inventory->load(['product', 'warehouse']);

    return response()->json([
      'success' => true,
      'message' => 'Stock updated successfully',
      'data' => $inventory
    ]);
  }

  /**
   * Transfer stock between warehouses
   */
  public function transferStock(Request $request): JsonResponse
  {
    $validated = $request->validate([
      'from_warehouse_id' => 'required|exists:warehouses,id',
      'to_warehouse_id' => 'required|exists:warehouses,id|different:from_warehouse_id',
      'product_id' => 'required|exists:products,id',
      'quantity' => 'required|integer|min:1',
      'reason' => 'nullable|string|max:255',
    ]);

    // Check if source has enough stock
    $sourceInventory = Inventory::where('product_id', $validated['product_id'])
      ->where('warehouse_id', $validated['from_warehouse_id'])
      ->first();

    if (!$sourceInventory || $sourceInventory->quantity < $validated['quantity']) {
      return response()->json([
        'success' => false,
        'message' => 'Insufficient stock in source warehouse'
      ], 400);
    }

    // Find or create destination inventory
    $destinationInventory = Inventory::firstOrCreate(
      [
        'product_id' => $validated['product_id'],
        'warehouse_id' => $validated['to_warehouse_id'],
      ],
      ['quantity' => 0]
    );

    // Perform transfer
    $sourceInventory->decrement('quantity', $validated['quantity']);
    $destinationInventory->increment('quantity', $validated['quantity']);

    // Log transfer (you can create a StockTransfer model for this)

    return response()->json([
      'success' => true,
      'message' => 'Stock transferred successfully',
      'data' => [
        'source' => $sourceInventory->fresh(['product', 'warehouse']),
        'destination' => $destinationInventory->fresh(['product', 'warehouse']),
      ]
    ]);
  }

  /**
   * Get inventory summary
   */

public function summary(): JsonResponse
{
    try {
        $summary = Inventory::with(['product', 'warehouse'])
            ->select('product_id', 'warehouse_id')
            ->selectRaw('SUM(quantity) as total_quantity')
            ->groupBy('product_id', 'warehouse_id')
            ->havingRaw('SUM(quantity) > 0')
            ->get();

        $lowStock = Inventory::with(['product', 'warehouse'])
            ->where('quantity', '<=', 10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'low_stock' => $lowStock,
            ]
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage()
        ], 500);
    }
}

}
