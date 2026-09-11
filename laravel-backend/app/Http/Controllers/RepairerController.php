<?php

namespace App\Http\Controllers;

use App\Models\RepairerProfile;
use App\Models\RepairRequest;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;

class RepairerController extends Controller
{
    public function index()
    {
        $users = User::where('role', 'repairer')
            ->where('verification_status', 'verified')
            ->with('repairerProfile')
            ->get();

        $repairers = $users->map(function ($user) {
            $profile = $user->repairerProfile;

            $ratingData = Review::where('repairer_id', $user->id)
                ->selectRaw('AVG(rating) as rating, COUNT(*) as reviews')
                ->first();

            $repairCount = RepairRequest::where('repairer_id', $user->id)
                ->where('status', 'completed')
                ->count();

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'verification_status' => $user->verification_status,
                'phone' => $profile?->phone ?? $user->phone,
                'category' => $profile?->category ?? 'General Repair',
                'bio' => $profile?->bio ?? 'No description provided.',
                'years_experience' => $profile?->years_experience ?? 0,
                'location' => $profile?->location ?? 'Not specified',
                'price' => $profile?->price ?? 0,
                'photo_url' => $profile?->photo_url,
                'available' => $profile?->available ?? 1,
                'repairs' => $repairCount,
                'rating' => $ratingData && $ratingData->rating !== null
                    ? round((float) $ratingData->rating, 1)
                    : 0,
                'reviews' => $ratingData
                    ? (int) $ratingData->reviews
                    : 0,
            ];
        });

        return response()->json($repairers->values());
    }

    public function me(Request $request)
    {
        $user = $request->user();

        $profile = RepairerProfile::where('user_id', $user->id)->first();

        if (!$profile) {
            return response()->json([
                'message' => 'Repairer profile not found',
                'profile' => null,
            ], 404);
        }

        return response()->json([
            'profile' => $profile,
            'user' => $user,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'category' => ['nullable', 'string', 'max:100'],
            'bio' => ['nullable', 'string'],
            'years_experience' => ['nullable', 'integer', 'min:0'],
            'location' => ['nullable', 'string', 'max:255'],
            'price' => ['nullable', 'integer', 'min:0'],
            'phone' => ['nullable', 'string', 'max:30'],
            'available' => ['nullable', 'boolean'],
            'photo_url' => ['nullable', 'string', 'max:500'],
        ]);

        $profileData = $validated;
        $profileData['verification_status'] = 'pending';

        $profile = RepairerProfile::updateOrCreate(
            ['user_id' => $user->id],
            $profileData
        );

        return response()->json([
            'message' => 'Repairer profile updated successfully',
            'profile' => $profile->fresh(),
        ]);
    }

    public function apply(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'category' => ['required', 'string', 'max:100'],
            'bio' => ['nullable', 'string'],
            'years_experience' => ['nullable', 'integer', 'min:0'],
            'location' => ['nullable', 'string', 'max:255'],
            'price' => ['nullable', 'integer', 'min:0'],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        $user->role = 'repairer';
        $user->verification_status = 'pending';
        $user->save();

        $profileData = $validated;
        $profileData['verification_status'] = 'pending';

        $profile = RepairerProfile::updateOrCreate(
            ['user_id' => $user->id],
            $profileData
        );

        return response()->json([
            'message' => 'Repairer application submitted successfully',
            'profile' => $profile,
            'user' => $user->fresh(),
        ], 201);
    }
}
