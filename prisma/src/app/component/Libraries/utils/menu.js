import { faUsersGear, faCalendarAlt, faChartLine, faGraduationCap, faGear, faHandshake, faSchool, faFlask, faFolder, faBookOpen, faFileAlt, faMoneyBill, faClipboardList, faHouse, faBell } from '@fortawesome/free-solid-svg-icons'

import Home from "@/app/dashboard/pages/Home/page"
import Users from "@/app/dashboard/pages/Admin/Users/page"
import Kegiatan from "@/app/dashboard/pages/Admin/Skema/Kegiatan/page"
import MonitoringProgress from '../../../dashboard/pages/Dosen/MonitoringPengajuan/Proposal/page'
import Mahasiswa from '@/app/dashboard/pages/Admin/Mahasiswa/page'
import Pengaturan from '@/app/dashboard/pages/Admin/Pengaturan/page'
import Kolaborator from '@/app/dashboard/pages/Admin/Kolaborator/page'
import Prodi from '@/app/dashboard/pages/Admin/Prodi/page'
import ListPengajuanReviewer from '@/app/dashboard/pages/Reviewer/Review/page'
import Skema from '@/app/dashboard/pages/Admin/Skema/page'
import MonitoringPengajuan from '@/app/dashboard/pages/Admin/MonitoringPengajuan/page'
import DosenMonitoringPengajuan from '@/app/dashboard/pages/Dosen/MonitoringPengajuan/page'
import AdminMonitoringPengajuan from '@/app/dashboard/pages/Admin/MonitoringPengajuan/page'
import ProfilDosen from '@/app/dashboard/pages/Dosen/Profil/page'
import GoogleScholar from '@/app/dashboard/pages/Dosen/GoogleScholar/page'

import KetuaCriteria from '@/app/dashboard/pages/Ketua/Criteria/page'
import KetuaPengaturan from '@/app/dashboard/pages/Ketua/Pengaturan/page'
import NotificationHistory from '@/app/dashboard/pages/Notification/page'

// === Available Roles ===
// Superadmin
// Staff LPPM
// Ketua LPPM
// Rektorat
// Dosen
// Reviewer

