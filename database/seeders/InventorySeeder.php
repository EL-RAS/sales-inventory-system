<?php

namespace Database\Seeders;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        // الحصول على جميع المنتجات والمستودعات
        $products = Product::all();
        $warehouses = Warehouse::all();

        foreach ($products as $product) {
            foreach ($warehouses as $warehouse) {
                // إنشاء مخزون عشوائي بين 10-100 لكل منتج في كل مستودع
                Inventory::create([
                    'product_id' => $product->id,
                    'warehouse_id' => $warehouse->id,
                    'quantity' => rand(10, 100)
                ]);
            }
        }
    }
}
