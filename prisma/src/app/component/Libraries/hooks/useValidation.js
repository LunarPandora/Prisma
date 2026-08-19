"use client"

import { useState, useCallback } from "react"

const VALIDATORS = {
    required: (value, label) => {
        if (value === null || value === undefined || `${value}`.trim() === "") {
            return `${label} wajib diisi.`
        }
        return null
    },
    email: (value, label) => {
        if (!value) return null
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!regex.test(value)) {
            return `${label} tidak valid.`
        }
        return null
    },
    minLength: (min) => (value, label) => {
        if (!value) return null
        if (`${value}`.length < min) {
            return `${label} minimal ${min} karakter.`
        }
        return null
    },
    maxLength: (max) => (value, label) => {
        if (!value) return null
        if (`${value}`.length > max) {
            return `${label} maksimal ${max} karakter.`
        }
        return null
    },
    minValue: (min) => (value, label) => {
        if (value === null || value === undefined || value === "") return null
        const num = Number(value)
        if (isNaN(num) || num < min) {
            return `${label} minimal ${min}.`
        }
        return null
    },
    maxValue: (max) => (value, label) => {
        if (value === null || value === undefined || value === "") return null
        const num = Number(value)
        if (isNaN(num) || num > max) {
            return `${label} maksimal ${max}.`
        }
        return null
    },
    pattern: (regex, message) => (value, label) => {
        if (!value) return null
        if (!regex.test(value)) {
            return message || `${label} tidak valid.`
        }
        return null
    },
    file: (options = {}) => (value, label) => {
        if (!value) {
            if (options.required) return `${label} wajib diisi.`
            return null
        }

        if (options.accept) {
            const types = Array.isArray(options.accept) ? options.accept : [options.accept]
            const fileType = value.type || ""
            const fileName = value.name || ""
            const matchesType = types.some(t => fileType === t || fileType.startsWith(t.replace("/*", "/")))
            const matchesExt = types.some(t => {
                const ext = t.replace(".", "").replace("/*", "")
                return fileName.toLowerCase().endsWith(`.${ext}`)
            })
            if (!matchesType && !matchesExt) {
                return `Format file tidak didukung. Gunakan ${options.acceptLabel || options.accept}.`
            }
        }

        if (options.maxSize) {
            const maxBytes = options.maxSize * 1024 * 1024
            if (value.size > maxBytes) {
                return `Ukuran file maksimal ${options.maxSize} MB.`
            }
        }

        return null
    },
}

export function useValidation() {
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})

    const validateField = useCallback((name, value, rules, allValues = {}) => {
        for (const rule of rules) {
            let validator
            let label = name

            if (typeof rule === "string") {
                validator = VALIDATORS[rule]
            } else if (typeof rule === "object" && rule.validator) {
                validator = rule.validator
                if (rule.label) label = rule.label
            } else if (typeof rule === "function") {
                validator = rule
            }

            if (validator) {
                const error = validator(value, label)
                if (error) return error
            }
        }
        return null
    }, [])

    const validate = useCallback((fields, values) => {
        const newErrors = {}
        let firstErrorField = null

        for (const [name, rules] of Object.entries(fields)) {
            const error = validateField(name, values[name], rules, values)
            if (error) {
                newErrors[name] = error
                if (!firstErrorField) firstErrorField = name
            }
        }

        setErrors(newErrors)
        return { valid: Object.keys(newErrors).length === 0, errors: newErrors, firstErrorField }
    }, [validateField])

    const setFieldError = useCallback((name, error) => {
        setErrors(prev => ({ ...prev, [name]: error }))
    }, [])

    const clearFieldError = useCallback((name) => {
        setErrors(prev => {
            const next = { ...prev }
            delete next[name]
            return next
        })
    }, [])

    const clearAllErrors = useCallback(() => {
        setErrors({})
    }, [])

    const touchField = useCallback((name) => {
        setTouched(prev => ({ ...prev, [name]: true }))
    }, [])

    const resetTouched = useCallback(() => {
        setTouched({})
    }, [])

    return {
        errors,
        touched,
        validate,
        validateField,
        setFieldError,
        clearFieldError,
        clearAllErrors,
        touchField,
        resetTouched,
    }
}

export { VALIDATORS }
