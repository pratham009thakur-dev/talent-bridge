const STATUS_STYLES = {
    Applied: 'bg-blue-50 text-blue-700 border-blue-200',
    'Under Review': 'bg-amber-50 text-amber-700 border-amber-200',
    Shortlisted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Interview Scheduled': 'bg-purple-50 text-purple-700 border-purple-200',
    Hired: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    Withdrawn: 'bg-slate-100 text-slate-600 border-slate-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    closed: 'bg-slate-100 text-slate-600 border-slate-200',
    flagged: 'bg-rose-50 text-rose-700 border-rose-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  
  export default function StatusBadge({ status }) {
    const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}
      >
        {status}
      </span>
    );
  }