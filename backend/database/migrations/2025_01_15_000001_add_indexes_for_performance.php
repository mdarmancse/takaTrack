<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        try {
            Schema::table('transactions', function (Blueprint $table) {
                // Add indexes for common queries (only if they don't exist)
                try {
                    $table->index(['user_id', 'date'], 'transactions_user_id_date_index');
                } catch (\Exception $e) {
                    // Index already exists, skip
                }
                try {
                    $table->index(['user_id', 'type'], 'transactions_user_id_type_index');
                } catch (\Exception $e) {
                    // Index already exists, skip
                }
                try {
                    $table->index(['user_id', 'category_id'], 'transactions_user_id_category_id_index');
                } catch (\Exception $e) {
                    // Index already exists, skip
                }
                try {
                    $table->index('date', 'transactions_date_index');
                } catch (\Exception $e) {
                    // Index already exists, skip
                }
            });
        } catch (\Exception $e) {
            // Some indexes may already exist, continue
        }

        try {
            Schema::table('categories', function (Blueprint $table) {
                try {
                    $table->index('user_id', 'categories_user_id_index');
                } catch (\Exception $e) {
                    // Index already exists, skip
                }
            });
        } catch (\Exception $e) {
            // Index may already exist
        }

        try {
            Schema::table('budgets', function (Blueprint $table) {
                try {
                    $table->index(['user_id', 'month'], 'budgets_user_id_month_index');
                } catch (\Exception $e) {
                    // Index already exists, skip
                }
            });
        } catch (\Exception $e) {
            // Index may already exist
        }

        try {
            Schema::table('goals', function (Blueprint $table) {
                try {
                    $table->index(['user_id', 'status'], 'goals_user_id_status_index');
                } catch (\Exception $e) {
                    // Index already exists, skip
                }
            });
        } catch (\Exception $e) {
            // Index may already exist
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            Schema::table('transactions', function (Blueprint $table) {
                try {
                    $table->dropIndex('transactions_user_id_date_index');
                } catch (\Exception $e) {}
                try {
                    $table->dropIndex('transactions_user_id_type_index');
                } catch (\Exception $e) {}
                try {
                    $table->dropIndex('transactions_user_id_category_id_index');
                } catch (\Exception $e) {}
                try {
                    $table->dropIndex('transactions_date_index');
                } catch (\Exception $e) {}
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('categories', function (Blueprint $table) {
                try {
                    $table->dropIndex('categories_user_id_index');
                } catch (\Exception $e) {}
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('budgets', function (Blueprint $table) {
                try {
                    $table->dropIndex('budgets_user_id_month_index');
                } catch (\Exception $e) {}
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('goals', function (Blueprint $table) {
                try {
                    $table->dropIndex('goals_user_id_status_index');
                } catch (\Exception $e) {}
            });
        } catch (\Exception $e) {}
    }
};

