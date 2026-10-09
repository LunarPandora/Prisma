"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFlask, faHashtag, faBrain, faGlasses, faRupiahSign, faBook, faPencil, faAtom, faFileExport, faWallet, faMoneyBillWave, faBuildingUser, faMicroscope, faHandHoldingHand} from '@fortawesome/free-solid-svg-icons'

import TextInput from "@/app/component/Inputs/TextInput"
import SelectInput from "@/app/component/Inputs/SelectInput"
import Button from "@/app/component/Inputs/Button"
import Modal from "@/app/component/Modal/Modal"
import { showToast } from "@/app/component/Toast/Toast"

import { fetchKegiatan } from "@/app/component/Libraries/api/kegiatan"
import { addHalamanPengesahan, updateHalamanPengesahan } from "@/app/component/Libraries/api/proposal"
import { fetchListPublicationCategory } from "@/app/component/Libraries/api/kategoripublikasi"

import { useUserStore } from "@/app/stores/useUserStore";
import { jenisOptions, skemaPendanaanOptions } from "@/app/component/Libraries/options/selections"
import ResearcherManager from "@/app/component/Research/ResearchManager"

async function fetchTargetPublikasiOptions() {
    const categories = await fetchListPublicationCategory()
    const options = []
    for (const cat of categories) {
        if (!cat.is_active) continue
        const ranks = Array.isArray(cat.peringkat) ? cat.peringkat : []
        for (const rank of ranks) {
            const label = `${cat.nama} ${rank}`
            options.push({ text: label, value: label })
        }
    }
    return options
}

