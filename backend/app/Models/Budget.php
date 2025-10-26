<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Budget extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'category_id',
        'month',
        'limit_amount',
        'spent_amount',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'month' => 'date',
            'limit_amount' => 'decimal:2',
            'spent_amount' => 'decimal:2',
        ];
    }

    /**
     * Get the user that owns the budget.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category that owns the budget.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the remaining budget amount.
     */
    public function getRemainingAmountAttribute(): float
    {
        return $this->limit_amount - $this->spent_amount;
    }

    /**
     * Get the budget utilization percentage.
     */
    public function getUtilizationPercentageAttribute(): float
    {
        if ($this->limit_amount == 0) {
            return 0;
        }

        return ($this->spent_amount / $this->limit_amount) * 100;
    }

    /**
     * Check if budget is exceeded.
     */
    public function isExceeded(): bool
    {
        return $this->spent_amount > $this->limit_amount;
    }

    /**
     * Scope a query to only include budgets for a specific month.
     */
    public function scopeForMonth($query, $month)
    {
        return $query->where('month', $month);
    }
}
