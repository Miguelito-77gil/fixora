<?php

namespace App\Http\Controllers;

use App\Models\PortfolioItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class PortfolioController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'photo' => ['required', 'image', 'max:5120'],
            'caption' => ['nullable', 'string', 'max:500'],
        ]);

        $user = $request->user();

        if ($user->role !== 'repairer') {
            return response()->json([
                'error' => 'Only repairers can add portfolio items.',
            ], 403);
        }

        $path = $request->file('photo')->store('portfolio', 'public');

        $item = PortfolioItem::create([
            'user_id' => $user->id,
            'image_url' => '/storage/' . $path,
            'caption' => $request->input('caption'),
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Portfolio item added successfully',
            'item' => $item,
        ], 201);
    }

    public function mine(Request $request)
{
    try {
        $user = $request->user();

        $items = PortfolioItem::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($items);

    } catch (\Throwable $e) {
        return response()->json([
            'error' => 'Portfolio endpoint failed',
            'exception' => get_class($e),
            'message' => $e->getMessage(),
            'file' => basename($e->getFile()),
            'line' => $e->getLine(),
        ], 500);
    }
}

    public function destroy(Request $request, $id)
    {
        $item = PortfolioItem::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$item) {
            return response()->json([
                'error' => 'Portfolio item not found.',
            ], 404);
        }

        $path = str_replace('/storage/', '', $item->image_url);

        if ($path) {
            Storage::disk('public')->delete($path);
        }

        $item->delete();

        return response()->json([
            'message' => 'Portfolio item deleted successfully',
        ]);
    }

    public function repairer($repairerId)
    {
        $items = PortfolioItem::where('user_id', $repairerId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($items);
    }
}