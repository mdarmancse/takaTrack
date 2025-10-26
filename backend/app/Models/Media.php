<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Media extends Model
{
    use HasFactory;

    protected $fillable = [
        'filename',
        'original_filename',
        'mime_type',
        'path',
        'url',
        'size',
        'width',
        'height',
        'alt_text',
        'title',
        'description',
        'metadata',
        'variants',
        'folder',
        'is_public',
        'uploaded_by',
    ];

    protected $casts = [
        'metadata' => 'array',
        'variants' => 'array',
        'is_public' => 'boolean',
    ];

    /**
     * Get the user who uploaded the media.
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Scope a query to only include public media.
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope a query to only include media in a specific folder.
     */
    public function scopeInFolder($query, $folder)
    {
        return $query->where('folder', $folder);
    }

    /**
     * Scope a query to only include media of a specific type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('mime_type', 'like', $type . '%');
    }

    /**
     * Get the file extension.
     */
    public function getExtensionAttribute()
    {
        return pathinfo($this->filename, PATHINFO_EXTENSION);
    }

    /**
     * Check if the media is an image.
     */
    public function isImage()
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    /**
     * Check if the media is a video.
     */
    public function isVideo()
    {
        return str_starts_with($this->mime_type, 'video/');
    }

    /**
     * Check if the media is a document.
     */
    public function isDocument()
    {
        return in_array($this->mime_type, [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ]);
    }
}