import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import EmptyState from "./EmptyState"

const STAGE_COLORS = [
    "#0197CA", "#026b93", "#C4161C", "#16a34a", "#9333ea",
    "#ea580c", "#0891b2", "#6d28d9", "#dc2626", "#2563eb",
]

function formatLabel(kode) {
    if (!kode) return kode
    return kode
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function WorkflowOverview({ data = {}, title = "Workflow Overview" }) {
    const chartData = Object.entries(data).map(([key, value]) => ({
        name: formatLabel(key),
        total: value,
    }))

    if (chartData.length === 0) {
        return (
            <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">{title}</h3>
                <EmptyState message="Belum ada data workflow" />
            </div>
        )
    }

    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">{title}</h3>
            <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 32 + 40)}>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
                    <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        stroke="#9ca3af"
                        width={130}
                    />
                    <Tooltip
                        formatter={(value) => [value, "Total"]}
                        contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                    />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={20}>
                        {chartData.map((_, index) => (
                            <Cell key={index} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
