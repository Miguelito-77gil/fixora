<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    private function checkAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(response()->json([
                'error' => 'Admin access required.',
            ], 403));
        }
    }

    public function pendingRepairers(Request $request)
    {
        $this->checkAdmin($request);

        $status = $request->query('status', 'pending');

        $repairers = User::with('repairerProfile')
            ->where('role', 'repairer')
            ->where('verification_status', $status)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'verification_status' => $user->verification_status,
                    'profile' => $user->repairerProfile,
                ];
            });

        return response()->json($repairers);
    }

    public function verifyRepairer(Request $request, $id)
    {
        $this->checkAdmin($request);

        $validated = $request->validate([
            'status' => ['required', 'in:verified,rejected,pending'],
        ]);

        $user = User::where('id', $id)
            ->where('role', 'repairer')
            ->first();

        if (!$user) {
            return response()->json([
                'error' => 'Repairer not found.',
            ], 404);
        }

        $user->verification_status = $validated['status'];
        $user->save();

        return response()->json([
            'message' => 'Repairer verification status updated successfully',
            'user' => $user->fresh(),
        ]);
    }
}