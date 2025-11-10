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
        $query = $request->user()->transactions()->with('category', 'account');

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('note', 'like', "%{$search}%")
                  ->orWhere('amount', 'like', "%{$search}%")
                  ->orWhereHas('category', function ($categoryQuery) use ($search) {
                      $categoryQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

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

        if ($request->has('amount_min')) {
            $query->where('amount', '>=', $request->amount_min);
        }

        if ($request->has('amount_max')) {
            $query->where('amount', '<=', $request->amount_max);
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

        // Use database aggregation instead of loading all records
        $income = $user->transactions()
            ->whereBetween('date', [$fromDate, $toDate])
            ->where('type', 'income')
            ->sum('amount');

        $expenses = $user->transactions()
            ->whereBetween('date', [$fromDate, $toDate])
            ->where('type', 'expense')
            ->sum('amount');

        $net = $income - $expenses;

        // Optimize category breakdown with database aggregation
        $categoryBreakdown = $user->transactions()
            ->whereBetween('date', [$fromDate, $toDate])
            ->with('category')
            ->get()
            ->groupBy('category_id')
            ->map(function ($categoryTransactions) {
                $category = $categoryTransactions->first()->category;
                return [
                    'category' => $category ? $category->name : 'Uncategorized',
                    'income' => $categoryTransactions->where('type', 'income')->sum('amount'),
                    'expenses' => $categoryTransactions->where('type', 'expense')->sum('amount'),
                    'net' => $categoryTransactions->where('type', 'income')->sum('amount') - 
                             $categoryTransactions->where('type', 'expense')->sum('amount'),
                ];
            });

        return response()->json([
            'summary' => [
                'income' => $income ?? 0,
                'expenses' => $expenses ?? 0,
                'net' => $net ?? 0,
            ],
            'category_breakdown' => $categoryBreakdown,
        ]);
    }
}
