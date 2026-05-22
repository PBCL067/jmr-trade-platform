import React, { useState, useEffect } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line } from 'recharts';
import { fetchDoc } from './firebase';

function ScoreBar({ value, max = 2 }) {
  const v = typeof value === 'number' ? value : 0;
  const pct = Math.min(Math.abs(v) / max * 100, 100);
  const pos = v >= 0;
  return (
    <div className="score-bar-wrap">
      <div className="score-bar-track">
        <div className={'score-bar-fill ' + (pos ? 'score-bar-fill--pos' : 'score-bar-fill--neg')} style={{ width: pct + '%' }} />
      </div>
      <span className={'score-bar-val val ' + (pos ? 'val--pos' : 'val--neg')}>
        {pos ? '+' : ''}{v.toFixed(2)}
      </span>
    </div>
  );
}

function SignalCard({ name, data, sparkline }) {
  if (!data) return null;
  const score = data.combined_score || 0;
  const signal = data.signal || 'HOLD';
  const radarData = [
    { axis: 'Model A',   value: Math.abs(data.model_a_score || 0) },
    { axis: 'Forecast',  value: Math.abs((data.forecast_surprise_pct || 0) / 10) },
    { axis: 'Sentiment', value: Math.abs((data.sentiment_index || 0) / 100) },
    { axis: 'Seasonal',  value: Math.abs(data.seasonal_adjustment || 0) },
  ];
  const sparkData = (sparkline || []).map(function(v, i) { return { i: i, v: v }; });

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div className="card-title">{name}</div>
          <div className="card-sub" style={{ fontFamily: 'var(--font-mono)' }}>
            {data.price} {data.price_unit}
          </div>
        </div>
        <span className={'badge badge--' + signal.toLowerCase()}>{signal}</span>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div className="stat-label">Composite Score</div>
        <ScoreBar value={score} max={2} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 10 }}>Components</div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Model A</div>
            <ScoreBar value={data.model_a_score || 0} max={1} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Forecast Surprise</div>
            <ScoreBar value={(data.forecast_surprise_pct || 0) / 10} max={1} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Sentiment Index</div>
            <ScoreBar value={(data.sentiment_index || 0) / 100} max={1} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Seasonal Adjustment</div>
            <ScoreBar value={data.seasonal_adjustment || 0} max={1} />
          </div>
        </div>
        <div>
          <ResponsiveContainer width="100%" height={150}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e2d42" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: '#4a5a70', fontSize: 9, fontFamily: 'IBM Plex Mono' }} />
              <Radar dataKey="value" stroke="#e8b84b" fill="#e8b84b" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {data.signal_driver && (
        <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(200,153,58,0.05)', border: '1px solid rgba(200,153,58,0.15)', borderRadius: 4, fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          {data.signal_driver}
        </div>
      )}

      {sparkData.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="section-label" style={{ marginBottom: 6 }}>Price trend</div>
          <ResponsiveContainer width="100%" height={40}>
            <LineChart data={sparkData}>
              <Line type="monotone" dataKey="v" stroke="#2ecc71" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function Signals() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(function() {
    (async function() {
      try {
        const data = await fetchDoc('signals', 'current');
        setSummary(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="loading">Loading signals</div>;

  if (error || !summary) {
    return <div style={{ padding: 20, color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
      Error loading signals: {error}
    </div>;
  }

  const coffee = summary.coffee_arabica || {};
  const wheat  = summary.wheat_hrw || {};

  return (
    <div>
      {summary.macro_theme && (
        <div style={{ marginBottom: 20, padding: '10px 16px', background: 'rgba(200,153,58,0.06)', border: '1px solid rgba(200,153,58,0.2)', borderRadius: 4, fontSize: 12, color: 'var(--gold-bright)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
          MACRO: {summary.macro_theme}
        </div>
      )}

      <div className="page-section">
        <div className="section-label">Active Commodity Signals &mdash; {summary.date}</div>
        <div className="card-grid card-grid--2">
          <SignalCard name="Coffee Arabica" data={coffee} sparkline={[7.1,7.2,7.0,7.3,7.2,7.4,7.3,7.3,7.3,7.3]} />
          <SignalCard name="Wheat HRW"      data={wheat}  sparkline={[276,278,275,280,279,281,280,282,282,282]} />
        </div>
      </div>

      <div className="page-section">
        <div className="section-label">Signal Summary &mdash; updated {summary.updated}</div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Commodity</th><th>Signal</th><th>Score</th>
                <th>Model A</th><th>Forecast Surprise</th><th>Sentiment</th><th>Seasonal</th>
              </tr>
            </thead>
            <tbody>
              {[['Coffee Arabica', coffee], ['Wheat HRW', wheat]].map(function(row) {
                var name = row[0]; var d = row[1];
                var sig = d.signal || 'HOLD';
                return (
                  <tr key={name}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{name}</td>
                    <td><span className={'badge badge--' + sig.toLowerCase()}>{sig}</span></td>
                    <td className={'val ' + ((d.combined_score||0) >= 0 ? 'val--pos' : 'val--neg')}>
                      {(d.combined_score||0) >= 0 ? '+' : ''}{(d.combined_score||0).toFixed(2)}
                    </td>
                    <td className={'val ' + ((d.model_a_score||0) >= 0 ? 'val--pos' : 'val--neg')}>
                      {(d.model_a_score||0) >= 0 ? '+' : ''}{(d.model_a_score||0).toFixed(2)}
                    </td>
                    <td className={'val ' + ((d.forecast_surprise_pct||0) >= 0 ? 'val--pos' : 'val--neg')}>
                      {(d.forecast_surprise_pct||0) >= 0 ? '+' : ''}{(d.forecast_surprise_pct||0).toFixed(1)}%
                    </td>
                    <td className="val val--pos">{(d.sentiment_index||0).toFixed(1)}</td>
                    <td className={'val ' + ((d.seasonal_adjustment||0) >= 0 ? 'val--pos' : 'val--neg')}>
                      {(d.seasonal_adjustment||0) >= 0 ? '+' : ''}{(d.seasonal_adjustment||0).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
