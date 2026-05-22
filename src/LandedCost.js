import React, { useState, useEffect } from 'react';

const STARCH_SUPPLIERS = [
  { name: 'Argentina',   fob: 0.690, freight: 0.12, highlight: true },
  { name: 'Vietnam',     fob: 0.757, freight: 0.15 },
  { name: 'Thailand',    fob: 0.902, freight: 0.14 },
  { name: 'Brazil',      fob: 1.290, freight: 0.11 },
  { name: 'China',       fob: 1.446, freight: 0.13 },
  { name: 'Netherlands', fob: 1.887, freight: 0.20 },
  { name: 'Germany',     fob: 2.181, freight: 0.19 },
];

const MILK_SUPPLIERS = [
  { name: 'New Zealand', fob: 3.311, freight: 0.18 },
  { name: 'Uruguay',     fob: 3.579, freight: 0.11 },
  { name: 'Brazil',      fob: 3.580, freight: 0.11 },
  { name: 'Argentina',   fob: 3.609, freight: 0.12, highlight: true },
  { name: 'Ireland',     fob: 3.709, freight: 0.20 },
  { name: 'Germany',     fob: 4.396, freight: 0.19 },
  { name: 'Australia',   fob: 5.562, freight: 0.17 },
];

const INSURANCE = 0.005;

function SupplierTable({ suppliers, saMarket, tariffUsd, title, unit }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="card-title">{title}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
          SA market: <span style={{ color: 'var(--gold-bright)' }}>${saMarket.toFixed(3)}/kg</span>
          &nbsp;|&nbsp; Tariff: <span style={{ color: tariffUsd > 0 ? '#e8b84b' : '#2ecc71' }}>
            {tariffUsd > 0 ? '$' + tariffUsd.toFixed(3) + '/kg' : 'FREE'}
          </span>
        </div>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Supplier</th>
            <th>FOB $/kg</th>
            <th>Freight</th>
            <th>Tariff</th>
            <th>Landed</th>
            <th>vs Market</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map(function(s) {
            const ins     = s.fob * INSURANCE;
            const landed  = s.fob + s.freight + ins + tariffUsd;
            const margin  = saMarket - landed;
            const status  = margin > 0.05 ? 'VIABLE' : margin > 0 ? 'MARGINAL' : 'NOT VIABLE';
            const color   = margin > 0.05 ? '#2ecc71' : margin > 0 ? '#e8b84b' : '#e74c3c';
            return (
              <tr key={s.name} style={{ background: s.highlight ? 'rgba(46,204,113,0.04)' : undefined }}>
                <td style={{ color: s.highlight ? '#2ecc71' : 'var(--text-primary)', fontWeight: s.highlight ? 600 : 400 }}>
                  {s.highlight ? '\u2605 ' : ''}{s.name}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>${s.fob.toFixed(3)}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>${s.freight.toFixed(3)}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: tariffUsd > 0 ? '#e8b84b' : 'var(--text-muted)' }}>
                  ${tariffUsd.toFixed(3)}
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
    </div>
  );
}

export default function LandedCost() {
  const [zarUsd, setZarUsd]       = useState(16.44);
  const [fetching, setFetching]   = useState(false);
  const [lastFetch, setLastFetch] = useState(null);

  async function fetchRate() {
    setFetching(true);
    try {
      const r = await fetch('https://api.frankfurter.app/latest?from=USD&to=ZAR');
      const d = await r.json();
      if (d.rates && d.rates.ZAR) {
        setZarUsd(parseFloat(d.rates.ZAR.toFixed(2)));
        setLastFetch(new Date().toLocaleTimeString());
      }
    } catch(e) {
      console.error('FX fetch failed:', e);
    } finally {
      setFetching(false);
    }
  }

  useEffect(function() { fetchRate(); }, []);

  const milkTariffUsd = 4.50 / zarUsd;

  // Break-even analysis for Argentina milk powder
  const argMilkFob      = 3.609;
  const argMilkFreight  = 0.12;
  const argMilkCIF      = argMilkFob + argMilkFreight + argMilkFob * INSURANCE;
  const milkMarket      = 4.11;
  const breakEvenZar    = 4.50 / (milkMarket - argMilkCIF);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24,
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
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
            MILK POWDER TARIFF AT THIS RATE
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18,
            color: zarUsd >= breakEvenZar ? '#2ecc71' : '#e74c3c' }}>
            ${milkTariffUsd.toFixed(3)}/kg
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            Break-even: R{breakEvenZar.toFixed(2)}/USD &nbsp;
            <span style={{ color: zarUsd >= breakEvenZar ? '#2ecc71' : '#e74c3c' }}>
              {zarUsd >= breakEvenZar ? '\u2713 Argentina viable' : '\u2717 Argentina not viable'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20, padding: '10px 14px',
        background: 'rgba(200,153,58,0.06)', border: '1px solid rgba(200,153,58,0.2)', borderRadius: 6,
        fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        <strong style={{ color: 'var(--gold-bright)' }}>How to use: </strong>
        Adjust the ZAR/USD rate or click LIVE RATE to fetch the current exchange rate.
        The landed cost and margins recalculate instantly. Green = viable today.
        FOB prices from UN Comtrade 2023. Freight estimates Buenos Aires/origin to Durban.
        Tariffs confirmed from SARS Schedule 1 Part 1 (updated 2026-05-15).
      </div>

      <SupplierTable
        suppliers={STARCH_SUPPLIERS}
        saMarket={1.09}
        tariffUsd={0}
        title="Modified Starch (HS 3505.10) — Delivered Durban"
        unit="$/kg"
      />

      <SupplierTable
        suppliers={MILK_SUPPLIERS}
        saMarket={4.11}
        tariffUsd={milkTariffUsd}
        title="Full Cream Milk Powder (HS 0402.21) — Delivered Durban"
        unit="$/kg"
      />

      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 8 }}>
        Sources: FOB prices UN Comtrade 2023 | Tariffs SARS Schedule 1 Part 1 dated 2026-05-15 |
        FX rate via frankfurter.app | Freight estimates based on typical sea freight Buenos Aires/origin to Durban
      </div>
    </div>
  );
}
