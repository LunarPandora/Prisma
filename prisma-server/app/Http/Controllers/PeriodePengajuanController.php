<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PeriodePengajuan;

use App\Http\Resources\PeriodePengajuanResource;
use App\Helpers\ApiResponse;

class PeriodePengajuanController extends Controller
{
    public function index()
    {
        return PeriodePengajuanResource::collection(
            PeriodePengajuan::with(['skema' => function($q) {
                $q->withTrashed()->select('nama_skema');
            }])
            ->orderBy('periode_id')
            ->paginate(10)
        );
    }

    public function create(Request $request)
    {
        try{
            $p = PeriodePengajuan::create([
                'skema_id' => $request->skema_id,
                'nama_periode' => $request->nama_periode,
                'tgl_mulai' => $request->tgl_mulai,
                'tgl_selesai' => $request->tgl_selesai,
                'status' => $request->status,
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
            $pp = PeriodePengajuan::findOrFail($request->periode_id);

            $pp->update([
                'skema_id' => $request->skema_id,
                'nama_periode' => $request->nama_periode,
                'tgl_mulai' => $request->tgl_mulai,
                'tgl_selesai' => $request->tgl_selesai,
                'status' => $request->status
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
            $pp = PeriodePengajuan::findOrFail($request->id);
            $pp->delete();

            return ApiResponse::success();
        }
        catch (\Exception $e) {
            \Log::error('Delete failed: ' . $e->getMessage());
            return ApiResponse::failed();
        }
    }
}
