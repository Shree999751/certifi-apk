import React, { useEffect, useRef } from 'react';
import type { CivicIssue } from './initialIssues';

interface MapContainerProps {
  issues: CivicIssue[];
  onSelectCoordinates: (lat: number, lng: number) => void;
  onInspectIssue: (id: string) => void;
  centerLat: number;
  centerLng: number;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  issues,
  onSelectCoordinates,
  onInspectIssue,
  centerLat,
  centerLng
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersGroup = useRef<any>(null);

  // Initialize Map
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapRef.current || mapInstance.current) return;

    // Centered at default coordinates
    mapInstance.current = L.map(mapRef.current).setView([centerLat, centerLng], 13);

    // Vercel-style clean map tiles (Positron by CartoDB)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(mapInstance.current);

    markersGroup.current = L.layerGroup().addTo(mapInstance.current);

    // Handle Click on Map -> Trigger coordinate selection
    mapInstance.current.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      onSelectCoordinates(lat, lng);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markersGroup.current = null;
      }
    };
  }, []);

  // Recenter Map dynamically when centerLat / centerLng change
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapInstance.current) return;
    mapInstance.current.setView([centerLat, centerLng], 13);
  }, [centerLat, centerLng]);

  // Update Markers when issues change
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapInstance.current || !markersGroup.current) return;

    markersGroup.current.clearLayers();

    const getMarkerIcon = (category: string) => {
      let color = '#171717'; // default ink
      if (category === 'Pothole') color = '#ff4d4d'; // Red
      else if (category === 'Waste Management') color = '#f9cb28'; // Yellow
      else if (category === 'Damaged Streetlight') color = '#7928ca'; // Purple
      else if (category === 'Water Leakage') color = '#0070f3'; // Blue
      else if (category === 'Public Infrastructure') color = '#50e3c2'; // Teal

      return L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="marker-pin" style="background-color: ${color}"></div>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42]
      });
    };

    issues.forEach(issue => {
      if (!issue.lat || !issue.lng) return;

      const marker = L.marker([issue.lat, issue.lng], {
        icon: getMarkerIcon(issue.category)
      });

      const statusColors: Record<string, string> = {
        'Reported': 'bg-warning-soft text-warning-deep border-warning-deep/20',
        'Under Review': 'bg-cyan-soft text-cyan-deep border-cyan-deep/20',
        'In Progress': 'bg-link-bg-soft text-link border-link/20',
        'Resolved': 'bg-success/10 text-success border-success/20'
      };

      const statusColor = statusColors[issue.status] || 'bg-canvas-soft text-body border-hairline';

      const popupContent = document.createElement('div');
      popupContent.className = 'p-3 font-sans max-w-[240px]';
      popupContent.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="text-[10px] font-bold font-mono uppercase bg-canvas-soft-2 px-1.5 py-0.5 rounded border border-hairline">${issue.category}</span>
          <span class="text-[9px] px-1.5 py-0.5 rounded border font-semibold ${statusColor}">${issue.status}</span>
        </div>
        <h3 class="text-sm font-bold text-primary mb-1 truncate">${issue.title}</h3>
        <p class="text-xs text-body mb-2.5 line-clamp-2">${issue.description}</p>
        <div class="flex items-center justify-between border-t border-hairline pt-2 text-[10px] text-mute font-mono">
          <span>Verified: ${issue.upvotes}</span>
          <button class="font-bold text-primary hover:underline inspect-btn-trigger cursor-pointer">Inspect details &rarr;</button>
        </div>
      `;

      // Set click listener on popup inspect button
      const inspectBtn = popupContent.querySelector('.inspect-btn-trigger');
      if (inspectBtn) {
        inspectBtn.addEventListener('click', () => {
          onInspectIssue(issue.id);
        });
      }

      marker.bindPopup(popupContent).addTo(markersGroup.current);
    });
  }, [issues, onInspectIssue]);

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapInstance.current) {
          mapInstance.current.setView([latitude, longitude], 15);
          onSelectCoordinates(latitude, longitude);
        }
      },
      (error) => {
        console.error("GPS retrieval failed:", error);
        alert("GPS retrieval failed: " + error.message);
      }
    );
  };

  return (
    <div className="relative w-full h-full min-h-[320px] sm:min-h-[400px] lg:min-h-[580px] border border-hairline bg-canvas rounded-lg overflow-hidden shadow-level2">
      <div ref={mapRef} className="w-full h-full z-10"></div>
      
      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-canvas/90 backdrop-blur-md border border-hairline py-2 px-3 rounded-md shadow-level3 max-w-[200px] text-xs font-mono select-none">
        <h4 className="font-bold text-primary mb-1 text-[11px] uppercase tracking-wider">Issue Categories</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ff4d4d' }}></span>
            <span className="text-body text-[11px]">Pothole</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f9cb28' }}></span>
            <span className="text-body text-[11px]">Waste Management</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#7928ca' }}></span>
            <span className="text-body text-[11px]">Streetlight</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#0070f3' }}></span>
            <span className="text-body text-[11px]">Water Leakage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#50e3c2' }}></span>
            <span className="text-body text-[11px]">Public Infrastructure</span>
          </div>
        </div>
      </div>

      {/* Quick Pin Instructions Overlay */}
      <div className="absolute top-4 right-4 z-[1000] bg-canvas/95 border border-hairline py-1.5 px-3 rounded-full shadow-level3 select-none flex items-center gap-2 pointer-events-none">
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <span className="text-[11px] font-mono text-body font-semibold">Click map to report new issue</span>
      </div>

      {/* GPS Locate Me Button Overlay */}
      <button 
        type="button"
        onClick={handleLocateUser}
        className="absolute bottom-4 right-4 z-[1000] h-9 bg-canvas/90 backdrop-blur-md border border-hairline hover:bg-canvas-soft-2 rounded-lg px-3 flex items-center gap-1.5 shadow-level3 text-xs font-mono font-bold text-primary transition cursor-pointer select-none"
      >
        🎯 Locate Me
      </button>
    </div>
  );
};
