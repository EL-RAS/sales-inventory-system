<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
  /**
   * Display a listing of customers
   */
  public function index(Request $request): JsonResponse
  {
    $query = Customer::query();

    // Search functionality
    if ($request->has('search')) {
      $search = $request->search;
      $query->where(function ($q) use ($search) {
        $q->where('full_name', 'like', "%{$search}%")
          ->orWhere('phone', 'like', "%{$search}%")
          ->orWhere('email', 'like', "%{$search}%");
      });
    }

    // Pagination
    $perPage = $request->get('per_page', 10);
    $customers = $query->paginate($perPage);

    return response()->json([
      'success' => true,
      'data' => $customers
    ]);
  }

  /**
   * Store a newly created customer
   */
  public function store(Request $request): JsonResponse
  {
    $validated = $request->validate([
      'full_name' => 'required|string|max:100',
      'phone' => 'required|string|max:20|unique:customers,phone',
      'email' => 'nullable|email|max:100|unique:customers,email',
      'address' => 'nullable|string|max:200',
    ]);

    $customer = Customer::create($validated);

    return response()->json([
      'success' => true,
      'message' => 'Customer created successfully',
      'data' => $customer
    ], 201);
  }

  /**
   * Display the specified customer
   */
  public function show(Customer $customer): JsonResponse
  {
    $customer->load('orders.orderItems.product');

    return response()->json([
      'success' => true,
      'data' => $customer
    ]);
  }

  /**
   * Update the specified customer
   */
  public function update(Request $request, Customer $customer): JsonResponse
  {
    $validated = $request->validate([
      'full_name' => 'sometimes|required|string|max:100',
      'phone' => 'sometimes|required|string|max:20|unique:customers,phone,' . $customer->id,
      'email' => 'sometimes|nullable|email|max:100|unique:customers,email,' . $customer->id,
      'address' => 'sometimes|nullable|string|max:200',
    ]);

    $customer->update($validated);

    return response()->json([
      'success' => true,
      'message' => 'Customer updated successfully',
      'data' => $customer
    ]);
  }

  /**
   * Remove the specified customer
   */
  public function destroy(Customer $customer): JsonResponse
  {
    // Check if customer has orders before deleting
    if ($customer->orders()->count() > 0) {
      return response()->json([
        'success' => false,
        'message' => 'Cannot delete customer with existing orders'
      ], 400);
    }

    $customer->delete();

    return response()->json([
      'success' => true,
      'message' => 'Customer deleted successfully'
    ]);
  }
}
