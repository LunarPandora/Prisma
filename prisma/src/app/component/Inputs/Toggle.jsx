export default function Toggle({ label, description, checked = false, onChange, disabled = false }) {
    return (
        <div className={`flex items-center justify-between gap-4 ${disabled ? 'opacity-50' : ''}`}>
            <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                {description && (
                    <span className="text-xs text-gray-500">{description}</span>
                )}
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={`
                    relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
                    transition-colors duration-200 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-black/20 focus:ring-offset-2
                    disabled:cursor-not-allowed
                    ${checked ? 'bg-black' : 'bg-gray-300'}
                `}
            >
                <span
                    className={`
                        pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow
                        transform transition duration-200 ease-in-out
                        ${checked ? 'translate-x-6' : 'translate-x-1'}
                    `}
                />
            </button>
        </div>
    )
}
