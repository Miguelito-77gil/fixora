<?php

namespace App\Http\Controllers;

use App\Models\RepairRequest;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'repair_request_id' => ['required', 'integer', 'exists:repair_requests,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string'],
        ]);

        $repairRequest = RepairRequest::find($validated['repair_request_id']);

        if (!$repairRequest) {
            return response()->json([
                'error' => 'Repair request not found.',
            ], 404);
        }

        if ($repairRequest->customer_id !== $request->user()->id) {
            return response()->json([
                'error' => 'Only the customer can submit a review.',
            ], 403);
        }

        if ($repairRequest->status !== 'completed') {
            return response()->json([
                'error' => 'You can only review a completed repair.',
            ], 422);
        }

        if (Review::where('repair_request_id', $repairRequest->id)->exists()) {
            return response()->json([
                'error' => 'This repair has already been reviewed.',
            ], 422);
        }

        $review = Review::create([
            'repair_request_id' => $repairRequest->id,
            'customer_id' => $repairRequest->customer_id,
            'repairer_id' => $repairRequest->repairer_id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        return response()->json([
            'message' => 'Review submitted successfully',
            'review' => $review->load(['customer', 'repairer']),
        ], 201);
    }

    public function index($repairerId)
    {
        $reviews = Review::with('customer')
            ->where('repairer_id', $repairerId)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => (int) $review->rating,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at,
                    'customer_id' => $review->customer_id,
                    'customer_name' => $review->customer?->name ?? 'Customer',
                ];
            });

        return response()->json($reviews);
    }
}
