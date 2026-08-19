export default function DashboardSection({ title, children, className = "" }) {
    return (
        <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>
            {title && (
                <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
                </div>
            )}
            <div className="p-4">
                {children}
            </div>
        </div>
    )
}
