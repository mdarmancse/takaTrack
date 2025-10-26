<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->transactions()->with('category');

        // Apply filters
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('from_date')) {
            $query->where('date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where('date', '<=', $request->to_date);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate results
        $perPage = $request->get('per_page', 15);
        $transactions = $query->paginate($perPage);

        return response()->json($transactions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $transaction = $request->user()->transactions()->create($request->validated());

        return response()->json($transaction->load('category'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Transaction $transaction): JsonResponse
    {
        $this->authorize('view', $transaction);

        return response()->json($transaction->load('category'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTransactionRequest $request, Transaction $transaction): JsonResponse
    {
        $this->authorize('update', $transaction);

        $transaction->update($request->validated());

        return response()->json($transaction->load('category'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Transaction $transaction): JsonResponse
    {
        $this->authorize('delete', $transaction);

        $transaction->delete();

        return response()->json([
            'message' => 'Transaction deleted successfully',
        ]);
    }

    /**
     * Get transaction summary.
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        $fromDate = $request->get('from_date', now()->startOfMonth());
        $toDate = $request->get('to_date', now()->endOfMonth());

        $transactions = $user->transactions()
            ->whereBetween('date', [$fromDate, $toDate])
            ->get();

        $income = $transactions->where('type', 'income')->sum('amount');
        $expenses = $transactions->where('type', 'expense')->sum('amount');
        $net = $income - $expenses;

        $categoryBreakdown = $transactions->groupBy('category_id')
            ->map(function ($categoryTransactions) {
                return [
                    'category' => $categoryTransactions->first()->category->name,
                    'income' => $categoryTransactions->where('type', 'income')->sum('amount'),
                    'expenses' => $categoryTransactions->where('type', 'expense')->sum('amount'),
                    'net' => $categoryTransactions->where('type', 'income')->sum('amount') - 
                             $categoryTransactions->where('type', 'expense')->sum('amount'),
                ];
            });

        return response()->json([
            'summary' => [
                'income' => $income,
                'expenses' => $expenses,
                'net' => $net,
            ],
            'category_breakdown' => $categoryBreakdown,
        ]);
    }
}
