import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Categories from './pages/Categories'
import Accounts from './pages/Accounts'
import Budgets from './pages/Budgets'
import Goals from './pages/Goals'
import Settings from './pages/Settings'
import UserGuide from './pages/UserGuide'
import Notifications from './pages/Notifications'
import GamificationDashboard from './components/GamificationDashboard'
import LoadingSpinner from './components/LoadingSpinner'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminPages from './pages/admin/Pages'
import AdminPosts from './pages/admin/Posts'
import AdminMedia from './pages/admin/Media'
import AdminUsers from './pages/admin/Users'
import AdminRoles from './pages/admin/Roles'
import AdminSettings from './pages/admin/Settings'

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/guide" element={<UserGuide />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <AdminLayout>
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="pages" element={<AdminPages />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="roles" element={<AdminRoles />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </AdminLayout>
      } />
      
      {/* Main App Routes */}
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/guide" element={<UserGuide />} />
            <Route path="/gamification" element={<GamificationDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  )
}

export default App
