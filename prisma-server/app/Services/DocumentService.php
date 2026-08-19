<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentService
{
    public function upload($file, string $folder = 'documents'): string
    {
        $date = now()->format('Ymd_His');

        $uuid = Str::uuid()->toString();
        $short = substr($uuid, 0, 8);

        $extension = $file->getClientOriginalExtension() ?: 'pdf';

        $name = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $slug = Str::slug($name);

        $filename = "{$slug}_{$date}_{$short}.{$extension}";
        $path = "{$folder}/{$filename}";

        Storage::disk('public')->putFileAs(
            $folder,
            $file,
            $filename
        );

        return $path;
    }

    public function delete(?string $path): void
    {
        if (!$path) return;

        if (!Str::startsWith($path, 'documents/')) return;

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    public function replace(?string $oldFile, $newFile): string
    {
        $this->delete($oldFile);
        return $this->upload($newFile);
    }
}