<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleCategory extends Model
{
    use HasFactory;

    protected $primaryKey = 'code';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['code', 'name'];

    public $timestamps = false;

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'category', 'code');
    }

    public function tariffs()
    {
        return $this->hasMany(Tariff::class, 'vehicle_category', 'code');
    }
}