import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const PRODUCTS = {
  'Modified Starch': {
    hs: 'HS 3505.10',
    hero: [
      { label: 'Argentina FOB Price',            value: '$0.69/kg', sub: 'Cheapest global exporter',        color: '#2ecc71' },
      { label: 'SA Market Price (CIF)',           value: '$0.92/kg', sub: 'Thailand benchmark',              color: '#e8b84b' },
      { label: 'Est. Landed (Buenos Aires-Durban)', value: '$0.80/kg', sub: 'incl. freight + tariff',       color: '#3b82f6' },
      { label: 'Our Margin',                      value: '$0.29/kg', sub: 'vs SA market price $1.09/kg',    color: '#2ecc71' },
    ],
    sa_suppliers: [
      { supplier: 'Thailand',    volume_mt: 14437, price_per_kg: 0.917, share_pct: 45 },
      { supplier: 'USA',         volume_mt:  7604, price_per_kg: 1.338, share_pct: 24 },
      { supplier: 'Netherlands', volume_mt:  6953, price_per_kg: 0.892, share_pct: 22 },
      { supplier: 'Italy',       volume_mt:  5304, price_per_kg: 1.590, share_pct: 17 },
      { supplier: 'Vietnam',     volume_mt:  3921, price_per_kg: 0.757, share_pct: 12 },
      { supplier: 'Brazil',      volume_mt:  3643, price_per_kg: 1.246, share_pct: 11 },
      { supplier: 'China',       volume_mt:  2169, price_per_kg: 0.965, share_pct:  7 },
      { supplier: 'Argentina',   volume_mt:     0, price_per_kg: 0.690, share_pct:  0 },
    ],
    sa_market_label: 'Total SA imports: ~57,800 MT/yr | $65.9M market',
    global_exporters: [
      { exporter: 'Argentina',   volume_mt:    8283, fob_per_kg: 0.69 },
      { exporter: 'Thailand',    volume_mt: 1768408, fob_per_kg: 0.90 },
      { exporter: 'Brazil',      volume_mt:   87347, fob_per_kg: 1.29 },
      { exporter: 'China',       volume_mt:  157338, fob_per_kg: 1.45 },
      { exporter: 'Belgium',     volume_mt:  123004, fob_per_kg: 1.62 },
      { exporter: 'Netherlands', volume_mt:  437244, fob_per_kg: 1.89 },
      { exporter: 'Germany',     volume_mt:  652378, fob_per_kg: 2.18 },
    ],
    fob_domain: [0, 2.5],
    arg_buyers: [
      { importer: 'Chile',        volume_mt: 7532, price_per_kg: 0.654 },
      { importer: 'Paraguay',     volume_mt:  478, price_per_kg: 0.747 },
      { importer: 'Uruguay',      volume_mt:  138, price_per_kg: 1.860 },
      { importer: 'Bolivia',      volume_mt:  119, price_per_kg: 1.109 },
      { importer: 'Brazil',       volume_mt:   16, price_per_kg: 2.837 },
      { importer: 'South Africa', volume_mt:    0, price_per_kg: null  },
    ],
    opportunity: 'Argentina exports 8,283 MT of modified starch globally but zero to South Africa. SA currently pays $0.92-1.34/kg CIF from Thailand and USA. Argentina can land product at $0.80/kg — undercutting all current suppliers.',
    opportunity_color: '#2ecc71',
    key_supplier: 'Ingredion Argentina',
    key_supplier_sub: 'Baradero, Buenos Aires — ingredion.com/sa/es-ar',
    key_buyer: 'Bragan / Solevo Group',
    key_buyer_sub: 'Johannesburg, South Africa',
    key_buyer_color: '#2ecc71',
    next_step: null,
  },
  'Milk Powder (FCMP)': {
    hs: 'HS 0402.21',
    hero: [
      { label: 'Argentina FOB',          value: '$3.61/kg', sub: 'Mastellone / SanCor',            color: '#2ecc71' },
      { label: 'Uruguay FOB (to SA)',    value: '$3.53/kg', sub: 'Precedent: already in SA',        color: '#e8b84b' },
      { label: 'SA Market Price (CIF)', value: '$3.24/kg', sub: 'NZ benchmark (lowest)',            color: '#3b82f6' },
      { label: 'SA Market Size',        value: '4,312 MT', sub: '$17.7M/yr — growing',              color: '#e8b84b' },
    ],
    sa_suppliers: [
      { supplier: 'New Zealand', volume_mt: 1727, price_per_kg: 3.240, share_pct: 42 },
      { supplier: 'Uruguay',     volume_mt: 1515, price_per_kg: 3.527, share_pct: 37 },
      { supplier: 'France',      volume_mt:  297, price_per_kg: 3.621, share_pct:  7 },
      { supplier: 'Germany',     volume_mt:  196, price_per_kg: 6.186, share_pct:  5 },
      { supplier: 'Italy',       volume_mt:  108, price_per_kg: 3.950, share_pct:  3 },
      { supplier: 'Ireland',     volume_mt:   85, price_per_kg: 3.808, share_pct:  2 },
      { supplier: 'Argentina',   volume_mt:    0, price_per_kg: 3.609, share_pct:  0 },
    ],
    sa_market_label: 'Total SA imports: ~4,312 MT/yr | $17.7M market',
    global_exporters: [
      { exporter: 'New Zealand',    volume_mt: 1364952, fob_per_kg: 3.311 },
      { exporter: 'Uruguay',        volume_mt:  626797, fob_per_kg: 3.579 },
      { exporter: 'Argentina',      volume_mt:  103026, fob_per_kg: 3.609 },
      { exporter: 'Ireland',        volume_mt:   57672, fob_per_kg: 3.709 },
      { exporter: 'Germany',        volume_mt:  432584, fob_per_kg: 4.396 },
      { exporter: 'European Union', volume_mt:  511409, fob_per_kg: 4.539 },
      { exporter: 'Australia',      volume_mt:   48515, fob_per_kg: 5.562 },
    ],
    fob_domain: [0, 6],
    arg_buyers: [
      { importer: 'Brazil',       volume_mt: 73654, price_per_kg: 3.625 },
      { importer: 'Algeria',      volume_mt: 20348, price_per_kg: 3.592 },
      { importer: 'Cuba',         volume_mt:  2107, price_per_kg: 3.658 },
      { importer: 'Cameroon',     volume_mt:  1425, price_per_kg: 3.131 },
      { importer: 'Colombia',     volume_mt:  1403, price_per_kg: 3.404 },
      { importer: 'Venezuela',    volume_mt:  1167, price_per_kg: 3.542 },
      { importer: 'Ivory Coast',  volume_mt:   551, price_per_kg: 3.299 },
      { importer: 'South Africa', volume_mt:     0, price_per_kg: null  },
    ],
    opportunity: 'Uruguay already supplies SA at $3.53/kg CIF. Argentina FOB is $3.61/kg — competitive if freight from Buenos Aires is cheaper than from Montevideo. Argentina already ships to Cameroon and Ivory Coast — Africa track record exists.',
    opportunity_color: '#e8b84b',
    key_supplier: 'Mastellone (La Serenisima)',
    key_supplier_sub: 'General Rodriguez, Buenos Aires — Priority 1',
    key_buyer: 'TBC — find buyer first',
    key_buyer_sub: 'Clover Industries or Tiger Brands likely targets',
    key_buyer_color: '#e8b84b',
    next_step: 'Find SA buyer before approaching suppliers',
  },
};

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

