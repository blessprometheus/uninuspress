<?php

use App\Http\Controllers\Api\Admin\AdminBookController;
use App\Http\Controllers\Api\Admin\AdminSubmissionController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\Executors\ExecutorSubmissionController;
use App\Http\Controllers\Api\Submissions\UserSubmissionController;
use Illuminate\Support\Facades\Route;

// Toko Buku (publik)
Route::get('books', [BookController::class, 'index']);
Route::get('books/{slug}', [BookController::class, 'show']);

Route::prefix('auth')->group(function (): void {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::post('forgot-password', [PasswordResetController::class, 'forgot']);
    Route::post('reset-password', [PasswordResetController::class, 'reset']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

// Akses USER (pemilik pengajuan)
Route::middleware('auth:sanctum')->prefix('submissions')->group(function (): void {
    Route::get('/', [UserSubmissionController::class, 'index']);
    Route::post('/', [UserSubmissionController::class, 'store']);
    Route::get('{submission}', [UserSubmissionController::class, 'show']);
    Route::post('{submission}/documents', [UserSubmissionController::class, 'uploadDocument']);
    Route::post('{submission}/submit', [UserSubmissionController::class, 'submit']);
    Route::get('{submission}/documents/{media}/download', [UserSubmissionController::class, 'downloadDocument'])
        ->whereNumber('media');
    Route::post('{submission}/finalize', [UserSubmissionController::class, 'finalize']);
});

// Akses ADMIN
Route::middleware(['auth:sanctum', 'role:ADMIN'])->prefix('admin')->group(function (): void {
    Route::get('submissions', [AdminSubmissionController::class, 'index']);
    Route::get('submissions/{submission}', [AdminSubmissionController::class, 'show']);
    Route::post('submissions/{submission}/start-review', [AdminSubmissionController::class, 'startReview']);
    Route::post('submissions/{submission}/request-revision', [AdminSubmissionController::class, 'requestRevision']);
    Route::post('submissions/{submission}/approve-assign', [AdminSubmissionController::class, 'approveAndAssign']);
    Route::post('submissions/{submission}/submit-to-perpusnas', [AdminSubmissionController::class, 'submitToPerpusnas']);
    Route::post('submissions/{submission}/perpusnas-waiting', [AdminSubmissionController::class, 'markWaitingPerpusnas']);
    Route::post('submissions/{submission}/perpusnas-result', [AdminSubmissionController::class, 'uploadPerpusnasResult']);

    Route::get('pelaksana', [AdminUserController::class, 'indexPelaksana']);
    Route::post('pelaksana', [AdminUserController::class, 'createPelaksana']);
    Route::patch('pelaksana/{user}/toggle-active', [AdminUserController::class, 'toggleActivePelaksana']);

    Route::get('books', [AdminBookController::class, 'index']);
    Route::patch('books/{book}', [AdminBookController::class, 'update']);
    Route::post('books/{book}/cover', [AdminBookController::class, 'uploadCover']);
});

// Akses PELAKSANA (hanya pengajuan yang ditugaskan)
Route::middleware(['auth:sanctum', 'role:PELAKSANA'])->prefix('executor')->group(function (): void {
    Route::get('submissions', [ExecutorSubmissionController::class, 'index']);
    Route::get('submissions/{submission}', [ExecutorSubmissionController::class, 'show']);
    Route::post('submissions/{submission}/start-review', [ExecutorSubmissionController::class, 'startReview']);
    Route::post('submissions/{submission}/request-revision', [ExecutorSubmissionController::class, 'requestRevision']);
    Route::post('submissions/{submission}/approve', [ExecutorSubmissionController::class, 'approve']);
    Route::post('submissions/{submission}/upload', [ExecutorSubmissionController::class, 'upload']);
    Route::post('submissions/{submission}/complete-layout', [ExecutorSubmissionController::class, 'completeLayout']);
});
