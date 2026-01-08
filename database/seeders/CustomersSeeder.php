<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomersSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            [
                'full_name' => 'Mohammed Hassan',
                'phone' => '0501234567',
                'email' => 'mohammed@example.com',
                'address' => 'Dubai, UAE',
                'registration_date' => now()->subDays(30)
            ],
            [
                'full_name' => 'Sarah Ahmed',
                'phone' => '0507654321',
                'email' => 'sarah@example.com',
                'address' => 'Abu Dhabi, UAE',
                'registration_date' => now()->subDays(15)
            ],
            [
                'full_name' => 'Ali EL-Ras',
                'phone' => '0509998888',
                'email' => 'ali@example.com',
                'address' => 'Sharjah, UAE',
                'registration_date' => now()->subDays(7)
            ],
            [
                'full_name' => 'Fatima Khalid',
                'phone' => '0504445555',
                'email' => 'fatima@example.com',
                'address' => 'Ajman, UAE',
                'registration_date' => now()->subDays(3)
            ]
        ];

        foreach ($customers as $customer) {
            Customer::create($customer);
        }
    }
}
