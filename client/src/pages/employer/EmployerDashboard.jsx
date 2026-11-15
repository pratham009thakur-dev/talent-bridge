import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Clock, CheckCircle2, PlusCircle } from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';

export default function EmployerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/employer/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (error) {
        console.error('Error loading employer dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-64 animate-pulse rounded-xl bg-white border border-slate-200" />
      </DashboardLayout>
    );
  }

  const stats = data?.stats || {
    activeJobs: 0,
    totalApplications: 0,
    pendingReview: 0,
    shortlisted: 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Employer Recruiting Console</h1>
            <p className="text-sm text-slate-500">
              Monitor job performance, applicant pipelines, and hiring velocity
            </p>
          </div>
          <Link to="/employer/post-job" className="btn-primary">
            <PlusCircle className="h-4 w-4" /> Post New Opening
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Active Jobs</span>
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{stats.activeJobs}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Total Applicants
              </span>
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{stats.totalApplications}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Pending Review</span>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{stats.pendingReview}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Shortlisted</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{stats.shortlisted}</p>
          </div>
        </div>

        {/* Job-wise Statistics */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-slate-900">Job-Wise Pipeline Metrics</h2>
          {data?.jobStats?.length === 0 ? (
            <p className="text-sm text-slate-500">No jobs posted yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="pb-3 font-semibold">Job Title</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Views</th>
                    <th className="pb-3 font-semibold">Applicants</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.jobStats?.map((job) => (
                    <tr key={job._id}>
                      <td className="py-3 font-semibold text-slate-900">{job.title}</td>
                      <td className="py-3">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="py-3 text-slate-600">{job.viewsCount}</td>
                      <td className="py-3 font-bold text-blue-700">{job.applicationsCount}</td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/employer/jobs/${job._id}/applicants`}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Review Applicants →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}