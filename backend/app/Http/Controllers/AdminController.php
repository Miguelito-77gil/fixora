<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function users(Request $request): JsonResponse
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $users = User::query()
            ->select([
                'id',
                'name',
                'email',
                'role',
                'phone',
                'created_at',
            ])
            ->with([
                'repairerProfile:id,user_id,category,bio,years_experience,location,price,phone,photo_url,available,verification_status',
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(function (User $user) {
                $repairerProfile = $user->repairerProfile;

                /*
                 * For repairers, the actual phone number is stored
                 * inside repairer_profiles.phone.
                 * Customers/admins use users.phone.
                 */
                $phone = $user->phone;

                if (
                    $user->role === 'repairer' &&
                    $repairerProfile &&
                    !empty($repairerProfile->phone)
                ) {
                    $phone = $repairerProfile->phone;
                }

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'phone' => $phone,
                    'created_at' => $user->created_at,

                    /*
                     * Send repairer profile details so the admin
                     * profile modal can use them.
                     */
                    'repairer_profile' => $repairerProfile
                        ? [
                            'category' => $repairerProfile->category,
                            'bio' => $repairerProfile->bio,
                            'years_experience' => $repairerProfile->years_experience,
                            'location' => $repairerProfile->location,
                            'price' => $repairerProfile->price,
                            'phone' => $repairerProfile->phone,
                            'photo_url' => $repairerProfile->photo_url,
                            'available' => $repairerProfile->available,
                            'verification_status' => $repairerProfile->verification_status,
                        ]
                        : null,
                ];
            });

        return response()->json([
            'users' => $users,
        ]);
    }

    public function pendingRepairers(Request $request): JsonResponse
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $repairers = User::query()
            ->where('role', 'repairer')
            ->where('verification_status', 'pending')
            ->with('repairerProfile')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($repairers);
    }

    public function verifyRepairer(Request $request, $id): JsonResponse
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:pending,verified,rejected'],
        ]);

        $repairer = User::query()
            ->where('id', $id)
            ->where('role', 'repairer')
            ->firstOrFail();

        $repairer->verification_status = $validated['status'];
        $repairer->save();

        if ($repairer->repairerProfile) {
            $repairer->repairerProfile->verification_status =
                $validated['status'];

            $repairer->repairerProfile->save();
        }

        return response()->json([
            'message' => 'Repairer status updated successfully.',
            'status' => $validated['status'],
        ]);
    }
}