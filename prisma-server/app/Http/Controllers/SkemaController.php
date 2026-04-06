<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Skema;

use App\Http\Resources\SkemaResource;
use App\Helpers\ApiResponse;

class SkemaController extends Controller
{
    public function fetch()
    {
        return Skema::select('skema_id', 'nama_skema')->orderBy('skema_id')->get();
    }

    public function index()
    {
        return SkemaResource::collection(
            Skema::withTrashed()->orderBy('skema_id')->paginate(10)
        );
    }

    public function create(Request $request)
    {
        try{
            $s = Skema::create([
                'nama_skema' => $request->nama_skema,
                'jenis' => $request->jenis,
                'keterangan' => $request->keterangan,
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
            $s = Skema::findOrFail($request->skema_id);
        
            $s->update([
                'nama_skema' => $request->nama_skema,
                'jenis' => $request->jenis,
                'keterangan' => $request->keterangan
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
            $s = Skema::findOrFail($request->id);
            $s->delete();
        }
        catch (\Exception $e) {
            \Log::error('Delete failed: ' . $e->getMessage());
            return ApiResponse::failed();
        }
    }
}
