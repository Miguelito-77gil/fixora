<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RepairerPhotoController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'photo' => ['required', 'image', 'max:5120'],
        ]);

        $user = $request->user();

        if ($user->role !== 'repairer') {
            return response()->json([
                'error' => 'Only repairers can upload a repairer photo.',
            ], 403);
        }

        $profile = $user->repairerProfile;

        if (!$profile) {
            return response()->json([
                'error' => 'Repairer profile not found.',
            ], 404);
        }

        if ($profile->photo_url) {
            $oldPath = str_replace('/storage/', '', $profile->photo_url);
            Storage::disk('public')->delete($oldPath);
        }

        $path = $request->file('photo')->store('repairers', 'public');

        $profile->photo_url = '/storage/' . $path;
        $profile->save();

        return response()->json([
            'message' => 'Repairer photo updated successfully',
            'photo_url' => $profile->photo_url,
            'profile' => $profile->fresh(),
        ]);
    }
}
