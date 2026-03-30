<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\UsersRequest;
use App\Http\Resources\User\UsersResource;
use App\UseCases\User\UsersAction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    public function index(UsersRequest $request, UsersAction $action): AnonymousResourceCollection
    {
        $users = $action($request->user(), $request->validated());

        return UsersResource::collection($users);
    }
}
