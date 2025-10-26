<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Goal extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'target_amount',
        'saved_amount',
        'target_date',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'target_amount' => 'decimal:2',
            'saved_amount' => 'decimal:2',
            'target_date' => 'date',
        ];
    }

    /**
     * Get the user that owns the goal.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the remaining amount needed to reach the goal.
     */
    public function getRemainingAmountAttribute(): float
    {
        return $this->target_amount - $this->saved_amount;
    }

    /**
     * Get the progress percentage.
     */
    public function getProgressPercentageAttribute(): float
    {
        if ($this->target_amount == 0) {
            return 0;
        }

        return ($this->saved_amount / $this->target_amount) * 100;
    }

    /**
     * Check if goal is completed.
     */
    public function isCompleted(): bool
    {
        return $this->saved_amount >= $this->target_amount;
    }

    /**
     * Check if goal is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->target_date < now() && !$this->isCompleted();
    }

    /**
     * Scope a query to only include active goals.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include completed goals.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}
