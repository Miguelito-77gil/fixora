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
            return response()->json(['message' => 'Unauthorized.'], 403);
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
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'users' => $users,
        ]);
    }

    public function pendingRepairers(Request $request): JsonResponse
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
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
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:pending,verified,rejected'],
        ]);

        $repairer = User::query()
            ->where('id', $id)
            ->where('role', 'repairer')
            ->firstOrFail();

        // Update the main users verification status.
        $repairer->verification_status = $validated['status'];
        $repairer->save();

        // Keep the repairer profile status synchronized.
        if ($repairer->repairerProfile) {
            $repairer->repairerProfile->verification_status = $validated['status'];
            $repairer->repairerProfile->save();
        }

        return response()->json([
            'message' => 'Repairer status updated successfully.',
            'status' => $validated['status'],
        ]);
    }
}