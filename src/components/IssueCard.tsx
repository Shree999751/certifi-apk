import React from 'react';
import type { CivicIssue } from './initialIssues';

interface IssueCardProps {
  issue: CivicIssue;
  onInspect: (id: string) => void;
  onVote: (id: string, dir: 'up' | 'down') => void;
  t: Record<string, string>;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onInspect,
  onVote,
  t
}) => {
  const categoryKeyMap: Record<string, string> = {
    'Pothole': 'pothole',
    'Waste Management': 'wasteManagement',
    'Damaged Streetlight': 'streetlight',
    'Water Leakage': 'waterLeakage',
    'Public Infrastructure': 'infrastructure',
    'Other': 'other'
  };
  const badgeSeverityColors: Record<string, string> = {
    'Low': 'bg-canvas-soft text-body border-hairline',
    'Medium': 'bg-warning-soft/30 text-warning-deep border-warning-deep/15',
    'High': 'bg-error-soft/30 text-error border-error/15',
    'Critical': 'bg-error text-on-primary border-error'
  };

  const statusColors: Record<string, string> = {
    'Reported': 'bg-warning-soft text-warning-deep border-warning-deep/20',
    'Under Review': 'bg-cyan-soft text-cyan-deep border-cyan-deep/20',
    'In Progress': 'bg-link-bg-soft text-link border-link/20',
    'Resolved': 'bg-success/10 text-success border-success/20'
  };

  const hoursDiff = Math.abs(new Date().getTime() - new Date(issue.createdAt).getTime()) / 36e5;
  let timeString = 'Just now';
  if (hoursDiff >= 24) {
    timeString = `${Math.floor(hoursDiff / 24)} days ago`;
  } else if (hoursDiff >= 1) {
    timeString = `${Math.floor(hoursDiff)} hours ago`;
  }

  return (
    <div 
      onClick={() => onInspect(issue.id)}
      className="group border border-hairline bg-canvas hover:border-link/35 rounded-lg p-5 flex flex-col justify-between h-full select-none cursor-pointer card-elevator hover:shadow-level4 active-press"
    >
      <div>
        {/* Top header: Category and Status */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-canvas-soft-2 text-primary border border-hairline px-2 py-0.5 rounded">
            {t[categoryKeyMap[issue.category] || 'other'] || issue.category}
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`font-mono text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase border ${badgeSeverityColors[issue.severity] || 'bg-canvas-soft'}`}>
              {issue.severity}
            </span>
            <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${statusColors[issue.status] || 'bg-canvas-soft'}`}>
              {issue.status}
            </span>
          </div>
        </div>

        {/* Optional Image Thumbnail */}
        {issue.image && (
          <div className="w-full h-32 bg-canvas-soft rounded border border-hairline mb-3 overflow-hidden flex">
            <img className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300" src={issue.image} alt="Evidence photo" />
          </div>
        )}

        {/* Title & Description */}
        <h3 className="text-sm font-bold text-primary mb-1.5 leading-snug group-hover:text-link transition duration-150">
          {issue.title}
        </h3>
        {issue.reporterName && (
          <span className="block text-[10px] font-mono text-mute mb-2">
            Reported by: <span className="font-semibold text-primary">{issue.reporterName}</span>
          </span>
        )}
        <p className="text-xs text-body line-clamp-3 leading-relaxed mb-4">
          {issue.description}
        </p>
      </div>

      {/* Footer: Upvote Verification & Time */}
      <div className="border-t border-hairline pt-3 mt-auto flex items-center justify-between">
        {/* Validation buttons */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onVote(issue.id, 'up');
            }}
            className="h-7 border border-hairline rounded-full bg-canvas text-body hover:bg-canvas-soft-2 px-2.5 flex items-center gap-1 text-[11px] font-mono hover:text-success hover:border-success/30 transition shadow-level2 cursor-pointer active-press"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-thumbs-up"><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/><path d="M14 22a2.9 2.9 0 0 0 2.8-2.9l-.8-7.8A2 2 0 0 0 14 9.3H9.7V3a3 3 0 0 0-3-3H6.5"/><path d="M14 9.3h4a2 2 0 0 1 2 2v2.5a2 2 0 0 1-.6 1.4l-4.5 4.5a2 2 0 0 1-1.4.6H14"/></svg>
            <span>{issue.upvotes}</span>
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onVote(issue.id, 'down');
            }}
            className="h-7 border border-hairline rounded-full bg-canvas text-body hover:bg-canvas-soft-2 px-2.5 flex items-center gap-1 text-[11px] font-mono hover:text-error hover:border-error/30 transition shadow-level2 cursor-pointer active-press"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-thumbs-down"><path d="M17 2H20a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/><path d="M10 2a2.9 2.9 0 0 0-2.8 2.9l.8 7.8A2 2 0 0 0 10 14.7h4.3V20a3 3 0 0 0 3 3h.2"/><path d="M10 14.7H6a2 2 0 0 1-2-2V10.2a2 2 0 0 1 .6-1.4l4.5-4.5A2 2 0 0 1 10.5 2H10"/></svg>
            <span>{issue.downvotes}</span>
          </button>
        </div>

        {/* Time meta */}
        <span className="text-[10px] font-mono text-mute">
          {timeString}
        </span>
      </div>
    </div>
  );
};
