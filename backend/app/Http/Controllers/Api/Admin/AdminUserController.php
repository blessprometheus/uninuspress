<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Admin\CreatePelaksanaRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminUserController extends Controller
{
    /**
     * GET /api/admin/pelaksana
     * Sama dengan AdminSubmissionController@executors tetapi di sini
     * juga menampilkan Pelaksana nonaktif untuk pengelolaan.
     */
    public function indexPelaksana(Request $request): JsonResponse
    {
        $users = User::role('PELAKSANA')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'is_active', 'created_at'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'is_active' => $u->is_active,
                'created_at' => $u->created_at->toISOString(),
            ]);

        return response()->json(['data' => $users]);
    }

    /**
     * POST /api/admin/pelaksana
     * Admin mendaftarkan akun Pelaksana baru.
     */
    public function createPelaksana(CreatePelaksanaRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'is_active' => true,
        ]);

        $user->assignRole('PELAKSANA');

        return response()->json([
            'message' => 'Pelaksana baru berhasil didaftarkan.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'roles' => $user->getRoleNames(),
                'is_active' => $user->is_active,
            ],
        ], 201);
    }

    /**
     * PATCH /api/admin/pelaksana/{user}/toggle-active
     * Aktifkan / nonaktifkan pelaksana.
     */
    public function toggleActivePelaksana(User $user): JsonResponse
    {
        if (! $user->hasRole('PELAKSANA')) {
            return response()->json(['message' => 'User bukan Pelaksana.'], 422);
        }

        $user->is_active = ! $user->is_active;
        $user->save();

        return response()->json([
            'message' => $user->is_active ? 'Pelaksana diaktifkan.' : 'Pelaksana dinonaktifkan.',
            'data' => [
                'id' => $user->id,
                'is_active' => $user->is_active,
            ],
        ]);
    }
}