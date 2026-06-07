import React, { useState, useEffect, useRef } from 'react';
import { SUPPLIERS } from './data/supplierData';
import { BUYERS } from './data/buyerData';

const LAYER_COLORS = {
  supplier: '#e8b84b',
  buyer:    '#4a9eda',
};

const CATEGORY_COLORS = {
  'Modified Starch':          '#e8b84b',
  'Dairy':                    '#4a9eda',
  'Edible Oils':              '#2ecc71',
  'Soya Lecithin':            '#a855f7',
  'Milk Protein Concentrate': '#4a9eda',
  'Tapioca Starch':           '#f97316',
  'Wheat Flour':              '#e8b84b',
  'Soy Protein':              '#84cc16',
  'Food Ingredients Distribution': '#2ecc71',
  'Distributor':              '#2ecc71',
  'Confectionery':            '#a855f7',
  'Bakery':                   '#e8b84b',
  'Food Manufacturer':        '#4a9eda',
  'Edible Oils & Fats':       '#2ecc71',
  'Instant Food':             '#f97316',
};

const SIZE_RADIUS = { Large: 10, Medium: 8, Small: 6 };

export default function TradeMap() {
  const mapRef    = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef({});
  const [mapReady, setMapReady] = useState(false);
  const [showSuppliers, setShowSuppliers] = useState(true);
  const [showBuyers,    setShowBuyers]    = useState(true);
  const [ingFilter,     setIngFilter]     = useState('');
  const [selected,      setSelected]      = useState(null);
  const [countryFilter, setCountryFilter] = useState('All');

  const countries = ['All', ...new Set([
    ...BUYERS.map(b => b.country),
  ].sort())];

  const filteredSuppliers = showSuppliers ? SUPPLIERS.filter(s => {
    if (!s.lat || !s.lng) return false;
    if (ingFilter && !s.products?.some(p => p.toLowerCase().includes(ingFilter.toLowerCase())) &&
        !s.product_category?.toLowerCase().includes(ingFilter.toLowerCase())) return false;
    return true;
  }) : [];

  const filteredBuyers = showBuyers ? BUYERS.filter(b => {
    if (!b.lat || !b.lng) return false;
    if (countryFilter !== 'All' && b.country !== countryFilter) return false;
    if (ingFilter && !b.ingredient_needs?.some(i => i.toLowerCase().includes(ingFilter.toLowerCase()))) return false;
    return true;
  }) : [];

  // Load Leaflet
  useEffect(() => {
    if (window.L) { initMap(); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = initMap;
    document.head.appendChild(script);
  }, []);

  function initMap() {
    if (leafletRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { center: [-10, 20], zoom: 3, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 18,
    }).addTo(map);
    leafletRef.current = map;
    setTimeout(() => { map.invalidateSize(); setMapReady(true); }, 100);
  }

  // Redraw markers
  useEffect(() => {
    const L = window.L;
    if (!L || !leafletRef.current) return;
    const map = leafletRef.current;
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};

    filteredSuppliers.forEach(s => {
      const color = CATEGORY_COLORS[s.product_category] || LAYER_COLORS.supplier;
      const marker = L.circleMarker([s.lat, s.lng], {
        radius: SIZE_RADIUS[s.size] || 8,
        fillColor: color, color: '#fff', weight: 1.5,
        opacity: 1, fillOpacity: 0.85,
      }).addTo(map);
      marker.bindTooltip(`<b>${s.name}</b><br>${s.country}<br>${s.product_category || ''}`, { sticky: true });
      marker.on('click', () => setSelected({ type: 'supplier', data: s }));
      markersRef.current['s_' + s.id] = marker;
    });

    filteredBuyers.forEach(b => {
      const color = CATEGORY_COLORS[b.category] || LAYER_COLORS.buyer;
      const marker = L.circleMarker([b.lat, b.lng], {
        radius: SIZE_RADIUS[b.size] || 8,
        fillColor: color, color: '#fff', weight: 1.5,
        opacity: 1, fillOpacity: 0.85,
        dashArray: '4 2',
      }).addTo(map);
      marker.bindTooltip(`<b>${b.name}</b><br>${b.country}<br>${b.category}`, { sticky: true });
      marker.on('click', () => setSelected({ type: 'buyer', data: b }));
      markersRef.current['b_' + b.id] = marker;
    });
  }, [mapReady, filteredSuppliers.length, filteredBuyers.length, ingFilter, countryFilter, showSuppliers, showBuyers]);

  const btnStyle = (active) => ({
    background: active ? 'var(--bg-hover)' : 'none',
    border: '1px solid ' + (active ? 'var(--border-bright)' : 'var(--border)'),
    borderRadius: 4, padding: '5px 12px', cursor: 'pointer',
    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
    fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.04em',
  });

  const selStyle = (val, cur) => ({
    ...btnStyle(val === cur), whiteSpace: 'nowrap',
  });

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={ingFilter} onChange={e => setIngFilter(e.target.value)}
          placeholder="Filter by ingredient..."
          style={{ flex: 1, minWidth: 180, background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 4, padding: '6px 12px',
            color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12 }} />
        <button style={btnStyle(showSuppliers)} onClick={() => setShowSuppliers(!showSuppliers)}>
          ◆ Suppliers ({filteredSuppliers.length})
        </button>
        <button style={btnStyle(showBuyers)} onClick={() => setShowBuyers(!showBuyers)}>
          ◈ Buyers ({filteredBuyers.length})
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {countries.map(c => <button key={c} style={selStyle(c, countryFilter)}
          onClick={() => setCountryFilter(c)}>{c}</button>)}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 10, flexWrap: 'wrap',
        padding: '6px 12px', background: 'var(--bg-card)',
        border: '1px solid var(--border)', borderRadius: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
          letterSpacing: '0.06em' }}>LEGEND:</span>
        {[
          ['Suppliers', '#e8b84b'], ['Lecithin', '#a855f7'], ['Dairy', '#4a9eda'],
          ['Oils', '#2ecc71'], ['Starch', '#e8b84b'], ['Buyers', '#4a9eda'],
        ].map(([label, color]) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 11, color: 'var(--text-muted)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%',
              background: color, display: 'inline-block', border: '1.5px solid #fff' }} />
            {label}
          </span>
        ))}
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ height: 480, borderRadius: 6,
        border: '1px solid var(--border)', marginBottom: 16 }} />

      {/* Selected panel */}
      {selected && (
        <div className="card" style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 3 }}>
                {selected.data.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {selected.type === 'supplier' ? '◆ SUPPLIER' : '◈ BUYER'} &nbsp;|&nbsp;
                {selected.data.city}, {selected.data.country} &nbsp;|&nbsp;
                {selected.type === 'supplier' ? selected.data.product_category : selected.data.category}
              </div>
            </div>
            <button onClick={() => setSelected(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', fontSize: 18 }}>×</button>
          </div>

          {selected.type === 'buyer' && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                letterSpacing: '0.06em', marginBottom: 6 }}>INGREDIENT NEEDS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                {selected.data.ingredient_needs?.map(i => (
                  <span key={i} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3,
                    background: 'rgba(74,158,218,0.1)', color: '#4a9eda',
                    border: '1px solid rgba(74,158,218,0.2)', fontFamily: 'var(--font-mono)' }}>{i}</span>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                letterSpacing: '0.06em', marginBottom: 6 }}>MANUFACTURES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                {selected.data.manufactures?.map(p => (
                  <span key={p} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3,
                    background: 'rgba(232,184,75,0.1)', color: '#e8b84b',
                    border: '1px solid rgba(232,184,75,0.2)' }}>{p}</span>
                ))}
              </div>
            </div>
          )}

          {selected.type === 'supplier' && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                letterSpacing: '0.06em', marginBottom: 6 }}>PRODUCTS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                {selected.data.products?.map(p => (
                  <span key={p} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3,
                    background: 'rgba(232,184,75,0.1)', color: '#e8b84b',
                    border: '1px solid rgba(232,184,75,0.2)' }}>{p}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7,
            padding: '8px 12px', background: 'var(--bg-hover)', borderRadius: 4 }}>
            {selected.data.notes}
          </div>
        </div>
      )}
    </div>
  );
}
