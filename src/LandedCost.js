import React, { useState, useEffect } from 'react';
import Tooltip from './Tooltip';
import { fetchTable } from './supabase';

const INSURANCE = 0.005;
const MERCOSUR_COUNTRIES = ['Argentina', 'Brazil', 'Uruguay', 'Paraguay'];

function getTariffUsd(tariff, supplierName, zarUsd) {
  if (!tariff) return { rate: 0, label: 'Unknown', confirmed: false, isPct: false };
  const isMercosur = MERCOSUR_COUNTRIES.includes(supplierName);
  if (tariff.unit === 'specific') {
    const zarPerKg = isMercosur ? (tariff.mercosur_zar_per_kg || tariff.general_zar_per_kg) : tariff.general_zar_per_kg;
    return { rate: (zarPerKg || 0) / zarUsd, label: isMercosur ? tariff.mercosur : tariff.general, confirmed: tariff.confirmed, isPct: false };
  }
  const pct = isMercosur ? (tariff.mercosur_pct ?? tariff.general_pct) : tariff.general_pct;
  return { rate: pct || 0, label: isMercosur ? tariff.mercosur : tariff.general, confirmed: tariff.confirmed, isPct: true };
}

const PRODUCT_ORDER_LC = ['Modified Starch','Milk Powder (FCMP)','Sunflower Oil','Soybean Oil','Soybean Meal','Corn','Wheat Flour','Glucose Syrup','Cassava Starch','Maize Starch','Wheat Starch','Corn Flour','Gelatin','Peptones/Proteins'];


function SupplierTable({ suppliers, saMarket, tariffUsd, title, tariffNote, tariffData, zarUsd }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="card-title">{title}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
          SA market: <span style={{ color: 'var(--gold-bright)' }}>${saMarket.toFixed(3)}/kg</span>
          &nbsp;|&nbsp; Tariff: <span style={{ color: tariffUsd > 0 ? '#e8b84b' : tariffNote.startsWith('TBC') ? '#e74c3c' : '#2ecc71' }}>
            {tariffUsd > 0 ? '$' + tariffUsd.toFixed(3) + '/kg' : tariffNote.startsWith('TBC') ? 'TBC' : 'FREE'}
          </span>
        </div>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Supplier</th><th>FOB $/kg<Tooltip text="Free On Board — the supplier's export price before freight, insurance and tariffs are added." /></th><th>Freight<Tooltip text="Estimated sea freight cost per kg from origin port to Durban. Includes basic ocean freight only — does not include port handling or inland trucking." /></th>
            <th>Tariff<Tooltip text="SA import duty per kg. MFN = Most Favoured Nation rate applied to all countries. MERCOSUR countries (Argentina, Brazil, Uruguay, Paraguay) get a preferential rate on some products." /></th><th>Landed<Tooltip text="Total cost to land the product in Durban: FOB + Freight + Insurance (0.5% of FOB) + Tariff." /></th><th>vs Market<Tooltip text="Landed cost vs the current SA market price. Positive = room for margin. Negative = not competitive at current prices." /></th><th>Status<Tooltip text="VIABLE: margin above $0.05/kg. MARGINAL: positive but thin. NOT VIABLE: landed cost exceeds SA market price." /></th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map(function(s) {
            const ins = s.fob * INSURANCE;
            const tariffInfo = getTariffUsd(tariffData, s.name, zarUsd);
            const effectiveTariff = tariffInfo.isPct ? s.fob * tariffInfo.rate : tariffInfo.rate;
            const landed = s.fob + s.freight + ins + effectiveTariff;
            const margin = saMarket - landed;
            const status = margin > 0.05 ? 'VIABLE' : margin > 0 ? 'MARGINAL' : 'NOT VIABLE';
            const color  = margin > 0.05 ? '#2ecc71' : margin > 0 ? '#e8b84b' : '#e74c3c';
            return (
              <tr key={s.name} style={{ background: s.highlight ? 'rgba(46,204,113,0.04)' : undefined }}>
                <td style={{ color: s.highlight ? '#2ecc71' : 'var(--text-primary)', fontWeight: s.highlight ? 600 : 400 }}>
                  {s.highlight ? '★ ' : ''}{s.name}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>${s.fob.toFixed(3)}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>${s.freight.toFixed(3)}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12,
                  color: effectiveTariff > 0 ? (MERCOSUR_COUNTRIES.includes(s.name) && tariffInfo.rate < (getTariffUsd(tariffData, 'Other', zarUsd).rate) ? '#2ecc71' : '#e8b84b') : 'var(--text-muted)' }}>
                  ${effectiveTariff.toFixed(3)} <span style={{fontSize:10}}>({tariffInfo.label})</span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  ${landed.toFixed(3)}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color }}>
                  {margin >= 0 ? '+' : ''}{margin.toFixed(3)}
                </td>
                <td>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700,
                    color, background: color + '18', border: '1px solid ' + color + '40',
                    padding: '2px 8px', borderRadius: 3 }}>{status}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {tariffNote.startsWith('TBC') && (
        <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(231,76,60,0.08)',
          border: '1px solid rgba(231,76,60,0.2)', borderRadius: 4,
          fontSize: 11, color: '#e74c3c', fontFamily: 'var(--font-mono)' }}>
          ⚠ Tariff unconfirmed — landed cost and margin may change. Verify with SARS before proceeding.
        </div>
      )}
    </div>
  );
}

