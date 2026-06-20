<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/health/live', function () {
    return response('ok', 200)->header('Content-Type', 'text/plain');
})->name('health.live');

Route::get('/health/ready', function () {
    try {
        DB::select('select 1');
    } catch (Throwable) {
        return response()->json(['status' => 'unready'], 503);
    }

    return response()->json(['status' => 'ready']);
})->name('health.ready');
