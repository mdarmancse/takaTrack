<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = $request->user()->categories()
            ->orderBy('type')
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
            'color' => 'nullable|string|size:7',
            'icon' => 'nullable|string|max:255',
            'budget_limit' => 'nullable|numeric|min:0',
            'description' => 'nullable|string|max:1000',
        ]);

        $category = $request->user()->categories()->create($request->all());

        return response()->json($category, 201);
    }

    public function show(Request $request, Category $category): JsonResponse
    {
        $this->authorize('view', $category);
        return response()->json($category);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $this->authorize('update', $category);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:income,expense',
            'color' => 'nullable|string|size:7',
            'icon' => 'nullable|string|max:255',
            'budget_limit' => 'nullable|numeric|min:0',
            'description' => 'nullable|string|max:1000',
        ]);

        $category->update($request->all());

        return response()->json($category);
    }

    public function destroy(Request $request, Category $category): JsonResponse
    {
        $this->authorize('delete', $category);

        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
