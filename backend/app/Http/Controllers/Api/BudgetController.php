<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $budgets = $request->user()->budgets()
            ->with('category')
            ->orderBy('month', 'desc')
            ->get();

        return response()->json($budgets);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'month' => 'required|date',
            'limit_amount' => 'required|numeric|min:0.01',
        ]);

        $budget = $request->user()->budgets()->create($request->all());

        return response()->json($budget->load('category'), 201);
    }

    public function show(Request $request, Budget $budget): JsonResponse
    {
        $this->authorize('view', $budget);
        return response()->json($budget->load('category'));
    }

    public function update(Request $request, Budget $budget): JsonResponse
    {
        $this->authorize('update', $budget);

        $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'month' => 'sometimes|date',
            'limit_amount' => 'sometimes|numeric|min:0.01',
        ]);

        $budget->update($request->all());

        return response()->json($budget->load('category'));
    }

    public function destroy(Request $request, Budget $budget): JsonResponse
    {
        $this->authorize('delete', $budget);

        $budget->delete();

        return response()->json(['message' => 'Budget deleted successfully']);
    }
}
