import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCircle,
  FileText,
  Bookmark,
  Briefcase,
  PlusCircle,
  Building2,
  Users,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../hooks/useAuth';

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  const candidateLinks = [
    { name: 'Overview', path: '/candidate/dashboard', icon: LayoutDashboard },
    { name: 'My Profile & Resume', path: '/candidate/profile', icon: UserCircle },
    { name: 'My Applications', path: '/candidate/applications', icon: FileText },
    { name: 'Saved Jobs', path: '/candidate/saved-jobs', icon: Bookmark },
  ];

  const employerLinks = [
    { name: 'Overview', path: '/employer/dashboard', icon: LayoutDashboard },
    { name: 'Post a New Job', path: '/employer/post-job', icon: PlusCircle },
    { name: 'Manage Job Listings', path: '/employer/jobs', icon: Briefcase },
    { name: 'Company Profile', path: '/employer/profile', icon: Building2 },
  ];

  const adminLinks = [
    { name: 'Platform Analytics', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Job Moderation', path: '/admin/jobs', icon: ShieldCheck },
  ];

  const navItems =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'employer'
      ? employerLinks
      : candidateLinks;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex max-w-7xl flex-col md:flex-row gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 px-3 py-2 border-b border-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {user?.role} Workspace
              </p>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Workspace Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}