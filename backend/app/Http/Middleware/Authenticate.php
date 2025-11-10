<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;
use Symfony\Component\Routing\Exception\RouteNotFoundException;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // For API routes, always return null (no redirect, will return JSON)
        if ($request->is('api/*') || $request->expectsJson()) {
            return null;
        }
        
        // For web routes, try to redirect to login (but don't fail if route doesn't exist)
        try {
            return route('login');
        } catch (RouteNotFoundException $e) {
            // If login route doesn't exist, return null (will return JSON instead)
            return null;
        } catch (\Exception $e) {
            // For any other exception, also return null
            return null;
        }
    }
}
