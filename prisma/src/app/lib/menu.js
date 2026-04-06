import { faUsersGear, faCalendarAlt, faChartLine } from '@fortawesome/free-solid-svg-icons'

import Users from "@/app/dashboard/pages/Users/page"
import PeriodeSkema from "@/app/dashboard/pages/PeriodeSkema/page"
import MonitoringPengajuan from '../dashboard/pages/MonitoringPengajuan/page'

// === Available Roles ===
// Admin
// Rektorat
// Kepala LPPM
// Dosen
// Reviewer

export const dashboardModules = [
  {
    key: "periodeskema",
    icon: faCalendarAlt,
    component: PeriodeSkema,
    label: "Periode Pengajuan",
    roles: [
			{
				name: "Admin",
				access: {
					create: true,
					read: true,
					update: true,
					delete: true
				}
			},
    ]
  },
  {
    key: "users",
    icon: faUsersGear,
    component: Users,
    label: "Daftar Pengguna",
    roles: [
			{
				name: "Admin",
				access: {
					create: true,
					read: true,
					update: true,
					delete: true
				}
			},        
    ]
  },
  {
    key: "monitoringpengajuan",
    icon: faChartLine,
    component: MonitoringPengajuan,
    label: "Monitoring Pengajuan",
    roles: [
			{
				name: "Admin",
				access: {
					create: true,
					read: true,
					update: true,
					delete: true
				}
			},
    ]
  },
]
  
export function getModuleAccess(moduleKey, role) {
  const module = dashboardModules.find(m => m.key === moduleKey)

  if (!module || !role) {
    return {
      create: false,
      read: false,
      update: false,
      delete: false
    }
  }

  const roleConfig = module.roles.find(r => r.name === role)

  return {
    create: roleConfig?.access?.create ?? false,
    read: roleConfig?.access?.read ?? false,
    update: roleConfig?.access?.update ?? false,
    delete: roleConfig?.access?.delete ?? false
  }
}