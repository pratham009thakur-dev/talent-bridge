import { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  ExternalLink,
  Info,
} from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';

export default function CandidateProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [skillInput, setSkillInput] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/candidate/profile');
        if (data.success) {
          setProfile(data.data);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Only PDF files are accepted.' });
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const { data } = await api.post('/candidate/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
        setProfile((prev) => ({ ...prev, resume: data.resume }));
        setParsedPreview(data.parsedPreview);
        setMessage({
          type: 'success',
          text: 'Resume uploaded and parsed! Review extracted fields below before saving.',
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Resume upload failed.',
      });
    } finally {
      setUploading(false);
    }
  };

  const applyParsedSuggestions = () => {
    if (!parsedPreview) return;
    setProfile((prev) => {
      const mergedSkills = Array.from(
        new Set([...(prev.skills || []), ...(parsedPreview.extractedSkills || [])])
      );
      return {
        ...prev,
        phone: prev.phone || parsedPreview.extractedPhone || '',
        experienceYears:
          prev.experienceYears > 0
            ? prev.experienceYears
            : parsedPreview.experienceYears || 0,
        skills: mergedSkills,
      };
    });
    setParsedPreview(null);
    setMessage({
      type: 'success',
      text: 'Extracted fields merged into your form. Click "Save Profile" to persist.',
    });
  };

  const handleAddSkill = () => {
    const clean = skillInput.trim().toLowerCase();
    if (clean && !profile.skills.includes(clean)) {
      setProfile({ ...profile, skills: [...profile.skills, clean] });
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skill) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skill),
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const { data } = await api.put('/candidate/profile', profile);
      if (data.success) {
        setProfile(data.data);
        await refreshUser();
        setMessage({ type: 'success', text: 'Profile updated and saved to database.' });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error updating profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleViewResume = async () => {
    try {
      const response = await api.get(`/candidate/resume/download/${user._id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (err) {
      setMessage({ type: 'error', text: 'Unable to open resume PDF.' });
    }
  };

  if (loading || !profile) {
    return (
      <DashboardLayout>
        <div className="h-96 animate-pulse rounded-xl bg-white border border-slate-200" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidate Profile & Resume</h1>
          <p className="text-sm text-slate-500">
            Keep your technical skills, experience, and PDF resume up to date for accurate job matching
          </p>
        </div>

        {message.text && (
          <div
            className={`flex items-center gap-2 rounded-xl border p-4 text-sm font-medium ${
              message.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-rose-200 bg-rose-50 text-rose-800'
            }`}
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        {/* Resume Upload & Parser Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Resume Document (PDF)</h2>
              <p className="text-xs text-slate-500">
                Maximum 5MB. Automated parser extracts contact details and technical skills for your review.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {profile.resume?.filename && (
                <button type="button" onClick={handleViewResume} className="btn-secondary text-xs">
                  <FileText className="h-4 w-4 text-blue-600" /> View Uploaded PDF
                </button>
              )}

              <label className="btn-primary cursor-pointer text-xs">
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading & Parsing...' : 'Upload PDF Resume'}
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {profile.resume?.originalName && (
            <p className="mt-3 text-xs text-emerald-700 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Current file: {profile.resume.originalName}
            </p>
          )}

          {/* Parsed Data Review Card */}
          {parsedPreview && (
            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  Extracted Resume Insights (Review Before Applying)
                </h3>
                <button
                  type="button"
                  onClick={applyParsedSuggestions}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Merge Into Profile Form
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs text-slate-700">
                <div>
                  <span className="font-semibold">Detected Name:</span>{' '}
                  {parsedPreview.extractedName || 'Not detected'}
                </div>
                <div>
                  <span className="font-semibold">Detected Phone:</span>{' '}
                  {parsedPreview.extractedPhone || 'Not detected'}
                </div>
                <div>
                  <span className="font-semibold">Est. Experience:</span>{' '}
                  {parsedPreview.experienceYears} yrs
                </div>
              </div>
              {parsedPreview.extractedSkills?.length > 0 && (
                <div className="text-xs">
                  <span className="font-semibold text-slate-700">Detected Skills: </span>
                  {parsedPreview.extractedSkills.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* LinkedIn Integration Notice (Transparent & Compliant) */}
        <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600">
            <p className="font-semibold text-slate-800">
              LinkedIn Profile Import (Optional OAuth Integration)
            </p>
            <p className="mt-0.5">
              Direct LinkedIn profile import requires an approved LinkedIn Developer App with{' '}
              <code className="rounded bg-slate-200 px-1">r_liteprofile</code> / OAuth 2.0
              credentials configured in server environment variables. You may link your public
              LinkedIn URL directly in the form below.
            </p>
          </div>
        </div>

        {/* Main Profile Form */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Core Details & Location
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={profile.headline || ''}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  placeholder="e.g. Full-Stack MERN Software Developer"
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                  City
                </label>
                <input
                  type="text"
                  value={profile.location?.city || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      location: { ...profile.location, city: e.target.value },
                    })
                  }
                  placeholder="Bengaluru"
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                  Total Experience (Years)
                </label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={profile.experienceYears || 0}
                  onChange={(e) =>
                    setProfile({ ...profile, experienceYears: Number(e.target.value) })
                  }
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                Professional Summary / Bio
              </label>
              <textarea
                rows={3}
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Summarize your core engineering strengths and career goals..."
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={profile.socialLinks?.linkedin || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, linkedin: e.target.value },
                    })
                  }
                  placeholder="https://linkedin.com/in/..."
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={profile.socialLinks?.github || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, github: e.target.value },
                    })
                  }
                  placeholder="https://github.com/..."
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                  Portfolio Website
                </label>
                <input
                  type="url"
                  value={profile.socialLinks?.portfolio || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, portfolio: e.target.value },
                    })
                  }
                  placeholder="https://yourportfolio.dev"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Skills Manager */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Technical Skills
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Add skill (e.g. React, Node.js, MongoDB, Docker)..."
                className="input-field max-w-md"
              />
              <button type="button" onClick={handleAddSkill} className="btn-secondary">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-blue-500 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary px-6">
              <Save className="h-4 w-4" />
              {saving ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}