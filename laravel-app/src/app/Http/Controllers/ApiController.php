<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class ApiController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'message' => 'Laravel API is running!',
            'timestamp' => now()->toISOString(),
            'environment' => app()->environment(),
        ]);
    }
}
