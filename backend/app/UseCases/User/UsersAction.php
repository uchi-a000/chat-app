<?php

namespace App\UseCases\User;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class UsersAction
{
    /**
     * @param  array{search?: string|null}  $data
     */
    public function __invoke(User $user, array $data): LengthAwarePaginator
    {
        $query = User::where('id', '!=', $user->id);

        if (! empty($data['search'])) {
            $search = $data['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('nickname', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('first_name')->paginate(20);
    }
}
