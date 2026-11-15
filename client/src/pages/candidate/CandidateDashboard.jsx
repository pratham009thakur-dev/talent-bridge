import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  Bookmark,
  Sparkles,
  ArrowUpRight,
  MapPin,
} from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';

export default function CandidateDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/candidate/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (error) {
        console.error('Failed to load candidate dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-white border border-slate-200" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  const stats = data?.stats || {
    totalApplications: 0,
    underReview: 0,
    shortlisted: 0,
    savedJobs: 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Candidate Overview</h1>
            <p className="text-sm text-slate-500">
              Track your applications, profile strength, and skill-matched roles
            </p>
          </div>
          <Link to="/jobs" className="btn-primary">
            Browse Open Roles <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Total Applied</span>
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{stats.totalApplications}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Under Review</span>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{stats.underReview}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Shortlisted</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{stats.shortlisted}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Saved Jobs</span>
              <Bookmark className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{stats.savedJobs}</p>
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Recommended For Your Skills</h2>
            </div>
            <Link to="/jobs" className="text-xs font-semibold text-blue-600 hover:underline">
              View All Jobs
            </Link>
          </div>

          {data?.recommendedJobs?.length === 0 ? (
            <p className="text-sm text-slate-500">
              Complete your skills in My Profile to receive tailored job matches.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {data?.recommendedJobs?.map((job) => (
                <div
                  key={job._id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-blue-300 hover:bg-white"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="font-bold text-slate-900 hover:text-blue-600"
                      >
                        {job.title}
                      </Link>
                      <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                        {job.matchDetails?.percentage}% Match
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-600">
                      {job.companyProfile?.companyName}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5" /> {job.location?.city} •{' '}
                      {job.employmentType}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-200/70">
                    <span className="text-[11px] text-slate-500">
                      {job.matchDetails?.matchingSkills?.length || 0} matching skills
                    </span>
                    <Link to={`/jobs/${job._id}`} className="text-xs font-semibold text-blue-600">
                      Inspect Role →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Applications</h2>
            <Link
              to="/candidate/applications"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Full History
            </Link>
          </div>

          {data?.recentApplications?.length === 0 ? (
            <p className="text-sm text-slate-500">You haven't applied to any roles yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold">Company</th>
                    <th className="pb-3 font-semibold">Match</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Applied On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.recentApplications?.map((app) => (
                    <tr key={app._id}>
                      <td className="py-3 font-medium text-slate-900">{app.job?.title}</td>
                      <td className="py-3 text-slate-600">
                        {app.job?.companyProfile?.companyName}
                      </td>
                      <td className="py-3 font-semibold text-blue-700">
                        {app.matchScore?.percentage}%
                      </td>
                      <td className="py-3">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-3 text-xs text-slate-500">
                        {new Date(app.createdAt).toLocaleDateString()}
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