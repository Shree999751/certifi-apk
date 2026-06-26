import React, { useState, useEffect } from 'react';
import type { CivicIssue } from './initialIssues';

interface AnalyticsProps {
  issues: CivicIssue[];
  t: Record<string, string>;
  currentLocation: { city: string; state: string; lat: number; lng: number };
  apiKey?: string;
}

export const Analytics: React.FC<AnalyticsProps> = ({ issues, t, currentLocation, apiKey }) => {
  const activeIssues = issues.filter(i => i.status !== 'Resolved').length;
  const resolvedIssues = issues.filter(i => i.status === 'Resolved').length;
  const totalIssues = issues.length;
  const healthIndex = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 40 + 60) : 100;

  const categories = ['Pothole', 'Waste Management', 'Damaged Streetlight', 'Water Leakage', 'Public Infrastructure', 'Other'] as const;
  
  const categoryKeyMap: Record<string, string> = {
    'Pothole': 'pothole',
    'Waste Management': 'wasteManagement',
    'Damaged Streetlight': 'streetlight',
    'Water Leakage': 'waterLeakage',
    'Public Infrastructure': 'infrastructure',
    'Other': 'other'
  };

  const counts: Record<string, number> = {};
  categories.forEach(c => { counts[c] = 0; });
  issues.forEach(i => {
    if (counts[i.category] !== undefined) {
      counts[i.category]++;
    } else {
      counts['Other']++;
    }
  });

  const maxCount = Math.max(...Object.values(counts), 1);

  const categoryColors: Record<string, string> = {
    'Pothole': 'bg-[#ff4d4d]',
    'Waste Management': 'bg-[#f9cb28]',
    'Damaged Streetlight': 'bg-[#7928ca]',
    'Water Leakage': 'bg-[#0070f3]',
    'Public Infrastructure': 'bg-[#50e3c2]',
    'Other': 'bg-[#888888]'
  };

  // Dynamic calculations for citizens engaged
  const cityHash = currentLocation.city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseEngaged = (cityHash % 500) + 200; // e.g. between 200 and 700
  const engagementMultiplier = issues.reduce((acc, issue) => acc + issue.upvotes + (issue.comments?.length || 0), 0);
  const totalEngaged = baseEngaged + engagementMultiplier * 3;
  const todayEngaged = (cityHash % 25) + 5 + Math.round(engagementMultiplier / 2);
  
  // Dynamic Zone representation
  const zones = ['East zone', 'West zone', 'Central division', 'Suburban region', 'Metro circle'];
  const activeZone = `${currentLocation.city} ${zones[cityHash % zones.length]}`;

  // Local fallback predictive insights based on location
  const getFallbackPredictiveInsights = () => {
    const city = currentLocation.city;
    
    if (city.toLowerCase().includes('bengaluru') || city.toLowerCase().includes('bangalore')) {
      return [
        {
          id: 'pred-1',
          type: 'Pipeline Burst Risk',
          match: '92% Match',
          severityClass: 'error',
          title: 'Indiranagar Sector 4',
          description: 'Multiple water leak reports in a 50m radius indicate pressure overload. Grid failure predicted within 3 days.',
          slaImpact: 'SLA Impact: Avoids 40h outage',
          status: 'Priority Escalated'
        },
        {
          id: 'pred-2',
          type: 'Road Deterioration',
          match: '78% Match',
          severityClass: 'warning-deep',
          title: 'Outer Ring Road (Bellandur)',
          description: 'High density of potholes near heavy vehicle transit points. Monsoons will expand lanes by 40%.',
          slaImpact: 'SLA Impact: Pre-emptive filling',
          status: 'Schedule Patching'
        }
      ];
    } else if (city.toLowerCase().includes('delhi')) {
      return [
        {
          id: 'pred-1',
          type: 'Waste Accumulation Warning',
          match: '89% Match',
          severityClass: 'error',
          title: 'Connaught Place Outer Circle',
          description: 'Commercial waste dumps detected near transit hubs. Rapid pile-up predicted to block pedestrian paths within 48h.',
          slaImpact: 'SLA Impact: Avoids health hazard',
          status: 'Priority Escalated'
        },
        {
          id: 'pred-2',
          type: 'Illumination Gap Risk',
          match: '81% Match',
          severityClass: 'warning-deep',
          title: 'Ring Road (Lajpat Nagar)',
          description: 'Dark patches identified due to consecutive faulty streetlights. Elevates safety risks during peak night traffic.',
          slaImpact: 'SLA Impact: Prevent dark spots',
          status: 'Crew Scheduled'
        }
      ];
    } else if (city.toLowerCase().includes('mumbai')) {
      return [
        {
          id: 'pred-1',
          type: 'Monsoon Water Logging Risk',
          match: '95% Match',
          severityClass: 'error',
          title: 'Hindmata Junction (Dadar)',
          description: 'High precipitation forecasts combined with clogged drainage inlets. Immediate drainage pump activation recommended.',
          slaImpact: 'SLA Impact: Prevent transit halt',
          status: 'Escalated to BMC'
        },
        {
          id: 'pred-2',
          type: 'Road Degradation Risk',
          match: '83% Match',
          severityClass: 'warning-deep',
          title: 'Western Express Highway (Andheri)',
          description: 'Pothole expansion detected near flyover joints under heavy transit loads. Requires overnight asphalt micro-surfacing.',
          slaImpact: 'SLA Impact: Avoid traffic delays',
          status: 'Schedule Patching'
        }
      ];
    } else {
      return [
        {
          id: 'pred-1',
          type: 'Civic Risk Warning',
          match: '85% Match',
          severityClass: 'error',
          title: `${city} Central Market Area`,
          description: `Localized citizen reports indicate building civic density risks. Infrastructure audit recommended for ${city} municipal ward.`,
          slaImpact: 'SLA Impact: Prevent congestion',
          status: 'Review Dispatch'
        },
        {
          id: 'pred-2',
          type: 'Infrastructure Deterioration',
          match: '75% Match',
          severityClass: 'warning-deep',
          title: `${city} Sector 3 Bypass`,
          description: `Repetitive surface defects logged by residents. Preventive road maintenance recommended before deterioration extends.`,
          slaImpact: 'SLA Impact: Lowers repair cost',
          status: 'Inspection Logged'
        }
      ];
    }
  };

  const [predictiveInsights, setPredictiveInsights] = useState<any[]>([]);
  const [isLoadingPredictive, setIsLoadingPredictive] = useState(false);

  useEffect(() => {
    // Generate fallback first
    const fallbacks = getFallbackPredictiveInsights();
    setPredictiveInsights(fallbacks);

    if (!apiKey) return;

    const fetchAIPredictions = async () => {
      setIsLoadingPredictive(true);
      try {
        const issuesSummary = issues.map(i => ({
          category: i.category,
          title: i.title,
          severity: i.severity,
          address: i.address || i.city
        }));

        const prompt = `Analyze the active civic issues in ${currentLocation.city}, ${currentLocation.state}.
Based on these issues: ${JSON.stringify(issuesSummary)},
and typical urban hot spots in ${currentLocation.city}, generate exactly two realistic, high-fidelity Predictive AI Insights.
Return ONLY a raw JSON array of exactly 2 objects containing these fields:
- "id": string (unique)
- "type": string (e.g. "Pipeline Burst Risk", "Road Deterioration", "Waste Accumulation Warning", "Illumination Gap Alert")
- "match": string (e.g., "92% Match", "78% Match")
- "severityClass": string (either "error" for High/Critical or "warning-deep" for Medium/Low risk colors)
- "title": string (an actual neighborhood sector/road in ${currentLocation.city}, e.g. "Connaught Place Outer Circle" if in Delhi)
- "description": string (1-2 sentences of realistic AI-predicted civic risk description, matching the type and location)
- "slaImpact": string (e.g. "SLA Impact: Avoids 40h outage")
- "status": string (e.g. "Priority Escalated", "Schedule Patching", "Clean Patrol Scheduled")
Do not include any markdown formatting, backticks, or introduction text. Only return the raw JSON array.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }]
          })
        });

        if (response.ok) {
          const result = await response.json();
          let responseText = result.candidates[0].content.parts[0].text.trim();
          responseText = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
          const parsed = JSON.parse(responseText);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPredictiveInsights(parsed);
          }
        }
      } catch (err) {
        console.error('Error fetching AI predictive insights:', err);
      } finally {
        setIsLoadingPredictive(false);
      }
    };

    const timer = setTimeout(() => {
      fetchAIPredictions();
    }, 200);

    return () => clearTimeout(timer);
  }, [currentLocation.city, issues, apiKey]);

  return (
    <div className="space-y-6">
      {/* Top Grid: Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-canvas border border-hairline p-5 rounded-lg shadow-level2">
          <p className="text-[10px] font-mono font-bold text-mute uppercase tracking-wider">{t.healthIndex}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold tracking-tight text-success">{healthIndex}%</span>
            <span className="text-xs text-mute font-mono">{t.good}</span>
          </div>
          <div className="h-1.5 w-full bg-canvas-soft-2 rounded-full mt-2.5 overflow-hidden">
            <div className="h-full bg-success" style={{ width: `${healthIndex}%` }}></div>
          </div>
        </div>

        <div className="bg-canvas border border-hairline p-5 rounded-lg shadow-level2">
          <p className="text-[10px] font-mono font-bold text-mute uppercase tracking-wider">{t.avgResolution}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold tracking-tight text-primary">34.2 hrs</span>
            <span className="text-xs text-success font-semibold">-5.4% wk</span>
          </div>
          <p className="text-[10px] text-mute font-mono mt-2.5">Target SLA: 48.0 hours</p>
        </div>

        <div className="bg-canvas border border-hairline p-5 rounded-lg shadow-level2">
          <p className="text-[10px] font-mono font-bold text-mute uppercase tracking-wider">{t.activeReports}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold tracking-tight text-primary">{activeIssues}</span>
            <span className="text-xs text-mute font-mono">Issues pending</span>
          </div>
          <p className="text-[10px] text-mute font-mono mt-2.5">Assigned to field crews</p>
        </div>

        <div className="bg-canvas border border-hairline p-5 rounded-lg shadow-level2">
          <p className="text-[10px] font-mono font-bold text-mute uppercase tracking-wider">{t.citizensEngaged}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold tracking-tight text-primary">{totalEngaged}</span>
            <span className="text-xs text-success font-semibold">+{todayEngaged} today</span>
          </div>
          <p className="text-[10px] text-mute font-mono mt-2.5">In {activeZone}</p>
        </div>
      </div>

      {/* Mid Row: Category Distribution Chart & Predictive Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <div className="bg-canvas border border-hairline rounded-lg p-5 shadow-level2 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-primary mb-1">{t.issueDistribution}</h3>
            <p className="text-xs text-body mb-4">{t.distributionDesc}</p>
          </div>

          <div className="space-y-3">
            {categories.map(cat => {
              const count = counts[cat] || 0;
              const percentage = Math.round((count / maxCount) * 100);
              const color = categoryColors[cat] || 'bg-primary';

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-primary font-medium">{t[categoryKeyMap[cat]] || cat}</span>
                    <span className="text-mute font-bold">{count} reported</span>
                  </div>
                  <div className="h-6 w-full bg-canvas-soft-2 border border-hairline rounded overflow-hidden flex items-center relative">
                    <div className={`h-full ${color} opacity-80 transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                    <span className="absolute left-3 text-[10px] font-mono text-primary font-bold z-10">{percentage}% strength</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Predictive AI Insights */}
        <div className="bg-canvas border border-hairline rounded-lg p-5 shadow-level2 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" className="text-violet-deep"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <h3 className="text-sm font-bold text-primary">{t.predictiveAi}</h3>
          </div>
          <p className="text-xs text-body mb-4">{t.predictiveDesc}</p>
          
          {isLoadingPredictive ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map(n => (
                <div key={n} className="border border-hairline bg-canvas-soft-2 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-20 bg-canvas-soft rounded"></div>
                    <div className="h-3 w-10 bg-canvas-soft rounded"></div>
                  </div>
                  <div className="h-4 w-3/4 bg-canvas-soft rounded"></div>
                  <div className="h-3 w-full bg-canvas-soft rounded"></div>
                  <div className="h-3 w-5/6 bg-canvas-soft rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[250px] pr-1">
              {predictiveInsights.map(insight => {
                const badgeColor = insight.severityClass === 'error' 
                  ? 'bg-error-soft text-error border-error/15'
                  : 'bg-warning-soft text-warning-deep border-warning-deep/15';
                const matchColor = insight.severityClass === 'error' ? 'text-error' : 'text-warning-deep';
                
                return (
                  <div key={insight.id} className="border border-hairline hover:border-violet-soft bg-canvas-soft-2 p-3 rounded-lg space-y-1.5 transition">
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-[9px] border px-1.5 py-0.5 rounded font-bold uppercase ${badgeColor}`}>{insight.type}</span>
                      <span className={`text-[10px] font-bold font-mono ${matchColor}`}>{insight.match}</span>
                    </div>
                    <h4 className="text-[12px] font-bold text-primary">{insight.title}</h4>
                    <p className="text-[11px] text-body leading-relaxed">{insight.description}</p>
                    <div className="text-[10px] text-mute font-mono border-t border-hairline/60 pt-1.5 mt-1 flex justify-between">
                      <span>{insight.slaImpact}</span>
                      <span className="text-violet-deep font-semibold">{insight.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
