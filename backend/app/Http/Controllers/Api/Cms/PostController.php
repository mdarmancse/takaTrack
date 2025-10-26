<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Post::with(['author']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by tag
        if ($request->has('tag')) {
            $query->withTag($request->tag);
        }

        // Filter by category
        if ($request->has('category')) {
            $query->inCategory($request->category);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        $posts = $query->orderBy('published_at', 'desc')->paginate(15);

        return response()->json($posts);
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
            'type' => 'nullable|string|max:50',
            'meta' => 'nullable|array',
            'blocks' => 'nullable|array',
            'featured_image' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'categories' => 'nullable|array',
            'categories.*' => 'string|max:50',
            'published_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $post = Post::create([
            ...$request->validated(),
            'author_id' => Auth::id(),
        ]);

        return response()->json($post->load(['author']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post): JsonResponse
    {
        return response()->json($post->load(['author']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'content' => 'nullable|string',
            'excerpt' => 'nullable|string|max:500',
            'status' => 'sometimes|in:draft,published,archived',
            'type' => 'nullable|string|max:50',
            'meta' => 'nullable|array',
            'blocks' => 'nullable|array',
            'featured_image' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'categories' => 'nullable|array',
            'categories.*' => 'string|max:50',
            'published_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $post->update($request->validated());

        return response()->json($post->load(['author']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post): JsonResponse
    {
        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }

    /**
     * Get published posts for public API.
     */
    public function published(Request $request): JsonResponse
    {
        $query = Post::published()->with(['author']);

        // Filter by type
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        // Filter by tag
        if ($request->has('tag')) {
            $query->withTag($request->tag);
        }

        // Filter by category
        if ($request->has('category')) {
            $query->inCategory($request->category);
        }

        $posts = $query->orderBy('published_at', 'desc')->paginate(10);

        return response()->json($posts);
    }

    /**
     * Get post by slug for public API.
     */
    public function showBySlug(string $slug): JsonResponse
    {
        $post = Post::published()
            ->where('slug', $slug)
            ->with(['author'])
            ->first();

        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        return response()->json($post);
    }

    /**
     * Get all tags.
     */
    public function tags(): JsonResponse
    {
        $tags = Post::whereNotNull('tags')
            ->get()
            ->pluck('tags')
            ->flatten()
            ->unique()
            ->values();

        return response()->json($tags);
    }

    /**
     * Get all categories.
     */
    public function categories(): JsonResponse
    {
        $categories = Post::whereNotNull('categories')
            ->get()
            ->pluck('categories')
            ->flatten()
            ->unique()
            ->values();

        return response()->json($categories);
    }
}