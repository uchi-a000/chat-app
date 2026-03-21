<?php

namespace App\Http\Controllers;

use App\Http\Requests\Room\RoomRequest;
use App\Http\Resources\Room\RoomDetailResource;
use App\Http\Resources\Room\RoomsResource;
use App\Models\Room;
use App\UseCases\Room\RoomAction;
use App\UseCases\Room\RoomDetailAction;
use App\UseCases\Room\RoomsAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RoomController extends Controller
{
    public function index(Request $request, RoomsAction $action): AnonymousResourceCollection
    {
        $rooms = $action($request->user());

        return RoomsResource::collection($rooms);
    }

    public function store(RoomRequest $request, RoomAction $action): JsonResponse
    {
        $room = $action($request->user(), $request->validated());

        return (new RoomDetailResource($room))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, Room $room, RoomDetailAction $action): RoomDetailResource
    {
        $room = $action($request->user(), $room);

        return new RoomDetailResource($room);
    }
}
