import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Flag } from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllJobs = async () => {
    try {
      const { data } = await api.get('/admin/jobs');
      if (data.success) setJobs(data.data);
    } catch (error) {
      console.error('Error loading jobs for moderation:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);

  const handleModerate = async (jobId, adminApproval, status) => {
    try {
      const { data } = await api.put(`/admin/jobs/${jobId}/moderate`, {
        adminApproval,
        status,
      });
      if (data.success) {
        setJobs((prev) =>
          prev.map((j) =>
            j._id === jobId ? { ...j, adminApproval, status } : j
          )
        );
      }
    } catch (error) {
      alert('Failed to moderate job listing.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Listing Moderation</h1>
          <p className="text-sm text-slate-500">
            Approve, reject, or flag job postings across the platform
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Job Title</th>
                <th className="px-5 py-3.5 font-semibold">Company</th>
                <th className="px-5 py-3.5 font-semibold">Approval</th>
                <th className="px-5 py-3.5 font-semibold">Listing Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Moderation Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">
                    Loading jobs...
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job._id}>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{job.title}</td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {job.companyProfile?.companyName}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={job.adminApproval} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleModerate(job._id, 'approved', 'active')}
                        className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleModerate(job._id, 'rejected', 'closed')}
                        className="inline-flex items-center gap-1 rounded bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => handleModerate(job._id, 'rejected', 'flagged')}
                        className="inline-flex items-center gap-1 rounded bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                      >
                        <Flag className="h-3.5 w-3.5" /> Flag
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}