<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // System categories (available to all users)
        $systemCategories = [
            ['name' => 'Salary', 'type' => 'income', 'color' => '#10B981', 'icon' => 'briefcase'],
            ['name' => 'Freelance', 'type' => 'income', 'color' => '#3B82F6', 'icon' => 'laptop'],
            ['name' => 'Investment', 'type' => 'income', 'color' => '#8B5CF6', 'icon' => 'trending-up'],
            ['name' => 'Other Income', 'type' => 'income', 'color' => '#06B6D4', 'icon' => 'plus'],
            
            ['name' => 'Food & Dining', 'type' => 'expense', 'color' => '#F59E0B', 'icon' => 'utensils'],
            ['name' => 'Transportation', 'type' => 'expense', 'color' => '#EF4444', 'icon' => 'car'],
            ['name' => 'Shopping', 'type' => 'expense', 'color' => '#EC4899', 'icon' => 'shopping-bag'],
            ['name' => 'Entertainment', 'type' => 'expense', 'color' => '#8B5CF6', 'icon' => 'film'],
            ['name' => 'Bills & Utilities', 'type' => 'expense', 'color' => '#6B7280', 'icon' => 'receipt'],
            ['name' => 'Healthcare', 'type' => 'expense', 'color' => '#10B981', 'icon' => 'heart'],
            ['name' => 'Education', 'type' => 'expense', 'color' => '#3B82F6', 'icon' => 'book'],
            ['name' => 'Other Expense', 'type' => 'expense', 'color' => '#6B7280', 'icon' => 'minus'],
        ];

        foreach ($systemCategories as $category) {
            Category::create($category);
        }

        // User-specific categories for demo user
        $demoUser = User::where('email', 'demo@takatrack.com')->first();
        
        if ($demoUser) {
            $userCategories = [
                ['name' => 'Side Hustle', 'type' => 'income', 'color' => '#F59E0B', 'icon' => 'zap'],
                ['name' => 'Gym Membership', 'type' => 'expense', 'color' => '#EF4444', 'icon' => 'dumbbell'],
            ];

            foreach ($userCategories as $category) {
                Category::create([
                    ...$category,
                    'user_id' => $demoUser->id,
                ]);
            }
        }
    }
}
