<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Prodi;

use App\Http\Resources\ProdiResource;
use App\Helpers\ApiResponse;

class ProdiController extends Controller
{
    public function fetch()
    {
        return Prodi::select('prodi_id', 'nama_prodi')->orderBy('prodi_id')->get();
    }

    public function index(Request $request)
    {
        return ProdiResource::collection(
            Prodi::with(['kaprodi'])->orderBy('prodi_id')->get()
        );
    }

    public function create(Request $request)
    {
        $validated = $request->validate([
            'nama_prodi' => ['required', 'string', 'max:255', 'unique:prodi,nama_prodi'],
            'kaprodi_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $p = Prodi::create([
            'nama_prodi' => $validated['nama_prodi'],
            'kaprodi_id' => $validated['kaprodi_id'],
        ]);

        return ApiResponse::success();
    }

    public function update(Request $request)
    {
        $p = Prodi::findOrFail($request->prodi_id);

        $validated = $request->validate([
            'nama_prodi' => ['required', 'string', 'max:255', 'unique:prodi,nama_prodi,' . $p->prodi_id . ',prodi_id'],
            'kaprodi_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $p->update([
            'nama_prodi' => $validated['nama_prodi'],
            'kaprodi_id' => $validated['kaprodi_id'],
        ]);

        return ApiResponse::success();
    }

    public function delete(Request $request){
        $p = Prodi::findOrFail($request->id);
        $p->delete();
        
        return ApiResponse::success();
    }
}
