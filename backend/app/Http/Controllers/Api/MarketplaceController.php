<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\RecentlyViewed;
use App\Models\ChatMessage;
use App\Models\FixoraNotification;
use App\Models\RepairerService;
use App\Models\RepairerEarning;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MarketplaceController extends Controller
{
    public function favorite(Request $request, $repairerId)
    {
        $customer = $request->user();

        $favorite = Favorite::where('customer_id', $customer->id)
            ->where('repairer_id', $repairerId)
            ->first();

        if ($favorite) {
            $favorite->delete();

            return response()->json([
                'favorited' => false,
                'message' => 'Removed from favorites.',
            ]);
        }

        Favorite::create([
            'customer_id' => $customer->id,
            'repairer_id' => $repairerId,
        ]);

        return response()->json([
            'favorited' => true,
            'message' => 'Added to favorites.',
        ]);
    }

    public function favorites(Request $request)
    {
        $ids = Favorite::where('customer_id', $request->user()->id)
            ->pluck('repairer_id');

        return response()->json($ids);
    }

    public function recentlyViewed(Request $request, $repairerId)
    {
        RecentlyViewed::updateOrCreate(
            [
                'customer_id' => $request->user()->id,
                'repairer_id' => $repairerId,
            ],
            [
                'viewed_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
        ]);
    }

    public function recent(Request $request)
    {
        $items = RecentlyViewed::where('customer_id', $request->user()->id)
            ->orderByDesc('viewed_at')
            ->limit(8)
            ->get();

        return response()->json($items);
    }

    public function services(Request $request, $repairerId)
    {
        return response()->json(
            RepairerService::where('repairer_id', $repairerId)
                ->orderBy('name')
                ->get()
        );
    }

    public function addService(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'starting_price' => 'nullable|integer|min:0',
        ]);

        $service = RepairerService::create([
            'repairer_id' => $request->user()->id,
            ...$data,
        ]);

        return response()->json($service, 201);
    }

    public function updateService(Request $request, $serviceId)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'starting_price' => 'nullable|integer|min:0',
        ]);

        $service = RepairerService::where('id', $serviceId)
            ->where('repairer_id', $request->user()->id)
            ->first();

        if (!$service) {
            return response()->json([
                'message' => 'Service not found.'
            ], 404);
        }

        $service->update($data);

        return response()->json($service);
    }

    public function deleteService(Request $request, $serviceId)
    {
        $service = RepairerService::where('id', $serviceId)
            ->where('repairer_id', $request->user()->id)
            ->first();

        if (!$service) {
            return response()->json([
                'message' => 'Service not found.'
            ], 404);
        }

        $service->delete();

        return response()->json([
            'message' => 'Service deleted successfully.'
        ]);
    }
    public function dashboard(Request $request)
    {
        $user = $request->user();

        $baseQuery = DB::table('repair_requests')
            ->where('repairer_id', $user->id);

        $total = (clone $baseQuery)->count();

        $pending = (clone $baseQuery)
            ->where('status', 'pending')
            ->count();

        $active = (clone $baseQuery)
            ->whereIn('status', [
                'accepted',
                'on_the_way',
                'arrived',
                'in_progress'
            ])
            ->count();

        $completed = (clone $baseQuery)
            ->where('status', 'completed')
            ->count();

        $cancelled = (clone $baseQuery)
            ->where('status', 'cancelled')
            ->count();

        $earnings = RepairerEarning::where('repairer_id', $user->id)
            ->where('status', 'completed')
            ->sum('amount');

        return response()->json([
            'total_requests' => $total,
            'pending_requests' => $pending,
            'active_repairs' => $active,
            'completed_requests' => $completed,
            'cancelled_requests' => $cancelled,
            'earnings' => (float) $earnings,
        ]);
    }

    public function earnings(Request $request)
    {
        return response()->json(
            RepairerEarning::where('repairer_id', $request->user()->id)
                ->orderByDesc('created_at')
                ->limit(50)
                ->get()
        );
    }

    public function chatUsers(Request $request)
    {
        $id = $request->user()->id;

        $ids = ChatMessage::where('sender_id', $id)
            ->orWhere('receiver_id', $id)
            ->get()
            ->map(function ($message) use ($id) {
                return $message->sender_id === $id
                    ? $message->receiver_id
                    : $message->sender_id;
            })
            ->unique()
            ->values();

        $users = User::whereIn('id', $ids)
            ->with('repairerProfile')
            ->select('id', 'name', 'email', 'role')
            ->get()
            ->map(function ($user) {
                $photoUrl = null;

                if ($user->role === 'repairer' && $user->repairerProfile) {
                    $photoUrl = $user->repairerProfile->photo_url;

                    if ($photoUrl) {
                        $photoUrl = url($photoUrl);
                    }
                }

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'photo_url' => $photoUrl,
                ];
            });

        return response()->json($users->values());
    }


    public function unreadMessages(Request $request)
    {
        $count = ChatMessage::where('receiver_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'count' => $count,
        ]);
    }
    public function messages(Request $request, $userId)
    {
        $id = $request->user()->id;

        $messages = ChatMessage::where(function ($query) use ($id, $userId) {
                $query->where('sender_id', $id)
                    ->where('receiver_id', $userId);
            })
            ->orWhere(function ($query) use ($id, $userId) {
                $query->where('sender_id', $userId)
                    ->where('receiver_id', $id);
            })
            ->orderBy('created_at')
            ->get();

        ChatMessage::where('sender_id', $userId)
            ->where('receiver_id', $id)
            ->update([
                'is_read' => true,
            ]);

        return response()->json($messages);
    }

    public function sendMessage(Request $request, $userId)
    {
        $data = $request->validate([
            'message' => 'required|string|max:2000',
            'repair_request_id' => 'nullable|integer',
        ]);

        $message = ChatMessage::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $userId,
            'repair_request_id' => $data['repair_request_id'] ?? null,
            'message' => $data['message'],
        ]);

        FixoraNotification::create([
            'user_id' => $userId,
            'title' => 'New message',
            'message' => $request->user()->name . ' sent you a message.',
            'type' => 'message',
        ]);

        return response()->json($message, 201);
    }

    public function notifications(Request $request)
    {
        return response()->json(
            FixoraNotification::where('user_id', $request->user()->id)
                ->orderByDesc('created_at')
                ->limit(50)
                ->get()
        );
    }

    public function markNotificationRead(Request $request, $id)
    {
        FixoraNotification::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->update([
                'is_read' => true,
            ]);

        return response()->json([
            'success' => true,
        ]);
    }

    public function recommended()
    {
        $repairers = User::where('role', 'repairer')
            ->where('verification_status', 'verified')
            ->with('repairerProfile')
            ->withCount([
                'repairRequestsAsRepairer as completed_repairs_count' => function ($query) {
                    $query->where('status', 'completed');
                },
            ])
            ->get()
            ->sortByDesc(function ($user) {
                $repairs = $user->completed_repairs_count ?? 0;

                return $repairs;
            })
            ->values()
            ->take(6);

        return response()->json($repairers);
    }

    public function adminDashboard(Request $request)
    {
        abort_unless($request->user()->role === 'admin', 403);

        return response()->json([
            'users' => DB::table('users')->count(),

            'customers' => DB::table('users')
                ->where('role', 'customer')
                ->count(),

            'repairers' => DB::table('users')
                ->where('role', 'repairer')
                ->count(),

            'verified_repairers' => DB::table('users')
                ->where('role', 'repairer')
                ->where('verification_status', 'verified')
                ->count(),

            'pending_verification' => DB::table('users')
                ->where('role', 'repairer')
                ->where('verification_status', 'pending')
                ->count(),

            'requests' => DB::table('repair_requests')->count(),

            'completed_requests' => DB::table('repair_requests')
                ->where('status', 'completed')
                ->count(),

            'reports' => DB::table('reports')
                ->where('status', 'pending')
                ->count(),
        ]);
    }
}


