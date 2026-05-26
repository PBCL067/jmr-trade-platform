import React, { useState, useEffect, useRef } from 'react';
import { SUPPLIERS } from './data/supplierData';

const SUPPLIER_COORDS = {
  "horizonte_amidos_brazil":  { lat: -24.5585,   lng: -54.0553   },
  "ingredion_argentina":      { lat: -33.802183, lng: -59.504723 },
  "ff_ingredients_argentina":  { lat: -33.6791,   lng: -59.6658   },
  "arcor_argentina":          { lat: -31.430416, lng: -64.185821 },
  "molinos_argentina":        { lat: -34.469212, lng: -58.565254 },
  "aceitera_argentina":       { lat: -32.753836, lng: -63.788122 },
  "semino_argentina":         { lat: -32.853855, lng: -61.155582 },
  "glucovil_argentina":       { lat: -33.651236, lng: -65.528050 },
  "sancor_argentina":         { lat: -30.930953, lng: -61.568856 },
  "mastellone_argentina":     { lat: -34.600300, lng: -58.956298 },
  "almidonera_diesel":        { lat: -26.827870, lng: -55.022889 },
  "femag_argentina":          { lat: -26.894452, lng: -54.998083 },
  "vertrauen_argentina":      { lat: -31.444391, lng: -62.125425 },
  "roquette_argentina":       { lat: -34.000000, lng: -64.000000 },
  "conaprole_uruguay":        { lat: -34.833803, lng: -56.251371 },
  "claldy_uruguay":           { lat: -34.843268, lng: -56.192697 },
  "alur_uruguay":             { lat: -32.256506, lng: -58.083827 },
  "colun_chile":              { lat: -40.295020, lng: -73.081094 },
  "ingredion_brazil":         { lat: -22.360517, lng: -46.917963 },
  "adm_brasil":               { lat: -23.623577, lng: -46.696809 },
  "tereos_brazil":            { lat: -22.738845, lng: -50.207734 },
  "lorenz_brazil":            { lat: -23.709086, lng: -52.622354 },
  "itambe_brazil":            { lat: -19.919628, lng: -43.932578 },
  "amidos_nevada_brazil":     { lat: -23.968374, lng: -55.015524 },
  "fecularia_salto_pilao":    { lat: -24.218674, lng: -54.724072 },
  "ciso_paraguay":            { lat: -25.286156, lng: -57.647000 },
  "insuquim_paraguay":        { lat: -25.296000, lng: -57.620000 },
  "lf_almidones_paraguay":    { lat: -25.250000, lng: -56.020000 },
  "almex_mexico":             { lat:  20.659699, lng: -103.349609 },
  "molino_canuelas":          { lat: -35.057573, lng:  -58.750034 },
  "molino_lagomarsino":       { lat: -34.657030, lng:  -58.371331 },
  "bunge_argentina_flour":    { lat: -32.926615, lng:  -60.660495 },
  "vicentin_argentina":       { lat: -29.117501, lng:  -59.657156 },
  "oleaginosa_moreno":        { lat: -38.733772, lng:  -62.279476 },
  "cofco_argentina":          { lat: -32.944948, lng:  -60.643560 },
  "gelnex_brazil":            { lat: -27.182836, lng:  -52.232586 },
  "pb_leiner_argentina":      { lat: -31.711497, lng:  -60.796016 },
  "gelprime_brazil":          { lat: -23.151103, lng:  -51.005503 },
  "adm_brasil_protein":       { lat: -20.484227, lng:  -54.752301 },
  "iff_brazil_protein":       { lat: -29.851397, lng:  -51.176537 },
  "tate_lyle_gemacom_brazil": { lat: -21.398555, lng:  -43.102979 },
  "molino_chabas":            { lat: -33.237073, lng:  -61.352074 },
  "pili_uruguay":             { lat: -32.693096, lng:  -57.645885 },
  "soprole_chile":            { lat: -33.552290, lng:  -70.700049 },
  "mathiesen_group":          { lat: -33.450000, lng:  -70.670000 },
  "cafagda":                  { lat: -34.603722, lng:  -58.381592 },
  "gruma_mexico":             { lat:  25.702540, lng: -100.231898 },
  "minsa_mexico":             { lat:  19.432608, lng:  -99.133209 },
  "ingredion_colombia":       { lat:   3.462793, lng:  -76.499580 },
  "ingredion_ecuador":        { lat:  -2.170998, lng:  -79.922359 },
  "ingredion_peru":           { lat: -12.015302, lng:  -76.889412 },
  "ingredion_chile":          { lat: -33.450000, lng:  -70.670000 },
  "gruma_centroamerica":      { lat:   9.928069, lng:  -84.090725 },
  "imsa_mexico":              { lat:  20.637400, lng: -103.360249 },
  "gluten_almidones_mexico":  { lat:  19.488081, lng:  -99.163745 },
  "almidones_sucre_colombia": { lat:   9.317155, lng:  -75.334110 },
  "lactolanda_chile":         { lat: -37.470000, lng:  -72.350000 },
  "molino_canuelas":          { lat: -35.057573, lng:  -58.750034 },
  "molino_lagomarsino":       { lat: -34.657030, lng:  -58.371331 },
  "bunge_argentina_flour":    { lat: -32.926615, lng:  -60.660495 },
  "vicentin_argentina":       { lat: -29.117501, lng:  -59.657156 },
  "oleaginosa_moreno":        { lat: -38.733772, lng:  -62.279476 },
  "cofco_argentina":          { lat: -32.944948, lng:  -60.643560 },
  "gelnex_brazil":            { lat: -27.182836, lng:  -52.232586 },
  "pb_leiner_argentina":      { lat: -31.711497, lng:  -60.796016 },
  "gelprime_brazil":          { lat: -23.151103, lng:  -51.005503 },
  "adm_brasil_protein":       { lat: -20.484227, lng:  -54.752301 },
  "iff_brazil_protein":       { lat: -29.851397, lng:  -51.176537 },
};

