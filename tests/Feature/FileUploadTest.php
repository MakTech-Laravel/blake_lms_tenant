<?php

use App\Enums\RoleEnum;
use App\Models\Attachment;
use App\Models\Post;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');

    // The upload/post routes are permission-gated; a super-admin satisfies them
    // all via Gate::before so these tests exercise the upload behaviour itself.
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
    $user = User::factory()->create();
    $user->assignRole(RoleEnum::SUPER_ADMIN->value);

    $this->actingAs($user);
});

// ── upload.store (demos §1 & §2) ────────────────────────────────────────────

test('guests cannot upload files', function () {
    auth()->logout();

    $this->post(route('upload.store'), [
        'file' => UploadedFile::fake()->image('photo.jpg'),
    ])->assertRedirect(route('login'));
});

test('a standalone file is stored on disk and persisted', function () {
    $file = UploadedFile::fake()->image('photo.jpg', 640, 480);

    $this->post(route('upload.store'), [
        'label' => 'My photo',
        'file' => $file,
    ])->assertRedirect()->assertSessionHas('success');

    $attachment = Attachment::sole();

    expect($attachment->original_name)->toBe('photo.jpg')
        ->and($attachment->label)->toBe('My photo')
        ->and($attachment->post_id)->toBeNull()
        ->and($attachment->path)->toStartWith('uploads/');

    Storage::disk('public')->assertExists($attachment->path);
});

test('a file linked to a post is stored under the post directory', function () {
    $post = Post::factory()->create();

    $this->post(route('upload.store'), [
        'post_id' => $post->id,
        'file' => UploadedFile::fake()->image('linked.png'),
    ])->assertRedirect();

    $attachment = Attachment::sole();

    expect($attachment->post_id)->toBe($post->id)
        ->and($attachment->path)->toStartWith("posts/{$post->id}/attachments");
});

test('the file field is required', function () {
    $this->post(route('upload.store'), [])
        ->assertSessionHasErrors('file');

    expect(Attachment::count())->toBe(0);
});

test('files larger than 50 MB are rejected', function () {
    $this->post(route('upload.store'), [
        'file' => UploadedFile::fake()->create('huge.pdf', 51_201), // > 50 MB
    ])->assertSessionHasErrors('file');

    expect(Attachment::count())->toBe(0);
});

test('disallowed mime types are rejected', function () {
    $this->post(route('upload.store'), [
        'file' => UploadedFile::fake()->create('script.exe', 10),
    ])->assertSessionHasErrors('file');

    expect(Attachment::count())->toBe(0);
});

// ── posts.update (demo §3) ──────────────────────────────────────────────────

test('a post update can attach new files', function () {
    $post = Post::factory()->create(['title' => 'Original']);

    $this->post(route('posts.update', $post), [
        'title' => 'Updated title',
        'files' => [
            UploadedFile::fake()->image('a.jpg'),
            UploadedFile::fake()->image('b.jpg'),
        ],
    ])->assertRedirect()->assertSessionHas('success');

    $post->refresh();

    expect($post->title)->toBe('Updated title')
        ->and($post->attachments)->toHaveCount(2);

    $post->attachments->each(
        fn (Attachment $a) => Storage::disk('public')->assertExists($a->path)
    );
});

test('removing an attachment deletes the record and the physical file', function () {
    $post = Post::factory()->create();

    Storage::disk('public')->put('posts/keep.jpg', 'keep');
    Storage::disk('public')->put('posts/drop.jpg', 'drop');

    $keep = Attachment::factory()->for($post)->create(['path' => 'posts/keep.jpg']);
    $drop = Attachment::factory()->for($post)->create(['path' => 'posts/drop.jpg']);

    $this->post(route('posts.update', $post), [
        'title' => $post->title,
        'remove_attachments' => [$drop->id],
    ])->assertRedirect();

    expect(Attachment::find($drop->id))->toBeNull()
        ->and(Attachment::find($keep->id))->not->toBeNull();

    Storage::disk('public')->assertMissing('posts/drop.jpg');
    Storage::disk('public')->assertExists('posts/keep.jpg');
});

test('a post can only remove its own attachments', function () {
    $post = Post::factory()->create();
    $other = Post::factory()->create();

    Storage::disk('public')->put('posts/other.jpg', 'x');
    $foreign = Attachment::factory()->for($other)->create(['path' => 'posts/other.jpg']);

    $this->post(route('posts.update', $post), [
        'title' => $post->title,
        'remove_attachments' => [$foreign->id],
    ])->assertRedirect();

    // The foreign attachment must survive — it belongs to another post.
    expect(Attachment::find($foreign->id))->not->toBeNull();
    Storage::disk('public')->assertExists('posts/other.jpg');
});

test('the title is required when updating a post', function () {
    $post = Post::factory()->create();

    $this->post(route('posts.update', $post), ['title' => ''])
        ->assertSessionHasErrors('title');
});
