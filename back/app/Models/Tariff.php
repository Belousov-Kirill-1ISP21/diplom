<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tariff extends Model
{
    use HasFactory;

    protected $fillable = [
        'policy_type_id',
        'vehicle_category',
        'base_rate',
        'min_rate',
        'max_rate',
        'power_coefficient',
        'experience_coefficient',
        'age_coefficient',
        'bonus_malus_coefficient',
        'region_coefficient',
        'vehicle_age_coefficient',
        'security_coefficient',
        'franchise_coefficient',
        'calculation_method'
    ];

    protected $casts = [
        'base_rate' => 'decimal:2',
        'min_rate' => 'decimal:2',
        'max_rate' => 'decimal:2',
        'power_coefficient' => 'decimal:4',
        'experience_coefficient' => 'decimal:4',
        'age_coefficient' => 'decimal:4',
        'bonus_malus_coefficient' => 'decimal:4',
        'region_coefficient' => 'decimal:4',
        'vehicle_age_coefficient' => 'decimal:4',
        'security_coefficient' => 'decimal:4',
        'franchise_coefficient' => 'decimal:4'
    ];

    public $timestamps = false;

    public function policyType()
    {
        return $this->belongsTo(PolicyType::class);
    }

    public function vehicleCategory()
    {
        return $this->belongsTo(VehicleCategory::class, 'vehicle_category', 'code');
    }

    public function policies()
    {
        return $this->hasMany(Policy::class);
    }

    // Метод расчета цены
    public function calculatePrice(array $coefficients = [])
    {
        $finalCoefficient = 1.0;
        
        $coefficientFields = [
            'power_coefficient',
            'experience_coefficient', 
            'age_coefficient',
            'bonus_malus_coefficient',
            'region_coefficient',
            'vehicle_age_coefficient',
            'security_coefficient',
            'franchise_coefficient'
        ];
        
        foreach ($coefficientFields as $field) {
            $value = $coefficients[$field] ?? $this->$field;
            $finalCoefficient *= $value;
        }
        
        $price = $this->base_rate * $finalCoefficient;
        
        return min(max($price, $this->min_rate), $this->max_rate);
    }
}