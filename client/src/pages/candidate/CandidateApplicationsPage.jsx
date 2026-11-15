import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Building2, XCircle } from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/applications/my-applications');
      if (data.success) {
        setApplications(data.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      const { data } = await api.put(`/applications/${id}/withdraw`);
      if (data.success) {
        fetchApplications();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to withdraw application.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Application History</h1>
          <p className="text-sm text-slate-500">
            Monitor real-time status progression across all your submitted applications
          </p>
        </div>

        {loading ? (
          <div className="h-64 animate-pulse rounded-xl bg-white border border-slate-200" />
        ) : applications.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-base font-semibold text-slate-900">No applications yet</h3>
            <p className="mt-1 text-sm text-slate-500">
              Start applying to jobs that match your skills.
            </p>
            <Link to="/jobs" className="btn-primary mt-4">
              Explore Open Roles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app._id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/jobs/${app.job?._id}`}
                      className="text-base font-bold text-slate-900 hover:text-blue-600"
                    >
                      {app.job?.title || 'Job Listing'}
                    </Link>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Building2 className="h-3.5 w-3.5" />
                      {app.job?.companyProfile?.companyName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-blue-700">
                      Match Score: {app.matchScore?.percentage}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!['Hired', 'Rejected', 'Withdrawn'].includes(app.status) && (
                    <button
                      onClick={() => handleWithdraw(app._id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}