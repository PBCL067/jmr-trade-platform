import React, { useState } from 'react';
import { INGREDIENT_FLOWS } from './data/ingredientFlowData';

const SECTORS = ['All', 'Bakery', 'Dairy', 'Frozen Food', 'Meat Processing',
                 'Confectionery', 'Instant Food', 'Sauces & Dressings',
                 'Brewing & Beverages', 'Meat Analogues', 'Industrial',
                 'Beverages', 'Nutritional and Health'];

const SECTOR_COLOR = {
  'Bakery':              '#e8b84b',
  'Dairy':               '#4a9eda',
  'Frozen Food':         '#3b82f6',
  'Meat Processing':     '#e74c3c',
  'Confectionery':       '#a855f7',
  'Instant Food':        '#f97316',
  'Sauces & Dressings':  '#2ecc71',
  'Brewing & Beverages': '#06b6d4',
  'Meat Analogues':      '#84cc16',
  'Industrial':          '#4a5a70',
  'Beverages':           '#06b6d4',
  'Nutritional and Health': '#84cc16',
};

export default function IngredientFlow() {
  const [sector,   setSector]   = useState('All');
  const [selected, setSelected] = useState(null);
  const [search,   setSearch]   = useState('');

  const filtered = INGREDIENT_FLOWS.filter(function(f) {
    if (search && !f.ingredient.toLowerCase().includes(search.toLowerCase()) &&
        !f.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (sector !== 'All' && !f.used_in.some(u => u.sector === sector)) return false;
    return true;
  });

  const selectStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4,
    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12,
    padding: '6px 10px', cursor: 'pointer',
  };
  const labelStyle = {
    fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, display: 'block',
  };

  return (
    <div>
      <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        What each ingredient is used for, which African food manufacturers need it, and who in Latam supplies it.
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <span style={labelStyle}>Search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Ingredient or keyword..."
            style={{ ...selectStyle, width: '100%' }} />
        </div>
        <div>
          <span style={labelStyle}>End-use sector</span>
          <select value={sector} onChange={e => setSector(e.target.value)} style={selectStyle}>
            {SECTORS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', paddingBottom: 8 }}>
          {filtered.length} ingredients
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(function(flow) {
          const isSelected = selected === flow.ingredient;
          return (
            <div key={flow.ingredient} className="card"
              style={{ cursor: 'pointer', borderColor: isSelected ? 'var(--border-bright)' : undefined }}
              onClick={() => setSelected(isSelected ? null : flow.ingredient)}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
                    {flow.ingredient}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.5 }}>
                    {flow.description}
                  </div>
                </div>
                <div style={{ marginLeft: 16, fontSize: 18, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {isSelected ? '▲' : '▼'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: isSelected ? 16 : 0 }}>
                {flow.used_in.map(function(u) {
                  const color = SECTOR_COLOR[u.sector] || '#4a5a70';
                  return (
                    <span key={u.sector} style={{ padding: '2px 8px', borderRadius: 3, fontSize: 11,
                      fontFamily: 'var(--font-mono)', fontWeight: 600,
                      color, background: color + '18', border: '1px solid ' + color + '40' }}>
                      {u.sector}
                    </span>
                  );
                })}
              </div>

              {isSelected && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 4 }}>
                  <div>
                    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
                      letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Applications</div>
                    {flow.used_in.map(function(u) {
                      const color = SECTOR_COLOR[u.sector] || '#4a5a70';
                      return (
                        <div key={u.sector} style={{ marginBottom: 8, padding: '8px 12px',
                          background: 'var(--bg-hover)', borderRadius: 4,
                          borderLeft: '3px solid ' + color }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                            {u.sector}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{u.application}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
                      letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Latam Suppliers</div>
                    {flow.supplied_by.map(function(s) {
                      return (
                        <div key={s} style={{ marginBottom: 6, padding: '6px 10px',
                          background: 'var(--bg-hover)', borderRadius: 4,
                          fontSize: 12, color: 'var(--text-primary)',
                          fontFamily: 'var(--font-mono)' }}>
                          ◉ {s}
                        </div>
                      );
                    })}
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
                        letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>African Buyers</div>
                      {flow.african_buyers.map(function(b) {
                        return (
                          <div key={b} style={{ marginBottom: 6, padding: '6px 10px',
                            background: 'rgba(46,204,113,0.05)', borderRadius: 4,
                            border: '1px solid rgba(46,204,113,0.15)',
                            fontSize: 12, color: 'var(--text-secondary)' }}>
                            ▶ {b}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
