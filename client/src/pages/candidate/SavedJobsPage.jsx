import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, MapPin, Trash2 } from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const { data } = await api.get('/candidate/saved-jobs');
      if (data.success) {
        setSavedJobs(data.data);
      }
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (jobId) => {
    try {
      await api.post(`/candidate/saved-jobs/${jobId}`);
      setSavedJobs((prev) => prev.filter((item) => item.job?._id !== jobId));
    } catch (error) {
      console.error('Failed to remove saved job:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Saved Opportunities</h1>
          <p className="text-sm text-slate-500">Bookmarked roles ready for your application</p>
        </div>

        {loading ? (
          <div className="h-48 animate-pulse rounded-xl bg-white border border-slate-200" />
        ) : savedJobs.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <Bookmark className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-base font-semibold text-slate-900">No saved jobs</h3>
            <Link to="/jobs" className="btn-primary mt-4">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {savedJobs.map(({ _id, job }) => {
              if (!job) return null;
              return (
                <div
                  key={_id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="text-base font-bold text-slate-900 hover:text-blue-600"
                      >
                        {job.title}
                      </Link>
                      <button
                        onClick={() => handleRemove(job._id)}
                        className="text-slate-400 hover:text-rose-600"
                        title="Remove bookmark"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-600">
                      {job.companyProfile?.companyName}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5" /> {job.location?.city} •{' '}
                      {job.employmentType}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    <Link to={`/jobs/${job._id}`} className="btn-primary py-1.5 px-3 text-xs">
                      View & Apply
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}