<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Room>
 */
class RoomFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => null,
            'is_group' => false,
        ];
    }

    public function group(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => fake()->words(2, true),
            'is_group' => true,
        ]);
    }
}
