<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RepairRequest extends Model
{
    use HasFactory;

    protected $table = 'repair_requests';

    public $timestamps = false;

    protected $fillable = [
        'customer_id',
        'repairer_id',
        'service',
        'description',
        'status',
        'created_at',
        'completed_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function repairer()
    {
        return $this->belongsTo(User::class, 'repairer_id');
    }

    public function review()
    {
        return $this->hasOne(Review::class, 'repair_request_id');
    }
}
