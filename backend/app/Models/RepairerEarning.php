<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RepairerEarning extends Model
{
    protected $fillable = [
        'repairer_id',
        'repair_request_id',
        'amount',
        'status',
    ];
}
