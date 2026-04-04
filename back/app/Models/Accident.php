<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Accident extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'policy_id',
        'accident_date',
        'damage_amount',
        'is_client_fault',
        'description'
    ];

    protected $casts = [
        'accident_date' => 'date',
        'damage_amount' => 'decimal:2',
        'is_client_fault' => 'boolean'
    ];

    public $timestamps = false;

    public function client()
    {
        return $this->belongsTo(ClientProfile::class, 'client_id');
    }

    public function policy()
    {
        return $this->belongsTo(Policy::class);
    }
}