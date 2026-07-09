<?php

namespace Database\Factories;

use App\Models\Attachment;
use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Attachment>
 */
class AttachmentFactory extends Factory
{
    protected $model = Attachment::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->word().'.jpg';

        return [
            'post_id' => Post::factory(),
            'path' => 'posts/attachments/'.fake()->uuid().'.jpg',
            'original_name' => $name,
            'mime_type' => 'image/jpeg',
            'size' => fake()->numberBetween(1_000, 5_000_000),
            'label' => null,
        ];
    }
}
