<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WarehouseController extends Controller
{
  /**
   * Display a listing of warehouses.
   */
  public function index(): JsonResponse
  {
    $warehouses = Warehouse::all();

    return response()->json([
      'success' => true,
      'data' => $warehouses
    ]);
  }

  /**
   * Store a newly created warehouse.
   */
  public function store(Request $request): JsonResponse
  {
    $validated = $request->validate([
      'warehouse_name' => 'required|string|max:100',
      'location' => 'required|string|max:150',
    ]);

    $warehouse = Warehouse::create($validated);

    return response()->json([
      'success' => true,
      'message' => 'Warehouse created successfully',
      'data' => $warehouse
    ], 201);
  }

  /**
   * Display the specified warehouse.
   */
  public function show(Warehouse $warehouse): JsonResponse
  {
    $warehouse->load('inventory.product');

    return response()->json([
      'success' => true,
      'data' => $warehouse
    ]);
  }

  /**
   * Update the specified warehouse.
   */
  public function update(Request $request, Warehouse $warehouse): JsonResponse
  {
    $validated = $request->validate([
      'warehouse_name' => 'sometimes|required|string|max:100',
      'location' => 'sometimes|required|string|max:150',
    ]);

    $warehouse->update($validated);

    return response()->json([
      'success' => true,
      'message' => 'Warehouse updated successfully',
      'data' => $warehouse
    ]);
  }

  /**
   * Remove the specified warehouse.
   */
  public function destroy(Warehouse $warehouse): JsonResponse
  {
    // Check if warehouse has inventory before deleting
    if ($warehouse->inventory()->count() > 0) {
      return response()->json([
        'success' => false,
        'message' => 'Cannot delete warehouse with existing inventory'
      ], 400);
    }

    $warehouse->delete();

    return response()->json([
      'success' => true,
      'message' => 'Warehouse deleted successfully'
    ]);
  }
}
