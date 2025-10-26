<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\AiConversation;
use App\Models\Transaction;

class LangGraphService
{
    private $openaiApiKey;
    private $baseUrl = 'https://api.openai.com/v1/chat/completions';

    public function __construct()
    {
        $this->openaiApiKey = config('services.openai.api_key');
    }

    /**
     * Financial Advisor Workflow with State Management
     */
    public function financialAdvisorWorkflow($question, $userId, $context = [])
    {
        try {
            $state = [
                'question' => $question,
                'user_id' => $userId,
                'context' => $context,
                'conversation_history' => $this->getConversationHistory($userId),
                'current_step' => 'analyze_question',
                'workflow_state' => 'active',
                'response_data' => [],
                'reasoning_steps' => []
            ];

        // Step 1: Analyze the question type and intent
        $state = $this->analyzeQuestion($state);
        
        // Step 2: Gather relevant financial data
        $state = $this->gatherFinancialData($state);
        
        // Step 3: Generate personalized advice
        $state = $this->generateAdvice($state);
        
        // Step 4: Format and validate response
        $state = $this->formatResponse($state);
        
        // Step 5: Save conversation and return result
        return $this->saveConversation($state);
        
        } catch (\Exception $e) {
            Log::error('LangGraph Financial Advisor Workflow Error', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
                'question' => $question
            ]);
            
            return [
                'answer' => 'I apologize, but I encountered an issue processing your request. Please try again in a moment.',
                'workflow_state' => 'error',
                'reasoning_steps' => ['Workflow failed: ' . $e->getMessage()],
                'question_type' => 'error'
            ];
        }
    }

    /**
     * Spending Analysis Workflow with Multi-step Reasoning
     */
    public function spendingAnalysisWorkflow($expenses, $userId)
    {
        $state = [
            'expenses' => $expenses,
            'user_id' => $userId,
            'current_step' => 'categorize_expenses',
            'workflow_state' => 'active',
            'analysis_data' => [],
            'insights' => [],
            'recommendations' => []
        ];

        // Step 1: Categorize and analyze expenses
        $state = $this->categorizeExpenses($state);
        
        // Step 2: Identify spending patterns
        $state = $this->identifyPatterns($state);
        
        // Step 3: Generate insights
        $state = $this->generateInsights($state);
        
        // Step 4: Create recommendations
        $state = $this->createRecommendations($state);
        
        // Step 5: Format final analysis
        return $this->formatAnalysis($state);
    }

    /**
     * Auto-categorization Workflow
     */
    public function autoCategorizationWorkflow($description, $userId)
    {
        $state = [
            'description' => $description,
            'user_id' => $userId,
            'current_step' => 'analyze_description',
            'workflow_state' => 'active',
            'keywords' => [],
            'category_suggestions' => [],
            'confidence_score' => 0
        ];

        // Step 1: Extract keywords and context
        $state = $this->extractKeywords($state);
        
        // Step 2: Match against known patterns
        $state = $this->matchPatterns($state);
        
        // Step 3: Generate category suggestions
        $state = $this->generateCategorySuggestions($state);
        
        // Step 4: Calculate confidence score
        $state = $this->calculateConfidence($state);
        
        return $this->formatCategorization($state);
    }

    /**
     * Step 1: Analyze Question Type and Intent
     */
    private function analyzeQuestion($state)
    {
        $state['reasoning_steps'][] = 'Analyzing question type and intent...';
        
        $question = $state['question'];
        $lowerQuestion = strtolower($question);
        
        // Determine question type
        $questionTypes = [
            'budget' => ['budget', 'budgeting', 'spending plan'],
            'saving' => ['save', 'saving', 'emergency fund'],
            'investment' => ['invest', 'investment', 'stocks', 'bonds'],
            'debt' => ['debt', 'loan', 'credit card'],
            'expense' => ['expense', 'cost', 'spending'],
            'income' => ['income', 'salary', 'earnings']
        ];
        
        $detectedType = 'general';
        foreach ($questionTypes as $type => $keywords) {
            foreach ($keywords as $keyword) {
                if (strpos($lowerQuestion, $keyword) !== false) {
                    $detectedType = $type;
                    break 2;
                }
            }
        }
        
        $state['question_type'] = $detectedType;
        $state['current_step'] = 'gather_data';
        $state['reasoning_steps'][] = "Detected question type: {$detectedType}";
        
        return $state;
    }

    /**
     * Step 2: Gather Relevant Financial Data
     */
    private function gatherFinancialData($state)
    {
        $state['reasoning_steps'][] = 'Gathering relevant financial data...';
        
        $userId = $state['user_id'];
        
        // Get recent transactions
        $recentTransactions = Transaction::where('user_id', $userId)
            ->where('created_at', '>=', now()->subDays(30))
            ->get();
        
        // Calculate financial metrics
        $totalIncome = $recentTransactions->where('type', 'income')->sum('amount');
        $totalExpenses = $recentTransactions->where('type', 'expense')->sum('amount');
        $netBalance = $totalIncome - $totalExpenses;
        
        $state['financial_data'] = [
            'total_income' => $totalIncome,
            'total_expenses' => $totalExpenses,
            'net_balance' => $netBalance,
            'transaction_count' => $recentTransactions->count(),
            'recent_transactions' => $recentTransactions->take(5)->toArray()
        ];
        
        $state['current_step'] = 'generate_advice';
        $state['reasoning_steps'][] = "Gathered financial data: Income: \${$totalIncome}, Expenses: \${$totalExpenses}, Net: \${$netBalance}";
        
        return $state;
    }

    /**
     * Step 3: Generate Personalized Advice
     */
    private function generateAdvice($state)
    {
        $state['reasoning_steps'][] = 'Generating personalized advice...';
        
        $prompt = $this->buildWorkflowPrompt($state);
        
        try {
            $response = Http::timeout(15)->retry(2, 1000)->withHeaders([
                'Authorization' => 'Bearer ' . $this->openaiApiKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl, [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a professional financial advisor with access to the user\'s financial data. Provide personalized, actionable advice based on their specific situation. Be encouraging, practical, and specific.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 400,
                'temperature' => 0.7,
                'top_p' => 0.8,
                'frequency_penalty' => 0.1,
                'presence_penalty' => 0.1,
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                $state['ai_response'] = $data['choices'][0]['message']['content'] ?? 'I apologize, but I encountered an issue generating a response.';
                $state['reasoning_steps'][] = 'Successfully generated AI response';
            } else {
                $state['ai_response'] = 'I apologize, but I\'m having trouble accessing my financial analysis tools right now. Please try again in a moment.';
                $state['reasoning_steps'][] = 'AI request failed, using fallback response';
            }
        } catch (\Exception $e) {
            Log::error('LangGraph AI request failed', ['error' => $e->getMessage()]);
            $state['ai_response'] = 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.';
            $state['reasoning_steps'][] = 'AI request exception, using fallback response';
        }
        
        $state['current_step'] = 'format_response';
        return $state;
    }

    /**
     * Step 4: Format and Validate Response
     */
    private function formatResponse($state)
    {
        $state['reasoning_steps'][] = 'Formatting and validating response...';
        
        $response = $state['ai_response'];
        
        // Ensure response is not too long
        if (strlen($response) > 1000) {
            $response = substr($response, 0, 997) . '...';
        }
        
        $state['formatted_response'] = $response;
        $state['current_step'] = 'save_conversation';
        $state['reasoning_steps'][] = 'Response formatted and validated';
        
        return $state;
    }

    /**
     * Step 5: Save Conversation and Return Result
     */
    private function saveConversation($state)
    {
        $state['reasoning_steps'][] = 'Saving conversation...';
        
        try {
            AiConversation::create([
                'user_id' => $state['user_id'],
                'question' => $state['question'],
                'answer' => $state['formatted_response'],
                'type' => 'advice',
                'metadata' => [
                    'workflow_state' => $state,
                    'question_type' => $state['question_type'] ?? 'general',
                    'reasoning_steps' => $state['reasoning_steps']
                ]
            ]);
            
            $state['reasoning_steps'][] = 'Conversation saved successfully';
        } catch (\Exception $e) {
            Log::error('Failed to save conversation', ['error' => $e->getMessage()]);
            $state['reasoning_steps'][] = 'Failed to save conversation';
        }
        
        $state['workflow_state'] = 'completed';
        
        return [
            'answer' => $state['formatted_response'],
            'workflow_state' => $state['workflow_state'],
            'reasoning_steps' => $state['reasoning_steps'],
            'question_type' => $state['question_type'] ?? 'general'
        ];
    }

    /**
     * Build comprehensive prompt for workflow
     */
    private function buildWorkflowPrompt($state)
    {
        $financialData = $state['financial_data'];
        $question = $state['question'];
        $questionType = $state['question_type'];
        
        $prompt = "User Question: {$question}\n\n";
        $prompt .= "Question Type: {$questionType}\n\n";
        $prompt .= "User's Financial Context:\n";
        $prompt .= "- Total Income (last 30 days): \${$financialData['total_income']}\n";
        $prompt .= "- Total Expenses (last 30 days): \${$financialData['total_expenses']}\n";
        $prompt .= "- Net Balance: \${$financialData['net_balance']}\n";
        $prompt .= "- Transaction Count: {$financialData['transaction_count']}\n\n";
        
        if (!empty($financialData['recent_transactions'])) {
            $prompt .= "Recent Transactions:\n";
            foreach ($financialData['recent_transactions'] as $transaction) {
                $category = $transaction['category'] ?? 'Uncategorized';
                $prompt .= "- {$transaction['type']}: \${$transaction['amount']} ({$category})\n";
            }
            $prompt .= "\n";
        }
        
        $prompt .= "Please provide personalized, actionable advice based on this financial context. ";
        $prompt .= "Be specific, encouraging, and practical. Focus on actionable steps the user can take.";
        
        return $prompt;
    }

    /**
     * Get conversation history for context
     */
    private function getConversationHistory($userId)
    {
        return AiConversation::where('user_id', $userId)
            ->where('created_at', '>=', now()->subHours(1))
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get(['question', 'answer', 'created_at'])
            ->toArray();
    }

    /**
     * Categorize expenses in spending analysis workflow
     */
    private function categorizeExpenses($state)
    {
        $state['reasoning_steps'][] = 'Categorizing expenses...';
        
        $expenses = $state['expenses'];
        $categories = [];
        
        foreach ($expenses as $expense) {
            $category = $this->determineCategory($expense['description'] ?? '');
            $categories[$category][] = $expense;
        }
        
        $state['categorized_expenses'] = $categories;
        $state['current_step'] = 'identify_patterns';
        $state['reasoning_steps'][] = 'Expenses categorized successfully';
        
        return $state;
    }

    /**
     * Identify spending patterns
     */
    private function identifyPatterns($state)
    {
        $state['reasoning_steps'][] = 'Identifying spending patterns...';
        
        $categorized = $state['categorized_expenses'];
        $patterns = [];
        
        foreach ($categorized as $category => $expenses) {
            $total = array_sum(array_column($expenses, 'amount'));
            $count = count($expenses);
            $patterns[$category] = [
                'total_amount' => $total,
                'transaction_count' => $count,
                'average_amount' => $count > 0 ? $total / $count : 0
            ];
        }
        
        $state['spending_patterns'] = $patterns;
        $state['current_step'] = 'generate_insights';
        $state['reasoning_steps'][] = 'Spending patterns identified';
        
        return $state;
    }

    /**
     * Generate insights from patterns
     */
    private function generateInsights($state)
    {
        $state['reasoning_steps'][] = 'Generating insights...';
        
        $patterns = $state['spending_patterns'];
        $insights = [];
        
        // Find top spending category
        $topCategory = array_keys($patterns, max($patterns))[0] ?? 'Unknown';
        $insights['top_category'] = $topCategory;
        
        // Calculate total spending
        $totalSpending = array_sum(array_column($patterns, 'total_amount'));
        $insights['total_spending'] = $totalSpending;
        
        // Find potential saving opportunities
        $savingOpportunities = [];
        foreach ($patterns as $category => $data) {
            if ($data['total_amount'] > $totalSpending * 0.2) { // More than 20% of spending
                $savingOpportunities[] = $category;
            }
        }
        $insights['saving_opportunities'] = $savingOpportunities;
        
        $state['insights'] = $insights;
        $state['current_step'] = 'create_recommendations';
        $state['reasoning_steps'][] = 'Insights generated successfully';
        
        return $state;
    }

    /**
     * Create recommendations
     */
    private function createRecommendations($state)
    {
        $state['reasoning_steps'][] = 'Creating recommendations...';
        
        $insights = $state['insights'];
        $recommendations = [];
        
        if (!empty($insights['saving_opportunities'])) {
            $recommendations[] = "Consider reducing spending in: " . implode(', ', $insights['saving_opportunities']);
        }
        
        if ($insights['total_spending'] > 0) {
            $recommendations[] = "Your total spending is \${$insights['total_spending']}. Consider setting a monthly budget.";
        }
        
        $state['recommendations'] = $recommendations;
        $state['current_step'] = 'format_analysis';
        $state['reasoning_steps'][] = 'Recommendations created';
        
        return $state;
    }

    /**
     * Format final analysis
     */
    private function formatAnalysis($state)
    {
        $state['reasoning_steps'][] = 'Formatting final analysis...';
        
        $analysis = [
            'top_categories' => array_slice($state['spending_patterns'], 0, 3, true),
            'saving_suggestions' => $state['insights']['saving_opportunities'],
            'forecasted_spending' => $state['insights']['total_spending'] * 1.1, // 10% increase forecast
            'recommendations' => $state['recommendations'],
            'workflow_state' => 'completed',
            'reasoning_steps' => $state['reasoning_steps']
        ];
        
        return $analysis;
    }

    /**
     * Extract keywords from description
     */
    private function extractKeywords($state)
    {
        $description = $state['description'];
        $keywords = [];
        
        // Simple keyword extraction
        $words = explode(' ', strtolower($description));
        $keywords = array_filter($words, function($word) {
            return strlen($word) > 3; // Only words longer than 3 characters
        });
        
        $state['keywords'] = array_unique($keywords);
        $state['current_step'] = 'match_patterns';
        $state['reasoning_steps'][] = 'Keywords extracted: ' . implode(', ', $state['keywords']);
        
        return $state;
    }

    /**
     * Match against known patterns
     */
    private function matchPatterns($state)
    {
        $keywords = $state['keywords'];
        $categoryPatterns = [
            'Food & Dining' => ['restaurant', 'food', 'dining', 'cafe', 'coffee', 'lunch', 'dinner'],
            'Transportation' => ['gas', 'fuel', 'uber', 'taxi', 'bus', 'train', 'parking'],
            'Shopping' => ['store', 'shop', 'mall', 'amazon', 'online', 'purchase'],
            'Entertainment' => ['movie', 'cinema', 'game', 'entertainment', 'fun'],
            'Health & Fitness' => ['gym', 'fitness', 'doctor', 'medical', 'pharmacy', 'health'],
            'Bills & Utilities' => ['electric', 'water', 'internet', 'phone', 'utility', 'bill']
        ];
        
        $matches = [];
        foreach ($categoryPatterns as $category => $patterns) {
            foreach ($patterns as $pattern) {
                if (in_array($pattern, $keywords)) {
                    $matches[$category] = ($matches[$category] ?? 0) + 1;
                }
            }
        }
        
        $state['pattern_matches'] = $matches;
        $state['current_step'] = 'generate_suggestions';
        $state['reasoning_steps'][] = 'Pattern matching completed';
        
        return $state;
    }

    /**
     * Generate category suggestions
     */
    private function generateCategorySuggestions($state)
    {
        $matches = $state['pattern_matches'];
        $suggestions = [];
        
        if (!empty($matches)) {
            arsort($matches);
            $suggestions = array_keys(array_slice($matches, 0, 3, true));
        } else {
            $suggestions = ['Other', 'Miscellaneous', 'Personal'];
        }
        
        $state['category_suggestions'] = $suggestions;
        $state['current_step'] = 'calculate_confidence';
        $state['reasoning_steps'][] = 'Category suggestions generated';
        
        return $state;
    }

    /**
     * Calculate confidence score
     */
    private function calculateConfidence($state)
    {
        $matches = $state['pattern_matches'];
        $maxMatches = !empty($matches) ? max($matches) : 0;
        $totalKeywords = count($state['keywords']);
        
        $confidence = $totalKeywords > 0 ? ($maxMatches / $totalKeywords) * 100 : 0;
        $state['confidence_score'] = min($confidence, 100);
        
        $state['current_step'] = 'format_categorization';
        $state['reasoning_steps'][] = "Confidence score calculated: {$state['confidence_score']}%";
        
        return $state;
    }

    /**
     * Format categorization result
     */
    private function formatCategorization($state)
    {
        return [
            'suggested_category' => $state['category_suggestions'][0] ?? 'Other',
            'alternative_categories' => array_slice($state['category_suggestions'], 1),
            'confidence_score' => $state['confidence_score'],
            'keywords_found' => $state['keywords'],
            'workflow_state' => 'completed',
            'reasoning_steps' => $state['reasoning_steps']
        ];
    }

    /**
     * Determine category for expense description
     */
    private function determineCategory($description)
    {
        $description = strtolower($description);
        
        $categoryMap = [
            'Food & Dining' => ['restaurant', 'food', 'dining', 'cafe', 'coffee', 'lunch', 'dinner', 'grocery'],
            'Transportation' => ['gas', 'fuel', 'uber', 'taxi', 'bus', 'train', 'parking', 'car'],
            'Shopping' => ['store', 'shop', 'mall', 'amazon', 'online', 'purchase', 'retail'],
            'Entertainment' => ['movie', 'cinema', 'game', 'entertainment', 'fun', 'netflix', 'spotify'],
            'Health & Fitness' => ['gym', 'fitness', 'doctor', 'medical', 'pharmacy', 'health', 'hospital'],
            'Bills & Utilities' => ['electric', 'water', 'internet', 'phone', 'utility', 'bill', 'rent']
        ];
        
        foreach ($categoryMap as $category => $keywords) {
            foreach ($keywords as $keyword) {
                if (strpos($description, $keyword) !== false) {
                    return $category;
                }
            }
        }
        
        return 'Other';
    }
}
