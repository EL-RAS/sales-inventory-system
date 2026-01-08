<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Main SPA route (serves React app)
Route::get('/', function () {
    return view('welcome');
});
