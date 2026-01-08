<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => Hash::make('password123'),
                'role' => 'Manager',
                'phone' => '0501111111'
            ],
            [
                'name' => 'Sales User',
                'email' => 'sales@example.com',
                'password' => Hash::make('password123'),
                'role' => 'Sales',
                'phone' => '0502222222'
            ],
            [
                'name' => 'Warehouse User',
                'email' => 'warehouse@example.com',
                'password' => Hash::make('password123'),
                'role' => 'Warehouse',
                'phone' => '0503333333'
            ]
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
