<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookResource;
use App\Models\Book;
use Illuminate\Http\JsonResponse;

/**
 * Endpoint publik Toko Buku.
 */
class BookController extends Controller
{
    /**
     * GET /api/books
     */
    public function index(): JsonResponse
    {
        $books = Book::query()
            ->where('is_published', true)
            ->latest('published_at')
            ->get();

        return response()->json([
            'books' => BookResource::collection($books)->resolve(),
        ]);
    }

    /**
     * GET /api/books/{slug}
     */
    public function show(string $slug): JsonResponse
    {
        $book = Book::query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return response()->json([
            'book' => (new BookResource($book))->resolve(),
        ]);
    }
}
