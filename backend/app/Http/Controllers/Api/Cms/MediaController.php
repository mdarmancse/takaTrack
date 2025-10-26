<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Media::with(['uploader']);

        // Filter by folder
        if ($request->has('folder')) {
            $query->inFolder($request->folder);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        // Filter by public/private
        if ($request->has('is_public')) {
            $query->where('is_public', $request->boolean('is_public'));
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('filename', 'like', "%{$search}%")
                  ->orWhere('original_filename', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('alt_text', 'like', "%{$search}%");
            });
        }

        $media = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($media);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240', // 10MB max
            'folder' => 'nullable|string|max:100',
            'alt_text' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_public' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $file = $request->file('file');
        $folder = $request->input('folder', 'uploads');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs($folder, $filename, 'public');

        // Get file dimensions for images
        $width = null;
        $height = null;
        if (str_starts_with($file->getMimeType(), 'image/')) {
            $imageInfo = getimagesize($file->getPathname());
            if ($imageInfo) {
                $width = $imageInfo[0];
                $height = $imageInfo[1];
            }
        }

        $media = Media::create([
            'filename' => $filename,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'path' => $path,
            'url' => Storage::url($path),
            'size' => $file->getSize(),
            'width' => $width,
            'height' => $height,
            'alt_text' => $request->input('alt_text'),
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'folder' => $folder,
            'is_public' => $request->input('is_public', true),
            'uploaded_by' => Auth::id(),
        ]);

        return response()->json($media->load(['uploader']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Media $media): JsonResponse
    {
        return response()->json($media->load(['uploader']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Media $media): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'alt_text' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_public' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $media->update($request->validated());

        return response()->json($media->load(['uploader']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Media $media): JsonResponse
    {
        // Delete the file from storage
        if (Storage::disk('public')->exists($media->path)) {
            Storage::disk('public')->delete($media->path);
        }

        $media->delete();

        return response()->json(['message' => 'Media deleted successfully']);
    }

    /**
     * Get folders.
     */
    public function folders(): JsonResponse
    {
        $folders = Media::select('folder')
            ->distinct()
            ->pluck('folder')
            ->filter()
            ->values();

        return response()->json($folders);
    }

    /**
     * Get media types.
     */
    public function types(): JsonResponse
    {
        $types = Media::select('mime_type')
            ->distinct()
            ->pluck('mime_type')
            ->map(function ($mimeType) {
                return explode('/', $mimeType)[0];
            })
            ->unique()
            ->values();

        return response()->json($types);
    }

    /**
     * Upload multiple files.
     */
    public function uploadMultiple(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'files' => 'required|array|max:10',
            'files.*' => 'file|max:10240',
            'folder' => 'nullable|string|max:100',
            'is_public' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $uploadedMedia = [];

        foreach ($request->file('files') as $file) {
            $folder = $request->input('folder', 'uploads');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs($folder, $filename, 'public');

            // Get file dimensions for images
            $width = null;
            $height = null;
            if (str_starts_with($file->getMimeType(), 'image/')) {
                $imageInfo = getimagesize($file->getPathname());
                if ($imageInfo) {
                    $width = $imageInfo[0];
                    $height = $imageInfo[1];
                }
            }

            $media = Media::create([
                'filename' => $filename,
                'original_filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'path' => $path,
                'url' => Storage::url($path),
                'size' => $file->getSize(),
                'width' => $width,
                'height' => $height,
                'folder' => $folder,
                'is_public' => $request->input('is_public', true),
                'uploaded_by' => Auth::id(),
            ]);

            $uploadedMedia[] = $media->load(['uploader']);
        }

        return response()->json($uploadedMedia, 201);
    }
}