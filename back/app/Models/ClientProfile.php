<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientProfile extends Model
{
    use HasFactory;

    protected $table = 'client_profiles';

    protected $fillable = [
        'user_id',
        'last_name',
        'first_name',
        'middle_name',
        'birth_date',
        'location_id',
        'document_type_id',
        'passport_series',
        'passport_number',
        'passport_issued_by',
        'passport_issue_date',
        'passport_expiry_date',
        'driver_license_series',
        'driver_license_number',
        'driver_license_issued_by',
        'driver_license_issue_date',
        'driver_license_expiry_date',
        'driver_categories',
        'driver_experience_years',
        'bonus_malus_class',
        'has_accidents_last_year'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'passport_issue_date' => 'date',
        'passport_expiry_date' => 'date',
        'driver_license_issue_date' => 'date',
        'driver_license_expiry_date' => 'date',
        'has_accidents_last_year' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function documentType()
    {
        return $this->belongsTo(DocumentType::class);
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'client_id');
    }

    public function policies()
    {
        return $this->hasMany(Policy::class, 'client_id');
    }

    public function accidents()
    {
        return $this->hasMany(Accident::class, 'client_id');
    }

    // Аксессор для полного имени
    public function getFullNameAttribute()
    {
        return "{$this->last_name} {$this->first_name} {$this->middle_name}";
    }

    // Аксессор для возраста
    public function getAgeAttribute()
    {
        return $this->birth_date ? $this->birth_date->age : null;
    }
}