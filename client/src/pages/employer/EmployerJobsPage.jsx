import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Trash2, PlusCircle } from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyJobs = async () => {
    try {
      const { data } = await api.get('/jobs/employer/my-jobs');
      if (data.success) {
        setJobs(data.data);
      }
    } catch (error) {
      console.error('Error fetching employer jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting permanently?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch (error) {
      alert('Failed to delete job listing.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Job Listings</h1>
            <p className="text-sm text-slate-500">
              Review applicants, monitor status, or close filled positions
            </p>
          </div>
          <Link to="/employer/post-job" className="btn-primary">
            <PlusCircle className="h-4 w-4" /> Post New Job
          </Link>
        </div>

        {loading ? (
          <div className="h-64 animate-pulse rounded-xl bg-white border border-slate-200" />
        ) : jobs.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-base font-semibold text-slate-800">No job postings created yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                    <StatusBadge status={job.status} />
                    <StatusBadge status={job.adminApproval} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {job.location?.city} • {job.employmentType} • Posted{' '}
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/employer/jobs/${job._id}/applicants`}
                    className="btn-primary py-1.5 px-3 text-xs"
                  >
                    <Users className="h-3.5 w-3.5" /> Applicants ({job.applicationsCount})
                  </Link>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                    title="Delete Listing"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}