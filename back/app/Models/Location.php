<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'citizenship_name',
        'region_name', 
        'city_name',
        'region_code'
    ];

    public $timestamps = false;

    public function clientProfiles()
    {
        return $this->hasMany(ClientProfile::class);
    }
}