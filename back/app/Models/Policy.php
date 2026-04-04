<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Policy extends Model
{
    use HasFactory;

    protected $fillable = [
        'policy_number',
        'policy_type_id',
        'client_id',
        'vehicle_id',
        'tariff_id',
        'base_price',
        'final_price',
        'discount_amount',
        'start_date',
        'end_date',
        'status',
        'franchise_amount',
        'coverage_amount'
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'final_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'franchise_amount' => 'decimal:2',
        'coverage_amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'created_at' => 'datetime'
    ];

    public function policyType()
    {
        return $this->belongsTo(PolicyType::class);
    }

    public function client()
    {
        return $this->belongsTo(ClientProfile::class, 'client_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function tariff()
    {
        return $this->belongsTo(Tariff::class);
    }

    public function accidents()
    {
        return $this->hasMany(Accident::class);
    }

    // Scope для активных полисов
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                     ->where('start_date', '<=', now())
                     ->where('end_date', '>=', now());
    }

    // Проверка активности
    public function isActive()
    {
        return $this->status === 'active' && 
               $this->start_date <= now() && 
               $this->end_date >= now();
    }
}