<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RepairerService extends Model
{
    protected $fillable = [
        'repairer_id',
        'name',
        'description',
        'starting_price',
    ];
}
