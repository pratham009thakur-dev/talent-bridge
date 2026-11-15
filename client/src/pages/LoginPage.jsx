import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await login(email, password);
      const role = res.user.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'employer') navigate('/employer/dashboard');
      else navigate('/candidate/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign in. Check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-14">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Briefcase className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to access your workspace</p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200">
            <p className="font-semibold text-slate-800 mb-1">Seeded Demo Accounts (Password@123):</p>
            <p>• Candidate: aarav.dev@example.com</p>
            <p>• Employer: rohan@nexustech.in</p>
            <p>• Admin: admin@jobportal.io</p>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}