<?php

namespace App\Http\Controllers;

use App\Models\RepairRequest;
use App\Models\Review;
use Illuminate\Http\Request;

class RepairRequestController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'repairer_id' => ['required', 'integer', 'exists:users,id'],
            'service' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $repairer = \App\Models\User::find($validated['repairer_id']);

        if (!$repairer || $repairer->role !== 'repairer') {
            return response()->json([
                'error' => 'Selected user is not a repairer.',
            ], 422);
        }

        $repairRequest = RepairRequest::create([
            'customer_id' => $request->user()->id,
            'repairer_id' => $validated['repairer_id'],
            'service' => $validated['service'],
            'description' => $validated['description'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Repair request created successfully',
            'request' => $repairRequest->load([
                'customer',
                'repairer',
                'repairer.repairerProfile',
                'review',
            ]),
        ], 201);
    }

    public function mine(Request $request)
    {
        $user = $request->user();

        $relations = [
            'customer',
            'repairer',
            'repairer.repairerProfile',
            'review',
        ];

        if ($user->role === 'repairer') {
            $requests = RepairRequest::with($relations)
                ->where('repairer_id', $user->id)
                ->orderByDesc('created_at')
                ->get();
        } else {
            $requests = RepairRequest::with($relations)
                ->where('customer_id', $user->id)
                ->orderByDesc('created_at')
                ->get();
        }

        $requests = $requests->map(function ($repairRequest) {
            $repairRequest->has_review = Review::where(
                'repair_request_id',
                $repairRequest->id
            )->exists();

            return $repairRequest;
        });

        return response()->json([
            'requests' => $requests,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                'in:pending,accepted,on_the_way,arrived,in_progress,completed,cancelled',
            ],
        ]);

        $user = $request->user();

        $repairRequest = RepairRequest::find($id);

        if (!$repairRequest) {
            return response()->json([
                'error' => 'Repair request not found.',
            ], 404);
        }

        $isCustomer = $repairRequest->customer_id === $user->id;
        $isRepairer = $repairRequest->repairer_id === $user->id;

        if (!$isCustomer && !$isRepairer) {
            return response()->json([
                'error' => 'You are not authorized to update this request.',
            ], 403);
        }

        $status = $validated['status'];

        if ($status === 'accepted' && !$isRepairer) {
            return response()->json([
                'error' => 'Only the repairer can accept a request.',
            ], 403);
        }

        if (
            in_array($status, [
                'on_the_way',
                'arrived',
                'in_progress',
                'completed'
            ])
            && !$isRepairer
        ) {
            return response()->json([
                'error' => 'Only the repairer can update this status.',
            ], 403);
        }

        if ($status === 'cancelled') {
            if (!in_array($repairRequest->status, ['pending', 'accepted'])) {
                return response()->json([
                    'error' => 'This request can no longer be cancelled.',
                ], 422);
            }
        }

        $repairRequest->status = $status;

        if ($status === 'completed') {
            $repairRequest->completed_at = now();
        }

        $repairRequest->save();

        $repairRequest->load([
            'customer',
            'repairer',
            'repairer.repairerProfile',
            'review',
        ]);

        $repairRequest->has_review = Review::where(
            'repair_request_id',
            $repairRequest->id
        )->exists();

        return response()->json([
            'message' => 'Repair request status updated successfully',
            'request' => $repairRequest,
        ]);
    }
}