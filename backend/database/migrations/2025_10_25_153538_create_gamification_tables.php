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
        // User streaks table
        Schema::create('user_streaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('streak_count')->default(0);
            $table->date('last_logged_date')->nullable();
            $table->string('streak_type')->default('expense_logging'); // expense_logging, savings, etc.
            $table->json('badges_earned')->nullable(); // Store earned badges
            $table->timestamps();
        });

        // User goals table
        Schema::create('user_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('goal_name');
            $table->text('description')->nullable();
            $table->decimal('target_amount', 15, 2);
            $table->decimal('current_amount', 15, 2)->default(0);
            $table->date('start_date');
            $table->date('target_date');
            $table->enum('goal_type', ['savings', 'spending_limit', 'investment', 'debt_payoff']);
            $table->enum('status', ['active', 'completed', 'paused', 'cancelled'])->default('active');
            $table->json('milestones')->nullable(); // Store milestone data
            $table->timestamps();
        });

        // User challenges table
        Schema::create('user_challenges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('challenge_name');
            $table->text('description');
            $table->enum('challenge_type', ['daily', 'weekly', 'monthly', 'custom']);
            $table->json('requirements'); // Store challenge requirements
            $table->json('rewards'); // Store reward information
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['active', 'completed', 'failed', 'expired'])->default('active');
            $table->json('progress')->nullable(); // Track progress
            $table->timestamps();
        });

        // User rewards table
        Schema::create('user_rewards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('reward_type'); // daily_spin, challenge_completion, streak_milestone, etc.
            $table->string('reward_name');
            $table->text('description')->nullable();
            $table->integer('coins_earned')->default(0);
            $table->string('badge_name')->nullable();
            $table->json('metadata')->nullable(); // Store additional reward data
            $table->timestamp('claimed_at')->nullable();
            $table->timestamps();
        });

        // User levels table
        Schema::create('user_levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('current_level')->default(1);
            $table->integer('total_coins')->default(0);
            $table->integer('total_badges')->default(0);
            $table->string('current_title')->default('Saver');
            $table->json('achievements')->nullable(); // Store all achievements
            $table->json('level_milestones')->nullable(); // Store level progression data
            $table->timestamps();
        });

        // Daily spin rewards table
        Schema::create('daily_spins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('spin_date');
            $table->string('reward_type'); // coins, badge, bonus, etc.
            $table->string('reward_value');
            $table->integer('coins_earned')->default(0);
            $table->boolean('is_claimed')->default(false);
            $table->timestamps();
        });

        // Badges table
        Schema::create('badges', function (Blueprint $table) {
            $table->id();
            $table->string('badge_name');
            $table->string('badge_icon');
            $table->text('description');
            $table->string('category'); // streak, savings, spending, challenge, etc.
            $table->json('requirements'); // Store badge requirements
            $table->integer('coins_value')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // User badges table (many-to-many relationship)
        Schema::create('user_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('badge_id')->constrained()->onDelete('cascade');
            $table->timestamp('earned_at');
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'badge_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_badges');
        Schema::dropIfExists('badges');
        Schema::dropIfExists('daily_spins');
        Schema::dropIfExists('user_levels');
        Schema::dropIfExists('user_rewards');
        Schema::dropIfExists('user_challenges');
        Schema::dropIfExists('user_goals');
        Schema::dropIfExists('user_streaks');
    }
};