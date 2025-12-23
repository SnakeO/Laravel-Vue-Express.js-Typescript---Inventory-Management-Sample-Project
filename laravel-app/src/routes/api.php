<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('auth/validate', [AuthController::class, 'validate']);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('orders', OrderController::class)->except(['update']);
});