export default function LandedCost() {
  const [zarUsd,    setZarUsd]    = useState(16.44);
  const [fetching,  setFetching]  = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const [selected,  setSelected]  = useState('Modified Starch');
  const [products,  setProducts]  = useState({});
  const [tariffs,   setTariffs]   = useState({});
  const [loading,   setLoading]   = useState(true);

  useEffect(function() {
    Promise.all([
      fetchTable('landed_cost_products'),
      fetchTable('tariff_rates'),
    ]).then(function([prods, tariffRows]) {
      const pMap = {};
      prods.forEach(function(p) {
        pMap[p.product_name] = {
          ...p,
          suppliers: typeof p.suppliers === 'string' ? JSON.parse(p.suppliers) : (p.suppliers || []),
        };
      });
      const tMap = {};
      tariffRows.forEach(function(t) { tMap[t.hs_code] = t; });
      setProducts(pMap);
      setTariffs(tMap);
      setLoading(false);
    }).catch(function() { setLoading(false); });
  }, []);

  async function fetchRate() {
    setFetching(true);
    try {
      const r = await fetch('https://api.frankfurter.app/latest?from=USD&to=ZAR');
      const d = await r.json();
      if (d.rates && d.rates.ZAR) {
        setZarUsd(parseFloat(d.rates.ZAR.toFixed(2)));
        setLastFetch(new Date().toLocaleTimeString());
      }
    } catch(e) { console.error('FX fetch failed:', e); }
    finally { setFetching(false); }
  }

  useEffect(function() { fetchRate(); }, []);

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Loading landed cost data...</div>;
  if (!products[selected]) return <div style={{ padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Product not found.</div>;

  const p = products[selected];
  const tariffUsd = p.tariffType === 'zar' ? p.tariffZar / zarUsd : (p.tariffUsd || 0);

  // Break-even for ZAR-denominated tariffs
  const argSupplier = p.suppliers.find(s => s.highlight);
  const argCIF = argSupplier ? argSupplier.fob + argSupplier.freight + argSupplier.fob * INSURANCE : null;
  const breakEvenZar = p.tariffType === 'zar' && argCIF
    ? p.tariffZar / (p.saMarket - argCIF)
    : null;

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
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {PRODUCT_ORDER_LC.map(name => (
          <button key={name} style={btnStyle(name)} onClick={() => setSelected(name)}>
            {name} <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>{products[name]?.hs}</span>
          </button>
        ))}
      </div>

      {/* ZAR rate + break-even bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20,
        padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>ZAR / USD Rate</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="number" value={zarUsd} step="0.01"
              onChange={e => setZarUsd(parseFloat(e.target.value) || 16.44)}
              style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-bright)',
                borderRadius: 4, color: 'var(--gold-bright)', fontFamily: 'var(--font-mono)',
                fontSize: 20, fontWeight: 700, width: 90, padding: '4px 8px' }} />
            <button onClick={fetchRate} disabled={fetching}
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: 4, color: '#3b82f6', fontFamily: 'var(--font-mono)', fontSize: 11,
                padding: '6px 12px', cursor: 'pointer', letterSpacing: '0.06em' }}>
              {fetching ? 'FETCHING...' : 'LIVE RATE'}
            </button>
            {lastFetch && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Updated {lastFetch}</span>}
          </div>
        </div>
        {p.tariffType === 'zar' && breakEvenZar && (
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
              {selected.toUpperCase()} TARIFF AT THIS RATE
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18,
              color: zarUsd >= breakEvenZar ? '#2ecc71' : '#e74c3c' }}>
              ${tariffUsd.toFixed(3)}/kg
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Break-even: R{breakEvenZar.toFixed(2)}/USD &nbsp;
              <span style={{ color: zarUsd >= breakEvenZar ? '#2ecc71' : '#e74c3c' }}>
                {zarUsd >= breakEvenZar ? '✓ Argentina viable' : '✗ Argentina not viable'}
              </span>
            </div>
          </div>
        )}
        {p.tariffType !== 'zar' && (
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>TARIFF</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18,
              color: p.tariffNote.startsWith('TBC') ? '#e74c3c' : '#2ecc71' }}>
              {p.tariffNote.startsWith('TBC') ? 'UNCONFIRMED' : 'FREE'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.tariffNote}</div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 20, padding: '10px 14px',
        background: 'rgba(200,153,58,0.06)', border: '1px solid rgba(200,153,58,0.2)', borderRadius: 6,
        fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        <strong style={{ color: 'var(--gold-bright)' }}>How to use: </strong>
        Adjust the ZAR/USD rate or click LIVE RATE to fetch the current exchange rate.
        The landed cost and margins recalculate instantly. Green = viable today.
        FOB prices from UN Comtrade 2023/2024. Freight estimates origin to Durban.
        Tariffs confirmed from SARS Schedule 1 Part 1 (updated 2026-05-15).
      </div>

      <SupplierTable
        suppliers={p.suppliers}
        saMarket={p.saMarket}
        tariffUsd={tariffUsd}
        tariffNote={p.tariffNote}
        title={selected + ' (' + p.hs + ') — Delivered Durban'}
        tariffData={tariffs[p.hs_code]}
        zarUsd={zarUsd}
      />

      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 8 }}>
        Sources: FOB prices UN Comtrade 2023/2024 | Tariffs SARS Schedule 1 Part 1 dated 2026-05-15 |
        FX rate via frankfurter.app | Freight estimates based on typical sea freight origin to Durban
      </div>
    </div>
  );
}
