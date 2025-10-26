<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Demo User',
            'email' => 'demo@takatrack.com',
            'password' => Hash::make('password'),
            'settings' => [
                'currency' => 'USD',
                'language' => 'en',
                'timezone' => 'UTC',
            ],
        ]);

        User::create([
            'name' => 'Test User',
            'email' => 'test@takatrack.com',
            'password' => Hash::make('password'),
            'settings' => [
                'currency' => 'USD',
                'language' => 'en',
                'timezone' => 'UTC',
            ],
        ]);
    }
}
