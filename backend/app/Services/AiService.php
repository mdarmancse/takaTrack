<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiService
{
    private string $apiKey;
    private string $baseUrl = 'https://api.openai.com/v1';

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key');
    }

    public function generateInsights(array $summary): string
    {
        if (!config('app.ai_enabled', true)) {
            return $this->getMockInsights($summary);
        }

        if (empty($this->apiKey)) {
            Log::warning('OpenAI API key not configured, returning mock insights');
            return $this->getMockInsights($summary);
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/chat/completions', [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a personal finance advisor. Provide helpful, actionable insights based on the user\'s financial data. Keep responses concise and practical.',
                    ],
                    [
                        'role' => 'user',
                        'content' => $this->buildPrompt($summary),
                    ],
                ],
                'max_tokens' => 500,
                'temperature' => 0.7,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['choices'][0]['message']['content'] ?? 'Unable to generate insights at this time.';
            }

            Log::error('OpenAI API error: ' . $response->body());
            return $this->getMockInsights($summary);

        } catch (\Exception $e) {
            Log::error('AI Service error: ' . $e->getMessage());
            return $this->getMockInsights($summary);
        }
    }

    private function buildPrompt(array $summary): string
    {
        $prompt = "Based on the following financial summary, provide 3-5 actionable insights:\n\n";
        
        $prompt .= "Category Totals:\n";
        foreach ($summary['totals_by_category'] as $category => $data) {
            $prompt .= "- {$category}: Income: ${$data['income']}, Expenses: ${$data['expenses']}\n";
        }

        $prompt .= "\nLast 3 Months Average:\n";
        foreach ($summary['last_3_months_avg'] as $category => $avg) {
            $prompt .= "- {$category}: ${$avg}\n";
        }

        if (!empty($summary['user_goal'])) {
            $prompt .= "\nUser Goal: {$summary['user_goal']}\n";
        }

        return $prompt;
    }

    private function getMockInsights(array $summary): string
    {
        $insights = [
            "Consider setting up automatic transfers to your savings account to build your emergency fund.",
            "Your spending on dining out seems high this month. Try meal planning to reduce costs.",
            "Great job on your income this month! Consider investing some of the surplus.",
            "Track your daily expenses for a week to identify any unnecessary spending patterns.",
            "Set up a budget for each category to better control your spending.",
        ];

        return implode("\n\n", array_slice($insights, 0, 3));
    }
}
