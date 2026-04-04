<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'email',
        'phone', 
        'password_hash',
        'user_type_id'
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    public function userType()
    {
        return $this->belongsTo(UserType::class);
    }

    public function clientProfile()
    {
        return $this->hasOne(ClientProfile::class, 'user_id');
    }
    
    public function vehicles()
    {
        return $this->hasManyThrough(Vehicle::class, ClientProfile::class, 'user_id', 'client_id');
    }
}