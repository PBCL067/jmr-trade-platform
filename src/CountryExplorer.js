import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchCollection } from './firebase';

const STATIC_COUNTRIES = [
  {
    id: 'egypt', name: 'Egypt', flag: 'EG', region: 'MENA', role: 'Importer',
    keyImports: ['Wheat HRW', 'Edible Oils'], keyExports: ['Cotton', 'Citrus'],
    wheatExposure: 'CRITICAL', coffeeExposure: 'LOW', gdpUsd: 476, population: 104,
    tradeFlows: [
      { year: '2020', imports: 8200, exports: 410 }, { year: '2021', imports: 8900, exports: 430 },
      { year: '2022', imports: 9800, exports: 480 }, { year: '2023', imports: 9400, exports: 450 },
      { year: '2024', imports: 9600, exports: 460 },
    ],
    notes: "World's largest wheat importer. GASC runs regular tenders. High price sensitivity.",
  },
  {
    id: 'south-africa', name: 'South Africa', flag: 'ZA', region: 'Sub-Saharan Africa', role: 'Importer / Exporter',
    keyImports: ['Modified Starch', 'Milk Powder', 'Wheat'], keyExports: ['Maize', 'Wine', 'Citrus'],
    wheatExposure: 'MEDIUM', coffeeExposure: 'LOW', gdpUsd: 399, population: 60,
    tradeFlows: [
      { year: '2020', imports: 1100, exports: 890 }, { year: '2021', imports: 1250, exports: 920 },
      { year: '2022', imports: 1380, exports: 970 }, { year: '2023', imports: 1420, exports: 1010 },
      { year: '2024', imports: 1490, exports: 1050 },
    ],
    notes: 'Target market for Argentina starch opportunity. Current starch price ~$1.09/kg.',
  },
  {
    id: 'indonesia', name: 'Indonesia', flag: 'ID', region: 'Southeast Asia', role: 'Exporter',
    keyImports: ['Wheat', 'Soybeans'], keyExports: ['Coffee Arabica', 'Palm Oil', 'Rubber'],
    wheatExposure: 'HIGH', coffeeExposure: 'N/A (Exporter)', gdpUsd: 1319, population: 278,
    tradeFlows: [
      { year: '2020', imports: 620, exports: 1100 }, { year: '2021', imports: 680, exports: 1280 },
      { year: '2022', imports: 720, exports: 1450 }, { year: '2023', imports: 700, exports: 1390 },
      { year: '2024', imports: 740, exports: 1420 },
    ],
    notes: '4th largest coffee producer. Key Arabica origin (Sumatra).',
  },
  {
    id: 'argentina', name: 'Argentina', flag: 'AR', region: 'South America', role: 'Exporter',
    keyImports: ['Technology', 'Machinery'], keyExports: ['Modified Starch', 'Soybean', 'Wheat', 'Milk Powder'],
    wheatExposure: 'N/A (Exporter)', coffeeExposure: 'LOW', gdpUsd: 621, population: 46,
    tradeFlows: [
      { year: '2020', imports: 420, exports: 3200 }, { year: '2021', imports: 490, exports: 3600 },
      { year: '2022', imports: 510, exports: 3900 }, { year: '2023', imports: 480, exports: 3700 },
      { year: '2024', imports: 500, exports: 3800 },
    ],
    notes: 'Key origin for starch and dairy exports. Mercosur-SACU FTA under negotiation.',
  },
];

const EXPOSURE_CLS = { CRITICAL: 'badge--sell', HIGH: 'badge--hold', MEDIUM: 'badge--med', LOW: 'badge--low', 'N/A (Exporter)': 'badge--low' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value.toLocaleString()}</div>)}
    </div>
  );
};

function CountryCard({ c, onClick, selected }) {
  return (
    <div className="card" onClick={() => onClick(c)}
      style={{ cursor: 'pointer', borderColor: selected ? 'var(--gold)' : undefined }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div className="card-title">{c.name}</div>
          <div className="card-sub">{c.region} &middot; {c.role}</div>
        </div>
        <span className="badge badge--low">{c.flag}</span>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Wheat:</span>
        <span className={`badge ${EXPOSURE_CLS[c.wheatExposure] || 'badge--low'}`} style={{ fontSize: 10 }}>{c.wheatExposure}</span>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginLeft: 4 }}>Coffee:</span>
        <span className={`badge ${EXPOSURE_CLS[c.coffeeExposure] || 'badge--low'}`} style={{ fontSize: 10 }}>{c.coffeeExposure}</span>
      </div>
    </div>
  );
}

function CountryDetail({ c }) {
  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>{c.name}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 2 }}>{c.region} &middot; {c.role}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>GDP</div>
          <div className="val val--gold" style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700 }}>${c.gdpUsd}B</div>
        </div>
      </div>
      <div className="card-grid card-grid--2" style={{ marginBottom: 16 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>Key Imports</div>
          {c.keyImports.map(i => <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>{i}</div>)}
        </div>
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>Key Exports</div>
          {c.keyExports.map(i => <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>{i}</div>)}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div className="section-label" style={{ marginBottom: 10 }}>Trade Flows 2020\u20132024 (USD millions)</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={c.tradeFlows} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d42" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: '#4a5a70', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#4a5a70', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="imports" name="Imports" fill="#3b82f6" radius={[2,2,0,0]} />
            <Bar dataKey="exports" name="Exports" fill="#e8b84b" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {c.notes && (
        <div style={{ padding: '10px 14px', background: 'rgba(200,153,58,0.05)', border: '1px solid rgba(200,153,58,0.15)', borderRadius: 4, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {c.notes}
        </div>
      )}
    </div>
  );
}

export default function CountryExplorer() {
  const [countries, setCountries] = useState(STATIC_COUNTRIES);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchCollection('countries');
        if (data && data.length > 0) setCountries(data);
      } catch (e) {}
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="loading">Loading countries</div>;

  return (
    <div>
      <div className="page-section">
        <div className="section-label">Country Profiles</div>
        <div className="card-grid card-grid--4">
          {countries.map(c => <CountryCard key={c.id} c={c} onClick={setSelected} selected={selected?.id === c.id} />)}
        </div>
        {selected
          ? <CountryDetail c={selected} />
          : <div style={{ marginTop: 20, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.06em' }}>SELECT A COUNTRY TO VIEW DETAILS</div>
        }
      </div>
    </div>
  );
}
