import React, { useState } from 'react';
import { SA_IMPORT_INTEL } from './data/productIntelData';

const GAP_COLOR = {
  'UNTAPPED':          '#e74c3c',
  'UNDERREPRESENTED':  '#e8b84b',
  'COMPETING':         '#3b82f6',
  'LATAM DOMINANT':    '#2ecc71',
};

const fmt = (n) => n >= 1e9 ? '$' + (n/1e9).toFixed(1) + 'B' : n >= 1e6 ? '$' + (n/1e6).toFixed(1) + 'M' : n >= 1e3 ? '$' + (n/1e3).toFixed(0) + 'K' : '$' + n.toFixed(0);

export default function MarketIntel() {
  const [selected,   setSelected]   = useState(null);
  const [filterGap,  setFilterGap]  = useState('All');
  const [sortBy,     setSortBy]     = useState('total_cif_usd');

  const gaps = ['All', 'UNTAPPED', 'UNDERREPRESENTED', 'COMPETING', 'LATAM DOMINANT'];

  const filtered = SA_IMPORT_INTEL
    .filter(p => filterGap === 'All' || p.gap_signal === filterGap)
    .sort((a, b) => sortBy === 'total_cif_usd' ? b.total_cif_usd - a.total_cif_usd
                  : sortBy === 'latam_pct'     ? a.latam_pct - b.latam_pct
                  : b.our_suppliers.length - a.our_suppliers.length);

  const selectedProduct = selected ? SA_IMPORT_INTEL.find(p => p.product === selected) : null;

  const selectStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4,
    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 11,
    padding: '5px 8px', cursor: 'pointer',
  };
  const labelStyle = {
    fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, display: 'block',
  };

  return (
    <div>
      <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        What South Africa imports by ingredient category, who supplies it, Latam market share, and which of our suppliers can compete. Data: SA Comtrade 2024.
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {['UNTAPPED','UNDERREPRESENTED','COMPETING','LATAM DOMINANT'].map(signal => {
          const count = SA_IMPORT_INTEL.filter(p => p.gap_signal === signal).length;
          const total = SA_IMPORT_INTEL.filter(p => p.gap_signal === signal).reduce((s,p) => s + p.total_cif_usd, 0);
          const color = GAP_COLOR[signal];
          return (
            <div key={signal} className="card" style={{ borderColor: color + '40', cursor: 'pointer',
              background: filterGap === signal ? color + '12' : undefined }}
              onClick={() => setFilterGap(filterGap === signal ? 'All' : signal)}>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 6 }}>{signal}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color }}>{count}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{fmt(total)} SA market</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-end' }}>
        <div>
          <span style={labelStyle}>Signal</span>
          <select value={filterGap} onChange={e => setFilterGap(e.target.value)} style={selectStyle}>
            {gaps.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <span style={labelStyle}>Sort by</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
            <option value="total_cif_usd">SA Market Size</option>
            <option value="latam_pct">Latam Share (lowest first)</option>
            <option value="our_suppliers">Our Supplier Coverage</option>
          </select>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', paddingBottom: 6 }}>
          {filtered.length} products
        </span>
      </div>

      {/* Product table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SA Market (CIF)</th>
              <th>Avg CIF $/kg</th>
              <th>Latam Share</th>
              <th>Our Suppliers</th>
              <th>Signal</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const color = GAP_COLOR[p.gap_signal];
              const isSelected = selected === p.product;
              return (
                <tr key={p.product} onClick={() => setSelected(isSelected ? null : p.product)}
                  style={{ cursor: 'pointer', background: isSelected ? 'var(--bg-hover)' : 'transparent' }}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.product}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{fmt(p.total_cif_usd)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>${p.avg_cif_per_kg.toFixed(3)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                        <div style={{ width: p.latam_pct + '%', height: '100%',
                          background: p.latam_pct > 70 ? '#2ecc71' : p.latam_pct > 20 ? '#3b82f6' : p.latam_pct > 0 ? '#e8b84b' : '#e74c3c',
                          borderRadius: 3 }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', minWidth: 32 }}>
                        {p.latam_pct}%
                      </span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12,
                    color: p.our_suppliers.length > 0 ? '#2ecc71' : 'var(--text-muted)' }}>
                    {p.our_suppliers.length > 0 ? p.our_suppliers.length + ' suppliers' : 'none'}
                  </td>
                  <td>
                    <span style={{ padding: '2px 8px', borderRadius: 3, fontSize: 10,
                      fontFamily: 'var(--font-mono)', fontWeight: 700,
                      color, background: color + '18', border: '1px solid ' + color + '40' }}>
                      {p.gap_signal}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selectedProduct && (
        <div className="card" style={{ borderColor: GAP_COLOR[selectedProduct.gap_signal] + '60' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
                {selectedProduct.product}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                HS {selectedProduct.hs_code} | SA imports {fmt(selectedProduct.total_cif_usd)} | {selectedProduct.total_volume_mt.toLocaleString()} MT/yr | Avg CIF ${selectedProduct.avg_cif_per_kg.toFixed(3)}/kg
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ padding: '4px 12px', borderRadius: 3, fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700,
                color: GAP_COLOR[selectedProduct.gap_signal],
                background: GAP_COLOR[selectedProduct.gap_signal] + '18',
                border: '1px solid ' + GAP_COLOR[selectedProduct.gap_signal] + '40' }}>
                {selectedProduct.gap_signal}
              </span>
              <button onClick={() => setSelected(null)}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4,
                  color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11,
                  padding: '3px 8px', cursor: 'pointer' }}>close</button>
            </div>
          </div>

          <div style={{ padding: '10px 14px', background: GAP_COLOR[selectedProduct.gap_signal] + '0d',
            border: '1px solid ' + GAP_COLOR[selectedProduct.gap_signal] + '30',
            borderRadius: 4, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
            {selectedProduct.gap_note}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {/* Top world suppliers */}
            <div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                Top Suppliers to SA (World)
              </div>
              {selectedProduct.top_suppliers.map(s => (
                <div key={s.origin} style={{ marginBottom: 6, padding: '7px 10px',
                  background: s.is_latam ? 'rgba(46,204,113,0.06)' : 'var(--bg-hover)',
                  border: '1px solid ' + (s.is_latam ? 'rgba(46,204,113,0.2)' : 'var(--border)'),
                  borderRadius: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 500,
                      color: s.is_latam ? '#2ecc71' : 'var(--text-primary)' }}>
                      {s.is_latam ? '★ ' : ''}{s.origin}
                    </span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {fmt(s.cif_usd)}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {s.volume_mt.toLocaleString()} MT | ${s.price_per_kg.toFixed(3)}/kg CIF
                  </div>
                </div>
              ))}
            </div>

            {/* Latam suppliers currently in SA */}
            <div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                Latam Currently Supplying SA
              </div>
              {selectedProduct.latam_suppliers.length > 0 ? selectedProduct.latam_suppliers.map(s => (
                <div key={s.origin} style={{ marginBottom: 6, padding: '7px 10px',
                  background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#2ecc71' }}>{s.origin}</span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{fmt(s.cif_usd)}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {s.volume_mt.toLocaleString()} MT | ${s.price_per_kg.toFixed(3)}/kg CIF
                  </div>
                </div>
              )) : (
                <div style={{ padding: '12px', background: 'rgba(231,76,60,0.06)',
                  border: '1px solid rgba(231,76,60,0.2)', borderRadius: 4,
                  fontSize: 12, color: '#e74c3c', fontFamily: 'var(--font-mono)' }}>
                  No Latam suppliers currently in SA
                </div>
              )}
            </div>

            {/* Our suppliers */}
            <div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                Our Suppliers ({selectedProduct.our_suppliers.length})
              </div>
              {selectedProduct.our_suppliers.length > 0 ? selectedProduct.our_suppliers.map(s => (
                <div key={s} style={{ marginBottom: 6, padding: '7px 10px',
                  background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 4,
                  fontSize: 12, color: 'var(--text-primary)' }}>
                  ◉ {s}
                </div>
              )) : (
                <div style={{ padding: '12px', background: 'var(--bg-hover)',
                  border: '1px solid var(--border)', borderRadius: 4,
                  fontSize: 12, color: 'var(--text-muted)' }}>
                  No suppliers mapped yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        Source: UN Comtrade 2024 — SA imports by origin | Latam = Argentina, Brazil, Uruguay, Chile, Paraguay, Bolivia, Colombia, Ecuador, Peru, Mexico
      </div>
    </div>
  );
}
