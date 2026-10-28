<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\RepairerController;
use App\Http\Controllers\RepairerPhotoController;
use App\Http\Controllers\RepairRequestController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\MarketplaceController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/repairers', [RepairerController::class, 'index']);
Route::get('/marketplace/recommended', [MarketplaceController::class, 'recommended']);

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
    Route::get('/admin/users', [AdminController::class, 'users']);
    Route::get('/admin/dashboard', [MarketplaceController::class, 'adminDashboard']);

    Route::post('/marketplace/favorites/{repairerId}', [MarketplaceController::class, 'favorite']);
    Route::get('/marketplace/favorites', [MarketplaceController::class, 'favorites']);

    Route::post('/marketplace/recent/{repairerId}', [MarketplaceController::class, 'recentlyViewed']);
    Route::get('/marketplace/recent', [MarketplaceController::class, 'recent']);

    Route::get('/marketplace/repairers/{repairerId}/services', [MarketplaceController::class, 'services']);
    Route::post('/marketplace/repairer-services', [MarketplaceController::class, 'addService']);
    Route::patch('/marketplace/repairer-services/{serviceId}', [MarketplaceController::class, 'updateService']);
    Route::delete('/marketplace/repairer-services/{serviceId}', [MarketplaceController::class, 'deleteService']);

    Route::get('/marketplace/repairer-dashboard', [MarketplaceController::class, 'dashboard']);
    Route::get('/marketplace/earnings', [MarketplaceController::class, 'earnings']);

    Route::get('/marketplace/chat/users', [MarketplaceController::class, 'chatUsers']);
    Route::get('/marketplace/chat/unread', [MarketplaceController::class, 'unreadMessages']);
    Route::get('/marketplace/chat/{userId}', [MarketplaceController::class, 'messages']);
    Route::post('/marketplace/chat/{userId}', [MarketplaceController::class, 'sendMessage']);

    Route::get('/marketplace/notifications', [MarketplaceController::class, 'notifications']);
    Route::patch('/marketplace/notifications/{id}/read', [MarketplaceController::class, 'markNotificationRead']);
});

Route::get('/repairers/{repairerId}/portfolio', [PortfolioController::class, 'repairer']);
Route::get('/repairers/{repairerId}/reviews', [ReviewController::class, 'index']);