import React, { useState, useEffect, useRef } from 'react';

interface ReportModalProps {
  isOpen: boolean;
  lat: number | null;
  lng: number | null;
  onClose: () => void;
  onSubmitIssue: (issue: {
    title: string;
    description: string;
    category: 'Pothole' | 'Waste Management' | 'Damaged Streetlight' | 'Water Leakage' | 'Public Infrastructure' | 'Other';
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    lat: number;
    lng: number;
    image: string;
    video: string;
    actionPlan: string;
    address: string;
  }) => void;
  t: Record<string, string>;
  currentLocation: { city: string; state: string; lat: number; lng: number };
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  lat,
  lng,
  onClose,
  onSubmitIssue,
  t,
  currentLocation
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Pothole' | 'Waste Management' | 'Damaged Streetlight' | 'Water Leakage' | 'Public Infrastructure' | 'Other'>('Pothole');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [address, setAddress] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [imageBase64, setImageBase64] = useState('');
  const [imageName, setImageName] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Video Complaint upload states
  const [videoBase64, setVideoBase64] = useState('');
  const [videoName, setVideoName] = useState('');
  const [isVideoValidating, setIsVideoValidating] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processVideo(e.target.files[0]);
    }
  };

  const processVideo = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file.');
      return;
    }
    
    setIsVideoValidating(true);
    
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;
      setIsVideoValidating(false);
      
      if (duration < 30 || duration > 60) {
        alert(`Video duration validation failed: Video must be between 30 seconds and 60 seconds (1 minute). Currently: ${Math.round(duration)} seconds.`);
        setVideoBase64('');
        setVideoName('');
        if (videoInputRef.current) videoInputRef.current.value = '';
        return;
      }
      
      setVideoName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setVideoBase64(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    };

    video.onerror = () => {
      setIsVideoValidating(false);
      alert('Failed checking video file properties.');
    };

    video.src = URL.createObjectURL(file);
  };

  const triggerVideoSelect = () => {
    videoInputRef.current?.click();
  };

  // Autocomplete coordinates and search states
  const [modalLat, setModalLat] = useState<number | null>(null);
  const [modalLng, setModalLng] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const autocompleteTimeout = useRef<any>(null);

  // Sync coords from props when modal is opened or props update
  useEffect(() => {
    if (isOpen) {
      setModalLat(lat);
      setModalLng(lng);
    }
  }, [lat, lng, isOpen]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);

    if (autocompleteTimeout.current) {
      clearTimeout(autocompleteTimeout.current);
    }

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    autocompleteTimeout.current = setTimeout(async () => {
      setIsSearchingSuggestions(true);
      try {
        const query = `${value}, ${currentLocation.city}, ${currentLocation.state}`;
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
        const res = await fetch(url, {
          headers: {
            'Accept-Language': 'en'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data || []);
        }
      } catch (err) {
        console.error('Autocomplete fetch error:', err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 400);
  };

  // Reverse geocode when coordinates are provided (clicked on map)
  useEffect(() => {
    if (isOpen && lat !== null && lng !== null) {
      const reverseGeocode = async () => {
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            const displayName = data.display_name || '';
            const parts = displayName.split(',');
            const shortAddress = parts.slice(0, 3).map((p: string) => p.trim()).join(', ');
            setAddress(shortAddress);
          }
        } catch (err) {
          console.error('Error reverse geocoding clicked coordinates:', err);
        }
      };
      reverseGeocode();
    } else {
      setAddress('');
    }
  }, [lat, lng, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    setImageName(file.name);
    setAiSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageBase64(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAiAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageBase64) return;

    setAiAnalyzing(true);
    setAiSuccess(false);

    const apiKey = localStorage.getItem('gemini_api_key');

    if (!apiKey) {
      // Heuristic Mock Fallback
      setTimeout(() => {
        const name = imageName.toLowerCase();
        let cat: typeof category = 'Other';
        let sev: typeof severity = 'Medium';
        let tPrompt = 'Reported Infrastructure Issue';
        let dPrompt = 'Detected issue that requires review and repair.';
        let action = 'Schedule inspection of location details.';

        if (name.includes('pothole') || name.includes('road') || name.includes('pave')) {
          cat = 'Pothole';
          sev = 'High';
          tPrompt = 'Pothole reported on segment road';
          dPrompt = 'Pothole detected from photo upload. Requires structural re-layering.';
          action = 'Fill hole with standard quick asphalt repair patching.';
        } else if (name.includes('trash') || name.includes('garbage') || name.includes('waste') || name.includes('litter')) {
          cat = 'Waste Management';
          sev = 'Medium';
          tPrompt = 'Piles of uncollected garbage';
          dPrompt = 'Overflowing waste pile detected. Attracting pests.';
          action = 'Deploy regional garbage transport compactor.';
        } else if (name.includes('light') || name.includes('lamp') || name.includes('dark')) {
          cat = 'Damaged Streetlight';
          sev = 'Medium';
          tPrompt = 'Broken or dim streetlight fixture';
          dPrompt = 'Fixture is inactive or damaged, causing low visibility.';
          action = 'Replace bulb or inspect circuit breaker pole.';
        } else if (name.includes('water') || name.includes('leak') || name.includes('pipe') || name.includes('burst')) {
          cat = 'Water Leakage';
          sev = 'Critical';
          tPrompt = 'Active water pipeline leakage';
          dPrompt = 'Burst pipeline flooding the road, causing waste.';
          action = 'Shut main valve and replace damaged pipe joints.';
        }

        setCategory(cat);
        setSeverity(sev);
        setTitle(tPrompt);
        setDescription(dPrompt);
        setActionPlan(action);
        
        setAiAnalyzing(false);
        setAiSuccess(true);
      }, 1500);
      return;
    }

    // Call Gemini API
    try {
      const base64Data = imageBase64.split(',')[1];
      const mimeType = imageBase64.split(';')[0].split(':')[1];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "Analyze the reported civic issue shown in this image. Respond with a raw JSON object containing exactly these properties: 'category' (must be one of: 'Pothole', 'Waste Management', 'Damaged Streetlight', 'Water Leakage', 'Public Infrastructure', or 'Other'), 'severity' (must be one of: 'Low', 'Medium', 'High', 'Critical'), 'title' (a short headline of the issue), 'description' (a brief description explaining the problem), and 'actionPlan' (a short 1-sentence recommendation on how the city should resolve this). Do not include any markdown fences or triple backticks in your output, just return raw JSON."
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              }
            ]
          }]
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const result = await response.json();
      const responseText = result.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(responseText.trim().replace(/^```json/, '').replace(/```$/, ''));

      if (parsed.category) setCategory(parsed.category);
      if (parsed.severity) setSeverity(parsed.severity);
      if (parsed.title) setTitle(parsed.title);
      if (parsed.description) setDescription(parsed.description);
      if (parsed.actionPlan) setActionPlan(parsed.actionPlan);
      
      setAiSuccess(true);
    } catch (err) {
      console.error(err);
      alert('AI analysis failed. Please verify your API key, or write the details manually.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let finalLat = modalLat;
    let finalLng = modalLng;

    // If coordinates are null, geocode the address
    if (finalLat === null || finalLng === null) {
      try {
        const query = `${address}, ${currentLocation.city}, ${currentLocation.state}`;
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            finalLat = parseFloat(data[0].lat);
            finalLng = parseFloat(data[0].lon);
          }
        }
      } catch (err) {
        console.error('Error geocoding address:', err);
      }
    }

    // Default Fallback coordinates if search fails
    if (finalLat === null || finalLng === null) {
      finalLat = currentLocation.lat + (Math.random() - 0.5) * 0.015;
      finalLng = currentLocation.lng + (Math.random() - 0.5) * 0.015;
    }

    const finalActionPlan = actionPlan || ('Surveyor queue inspection scheduled to repair ' + category.toLowerCase() + ' hazards.');

    onSubmitIssue({
      title,
      description,
      category,
      severity,
      lat: finalLat,
      lng: finalLng,
      image: imageBase64,
      video: videoBase64,
      actionPlan: finalActionPlan,
      address: address || `${currentLocation.city}, ${currentLocation.state}`
    });

    // Reset Form states
    setTitle('');
    setDescription('');
    setCategory('Pothole');
    setSeverity('Medium');
    setImageBase64('');
    setImageName('');
    setVideoBase64('');
    setVideoName('');
    setActionPlan('');
    setAddress('');
    setAiSuccess(false);
    setIsSubmitting(false);
    setModalLat(null);
    setModalLng(null);
    setSuggestions([]);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-primary/40 backdrop-blur-md"></div>

      {/* Modal Card */}
      <div className="relative bg-canvas border border-hairline rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-level5 z-10 flex flex-col p-6 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline pb-4 mb-4">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            <h2 className="text-base font-bold text-primary">{t.reportButton}</h2>
          </div>
          <button onClick={onClose} className="text-mute hover:text-primary transition p-1 hover:bg-canvas-soft-2 rounded cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          
          {/* Evidence Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Image Evidence Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-body">{t.evidencePhoto}</label>
              
              <div 
                onClick={triggerFileSelect}
                className="border-2 border-dashed border-hairline hover:border-hairline-strong rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer bg-canvas-soft transition duration-150 h-28"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*" 
                />
                
                {!imageBase64 ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="text-mute mb-1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    <p className="text-[11px] font-semibold text-primary">{t.dragDrop}</p>
                    <p className="text-[9px] text-mute font-mono mt-0.5">{t.supportedFiles}</p>
                  </div>
                ) : (
                  <div className="w-full flex items-center gap-3">
                    <img className="h-20 w-20 object-cover rounded border border-hairline" src={imageBase64} alt="Evidence preview" />
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-[11px] font-semibold text-primary truncate max-w-[120px]">{imageName}</p>
                      
                      <button 
                        type="button" 
                        onClick={handleAiAnalyze}
                        disabled={aiAnalyzing}
                        className="h-7 mt-1.5 border border-hairline rounded-full bg-canvas text-primary hover:bg-canvas-soft-2 px-2.5 flex items-center gap-1 text-[10px] font-semibold shadow-level2 transition cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" className="text-cyan-deep animate-pulse"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/></svg>
                        <span>Analyze</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {aiAnalyzing && (
                <div className="flex items-center gap-1.5 bg-canvas-soft-2 border border-hairline py-1 px-2.5 rounded text-[10px] font-mono">
                  <div className="h-3 w-3 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
                  <span className="text-body">{t.aiAnalyzing}</span>
                </div>
              )}

              {aiSuccess && (
                <div className="flex items-center gap-1 text-[10px] font-mono text-success font-semibold px-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>AI Autodetected!</span>
                </div>
              )}
            </div>

            {/* Video Evidence Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-body">Video Evidence (Optional)</label>
              
              <div 
                onClick={triggerVideoSelect}
                className="border-2 border-dashed border-hairline hover:border-hairline-strong rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer bg-canvas-soft transition duration-150 h-28"
              >
                <input 
                  type="file" 
                  ref={videoInputRef} 
                  onChange={handleVideoChange} 
                  className="hidden" 
                  accept="video/*" 
                />
                
                {!videoBase64 ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="text-mute mb-1"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
                    <p className="text-[11px] font-semibold text-primary">Upload Video Complain</p>
                    <p className="text-[9px] text-mute font-mono mt-0.5">30 sec to 1 min limit</p>
                  </div>
                ) : (
                  <div className="w-full flex items-center gap-3">
                    <div className="h-20 w-20 bg-canvas border border-hairline rounded flex items-center justify-center text-xl select-none">
                      🎬
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-[11px] font-semibold text-primary truncate max-w-[120px]">{videoName}</p>
                      <p className="text-[9px] text-success font-mono mt-1 font-bold">✓ Duration Verified</p>
                    </div>
                  </div>
                )}
              </div>

              {isVideoValidating && (
                <div className="flex items-center gap-1.5 bg-canvas-soft-2 border border-hairline py-1 px-2.5 rounded text-[10px] font-mono">
                  <div className="h-3 w-3 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
                  <span className="text-body">Verifying clip duration...</span>
                </div>
              )}
            </div>
          </div>

          {/* Location details instead of coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-body">{t.cityState}</label>
              <input 
                type="text" 
                value={`${currentLocation.city}, ${currentLocation.state}`}
                readOnly
                disabled
                className="w-full h-10 border border-hairline bg-canvas-soft-2 rounded px-3 text-sm text-mute font-mono select-none" 
              />
            </div>
            <div className="space-y-1 relative">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-body">{t.areaLandmark}</label>
              <input 
                type="text" 
                value={address}
                onChange={handleAddressChange}
                required 
                className="w-full h-10 border border-hairline bg-canvas rounded px-3 text-sm text-ink focus:outline-none focus:border-hairline-strong font-mono" 
                placeholder={t.addressPlaceholder}
                autoComplete="off" 
              />
              
              {/* Autocomplete Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 top-[66px] mt-1 bg-canvas border border-hairline rounded-lg shadow-level4 max-h-48 overflow-y-auto z-[6000] divide-y divide-hairline animate-fade-in animate-slide-up">
                  {suggestions.map((s, idx) => {
                    const shortName = s.display_name.split(',').slice(0, 3).map((p: string) => p.trim()).join(', ');
                    return (
                      <li
                        key={idx}
                        onClick={() => {
                          setAddress(shortName);
                          setModalLat(parseFloat(s.lat));
                          setModalLng(parseFloat(s.lon));
                          setSuggestions([]);
                        }}
                        className="p-2.5 text-xs hover:bg-canvas-soft-2 cursor-pointer truncate text-body flex flex-col text-left transition duration-150 active-press"
                      >
                        <span className="font-semibold text-primary">{shortName}</span>
                        <span className="text-[10px] text-mute truncate mt-0.5">{s.display_name}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
              
              {isSearchingSuggestions && (
                <div className="absolute right-3 top-8 flex items-center">
                  <div className="h-3.5 w-3.5 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* Category & Severity Select */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-body">{t.category}</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                required 
                className="w-full h-10 border border-hairline bg-canvas rounded px-3 text-sm text-ink focus:outline-none focus:border-hairline-strong font-mono"
              >
                <option value="Pothole">{t.pothole}</option>
                <option value="Waste Management">{t.wasteManagement}</option>
                <option value="Damaged Streetlight">{t.streetlight}</option>
                <option value="Water Leakage">{t.waterLeakage}</option>
                <option value="Public Infrastructure">{t.infrastructure}</option>
                <option value="Other">{t.other}</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-body">{t.severity}</label>
              <select 
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                required 
                className="w-full h-10 border border-hairline bg-canvas rounded px-3 text-sm text-ink focus:outline-none focus:border-hairline-strong font-mono"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-1">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-body">{t.issueTitle}</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required 
              className="w-full h-10 border border-hairline bg-canvas rounded px-3 text-sm text-ink focus:outline-none focus:border-hairline-strong" 
              placeholder="e.g. Broken streetlight pole on 5th Main" 
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-body">{t.detailedDesc}</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required 
              rows={3} 
              className="w-full border border-hairline bg-canvas rounded p-3 text-sm text-ink focus:outline-none focus:border-hairline-strong" 
              placeholder="Describe the issue, landmarks, hazard level, and details to help verify..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-hairline mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="h-10 border border-hairline rounded-full bg-canvas text-body hover:bg-canvas-soft-2 px-5 text-sm font-semibold transition cursor-pointer active-press"
            >
              {t.cancelBtn}
            </button>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="h-10 border border-hairline rounded-full bg-primary text-on-primary hover:bg-primary/90 px-6 text-sm font-semibold transition flex items-center gap-1.5 shadow-level4 cursor-pointer disabled:opacity-55 active-press"
            >
              <span>{isSubmitting ? "Saving..." : t.submitBtn}</span>
              {!isSubmitting && <span className="text-xs bg-canvas/10 px-1.5 py-0.5 rounded-full font-mono text-[9px]">+50 XP</span>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
