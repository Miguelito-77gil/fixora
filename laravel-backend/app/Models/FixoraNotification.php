<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FixoraNotification extends Model
{
    protected $table = 'notifications';

    protected $fillable = [
        'user_id',
        'title',
        'message',
        'type',
        'is_read',
    ];
}
