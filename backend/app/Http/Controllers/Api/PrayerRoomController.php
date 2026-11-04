<?php

namespace App\Http\Controllers\Api;

use App\Actions\PrayerRoom\JoinPrayerRoomAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrayerRoomController extends Controller
{
    public function join(Request $request, JoinPrayerRoomAction $action): JsonResponse
    {
        return response()->json(['data' => ['token' => $action($request->user())]]);
    }
}
