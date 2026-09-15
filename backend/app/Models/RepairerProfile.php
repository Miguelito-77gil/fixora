<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RepairerProfile extends Model
{
    use HasFactory;

    protected $table = 'repairer_profiles';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'category',
        'bio',
        'years_experience',
        'location',
        'price',
        'phone',
        'photo_url',
        'available',
    ];

    protected $casts = [
        'years_experience' => 'integer',
        'price' => 'integer',
        'available' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
