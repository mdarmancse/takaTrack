<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $demoUser = User::where('email', 'demo@takatrack.com')->first();
        
        if (!$demoUser) {
            return;
        }

        $categories = Category::all();
        $incomeCategories = $categories->where('type', 'income');
        $expenseCategories = $categories->where('type', 'expense');

        // Generate sample transactions for the last 3 months
        $startDate = now()->subMonths(3)->startOfMonth();
        $endDate = now()->endOfMonth();

        // Income transactions
        $incomeTransactions = [
            ['amount' => 3500.00, 'category' => 'Salary', 'note' => 'Monthly salary'],
            ['amount' => 800.00, 'category' => 'Freelance', 'note' => 'Web development project'],
            ['amount' => 150.00, 'category' => 'Investment', 'note' => 'Dividend payment'],
            ['amount' => 200.00, 'category' => 'Side Hustle', 'note' => 'Consulting work'],
        ];

        // Expense transactions
        $expenseTransactions = [
            ['amount' => 120.00, 'category' => 'Food & Dining', 'note' => 'Grocery shopping'],
            ['amount' => 45.00, 'category' => 'Food & Dining', 'note' => 'Restaurant dinner'],
            ['amount' => 80.00, 'category' => 'Transportation', 'note' => 'Gas and parking'],
            ['amount' => 200.00, 'category' => 'Shopping', 'note' => 'Clothing purchase'],
            ['amount' => 30.00, 'category' => 'Entertainment', 'note' => 'Movie tickets'],
            ['amount' => 150.00, 'category' => 'Bills & Utilities', 'note' => 'Electricity bill'],
            ['amount' => 60.00, 'category' => 'Healthcare', 'note' => 'Doctor visit'],
            ['amount' => 50.00, 'category' => 'Gym Membership', 'note' => 'Monthly membership'],
        ];

        // Generate transactions for each month
        for ($month = 0; $month < 3; $month++) {
            $currentMonth = $startDate->copy()->addMonths($month);
            
            // Add income transactions (1-2 per month)
            $monthlyIncome = array_slice($incomeTransactions, 0, rand(1, 2));
            foreach ($monthlyIncome as $transaction) {
                $category = $incomeCategories->where('name', $transaction['category'])->first();
                if ($category) {
                    Transaction::create([
                        'user_id' => $demoUser->id,
                        'type' => 'income',
                        'category_id' => $category->id,
                        'amount' => $transaction['amount'],
                        'currency' => 'USD',
                        'date' => $currentMonth->copy()->addDays(rand(1, 28)),
                        'note' => $transaction['note'],
                        'source' => 'manual',
                    ]);
                }
            }

            // Add expense transactions (5-8 per month)
            $monthlyExpenses = array_slice($expenseTransactions, 0, rand(5, 8));
            foreach ($monthlyExpenses as $transaction) {
                $category = $expenseCategories->where('name', $transaction['category'])->first();
                if ($category) {
                    Transaction::create([
                        'user_id' => $demoUser->id,
                        'type' => 'expense',
                        'category_id' => $category->id,
                        'amount' => $transaction['amount'],
                        'currency' => 'USD',
                        'date' => $currentMonth->copy()->addDays(rand(1, 28)),
                        'note' => $transaction['note'],
                        'source' => 'manual',
                    ]);
                }
            }
        }
    }
}
