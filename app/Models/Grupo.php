<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grupo extends Model
{
    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'estado',
    ];
}