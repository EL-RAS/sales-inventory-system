<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
  use HasApiTokens, HasFactory, Notifiable;

  protected $fillable = [
    'name',
    'email',
    'password',
    'role',
    'phone'
  ];

  protected $hidden = [
    'password',
    'remember_token',
  ];

  protected $casts = [
    'email_verified_at' => 'datetime',
    'password' => 'hashed'
  ];

  public function orders(): HasMany
  {
    return $this->hasMany(Order::class);
  }

  /**
   * Check if user has specific role
   */
  public function hasRole($role): bool
  {
    return $this->role === $role;
  }

  /**
   * Check if user has any of the given roles
   */
  public function hasAnyRole(array $roles): bool
  {
    return in_array($this->role, $roles);
  }
}
