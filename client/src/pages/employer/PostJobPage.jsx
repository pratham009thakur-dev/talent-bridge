import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Send } from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';

export default function PostJobPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillsRequired: '',
    experienceLevel: 'Mid Level',
    minExperienceYears: 1,
    employmentType: 'Full-time',
    city: '',
    state: '',
    isRemote: false,
    minSalary: '',
    maxSalary: '',
    openings: 1,
    requirementsText: '',
    responsibilitiesText: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        skillsRequired: formData.skillsRequired
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        experienceLevel: formData.experienceLevel,
        minExperienceYears: Number(formData.minExperienceYears),
        employmentType: formData.employmentType,
        location: {
          city: formData.city,
          state: formData.state,
          country: 'India',
          isRemote: formData.isRemote,
        },
        salaryRange: {
          min: Number(formData.minSalary) || 0,
          max: Number(formData.maxSalary) || 0,
          currency: 'INR',
        },
        openings: Number(formData.openings) || 1,
        requirements: formData.requirementsText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
        responsibilities: formData.responsibilitiesText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
      };

      const { data } = await api.post('/jobs', payload);
      if (data.success) {
        navigate('/employer/jobs');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish job listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Publish New Job Opening</h1>
          <p className="text-sm text-slate-500">
            Specify skills and experience thresholds to enable automated candidate match scoring
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
        >
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
              Job Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Senior Backend Node.js Engineer"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                Employment Type *
              </label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="input-field"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                Experience Level *
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                className="input-field"
              >
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
                <option value="Director">Director</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                Min Experience (Yrs)
              </label>
              <input
                type="number"
                min={0}
                value={formData.minExperienceYears}
                onChange={(e) =>
                  setFormData({ ...formData, minExperienceYears: e.target.value })
                }
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
              Required Skills (Comma-Separated) *
            </label>
            <input
              type="text"
              required
              value={formData.skillsRequired}
              onChange={(e) => setFormData({ ...formData, skillsRequired: e.target.value })}
              placeholder="react, node.js, express, mongodb, rest api"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Bengaluru"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Karnataka"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                Min Annual Salary (INR)
              </label>
              <input
                type="number"
                value={formData.minSalary}
                onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                placeholder="800000"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                Max Annual Salary (INR)
              </label>
              <input
                type="number"
                value={formData.maxSalary}
                onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                placeholder="1400000"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                Openings
              </label>
              <input
                type="number"
                min={1}
                value={formData.openings}
                onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
              Job Description *
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a comprehensive overview of the role, team, and technical stack..."
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
              Key Responsibilities (One per line)
            </label>
            <textarea
              rows={3}
              value={formData.responsibilitiesText}
              onChange={(e) =>
                setFormData({ ...formData, responsibilitiesText: e.target.value })
              }
              placeholder="Architect scalable REST APIs&#10;Conduct peer code reviews"
              className="input-field"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={submitting} className="btn-primary px-6">
              <Send className="h-4 w-4" />
              {submitting ? 'Publishing...' : 'Publish Job Listing'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}