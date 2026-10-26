<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookResource;
use App\Models\Book;
use App\Services\BookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBookController extends Controller
{
    public function __construct(private readonly BookService $service) {}

    /**
     * GET /api/admin/books
     * Termasuk buku yang belum ber-ISBN / belum dipublish.
     */
    public function index(): JsonResponse
    {
        $books = Book::query()->with('submission')->latest('id')->get();

        return response()->json([
            'books' => BookResource::collection($books)->resolve(),
        ]);
    }

    /**
     * POST /api/admin/books
     * Tambah buku baru secara manual (tidak terkait submission).
     * Body multipart: title, author (wajib), synopsis, category, isbn,
     * price, year (opsional), cover (gambar, opsional).
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'author' => ['required', 'string', 'max:255'],
            'synopsis' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'isbn' => ['nullable', 'string', 'max:50'],
            'price' => ['nullable', 'integer', 'min:0'],
            'year' => ['nullable', 'string', 'max:9'],
            'cover' => ['nullable', 'image', 'max:5120'],
        ]);

        $book = $this->service->createManual($data, $request->file('cover'));

        return response()->json([
            'message' => 'Buku baru berhasil ditambahkan.',
            'book' => (new BookResource($book))->resolve(),
        ], 201);
    }

    /**
     * PATCH /api/admin/books/{book}
     * Body: title, author, synopsis, category, isbn, price, year, is_published (semua opsional).
     */
    public function update(Request $request, Book $book): JsonResponse
    {
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'author' => ['sometimes', 'string', 'max:255'],
            'synopsis' => ['sometimes', 'nullable', 'string'],
            'category' => ['sometimes', 'nullable', 'string', 'max:100'],
            'isbn' => ['sometimes', 'nullable', 'string', 'max:50'],
            'price' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'year' => ['sometimes', 'nullable', 'string', 'max:9'],
            'is_published' => ['sometimes', 'boolean'],
        ]);

        $book = $this->service->updateDetails($book, $data);

        return response()->json([
            'message' => 'Data buku diperbarui.',
            'book' => (new BookResource($book))->resolve(),
        ]);
    }

    /**
     * POST /api/admin/books/{book}/cover
     * Body multipart: cover (image). Dipakai untuk memasang cover ber-ISBN
     * setelah nomor ISBN terbit dari Perpusnas.
     */
    public function uploadCover(Request $request, Book $book): JsonResponse
    {
        $request->validate([
            'cover' => ['required', 'image', 'max:5120'],
        ]);

        $this->service->updateCover($book, $request->file('cover'));
        $book->refresh();

        return response()->json([
            'message' => 'Cover buku berhasil diperbarui.',
            'book' => (new BookResource($book))->resolve(),
        ]);
    }

    /**
     * DELETE /api/admin/books/{book}
     */
    public function destroy(Book $book): JsonResponse
    {
        $this->service->delete($book);

        return response()->json([
            'message' => 'Buku berhasil dihapus.',
        ]);
    }
}