export default function FormProposal({ refresh, close, data, isEdit, skema }){
    const defaultForm = {
        proposal_id: "",
        judul: "",
        topik_penelitian: "",
        jenis_penelitian_gan: "Penelitian",
        jenis_penelitian_gen: "Penelitian",
        bidang_ilmu: "",
        fokus_sdgs: "",
        ra_biaya_penelitian_gan: "",
        ra_biaya_publikasi_gan: "",
        ra_insentif_gan: "",
        ra_biaya_penelitian_gen: "",
        ra_biaya_publikasi_gen: "",
        ra_insentif_gen: "",

        target_publikasi_gan: "",
        target_publikasi_gen: "",
        rencana_judul_publikasi_gan: "",
        rencana_judul_publikasi_gen: "",
        metopen_gan: "",
        metopen_gen: "",
        unit_analisis_gan: "",
        unit_analisis_gen: "",
        kontribusi_ilmu_makul: "",
        kontribusi_pkm: "",
        
        rencana_luaran: "",
        institusi_mitra: "",
        skema: "",
        sumber_skema: "",

        member_dosen_proposal: [],
        member_mhswa_proposal: [],
        member_kolab_proposal: [],
    }

    const [form, setForm] = useState(defaultForm)
    const [members, setMembers] = useState({
        ganjil: [],
        genap: []
    })

    const user = useUserStore(state => state.user)

    useEffect(() => {
        if (!user || isEdit) return

        const ketuaPeneliti = {
            id: user.id,
            type: "Dosen",
            nama: user.nama,
            avatar: user.avatar_url || user.avatar,
            ttjp: "Ketua Peneliti",
            locked: true
        }

        setMembers({
            ganjil: [{ ...ketuaPeneliti }],
            genap: [{ ...ketuaPeneliti }]
        })

    }, [user, isEdit])

    useEffect(() => {
        if (isEdit && data) {
            setForm(prev => ({
                ...prev,
                ...data,
            }))
        } else {
            setForm(defaultForm)
        }
    }, [isEdit, data])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    async function sendData(mode){
        try{
            /*
            |--------------------------------------------------------------------------
            | Input Validation
            |--------------------------------------------------------------------------
            | Fail fast with a friendly alert when a required field is empty.
            | We DO NOT close the modal and DO NOT reset the form — the user
            | fixes the missing field and re-tries.
            |--------------------------------------------------------------------------
            */

            const missing = []

            const required = {
                jenis_penelitian_gan: "Jenis penelitian (Ganjil)",
                jenis_penelitian_gen: "Jenis penelitian (Genap)",
                judul: "Judul proposal",
                topik_penelitian: "Topik penelitian",
                bidang_ilmu: "Bidang ilmu",
                sumber_skema: "Sumber pendanaan",

                target_publikasi_gan: "Target publikasi (semester ganjil)",
                target_publikasi_gen: "Target publikasi (semester genap)",
                rencana_judul_publikasi_gan: "Rencana judul publikasi (ganjil)",
                rencana_judul_publikasi_gen: "Rencana judul publikasi (genap)",

                metopen_gan: "Metodologi penelitian (ganjil)",
                metopen_gen: "Metodologi penelitian (genap)",
                unit_analisis_gan: "Unit analisis (ganjil)",
                unit_analisis_gen: "Unit analisis (genap)",

                ra_biaya_penelitian_gan: "Rencana anggaran biaya penelitian (ganjil)",
                ra_biaya_publikasi_gan: "Rencana anggaran biaya publikasi (ganjil)",
                ra_insentif_gan: "Rencana anggaran insentif (ganjil)",
                ra_biaya_penelitian_gen: "Rencana anggaran biaya penelitian (genap)",
                ra_biaya_publikasi_gen: "Rencana anggaran biaya publikasi (genap)",
                ra_insentif_gen: "Rencana anggaran insentif (genap)",
            }

            for (const [key, label] of Object.entries(required)) {
                const v = form[key]

                if (v === null || v === undefined || `${v}`.trim() === "") {
                    missing.push(label)
                }
            }

            if (mode === "submit" && members.ganjil.length < 1) {
                missing.push("Anggota peneliti (semester ganjil) — minimal 1")
            }
            if (mode === "submit" && members.genap.length < 1) {
                missing.push("Anggota peneliti (semester genap) — minimal 1")
            }

            if (missing.length > 0) {
                showToast("Formulir belum lengkap. Field berikut wajib diisi: " + missing.join(", "), "error")
                return
            }

            const formData = new FormData()
            Object.entries(form).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== "" && value !== "-") {
                    formData.append(key, value)
                }
            })

            if (skema?.skema_id) {
                formData.set("skema_id", skema.skema_id)
            }

            const serializeMembers = (type, semester, role) => {
                const key = memberConfig[type].key

                return members[type][semester].map(val => ({
                    id: val[key],
                    ttjp: val.ttjp,
                    semester:
                        semester === 'ganjil'
                            ? 'Ganjil'
                            : 'Genap',
                    role
                }))
            }

            const researcherList = [
                ...members.ganjil.map((item, index) => ({
                    id: item.id,
                    type: item.type,
                    nama: item.nama,
                    institusi: item.institusi,
                    prodi: item.prodi,
                    ttjp: item.ttjp,
                    semester: "Ganjil",
                    position: index + 1
                })),

                ...members.genap.map((item, index) => ({
                    id: item.id,
                    type: item.type,
                    nama: item.nama,
                    institusi: item.institusi,
                    prodi: item.prodi,
                    ttjp: item.ttjp,
                    semester: "Genap",
                    position: index + 1
                }))
            ]

            formData.append(
                "researcher_list",
                JSON.stringify(researcherList)
            )          

            if (form.uploaded_file instanceof File) {
                formData.append("uploaded_file", form.uploaded_file)
            }

            if (user.id){
                formData.append('user_id', user.id)
            }

            formData.append('mode', mode)

            const res = isEdit
                ? await updateHalamanPengesahan(formData)
                : await addHalamanPengesahan(formData)

            if (res.data.status == 'success'){ 
                showToast(`Sistem berhasil ${isEdit ? 'mengupdate' : 'mengajukan'} proposal!`, "success")
                refresh()
                close()
            }
            else {
                showToast(res.data.message || `Sistem gagal ${isEdit ? 'mengupdate' : 'mengajukan'} proposal!`, "error")
            }
        }
        catch(err){
            showToast(`Sistem gagal ${isEdit ? 'mengupdate' : 'mengajukan'} proposal dikarenakan error di sistem!`, "error")

            console.error(err)
        }
    }

    useEffect(() => {
        if (!data) return

        const buildMember = (val, type) => ({
            id:
                type === "Dosen"
                    ? val.user_id
                    : type === "Mahasiswa"
                        ? val.mhswa_id
                        : val.kolab_id,

            type,
            nama: val.nama,
            avatar: val.avatar_url || val.avatar,
            institusi: val.institusi ?? null,
            prodi: val.prodi ?? null,
            ttjp: val.ttjp || "",
            locked: false,
            position: val.position ?? 999
        })

        const grouped = {
            ganjil: [],
            genap: []
        }

        ;(data.member_dosen_proposal || []).forEach(val => {
            grouped[val.semester.toLowerCase()].push(
                buildMember(val, "Dosen")
            )
        })

        ;(data.member_mhswa_proposal || []).forEach(val => {
            grouped[val.semester.toLowerCase()].push(
                buildMember(val, "Mahasiswa")
            )
        })

        ;(data.member_kolab_proposal || []).forEach(val => {
            grouped[val.semester.toLowerCase()].push(
                buildMember(val, "Kolaborator")
            )
        })

        grouped.ganjil.sort((a, b) => a.position - b.position)
        grouped.genap.sort((a, b) => a.position - b.position)

        const injectKetua = (list) => {

            const exists = list.some(
                item =>
                    item.type === "Dosen"
                    &&
                    item.id === user?.id
            )

            if(exists){

                return list.map(item =>
                    item.id === user.id
                        ? {
                            ...item,
                            locked: true,
                            ttjp: item.ttjp || "Ketua Peneliti"
                        }
                        : item
                )
            }

            return [
                {
                    id: user.id,
                    type: "Dosen",
                    nama: user.nama,
                    avatar: user.avatar_url || user.avatar,
                    ttjp: "Ketua Peneliti",
                    locked: true
                },
                ...list
            ]
        }

        setMembers({
            ganjil: injectKetua(grouped.ganjil),
            genap: injectKetua(grouped.genap)
        })

    }, [data, user])

    return (
        <Modal
            isOpen={true}
            onClose={close}
            title={isEdit ? 'Update Proposal' : 'Ajukan Proposal Baru'}
            maxWidth="max-w-6xl"
            closeOnBackdrop={false}
            footer={
                <>
                    <Button variant="secondary" onClick={() => sendData('draft')}>
                        Simpan sebagai draft
                    </Button>
                    <Button onClick={() => sendData('submit')}>
                        {isEdit ? 'Update' : 'Submit'}
                    </Button>
                </>
            }
        >
            <div
                key="form_proposal"
                className="flex flex-col gap-3"
            >
                <div className="w-full grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-y-2 h-fit w-full border border-gray-300 rounded-md p-5 bg-white col-span-2">
                        <span className="text-gray-600 text-md font-medium text-lg">
                            Detail penelitian
                        </span>

                        <div className="w-full grid grid-cols-6 col-span-3 gap-2">
                            <TextInput
                                name="judul"
                                type="text"
                                placeholder="Masukkan judul proposal"
                                icon={faPencil}
                                value={form.judul}
                                onChange={handleChange}
                                className="col-span-6"
                            />

                            <TextInput
                                name="topik_penelitian" 
                                type="text"
                                placeholder="Masukkan topik penelitian"
                                icon={faHashtag}
                                value={form.topik_penelitian}
                                onChange={handleChange}
                                className="col-span-2"
                            />

                            <TextInput
                                name="bidang_ilmu" 
                                type="text"
                                placeholder="Masukkan bidang ilmu"
                                icon={faBrain}
                                value={form.bidang_ilmu}
                                onChange={handleChange}
                                className="col-span-2"
                            />

                            <TextInput
                                name="fokus_sdgs" 
                                type="text"
                                placeholder="Masukkan fokus SDGs"
                                icon={faGlasses}
                                value={form.fokus_sdgs}
                                onChange={handleChange}
                                className="col-span-2"
                            />

                            <TextInput
                                name="kontribusi_ilmu_makul" 
                                type="text"
                                placeholder="Masukkan kontribusi riset pada ilmu / matkul"
                                icon={faAtom}
                                value={form.kontribusi_ilmu_makul}
                                onChange={handleChange}
                                className="col-span-2"
                                isTextArea={true}
                            />

                            <TextInput
                                name="kontribusi_pkm" 
                                type="text"
                                placeholder="Masukkan kontribusi riset pada PKM"
                                icon={faHandHoldingHand}
                                value={form.kontribusi_pkm}
                                onChange={handleChange}
                                className="col-span-2"
                                isTextArea={true}
                            />

                            <TextInput
                                name="rencana_luaran" 
                                type="text"
                                placeholder="Masukkan rencana luaran (HKI, Buku, dsb)"
                                icon={faFileExport}
                                value={form.rencana_luaran}
                                onChange={handleChange}
                                className="col-span-2"
                                isTextArea={true}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-y-2 h-fit w-full border border-gray-300 rounded-md p-5 bg-white">
                        <span className="text-gray-600 text-md font-medium text-lg">
                            Rancangan Semester Ganjil
                        </span>

                        <SelectInput
                            name="jenis_penelitian_gan"
                            value={form.jenis_penelitian_gan}
                            onChange={handleChange}
                            options={jenisOptions}
                            icon={faFlask}
                            placeholder="Pilih jenis penelitian (ganjil)"
                        />

                        <SelectInput
                            name="target_publikasi_gan"
                            value={form.target_publikasi_gan}
                            onChange={handleChange}
                            dataSource={fetchTargetPublikasiOptions}
                            icon={faBook}
                            placeholder="Pilih target publikasi (ganjil)"
                        />

                        <TextInput
                            name="rencana_judul_publikasi_gan" 
                            type="text"
                            placeholder="Masukkan rencana judul publikasi (ganjil)"
                            icon={faPencil}
                            value={form.rencana_judul_publikasi_gan}
                            onChange={handleChange}
                        />

                        <TextInput
                            name="metopen_gan" 
                            type="text"
                            placeholder="Masukkan metode penelitian yang digunakan (ganjil)"
                            icon={faAtom}
                            value={form.metopen_gan}
                            onChange={handleChange}
                            isTextArea={true}
                        />

                        <TextInput
                            name="unit_analisis_gan" 
                            type="text"
                            placeholder="Masukkan unit analisis (ganjil)"
                            icon={faMicroscope}
                            value={form.unit_analisis_gan}
                            onChange={handleChange}
                        />

                        <span className="text-gray-600 text-md font-medium text-lg pt-5">
                            Anggota Peneliti
                        </span>

                        <ResearcherManager
                            value={members.ganjil}
                            onChange={(data) =>
                                setMembers(prev => ({
                                    ...prev,
                                    ganjil: data
                                }))
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-y-2 h-fit w-full border border-gray-300 rounded-md p-5 bg-white">
                        <span className="text-gray-600 text-md font-medium text-lg">
                            Rancangan Semester Genap
                        </span>

                        <SelectInput
                            name="jenis_penelitian_gen"
                            value={form.jenis_penelitian_gen}
                            onChange={handleChange}
                            options={jenisOptions}
                            icon={faFlask}
                            placeholder="Pilih jenis penelitian (genap)"
                        />

                        <SelectInput
                            name="target_publikasi_gen"
                            value={form.target_publikasi_gen}
                            onChange={handleChange}
                            dataSource={fetchTargetPublikasiOptions}
                            icon={faBook}
                            placeholder="Pilih target publikasi (genap)"
                        />

                        <TextInput
                            name="rencana_judul_publikasi_gen" 
                            type="text"
                            placeholder="Masukkan rencana judul publikasi (genap)"
                            icon={faPencil}
                            value={form.rencana_judul_publikasi_gen}
                            onChange={handleChange}
                        />

                        <TextInput
                            name="metopen_gen" 
                            type="text"
                            placeholder="Masukkan metode penelitian yang digunakan (genap)"
                            icon={faAtom}
                            value={form.metopen_gen}
                            onChange={handleChange}
                            isTextArea={true}
                        />

                        <TextInput
                            name="unit_analisis_gen" 
                            type="text"
                            placeholder="Masukkan unit analisis (genap)"
                            icon={faMicroscope}
                            value={form.unit_analisis_gen}
                            onChange={handleChange}
                        />

                        <span className="text-gray-600 text-md font-medium text-lg pt-5">
                            Anggota Peneliti
                        </span>

                        <ResearcherManager
                            value={members.genap}
                            onChange={(data) =>
                                setMembers(prev => ({
                                    ...prev,
                                    genap: data
                                }))
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-y-2 h-fit w-full border border-gray-300 rounded-md p-5 bg-white col-span-2">
                        <span className="text-gray-600 text-md font-medium text-lg">
                            Rencana Anggaran
                        </span>

                        <div className="w-full grid grid-cols-3 col-span-3 gap-2">
                            <SelectInput
                                name="skema"
                                value={form.skema}
                                onChange={handleChange}
                                options={skemaPendanaanOptions}
                                icon={faWallet}
                                placeholder="Pilih skema pendanaan"
                            />

                            <TextInput
                                name="sumber_skema" 
                                type="text"
                                placeholder="Masukkan sumber skema (Pemerintah, Yayasan, dsb)"
                                icon={faMoneyBillWave}
                                value={form.sumber_skema}
                                onChange={handleChange}
                            />

                            <TextInput
                                name="institusi_mitra" 
                                type="text"
                                placeholder="Masukkan nama institusi mitra (apabila ada)"
                                icon={faBuildingUser}
                                value={form.institusi_mitra}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="w-full grid grid-cols-2 gap-4 mt-2">
                            <div className="flex flex-col gap-y-2 border border-gray-200 rounded-md p-4 bg-gray-50">
                                <span className="text-gray-600 text-md font-medium">
                                    Semester Ganjil
                                </span>

                                <TextInput
                                    name="ra_biaya_penelitian_gan" 
                                    type="number"
                                    placeholder="Masukkan rencana anggaran Biaya Penelitian"
                                    icon={faRupiahSign}
                                    value={form.ra_biaya_penelitian_gan}
                                    onChange={handleChange}
                                />

                                <TextInput
                                    name="ra_biaya_publikasi_gan" 
                                    type="number"
                                    placeholder="Masukkan rencana anggaran Biaya Publikasi"
                                    icon={faRupiahSign}
                                    value={form.ra_biaya_publikasi_gan}
                                    onChange={handleChange}
                                />

                                <TextInput
                                    name="ra_insentif_gan" 
                                    type="number"
                                    placeholder="Masukkan rencana anggaran Insentif"
                                    icon={faRupiahSign}
                                    value={form.ra_insentif_gan}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="flex flex-col gap-y-2 border border-gray-200 rounded-md p-4 bg-gray-50">
                                <span className="text-gray-600 text-md font-medium">
                                    Semester Genap
                                </span>

                                <TextInput
                                    name="ra_biaya_penelitian_gen" 
                                    type="number"
                                    placeholder="Masukkan rencana anggaran Biaya Penelitian"
                                    icon={faRupiahSign}
                                    value={form.ra_biaya_penelitian_gen}
                                    onChange={handleChange}
                                />

                                <TextInput
                                    name="ra_biaya_publikasi_gen" 
                                    type="number"
                                    placeholder="Masukkan rencana anggaran Biaya Publikasi"
                                    icon={faRupiahSign}
                                    value={form.ra_biaya_publikasi_gen}
                                    onChange={handleChange}
                                />

                                <TextInput
                                    name="ra_insentif_gen" 
                                    type="number"
                                    placeholder="Masukkan rencana anggaran Insentif"
                                    icon={faRupiahSign}
                                    value={form.ra_insentif_gen}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
