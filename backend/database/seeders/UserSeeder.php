<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        if (! User::where('email', 'pelaksana1@uninuspress.local')->exists()) {
            $pelaksana = User::create([
                'name' => 'Pelaksana Satu',
                'email' => 'pelaksana1@uninuspress.local',
                'phone' => '081234567891',
                'password' => Hash::make('pelaksana123'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
            $pelaksana->assignRole('PELAKSANA');
        }

        if (! User::where('email', 'pelaksana2@uninuspress.local')->exists()) {
            $pelaksana2 = User::create([
                'name' => 'Pelaksana Dua',
                'email' => 'pelaksana2@uninuspress.local',
                'phone' => '081234567892',
                'password' => Hash::make('pelaksana123'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
            $pelaksana2->assignRole('PELAKSANA');
        }

        if (! User::where('email', 'user@uninuspress.local')->exists()) {
            $user = User::create([
                'name' => 'User Biasa',
                'email' => 'user@uninuspress.local',
                'phone' => '081234567890',
                'password' => Hash::make('user12345'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
            $user->assignRole('USER');
        }
    }
}