<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * PostAttachmentController
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles the "edit post" form (demo §3).
 *
 * Accepted fields:
 *   title                  — updated post title
 *   files[]                — new files to attach
 *   remove_attachments[]   — IDs of existing attachments to delete
 *
 * Route:  POST /posts/{post}
 * Name:   posts.update
 */
class PostAttachmentController extends Controller
{
    public function update(Request $request, Post $post): RedirectResponse
    {
        // $this->authorize('update', $post);  // uncomment when using policies

        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'files' => ['nullable', 'array'],
            'files.*' => [
                'file',
                'max:51200',
                'mimes:jpg,jpeg,png,gif,webp,svg,mp4,mov,avi,pdf,doc,docx,xls,xlsx,csv,txt',
            ],
            'remove_attachments' => ['nullable', 'array'],
            'remove_attachments.*' => ['integer', 'exists:attachments,id'],
        ]);

        // ── 1. Update title ───────────────────────────────────────────────────
        $post->update(['title' => $request->input('title')]);

        // ── 2. Remove requested attachments ──────────────────────────────────
        if ($request->filled('remove_attachments')) {
            // Scope to this post only so users can't delete another post's files.
            Attachment::whereIn('id', $request->input('remove_attachments'))
                ->where('post_id', $post->id)
                ->get()
                ->each(fn (Attachment $a) => $a->delete()); // observer deletes file
        }

        // ── 3. Store new files ────────────────────────────────────────────────
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store("posts/{$post->id}/attachments", 'public');

                Attachment::create([
                    'post_id' => $post->id,
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'label' => null,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Post updated successfully.');
    }
}
