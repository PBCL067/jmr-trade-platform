import React, { useState, useEffect } from 'react';
import Tooltip from './Tooltip';
import { fetchTable } from './supabase';

const SIGNAL_COLOR = { BUY: '#2ecc71', SELL: '#e74c3c', NEUTRAL: '#e8b84b' };
const SIGNAL_BG    = { BUY: 'rgba(46,204,113,0.1)', SELL: 'rgba(231,76,60,0.1)', NEUTRAL: 'rgba(232,184,75,0.1)' };

const LABELS = {
  coffee_arabica: 'Coffee Arabica', coffee_robusta: 'Coffee Robusta',
  wheat_hrw: 'Wheat HRW', wheat_srw: 'Wheat SRW',
  corn: 'Corn', soybeans: 'Soybeans',
  soybean_oil: 'Soybean Oil', soybean_meal: 'Soybean Meal',
  sunflower_oil: 'Sunflower Oil', rapeseed_oil: 'Rapeseed Oil',
  palm_oil: 'Palm Oil', sugar: 'Sugar', rice: 'Rice',
};

const RELEVANCE = {
  coffee_arabica:  'KEY signal. Indonesia and Colombia sourcing opportunity.',
  coffee_robusta:  'Vietnam and Ivory Coast origin. Price declining.',
  wheat_hrw:       'Egypt is world largest importer. Watch for sourcing opportunity.',
  corn:            'Argentina is 3rd largest global exporter. Key starch raw material.',
  soybeans:        'Argentina is 3rd largest global exporter. Watch crush margins.',
  soybean_oil:     'Argentina is major exporter. Margins under pressure.',
  soybean_meal:    'Argentina is world number 1 exporter.',
  sunflower_oil:   'Argentina is 2nd largest global exporter. SA import opportunity.',
  palm_oil:        'Indonesia and Malaysia dominant. Competing with our oils.',
  sugar:           'Brazil is number 1 global exporter. World prices falling.',
  rice:            'Thailand and Vietnam origin. SA imports growing.',
  rapeseed_oil:    'EU and Canada dominant.',
  wheat_srw:       'Soft wheat benchmark.',
};

function ScoreBar({ value }) {
  const abs = Math.min(Math.abs(value) / 2 * 100, 100);
  const pos = value >= 0;
  return (
    <div className="score-bar-wrap">
      <div className="score-bar-track">
        <div className={'score-bar-fill ' + (pos ? 'score-bar-fill--pos' : 'score-bar-fill--neg')}
          style={{ width: abs + '%' }} />
      </div>
      <span className={'score-bar-val val ' + (pos ? 'val--pos' : 'val--neg')}>
        {pos ? '+' : ''}{value.toFixed(2)}
      </span>
    </div>
  );
}

