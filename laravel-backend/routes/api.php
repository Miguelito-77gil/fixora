<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\RepairerController;
use App\Http\Controllers\RepairerPhotoController;
use App\Http\Controllers\RepairRequestController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/repairers', [RepairerController::class, 'index']);
Route::get('/repairers/{repairerId}/portfolio', [PortfolioController::class, 'repairer']);
Route::get('/repairers/{repairerId}/reviews', [ReviewController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/users/me', [UserController::class, 'me']);
    Route::put('/users/me', [UserController::class, 'update']);

    Route::get('/repairers/me', [RepairerController::class, 'me']);
    Route::put('/repairers/me', [RepairerController::class, 'update']);
    Route::post('/repairers/apply', [RepairerController::class, 'apply']);
    Route::post('/repairers/me/photo', [RepairerPhotoController::class, 'store']);

    Route::post('/repairers/me/portfolio', [PortfolioController::class, 'store']);
    Route::get('/repairers/me/portfolio', [PortfolioController::class, 'mine']);
    Route::delete('/repairers/me/portfolio/{id}', [PortfolioController::class, 'destroy']);

    Route::post('/repair-requests', [RepairRequestController::class, 'store']);
    Route::get('/repair-requests/mine', [RepairRequestController::class, 'mine']);
    Route::put('/repair-requests/{id}/status', [RepairRequestController::class, 'updateStatus']);

    Route::post('/reviews', [ReviewController::class, 'store']);

    Route::get('/admin/repairers', [AdminController::class, 'pendingRepairers']);
    Route::put('/admin/repairers/{id}/verify', [AdminController::class, 'verifyRepairer']);
});