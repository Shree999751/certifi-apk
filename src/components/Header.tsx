import React, { useState, useEffect, useRef } from 'react';
import type { UserProfile } from './initialIssues';

interface HeaderProps {
  activeCount: number;
  resolvedCount: number;
  points: number;
  level: number;
  onOpenApiModal: () => void;
  currentLocation: { city: string; state: string; lat: number; lng: number };
  onLocationChange: (location: { city: string; state: string; lat: number; lng: number }) => void;
  currentLanguage: string;
  onLanguageChange: (lang: any) => void;
  t: Record<string, string>;
  currentUser: UserProfile | null;
  onLogout: () => void;
  dbStatus: 'local' | 'firebase';
}

export const Header: React.FC<HeaderProps> = ({
  activeCount,
  resolvedCount,
  points,
  level,
  onOpenApiModal,
  currentLocation,
  onLocationChange,
  currentLanguage,
  onLanguageChange,
  t,
  currentUser,
  onLogout,
  dbStatus
}) => {
  const prevLvlXp = (level - 1) * 100;
  const percent = Math.max(0, Math.min(((points - prevLvlXp) / 100) * 100, 100));

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync input value with current location on load or change
  useEffect(() => {
    if (currentLocation) {
      setSearchQuery(`${currentLocation.city}, ${currentLocation.state}`);
    }
  }, [currentLocation]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Debounced search fetch to Nominatim
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    // Don't search if the input matches current location exactly
    if (currentLocation && searchQuery === `${currentLocation.city}, ${currentLocation.state}`) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&addressdetails=1`;
        const res = await fetch(url, {
          headers: {
            'Accept': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, currentLocation]);

  const handleSelectSuggestion = (item: any) => {
    const addr = item.address || {};
    const city = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || item.display_name.split(',')[0];
    const state = addr.state || addr.county || addr.country || '';
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    onLocationChange({ city, state, lat, lng });
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <header className="sticky top-0 z-[1000] h-16 w-full border-b border-hairline bg-canvas/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between">
      {/* Left Side: Logo */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-on-primary font-mono font-bold text-lg select-none">
          H
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="font-mono uppercase tracking-widest text-[11px] font-bold text-primary">{t.appName}</span>
          <span className="text-sm font-semibold tracking-tight text-ink mt-[-2px] flex items-center gap-1.5">
            <span>Local Hero</span>
            {dbStatus === 'firebase' ? (
              <span className="text-[9px] bg-success/10 text-success border border-success/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                <span className="inline-block w-1.5 h-1.5 bg-success rounded-full"></span>
                <span>Live DB</span>
              </span>
            ) : (
              <span className="text-[9px] bg-canvas-soft-3 text-mute border border-hairline px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                Local Mode
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Center: Location Search Input */}
      <div className="relative flex-1 max-w-[140px] sm:max-w-sm mx-1 sm:mx-4" ref={dropdownRef}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder={t.searchPlaceholder}
            className="w-full h-9 pl-9 pr-8 text-xs bg-canvas-soft border border-hairline hover:border-hairline-strong focus:border-hairline-strong focus:outline-none rounded-full font-mono transition"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute text-xs select-none">
            📍
          </span>
          {isLoading && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 select-none flex h-3 w-3">
              <span className="animate-spin h-full w-full border-2 border-t-transparent border-primary rounded-full"></span>
            </span>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-10 left-0 w-full bg-canvas border border-hairline rounded-lg shadow-level4 z-[2000] overflow-hidden divide-y divide-hairline animate-fade-in animate-slide-up">
            {suggestions.map((item, idx) => {
              const addr = item.address || {};
              const city = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || item.display_name.split(',')[0];
              const state = addr.state || addr.county || addr.country || '';
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-4 py-2 hover:bg-canvas-soft-2 transition text-xs flex flex-col gap-0.5 cursor-pointer active-press"
                >
                  <span className="font-bold text-primary truncate">{city}</span>
                  <span className="text-[10px] text-mute font-mono truncate">{state || item.display_name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Side: User Profile XP, Language Selection & Settings */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Localized stats counts */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono text-body mr-1">
          <div>
            <span className="text-mute">{t.activeReports}:</span>
            <span className="font-semibold text-primary ml-1">{activeCount}</span>
          </div>
          <div>
            <span className="text-mute">{t.resolved}:</span>
            <span className="font-semibold text-primary ml-1">{resolvedCount}</span>
          </div>
        </div>

        {/* Language selector pill */}
        <div className="flex items-center gap-1 bg-canvas-soft-2 border border-hairline py-1 px-2.5 rounded-full select-none">
          <span className="text-[11px] text-mute font-mono">🌐</span>
          <select
            value={currentLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="text-xs font-semibold text-primary font-mono bg-transparent border-none outline-none cursor-pointer focus:ring-0 pr-1 py-0"
          >
            <option value="en">EN</option>
            <option value="hi">हि</option>
            <option value="kn">ಕ</option>
            <option value="ta">த</option>
            <option value="te">తె</option>
            <option value="mr">म</option>
          </select>
        </div>

        {/* User stats or Role badge */}
        {currentUser?.role === 'admin' ? (
          <div className="flex items-center gap-1.5 bg-violet-soft/30 border border-violet-soft text-violet-deep py-1 px-3 rounded-full select-none">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">MUNICIPAL OFFICER</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 bg-canvas-soft-2 border border-hairline py-1 px-3 rounded-full select-none">
            <span className="text-xs text-mute font-mono">{t.points}</span>
            <span className="text-xs font-semibold text-primary font-mono">{points}</span>
            <div className="h-2 w-16 bg-hairline rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${percent}%` }}></div>
            </div>
            <span className="text-[10px] bg-primary text-on-primary px-1.5 py-0.5 rounded-full font-bold">{t.level} {level}</span>
          </div>
        )}

        {/* User details and logout */}
        {currentUser && (
          <div className="flex items-center gap-1.5 sm:gap-3 border-l border-hairline pl-1.5 sm:pl-3">
            <span className="hidden md:inline text-xs font-bold text-primary truncate max-w-[100px] sm:max-w-[150px]" title={currentUser.fullName}>
              {currentUser.username}
            </span>
            <button
              onClick={onLogout}
              className="h-8 border border-error/20 bg-error-soft/10 text-error hover:bg-error-soft/30 px-2 sm:px-3 text-[10px] sm:text-xs font-semibold rounded-full transition cursor-pointer active-press"
            >
              Logout
            </button>
          </div>
        )}

        {/* AI Configuration Button */}
        <button 
          onClick={onOpenApiModal}
          className="h-8 border border-hairline rounded-full bg-canvas text-ink px-2 sm:px-3 flex items-center gap-1 sm:gap-1.5 text-xs font-medium hover:bg-canvas-soft-2 active:bg-hairline transition shadow-level2 cursor-pointer active-press"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-cyan-deep"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 6Z"/><path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/></svg>
          <span className="hidden sm:inline">System Settings</span>
        </button>
      </div>
    </header>
  );
};
