export function SummaryCardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-gray-200" />
            <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
                <div className="h-7 bg-gray-200 rounded w-12 mb-1" />
                <div className="h-2 bg-gray-100 rounded w-16" />
            </div>
        </div>
    )
}

export function ActionQueueSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                    <div className="h-6 w-12 bg-gray-200 rounded" />
                </div>
            ))}
        </div>
    )
}

export function ChartSkeleton() {
    return (
        <div className="flex items-end gap-2 h-40 animate-pulse px-4">
            {[40, 65, 50, 80, 35, 70, 55].map((h, i) => (
                <div key={i} className="flex-1 bg-gray-200 rounded-t" style={{ height: `${h}%` }} />
            ))}
        </div>
    )
}

export function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-start justify-between">
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="h-20 bg-gray-200 rounded w-64 animate-pulse" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <SummaryCardSkeleton key={i} />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
                    <ActionQueueSkeleton />
                </div>
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
                    <ChartSkeleton />
                </div>
            </div>
        </div>
    )
}
