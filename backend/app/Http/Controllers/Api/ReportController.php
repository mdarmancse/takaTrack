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

        // Use database aggregation for better performance
        $year = substr($month, 0, 4);
        $monthNum = substr($month, 5, 2);

        $income = $user->transactions()
            ->whereYear('date', $year)
            ->whereMonth('date', $monthNum)
            ->where('type', 'income')
            ->sum('amount');

        $expenses = $user->transactions()
            ->whereYear('date', $year)
            ->whereMonth('date', $monthNum)
            ->where('type', 'expense')
            ->sum('amount');

        $net = $income - $expenses;

        // Get transactions with category for breakdown
        $transactions = $user->transactions()
            ->whereYear('date', $year)
            ->whereMonth('date', $monthNum)
            ->with('category')
            ->orderBy('date', 'desc')
            ->get();

        $categoryBreakdown = $transactions->groupBy('category_id')
            ->map(function ($categoryTransactions) {
                $category = $categoryTransactions->first()->category;
                return [
                    'category' => $category ? $category->name : 'Uncategorized',
                    'income' => $categoryTransactions->where('type', 'income')->sum('amount'),
                    'expenses' => $categoryTransactions->where('type', 'expense')->sum('amount'),
                ];
            });

        return response()->json([
            'month' => $month,
            'summary' => [
                'income' => $income ?? 0,
                'expenses' => $expenses ?? 0,
                'net' => $net ?? 0,
            ],
            'category_breakdown' => $categoryBreakdown,
            'transactions' => $transactions,
        ]);
    }

    public function export(Request $request)
    {
        $format = $request->get('format', 'csv');
        $fromDate = $request->get('from_date', now()->startOfMonth()->format('Y-m-d'));
        $toDate = $request->get('to_date', now()->endOfMonth()->format('Y-m-d'));

        $transactions = $request->user()->transactions()
            ->whereBetween('date', [$fromDate, $toDate])
            ->with('category')
            ->orderBy('date', 'desc')
            ->get();

        if ($format === 'csv') {
            $filename = 'takatrack-report-' . $fromDate . '-to-' . $toDate . '.csv';
            
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ];

            $callback = function() use ($transactions) {
                $file = fopen('php://output', 'w');
                
                // CSV Headers
                fputcsv($file, [
                    'Date',
                    'Type',
                    'Category',
                    'Amount',
                    'Currency',
                    'Description',
                    'Account',
                    'Created At'
                ]);

                // CSV Data
                foreach ($transactions as $transaction) {
                    fputcsv($file, [
                        $transaction->date,
                        $transaction->type,
                        $transaction->category?->name ?? 'Uncategorized',
                        $transaction->amount,
                        $transaction->currency ?? 'USD',
                        $transaction->note ?? '',
                        $transaction->account_id ?? '',
                        $transaction->created_at,
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        // JSON export (fallback)
        return response()->json([
            'format' => $format,
            'from_date' => $fromDate,
            'to_date' => $toDate,
            'transactions' => $transactions,
        ]);
    }
}
