import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  Building2,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowLeft,
  Send,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../hooks/useAuth';

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [matchEvaluation, setMatchEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/jobs/${id}`);
        if (data.success) {
          setJob(data.data);
          setRelatedJobs(data.relatedJobs || []);
          setMatchEvaluation(data.matchEvaluation);
        }
      } catch (error) {
        console.error('Error loading job:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setApplying(true);
    setFeedback({ type: '', message: '' });

    try {
      const { data } = await api.post(`/applications/${id}`, { coverLetter });
      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Could not submit application.',
      });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-5xl p-8">
          <div className="h-64 animate-pulse rounded-2xl bg-white border border-slate-200" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-5xl p-12 text-center">
          <p className="text-lg font-semibold text-slate-800">Job posting not found.</p>
          <Link to="/jobs" className="btn-primary mt-4">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/jobs"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Job Search
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{job.title}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      {job.companyProfile?.companyName}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {job.location?.city}, {job.location?.country}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-slate-400" />
                      {job.employmentType} • {job.experienceLevel}
                    </span>
                  </div>
                </div>

                {job.salaryRange?.max > 0 && (
                  <div className="rounded-xl bg-emerald-50 px-4 py-2.5 border border-emerald-200 text-right">
                    <p className="text-[11px] font-semibold uppercase text-emerald-700">
                      Compensation
                    </p>
                    <p className="text-sm font-bold text-emerald-900">
                      ₹{(job.salaryRange.min / 100000).toFixed(1)}L – ₹
                      {(job.salaryRange.max / 100000).toFixed(1)}L / yr
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Role Overview</h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                    {job.description}
                  </p>
                </div>

                {job.responsibilities?.length > 0 && (
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Key Responsibilities</h2>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-600">
                      {job.responsibilities.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.requirements?.length > 0 && (
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Requirements</h2>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-600">
                      {job.requirements.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h2 className="text-base font-bold text-slate-900">Required Skills</h2>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {job.skillsRequired?.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Application Box for Candidates */}
            {(!user || user.role === 'candidate') && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">Submit Your Application</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Your uploaded profile PDF resume will automatically be attached to this application.
                </p>

                {feedback.message && (
                  <div
                    className={`mt-4 flex items-center gap-2 rounded-lg border p-3.5 text-xs font-medium ${
                      feedback.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-rose-200 bg-rose-50 text-rose-800'
                    }`}
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{feedback.message}</span>
                  </div>
                )}

                <form onSubmit={handleApply} className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                      Cover Letter / Note to Recruiter (Optional)
                    </label>
                    <textarea
                      rows={4}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Briefly highlight why you're a strong fit for this role..."
                      className="input-field"
                    />
                  </div>
                  <button type="submit" disabled={applying} className="btn-primary">
                    <Send className="h-4 w-4" />
                    {applying ? 'Submitting Application...' : 'Apply Now'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right Sidebar: Match Score & Related Jobs */}
          <div className="space-y-6">
            {/* Deterministic Skill Match Card */}
            {matchEvaluation && (
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50/70 to-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                    <Sparkles className="h-4 w-4" /> Profile Compatibility
                  </span>
                  <span className="text-2xl font-extrabold text-blue-700">
                    {matchEvaluation.percentage}%
                  </span>
                </div>

                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-blue-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${matchEvaluation.percentage}%` }}
                  />
                </div>

                <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                  {matchEvaluation.explanation}
                </p>

                {matchEvaluation.matchingSkills?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[11px] font-semibold uppercase text-emerald-700 mb-1.5">
                      Matching Skills ({matchEvaluation.matchingSkills.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {matchEvaluation.matchingSkills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200"
                        >
                          <CheckCircle2 className="h-3 w-3" /> {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {matchEvaluation.missingSkills?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[11px] font-semibold uppercase text-rose-700 mb-1.5">
                      Skill Gaps ({matchEvaluation.missingSkills.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {matchEvaluation.missingSkills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 border border-rose-200"
                        >
                          <XCircle className="h-3 w-3" /> {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Company Info */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                About the Employer
              </h3>
              <p className="mt-2 text-base font-bold text-slate-900">
                {job.companyProfile?.companyName}
              </p>
              <p className="text-xs text-slate-500">
                {job.companyProfile?.industry} • {job.companyProfile?.companySize} employees
              </p>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                {job.companyProfile?.about}
              </p>
            </div>

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Similar Open Roles</h3>
                <div className="space-y-3">
                  {relatedJobs.map((rel) => (
                    <Link
                      key={rel._id}
                      to={`/jobs/${rel._id}`}
                      className="block rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-blue-300 hover:bg-white"
                    >
                      <p className="text-sm font-semibold text-slate-900">{rel.title}</p>
                      <p className="text-xs text-slate-500">
                        {rel.companyProfile?.companyName} • {rel.location?.city}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}