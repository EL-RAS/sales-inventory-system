<?php

namespace Database\Seeders;

use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class WarehousesSeeder extends Seeder
{
    public function run(): void
    {
        $warehouses = [
            [
                'warehouse_name' => 'Main Warehouse',
                'location' => 'Amman'
            ],
            [
                'warehouse_name' => 'Aqaba Storage',
                'location' => 'Aqaba'
            ]
        ];

        foreach ($warehouses as $warehouse) {
            Warehouse::create($warehouse);
        }
    }
}
