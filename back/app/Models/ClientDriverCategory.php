<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientDriverCategory extends Model
{
    use HasFactory;

    protected $table = 'client_driver_categories';

    protected $fillable = [
        'client_profile_id',
        'category_code'
    ];

    public $timestamps = true;

    public function clientProfile()
    {
        return $this->belongsTo(ClientProfile::class, 'client_profile_id');
    }

    public function category()
    {
        return $this->belongsTo(VehicleCategory::class, 'category_code', 'code');
    }
}