function SignalDetail({ name, data }) {
  const color = SIGNAL_COLOR[data.signal] || '#4a5a70';
  return (
    <div className="card" style={{ marginTop: 20, borderColor: color + '40' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
            {LABELS[name] || name}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {data.price} {data.price_unit} &nbsp;|&nbsp; 12m avg: {data.ma12} {data.price_unit}
          </div>
        </div>
        <div style={{ padding: '6px 16px', borderRadius: 4, fontSize: 14, fontWeight: 700,
          fontFamily: 'var(--font-mono)', color, background: SIGNAL_BG[data.signal],
          border: '1px solid ' + color + '40' }}>{data.signal}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 10 }}>Signal Components<Tooltip text="Momentum: short-term price direction. Trend: medium-term direction. Seasonal: typical price behaviour at this time of year. 5yr Rank: how expensive vs history." /></div>
          {[
            ['Momentum',     data.momentum_score],
            ['Trend',        data.trend_score],
            ['Seasonal',     data.seasonal_score > 1 ? 1 : data.seasonal_score < -1 ? -1 : data.seasonal_score],
            ['5yr Rank',     data.rank_score],
          ].map(function(c) {
            return (
              <div key={c[0]} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{c[0]}</div>
                <ScoreBar value={c[1]} />
              </div>
            );
          })}
        </div>
        <div>
          <div className="section-label" style={{ marginBottom: 10 }}>Price position (5yr range)<Tooltip text="Percentile rank of today's price within the last 5 years of data. 10th = near historic low, 90th = near historic high." /></div>
          <div style={{ padding: '14px 16px', background: 'var(--bg-hover)', borderRadius: 6, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>PERCENTILE RANK</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, color }}>
              {Math.round(data.pct_rank_5yr * 100)}th
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {data.pct_rank_5yr > 0.7 ? 'Near 5yr high' : data.pct_rank_5yr < 0.3 ? 'Near 5yr low' : 'Mid-range'}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[['3m change', data.trend_3m_pct, '%'], ['12m change', data.trend_12m_pct, '%']].map(function(r) {
              return (
                <div key={r[0]} style={{ padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{r[0]}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: r[1] >= 0 ? '#2ecc71' : '#e74c3c' }}>
                    {r[1] >= 0 ? '+' : ''}{r[1]}{r[2]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {RELEVANCE[name] && (
        <div style={{ padding: '10px 14px', background: 'rgba(200,153,58,0.05)', border: '1px solid rgba(200,153,58,0.15)', borderRadius: 4, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--gold-bright)' }}>Relevance to JMR: </strong>{RELEVANCE[name]}
        </div>
      )}
    </div>
  );
}

export default function Signals() {
  const [allSignals, setAllSignals] = useState({});
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState('coffee_arabica');
  const [filter, setFilter]         = useState('ALL');

  useEffect(function() {
    fetchTable('signals')
      .then(function(rows) {
        const map = {};
        rows.forEach(function(d) { if (d.commodity && d.signal) map[d.commodity] = d; });
        if (Object.keys(map).length > 0) setAllSignals(map);
        setLoading(false);
      })
      .catch(function(e) { console.error(e); setLoading(false); });
  }, []);

  if (loading) return <div className="loading">Loading signals</div>;

  const filtered = Object.entries(allSignals).filter(function(e) {
    return filter === 'ALL' || e[1].signal === filter;
  });

  const counts = { BUY: 0, SELL: 0, NEUTRAL: 0 };
  Object.values(allSignals).forEach(function(s) { if (counts[s.signal] !== undefined) counts[s.signal]++; });

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {['BUY','NEUTRAL','SELL'].map(function(s) {
          const color = SIGNAL_COLOR[s];
          return (
            <div key={s} className="card" style={{ cursor: 'pointer', borderColor: filter === s ? color : undefined }}
              onClick={() => setFilter(filter === s ? 'ALL' : s)}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{s}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, color }}>{counts[s]}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>commodities</div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Commodity</th><th>Signal</th><th>Price</th>
              <th style={{ minWidth: 160 }}>Score<Tooltip text="Combined signal score from -2 to +2. Above +0.5 = BUY, below -0.5 = SELL. Combines momentum, trend, seasonal, and 5yr rank components." /></th><th>3m<Tooltip text="Price change over the last 3 months. Green = rising, red = falling." /></th><th>12m<Tooltip text="Price change over the last 12 months." /></th><th>5yr rank<Tooltip text="Where today's price sits within the last 5 years. Below 30% = historically cheap (green). Above 70% = historically expensive (red)." /></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(function(entry) {
              const name = entry[0]; const data = entry[1];
              const color = SIGNAL_COLOR[data.signal] || '#4a5a70';
              return (
                <tr key={name} onClick={() => setSelected(name)}
                  style={{ cursor: 'pointer', background: selected === name ? 'var(--bg-hover)' : 'transparent' }}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{LABELS[name] || name}</td>
                  <td>
                    <span style={{ padding: '2px 8px', borderRadius: 3, fontSize: 11, fontFamily: 'var(--font-mono)',
                      fontWeight: 700, letterSpacing: '0.04em', color, background: SIGNAL_BG[data.signal],
                      border: '1px solid ' + color + '40' }}>{data.signal}</span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                    {data.price} <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{data.price_unit}</span>
                  </td>
                  <td><ScoreBar value={data.combined_score} /></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: data.trend_3m_pct >= 0 ? '#2ecc71' : '#e74c3c' }}>
                    {data.trend_3m_pct >= 0 ? '+' : ''}{data.trend_3m_pct}%
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: data.trend_12m_pct >= 0 ? '#2ecc71' : '#e74c3c' }}>
                    {data.trend_12m_pct >= 0 ? '+' : ''}{data.trend_12m_pct}%
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12,
                    color: data.pct_rank_5yr > 0.7 ? '#e74c3c' : data.pct_rank_5yr < 0.3 ? '#2ecc71' : '#e8b84b' }}>
                    {Math.round(data.pct_rank_5yr * 100)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && allSignals[selected] && <SignalDetail name={selected} data={allSignals[selected]} />}

      <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        Source: World Bank Pink Sheet &nbsp;|&nbsp; Updated: {Object.values(allSignals)[0]?.updated || ''}
      </div>
    </div>
  );
}