export default function ProductIntel() {
  const [selected, setSelected] = useState('Modified Starch');
  const p = PRODUCTS[selected];

  const btnStyle = (name) => ({
    background: selected === name ? 'var(--bg-hover)' : 'none',
    border: '1px solid ' + (selected === name ? 'var(--border-bright)' : 'var(--border)'),
    borderRadius: 4, padding: '6px 16px', cursor: 'pointer',
    color: selected === name ? 'var(--text-primary)' : 'var(--text-muted)',
    fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.06em',
  });

  return (
    <div>
      {/* Product selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {Object.keys(PRODUCTS).map(name => (
          <button key={name} style={btnStyle(name)} onClick={() => setSelected(name)}>
            {name} <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>{PRODUCTS[name].hs}</span>
          </button>
        ))}
      </div>

      {/* Hero stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {p.hero.map(({ label, value, sub, color }) => (
          <div key={label} className="card">
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* SA suppliers table */}
        <div className="card">
          <div className="section-label" style={{ marginBottom: 16 }}>Who supplies South Africa today (2023)</div>
          <table className="data-table">
            <thead>
              <tr><th>Supplier</th><th>Volume MT</th><th>CIF $/kg</th><th>Share</th></tr>
            </thead>
            <tbody>
              {p.sa_suppliers.map(row => (
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
            {p.sa_market_label}
          </div>
        </div>

        {/* Global FOB chart */}
        <div className="card">
          <div className="section-label" style={{ marginBottom: 16 }}>Global FOB price comparison ($/kg)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={p.global_exporters} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d42" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#4a5a70', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                axisLine={false} tickLine={false} domain={p.fob_domain} tickFormatter={v => '$' + v} />
              <YAxis type="category" dataKey="exporter"
                tick={{ fill: '#8a9ab5', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
                axisLine={false} tickLine={false} width={95} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="fob_per_kg" name="FOB $/kg" radius={[0,3,3,0]}>
                {p.global_exporters.map(entry => (
                  <Cell key={entry.exporter} fill={entry.exporter === 'Argentina' ? '#2ecc71' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Argentina export map + opportunity */}
      <div className="card">
        <div className="section-label" style={{ marginBottom: 16 }}>
          Where Argentina currently exports {selected.toLowerCase()} (2023)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <table className="data-table">
            <thead><tr><th>Buyer Country</th><th>Volume MT</th><th>FOB $/kg</th></tr></thead>
            <tbody>
              {p.arg_buyers.map(row => (
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
            <div style={{ padding: '14px 16px',
              background: p.opportunity_color === '#2ecc71' ? 'rgba(46,204,113,0.06)' : 'rgba(232,184,75,0.06)',
              border: '1px solid ' + p.opportunity_color + '40',
              borderRadius: 6, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: p.opportunity_color, marginBottom: 8 }}>The Opportunity</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{p.opportunity}</div>
            </div>
            <div style={{ padding: '14px 16px', background: 'var(--bg-hover)', borderRadius: 6 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>KEY SUPPLIER</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{p.key_supplier}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>{p.key_supplier_sub}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>KEY BUYER</div>
              <div style={{ fontWeight: 600, color: p.key_buyer_color, marginBottom: 2 }}>{p.key_buyer}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.key_buyer_sub}</div>
              {p.next_step && (
                <div style={{ marginTop: 12, padding: '8px 10px',
                  background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.2)',
                  borderRadius: 4, fontSize: 12, color: '#e8b84b' }}>
                  Next step: {p.next_step}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
