<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class AccountController extends Controller
{
    public function index(): JsonResponse
    {
        $accounts = Account::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $accounts
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => ['required', Rule::in(['checking', 'savings', 'credit', 'investment', 'cash'])],
            'balance' => 'required|numeric',
            'currency' => 'required|string|max:3',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $account = Account::create([
            ...$validated,
            'user_id' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'data' => $account,
            'message' => 'Account created successfully'
        ], 201);
    }

    public function show(Account $account): JsonResponse
    {
        if ($account->user_id !== auth()->id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $account
        ]);
    }

    public function update(Request $request, Account $account): JsonResponse
    {
        if ($account->user_id !== auth()->id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => ['sometimes', Rule::in(['checking', 'savings', 'credit', 'investment', 'cash'])],
            'balance' => 'sometimes|numeric',
            'currency' => 'sometimes|string|max:3',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean'
        ]);

        $account->update($validated);

        return response()->json([
            'success' => true,
            'data' => $account,
            'message' => 'Account updated successfully'
        ]);
    }

    public function destroy(Account $account): JsonResponse
    {
        if ($account->user_id !== auth()->id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $account->delete();

        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully'
        ]);
    }
}
