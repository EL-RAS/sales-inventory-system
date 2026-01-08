<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'phone',
        'email',
        'address',
        'registration_date'
    ];

    protected $attributes = [
        'registration_date' => null, // سنعيينه في الـ Controller
    ];

    protected $casts = [
        'registration_date' => 'date'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($customer) {
            if (empty($customer->registration_date)) {
                $customer->registration_date = now()->toDateString();
            }
        });
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
