import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Mail, Sparkles } from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';

export default function JobApplicantsPage() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchApplicants = async () => {
    try {
      const { data } = await api.get(`/applications/job/${jobId}`);
      if (data.success) {
        setApplicants(data.data);
        setJobTitle(data.jobTitle);
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const { data } = await api.put(`/applications/${applicationId}/status`, {
        status: newStatus,
      });
      if (data.success) {
        setApplicants((prev) =>
          prev.map((app) => (app._id === applicationId ? { ...app, status: newStatus } : app))
        );
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleOpenResume = async (candidateId) => {
    try {
      const response = await api.get(`/candidate/resume/download/${candidateId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: 'application/pdf' })
      );
      window.open(url, '_blank');
    } catch (err) {
      alert('Could not access candidate resume file.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Link
            to="/employer/jobs"
            className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to My Listings
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Applicants: {jobTitle}</h1>
          <p className="text-sm text-slate-500">
            Candidates ranked by deterministic skill compatibility score
          </p>
        </div>

        {loading ? (
          <div className="h-64 animate-pulse rounded-xl bg-white border border-slate-200" />
        ) : applicants.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-base font-semibold text-slate-800">
              No candidates have applied to this opening yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map((app) => (
              <div
                key={app._id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">
                        {app.candidate?.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                        <Sparkles className="h-3 w-3" /> {app.matchScore?.percentage}% Match
                      </span>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      {app.candidateProfile?.headline || 'Candidate'} •{' '}
                      {app.candidateProfile?.experienceYears || 0} yrs exp •{' '}
                      {app.candidateProfile?.location?.city || 'Location N/A'}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <Mail className="h-3.5 w-3.5" /> {app.candidate?.email}
                    </p>
                  </div>

                  {/* Action Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleOpenResume(app.candidate._id)}
                      className="btn-secondary py-1.5 px-3 text-xs"
                    >
                      <FileText className="h-3.5 w-3.5 text-blue-600" /> View Resume PDF
                    </button>

                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800"
                    >
                      <option value="Applied" disabled>
                        Applied
                      </option>
                      <option value="Under Review">Under Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Hired">Hired</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {app.coverLetter && (
                  <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
                    <span className="font-semibold text-slate-800">Cover Note: </span>
                    {app.coverLetter}
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {app.candidateProfile?.skills?.map((skill) => (
                    <span
                      key={skill}
                      className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                        app.matchScore?.matchingSkills?.includes(skill)
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}