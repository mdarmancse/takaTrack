<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\GoalController;
use App\Http\Controllers\Api\AiController;
use App\Http\Controllers\Api\GamificationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\Cms\PageController;
use App\Http\Controllers\Api\Cms\PostController;
use App\Http\Controllers\Api\Cms\MediaController;
use App\Http\Controllers\Api\Cms\RoleController;
use App\Http\Controllers\Api\Cms\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'changePassword']);

    // Transactions
    Route::get('/transactions/summary', [TransactionController::class, 'summary']);
    Route::apiResource('transactions', TransactionController::class);

    // Categories
    Route::apiResource('categories', CategoryController::class);

    // Accounts
    Route::apiResource('accounts', AccountController::class);

    // Budgets
    Route::apiResource('budgets', BudgetController::class);

    // Goals
    Route::apiResource('goals', GoalController::class);

    // AI Features
    Route::post('/ai/advice', [AiController::class, 'advice']);
    Route::post('/ai/spending-insights', [AiController::class, 'spendingInsights']);
    Route::post('/ai/classify-expense', [AiController::class, 'classifyExpense']);
    Route::get('/ai/conversations', [AiController::class, 'conversations']);
    Route::post('/ai/insights', [AiController::class, 'insights']);

    // Gamification Features
    Route::prefix('gamification')->group(function () {
        // Streaks
        Route::get('/streak', [GamificationController::class, 'getStreak']);
        Route::post('/streak/update', [GamificationController::class, 'updateStreak']);
        
        // Goals
        Route::get('/goals', [GamificationController::class, 'getGoals']);
        Route::post('/goals', [GamificationController::class, 'createGoal']);
        Route::post('/goals/{goalId}/progress', [GamificationController::class, 'updateGoalProgress']);
        
        // User Level
        Route::get('/level', [GamificationController::class, 'getUserLevel']);
        
        // Daily Spin
        Route::post('/daily-spin', [GamificationController::class, 'performDailySpin']);
        Route::get('/daily-spin/can-spin', [GamificationController::class, 'canSpinToday']);
        Route::get('/daily-spin/history', [GamificationController::class, 'getSpinHistory']);
        
        // Rewards
        Route::get('/rewards', [GamificationController::class, 'getUserRewards']);
        Route::post('/rewards/{rewardId}/claim', [GamificationController::class, 'claimReward']);
        
        // Dashboard
        Route::get('/dashboard', [GamificationController::class, 'getDashboard']);
    });

    // Reports
    Route::get('/reports/monthly', [ReportController::class, 'monthly']);
    Route::get('/reports/export', [ReportController::class, 'export']);

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
        Route::post('/test', [NotificationController::class, 'createTest']); // For development
    });

    // CMS Admin Routes (Role-based access)
    Route::prefix('cms')->middleware([\App\Http\Middleware\CheckAdminRole::class])->group(function () {
        // CMS Index - Show available endpoints
        Route::get('/', function () {
            return response()->json([
                'message' => 'TakaTrack CMS API',
                'version' => '1.0.0',
                'endpoints' => [
                    'pages' => [
                        'GET /api/cms/pages' => 'List all pages',
                        'POST /api/cms/pages' => 'Create a new page',
                        'GET /api/cms/pages/{id}' => 'Get a specific page',
                        'PUT /api/cms/pages/{id}' => 'Update a page',
                        'DELETE /api/cms/pages/{id}' => 'Delete a page',
                        'GET /api/cms/pages/published' => 'Get published pages',
                        'GET /api/cms/pages/slug/{slug}' => 'Get page by slug',
                    ],
                    'posts' => [
                        'GET /api/cms/posts' => 'List all posts',
                        'POST /api/cms/posts' => 'Create a new post',
                        'GET /api/cms/posts/{id}' => 'Get a specific post',
                        'PUT /api/cms/posts/{id}' => 'Update a post',
                        'DELETE /api/cms/posts/{id}' => 'Delete a post',
                        'GET /api/cms/posts/published' => 'Get published posts',
                        'GET /api/cms/posts/slug/{slug}' => 'Get post by slug',
                        'GET /api/cms/posts/tags' => 'Get all tags',
                        'GET /api/cms/posts/categories' => 'Get all categories',
                    ],
                    'media' => [
                        'GET /api/cms/media' => 'List all media',
                        'POST /api/cms/media' => 'Upload a media file',
                        'GET /api/cms/media/{id}' => 'Get a specific media',
                        'PUT /api/cms/media/{id}' => 'Update media metadata',
                        'DELETE /api/cms/media/{id}' => 'Delete a media file',
                        'POST /api/cms/media/upload-multiple' => 'Upload multiple files',
                        'GET /api/cms/media/folders' => 'Get all folders',
                        'GET /api/cms/media/types' => 'Get all media types',
                    ],
                    'roles' => [
                        'GET /api/cms/roles' => 'List all roles',
                        'POST /api/cms/roles' => 'Create a new role',
                        'GET /api/cms/roles/{id}' => 'Get a specific role',
                        'PUT /api/cms/roles/{id}' => 'Update a role',
                        'DELETE /api/cms/roles/{id}' => 'Delete a role',
                        'GET /api/cms/roles/permissions' => 'Get all permissions',
                        'POST /api/cms/roles/assign-user' => 'Assign role to user',
                        'POST /api/cms/roles/remove-user' => 'Remove role from user',
                    ],
                ],
                'authentication' => 'Bearer token required',
                'authorization' => 'Admin or Super Admin role required',
            ]);
        });

        // Pages
        Route::apiResource('pages', PageController::class);
        Route::get('pages/published', [PageController::class, 'published']);
        Route::get('pages/slug/{slug}', [PageController::class, 'showBySlug']);

        // Posts
        Route::apiResource('posts', PostController::class);
        Route::get('posts/published', [PostController::class, 'published']);
        Route::get('posts/slug/{slug}', [PostController::class, 'showBySlug']);
        Route::get('posts/tags', [PostController::class, 'tags']);
        Route::get('posts/categories', [PostController::class, 'categories']);

        // Media
        Route::apiResource('media', MediaController::class);
        Route::post('media/upload-multiple', [MediaController::class, 'uploadMultiple']);
        Route::get('media/folders', [MediaController::class, 'folders']);
        Route::get('media/types', [MediaController::class, 'types']);

        // Roles & Permissions
        Route::apiResource('roles', RoleController::class);
        Route::get('roles/permissions', [RoleController::class, 'permissions']);
        Route::post('roles/assign-user', [RoleController::class, 'assignToUser']);
        Route::post('roles/remove-user', [RoleController::class, 'removeFromUser']);

        // Users
        Route::apiResource('users', UserController::class);
    });
});

// Internal routes (for SMS parsing, etc.)
// Route::prefix('internal')->group(function () {
//     Route::post('/sms-parse', [SmsController::class, 'parse']);
// });
