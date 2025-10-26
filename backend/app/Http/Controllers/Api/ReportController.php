<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function monthly(Request $request): JsonResponse
    {
        $month = $request->get('month', now()->format('Y-m'));
        $user = $request->user();

        $transactions = $user->transactions()
            ->whereYear('date', substr($month, 0, 4))
            ->whereMonth('date', substr($month, 5, 2))
            ->with('category')
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
                ];
            });

        return response()->json([
            'month' => $month,
            'summary' => [
                'income' => $income,
                'expenses' => $expenses,
                'net' => $net,
            ],
            'category_breakdown' => $categoryBreakdown,
            'transactions' => $transactions,
        ]);
    }

    public function export(Request $request): JsonResponse
    {
        $format = $request->get('format', 'csv');
        $fromDate = $request->get('from_date', now()->startOfMonth());
        $toDate = $request->get('to_date', now()->endOfMonth());

        $transactions = $request->user()->transactions()
            ->whereBetween('date', [$fromDate, $toDate])
            ->with('category')
            ->get();

        // For now, return JSON. In production, generate actual CSV/PDF
        return response()->json([
            'format' => $format,
            'from_date' => $fromDate,
            'to_date' => $toDate,
            'transactions' => $transactions,
            'download_url' => null, // Would be generated in production
        ]);
    }
}
