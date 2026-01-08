<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductsSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'product_name' => 'Laptop Dell XPS 15',
                'category' => 'Electronics',
                'unit_price' => 1299.99,
                'sku' => 'DLL-XPS15-001',
                'description' => '15-inch laptop with Intel Core i7'
            ],
            [
                'product_name' => 'iPhone 15 Pro',
                'category' => 'Mobile',
                'unit_price' => 1099.99,
                'sku' => 'APP-IP15P-001',
                'description' => 'Latest iPhone with A17 Pro chip'
            ],
            [
                'product_name' => 'Samsung 4K TV',
                'category' => 'Electronics',
                'unit_price' => 899.99,
                'sku' => 'SAM-4KTV-001',
                'description' => '55-inch 4K Smart TV'
            ],
            [
                'product_name' => 'Nike Air Max',
                'category' => 'Footwear',
                'unit_price' => 129.99,
                'sku' => 'NKE-AIRMX-001',
                'description' => 'Running shoes size 42'
            ],
            [
                'product_name' => 'Office Desk',
                'category' => 'Furniture',
                'unit_price' => 199.99,
                'sku' => 'OFF-DESK-001',
                'description' => 'Wooden office desk 160x80cm'
            ]
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
