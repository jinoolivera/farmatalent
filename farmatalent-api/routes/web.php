<?php

use App\Http\Controllers\ShareController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/compartir/turno/{id}', [ShareController::class, 'turno'])
    ->middleware('throttle:60,1')
    ->name('share.turno');
