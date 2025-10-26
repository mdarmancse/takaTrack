<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Page::with(['creator', 'updater', 'parent']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by parent
        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $pages = $query->orderBy('sort_order')->paginate(15);

        return response()->json($pages);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'excerpt' => 'nullable|string|max:500',
            'status' => 'required|in:draft,published,archived',
            'template' => 'nullable|string|max:100',
            'meta' => 'nullable|array',
            'blocks' => 'nullable|array',
            'parent_id' => 'nullable|exists:pages,id',
            'sort_order' => 'nullable|integer|min:0',
            'featured' => 'nullable|boolean',
            'published_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $page = Page::create([
            ...$request->validated(),
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ]);

        return response()->json($page->load(['creator', 'updater', 'parent']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Page $page): JsonResponse
    {
        return response()->json($page->load(['creator', 'updater', 'parent', 'children']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Page $page): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'content' => 'nullable|string',
            'excerpt' => 'nullable|string|max:500',
            'status' => 'sometimes|in:draft,published,archived',
            'template' => 'nullable|string|max:100',
            'meta' => 'nullable|array',
            'blocks' => 'nullable|array',
            'parent_id' => 'nullable|exists:pages,id',
            'sort_order' => 'nullable|integer|min:0',
            'featured' => 'nullable|boolean',
            'published_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $page->update([
            ...$request->validated(),
            'updated_by' => Auth::id(),
        ]);

        return response()->json($page->load(['creator', 'updater', 'parent']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Page $page): JsonResponse
    {
        // Check if page has children
        if ($page->children()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete page with child pages. Please delete child pages first.'
            ], 422);
        }

        $page->delete();

        return response()->json(['message' => 'Page deleted successfully']);
    }

    /**
     * Get published pages for public API.
     */
    public function published(): JsonResponse
    {
        $pages = Page::published()
            ->with(['creator'])
            ->orderBy('sort_order')
            ->get();

        return response()->json($pages);
    }

    /**
     * Get page by slug for public API.
     */
    public function showBySlug(string $slug): JsonResponse
    {
        $page = Page::published()
            ->where('slug', $slug)
            ->with(['creator', 'parent', 'children'])
            ->first();

        if (!$page) {
            return response()->json(['message' => 'Page not found'], 404);
        }

        return response()->json($page);
    }
}