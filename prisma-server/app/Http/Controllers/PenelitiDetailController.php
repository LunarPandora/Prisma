<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Models\Book;
use App\Models\Hki;
use App\Models\PenelitiDetail;
use App\Models\Publication;
use App\Models\ResearchHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PenelitiDetailController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Get My Detail
    |--------------------------------------------------------------------------
    */

    public function detail()
    {
        try {

            $user = Auth::user();

            $detail = PenelitiDetail::with([
                'publications.category',
                'books',
                'hkis',
                'researchHistories'
            ])->firstOrCreate([
                'user_id' => $user->id
            ]);

            $detail->nidn = $user->nidn;
            $detail->nuptk = $user->nuptk;

            return ApiResponse::success($detail);

        } catch (\Exception $e) {

            \Log::error($e);

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Update My Detail
    |--------------------------------------------------------------------------
    */

    public function update(Request $request)
    {
        try {

            $validated = $request->validate([
                'nidn' => ['nullable', 'string', 'max:50'],
                'nuptk' => ['nullable', 'string', 'max:50'],
                'jabatan' => ['nullable', 'string', 'max:255'],
                'pangkat_golongan' => ['nullable', 'string', 'max:100'],
                'no_hp' => ['nullable', 'string', 'max:30'],
                'sinta_id' => ['nullable', 'string', 'max:100'],
                'scopus_id' => ['nullable', 'string', 'max:100'],
                'google_scholar_id' => ['nullable', 'string', 'max:100'],
                'h_index' => ['nullable', 'numeric', 'min:0'],

                'publications' => ['nullable'],
                'books' => ['nullable'],
                'hkis' => ['nullable'],
                'research_histories' => ['nullable'],
            ]);

            DB::beginTransaction();

            $user = Auth::user();

            $user->update([
                'nidn' => $validated['nidn'] ?? null,
                'nuptk' => $validated['nuptk'] ?? null,
            ]);

            unset($validated['nidn']);
            unset($validated['nuptk']);

            $detail = PenelitiDetail::updateOrCreate(
                [
                    'user_id' => $user->id
                ],
                [
                    'jabatan' => $validated['jabatan'] ?? null,
                    'pangkat_golongan' => $validated['pangkat_golongan'] ?? null,
                    'no_hp' => $validated['no_hp'] ?? null,
                    'sinta_id' => $validated['sinta_id'] ?? null,
                    'scopus_id' => $validated['scopus_id'] ?? null,
                    'google_scholar_id' => $validated['google_scholar_id'] ?? null,
                    'h_index' => $validated['h_index'] ?? null,
                ]
            );

            \Log::info($request->all());

            \Log::info([
                'publications' => $request->input('publications'),
                'books' => $request->input('books'),
                'hkis' => $request->input('hkis'),
                'research_histories' => $request->input('research_histories'),
            ]);

            /*
            |--------------------------------------------------------------------------
            | Publications
            |--------------------------------------------------------------------------
            */

            $publications = json_decode(
                $request->input('publications', '[]'),
                true
            );

            Publication::where(
                'peneliti_detail_id',
                $detail->id
            )->delete();

            foreach ($publications as $item) {
                Publication::create([
                    'peneliti_detail_id' => $detail->id,
                    'jenis_jurnal' => $item['jenis_jurnal'] ?? null,
                    'pub_category_id' => $item['pub_category_id'] ?? null,
                    'peringkat' => $item['peringkat'] ?? null,
                    'judul' => $item['judul'] ?? null,
                    'peran' => $item['peran'] ?? null,
                    'nama_jurnal' => $item['nama_jurnal'] ?? null,
                    'tahun' => $item['tahun'] ?? null,
                    'volume' => $item['volume'] ?? null,
                    'issn' => $item['issn'] ?? null,
                    'doi' => $item['doi'] ?? null,
                    'url' => $item['url'] ?? null,
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Books
            |--------------------------------------------------------------------------
            */

            $books = json_decode(
                $request->input('books', '[]'),
                true
            );

            Book::where(
                'peneliti_detail_id',
                $detail->id
            )->delete();

            foreach ($books as $item) {
                Book::create([
                    'peneliti_detail_id' => $detail->id,
                    'judul' => $item['judul'] ?? null,
                    'tahun' => $item['tahun'] ?? null,
                    'isbn' => $item['isbn'] ?? null,
                    'penerbit' => $item['penerbit'] ?? null,
                    'url' => $item['url'] ?? null,
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Hki
            |--------------------------------------------------------------------------
            */

            $hkis = json_decode(
                $request->input('hkis', '[]'),
                true
            );

            Hki::where(
                'peneliti_detail_id',
                $detail->id
            )->delete();

            foreach ($hkis as $item) {
                Hki::create([
                    'peneliti_detail_id' => $detail->id,
                    'judul' => $item['judul'] ?? null,
                    'tahun' => $item['tahun'] ?? null,
                    'jenis' => $item['jenis'] ?? null,
                    'nomor' => $item['nomor'] ?? null,
                    'status' => $item['status'] ?? null,
                    'url' => $item['url'] ?? null,
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Research Histories
            |--------------------------------------------------------------------------
            */

            $researchHistories = json_decode(
                $request->input('research_histories', '[]'),
                true
            );

            ResearchHistory::where(
                'peneliti_detail_id',
                $detail->id
            )->delete();

            foreach ($researchHistories as $item) {
                ResearchHistory::create([
                    'peneliti_detail_id' => $detail->id,
                    'kategori' => $item['kategori'] ?? null,
                    'judul' => $item['judul'] ?? null,
                    'tahun' => $item['tahun'] ?? null,
                    'dana_disetujui' => $item['dana_disetujui'] ?? null,
                ]);
            }

            DB::commit();

            $detail = PenelitiDetail::with([
                'publications.category',
                'books',
                'hkis',
                'researchHistories'
            ])->find($detail->id);

            $detail->nidn = $user->nidn;
            $detail->nuptk = $user->nuptk;

            return ApiResponse::success($detail);

        } catch (\Exception $e) {

            DB::rollBack();

            \Log::error($e);

            return ApiResponse::failed();
        }
    }
}