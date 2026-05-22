import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchCollection } from './firebase';

const EXPOSURE_CLS = {
  CRITICAL: 'badge--sell', HIGH: 'badge--hold', MEDIUM: 'badge--med',
  LOW: 'badge--low', 'N/A (Exporter)': 'badge--low'
};

const REGION_ORDER = ['South America', 'Southern Africa', 'North Africa', 'West Africa', 'East Africa', 'Southeast Asia'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)',
      borderRadius: 4, padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color }}>{p.name}: {(p.value || 0).toLocaleString()}</div>)}
    </div>
  );
};

function CountryCard({ c, onClick, selected }) {
  const wheat  = c.wheatExposure  || 'LOW';
  const coffee = c.coffeeExposure || 'LOW';
  return (
    <div className="card" onClick={() => onClick(c)}
      style={{ cursor: 'pointer', borderColor: selected ? 'var(--gold)' : undefined }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div className="card-title">{c.name}</div>
          <div className="card-sub">{c.region} &nbsp;&middot;&nbsp; {c.role || 'N/A'}</div>
        </div>
        <span className="badge badge--low" style={{ fontSize: 10, alignSelf: 'flex-start' }}>
          {c.id || c.flag || ''}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Wheat:</span>
        <span className={'badge ' + (EXPOSURE_CLS[wheat] || 'badge--low')} style={{ fontSize: 9 }}>{wheat}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 4 }}>Coffee:</span>
        <span className={'badge ' + (EXPOSURE_CLS[coffee] || 'badge--low')} style={{ fontSize: 9 }}>{coffee}</span>
      </div>
    </div>
  );
}

function CountryDetail({ c }) {
  const imports = Array.isArray(c.keyImports) ? c.keyImports : [];
  const exports = Array.isArray(c.keyExports) ? c.keyExports : [];
  const flows   = Array.isArray(c.tradeFlows) ? c.tradeFlows : [];

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>{c.name}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 2 }}>
            {c.region} &nbsp;&middot;&nbsp; {c.role || 'N/A'}
          </div>
        </div>
        {c.gdpUsd && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>GDP</div>
            <div className="val val--gold" style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              ${c.gdpUsd}B
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {imports.length > 0 && (
          <div>
            <div className="section-label" style={{ marginBottom: 8 }}>Key Imports</div>
            {imports.map(i => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>{i}</div>
            ))}
          </div>
        )}
        {exports.length > 0 && (
          <div>
            <div className="section-label" style={{ marginBottom: 8 }}>Key Exports</div>
            {exports.map(i => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>{i}</div>
            ))}
          </div>
        )}
      </div>

      {flows.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>Trade Flows 2020-2024 (USD millions)</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={flows} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d42" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: '#4a5a70', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a5a70', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="imports" name="Imports" fill="#3b82f6" radius={[2,2,0,0]} />
              <Bar dataKey="exports" name="Exports" fill="#e8b84b" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {c.notes && (
        <div style={{ padding: '10px 14px', background: 'rgba(200,153,58,0.05)',
          border: '1px solid rgba(200,153,58,0.15)', borderRadius: 4,
          fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {c.notes}
        </div>
      )}
    </div>
  );
}

export default function CountryExplorer() {
  const [countries, setCountries] = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('All');

  useEffect(function() {
    (async function() {
      try {
        const data = await fetchCollection('countries');
        // Attach id to each doc for display
        data.sort(function(a, b) {
          const ra = REGION_ORDER.indexOf(a.region || '');
          const rb = REGION_ORDER.indexOf(b.region || '');
          if (ra !== rb) return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb);
          return (a.name || '').localeCompare(b.name || '');
        });
        setCountries(data);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="loading">Loading countries</div>;

  const regions = ['All', ...Array.from(new Set(countries.map(c => c.region).filter(Boolean)))];

  const filtered = countries.filter(function(c) {
    if (filter === 'All') return true;
    return c.region === filter;
  });

  const selectStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4,
    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12,
    padding: '6px 10px', cursor: 'pointer',
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>REGION</span>
        <select value={filter} onChange={e => { setFilter(e.target.value); setSelected(null); }} style={selectStyle}>
          {regions.map(r => <option key={r}>{r}</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {filtered.length} countries
        </span>
      </div>

      <div className="page-section">
        <div className="section-label" style={{ marginBottom: 12 }}>Country Profiles</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {filtered.map(c => (
            <CountryCard key={c.id} c={c} onClick={setSelected} selected={selected?.id === c.id} />
          ))}
        </div>
      </div>

      {selected
        ? <CountryDetail c={selected} />
        : <div style={{ marginTop: 20, textAlign: 'center', color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.06em' }}>
            SELECT A COUNTRY TO VIEW DETAILS
          </div>
      }
    </div>
  );
}