const CATEGORY_COLORS = {
  'Modified Starch':              '#3b82f6',
  'Dairy':                        '#2ecc71',
  'Edible Oils':                  '#e8b84b',
  'Wheat Flour':                  '#f97316',
  'Gelatin':                      '#a855f7',
  'Soy Protein':                  '#06b6d4',
  'Food Ingredients Distribution':'#6366f1',
  'default':                      '#4a5a70',
};

const SIZE_RADIUS = { Large: 14, Medium: 10, Small: 7 };

function getColor(s) {
  return CATEGORY_COLORS[s.product_category] || CATEGORY_COLORS.default;
}

export default function SupplierMap() {
  const mapRef    = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef({});

  const [filterCategory, setFilterCategory] = useState('All');
  const [filterCountry,  setFilterCountry]  = useState('All');
  const [filterSize,     setFilterSize]     = useState('All');
  const [selected,       setSelected]       = useState(null);
  const [mapReady,       setMapReady]       = useState(false);

  const categories = ['All', 'Modified Starch', 'Dairy', 'Edible Oils', 'Wheat Flour', 'Gelatin', 'Soy Protein', 'Food Ingredients Distribution'];
  const countries  = ['All', 'Argentina', 'Brazil', 'Uruguay', 'Chile', 'Paraguay', 'Mexico', 'Colombia', 'Ecuador', 'Peru', 'South Africa'];
  const sizes      = ['All', 'Large', 'Medium', 'Small'];

  const filtered = SUPPLIERS.filter(s => {
    if (!SUPPLIER_COORDS[s.id]) return false;
    if (filterCategory !== 'All' && s.product_category !== filterCategory) return false;
    if (filterCountry  !== 'All' && s.country !== filterCountry) return false;
    if (filterSize     !== 'All' && s.size    !== filterSize)    return false;
    return true;
  });

  // Load Leaflet dynamically
  useEffect(() => {
    if (leafletRef.current) return;

    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      const L = window.L;
      const map = L.map(mapRef.current, {
        center: [-25, -55],
        zoom: 3,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      leafletRef.current = map;

      // Force resize after mount
      setTimeout(() => {
        map.invalidateSize();
        setMapReady(true);
      }, 100);
    };
    document.head.appendChild(script);
  }, []);

  // Update markers when filter changes
  useEffect(() => {
    const L = window.L;
    if (!L || !leafletRef.current) return;
    const map = leafletRef.current;

    // Remove all existing markers
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};

    filtered.forEach(s => {
      const coords = SUPPLIER_COORDS[s.id];
      if (!coords) return;
      const color  = getColor(s);
      const radius = SIZE_RADIUS[s.size] || 8;
      const isSelected = selected === s.id;

      const marker = L.circleMarker([coords.lat, coords.lng], {
        radius,
        fillColor:   color,
        color:       isSelected ? '#ffffff' : color,
        weight:      isSelected ? 3 : 1.5,
        opacity:     1,
        fillOpacity: isSelected ? 1 : 0.8,
      }).addTo(map);

      const popup = L.popup({ maxWidth: 280, className: 'jmr-popup' }).setContent(`
        <div style="font-family: IBM Plex Mono, monospace; padding: 4px;">
          <div style="font-weight:700; font-size:13px; color:#e8edf5; margin-bottom:4px;">${s.name}</div>
          <div style="font-size:11px; color:#8a9ab5; margin-bottom:6px;">${s.city || s.country} · ${s.product_category}</div>
          ${s.size ? `<div style="font-size:10px; color:${color}; margin-bottom:4px;">${s.size.toUpperCase()} · ${s.role}</div>` : ''}
          ${s.nearest_port ? `<div style="font-size:10px; color:#8a9ab5;">Port: ${s.nearest_port} ${s.port_distance_km > 0 ? '('+s.port_distance_km+'km)':''}</div>` : ''}
          ${s.fobPriceRange ? `<div style="font-size:11px; color:#e8b84b; margin-top:4px;">FOB: ${s.fobPriceRange}</div>` : ''}
          ${s.website ? `<div style="font-size:10px; color:#3b82f6; margin-top:4px;">${s.website}</div>` : ''}
        </div>
      `);

      marker.bindPopup(popup);
      marker.on('click', () => { setSelected(s.id); });
      marker.on('popupopen', () => setSelected(s.id));
      markersRef.current[s.id] = marker;
    });
  }, [filtered, mapReady]);

  // Highlight selected marker without redrawing all
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const s = SUPPLIERS.find(sup => sup.id === id);
      if (!s) return;
      const color = getColor(s);
      const isSelected = selected === id;
      marker.setStyle({
        color:       isSelected ? '#ffffff' : color,
        weight:      isSelected ? 3 : 1.5,
        fillOpacity: isSelected ? 1 : 0.8,
      });
      if (isSelected) marker.openPopup();
    });
  }, [selected]);

  // Inject popup styles once
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .jmr-popup .leaflet-popup-content-wrapper {
        background: #111926; border: 1px solid #1e2d42;
        border-radius: 6px; color: #e8edf5; box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      }
      .jmr-popup .leaflet-popup-tip { background: #111926; }
      .jmr-popup .leaflet-popup-close-button { color: #4a5a70 !important; }
    `;
    document.head.appendChild(style);
  }, []);

  const selectedSupplier = selected ? SUPPLIERS.find(s => s.id === selected) : null;

  const selectStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4,
    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 11,
    padding: '5px 8px', cursor: 'pointer', width: '100%',
  };
  const labelStyle = {
    fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, display: 'block',
  };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
        <div><span style={labelStyle}>Category</span>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={selectStyle}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div><span style={labelStyle}>Country</span>
          <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} style={selectStyle}>
            {countries.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div><span style={labelStyle}>Size</span>
          <select value={filterSize} onChange={e => setFilterSize(e.target.value)} style={selectStyle}>
            {sizes.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 16, paddingBottom: 6 }}>
            {Object.entries(CATEGORY_COLORS).filter(([k]) => k !== 'default').map(([label, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
        {filtered.length} suppliers shown · Large = bigger dot · Click a marker for details
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ height: 560, borderRadius: 6, border: '1px solid var(--border)' }} />

      {/* Selected supplier detail */}
      {selectedSupplier && (
        <div className="card" style={{ marginTop: 14, borderColor: getColor(selectedSupplier) + '60' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{selectedSupplier.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{selectedSupplier.city} · {selectedSupplier.role}</div>
            </div>
            <button onClick={() => setSelected(null)}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4,
                color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11,
                padding: '3px 8px', cursor: 'pointer' }}>close</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 10 }}>
            {[
              ['Size',       selectedSupplier.size || 'Unknown'],
              ['Port',       selectedSupplier.nearest_port ? selectedSupplier.nearest_port.split(' ')[0] : 'Unknown'],
              ['Distance',   selectedSupplier.port_distance_km ? selectedSupplier.port_distance_km + ' km' : 'Unknown'],
              ['FOB',        selectedSupplier.fobPriceRange || 'TBC'],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: '8px 10px', background: 'var(--bg-hover)', borderRadius: 4 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{value}</div>
              </div>
            ))}
          </div>
          {selectedSupplier.certifications && selectedSupplier.certifications.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {selectedSupplier.certifications.map(c => (
                <span key={c} style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#2ecc71',
                  background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.2)',
                  padding: '2px 6px', borderRadius: 3 }}>{c}</span>
              ))}
            </div>
          )}
          {selectedSupplier.notes && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{selectedSupplier.notes}</div>
          )}
          {selectedSupplier.contact_approach && (
            <div style={{ fontSize: 12, color: '#3b82f6', fontFamily: 'var(--font-mono)' }}>
              Contact: {selectedSupplier.contact_approach}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
