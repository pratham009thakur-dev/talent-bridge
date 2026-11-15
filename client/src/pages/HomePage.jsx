import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import Navbar from '../components/common/Navbar';

export default function HomePage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (location.trim()) params.set('location', location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200 mb-6">
            <Sparkles className="h-3.5 w-3.5" /> Skill-Matched Hiring & Automated Resume Parsing
          </span>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Connect Top Engineering Talent With{' '}
            <span className="text-blue-600">High-Impact Teams</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-600">
            Discover verified career opportunities with transparent skill compatibility scores,
            instant PDF resume parsing, and real-time application tracking.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-white p-2.5 shadow-lg sm:flex sm:items-center sm:gap-2"
          >
            <div className="flex flex-1 items-center gap-2.5 px-3 py-2">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Job title, skill (e.g. React, Node.js), or keyword..."
                className="w-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="hidden sm:block h-8 w-px bg-slate-200" />

            <div className="flex flex-1 items-center gap-2.5 px-3 py-2 border-t sm:border-t-0 border-slate-100">
              <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City (e.g. Bengaluru, Pune, Remote)"
                className="w-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <button type="submit" className="btn-primary w-full sm:w-auto px-6 py-3">
              Search Jobs
            </button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Verified Employers
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Transparent Match Scores
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Direct Recruiter Status Updates
            </span>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-4">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Smart Resume Parsing</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Upload your PDF resume once. Our extraction engine automatically detects your skills,
              contact details, and experience so you can review and apply in seconds.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Deterministic Job Matching</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              See exactly how your profile stacks up against job requirements with itemized
              matching skills, skill gaps, and experience alignment percentages.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">End-to-End Hiring Pipeline</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Employers manage job openings, review ranked applicants, inspect protected resumes,
              and advance candidates through structured interview stages.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-2xl bg-slate-900 p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold">Hiring for your engineering team?</h2>
            <p className="mt-1 text-sm text-slate-300">
              Create an employer account to post openings and evaluate skill-ranked candidates.
            </p>
          </div>
          <Link
            to="/register"
            className="shrink-0 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition"
          >
            Create Employer Account
          </Link>
        </div>
      </section>
    </div>
  );
}