<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\WarehouseController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Customers
    Route::apiResource('customers', CustomerController::class);

    // Products
    Route::apiResource('products', ProductController::class);
    Route::get('/products/low-stock', [ProductController::class, 'lowStock']);

    // Orders
    Route::apiResource('orders', OrderController::class)->except(['edit', 'create']);
    Route::get('/orders/stats/sales', [OrderController::class, 'salesStats']);

    // Inventory
    Route::get('/inventory/summary', [InventoryController::class, 'summary']);
    Route::post('/inventory/{inventory}/update-stock', [InventoryController::class, 'updateStock']);
    Route::post('/inventory/transfer', [InventoryController::class, 'transferStock']);
    Route::apiResource('inventory', InventoryController::class);

    // Warehouses
    Route::apiResource('warehouses', WarehouseController::class);
});

// Admin only routes
Route::middleware(['auth:sanctum', 'role:Manager'])->group(function () {
    // Reports and admin-specific routes can go here
});
