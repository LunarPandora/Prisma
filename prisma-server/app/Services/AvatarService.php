<?php

namespace App\Services;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class AvatarService
{
    protected ImageManager $manager;

    public function __construct()
    {
        $this->manager = ImageManager::usingDriver(Driver::class);
    }

    /**
     * Process uploaded avatar
     */
    public function processUpload($file): string
    {
        $filename = 'avatars/' . Str::uuid() . '.webp';

        $image = $this->manager->decode($file)->cover(256, 256);
        $encoded = $image->encodeUsingFileExtension('webp', 70);

        Storage::disk('public')->put($filename, (string) $encoded);
        return Storage::url($filename);
    }

    /**
     * Generate initials avatar (returns binary)
     */
    public function generateInitials(string $name): string
    {
        $initials = collect(explode(' ', trim($name)))
            ->map(fn($word) => strtoupper(substr($word, 0, 1)))
            ->take(2)
            ->implode('');

        $colors = ['#0D8ABC', '#6A1B9A', '#00897B', '#F4511E', '#3949AB'];
        $colorIndex = crc32($name) % count($colors);
        $bgColor = $colors[$colorIndex];

        // Create blank canvas
        $image = $this->manager->createImage(256, 256);

        // Fill background
        $image->fill($bgColor);

        // Draw text
        $image->text($initials, 128, 128, function ($font) {
            $font->filename(public_path('fonts/inter-variable.ttf'));
            $font->size(100);
            $font->color('#ffffff');
            $font->align('center', 'center');
        });

        return $image->encodeUsingFileExtension('webp', 70);
    }

    /**
     * Delete avatar (safe)
     */
    public function delete(?string $avatarUrl): void
    {
        if (!$avatarUrl) return;

        $path = str_replace('/storage/', '', parse_url($avatarUrl, PHP_URL_PATH) ?? '');

        if (!$path) return;
        if (!str_starts_with($path, 'avatars/')) return;

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Replace avatar (clean swap)
     */
    public function replace(?string $oldAvatar, $file): string
    {
        $this->delete($oldAvatar);
        return $this->processUpload($file);
    }

    /**
     * Generate + store initials avatar.
     *
     * The filename embeds a hash of the current name so that renaming a
     * user produces a new file rather than returning the stale cached
     * image, and so that a recycled row id cannot inherit a previous
     * user's avatar.
     */
    public function generateAndStore(string $name, int $userId): string
    {
        $nameHash = substr(md5(trim($name)), 0, 8);
        $filename = "avatars/default_{$userId}_{$nameHash}.webp";

        if (!Storage::disk('public')->exists($filename)) {
            $image = $this->generateInitials($name);
            Storage::disk('public')->put($filename, (string) $image);
        }

        return Storage::url($filename);
    }

    /**
     * True if $avatarUrl points at a default-initials file that this
     * service generated (as opposed to an uploaded photo). Used so
     * rename flows can safely delete + regenerate without touching a
     * real uploaded picture.
     */
    public function isDefault(?string $avatarUrl): bool
    {
        if (!$avatarUrl) {
            return false;
        }

        $path = str_replace(
            '/storage/',
            '',
            parse_url($avatarUrl, PHP_URL_PATH) ?? ''
        );

        return str_starts_with($path, 'avatars/default_');
    }

    /**
     * Return an avatar URL suitable for storing on a fresh record. If
     * $uploadedFile is present, upload it. Otherwise generate a fresh
     * initials avatar for this (name, id) pair.
     */
    public function ensureDefault(?string $name, int $recordId, $uploadedFile = null): string
    {
        if ($uploadedFile) {
            return $this->processUpload($uploadedFile);
        }

        return $this->generateAndStore($name ?? '', $recordId);
    }

    /**
     * Rename hook: if the record's current avatar is one of ours
     * (default_<id>_<hash>.webp) and the name has changed, delete the
     * old file and return a freshly generated URL. If the avatar is an
     * uploaded photo or there's no change, return $oldAvatar unchanged.
     */
    public function refreshDefaultOnRename(?string $oldAvatar, ?string $newName, int $recordId): ?string
    {
        if (!$this->isDefault($oldAvatar)) {
            return $oldAvatar;
        }

        $newAvatar = $this->generateAndStore($newName ?? '', $recordId);

        if ($newAvatar !== $oldAvatar) {
            $this->delete($oldAvatar);
        }

        return $newAvatar;
    }
}