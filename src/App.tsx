import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import OnboardingPage from '@/pages/OnboardingPage';
import OnboardingCompletePage from '@/pages/OnboardingCompletePage';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHome from '@/pages/dashboard/DashboardHome';
import ConversationsPage from '@/pages/dashboard/ConversationsPage';
import KnowledgePage from '@/pages/dashboard/KnowledgePage';
import SettingsPage from '@/pages/dashboard/SettingsPage';
import WhatsAppTesterPage from '@/pages/dashboard/WhatsAppTesterPage';
import AdminLayout from '@/layouts/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import BusinessListPage from '@/pages/admin/BusinessListPage';
import AdminBroadcastPage from '@/pages/admin/AdminBroadcastPage';
import PlansPage from '@/pages/admin/PlansPage';

export default function App() {
  return (
    <BrowserRouter>
      <div dir="rtl">
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboard/:bizId" element={<OnboardingPage />} />
          <Route path="/onboard-complete" element={<OnboardingCompletePage />} />

          {/* Business Dashboard */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="conversations" element={<ConversationsPage />} />
            <Route path="knowledge" element={<KnowledgePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="whatsapp-tester" element={<WhatsAppTesterPage />} />
          </Route>

          {/* Admin Panel */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="businesses" element={<BusinessListPage />} />
            <Route path="broadcast" element={<AdminBroadcastPage />} />
            <Route path="plans" element={<PlansPage />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
