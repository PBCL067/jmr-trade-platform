import React, { useState } from 'react';
import { SUPPLIERS } from './data/supplierData';

const SUPPLIER_COORDS = {
  "ingredion_argentina":      { lat: -33.802183, lng: -59.504723 },
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
};

const ROLE_TYPE = {
  'Manufacturer/Exporter':      'Supplier',
  'Manufacturer':               'Supplier',
  'Exporter':                   'Supplier',
  'Buyer/Distributor':          'Buyer',
  'Buyer / Food Manufacturer':  'Buyer',
  'Buyer / Dairy Manufacturer': 'Buyer',
  'Domestic Producer':          'Intel',
};

const CATEGORY_COLORS = {
  'Modified Starch': '#3b82f6',
  'Dairy':           '#2ecc71',
  'Edible Oils':     '#e8b84b',
  'default':         '#4a5a70',
};

export default function SupplierMap() {
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterCountry,  setFilterCountry]  = useState('All');
  const [filterSize,     setFilterSize]     = useState('All');
  const [filterRole,     setFilterRole]     = useState('All');
  const [selected,       setSelected]       = useState(null);

  const categories = ['All', 'Modified Starch', 'Dairy', 'Edible Oils'];
  const countries  = ['All', 'Argentina', 'Brazil', 'Uruguay', 'Chile', 'Paraguay', 'Mexico', 'South Africa'];
  const sizes      = ['All', 'Large', 'Medium', 'Small'];
  const roles      = ['All', 'Supplier', 'Intel'];

  const filtered = SUPPLIERS.filter(s => {
    if (!SUPPLIER_COORDS[s.id]) return false;
    if (filterCategory !== 'All' && s.product_category !== filterCategory) return false;
    if (filterCountry  !== 'All' && s.country !== filterCountry) return false;
    if (filterSize     !== 'All' && s.size    !== filterSize)    return false;
    if (filterRole     !== 'All' && (ROLE_TYPE[s.role]||'Intel') !== filterRole) return false;
    return true;
  });

  const selectStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4,
    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 11,
    padding: '5px 8px', cursor: 'pointer', width: '100%',
  };
  const labelStyle = {
    fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, display: 'block',
  };

  const selectedSupplier = selected ? SUPPLIERS.find(s => s.id === selected) : null;
  const mapCenter = selectedSupplier && SUPPLIER_COORDS[selectedSupplier.id]
    ? `${SUPPLIER_COORDS[selectedSupplier.id].lat},${SUPPLIER_COORDS[selectedSupplier.id].lng}`
    : '-25,-55';
  const mapZoom = selectedSupplier ? 8 : 3;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
        <div><span style={labelStyle}>Category</span>
          <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setSelected(null); }} style={selectStyle}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div><span style={labelStyle}>Country</span>
          <select value={filterCountry} onChange={e => { setFilterCountry(e.target.value); setSelected(null); }} style={selectStyle}>
            {countries.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div><span style={labelStyle}>Size</span>
          <select value={filterSize} onChange={e => { setFilterSize(e.target.value); setSelected(null); }} style={selectStyle}>
            {sizes.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div><span style={labelStyle}>Role</span>
          <select value={filterRole} onChange={e => { setFilterRole(e.target.value); setSelected(null); }} style={selectStyle}>
            {roles.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
        {filtered.length} suppliers — click a card to locate on map
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ maxHeight: 580, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(s => {
            const color = CATEGORY_COLORS[s.product_category] || CATEGORY_COLORS.default;
            const isSelected = selected === s.id;
            return (
              <div key={s.id} onClick={() => setSelected(isSelected ? null : s.id)}
                style={{ padding: '10px 12px', borderRadius: 4, cursor: 'pointer',
                  background: isSelected ? 'var(--bg-hover)' : 'var(--bg-card)',
                  border: '1px solid ' + (isSelected ? color : 'var(--border)'),
                  borderLeft: '3px solid ' + color }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {s.city || s.country}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end', flexShrink: 0, marginLeft: 8 }}>
                    {s.size && (
                      <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700,
                        color: s.size === 'Large' ? '#e8b84b' : s.size === 'Medium' ? '#4a9eda' : '#2ecc71',
                        background: (s.size === 'Large' ? '#e8b84b' : s.size === 'Medium' ? '#4a9eda' : '#2ecc71') + '18',
                        padding: '1px 5px', borderRadius: 2 }}>{s.size.toUpperCase()}</span>
                    )}
                    {s.nearest_port && s.port_distance_km > 0 && (
                      <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {s.nearest_port.split(' ')[0]} {s.port_distance_km}km
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {(s.products||[]).slice(0,2).map(p => (
                    <span key={p} style={{ fontSize: 9, color: 'var(--text-muted)', background: 'var(--bg-hover)',
                      border: '1px solid var(--border)', padding: '1px 5px', borderRadius: 2,
                      fontFamily: 'var(--font-mono)' }}>{p}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)', height: 580 }}>
          <iframe
            title="Supplier Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            src={`https://maps.google.com/maps?q=${mapCenter}&z=${mapZoom}&output=embed`}
          />
        </div>
      </div>

      {selectedSupplier && (
        <div className="card" style={{ marginTop: 14, borderColor: CATEGORY_COLORS[selectedSupplier.product_category] || 'var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{selectedSupplier.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{selectedSupplier.city} · {selectedSupplier.role}</div>
            </div>
            {selectedSupplier.website && (
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#3b82f6' }}>{selectedSupplier.website}</span>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }}>
            {[
              ['Size',     selectedSupplier.size || 'Unknown'],
              ['Port',     selectedSupplier.nearest_port || 'Unknown'],
              ['Distance', selectedSupplier.port_distance_km ? selectedSupplier.port_distance_km + ' km' : 'Unknown'],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: '8px 10px', background: 'var(--bg-hover)', borderRadius: 4 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{value}</div>
              </div>
            ))}
          </div>
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
