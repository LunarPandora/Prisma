"use client"

import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faX, faPencil, faExternalLink, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons"
import { AnimatePresence, motion } from "framer-motion"

import TextInput from "@/app/component/Inputs/TextInput"
import Button from "@/app/component/Inputs/Button"
import UserTag from "@/app/component/Tags/UserTag"
import Badge from "@/app/component/Display/Badge"
import WorkflowProgress from "@/app/component/Display/WorkflowProgress"
import { LAPORAN_STATUS_COLORS } from "@/app/component/Libraries/config/statusColors"
import { useUserStore } from "@/app/stores/useUserStore"

export default function LaporanViewForm({ close, data, onKetuaApproveRejection, onKetuaRejectRejection }) {
    const user = useUserStore(state => state.user)

    const [showKetuaRejectReasonModal, setShowKetuaRejectReasonModal] = useState(false)
    const [showKetuaApproveReasonModal, setShowKetuaApproveReasonModal] = useState(false)
    const [ketuaRejectReason, setKetuaRejectReason] = useState("")
    const [ketuaApproveReason, setKetuaApproveReason] = useState("")

    if (!data) return null

    const detail = data.detail || {}
    const members = data.laporan_members || []
    const realisasiAnggaran = data.realisasi_anggaran || []
    const isKetua = user?.role === "Ketua LPPM"
    const hasRejection = detail.has_pending_diseminasi_rejection

    const formatCurrency = (value) => {
        if (!value && value !== 0) return "-"
        return `Rp ${Number(value).toLocaleString("id-ID")}`
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return "-"
        const d = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"))
        return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    }

    return (
        <motion.div
            key="laporanViewModal"
            initial={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 will-change-auto"
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-3xl bg-white rounded-xl flex flex-col max-h-[90vh] drop-shadow-lg will-change-auto"
                >
                    <div className="flex items-start justify-between p-6 pb-0">
                        <h3 className="text-xl font-medium">Detail Publikasi Laporan</h3>
                        <button onClick={() => close()} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <FontAwesomeIcon icon={faX} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">

                        {/* Workflow Progress */}
                        {data.jenis_penelitian && data.semester && data.kode_kegiatan && (
                            <div className="flex flex-col gap-2 border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <h3 className="font-medium text-sm text-gray-700 border-b pb-1 mb-1">
                                    Progress Workflow — {data.jenis_penelitian === 'PkM' ? 'PkM' : 'Penelitian'}
                                </h3>
                                <WorkflowProgress
                                    jenisPenelitian={data.jenis_penelitian}
                                    semester={data.semester}
                                    currentKode={data.kode_kegiatan}
                                    status={data.status}
                                />
                            </div>
                        )}

                        {/* Informasi Penelitian */}
                        <div className="flex flex-col gap-3">
                            <h3 className="font-medium text-sm text-gray-700 border-b pb-1">Informasi Penelitian</h3>

                            <TextInput
                                name="judul_penelitian"
                                placeholder="Judul Penelitian"
                                icon={faPencil}
                                value={detail.judul_penelitian || data.judul || "-"}
                                disabled
                            />

                            <TextInput
                                name="nama_jurnal"
                                placeholder="Nama Jurnal"
                                icon={faPencil}
                                value={detail.nama_jurnal || "-"}
                                disabled
                            />

                            {detail.link_jurnal ? (
                                <a
                                    href={detail.link_jurnal}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                >
                                    <FontAwesomeIcon icon={faExternalLink} />
                                    {detail.link_jurnal}
                                </a>
                            ) : (
                                <TextInput
                                    name="link_jurnal"
                                    placeholder="Link Jurnal"
                                    icon={faPencil}
                                    value="-"
                                    disabled
                                />
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <TextInput
                                    name="target_publikasi"
                                    placeholder="Kategori Publikasi"
                                    icon={faPencil}
                                    value={detail.target_publikasi || "-"}
                                    disabled
                                />

                                <TextInput
                                    name="masa_pelaksanaan"
                                    placeholder="Masa Pelaksanaan"
                                    icon={faPencil}
                                    value={
                                        detail.tgl_mulai && detail.tgl_selesai
                                            ? `${formatDate(detail.tgl_mulai)} - ${formatDate(detail.tgl_selesai)}`
                                            : "-"
                                    }
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Realisasi Biaya */}
                        <div className="flex flex-col gap-3">
                            <h3 className="font-medium text-sm text-gray-700 border-b pb-1">Realisasi Biaya</h3>

                            <div className="grid grid-cols-3 gap-3">
                                <TextInput
                                    name="realisasi_biaya_penelitian"
                                    placeholder="Biaya Penelitian"
                                    icon={faPencil}
                                    value={formatCurrency(detail.realisasi_biaya_penelitian)}
                                    disabled
                                />

                                <TextInput
                                    name="realisasi_biaya_publikasi"
                                    placeholder="Biaya Publikasi"
                                    icon={faPencil}
                                    value={formatCurrency(detail.realisasi_biaya_publikasi)}
                                    disabled
                                />

                                <TextInput
                                    name="realisasi_insentif"
                                    placeholder="Insentif"
                                    icon={faPencil}
                                    value={formatCurrency(detail.realisasi_insentif)}
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Anggota Peneliti */}
                        <div className="flex flex-col gap-2">
                            <h3 className="font-medium text-sm text-gray-700 border-b pb-1">Anggota Peneliti</h3>

                            {members.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">Tidak ada anggota</p>
                            ) : (
                                <div className="flex gap-1 flex-wrap">
                                    {members.map((m, i) => (
                                        <UserTag
                                            key={m.laporan_member_id || i}
                                            img={m.avatar || "/img/user_placeholder.webp"}
                                            name={`${m.nama || "-"} (${m.role})`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Realisasi Anggaran (Point F) */}
                        {realisasiAnggaran.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <h3 className="font-medium text-sm text-gray-700 border-b pb-1">Realisasi Anggaran</h3>

                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">Item Kebutuhan</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">Satuan</th>
                                        <th className="px-3 py-2 text-right font-medium text-gray-600">Harga Satuan</th>
                                        <th className="px-3 py-2 text-right font-medium text-gray-600">Jumlah</th>
                                        <th className="px-3 py-2 text-right font-medium text-gray-600">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {realisasiAnggaran.map((item, i) => (
                                        <tr key={item.realisasi_anggaran_id || i} className="border-t">
                                            <td className="px-3 py-2">{item.item_kebutuhan || "-"}</td>
                                            <td className="px-3 py-2">{item.satuan || "-"}</td>
                                            <td className="px-3 py-2 text-right">{formatCurrency(item.harga_satuan)}</td>
                                            <td className="px-3 py-2 text-right">{item.jumlah_item || "-"}</td>
                                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.total)}</td>
                                        </tr>
                                    ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Links */}
                        <div className="flex flex-col gap-2">
                            <h3 className="font-medium text-sm text-gray-700 border-b pb-1">Dokumen & Link</h3>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Link Publikasi", value: detail.link_publikasi },
                                    { label: "Link Laporan Akhir", value: detail.link_laporan_akhir },
                                    { label: "Link HKI", value: detail.link_hki },
                                    { label: "Link Buku", value: detail.link_buku },
                                    { label: "Link Poster", value: detail.link_poster },
                                    { label: "Link Video", value: detail.link_video },
                                ].filter(l => l.value).map((l) => (
                                    <a
                                        key={l.label}
                                        href={l.value}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                    >
                                        <FontAwesomeIcon icon={faExternalLink} />
                                        {l.label}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Catatan */}
                        {data.catatan && (
                            <div className="flex flex-col gap-1">
                                <h3 className="font-medium text-sm text-gray-700 border-b pb-1">Catatan</h3>
                                <div
                                    className="prose prose-sm max-w-none text-gray-600"
                                    dangerouslySetInnerHTML={{ __html: data.catatan }}
                                />
                            </div>
                        )}

                        {/* Diseminasi Acceptance Status */}
                        {data.kode_kegiatan?.startsWith("DISEMINASI") && (
                            <div className="flex flex-col gap-1 border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <h3 className="font-medium text-sm text-gray-700 border-b pb-1 mb-2">Status Persetujuan Diseminasi</h3>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Badge color={detail.ketua_diseminasi_approved ? 'green' : 'gray'} size="sm">
                                            Ketua LPPM: {detail.ketua_diseminasi_approved ? "✓ Disetujui" : "○ Belum Disetujui"}
                                        </Badge>
                                        <Badge
                                            color={detail.staff_diseminasi_approved ? 'green' : detail.has_pending_diseminasi_rejection ? 'red' : 'gray'}
                                            size="sm"
                                        >
                                            Staff LPPM: {detail.has_pending_diseminasi_rejection
                                                ? "✗ Menolak (Menunggu Persetujuan Ketua)"
                                                : detail.staff_diseminasi_approved ? "✓ Disetujui" : "○ Belum Disetujui"}
                                        </Badge>
                                    </div>
                                    {data.status && (
                                        <Badge
                                            color={LAPORAN_STATUS_COLORS[data.status]?.color || 'gray'}
                                            size="sm"
                                            className="w-fit"
                                        >
                                            {data.status}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reviewer Results */}
                        {data.penugasan && data.penugasan.length > 0 && (
                            <div className="flex flex-col gap-2 border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <h3 className="font-medium text-sm text-gray-700 border-b pb-1 mb-2">Hasil Review Reviewer</h3>
                                <div className="flex flex-col gap-4">
                                    {data.penugasan.map((p, idx) => (
                                        <div key={p.penugasan_id || idx} className="border border-gray-200 rounded-lg bg-white p-4 flex flex-col gap-3">
                                            {/* Reviewer Header */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {p.reviewer?.nama || "Reviewer"}
                                                    </span>
                                                    <Badge color={p.status_review === "Telah direview" ? 'green' : 'gray'} size="xs">
                                                        {p.status_review === "Telah direview" ? "✓ Selesai" : "○ Belum"}
                                                    </Badge>
                                                </div>
                                                {p.review?.keputusan && (
                                                    <Badge
                                                        color={
                                                            p.review.keputusan === "Diterima" ? 'green' :
                                                            p.review.keputusan === "Ditolak" ? 'red' : 'amber'
                                                        }
                                                        size="sm"
                                                    >
                                                        {p.review.keputusan}
                                                    </Badge>
                                                )}
                                            </div>

                                            {p.review && (
                                                <>
                                                    {/* Kriteria Penilaian */}
                                                    {p.review.kriteria_penilaian && p.review.kriteria_penilaian.length > 0 && (
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Penilaian</span>
                                                            <div className="border border-gray-100 rounded-md overflow-hidden">
                                                                <table className="w-full text-xs">
                                                                    <thead>
                                                                        <tr className="bg-gray-50 border-b border-gray-100">
                                                                            <th className="text-left px-3 py-1.5 font-medium text-gray-600">Kriteria</th>
                                                                            <th className="text-center px-3 py-1.5 font-medium text-gray-600 w-16">Bobot</th>
                                                                            <th className="text-center px-3 py-1.5 font-medium text-gray-600 w-16">Skor</th>
                                                                            <th className="text-center px-3 py-1.5 font-medium text-gray-600 w-16">Nilai</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {p.review.kriteria_penilaian.map((k, ki) => (
                                                                            <tr key={ki} className="border-b border-gray-50 last:border-0">
                                                                                <td className="px-3 py-1.5 text-gray-700">{k.kriteria}</td>
                                                                                <td className="px-3 py-1.5 text-center text-gray-500">{k.bobot}</td>
                                                                                <td className="px-3 py-1.5 text-center text-gray-500">{k.skor}</td>
                                                                                <td className="px-3 py-1.5 text-center font-medium text-gray-700">{k.nilai ?? (k.bobot * k.skor)}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                    <tfoot>
                                                                        <tr className="bg-gray-50 border-t border-gray-200">
                                                                            <td colSpan={3} className="px-3 py-1.5 font-medium text-gray-700 text-right">Total</td>
                                                                            <td className="px-3 py-1.5 text-center font-bold text-gray-700">{p.review.kriteria_penilaian.reduce((sum, k) => sum + (k.nilai ?? (k.bobot * k.skor)), 0)}</td>
                                                                        </tr>
                                                                    </tfoot>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Kriteria Kesesuaian Tema */}
                                                    {p.review.kriteria_kesesuaian_tema && p.review.kriteria_kesesuaian_tema.length > 0 && (
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Kesesuaian Tema</span>
                                                            <div className="flex flex-col gap-1.5">
                                                                {p.review.kriteria_kesesuaian_tema.map((item, ti) => (
                                                                    <label
                                                                        key={ti}
                                                                        className={`flex items-start gap-2.5 rounded-md px-3 py-2 text-sm ${
                                                                            item.checked
                                                                                ? 'bg-green-50 border border-green-200'
                                                                                : 'bg-gray-50 border border-gray-200'
                                                                        }`}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={item.checked}
                                                                            disabled
                                                                            readOnly
                                                                            className="mt-0.5 accent-green-600"
                                                                        />
                                                                        <span className={item.checked ? 'text-green-700' : 'text-gray-600'}>
                                                                            {item.question}
                                                                        </span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Catatan */}
                                                    {p.review.catatan && (
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Catatan</span>
                                                            <div
                                                                className="prose prose-xs max-w-none text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-md p-3"
                                                                dangerouslySetInnerHTML={{ __html: p.review.catatan }}
                                                            />
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pending Staff Rejection */}
                        {hasRejection && isKetua && (
                            <div className="flex flex-col gap-2 border border-red-200 bg-red-50 rounded-lg p-4">
                                <h3 className="font-medium text-sm text-red-700">Penolakan dari Staff LPPM</h3>
                                <div
                                    className="prose prose-sm max-w-none text-red-600"
                                    dangerouslySetInnerHTML={{ __html: detail.pending_rejection_reason || "Tidak ada catatan" }}
                                />
                                <div className="flex gap-2 mt-2">
                                    <Button
                                        variant="danger"
                                        onClick={() => {
                                            setKetuaRejectReason("")
                                            setShowKetuaRejectReasonModal(true)
                                        }}
                                        icon={faTimes}
                                    >
                                        Tolak Penolakan
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            setKetuaApproveReason(detail.pending_rejection_reason || "")
                                            setShowKetuaApproveReasonModal(true)
                                        }}
                                        icon={faCheck}
                                    >
                                        Setujui Penolakan
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Pending Return Request from Staff LPPM */}
                        {detail.has_pending_return_laporan && isKetua && (
                            <div className="flex flex-col gap-2 border border-orange-200 bg-orange-50 rounded-lg p-4">
                                <h3 className="font-medium text-sm text-orange-700">Permintaan Pengembalian dari Staff LPPM</h3>
                                <div
                                    className="prose prose-sm max-w-none text-orange-600"
                                    dangerouslySetInnerHTML={{ __html: detail.pending_return_laporan_reason || "Tidak ada catatan" }}
                                />
                                <div className="flex gap-2 mt-2">
                                    <Button
                                        variant="danger"
                                        onClick={() => {
                                            if (detail.pending_return_laporan_id) {
                                                onKetuaRejectRejection?.(detail.pending_return_laporan_id, "Permintaan pengembalian ditolak oleh Ketua LPPM")
                                            }
                                        }}
                                        icon={faTimes}
                                    >
                                        Tolak Pengembalian
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            if (detail.pending_return_laporan_id) {
                                                onKetuaApproveRejection?.(detail.pending_return_laporan_id, detail.pending_return_laporan_reason || "")
                                            }
                                        }}
                                        icon={faCheck}
                                    >
                                        Setujui Pengembalian
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Ketua Rejected the Staff's Rejection - shown to Staff */}
                        {detail.has_rejected_by_ketua && !isKetua && (
                            <div className="flex flex-col gap-2 border border-orange-200 bg-orange-50 rounded-lg p-4">
                                <h3 className="font-medium text-sm text-orange-700">Penolakan Ditolak oleh Ketua LPPM</h3>
                                <div
                                    className="prose prose-sm max-w-none text-orange-600"
                                    dangerouslySetInnerHTML={{ __html: detail.rejected_by_ketua_reason || "Tidak ada catatan" }}
                                />
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Ketua Reject Rejection - Reason Modal */}
            <AnimatePresence>
                {showKetuaRejectReasonModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-[70] will-change-auto"
                    >
                        <div className="bg-white rounded-xl w-full max-w-xl flex flex-col">
                            <div className="flex items-start justify-between p-6 pb-0">
                                <h3 className="text-xl font-medium">Tolak Penolakan Diseminasi</h3>
                                <button onClick={() => setShowKetuaRejectReasonModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <FontAwesomeIcon icon={faX} />
                                </button>
                            </div>
                            <div className="px-6 py-4">
                            <p className="text-gray-600">
                                Anda menolak penolakan Staff LPPM. Berikan alasan kepada Staff LPPM mengapa penolakan ini ditolak.
                            </p>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-600">Alasan Penolakan *</label>
                                <textarea
                                    value={ketuaRejectReason}
                                    onChange={(e) => setKetuaRejectReason(e.target.value)}
                                    placeholder="Tulis alasan penolakan di sini..."
                                    className="border border-gray-300 rounded-lg p-2 text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex gap-2 justify-end px-6 py-4 border-t border-gray-100">
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowKetuaRejectReasonModal(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        if (!ketuaRejectReason.trim()) return
                                        onKetuaRejectRejection?.(detail.pending_rejection_id, ketuaRejectReason)
                                        setShowKetuaRejectReasonModal(false)
                                        close()
                                    }}
                                >
                                    Tolak Penolakan
                                </Button>
                            </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ketua Approve Rejection - Modify Reason Modal */}
            <AnimatePresence>
                {showKetuaApproveReasonModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-[70] will-change-auto"
                    >
                        <div className="bg-white rounded-xl w-full max-w-xl flex flex-col">
                            <div className="flex items-start justify-between p-6 pb-0">
                                <h3 className="text-xl font-medium">Setujui Penolakan Diseminasi</h3>
                                <button onClick={() => setShowKetuaApproveReasonModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <FontAwesomeIcon icon={faX} />
                                </button>
                            </div>
                            <div className="px-6 py-4">
                            <p className="text-gray-600">
                                Laporan akan dikembalikan ke peneliti di tahap Publikasi. Anda dapat memodifikasi alasan penolakan sebelum dikirim ke peneliti.
                            </p>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-600">Alasan Penolakan (dapat diedit)</label>
                                <textarea
                                    value={ketuaApproveReason}
                                    onChange={(e) => setKetuaApproveReason(e.target.value)}
                                    placeholder="Alasan penolakan..."
                                    className="border border-gray-300 rounded-lg p-2 text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            </div>
                            <div className="flex gap-2 justify-end px-6 py-4 border-t border-gray-100">
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowKetuaApproveReasonModal(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        onKetuaApproveRejection?.(detail.pending_rejection_id, ketuaApproveReason)
                                        setShowKetuaApproveReasonModal(false)
                                        close()
                                    }}
                                >
                                    Setujui & Kembalikan ke Publikasi
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
