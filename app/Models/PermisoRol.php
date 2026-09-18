<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PermisoRol extends Model
{
    protected $table = 'permisos_roles';

    protected $fillable = [
        'rol',
        'permiso',
        'permitido',
    ];

    protected $casts = [
        'permitido' => 'boolean',
    ];
}
