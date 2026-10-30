<?php

namespace App\Services;

use Cloudinary\Cloudinary;

class CloudinaryService
{
    public function upload($file, string $folder)
    {
        $cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => config('cloudinary.cloud_name'),
                'api_key' => config('cloudinary.api_key'),
                'api_secret' => config('cloudinary.api_secret'),
            ],
        ]);

        return $cloudinary
            ->uploadApi()
            ->upload($file->getRealPath(), [
                'folder' => $folder,
            ]);
    }
}