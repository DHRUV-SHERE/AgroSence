/**
 * Single source of truth for navigation (header, footer, sidebar).
 *
 *   import { PUBLIC_NAV, APP_NAV, appNavFor } from '../lib/navigation'
 *   appNavFor(user.role)  -> sidebar groups the role may see
 *
 * `roles` (optional) restricts an item to those roles; omit for "any signed-in user".
 * Add a new feature page here once and it appears in the sidebar, footer-free.
 */
import {
  LuLayoutDashboard, LuStore, LuSprout, LuReceipt, LuTrendingUp, LuScanSearch, LuLandmark,
  LuBookOpen, LuGraduationCap, LuCalendarDays, LuChartColumn, LuLifeBuoy, LuSettings, LuShield,
} from 'react-icons/lu'

export const PUBLIC_NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/Feature', label: 'Features' },
  { to: '/About', label: 'About' },
  { to: '/ContactUs', label: 'Contact' },
]

export const APP_NAV = [
  {
    group: 'Overview',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: LuLayoutDashboard }],
  },
  {
    group: 'Market',
    items: [
      { to: '/features/MarketAccess', label: 'Buy crops', icon: LuStore },
      { to: '/CropSell', label: 'Sell crops', icon: LuSprout },
      { to: '/OrderHistory', label: 'My orders', icon: LuReceipt },
      { to: '/LiveCropPricing', label: 'Live prices', icon: LuTrendingUp },
    ],
  },
  {
    group: 'Grow',
    items: [
      { to: '/features/crop-detection', label: 'Crop detection', icon: LuScanSearch },
      { to: '/features/government-schemes', label: 'Govt. schemes', icon: LuLandmark },
      { to: '/features/resources', label: 'Resources', icon: LuBookOpen },
      { to: '/features/expert', label: 'Expert advice', icon: LuGraduationCap },
      { to: '/Routine', label: 'Farming routine', icon: LuCalendarDays },
      { to: '/Reports', label: 'Reports', icon: LuChartColumn },
    ],
  },
  {
    group: 'Account',
    items: [
      { to: '/QuickSupport', label: 'Support', icon: LuLifeBuoy },
      { to: '/Setting', label: 'Settings', icon: LuSettings },
      // The admin panel is a separate app. Only shown to staff, and only if VITE_ADMIN_URL is configured.
      ...(import.meta.env.VITE_ADMIN_URL
        ? [{ href: import.meta.env.VITE_ADMIN_URL, label: 'Admin panel', icon: LuShield, roles: ['admin', 'moderator'] }]
        : []),
    ],
  },
]

export function appNavFor(role) {
  return APP_NAV
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.roles || i.roles.includes(role)) }))
    .filter((g) => g.items.length)
}

export const SOCIAL_LINKS = [] // fill with real URLs when the team has them; the footer hides the row when empty
export const CONTACT = {
  email: 'projectagrosence2024@gmail.com',
  phones: [
    { label: 'Project management', value: '+91 93168 46548' },
    { label: 'Query management', value: '+91 90238 97448' },
    { label: 'Interface management', value: '+91 70435 69445' },
  ],
  address: 'U.V. Patel College of Engineering, Ganpat University, Kherva, Gujarat',
  hours: ['Monday to Friday: 9:00 AM to 5:00 PM', 'Saturday: 10:00 AM to 2:00 PM'],
}
