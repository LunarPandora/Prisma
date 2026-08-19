<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Models\PublicationCategory;
use Illuminate\Http\Request;

class PublicationCategoryController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Fetch
    |--------------------------------------------------------------------------
    */

    public function fetch()
    {
        try {
            $data = PublicationCategory::orderBy('urutan')
                ->orderBy('nama')
                ->get();

            return ApiResponse::success($data);

        } catch (\Exception $e) {

            \Log::error($e);

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    public function create(Request $request)
    {
        $validated = $request->validate([
            'nama'       => ['required', 'string', 'max:255'],
            'peringkat'  => ['nullable'],
            'urutan'     => ['nullable', 'integer', 'min:0'],
            'is_active'  => ['nullable', 'boolean'],
        ]);

        $validated['peringkat'] = json_decode(
            $request->input('peringkat', '[]'),
            true
        ) ?? [];

        $category = PublicationCategory::create([
            'nama' => $validated['nama'],
            'peringkat' => $validated['peringkat'],
            'urutan' => $validated['urutan'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return ApiResponse::success($category);
    }

    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    public function update(Request $request)
    {
        $validated = $request->validate([
            'pub_category_id' => ['required'],
            'nama'            => ['required', 'string', 'max:255'],
            'peringkat'       => ['nullable'],
            'urutan'          => ['nullable', 'integer', 'min:0'],
            'is_active'       => ['nullable', 'boolean'],
        ]);

        $validated['peringkat'] = json_decode(
            $request->input('peringkat', '[]'),
            true
        ) ?? [];

        $category = PublicationCategory::findOrFail($validated['pub_category_id']);
        $category->update([
            'nama' => $validated['nama'],
            'peringkat' => $validated['peringkat'],
            'urutan' => $validated['urutan'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return ApiResponse::success($category);
    }

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    public function delete($id)
    {
        try {

            $category = PublicationCategory::findOrFail($id);

            if ($category->publications()->exists()) {
                return ApiResponse::failed(
                    "Kategori publikasi masih digunakan."
                );
            }

            $category->delete();

            return ApiResponse::success();

        } catch (\Exception $e) {

            \Log::error($e);

            return ApiResponse::failed();
        }
    }
}