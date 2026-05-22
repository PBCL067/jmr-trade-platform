import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const SA_SUPPLIERS = [
  { supplier: 'Thailand',     volume_mt: 14437, price_per_kg: 0.917, share_pct: 45 },
  { supplier: 'USA',          volume_mt: 7604,  price_per_kg: 1.338, share_pct: 24 },
  { supplier: 'Netherlands',  volume_mt: 6953,  price_per_kg: 0.892, share_pct: 22 },
  { supplier: 'Italy',        volume_mt: 5304,  price_per_kg: 1.590, share_pct: 17 },
  { supplier: 'Vietnam',      volume_mt: 3921,  price_per_kg: 0.757, share_pct: 12 },
  { supplier: 'Brazil',       volume_mt: 3643,  price_per_kg: 1.246, share_pct: 11 },
  { supplier: 'China',        volume_mt: 2169,  price_per_kg: 0.965, share_pct:  7 },
  { supplier: 'Argentina',    volume_mt: 0,     price_per_kg: 0.690, share_pct:  0 },
];

const GLOBAL_EXPORTERS = [
  { exporter: 'Argentina',   volume_mt:    8283, fob_per_kg: 0.69 },
  { exporter: 'Thailand',    volume_mt: 1768408, fob_per_kg: 0.90 },
  { exporter: 'Brazil',      volume_mt:   87347, fob_per_kg: 1.29 },
  { exporter: 'China',       volume_mt:  157338, fob_per_kg: 1.45 },
  { exporter: 'Belgium',     volume_mt:  123004, fob_per_kg: 1.62 },
  { exporter: 'Netherlands', volume_mt:  437244, fob_per_kg: 1.89 },
  { exporter: 'Germany',     volume_mt:  652378, fob_per_kg: 2.18 },
];

const ARG_BUYERS = [
  { importer: 'Chile',    volume_mt: 7532, price_per_kg: 0.654 },
  { importer: 'Paraguay', volume_mt:  478, price_per_kg: 0.747 },
  { importer: 'Uruguay',  volume_mt:  138, price_per_kg: 1.860 },
  { importer: 'Bolivia',  volume_mt:  119, price_per_kg: 1.109 },
  { importer: 'Brazil',   volume_mt:   16, price_per_kg: 2.837 },
];

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)',
      borderRadius: 4, padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color || 'var(--text-primary)' }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

export default function ModifiedStarch() {
  return (
    <div>
      {/* Hero stat */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Argentina FOB Price',  value: '$0.69/kg',  sub: 'Cheapest global exporter',   color: '#2ecc71' },
          { label: 'SA Market Price (CIF)', value: '$0.92/kg', sub: 'Thailand benchmark',          color: '#e8b84b' },
          { label: 'Est. Landed (Buenos Aires → Durban)', value: '$0.80/kg', sub: 'incl. freight + tariff', color: '#3b82f6' },
          { label: 'Our Margin',           value: '$0.29/kg',  sub: 'vs current SA market price $1.09', color: '#2ecc71' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="card">
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Who supplies SA today */}
        <div className="card">
          <div className="section-label" style={{ marginBottom: 16 }}>Who supplies South Africa today (2023)</div>
          <table className="data-table">
            <thead>
              <tr><th>Supplier</th><th>Volume MT</th><th>CIF $/kg</th><th>Share</th></tr>
            </thead>
            <tbody>
              {SA_SUPPLIERS.map(row => (
                <tr key={row.supplier} style={{ background: row.supplier === 'Argentina' ? 'rgba(46,204,113,0.06)' : '' }}>
                  <td style={{ color: row.supplier === 'Argentina' ? '#2ecc71' : 'var(--text-primary)',
                    fontWeight: row.supplier === 'Argentina' ? 700 : 400 }}>
                    {row.supplier === 'Argentina' ? '★ ' : ''}{row.supplier}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{row.volume_mt.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)',
                    color: row.supplier === 'Argentina' ? '#2ecc71' : 'var(--text-secondary)' }}>
                    ${row.price_per_kg.toFixed(3)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{row.share_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(232,184,75,0.08)',
            border: '1px solid rgba(232,184,75,0.2)', borderRadius: 4,
            fontSize: 12, color: '#e8b84b', fontFamily: 'var(--font-mono)' }}>
            Total SA imports: ~57,800 MT/yr &nbsp;|&nbsp; $65.9M market
          </div>
        </div>

        {/* Global FOB price comparison */}
        <div className="card">
          <div className="section-label" style={{ marginBottom: 16 }}>Global FOB price comparison ($/kg)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={GLOBAL_EXPORTERS} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d42" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#4a5a70', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                axisLine={false} tickLine={false} domain={[0, 2.5]} tickFormatter={v => '$' + v} />
              <YAxis type="category" dataKey="exporter" tick={{ fill: '#8a9ab5', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
                axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="fob_per_kg" name="FOB $/kg" radius={[0,3,3,0]}>
                {GLOBAL_EXPORTERS.map(entry => (
                  <Cell key={entry.exporter} fill={entry.exporter === 'Argentina' ? '#2ecc71' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
            Argentina is the lowest-cost exporter globally at $0.69/kg FOB
          </div>
        </div>
      </div>

      {/* Where Argentina currently exports */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-label" style={{ marginBottom: 16 }}>Where Argentina currently exports modified starch (2023)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <table className="data-table">
            <thead><tr><th>Buyer Country</th><th>Volume MT</th><th>FOB $/kg</th></tr></thead>
            <tbody>
              {ARG_BUYERS.map(row => (
                <tr key={row.importer}>
                  <td style={{ color: 'var(--text-primary)' }}>{row.importer}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{row.volume_mt.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>${row.price_per_kg.toFixed(3)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid var(--border)' }}>
                <td style={{ color: '#e8b84b', fontWeight: 600 }}>South Africa</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: '#e8b84b', fontWeight: 600 }}>0</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: '#e8b84b' }}>OPPORTUNITY</td>
              </tr>
            </tbody>
          </table>
          <div>
            <div style={{ padding: '14px 16px', background: 'rgba(46,204,113,0.06)',
              border: '1px solid rgba(46,204,113,0.2)', borderRadius: 6, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#2ecc71', marginBottom: 8 }}>The Opportunity</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Argentina exports 8,283 MT of modified starch globally but <strong style={{color:'var(--text-primary)'}}>zero to South Africa</strong>.
                SA currently pays $0.92-1.34/kg CIF from Thailand and USA.
                Argentina can land product at <strong style={{color:'#2ecc71'}}>$0.80/kg</strong> — undercutting all current suppliers.
              </div>
            </div>
            <div style={{ padding: '14px 16px', background: 'var(--bg-hover)', borderRadius: 6 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>KEY SUPPLIER</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Ingredion Argentina</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Baradero, Buenos Aires</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>ingredion.com/sa/es-ar</div>
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>KEY BUYER</div>
              <div style={{ fontWeight: 600, color: '#2ecc71' }}>Bragan / Solevo Group</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Johannesburg, South Africa</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
