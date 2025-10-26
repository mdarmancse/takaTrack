<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Goal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $goals = $request->user()->goals()
            ->orderBy('target_date')
            ->get();

        return response()->json($goals);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0.01',
            'target_date' => 'required|date|after:today',
        ]);

        $goal = $request->user()->goals()->create($request->all());

        return response()->json($goal, 201);
    }

    public function show(Request $request, Goal $goal): JsonResponse
    {
        $this->authorize('view', $goal);
        return response()->json($goal);
    }

    public function update(Request $request, Goal $goal): JsonResponse
    {
        $this->authorize('update', $goal);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'target_amount' => 'sometimes|numeric|min:0.01',
            'saved_amount' => 'sometimes|numeric|min:0',
            'target_date' => 'sometimes|date',
            'status' => 'sometimes|in:active,completed,paused',
        ]);

        $goal->update($request->all());

        return response()->json($goal);
    }

    public function destroy(Request $request, Goal $goal): JsonResponse
    {
        $this->authorize('delete', $goal);

        $goal->delete();

        return response()->json(['message' => 'Goal deleted successfully']);
    }
}
