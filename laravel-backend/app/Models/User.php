<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'verification_status',
        'phone',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function repairerProfile()
    {
        return $this->hasOne(RepairerProfile::class);
    }

    public function repairRequestsAsCustomer()
    {
        return $this->hasMany(RepairRequest::class, 'customer_id');
    }

    public function repairRequestsAsRepairer()
    {
        return $this->hasMany(RepairRequest::class, 'repairer_id');
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class, 'customer_id');
    }

    public function recentlyViewed()
    {
        return $this->hasMany(RecentlyViewed::class, 'customer_id');
    }

    public function sentMessages()
    {
        return $this->hasMany(ChatMessage::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(ChatMessage::class, 'receiver_id');
    }

    public function notifications()
    {
        return $this->hasMany(FixoraNotification::class);
    }

    public function repairerServices()
    {
        return $this->hasMany(RepairerService::class, 'repairer_id');
    }

    public function earnings()
    {
        return $this->hasMany(RepairerEarning::class, 'repairer_id');
    }
}
