<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SyncLog extends Model
{
    protected $fillable = [
        'tipo',
        'referencia',
        'accion',
        'estado',
        'http_status',
        'error',
    ];
}
