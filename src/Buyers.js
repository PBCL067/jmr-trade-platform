import React, { useState } from 'react';
import { BUYERS } from './data/buyerData';

const CATEGORIES = ['All', 'Distributor', 'Confectionery', 'Dairy', 'Bakery',
                    'Food Manufacturer', 'Edible Oils & Fats', 'Instant Food'];
const COUNTRIES  = ['All', 'South Africa', 'Nigeria', 'Kenya', 'Egypt', 'Ghana'];
const STATUS_COLOR = {
  'Priority Target': '#e8b84b',
  'Prospect':        '#4a9eda',
  'Contacted':       '#2ecc71',
  'Active':          '#2ecc71',
};

export default function Buyers() {
  const [category, setCategory] = useState('All');
  const [country,  setCountry]  = useState('All');
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [ingFilter, setIngFilter] = useState('');

  const filtered = BUYERS.filter(b => {
    if (category !== 'All' && b.category !== category) return false;
    if (country  !== 'All' && b.country  !== country)  return false;
    if (search && !b.name.toLowerCase().includes(search.toLowerCase()) &&
        !b.ingredient_needs.some(i => i.toLowerCase().includes(search.toLowerCase()))) return false;
    if (ingFilter && !b.ingredient_needs.some(i => i.toLowerCase().includes(ingFilter.toLowerCase()))) return false;
    return true;
  });

  const selStyle = (val, cur) => ({
    background: val === cur ? 'var(--bg-hover)' : 'none',
    border: '1px solid ' + (val === cur ? 'var(--border-bright)' : 'var(--border)'),
    borderRadius: 4, padding: '5px 12px', cursor: 'pointer',
    color: val === cur ? 'var(--text-primary)' : 'var(--text-muted)',
    fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
  });

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search buyer or ingredient..."
          style={{ flex: 1, minWidth: 200, background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 4, padding: '6px 12px',
            color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12 }} />
        <input value={ingFilter} onChange={e => setIngFilter(e.target.value)}
          placeholder="Filter by ingredient need..."
          style={{ flex: 1, minWidth: 200, background: 'var(--bg-card)',
            border: '1px solid var(--border)', borderRadius: 4, padding: '6px 12px',
            color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12 }} />
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => <button key={c} style={selStyle(c, category)} onClick={() => setCategory(c)}>{c}</button>)}
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {COUNTRIES.map(c => <button key={c} style={selStyle(c, country)} onClick={() => setCountry(c)}>{c}</button>)}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12,
        fontFamily: 'var(--font-mono)' }}>{filtered.length} buyers</div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(buyer => (
          <div key={buyer.id} className="card"
            onClick={() => setSelected(selected?.id === buyer.id ? null : buyer)}
            style={{ cursor: 'pointer', borderColor: selected?.id === buyer.id ? 'var(--border-bright)' : 'transparent' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 3 }}>
                  {buyer.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {buyer.city}, {buyer.country} &nbsp;|&nbsp; {buyer.category}
                  {buyer.revenue_usd_m && ` | ~$${buyer.revenue_usd_m}M revenue`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 3,
                  fontFamily: 'var(--font-mono)', fontWeight: 700,
                  color: STATUS_COLOR[buyer.status] || 'var(--text-muted)',
                  border: '1px solid ' + (STATUS_COLOR[buyer.status] || 'var(--border)') + '40',
                  background: (STATUS_COLOR[buyer.status] || 'var(--border)') + '15' }}>
                  {buyer.status}
                </span>
              </div>
            </div>

            {/* Ingredient needs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: selected?.id === buyer.id ? 12 : 0 }}>
              {buyer.ingredient_needs.map(ing => (
                <span key={ing} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3,
                  background: 'rgba(74,158,218,0.1)', color: '#4a9eda',
                  border: '1px solid rgba(74,158,218,0.2)', fontFamily: 'var(--font-mono)' }}>
                  {ing}
                </span>
              ))}
            </div>

            {/* Expanded detail */}
            {selected?.id === buyer.id && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
                  {buyer.manufactures.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.06em', marginBottom: 5 }}>MANUFACTURES</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {buyer.manufactures.map(p => (
                          <span key={p} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3,
                            background: 'rgba(232,184,75,0.1)', color: '#e8b84b',
                            border: '1px solid rgba(232,184,75,0.2)' }}>{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {buyer.distributes.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.06em', marginBottom: 5 }}>DISTRIBUTES</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {buyer.distributes.map(p => (
                          <span key={p} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3,
                            background: 'rgba(46,204,113,0.1)', color: '#2ecc71',
                            border: '1px solid rgba(46,204,113,0.2)' }}>{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Supplier match */}
                <div style={{ padding: '10px 14px', background: 'var(--bg-hover)',
                  borderRadius: 4, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.06em', marginBottom: 5 }}>JMR SUPPLIER MATCH</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {getSupplierMatch(buyer)}
                  </div>
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7,
                  padding: '8px 12px', background: 'var(--bg-hover)', borderRadius: 4 }}>
                  {buyer.notes}
                </div>

                {buyer.website && (
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                    🌐 <a href={'https://' + buyer.website} target="_blank" rel="noreferrer"
                      style={{ color: '#4a9eda' }}>{buyer.website}</a>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getSupplierMatch(buyer) {
  const matches = [];
  const needs = buyer.ingredient_needs.map(i => i.toLowerCase());

  if (needs.some(n => n.includes('lecithin')))
    matches.push('AGD / Bunge Argentina / Meridional → Soya Lecithin');
  if (needs.some(n => n.includes('modified starch') || n.includes('waxy corn')))
    matches.push('Horizonte Amidos (Brazil) / Lorenz / Ingredion → Modified Starch');
  if (needs.some(n => n.includes('full cream milk') || n.includes('fcmp')))
    matches.push('Conaprole (Uruguay) / Mastellone → Full Cream Milk Powder');
  if (needs.some(n => n.includes('skimmed milk') || n.includes('smp')))
    matches.push('Conaprole (Uruguay) / Mastellone / SanCor → Skimmed Milk Powder');
  if (needs.some(n => n.includes('sodium caseinate')))
    matches.push('Milkaut / SanCor / Conaprole → Sodium Caseinate');
  if (needs.some(n => n.includes('soya protein concentrate') || n.includes('spc')))
    matches.push('Bunge / AGD / Solbar (Argentina) → Soya Protein Concentrate');
  if (needs.some(n => n.includes('soya protein isolate') || n.includes('spi')))
    matches.push('Solbar / Bunge / Devansoy (Argentina) → Soya Protein Isolate');
  if (needs.some(n => n.includes('maltodextrin')))
    matches.push('Ingredion Argentina/Brazil / AGD → Maltodextrin');
  if (needs.some(n => n.includes('dextrose')))
    matches.push('Ingredion Argentina/Brazil / Cargill Brazil → Dextrose Monohydrate');
  if (needs.some(n => n.includes('tartaric')))
    matches.push('Derivados Vínicos / Argentar (Argentina, Mendoza) → Tartaric Acid');
  if (needs.some(n => n.includes('cream of tartar')))
    matches.push('Derivados Vínicos / Argentar (Argentina) → Cream of Tartar');
  if (needs.some(n => n.includes('vital wheat gluten') || n.includes('wheat gluten')))
    matches.push('Argentine wheat processors / Gluten exporters → Vital Wheat Gluten');
  if (needs.some(n => n.includes('soybean oil') || n.includes('sunflower oil')))
    matches.push('AGD / Molinos / Bunge (Argentina) → Refined Oils');

  return matches.length > 0
    ? matches.join('\n')
    : 'No direct supplier match yet — add suppliers to cover this buyer\'s needs.';
}
