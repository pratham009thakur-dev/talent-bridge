import { useState, useEffect } from 'react';
import { Users, Briefcase, FileText, ShieldAlert } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';

const PIE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        if (data.success) {
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error loading admin analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading || !analytics) {
    return (
      <DashboardLayout>
        <div className="h-80 animate-pulse rounded-xl bg-white border border-slate-200" />
      </DashboardLayout>
    );
  }

  const { stats, charts } = analytics;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Governance & Analytics</h1>
          <p className="text-sm text-slate-500">
            Live MongoDB metrics across users, active job listings, and application funnels
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Total Users</span>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
            <p className="mt-1 text-xs text-slate-500">
              {stats.totalCandidates} Candidates • {stats.totalEmployers} Employers
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Total Jobs</span>
              <Briefcase className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalJobs}</p>
            <p className="mt-1 text-xs text-slate-500">{stats.activeJobs} Currently Active</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Applications</span>
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalApplications}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Pending Moderation
              </span>
              <ShieldAlert className="h-5 w-5 text-amber-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.pendingJobs}</p>
          </div>
        </div>

        {/* Real-Data Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900">
              Applications by Pipeline Stage
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.applicationsByStatus}>
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900">
              Job Distribution by Employment Type
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.jobsByType}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    label={({ type, count }) => `${type}: ${count}`}
                  >
                    {charts.jobsByType.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}