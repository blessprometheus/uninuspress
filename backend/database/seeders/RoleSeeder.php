<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Guard yang dipakai untuk semua role di sistem ini. Karena API menggunakan
     * Sanctum (lihat config/auth.php), seluruh role/permission harus memakai
     * guard_name 'sanctum' — bukan default 'web' — agar middleware Spatie dapat
     * menemukan role saat user terautentikasi via token Sanctum.
     */
    private const GUARD = 'sanctum';

    public function run(): void
    {
        $roles = ['USER', 'ADMIN', 'PELAKSANA'];

        foreach ($roles as $role) {
            Role::findOrCreate($role, self::GUARD);
        }

        $adminEmail = env('ADMIN_EMAIL', 'admin@uninuspress.local');

        if (! User::where('email', $adminEmail)->exists()) {
            $adminPassword = env('ADMIN_PASSWORD');

            if (! $adminPassword) {
                // Jangan pernah diam-diam membuat admin dengan password lemah
                // yang sama di production — wajib diisi eksplisit di .env.
                if (app()->environment('production')) {
                    throw new \RuntimeException(
                        'ADMIN_PASSWORD wajib diisi di .env sebelum menjalankan seeder di production.'
                    );
                }
                $adminPassword = 'admin12345'; // default khusus local/dev
            }

            $admin = User::create([
                'name' => 'Administrator',
                'email' => $adminEmail,
                'phone' => null,
                'password' => Hash::make($adminPassword),
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            $admin->assignRole('ADMIN');
        }
    }
}
