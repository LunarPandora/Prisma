"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser } from '@fortawesome/free-solid-svg-icons'

import { useUserStore } from "@/app/stores/useUserStore"
import SelectInputMulti from "@/app/component/Inputs/SelectInputMulti"
import { fetchReviewer } from "@/app/component/Libraries/api/reviewer"
import UserTag from "@/app/component/Tags/UserTag"
import { assignReviewer, confirmAssignment } from "@/app/component/Libraries/api/penugasan"
import Button from "@/app/component/Inputs/Button"
import Modal from "@/app/component/Modal/Modal"
import { useFormSubmission } from "@/app/component/Libraries/hooks/useFormSubmission"

export default function FormPenugasanReviewer({ refresh, close, data }){
    const [selected, setSelected] = useState([])
    const [initialSelected, setInitialSelected] = useState([])

    const user = useUserStore(state => state.user)

    const { loading, submit } = useFormSubmission({
        onSuccess: () => {
            refresh()
            close('all')
        }
    })

    const addToSelection = (x) => {
        setSelected(prev => [...prev, x])
    }

    const removeFromSelection = (id) => {
        setSelected(prev => prev.filter(item => item.reviewer_id !== id))
    }

    async function setReviewer(){
        const formData = new FormData()
        let reviewers = []
        selected.map((val) => {
            reviewers.push(val.reviewer_id)
        })

        formData.append('proposal_id', data.proposal_id)

        if (data.reviewable_type) {
            formData.append('reviewable_type', data.reviewable_type)
            formData.append('reviewable_id', data.reviewable_id)
        }

        reviewers.forEach(id => formData.append('reviewer_id[]', id))

        await submit(
            () => assignReviewer(formData),
            {
                successMessage: "Draft reviewer berhasil disimpan.",
                errorMessage: "Gagal menyimpan draft reviewer.",
            }
        )
    }

    async function confirmPenugasan(){
        const formData = new FormData()
        formData.append('proposal_id', data.proposal_id)

        if (data.reviewable_type) {
            formData.append('reviewable_type', data.reviewable_type)
            formData.append('reviewable_id', data.reviewable_id)
        }

        selected.forEach(val => {
            formData.append('reviewer_id[]', val.reviewer_id)
        })

        await submit(
            () => confirmAssignment(formData),
            {
                successMessage: "Penugasan reviewer berhasil dikirim.",
                errorMessage: "Gagal mengirim penugasan reviewer.",
            }
        )
    }

    useEffect(() => {
        if (!data?.penugasan) return

        const reviewers = data.penugasan.map(val => ({
            reviewer_id: val.reviewer.id,
            nama: val.reviewer.nama,
            avatar: val.reviewer.avatar_url
        }))

        setSelected(reviewers)
        setInitialSelected(reviewers)
    }, [data])

    const hasChanges = () => {
        const current = selected.map(i => i.reviewer_id).sort()
        const initial = initialSelected.map(i => i.reviewer_id).sort()

        if (current.length !== initial.length) return true

        return current.some((val, i) => val !== initial[i])
    }

    const exactlyThree = selected.length === 3

    return (
        <Modal
            isOpen={true}
            onClose={() => close('this')}
            title="Penugasan Reviewer"
            maxWidth="max-w-2xl"
            closeOnBackdrop={false}
            footer={
                <div className="w-full grid grid-cols-3 gap-2">
                    <Button onClick={() => close('this')} variant="secondary">
                        Kembali
                    </Button> 
                    <Button onClick={() => setReviewer()} variant="secondary" disabled={!hasChanges() || loading || !exactlyThree}>
                        Simpan sebagai draft
                    </Button> 
                    <Button onClick={() => confirmPenugasan()} disabled={loading || !exactlyThree}>
                        {loading ? "Menyimpan..." : "Submit penugasan"}
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">
                        Pilih tepat 3 Reviewer
                    </p>
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded ${exactlyThree ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {selected.length}/3 dipilih
                    </span>
                </div>
                <div className="w-full grid grid-cols-1 gap-x-2 gap-y-4 h-fit">
                    <SelectInputMulti
                        icon={faUser}
                        dataSource={fetchReviewer}
                        placeholder={exactlyThree ? "Batas maksimum tercapai" : "Pilih reviewer yang ingin ditugaskan"}
                        selectedValues={selected.map(i => i.reviewer_id)}
                        maxCount={3}
                        transform={(item) => ({
                            text: `${item.nama} (${item.nidn || '-'}/${item.nuptk || '-'})`,
                            value: item.reviewer_id
                        })}
                        onSelect={({ mapped, raw }) => {
                            if(selected.find((item) => item.reviewer_id == raw.reviewer_id)){
                                removeFromSelection(raw.reviewer_id)
                            } else {
                                addToSelection(raw)
                            }
                        }}
                        before={(raw) => (
                            <Image
                                src={`${raw.avatar}`}
                                width={20}
                                height={20}
                                className="relative rounded-full"
                                alt={raw.nama || ""}
                                unoptimized
                            />
                        )}
                    />
                    <div className="flex gap-2 items-center">
                        { selected.map((val) => (
                            <UserTag 
                                img={val.avatar}
                                name={val.nama}
                                onRemove={() => removeFromSelection(val.reviewer_id)} 
                                key={val.reviewer_id}
                                readOnly={true}
                            />
                        )) }
                    </div>
                </div>
            </div>
        </Modal>
    )
}
