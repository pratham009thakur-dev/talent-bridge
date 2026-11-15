import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Filter,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../hooks/useAuth';

export default function JobsExplorePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [savedJobIds, setSavedJobIds] = useState([]);

  // Filter states
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [employmentType, setEmploymentType] = useState('All');
  const [experienceLevel, setExperienceLevel] = useState('All');
  const [minSalary, setMinSalary] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 8,
        sort,
      };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (location.trim()) params.location = location.trim();
      if (employmentType !== 'All') params.employmentType = employmentType;
      if (experienceLevel !== 'All') params.experienceLevel = experienceLevel;
      if (minSalary) params.minSalary = minSalary;

      const { data } = await api.get('/jobs', { params });
      if (data.success) {
        setJobs(data.data);
        setTotal(data.total);
        setPages(data.pages);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    if (user?.role !== 'candidate') return;
    try {
      const { data } = await api.get('/candidate/saved-jobs');
      if (data.success) {
        setSavedJobIds(data.data.map((item) => item.job?._id));
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, employmentType, experienceLevel, sort]);

  useEffect(() => {
    fetchSavedJobs();
  }, [user]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleToggleSave = async (jobId) => {
    if (!user || user.role !== 'candidate') return;
    try {
      const { data } = await api.post(`/candidate/saved-jobs/${jobId}`);
      if (data.saved) {
        setSavedJobIds((prev) => [...prev, jobId]);
      } else {
        setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Search Bar */}
        <form
          onSubmit={handleFilterSubmit}
          className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm grid grid-cols-1 gap-3 md:grid-cols-12"
        >
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Title, skill, or keyword..."
              className="input-field pl-10"
            />
          </div>
          <div className="md:col-span-4 relative">
            <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or state..."
              className="input-field pl-10"
            />
          </div>
          <div className="md:col-span-3">
            <button type="submit" className="btn-primary w-full h-full">
              Search Opportunities
            </button>
          </div>
        </form>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0 space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
              <div className="flex items-center gap-2 font-semibold text-slate-900 border-b border-slate-100 pb-3">
                <Filter className="h-4 w-4 text-blue-600" /> Filter Results
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
                  Employment Type
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => {
                    setEmploymentType(e.target.value);
                    setPage(1);
                  }}
                  className="input-field"
                >
                  <option value="All">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => {
                    setExperienceLevel(e.target.value);
                    setPage(1);
                  }}
                  className="input-field"
                >
                  <option value="All">All Levels</option>
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior Level">Senior Level</option>
                  <option value="Director">Director</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
                  Min Annual Salary (INR)
                </label>
                <input
                  type="number"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  placeholder="e.g. 600000"
                  className="input-field"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPage(1);
                    fetchJobs();
                  }}
                  className="btn-secondary w-full mt-2 text-xs"
                >
                  Apply Salary Filter
                </button>
              </div>
            </div>
          </aside>

          {/* Job Cards List */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{total}</span> matching jobs
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700"
                >
                  <option value="latest">Newest First</option>
                  <option value="salary_high">Highest Salary</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white"
                  />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">No jobs found</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try adjusting your search keywords or clearing filters.
                </p>
              </div>
            ) : (
              jobs.map((job) => {
                const isSaved = savedJobIds.includes(job._id);
                return (
                  <div
                    key={job._id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          to={`/jobs/${job._id}`}
                          className="text-lg font-bold text-slate-900 hover:text-blue-600 transition"
                        >
                          {job.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <span className="flex items-center gap-1 font-medium text-slate-800">
                            <Building2 className="h-3.5 w-3.5 text-slate-400" />
                            {job.companyProfile?.companyName || 'Company'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {job.location?.city}
                            {job.location?.isRemote ? ' (Remote Eligible)' : ''}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                            {job.employmentType}
                          </span>
                          <span className="rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
                            {job.experienceLevel}
                          </span>
                        </div>
                      </div>

                      {user?.role === 'candidate' && (
                        <button
                          onClick={() => handleToggleSave(job._id)}
                          className={`rounded-lg border p-2 transition ${
                            isSaved
                              ? 'border-blue-200 bg-blue-50 text-blue-600'
                              : 'border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                          }`}
                          title={isSaved ? 'Remove bookmark' : 'Save job'}
                        >
                          <Bookmark className="h-4 w-4 fill-current" />
                        </button>
                      )}
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm text-slate-600">{job.description}</p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div className="flex flex-wrap gap-1.5">
                        {job.skillsRequired?.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4">
                        {job.salaryRange?.max > 0 && (
                          <span className="flex items-center text-xs font-semibold text-emerald-700">
                            <DollarSign className="h-3.5 w-3.5" />
                            {(job.salaryRange.min / 100000).toFixed(1)}L -{' '}
                            {(job.salaryRange.max / 100000).toFixed(1)}L PA
                          </span>
                        )}
                        <Link to={`/jobs/${job._id}`} className="btn-primary py-1.5 px-3 text-xs">
                          View & Apply
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <span className="text-xs font-medium text-slate-600">
                  Page {page} of {pages}
                </span>
                <button
                  disabled={page === pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}