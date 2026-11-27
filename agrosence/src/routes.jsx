/**
 * THE route table. One entry per page. App.jsx builds the router from this list.
 *
 *   { path, component, title, layout, auth?, roles? }
 *
 * layout:
 *   'public'  header + footer (PublicLayout)
 *   'auth'    bare, for login/signup/forgot (signed-in users are redirected to /dashboard)
 *   'app'     authenticated shell (AppLayout: sidebar + topbar). Requires login.
 *
 * roles: optional array; users without one of them see the 403 page inside the shell.
 * Paths are kept exactly as before (case-insensitive matching is on, so /login === /Login).
 */
import { lazy } from 'react'

const page = (loader) => lazy(loader)

export const ROUTES = [
  // Public
  { path: '/', component: page(() => import('./pages/Home')), title: 'Sell your harvest directly to buyers', layout: 'public' },
  { path: '/Feature', component: page(() => import('./pages/Feature')), title: 'Features', layout: 'public' },
  { path: '/About', component: page(() => import('./pages/About')), title: 'About us', layout: 'public' },
  { path: '/ContactUs', component: page(() => import('./pages/Contact')), title: 'Contact us', layout: 'public' },
  { path: '/403', component: page(() => import('./pages/Forbidden')), title: 'Access denied', layout: 'public' },

  // Auth screens
  { path: '/Login', component: page(() => import('./pages/Login')), title: 'Log in', layout: 'auth' },
  { path: '/Signup', component: page(() => import('./pages/Signup')), title: 'Create your account', layout: 'auth' },
  { path: '/forgot-password', component: page(() => import('./pages/ForgotPassword')), title: 'Reset password', layout: 'auth' },

  // Authenticated pages
  { path: '/dashboard', component: page(() => import('./pages/Dashboard')), title: 'Dashboard', layout: 'app' },

  { path: '/Setting', component: page(() => import('./pages/Setting')), title: 'Settings', layout: 'app' },
  { path: '/features/government-schemes', component: page(() => import('./pages/GovScheme')), title: 'Government schemes', layout: 'app' },
  { path: '/state-schemes/:stateName', component: page(() => import('./pages/StateWiseScheme')), title: 'State schemes', layout: 'app' },
  { path: '/features/MarketAccess', component: page(() => import('./pages/MarketAccess')), title: 'Market', layout: 'app' },
  { path: '/features/MarketAccess/product/:id', component: page(() => import('./pages/CropDetailCard')), title: 'Crop details', layout: 'app' },
  { path: '/features/expert', component: page(() => import('./pages/AgroExpert')), title: 'Expert advice', layout: 'app' },
  { path: '/features/crop-detection', component: page(() => import('./pages/CropDetection')), title: 'Crop detection', layout: 'app' },
  { path: '/features/resources', component: page(() => import('./pages/Resource1')), title: 'Resources', layout: 'app' },
  { path: '/features/resources/:id', component: page(() => import('./pages/ResourceDetail')), title: 'Resource', layout: 'app' },
  { path: '/QuickSupport', component: page(() => import('./pages/QuickSupport')), title: 'Support', layout: 'app' },
  { path: '/Reports', component: page(() => import('./pages/FarmingReport')), title: 'Reports', layout: 'app' },
  { path: '/LiveCropPricing', component: page(() => import('./pages/LiveCropPricing')), title: 'Live crop prices', layout: 'app' },
  { path: '/Routine', component: page(() => import('./pages/FarmingRoutine')), title: 'Farming routine', layout: 'app' },
  { path: '/CropSell', component: page(() => import('./pages/CropSell')), title: 'Sell crops', layout: 'app' },
  { path: '/product', component: page(() => import('./pages/Product')), title: 'Products', layout: 'app' },
  { path: '/OrderHistory', component: page(() => import('./pages/OrderHistory')), title: 'My orders', layout: 'app' },
]

export const NotFoundPage = page(() => import('./pages/NotFound'))
