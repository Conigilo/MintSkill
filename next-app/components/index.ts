/**
 * Components index file - Export all reusable components
 * Note: ProtectedRoute and ErrorBoundary are imported directly to avoid re-export issues
 */

// UI Components
export * from './ui'

// Dashboard Components
export { default as DashboardHeader } from './dashboard/DashboardHeader'
export { default as ProfileCard } from './dashboard/ProfileCard'
export { StatsCard, StatItem } from './dashboard/StatsCard'