export const dashboardModules = [
  // =========================================================================
  //   HOME — Role-specific dashboard overview
  // =========================================================================
  {
    key: "home",
    icon: faHouse,
    component: Home,
    label: "Beranda",
    hidden: false,
    roles: [
      {
        name: "Superadmin",
        access: { create: false, read: true, update: false, delete: false }
      },
      {
        name: "Staff LPPM",
        access: { create: false, read: true, update: false, delete: false }
      },
      {
        name: "Ketua LPPM",
        access: { create: false, read: true, update: false, delete: false }
      },
      {
        name: "Dosen",
        access: { create: false, read: true, update: false, delete: false }
      },
      {
        name: "Reviewer",
        access: { create: false, read: true, update: false, delete: false }
      },
    ]
  },
  // =========================================================================
  //   NOTIFICATION HISTORY — Accessible to all roles via deep link
  // =========================================================================
  {
    key: "notifications",
    icon: faBell,
    component: NotificationHistory,
    label: "Notifikasi",
    hidden: true,
    roles: [
      {
        name: "Superadmin",
        access: { create: false, read: true, update: false, delete: false }
      },
      {
        name: "Staff LPPM",
        access: { create: false, read: true, update: false, delete: false }
      },
      {
        name: "Ketua LPPM",
        access: { create: false, read: true, update: false, delete: false }
      },
      {
        name: "Dosen",
        access: { create: false, read: true, update: false, delete: false }
      },
      {
        name: "Reviewer",
        access: { create: false, read: true, update: false, delete: false }
      },
    ]
  },

  // =========================================================================
  //   SUPERADMIN — System authority: users, roles, Prodi, master data, settings
  // =========================================================================
  {
    key: "users",
    icon: faUsersGear,
    component: Users,
    label: "Daftar Pengguna",
    hidden: false,
    roles: [
      {
        name: "Superadmin",
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
    key: "prodi",
    icon: faSchool,
    component: Prodi,
    label: "Daftar Prodi",
    hidden: false,
    roles: [
      {
        name: "Superadmin",
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
    key: "pengaturan",
    icon: faGear,
    component: Pengaturan,
    label: "Pengaturan",
    hidden: false,
    roles: [
      {
        name: "Superadmin",
        access: {
          create: false,
          read: true,
          update: true,
          delete: false
        }
      },
    ]
  },

  // =========================================================================
  //   STAFF LPPM — Operational authority: proposal/laporan processing, data maintenance
  // =========================================================================
  {
    key: "staffmonitoringprogress",
    icon: faChartLine,
    component: AdminMonitoringPengajuan,
    label: "Monitoring Progress",
    hidden: false,
    roles: [
      {
        name: "Staff LPPM",
        access: {
          create: false,
          read: true,
          update: true,
          delete: true
        }
      },
      {
        name: "Ketua LPPM",
        access: {
          create: false,
          read: true,
          update: true,
          delete: true
        }
      },
    ]
  },
  {
    key: "staffmonitoringprogresslaporan",
    icon: faChartLine,
    component: AdminMonitoringPengajuan,
    label: "Monitoring Progress Laporan",
    hidden: true,
    roles: [
      {
        name: "Staff LPPM",
        access: {
          create: false,
          read: true,
          update: true,
          delete: true
        }
      },
      {
        name: "Ketua LPPM",
        access: {
          create: false,
          read: true,
          update: true,
          delete: true
        }
      },
    ]
  },
  {
    key: "mahasiswa",
    icon: faGraduationCap,
    component: Mahasiswa,
    label: "Daftar Mahasiswa",
    hidden: false,
    roles: [
      {
        name: "Superadmin",
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
    key: "kolaborator",
    icon: faHandshake,
    component: Kolaborator,
    label: "Daftar Kolaborator",
    hidden: false,
    roles: [
      {
        name: "Staff LPPM",
        access: {
          create: true,
          read: true,
          update: true,
          delete: true
        }
      },
    ]
  },

  // =========================================================================
  //   KETUA LPPM — Decision/authorization authority: skema, criteria, approvals
  // =========================================================================
  {
    key: "ketuaskema",
    icon: faFlask,
    component: Skema,
    label: "Skema Penelitian",
    hidden: false,
    roles: [
      {
        name: "Ketua LPPM",
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
    key: "ketuakegiatan",
    icon: faCalendarAlt,
    component: Skema,
    label: "Kegiatan Penelitian",
    hidden: true,
    roles: [
      {
        name: "Ketua LPPM",
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
    key: "ketuacriteria",
    icon: faClipboardList,
    component: KetuaCriteria,
    label: "Kriteria Penilaian",
    hidden: false,
    roles: [
      {
        name: "Staff LPPM",
        access: {
          create: false,
          read: true,
          update: true,
          delete: false
        }
      },
    ]
  },
  {
    key: "ketuapengaturan",
    icon: faGear,
    component: KetuaPengaturan,
    label: "Pengaturan",
    hidden: false,
    roles: [
      {
        name: "Ketua LPPM",
        access: {
          create: false,
          read: true,
          update: true,
          delete: false
        }
      },
    ]
  },

  // =========================================================================
  //   DOSEN — Researcher workflow
  // =========================================================================
  {
    key: "dosenmonitoringprogress",
    icon: faChartLine,
    component: DosenMonitoringPengajuan,
    label: "Monitor Progress",
    hidden: false,
    roles: [
      {
        name: "Dosen",
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
    key: "dosenmonitoringprogresslaporan",
    icon: faChartLine,
    component: DosenMonitoringPengajuan,
    label: "Monitoring Progress Laporan",
    hidden: true,
    roles: [
      {
        name: "Dosen",
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
    key: "profildosen",
    icon: faGraduationCap,
    component: ProfilDosen,
    label: "Profil",
    hidden: false,
    roles: [
      {
        name: "Dosen",
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
    key: "dosenscholar",
    icon: faBookOpen,
    component: GoogleScholar,
    label: "Monitor Profil",
    hidden: false,
    roles: [
      {
        name: "Dosen",
        access: {
          create: true,
          read: true,
          update: true,
          delete: true
        }
      },
    ]
  },

  // =========================================================================
  //   REVIEWER — Review tasks only
  // =========================================================================
  {
    key: "reviewproposal",
    icon: faChartLine,
    component: ListPengajuanReviewer,
    label: "Monitor Progress Review",
    hidden: false,
    roles: [
      {
        name: "Reviewer",
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
  const mod = dashboardModules.find(m => m.key === moduleKey)

  if (!mod || !role) {
    return {
      create: false,
      read: false,
      update: false,
      delete: false
    }
  }

  const roleConfig = mod.roles.find(r => r.name === role)

  return {
    create: roleConfig?.access?.create ?? false,
    read: roleConfig?.access?.read ?? false,
    update: roleConfig?.access?.update ?? false,
    delete: roleConfig?.access?.delete ?? false
  }
}
