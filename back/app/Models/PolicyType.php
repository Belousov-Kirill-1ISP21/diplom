<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PolicyType extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public $timestamps = false;

    public function tariffs()
    {
        return $this->hasMany(Tariff::class);
    }

    public function policies()
    {
        return $this->hasMany(Policy::class);
    }
}