<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'state_number',
        'brand',
        'model',
        'manufacture_year',
        'power_hp',
        'category',
        'vin',
        'engine_volume',
        'purchase_price',
        'mileage',
        'has_tracker',
        'parking_type'
    ];

    protected $casts = [
        'manufacture_year' => 'integer',
        'power_hp' => 'integer',
        'engine_volume' => 'decimal:1',
        'purchase_price' => 'decimal:2',
        'mileage' => 'integer',
        'has_tracker' => 'boolean'
    ];

    public function client()
    {
        return $this->belongsTo(ClientProfile::class, 'client_id');
    }

    public function category()
    {
        return $this->belongsTo(VehicleCategory::class, 'category', 'code');
    }

    public function policies()
    {
        return $this->hasMany(Policy::class);
    }

    // Аксессор для полного названия авто
    public function getFullNameAttribute()
    {
        return "{$this->brand} {$this->model}";
    }

    // Аксессор для возраста авто
    public function getAgeAttribute()
    {
        return $this->manufacture_year ? now()->year - $this->manufacture_year : null;
    }
}