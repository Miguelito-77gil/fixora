<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CloudinaryService;

class RepairerPhotoController extends Controller
{
    public function store(Request $request, CloudinaryService $cloudinary)
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

        $result = $cloudinary->upload(
            $request->file('photo'),
            'fixora/repairers'
        );

        $profile->photo_url = $result['secure_url'];
        $profile->save();

        return response()->json([
            'message' => 'Repairer photo updated successfully',
            'photo_url' => $profile->photo_url,
            'profile' => $profile->fresh(),
        ]);
    }
}