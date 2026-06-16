import React, { useState, useEffect } from 'react';
import HelpTip from './Tooltip';
import { fetchTable } from './supabase';
import { generateProductIntelReport } from './ReportGenerator';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

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

const PRODUCT_ORDER = ['Modified Starch', 'Milk Powder (FCMP)', 'Corn', 'Soybean Meal', 'Sunflower Oil', 'Soybean Oil'];

const HS_LOOKUP = {
  'Modified Starch':  '350510',
  'Milk Powder (FCMP)': '040221',
  'Corn':             '100590',
  'Soybean Meal':     '230400',
  'Sunflower Oil':    '151211',
  'Soybean Oil':      '150790',
};

function parseField(v) {
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return v; }
  }
  return v;
}

export default function ProductIntel() {
  const [products,      setProducts]      = useState({});
  const [selected,      setSelected]      = useState('Modified Starch');
  const [liveSuppliers, setLiveSuppliers] = useState([]);
  const [liveTariffs,   setLiveTariffs]   = useState({});
  const [loadingLive,   setLoadingLive]   = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    fetchTable('product_deals')
      .then(rows => {
        const map = {};
        rows.forEach(r => {
          map[r.product_name] = {
            hs: r.hs,
            hero: parseField(r.hero) || [],
            sa_suppliers: parseField(r.sa_suppliers) || [],
            sa_market_label: r.sa_market_label,
            global_exporters: parseField(r.global_exporters) || [],
            fob_domain: parseField(r.fob_domain) || [0, 1],
            arg_buyers: parseField(r.arg_buyers) || [],
            opportunity: r.opportunity,
            opportunity_color: r.opportunity_color,
            key_supplier: r.key_supplier,
            key_supplier_sub: r.key_supplier_sub,
            key_buyer: r.key_buyer,
            key_buyer_sub: r.key_buyer_sub,
            key_buyer_color: r.key_buyer_color,
            next_step: r.next_step,
          };
        });
        setProducts(map);
        setLoadingProducts(false);
      })
      .catch(() => setLoadingProducts(false));
  }, []);

  const p = products[selected];

  useEffect(() => {
    if (!p) return;
    const hs = HS_LOOKUP[selected];
    if (!hs) { setLiveSuppliers([]); setLoadingLive(false); return; }
    setLoadingLive(true);
    fetchTable('comtrade_data', { eq: ['hs_code', hs] })
      .then(rows => {
        // Get latest year available
        const years = [...new Set(rows.map(r => r.ref_year))].sort((a,b) => b-a);
        const latestYear = years[0];
        const latest = rows
          .filter(r => r.ref_year === latestYear && r.fob_value_usd > 0)
          .sort((a,b) => b.fob_value_usd - a.fob_value_usd);
        setLiveSuppliers(latest);
        setLoadingLive(false);
      })
      .catch(() => setLoadingLive(false));
  }, [selected, p]);

  useEffect(() => {
    fetchTable('tariff_rates')
      .then(rows => {
        const map = {};
        rows.forEach(r => { map[r.hs_code] = r; });
        setLiveTariffs(map);
      });
  }, []);

  if (loadingProducts) {
    return <div style={{ padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Loading product intel...</div>;
  }
  if (!p) {
    return <div style={{ padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Product not found.</div>;
  }

  const btnStyle = (name) => ({
    background: selected === name ? 'var(--bg-hover)' : 'none',
    border: '1px solid ' + (selected === name ? 'var(--border-bright)' : 'var(--border)'),
    borderRadius: 4, padding: '6px 14px', cursor: 'pointer',
    color: selected === name ? 'var(--text-primary)' : 'var(--text-muted)',
    fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.04em', whiteSpace: 'nowrap',
  });

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:8 }}>
        <button onClick={() => generateProductIntelReport({ product: selected, p, liveSuppliers })}
          style={{ padding:'6px 16px', background:'var(--gold)', border:'none', borderRadius:4,
            cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:11, color:'#fff',
            letterSpacing:'0.06em' }}>
          ⬇ GENERATE REPORT
        </button>
      </div>
      {/* Product selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {PRODUCT_ORDER.map(name => (
          <button key={name} style={btnStyle(name)} onClick={() => setSelected(name)}>
            {name} <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>{products[name]?.hs}</span>
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
          <div className="section-label" style={{ marginBottom: 16 }}>
            Who supplies South Africa today
            {!loadingLive && liveSuppliers.length > 0 && (
              <span style={{ fontSize: 10, color: '#2ecc71', fontFamily: 'var(--font-mono)',
                marginLeft: 8, padding: '2px 6px', background: 'rgba(46,204,113,0.1)',
                border: '1px solid rgba(46,204,113,0.3)', borderRadius: 3 }}>
                LIVE — {liveSuppliers[0]?.ref_year}
              </span>
            )}
          </div>
          {loadingLive ? (
            <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Loading live data...</div>
          ) : liveSuppliers.length > 0 ? (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Volume (kg)<HelpTip text="Net weight in kg SA imported from this country. Source: UN Comtrade." /></th>
                    <th>FOB Value<HelpTip text="Total FOB value of imports from this country." /></th>
                    <th>$/kg FOB<HelpTip text="Average FOB price per kg." /></th>
                  </tr>
                </thead>
                <tbody>
                  {liveSuppliers.slice(0, 10).map(row => {
                    const isLatam = ['Argentina','Brazil','Uruguay','Paraguay','Chile'].includes(row.partner_name);
                    const priceKg = row.qty_kg > 0 ? row.fob_value_usd / row.qty_kg : null;
                    return (
                      <tr key={row.partner_name} style={{ background: isLatam ? 'rgba(46,204,113,0.06)' : '' }}>
                        <td style={{ color: isLatam ? '#2ecc71' : 'var(--text-primary)', fontWeight: isLatam ? 700 : 400 }}>
                          {isLatam ? '★ ' : ''}{row.partner_name}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{row.qty_kg ? (row.qty_kg/1000).toFixed(0) + ' MT' : '-'}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>${(row.fob_value_usd/1000).toFixed(0)}K</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: isLatam ? '#2ecc71' : 'var(--text-secondary)' }}>
                          {priceKg ? '$' + priceKg.toFixed(3) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(232,184,75,0.08)',
                border: '1px solid rgba(232,184,75,0.2)', borderRadius: 4,
                fontSize: 12, color: '#e8b84b', fontFamily: 'var(--font-mono)' }}>
                {p.sa_market_label}
              </div>
            </>
          ) : (
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
                    <td style={{ fontFamily: 'var(--font-mono)', color: row.supplier === 'Argentina' ? '#2ecc71' : 'var(--text-secondary)' }}>
                      {row.price_per_kg ? '$' + row.price_per_kg.toFixed(3) : '-'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{row.share_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
