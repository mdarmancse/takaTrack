<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'TakaTrack API',
        'version' => '1.0.0',
        'docs' => '/api/docs',
    ]);
});

// Login route placeholder (for Laravel's exception handler)
// This route is not used for actual login - login is handled via API
Route::get('/login', function () {
    return response()->json([
        'message' => 'Please use the API login endpoint: POST /api/auth/login',
    ], 401);
})->name('login');
