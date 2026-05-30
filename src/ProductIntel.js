import React, { useState } from 'react';
import HelpTip from './Tooltip';
import { TARIFFS } from './data/tariffData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const PRODUCTS = {
  'Modified Starch': {
    hs: 'HS 3505.10',
    hero: [
      { label: 'Argentina FOB Price',              value: '$0.69/kg', sub: 'Cheapest global exporter',          color: '#2ecc71' },
      { label: 'SA Market Price (CIF)',             value: '$0.92/kg', sub: 'Thailand benchmark',                color: '#e8b84b' },
      { label: 'Est. Landed (Buenos Aires-Durban)', value: '$0.80/kg', sub: 'incl. freight + tariff FREE',       color: '#3b82f6' },
      { label: 'Our Margin',                        value: '$0.29/kg', sub: 'vs SA market price $1.09/kg',       color: '#2ecc71' },
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
      { exporter: 'Argentina',   fob_per_kg: 0.69 },
      { exporter: 'Thailand',    fob_per_kg: 0.90 },
      { exporter: 'Brazil',      fob_per_kg: 1.29 },
      { exporter: 'China',       fob_per_kg: 1.45 },
      { exporter: 'Belgium',     fob_per_kg: 1.62 },
      { exporter: 'Netherlands', fob_per_kg: 1.89 },
      { exporter: 'Germany',     fob_per_kg: 2.18 },
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
    key_supplier: 'Ingredion Argentina / Lorenz / Semino',
    key_supplier_sub: 'Multiple verified suppliers available',
    key_buyer: 'Bragan / Solevo Group',
    key_buyer_sub: 'Johannesburg — interested',
    key_buyer_color: '#2ecc71',
    next_step: null,
  },
  'Milk Powder (FCMP)': {
    hs: 'HS 0402.21',
    hero: [
      { label: 'Argentina FOB',          value: '$3.61/kg', sub: 'Mastellone / SanCor',          color: '#2ecc71' },
      { label: 'Uruguay FOB (to SA)',    value: '$3.53/kg', sub: 'Precedent: already in SA',      color: '#e8b84b' },
      { label: 'SA Market Price (CIF)', value: '$3.24/kg', sub: 'NZ benchmark (lowest)',          color: '#3b82f6' },
      { label: 'Algeria alone (2025)',   value: '$324M',    sub: '2nd largest buyer after Brazil',  color: '#e8b84b' },
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
      { exporter: 'New Zealand',    fob_per_kg: 3.311 },
      { exporter: 'Uruguay',        fob_per_kg: 3.579 },
      { exporter: 'Argentina',      fob_per_kg: 3.609 },
      { exporter: 'Ireland',        fob_per_kg: 3.709 },
      { exporter: 'Germany',        fob_per_kg: 4.396 },
      { exporter: 'EU Average',     fob_per_kg: 4.539 },
      { exporter: 'Australia',      fob_per_kg: 5.562 },
    ],
    fob_domain: [0, 6],
    arg_buyers: [
      { importer: 'Brazil',       volume_mt: 73654, price_per_kg: 3.625 },
      { importer: 'Algeria',      volume_mt: 20348, price_per_kg: 3.592 },
      { importer: 'Cuba',         volume_mt:  2107, price_per_kg: 3.658 },
      { importer: 'Cameroon',     volume_mt:  1425, price_per_kg: 3.131 },
      { importer: 'Colombia',     volume_mt:  1403, price_per_kg: 3.404 },
      { importer: 'Ivory Coast',  volume_mt:   551, price_per_kg: 3.299 },
      { importer: 'South Africa', volume_mt:     0, price_per_kg: null  },
    ],
    opportunity: 'Uruguay already supplies SA at $3.53/kg CIF. Argentina FOB is $3.61/kg — competitive if freight from Buenos Aires matches Montevideo. Argentina already ships to Cameroon and Ivory Coast — Africa track record exists. Algeria alone imports $192M/yr from Latam.',
    opportunity_color: '#e8b84b',
    key_supplier: 'Mastellone (La Serenisima)',
    key_supplier_sub: 'General Rodriguez, Buenos Aires — Priority 1',
    key_buyer: 'TBC — find buyer first',
    key_buyer_sub: 'Clover Industries or Tiger Brands likely targets',
    key_buyer_color: '#e8b84b',
    next_step: 'Find SA buyer before approaching suppliers',
  },
  'Corn': {
    hs: 'HS 1005.90',
    hero: [
      { label: 'Argentina FOB Price',   value: '$0.20/kg', sub: '3rd largest global exporter',    color: '#2ecc71' },
      { label: 'Brazil FOB (to SA)',    value: '$0.20/kg', sub: 'Main Latam competitor',           color: '#e8b84b' },
      { label: 'Argentina to Africa',  value: '$1.33B',   sub: 'Algeria, Egypt, Morocco (2023)',   color: '#3b82f6' },
      { label: 'Maghreb + Egypt',      value: '$1.21B',   sub: 'Argentina corn to N.Africa 2025',  color: '#e8b84b' },
    ],
    sa_suppliers: [
      { supplier: 'Argentina', volume_mt: 162290, price_per_kg: 0.197, share_pct: 43 },
      { supplier: 'Brazil',    volume_mt: 212378, price_per_kg: 0.200, share_pct: 57 },
    ],
    sa_market_label: 'SA corn imports from Latam: ~374,668 MT/yr (2024)',
    global_exporters: [
      { exporter: 'Argentina', fob_per_kg: 0.197 },
      { exporter: 'Brazil',    fob_per_kg: 0.200 },
      { exporter: 'USA',       fob_per_kg: 0.220 },
      { exporter: 'Ukraine',   fob_per_kg: 0.210 },
    ],
    fob_domain: [0, 0.35],
    arg_buyers: [
      { importer: 'Algeria',               volume_mt: 2294120, price_per_kg: 0.262 },
      { importer: 'Egypt',                 volume_mt: 1405720, price_per_kg: 0.270 },
      { importer: 'Morocco',               volume_mt:  743465, price_per_kg: 0.272 },
      { importer: 'Senegal',               volume_mt:  304815, price_per_kg: 0.261 },
      { importer: 'Libya',                 volume_mt:   59958, price_per_kg: 0.223 },
      { importer: 'Dem. Rep. of the Congo',volume_mt:   28000, price_per_kg: 0.218 },
    ],
    opportunity: 'Argentina is the 3rd largest global corn exporter and already sells $1.33B to Africa annually. Algeria and Egypt are the two biggest buyers. This is an established flow — JMR opportunity is in facilitating new routes or adding value through processing connections.',
    opportunity_color: '#3b82f6',
    key_supplier: 'Viterra Argentina / Cargill Argentina',
    key_supplier_sub: 'Rosario port — major grain traders',
    key_buyer: 'Multiple African buyers already active',
    key_buyer_sub: 'Algeria $602M, Egypt $380M, Morocco $202M',
    key_buyer_color: '#3b82f6',
    next_step: null,
  },
  'Soybean Meal': {
    hs: 'HS 2304.00',
    hero: [
      { label: 'Argentina FOB Price',  value: '$0.50/kg', sub: 'World #1 exporter',               color: '#2ecc71' },
      { label: 'Argentina to Africa', value: '$871M',    sub: 'Egypt, Libya, Algeria, Morocco',    color: '#e8b84b' },
      { label: 'Egypt alone',         value: '$360M',    sub: 'Largest single buyer',              color: '#3b82f6' },
      { label: 'Total soy exports',   value: '$21.4B',   sub: 'World #1 in oil & meal (2025)',      color: '#4a5a70' },
    ],
    sa_suppliers: [
      { supplier: 'Argentina', volume_mt: 0, price_per_kg: 0.495, share_pct: 0 },
      { supplier: 'Brazil',    volume_mt: 0, price_per_kg: 0.510, share_pct: 0 },
    ],
    sa_market_label: 'SA is self-sufficient in soy meal — domestic crushing industry',
    global_exporters: [
      { exporter: 'Argentina', fob_per_kg: 0.495 },
      { exporter: 'Brazil',    fob_per_kg: 0.510 },
      { exporter: 'USA',       fob_per_kg: 0.540 },
      { exporter: 'India',     fob_per_kg: 0.560 },
    ],
    fob_domain: [0, 0.7],
    arg_buyers: [
      { importer: 'Egypt',    volume_mt: 729627, price_per_kg: 0.493 },
      { importer: 'Libya',    volume_mt: 303726, price_per_kg: 0.495 },
      { importer: 'Algeria',  volume_mt: 262535, price_per_kg: 0.500 },
      { importer: 'Morocco',  volume_mt: 165576, price_per_kg: 0.495 },
      { importer: 'Senegal',  volume_mt:  92334, price_per_kg: 0.500 },
      { importer: 'Ghana',    volume_mt:  52338, price_per_kg: 0.495 },
    ],
    opportunity: 'Argentina is the world #1 soybean meal exporter, supplying $871M to Africa annually. Egypt, Libya, Algeria and Morocco are major buyers for animal feed. JMR opportunity is connecting Argentine meal exporters with new African buyers — particularly West Africa where poultry farming is growing rapidly.',
    opportunity_color: '#e8b84b',
    key_supplier: 'Viterra / ADM / Cofco Argentina',
    key_supplier_sub: 'Rosario crushing complex — world scale',
    key_buyer: 'West African poultry feed manufacturers',
    key_buyer_sub: 'Nigeria, Ghana, Ivory Coast — growing demand',
    key_buyer_color: '#e8b84b',
    next_step: null,
  },
  'Sunflower Oil': {
    hs: 'HS 1512.11',
    hero: [
      { label: 'Argentina FOB Price',   value: '$0.84/kg', sub: '2nd largest global exporter',    color: '#2ecc71' },
      { label: 'SA Market (current)',   value: '$1.09/kg', sub: 'Argentina already #2 supplier',  color: '#e8b84b' },
      { label: 'Argentina to SA (2024)',value: '$5.4M',    sub: '6,500 MT — growing',             color: '#3b82f6' },
      { label: 'Tariff (SARS)',         value: 'TBC',      sub: 'HS 1512.11 — pending confirm',   color: '#4a5a70' },
    ],
    sa_suppliers: [
      { supplier: 'Argentina', volume_mt:  6500, price_per_kg: 0.837, share_pct: 35 },
      { supplier: 'Ukraine',   volume_mt:  8200, price_per_kg: 0.910, share_pct: 45 },
      { supplier: 'Russia',    volume_mt:  2100, price_per_kg: 0.890, share_pct: 12 },
      { supplier: 'Other',     volume_mt:  1400, price_per_kg: 0.950, share_pct:  8 },
    ],
    sa_market_label: 'SA sunflower oil imports: ~160,000 MT/yr (growing)',
    global_exporters: [
      { exporter: 'Ukraine',    fob_per_kg: 0.910 },
      { exporter: 'Russia',     fob_per_kg: 0.890 },
      { exporter: 'Argentina',  fob_per_kg: 0.837 },
      { exporter: 'EU',         fob_per_kg: 1.050 },
    ],
    fob_domain: [0, 1.3],
    arg_buyers: [
      { importer: 'South Africa', volume_mt:  6500, price_per_kg: 0.837 },
      { importer: 'Mauritius',    volume_mt:  9500, price_per_kg: 0.907 },
    ],
    opportunity: 'Argentina is already the #2 sunflower oil supplier to SA and growing. At $0.84/kg FOB, Argentina undercuts Ukraine and Russia. The main risk is SARS tariff for HS 1512.11 which is still unconfirmed — this is a priority pending item before scaling up.',
    opportunity_color: '#e8b84b',
    key_supplier: 'AGD / Molinos Rio de la Plata',
    key_supplier_sub: 'Major Argentine oilseed crushers',
    key_buyer: 'SA industrial food manufacturers',
    key_buyer_sub: 'Already buying — scale up existing flow',
    key_buyer_color: '#2ecc71',
    next_step: 'Confirm SARS tariff for HS 1512.11 before scaling',
  },
  'Soybean Oil': {
    hs: 'HS 1507.90',
    hero: [
      { label: 'Argentina FOB Price',  value: '$0.95/kg', sub: 'Major global exporter',           color: '#2ecc71' },
      { label: 'Brazil FOB',          value: '$0.98/kg', sub: 'Main competitor',                  color: '#e8b84b' },
      { label: 'Argentina to Africa', value: '$25M',     sub: 'Established flow (2023)',           color: '#3b82f6' },
      { label: 'SA tariff',           value: 'Check',    sub: 'HS 1507.90 — verify with SARS',    color: '#4a5a70' },
    ],
    sa_suppliers: [
      { supplier: 'Argentina', volume_mt:  1980, price_per_kg: 0.950, share_pct: 38 },
      { supplier: 'Brazil',    volume_mt:  2100, price_per_kg: 0.980, share_pct: 40 },
      { supplier: 'Other',     volume_mt:  1100, price_per_kg: 1.020, share_pct: 22 },
    ],
    sa_market_label: 'SA soybean oil imports: estimated ~5,000 MT/yr from Latam',
    global_exporters: [
      { exporter: 'Argentina', fob_per_kg: 0.950 },
      { exporter: 'Brazil',    fob_per_kg: 0.980 },
      { exporter: 'USA',       fob_per_kg: 1.010 },
      { exporter: 'EU',        fob_per_kg: 1.150 },
    ],
    fob_domain: [0, 1.4],
    arg_buyers: [
      { importer: 'Algeria',       volume_mt: 12800, price_per_kg: 0.950 },
      { importer: 'Morocco',       volume_mt:  5200, price_per_kg: 0.955 },
      { importer: 'Egypt',         volume_mt:  3100, price_per_kg: 0.960 },
      { importer: 'South Africa',  volume_mt:  1980, price_per_kg: 0.950 },
      { importer: 'Kenya',         volume_mt:   850, price_per_kg: 0.965 },
    ],
    opportunity: 'Argentina is a competitive soybean oil exporter with established flows to Algeria, Morocco and Egypt. SA already buys from Argentina. Price advantage over Brazil is small but consistent. Opportunity is expanding volumes and identifying new African buyers — particularly West Africa where palm oil substitution is growing.',
    opportunity_color: '#3b82f6',
    key_supplier: 'AGD / Molinos / Aceitera General Deheza',
    key_supplier_sub: 'Major Argentine oilseed processors',
    key_buyer: 'African food manufacturers and distributors',
    key_buyer_sub: 'Algeria, Morocco, Egypt already active',
    key_buyer_color: '#3b82f6',
    next_step: 'Verify SA tariff for HS 1507.90 with SARS',
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
    borderRadius: 4, padding: '6px 14px', cursor: 'pointer',
    color: selected === name ? 'var(--text-primary)' : 'var(--text-muted)',
    fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.04em', whiteSpace: 'nowrap',
  });

  return (
    <div>
      {/* Product selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {Object.keys(PRODUCTS).map(name => (
          <button key={name} style={btnStyle(name)} onClick={() => setSelected(name)}>
            {name} <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>{PRODUCTS[name].hs}</span>
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
          <div className="section-label" style={{ marginBottom: 16 }}>Who supplies South Africa today</div>
          <table className="data-table">
            <thead>
              <tr><th>Supplier</th><th>Volume MT<HelpTip text="Metric tonnes South Africa imported from this country in 2024. Source: UN Comtrade." /></th><th>CIF $/kg<HelpTip text="Cost + Insurance + Freight per kg — the price paid by SA importers inclusive of shipping to port." /></th><th>Share<HelpTip text="This supplier's share of total SA imports for this product." /></th></tr>
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
                    {row.price_per_kg ? '$' + row.price_per_kg.toFixed(3) : '-'}
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
          <div className="section-label" style={{ marginBottom: 16 }}>Global FOB price comparison ($/kg)<HelpTip text="FOB = Free On Board export price at origin port. Lower is cheaper for the buyer before adding freight. Green bar = Argentina." /></div>
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
          Where Argentina currently exports — African buyers
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <table className="data-table">
            <thead><tr><th>Buyer Country</th><th>Volume MT<HelpTip text="How much Argentina currently exports to this country. ZERO means untapped — Argentina produces it but doesn't sell there yet." /></th><th>FOB $/kg<HelpTip text="Argentina's export price per kg. UNTAPPED means no trade exists yet between Argentina and this destination." /></th></tr></thead>
            <tbody>
              {p.arg_buyers.map(row => (
                <tr key={row.importer}
                  style={{ background: row.importer === 'South Africa' ? 'rgba(232,184,75,0.06)' : '' }}>
                  <td style={{ color: row.importer === 'South Africa' ? '#e8b84b' : 'var(--text-primary)',
                    fontWeight: row.importer === 'South Africa' ? 600 : 400 }}>{row.importer}</td>
                  <td style={{ fontFamily: 'var(--font-mono)',
                    color: row.importer === 'South Africa' ? '#e8b84b' : 'var(--text-secondary)' }}>
                    {row.volume_mt > 0 ? row.volume_mt.toLocaleString() : 'ZERO'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)',
                    color: row.importer === 'South Africa' && !row.price_per_kg ? '#e8b84b' : 'var(--text-secondary)' }}>
                    {row.price_per_kg ? '$' + row.price_per_kg.toFixed(3) : 'UNTAPPED'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <div style={{ padding: '14px 16px',
              background: p.opportunity_color + '0f',
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
                  background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.3)',
                  borderRadius: 4, fontSize: 12, color: '#e74c3c' }}>
                  ⚠ Pending: {p.next_step}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
