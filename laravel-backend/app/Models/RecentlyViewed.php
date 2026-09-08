<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecentlyViewed extends Model
{
    protected $fillable = ['customer_id', 'repairer_id', 'viewed_at'];

    protected $casts = [
        'viewed_at' => 'datetime',
    ];
}
