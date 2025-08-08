import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxMapProps {
  darkMode: boolean;
  viewMode?: string;
  selectedPhase?: string;
  selectedBlock?: string;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ 
  darkMode, 
  viewMode, 
  selectedPhase, 
  selectedBlock,
  center = [112.823, 2.919], // Default to Singapore (longitude, latitude)
  zoom = 13,
  className = "h-96 w-full"
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return; // Initialize map only once
    
    // Set your Mapbox access token
    mapboxgl.accessToken = 'pk.eyJ1IjoieGpwMiIsImEiOiJjbWJ4eXl6MjYxZTN4Mmpwd2sxb3VzbGZoIn0.Xu5amGQP_HSFbnq4N_3ITQ';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: darkMode
        ? 'mapbox://styles/xjp2/cmdg3x5kc01u501sb9r6i0l35' 
        : 'mapbox://styles/xjp2/cmdg3x5kc01u501sb9r6i0l35',
      center: center,
      zoom: zoom
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add sample marker
    new mapboxgl.Marker()
      .setLngLat(center)
      .setPopup(new mapboxgl.Popup().setHTML('<h3>Field Location</h3>'))
      .addTo(map.current);

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom]);

  // Update map style when dark mode changes
  useEffect(() => {
    if (map.current) {
      const newStyle = darkMode 
        ? 'mapbox://styles/xjp2/cmdg3x5kc01u501sb9r6i0l35' 
        : 'mapbox://styles/xjp2/cmdg3x5kc01u501sb9r6i0l35';
      map.current.setStyle(newStyle);
    }
  }, [darkMode]);

  // Handle view mode changes (you can expand this based on your needs)
  useEffect(() => {
    if (map.current && viewMode) {
      // Add logic here to update map based on viewMode, selectedPhase, selectedBlock
      console.log(`View mode changed to: ${viewMode}`, { selectedPhase, selectedBlock });
    }
  }, [viewMode, selectedPhase, selectedBlock]);

  return (
    <div 
      ref={mapContainer} 
      className={className}
      style={{ minHeight: '384px' }}
    />
  );
};

export default MapboxMap;
