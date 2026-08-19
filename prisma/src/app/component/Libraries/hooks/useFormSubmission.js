"use client"

import { useState, useCallback, useRef } from "react"
import { showToast } from "@/app/component/Toast/Toast"

export function useFormSubmission({ onSuccess, onError }) {
    const [loading, setLoading] = useState(false)
    const isSubmitting = useRef(false)

    const submit = useCallback(async (apiCall, options = {}) => {
        if (isSubmitting.current) return false

        isSubmitting.current = true
        setLoading(true)

        try {
            const res = await apiCall()

            if (res.data?.status === "success") {
                if (options.successMessage) {
                    showToast(options.successMessage, "success")
                }
                onSuccess?.(res)
                return { success: true, data: res.data }
            } else {
                const msg = res.data?.message || "Terjadi kesalahan."
                showToast(msg, "error")
                onError?.(res)
                return { success: false, data: res.data }
            }
        } catch (err) {
            if (err.response?.status === 422) {
                const serverErrors = err.response.data?.errors || {}
                const fieldErrors = {}

                for (const [field, messages] of Object.entries(serverErrors)) {
                    const msg = Array.isArray(messages) ? messages[0] : messages
                    fieldErrors[field] = translateErrorMessage(msg)
                }

                if (Object.keys(fieldErrors).length > 0) {
                    const firstError = Object.values(fieldErrors)[0]
                    showToast(firstError, "error")
                } else {
                    showToast("Data tidak valid. Periksa kembali isian Anda.", "error")
                }

                onError?.(err, fieldErrors)
                return { success: false, errors: fieldErrors }
            }

            const msg = err.response?.data?.message || options.errorMessage || "Terjadi kesalahan pada sistem."
            showToast(msg, "error")
            onError?.(err)
            return { success: false, error: err }
        } finally {
            setLoading(false)
            isSubmitting.current = false
        }
    }, [onSuccess, onError])

    return { loading, submit }
}

function translateErrorMessage(msg) {
    if (!msg) return "Data tidak valid."

    const translations = {
        "The email has already been taken.": "Email ini sudah digunakan.",
        "The selected role is invalid.": "Role pengguna tidak valid.",
        "The selected status is invalid.": "Status pengguna tidak valid.",
        "The password must be at least 8 characters.": "Password minimal 8 karakter.",
        "The email field is required.": "Email wajib diisi.",
        "The password field is required.": "Password wajib diisi.",
        "The name field is required.": "Nama wajib diisi.",
        "The file type is not allowed.": "Format file tidak didukung.",
        "The nim has already been taken.": "NIM ini sudah terdaftar.",
        "The nim field is required.": "NIM wajib diisi.",
        "The nidn has already been taken.": "NIDN ini sudah terdaftar.",
        "The nuptk has already been taken.": "NUPTK ini sudah terdaftar.",
        "The nama_prodi has already been taken.": "Nama prodi ini sudah digunakan.",
        "The nama_prodi field is required.": "Nama prodi wajib diisi.",
        "The kaprodi_id field is required.": "Kaprodi wajib dipilih.",
        "NIDN atau NUPTK wajib diisi salah satu.": "NIDN atau NUPTK wajib diisi salah satu.",
    }

    return translations[msg] || msg
}
