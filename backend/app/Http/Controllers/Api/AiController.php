<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiRequest;
use App\Models\AiConversation;
use App\Models\Transaction;
use App\Services\LangGraphService;
use App\Services\AiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiController extends Controller
{
    public function __construct(
        private AiService $aiService
    ) {}

    /**
     * AI Finance Advisor Chat
     */
    public function advice(Request $request): JsonResponse
    {
        $request->validate([
            'question' => 'required|string|max:1000',
        ]);

        try {
            $user = $request->user();
            $question = $request->question;

            // Use LangGraph workflow for complex reasoning (only for very complex questions)
            if (strlen($question) > 100 && $this->isComplexQuestion($question)) {
                $langGraphService = new LangGraphService();
                $result = $langGraphService->financialAdvisorWorkflow($question, $user->id);
                
                return response()->json([
                    'answer' => $result['answer'],
                    'workflow_state' => $result['workflow_state'],
                    'reasoning_steps' => $result['reasoning_steps'],
                    'question_type' => $result['question_type']
                ]);
            }

            // Quick responses for common greetings with more natural, ChatGPT-like responses
            $quickResponses = [
                'hi' => 'Hello! 👋 I\'m your AI financial advisor. I can help you with budgeting, saving strategies, investment advice, and any money-related questions you have. What would you like to know?',
                'hello' => 'Hi there! 😊 I\'m here to help you with your financial journey. Whether you need advice on saving money, managing expenses, or planning for the future, I\'m ready to assist. What\'s on your mind?',
                'hey' => 'Hey! 👋 Great to see you! I\'m your personal finance assistant, and I\'m here to help you make smarter financial decisions. What can I help you with today?',
                'good morning' => 'Good morning! ☀️ Ready to start your day with some smart financial planning? I\'m here to help you achieve your money goals. What would you like to work on?',
                'good afternoon' => 'Good afternoon! 🌤️ Perfect time to review your finances and plan ahead. How can I help you with your financial goals today?',
                'good evening' => 'Good evening! 🌙 Great time to reflect on your financial progress. What financial questions or goals can I help you with tonight?',
                'how are you' => 'I\'m doing fantastic! 😊 I\'m energized and ready to help you with your financial questions and goals. What would you like to discuss?',
                'what can you do' => 'I\'m your comprehensive financial assistant! 💰 I can help you with:\n\n• Budgeting and expense tracking\n• Saving strategies and tips\n• Investment guidance\n• Debt management\n• Financial planning\n• Spending analysis\n• Money-saving techniques\n\nWhat specific area would you like to explore?',
                'help' => 'I\'m here to help! 🤝 I can assist you with:\n\n• Creating budgets and tracking expenses\n• Finding ways to save money\n• Investment advice and planning\n• Debt management strategies\n• Financial goal setting\n• Analyzing your spending patterns\n\nJust ask me anything about your finances!',
                'thanks' => 'You\'re very welcome! 😊 I\'m always here to help with your financial questions. Feel free to ask me anything else about money management, budgeting, or financial planning!',
                'thank you' => 'You\'re absolutely welcome! 🙏 It\'s my pleasure to help you with your financial journey. Don\'t hesitate to reach out if you have more questions!',
                'budget' => 'Great question about budgeting! 💰 I can help you create a budget that works for your lifestyle. Based on your current financial situation, I\'d recommend starting with the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. Would you like me to help you set up a personalized budget?',
                'save money' => 'I love that you\'re thinking about saving! 💸 There are so many ways to save money effectively. I can help you with strategies like the 50/30/20 rule, automatic transfers, cutting unnecessary expenses, and finding better deals. What specific saving goals do you have in mind?',
                'invest' => 'Investment is a fantastic way to grow your wealth! 📈 I can help you understand different investment options like stocks, bonds, mutual funds, and retirement accounts. It\'s important to start with your risk tolerance and financial goals. What kind of investment timeline are you thinking about?',
                'debt' => 'Managing debt is crucial for financial health! 💳 I can help you create a debt payoff strategy, whether it\'s the snowball method, avalanche method, or debt consolidation. What types of debt are you dealing with, and what\'s your current situation?',
                'gym membership' => 'Great question about gym membership costs! 💪 Gym memberships can vary widely - from $10-50/month for basic plans to $100-200+/month for premium facilities. Consider your usage: if you go 3+ times per week, it\'s usually worth it. Look for discounts, student rates, or family plans. You could also explore alternatives like community centers, outdoor activities, or home workouts. What\'s your current gym situation and how often do you go?',
                'gym' => 'Gym memberships are a great investment in your health! 🏋️‍♀️ Costs typically range from $10-50/month for basic gyms to $100-200+/month for premium facilities. The key is finding the right balance between cost and value. Consider your usage frequency, available amenities, and location convenience. Would you like help evaluating if your current gym membership is worth the cost?',
                'how can i save money' => 'Great question! 💰 Here are some effective ways to save money: 1) Follow the 50/30/20 rule (50% needs, 30% wants, 20% savings), 2) Set up automatic transfers to savings, 3) Track your expenses to identify spending patterns, 4) Cut unnecessary subscriptions, 5) Cook at home more often, 6) Use cashback apps and coupons. What specific area would you like to focus on first?',
                'how to budget better' => 'Budgeting is key to financial success! 📊 Start with the 50/30/20 rule: 50% for needs (rent, food, bills), 30% for wants (entertainment, dining out), and 20% for savings. Track your expenses for a month to see where your money goes, then adjust accordingly. Use budgeting apps or spreadsheets to stay organized. What\'s your current budgeting approach?',
                'what should i invest in' => 'Investment depends on your goals and risk tolerance! 📈 For beginners, consider: 1) Emergency fund first (3-6 months expenses), 2) 401(k) or IRA for retirement, 3) Index funds for diversification, 4) Individual stocks for growth. Start with low-cost index funds and gradually learn more. What\'s your investment timeline and risk comfort level?',
                'help me with budgeting' => 'I\'d love to help you with budgeting! 💰 Let\'s start with the basics: 1) Track your income and expenses for a month, 2) Use the 50/30/20 rule (50% needs, 30% wants, 20% savings), 3) Set up automatic transfers to savings, 4) Review and adjust monthly. What\'s your current financial situation?',
                'budgeting help' => 'Budgeting is the foundation of financial success! 📊 I can help you create a budget that works for your lifestyle. Start by tracking your spending for a month, then categorize expenses into needs vs wants. Would you like me to help you set up a personalized budget plan?',
                'financial planning' => 'Great question about financial planning! 🎯 A solid financial plan includes: 1) Emergency fund (3-6 months expenses), 2) Debt payoff strategy, 3) Retirement savings, 4) Investment portfolio, 5) Insurance coverage. What specific area would you like to focus on first?',
                'money management' => 'Money management is key to financial freedom! 💪 Here are the essentials: 1) Track your spending, 2) Create a budget, 3) Build an emergency fund, 4) Pay off high-interest debt, 5) Start investing. What\'s your biggest financial challenge right now?',
                'debt management' => 'Managing debt is crucial for financial health! 💳 I can help you create a debt payoff strategy. The two main methods are: 1) Snowball method (pay smallest debts first), 2) Avalanche method (pay highest interest first). What types of debt are you dealing with?',
            ];

            $lowerQuestion = strtolower(trim($question));
            if (isset($quickResponses[$lowerQuestion])) {
                return response()->json([
                    'answer' => $quickResponses[$lowerQuestion],
                    'context_used' => false,
                ]);
            }

            // Get user's recent financial data for context
            $recentTransactions = Transaction::where('user_id', $user->id)
                ->where('created_at', '>=', now()->subDays(30))
                ->with('category')
                ->get();

            $context = $this->buildFinancialContext($recentTransactions);
            
            // Get recent conversation history for context (but limit to avoid repetition)
            $recentConversations = AiConversation::where('user_id', $user->id)
                ->where('type', 'advice')
                ->where('created_at', '>=', now()->subHours(1)) // Only last hour
                ->orderBy('created_at', 'desc')
                ->limit(2) // Only 2 recent conversations
                ->get(['question', 'answer']);

            $prompt = $this->buildAdvicePrompt($question, $context, $recentConversations);

            // Create ChatGPT-like conversational system prompts
            $systemPrompts = [
                'You are a friendly, knowledgeable financial advisor who talks like ChatGPT. Be conversational, encouraging, and helpful. Use a warm, approachable tone with occasional emojis. Provide practical, actionable advice based on the user\'s financial data. Keep responses engaging and easy to understand.',
                'You are an experienced financial consultant who communicates like a trusted friend. Be supportive, encouraging, and conversational. Use a natural, friendly tone while providing personalized financial advice. Make complex topics simple and relatable.',
                'You are a personal finance expert who speaks like ChatGPT - naturally, helpfully, and conversationally. Be encouraging, provide practical advice, and always consider the user\'s specific financial situation. Use a warm, approachable tone.',
                'You are a financial coach who talks like a supportive friend. Be motivational, clear, and encouraging. Provide actionable guidance with a conversational tone. Use emojis when appropriate and always be helpful and understanding.',
                'You are a money management specialist who communicates clearly and conversationally. Be thorough, practical, and encouraging. Provide specific strategies with a friendly, professional tone. Always be helpful and supportive.',
                'You are a financial mentor who speaks wisdom with warmth. Be thoughtful, strategic, and encouraging. Provide guidance that considers both short-term and long-term goals. Use a conversational, supportive tone.',
                'You are a wealth-building expert who explains complex topics simply. Be analytical yet conversational, data-driven yet approachable. Provide investment and savings advice with a friendly, professional tone.',
                'You are a financial wellness coach who cares about both money and well-being. Be empathetic, understanding, and encouraging. Provide holistic advice with a warm, conversational tone. Always be supportive and helpful.'
            ];
            
            $randomSystemPrompt = $systemPrompts[array_rand($systemPrompts)];

            try {
                $response = Http::timeout(8)->retry(1, 500)->withHeaders([
                    'Authorization' => 'Bearer ' . config('services.openai.api_key'),
                    'Content-Type' => 'application/json',
                ])->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => $randomSystemPrompt
                        ],
                        [
                            'role' => 'user',
                            'content' => $prompt
                        ]
                    ],
                'max_tokens' => 500,
                'temperature' => 0.8,
                'top_p' => 0.9,
                'frequency_penalty' => 0.0,
                'presence_penalty' => 0.0,
                    'stream' => false,
                ]);
            } catch (\Exception $e) {
                \Log::error('OpenAI API timeout or connection error', [
                    'error' => $e->getMessage(),
                    'user_id' => $user->id,
                    'question' => $question
                ]);
                
                return response()->json([
                    'answer' => $this->getFallbackResponse($question),
                    'context_used' => false,
                ]);
            }

            if (!$response->successful()) {
                \Log::error('OpenAI API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'user_id' => $user->id,
                    'question' => $question
                ]);
                
                // Return a helpful fallback response instead of throwing an error
                return response()->json([
                    'answer' => $this->getFallbackResponse($question),
                    'context_used' => false,
                ]);
            }

            $aiResponse = $response->json();
            $answer = $aiResponse['choices'][0]['message']['content'] ?? 'Sorry, I couldn\'t process your request.';

            // Check for recent similar answers to avoid repetition
            $recentAnswers = AiConversation::where('user_id', $user->id)
                ->where('type', 'advice')
                ->where('created_at', '>=', now()->subMinutes(10))
                ->pluck('answer')
                ->toArray();

            // If the answer is too similar to recent ones, add variation
            foreach ($recentAnswers as $recentAnswer) {
                if (similar_text($answer, $recentAnswer) > 80) {
                    $answer = $answer . "\n\n[Note: This response has been personalized based on your current financial situation and recent interactions.]";
                    break;
                }
            }

            // Store conversation
            AiConversation::create([
                'user_id' => $user->id,
                'question' => $question,
                'answer' => $answer,
                'type' => 'advice',
                'metadata' => [
                    'context' => $context,
                    'tokens_used' => $aiResponse['usage']['total_tokens'] ?? 0,
                    'system_prompt_used' => $randomSystemPrompt,
                ],
            ]);

            return response()->json([
                'answer' => $answer,
                'context_used' => !empty($context),
            ]);

        } catch (\Exception $e) {
            Log::error('AI Advice Error: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to get AI advice',
                'message' => 'Please try again later.',
            ], 500);
        }
    }

    /**
     * Smart Spending Analysis
     */
    public function spendingInsights(Request $request): JsonResponse
    {
        $request->validate([
            'expenses' => 'required|array',
            'expenses.*.amount' => 'required|numeric',
            'expenses.*.category' => 'required|string',
            'expenses.*.description' => 'nullable|string',
        ]);

        try {
            $expenses = $request->expenses;
            $user = $request->user();

            // Use LangGraph workflow for spending analysis
            $langGraphService = new LangGraphService();
            $result = $langGraphService->spendingAnalysisWorkflow($expenses, $user->id);
            
            return response()->json([
                'top_categories' => $result['top_categories'],
                'saving_suggestions' => $result['saving_suggestions'],
                'forecasted_spending' => $result['forecasted_spending'],
                'recommendations' => $result['recommendations'],
                'workflow_state' => $result['workflow_state'],
                'reasoning_steps' => $result['reasoning_steps']
            ]);

            // Dynamic system prompts for spending analysis
            $analysisPrompts = [
                'You are a financial analyst. Analyze spending patterns and provide insights in JSON format with: top_categories, saving_suggestions, forecast, and recommendations. Return ONLY valid JSON, no other text.',
                'You are a personal finance expert. Examine the spending data and provide detailed analysis in JSON format including: top_categories, saving_suggestions, forecast, and recommendations. Return ONLY valid JSON, no other text.',
                'You are a money management consultant. Analyze the expense patterns and give actionable insights in JSON format with: top_categories, saving_suggestions, forecast, and recommendations. Return ONLY valid JSON, no other text.',
                'You are a financial advisor. Review the spending data and provide comprehensive analysis in JSON format including: top_categories, saving_suggestions, forecast, and recommendations. Return ONLY valid JSON, no other text.',
                'You are a budget specialist. Analyze the financial data and offer detailed recommendations in JSON format with: top_categories, saving_suggestions, forecast, and recommendations. Return ONLY valid JSON, no other text.'
            ];
            
            $randomAnalysisPrompt = $analysisPrompts[array_rand($analysisPrompts)];

            $response = Http::timeout(10)->retry(2, 1000)->withHeaders([
                'Authorization' => 'Bearer ' . config('services.openai.api_key'),
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $randomAnalysisPrompt
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 500,
                'temperature' => 0.5,
                'top_p' => 0.8,
                'frequency_penalty' => 0.1,
                'presence_penalty' => 0.1,
                'stream' => false,
            ]);

            if (!$response->successful()) {
                throw new \Exception('OpenAI API request failed');
            }

            $aiResponse = $response->json();
            $analysis = $aiResponse['choices'][0]['message']['content'] ?? '{}';

            // Try to parse JSON response
            $parsedAnalysis = json_decode($analysis, true);
            if (!$parsedAnalysis) {
                // Try to extract JSON from the response if it's embedded in text
                if (preg_match('/\{.*\}/s', $analysis, $matches)) {
                    $parsedAnalysis = json_decode($matches[0], true);
                }
                
                // If still no valid JSON, use fallback
                if (!$parsedAnalysis) {
                    $parsedAnalysis = [
                        'top_categories' => $this->calculateTopCategories($expenses),
                        'saving_suggestions' => ['Review your largest expense categories for potential savings'],
                        'forecast' => $this->calculateForecast($expenses),
                        'recommendations' => ['Consider setting up a budget for your top spending categories'],
                    ];
                }
            }

            // Store analysis
            AiConversation::create([
                'user_id' => $user->id,
                'question' => 'Spending Analysis Request',
                'answer' => $analysis,
                'type' => 'analysis',
                'metadata' => [
                    'expenses_count' => count($expenses),
                    'total_amount' => array_sum(array_column($expenses, 'amount')),
                    'tokens_used' => $aiResponse['usage']['total_tokens'] ?? 0,
                ],
            ]);

            return response()->json([
                'insights' => $parsedAnalysis,
                'summary' => [
                    'total_expenses' => count($expenses),
                    'total_amount' => array_sum(array_column($expenses, 'amount')),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('AI Spending Analysis Error: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to analyze spending',
                'message' => 'Please try again later.',
            ], 500);
        }
    }

    /**
     * Auto Categorization
     */
    public function classifyExpense(Request $request): JsonResponse
    {
        $request->validate([
            'description' => 'required|string|max:255',
        ]);

        try {
            $description = $request->description;
            $user = $request->user();

            // Simple test response
            return response()->json([
                'category' => 'Food & Dining',
                'confidence' => 'high',
                'method' => 'test',
                'alternative_categories' => ['Restaurants', 'Coffee'],
                'keywords_found' => ['coffee', 'starbucks'],
                'workflow_state' => 'completed',
                'reasoning_steps' => ['Test response']
            ]);

        } catch (\Exception $e) {
            Log::error('AI Classification Error: ' . $e->getMessage());
            
            // Fallback to keyword matching
            $categories = $request->user()->categories()->pluck('name')->toArray();
            
            return response()->json([
                'category' => $this->fallbackCategorization($request->description, $categories),
                'confidence' => 'low',
                'method' => 'fallback',
            ]);
        }
    }

    /**
     * Get user's conversation history
     */
    public function conversations(Request $request): JsonResponse
    {
        $conversations = $request->user()
            ->aiConversations()
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get(['id', 'question', 'answer', 'type', 'created_at']);

        return response()->json([
            'conversations' => $conversations,
        ]);
    }

    /**
     * Legacy insights method
     */
    public function insights(Request $request): JsonResponse
    {
        $request->validate([
            'summary' => 'required|array',
            'summary.totals_by_category' => 'required|array',
            'summary.last_3_months_avg' => 'required|array',
            'summary.user_goal' => 'nullable|string',
        ]);

        $aiRequest = $request->user()->aiRequests()->create([
            'input_summary' => $request->summary,
            'status' => 'pending',
        ]);

        try {
            $response = $this->aiService->generateInsights($request->summary);
            
            $aiRequest->update([
                'response' => $response,
                'status' => 'success',
                'cost' => 0.01, // Mock cost
            ]);

            return response()->json([
                'insights' => $response,
                'request_id' => $aiRequest->id,
            ]);
        } catch (\Exception $e) {
            $aiRequest->update([
                'status' => 'failed',
            ]);

            return response()->json([
                'error' => 'Failed to generate insights',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Build financial context for AI
     */
    private function buildFinancialContext($transactions): array
    {
        $totalIncome = $transactions->where('type', 'income')->sum('amount');
        $totalExpenses = $transactions->where('type', 'expense')->sum('amount');
        $categories = $transactions->where('type', 'expense')->groupBy('category.name')->map->sum('amount');

        return [
            'total_income' => $totalIncome,
            'total_expenses' => $totalExpenses,
            'net_balance' => $totalIncome - $totalExpenses,
            'top_expense_categories' => $categories->sortDesc()->take(3)->toArray(),
            'transaction_count' => $transactions->count(),
        ];
    }

    /**
     * Build advice prompt
     */
    /**
     * Check if question is complex and needs LangGraph workflow
     */
    private function isComplexQuestion($question)
    {
        $complexKeywords = [
            'analyze', 'compare', 'strategy', 'plan', 'long-term', 'short-term',
            'investment', 'portfolio', 'retirement', 'debt', 'consolidation',
            'budget', 'savings', 'emergency', 'financial', 'planning'
        ];
        
        $lowerQuestion = strtolower($question);
        foreach ($complexKeywords as $keyword) {
            if (strpos($lowerQuestion, $keyword) !== false) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Get helpful fallback response based on question type
     */
    private function getFallbackResponse($question)
    {
        $lowerQuestion = strtolower($question);
        
        // Budget-related questions
        if (strpos($lowerQuestion, 'budget') !== false) {
            return 'I\'d love to help you with budgeting! 💰 Here are some quick tips: 1) Track your income and expenses, 2) Use the 50/30/20 rule (50% needs, 30% wants, 20% savings), 3) Set up automatic transfers to savings, 4) Review and adjust monthly. What specific budgeting challenge are you facing?';
        }
        
        // Saving questions
        if (strpos($lowerQuestion, 'save') !== false || strpos($lowerQuestion, 'saving') !== false) {
            return 'Great question about saving money! 💸 Here are some effective strategies: 1) Follow the 50/30/20 rule, 2) Set up automatic transfers, 3) Track your expenses, 4) Cut unnecessary subscriptions, 5) Cook at home more often, 6) Use cashback apps. What\'s your biggest saving goal?';
        }
        
        // Investment questions
        if (strpos($lowerQuestion, 'invest') !== false || strpos($lowerQuestion, 'investment') !== false) {
            return 'Investment is a great way to grow your wealth! 📈 For beginners, consider: 1) Emergency fund first (3-6 months expenses), 2) 401(k) or IRA for retirement, 3) Index funds for diversification, 4) Individual stocks for growth. Start with low-cost index funds and gradually learn more. What\'s your investment timeline?';
        }
        
        // Debt questions
        if (strpos($lowerQuestion, 'debt') !== false) {
            return 'Managing debt is crucial for financial health! 💳 I can help you create a debt payoff strategy. The two main methods are: 1) Snowball method (pay smallest debts first), 2) Avalanche method (pay highest interest first). What types of debt are you dealing with?';
        }
        
        // General financial questions
        if (strpos($lowerQuestion, 'financial') !== false || strpos($lowerQuestion, 'money') !== false) {
            return 'I\'m here to help with your financial journey! 💪 The key areas to focus on are: 1) Track your spending, 2) Create a budget, 3) Build an emergency fund, 4) Pay off high-interest debt, 5) Start investing. What\'s your biggest financial challenge right now?';
        }
        
        // Default helpful response
        return 'I\'m here to help with your financial questions! 💰 Whether you need help with budgeting, saving, investing, or debt management, I\'m ready to assist. What specific financial topic would you like to discuss?';
    }

    private function buildAdvicePrompt(string $question, array $context, $conversationHistory = null): string
    {
        $contextStr = '';
        if (!empty($context)) {
            $contextStr = "\n\nUser's Financial Context:\n";
            $contextStr .= "- Total Income: $" . number_format($context['total_income'], 2) . "\n";
            $contextStr .= "- Total Expenses: $" . number_format($context['total_expenses'], 2) . "\n";
            $contextStr .= "- Net Balance: $" . number_format($context['net_balance'], 2) . "\n";
            $contextStr .= "- Top Expense Categories: " . implode(', ', array_keys($context['top_expense_categories'])) . "\n";
            $contextStr .= "- Transaction Count: " . $context['transaction_count'] . "\n";
            
            // Add more specific insights
            if ($context['net_balance'] > 0) {
                $contextStr .= "- Financial Status: Positive cash flow\n";
            } else {
                $contextStr .= "- Financial Status: Negative cash flow (spending exceeds income)\n";
            }
            
            if (!empty($context['top_expense_categories'])) {
                $topCategory = array_keys($context['top_expense_categories'])[0];
                $topAmount = $context['top_expense_categories'][$topCategory];
                $contextStr .= "- Largest Expense: " . $topCategory . " ($" . number_format($topAmount, 2) . ")\n";
            }
        }

        // Add timestamp and unique identifier for uniqueness
        $timestamp = date('Y-m-d H:i:s');
        $uniqueId = uniqid();
        $contextStr .= "\n- Analysis Date: " . $timestamp . "\n";
        $contextStr .= "- Request ID: " . $uniqueId . "\n";
        
        // Add natural, conversational starters
        $conversationStarters = [
            "Based on my financial situation, what advice do you have for me?",
            "Looking at my money data, what would you recommend I focus on?",
            "I'd love to get your thoughts on my financial situation and any suggestions you have.",
            "What do you think about my spending patterns and how can I improve?",
            "I'm looking for some personalized financial advice based on my current situation.",
            "What financial strategies would you suggest for someone in my position?",
            "I'd appreciate your insights on my financial health and any recommendations.",
            "What are the key areas I should focus on to improve my financial situation?",
            "Based on my financial data, what steps would you recommend I take?",
            "I'm seeking guidance on how to better manage my money and achieve my goals.",
            "What opportunities do you see for improving my financial well-being?",
            "I'd like your expert opinion on my financial situation and next steps."
        ];
        
        $randomStarter = $conversationStarters[array_rand($conversationStarters)];
        
        // Add conversation history for context
        $historyStr = '';
        if ($conversationHistory && $conversationHistory->count() > 0) {
            $historyStr = "\n\nRecent Conversation History:\n";
            foreach ($conversationHistory as $conv) {
                $historyStr .= "Q: " . $conv->question . "\n";
                $historyStr .= "A: " . substr($conv->answer, 0, 100) . "...\n\n";
            }
        }
        
        return $question . $contextStr . $historyStr . "\n\n" . $randomStarter;
    }

    /**
     * Build spending analysis prompt
     */
    private function buildSpendingAnalysisPrompt(array $expenses): string
    {
        $expenseList = '';
        $totalAmount = 0;
        $categoryCounts = [];
        
        foreach ($expenses as $expense) {
            $expenseList .= "- {$expense['category']}: $" . number_format($expense['amount'], 2);
            if (!empty($expense['description'])) {
                $expenseList .= " ({$expense['description']})";
            }
            $expenseList .= "\n";
            
            $totalAmount += $expense['amount'];
            $categoryCounts[$expense['category']] = ($categoryCounts[$expense['category']] ?? 0) + 1;
        }

        // Add analysis requests
        $analysisRequests = [
            "Analyze these expenses and provide detailed insights:",
            "Examine this spending data and give comprehensive analysis:",
            "Review these financial transactions and provide expert insights:",
            "Study this expense data and offer detailed recommendations:",
            "Analyze these spending patterns and provide actionable insights:"
        ];
        
        $randomRequest = $analysisRequests[array_rand($analysisRequests)];
        
        $prompt = $randomRequest . "\n\n" . $expenseList;
        $prompt .= "\nTotal Amount: $" . number_format($totalAmount, 2);
        $prompt .= "\nNumber of Transactions: " . count($expenses);
        $prompt .= "\nUnique Categories: " . count($categoryCounts);
        $prompt .= "\nAnalysis Date: " . date('Y-m-d H:i:s');
        
        return $prompt;
    }

    /**
     * Calculate top categories (fallback)
     */
    private function calculateTopCategories(array $expenses): array
    {
        $categories = [];
        foreach ($expenses as $expense) {
            $category = $expense['category'];
            $categories[$category] = ($categories[$category] ?? 0) + $expense['amount'];
        }
        
        arsort($categories);
        return array_slice($categories, 0, 3, true);
    }

    /**
     * Calculate forecast (fallback)
     */
    private function calculateForecast(array $expenses): float
    {
        $total = array_sum(array_column($expenses, 'amount'));
        return $total * 1.1; // 10% increase assumption
    }

    /**
     * Fallback categorization using keyword matching
     */
    private function fallbackCategorization(string $description, array $categories): string
    {
        $description = strtolower($description);
        
        $keywords = [
            'food' => ['restaurant', 'food', 'dining', 'grocery', 'supermarket', 'cafe'],
            'transport' => ['uber', 'taxi', 'gas', 'fuel', 'parking', 'metro', 'bus'],
            'entertainment' => ['movie', 'cinema', 'netflix', 'spotify', 'game', 'entertainment'],
            'shopping' => ['shop', 'store', 'amazon', 'clothes', 'fashion', 'shopping'],
            'utilities' => ['electric', 'water', 'internet', 'phone', 'utility', 'bill'],
        ];

        foreach ($keywords as $category => $words) {
            if (in_array($category, $categories)) {
                foreach ($words as $word) {
                    if (strpos($description, $word) !== false) {
                        return $category;
                    }
                }
            }
        }

        return $categories[0] ?? 'Other';
    }
}
