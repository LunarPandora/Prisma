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

    public function index()
    {
        return ProdiResource::collection(
            Prodi::select('prodi_id', 'nama_prodi')->orderBy('prodi_id')->paginate(10)
        );
    }

    public function create(Request $request)
    {
        try{
            $p = Prodi::create([
                'nama_prodi' => $request->nama_prodi,
            ]);

            return ApiResponse::success();
        }
        catch (\Exception $e) {
            \Log::error('Create failed: ' . $e->getMessage());
            return ApiResponse::failed();
        }
    }

    public function update(Request $request)
    {
        try{
            $p = Prodi::findOrFail($request->prodi_id);
            $p->update([
                'nama_prodi' => $request->nama_prodi
            ]);

            return ApiResponse::success();
        }
        catch (\Exception $e) {
            \Log::error('Update failed: ' . $e->getMessage());
            return ApiResponse::failed();
        }
    }

    public function delete(Request $request){
        try{
            $p = Prodi::findOrFail($request->id);
            $p->delete();
            
            return ApiResponse::success();
        }
        catch (\Exception $e) {
            \Log::error('Delete failed: ' . $e->getMessage());
            return ApiResponse::failed();
        }
    }
}
