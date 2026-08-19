export const dynamic = 'force-dynamic'

import { useUserStore } from "@/app/stores/useUserStore"
import SuperadminDashboard from "./components/SuperadminDashboard"
import StaffDashboard from "./components/StaffDashboard"
import KetuaDashboard from "./components/KetuaDashboard"
import DosenDashboard from "./components/DosenDashboard"
import ReviewerDashboard from "./components/ReviewerDashboard"

const dashboardMap = {
    Superadmin: SuperadminDashboard,
    "Staff LPPM": StaffDashboard,
    "Ketua LPPM": KetuaDashboard,
    Dosen: DosenDashboard,
    Reviewer: ReviewerDashboard,
}

export default function Home() {
    const user = useUserStore((s) => s.user)
    const DashboardComponent = dashboardMap[user?.role]

    if (!DashboardComponent) {
        return (
            <div className="flex items-center justify-center p-12">
                <p className="text-sm text-gray-500">Role tidak dikenali.</p>
            </div>
        )
    }

    return <DashboardComponent />
}
