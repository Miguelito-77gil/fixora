<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/media/{path}', function ($path) {
    $path = str_replace('\\', '/', $path);

    if (str_contains($path, '..')) {
        abort(404);
    }

    $fullPath = storage_path('app/public/' . $path);

    if (!is_file($fullPath)) {
        abort(404);
    }

    return response()->file($fullPath);
})->where('path', '.*');

Route::get('/password/reset/{token}', function (string $token) {
    return redirect(
        config('app.frontend_url') .
        '/reset-password?token=' . urlencode($token)
    );
})->name('password.reset');