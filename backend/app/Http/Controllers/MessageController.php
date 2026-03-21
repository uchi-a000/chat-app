<?php

namespace App\Http\Controllers;

use App\Http\Requests\Message\MessageRequest;
use App\Http\Resources\Message\MessagesResource;
use App\Models\Room;
use App\UseCases\Message\MessageAction;
use App\UseCases\Message\MessagesAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MessageController extends Controller
{
    public function index(Request $request, Room $room, MessagesAction $action): AnonymousResourceCollection
    {
        $messages = $action($request->user(), $room);

        return MessagesResource::collection($messages);
    }

    public function store(MessageRequest $request, Room $room, MessageAction $action): JsonResponse
    {
        $message = $action($request->user(), $room, $request->validated());

        return (new MessagesResource($message))
            ->response()
            ->setStatusCode(201);
    }
}
