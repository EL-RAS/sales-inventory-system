<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    /**
     * Display a listing of products
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query(); // Temporarily remove with()

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('product_name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $products = $query->paginate($perPage);

        // Calculate total stock for each product directly
        foreach ($products as $product) {
            $product->total_stock = Inventory::where('product_id', $product->id)->sum('quantity');
        }

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    /**
     * Store a newly created product
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_name' => 'required|string|max:150',
            'category' => 'nullable|string|max:50',
            'unit_price' => 'required|numeric|min:0',
            'sku' => 'required|string|max:50|unique:products,sku',
            'description' => 'nullable|string',
        ]);

        $product = Product::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => $product
        ], 201);
    }

    /**
     * Display the specified product
     */
    public function show(Product $product): JsonResponse
    {
        // Download relationships separately
        $product->load(['orderItems.order']);

        // Add inventory manually
        $product->total_stock = Inventory::where('product_id', $product->id)->sum('quantity');
        $product->inventory_details = Inventory::where('product_id', $product->id)->with('warehouse')->get();

        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    /**
     * Update the specified product
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'product_name' => 'sometimes|required|string|max:150',
            'category' => 'sometimes|nullable|string|max:50',
            'unit_price' => 'sometimes|required|numeric|min:0',
            'sku' => 'sometimes|required|string|max:50|unique:products,sku,' . $product->id,
            'description' => 'sometimes|nullable|string',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product
        ]);
    }

    /**
     * Remove the specified product
     */
    public function destroy(Product $product): JsonResponse
    {
        // Check if product has inventory or orders before deleting
        $inventoryCount = Inventory::where('product_id', $product->id)->count();
        $orderItemsCount = $product->orderItems()->count();

        if ($inventoryCount > 0 || $orderItemsCount > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete product with existing inventory or orders'
            ], 400);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }

    /**
     * Get products with low stock
     */
    public function lowStock(Request $request): JsonResponse
    {
        $threshold = $request->get('threshold', 10);

        $allProducts = Product::all();
        $lowStockProducts = [];

        foreach ($allProducts as $product) {
            $totalStock = Inventory::where('product_id', $product->id)->sum('quantity');
            if ($totalStock <= $threshold) {
                $product->total_stock = $totalStock;
                $lowStockProducts[] = $product;
            }
        }

        return response()->json([
            'success' => true,
            'data' => $lowStockProducts
        ]);
    }
}
