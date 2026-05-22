import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const SA_SUPPLIERS = [
  { supplier: 'New Zealand', volume_mt: 1727, price_per_kg: 3.240, share_pct: 42 },
  { supplier: 'Uruguay',     volume_mt: 1515, price_per_kg: 3.527, share_pct: 37 },
  { supplier: 'France',      volume_mt:  297, price_per_kg: 3.621, share_pct:  7 },
  { supplier: 'Germany',     volume_mt:  196, price_per_kg: 6.186, share_pct:  5 },
  { supplier: 'Italy',       volume_mt:  108, price_per_kg: 3.950, share_pct:  3 },
  { supplier: 'Ireland',     volume_mt:   85, price_per_kg: 3.808, share_pct:  2 },
  { supplier: 'Argentina',   volume_mt:    0, price_per_kg: 3.609, share_pct:  0 },
];

const GLOBAL_EXPORTERS = [
  { exporter: 'New Zealand',    volume_mt: 1364952, fob_per_kg: 3.311 },
  { exporter: 'Uruguay',        volume_mt:  626797, fob_per_kg: 3.579 },
  { exporter: 'Argentina',      volume_mt:  103026, fob_per_kg: 3.609 },
  { exporter: 'Ireland',        volume_mt:   57672, fob_per_kg: 3.709 },
  { exporter: 'Germany',        volume_mt:  432584, fob_per_kg: 4.396 },
  { exporter: 'European Union', volume_mt:  511409, fob_per_kg: 4.539 },
  { exporter: 'Australia',      volume_mt:   48515, fob_per_kg: 5.562 },
];

const ARG_BUYERS = [
  { importer: 'Brazil',       volume_mt: 73654, price_per_kg: 3.625 },
  { importer: 'Algeria',      volume_mt: 20348, price_per_kg: 3.592 },
  { importer: 'Cuba',         volume_mt:  2107, price_per_kg: 3.658 },
  { importer: 'Cameroon',     volume_mt:  1425, price_per_kg: 3.131 },
  { importer: 'Colombia',     volume_mt:  1403, price_per_kg: 3.404 },
  { importer: 'Venezuela',    volume_mt:  1167, price_per_kg: 3.542 },
  { importer: 'Ivory Coast',  volume_mt:   551, price_per_kg: 3.299 },
  { importer: 'South Africa', volume_mt:     0, price_per_kg: null  },
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

export default function MilkPowder() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Argentina FOB',         value: '$3.61/kg', sub: 'SanCor / Mastellone',        color: '#2ecc71' },
          { label: 'Uruguay FOB (to SA)',    value: '$3.53/kg', sub: 'Precedent: already in SA',   color: '#e8b84b' },
          { label: 'SA Market Price (CIF)', value: '$3.24/kg', sub: 'NZ benchmark (lowest)',       color: '#3b82f6' },
          { label: 'SA Market Size',        value: '4,312 MT', sub: '$17.7M/yr — growing',        color: '#e8b84b' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="card">
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="section-label" style={{ marginBottom: 16 }}>Who supplies South Africa today (2023)</div>
          <table className="data-table">
            <thead><tr><th>Supplier</th><th>Volume MT</th><th>CIF $/kg</th><th>Share</th></tr></thead>
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
                    {row.price_per_kg ? '$' + row.price_per_kg.toFixed(3) : 'OPPORTUNITY'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{row.share_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(232,184,75,0.08)',
            border: '1px solid rgba(232,184,75,0.2)', borderRadius: 4,
            fontSize: 12, color: '#e8b84b', fontFamily: 'var(--font-mono)' }}>
            Total SA imports: ~4,312 MT/yr &nbsp;|&nbsp; $17.7M market
          </div>
        </div>

        <div className="card">
          <div className="section-label" style={{ marginBottom: 16 }}>Global FOB price comparison ($/kg)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={GLOBAL_EXPORTERS} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d42" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#4a5a70', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                axisLine={false} tickLine={false} domain={[0, 6]} tickFormatter={v => '$' + v} />
              <YAxis type="category" dataKey="exporter"
                tick={{ fill: '#8a9ab5', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
                axisLine={false} tickLine={false} width={95} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="fob_per_kg" name="FOB $/kg" radius={[0,3,3,0]}>
                {GLOBAL_EXPORTERS.map(entry => (
                  <Cell key={entry.exporter} fill={entry.exporter === 'Argentina' ? '#2ecc71' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="section-label" style={{ marginBottom: 16 }}>Where Argentina currently exports milk powder (2023)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <table className="data-table">
            <thead><tr><th>Buyer Country</th><th>Volume MT</th><th>FOB $/kg</th></tr></thead>
            <tbody>
              {ARG_BUYERS.map(row => (
                <tr key={row.importer}
                  style={{ background: row.importer === 'South Africa' ? 'rgba(232,184,75,0.06)' : '' }}>
                  <td style={{ color: row.importer === 'South Africa' ? '#e8b84b' : 'var(--text-primary)',
                    fontWeight: row.importer === 'South Africa' ? 600 : 400 }}>{row.importer}</td>
                  <td style={{ fontFamily: 'var(--font-mono)',
                    color: row.importer === 'South Africa' ? '#e8b84b' : 'var(--text-secondary)' }}>
                    {row.volume_mt.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)',
                    color: row.importer === 'South Africa' ? '#e8b84b' : 'var(--text-secondary)' }}>
                    {row.price_per_kg ? '$' + row.price_per_kg.toFixed(3) : 'UNTAPPED'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <div style={{ padding: '14px 16px', background: 'rgba(232,184,75,0.06)',
              border: '1px solid rgba(232,184,75,0.2)', borderRadius: 6, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e8b84b', marginBottom: 8 }}>The Case</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Uruguay already supplies SA at $3.53/kg CIF. Argentina FOB is $3.61/kg —
                competitive if freight from Buenos Aires is cheaper than from Montevideo.
                Argentina already ships to <strong style={{color:'var(--text-primary)'}}>Cameroon and Ivory Coast</strong> — Africa track record exists.
              </div>
            </div>
            <div style={{ padding: '14px 16px', background: 'var(--bg-hover)', borderRadius: 6 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>POTENTIAL SUPPLIERS</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>SanCor</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Sunchales, Santa Fe — export experience</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Mastellone (La Serenísima)</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Large dairy — priority 1</div>
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>KEY NEXT STEP</div>
              <div style={{ fontSize: 13, color: '#e8b84b', marginTop: 4 }}>
                Find SA buyer before approaching suppliers
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
