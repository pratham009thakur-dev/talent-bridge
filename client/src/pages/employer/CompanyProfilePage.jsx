import { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const { data } = await api.get('/employer/profile');
        if (data.success) setProfile(data.data);
      } catch (error) {
        console.error('Error loading company profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const { data } = await api.put('/employer/profile', profile);
      if (data.success) {
        setProfile(data.data);
        setMsg({ type: 'success', text: 'Company profile updated successfully.' });
      }
    } catch (error) {
      setMsg({ type: 'error', text: 'Failed to update company profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <DashboardLayout>
        <div className="h-64 animate-pulse rounded-xl bg-white border border-slate-200" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Company Organization Profile</h1>
          <p className="text-sm text-slate-500">
            Information displayed to candidates across all your active job listings
          </p>
        </div>

        {msg.text && (
          <div
            className={`flex items-center gap-2 rounded-xl border p-4 text-sm ${
              msg.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-rose-200 bg-rose-50 text-rose-800'
            }`}
          >
            <AlertCircle className="h-4 w-4" />
            <span>{msg.text}</span>
          </div>
        )}

        <form
          onSubmit={handleSave}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={profile.companyName || ''}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                Website URL
              </label>
              <input
                type="url"
                value={profile.companyWebsite || ''}
                onChange={(e) => setProfile({ ...profile, companyWebsite: e.target.value })}
                placeholder="https://company.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                Industry
              </label>
              <input
                type="text"
                value={profile.industry || ''}
                onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                placeholder="Cloud Software & SaaS"
                className="input-field"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                Company Size
              </label>
              <select
                value={profile.companySize || '11-50'}
                onChange={(e) => setProfile({ ...profile, companySize: e.target.value })}
                className="input-field"
              >
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
              Headquarters City
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
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
              About Company
            </label>
            <textarea
              rows={4}
              value={profile.about || ''}
              onChange={(e) => setProfile({ ...profile, about: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary px-6">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Company Profile'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}