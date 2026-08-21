<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = ['USER', 'ADMIN', 'PELAKSANA'];

        foreach ($roles as $role) {
            Role::findOrCreate($role);
        }

        if (! User::where('email', 'admin@uninuspress.local')->exists()) {
            $admin = User::create([
                'name' => 'Administrator',
                'email' => 'admin@uninuspress.local',
                'phone' => null,
                'password' => Hash::make('admin12345'),
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            $admin->assignRole('ADMIN');
        }
    }
}
