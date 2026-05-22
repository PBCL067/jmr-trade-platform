import React, { useState, useEffect } from 'react';
import { fetchCollection } from './firebase';

const COUNTRIES  = ['All', 'Argentina', 'Brazil', 'Uruguay', 'Colombia', 'South Africa'];
const CATEGORIES = ['All', 'Modified Starch', 'Dairy', 'Edible Oils', 'Coffee', 'Grains'];
const ROLES      = ['All', 'Supplier', 'Buyer', 'Competitive Intel'];

const ROLE_COLOR = {
  'Manufacturer/Exporter':          '#3b82f6',
  'Manufacturer':                   '#3b82f6',
  'Exporter':                       '#3b82f6',
  'Export Authority / Cooperative': '#3b82f6',
  'Grain Trader/Exporter':          '#3b82f6',
  'Buyer/Distributor':              '#2ecc71',
  'Buyer / Food Manufacturer':      '#2ecc71',
  'Buyer / Dairy Manufacturer':     '#2ecc71',
  'Domestic Producer':              '#4a5a70',
};

const ROLE_TYPE = {
  'Manufacturer/Exporter':          'Supplier',
  'Manufacturer':                   'Supplier',
  'Exporter':                       'Supplier',
  'Export Authority / Cooperative': 'Supplier',
  'Grain Trader/Exporter':          'Supplier',
  'Buyer/Distributor':              'Buyer',
  'Buyer / Food Manufacturer':      'Buyer',
  'Buyer / Dairy Manufacturer':     'Buyer',
  'Domestic Producer':              'Competitive Intel',
};

function SupplierCard({ s }) {
  const role     = s.role || 'Supplier';
  const color    = ROLE_COLOR[role] || '#4a5a70';
  const roleType = ROLE_TYPE[role] || 'Supplier';
  const products = Array.isArray(s.products) ? s.products : [];

  return (
    <div className="card" style={{ borderLeft: '3px solid ' + color }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1, paddingRight: 8 }}>
          <div className="card-title">{s.name}</div>
          <div className="card-sub">{s.city || s.country} &nbsp;&middot;&nbsp; {role}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          {s.verified && (
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#2ecc71',
              background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.2)',
              padding: '2px 7px', borderRadius: 3 }}>VERIFIED</span>
          )}
          {s.priority === 1 && (
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#e8b84b',
              background: 'rgba(232,184,75,0.1)', border: '1px solid rgba(232,184,75,0.2)',
              padding: '2px 7px', borderRadius: 3 }}>PRIORITY 1</span>
          )}
          {roleType === 'Competitive Intel' && (
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#4a5a70',
              background: 'rgba(74,90,112,0.1)', border: '1px solid rgba(74,90,112,0.2)',
              padding: '2px 7px', borderRadius: 3 }}>INTEL</span>
          )}
        </div>
      </div>

      {products.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
          {products.slice(0, 4).map(p => (
            <span key={p} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-hover)',
              border: '1px solid var(--border)', padding: '2px 7px', borderRadius: 3,
              fontFamily: 'var(--font-mono)' }}>{p}</span>
          ))}
          {products.length > 4 && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', padding: '2px 4px' }}>+{products.length - 4} more</span>
          )}
        </div>
      )}

      <div>
        {s.fobPriceRange && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>FOB Price</span>
            <span className="val val--gold">{s.fobPriceRange}</span>
          </div>
        )}
        {s.website && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>Website</span>
            <span style={{ color: 'var(--blue)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{s.website}</span>
          </div>
        )}
        {s.contact_approach && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>Contact</span>
            <span style={{ color: 'var(--text-secondary)', textAlign: 'right', maxWidth: '65%' }}>{s.contact_approach}</span>
          </div>
        )}
      </div>

      {s.notes && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>{s.notes}</div>
      )}
    </div>
  );
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [country, setCountry]     = useState('All');
  const [category, setCategory]   = useState('All');
  const [role, setRole]           = useState('All');
  const [search, setSearch]       = useState('');

  useEffect(function() {
    (async function() {
      try {
        const data = await fetchCollection('suppliers');
        // Sort: priority 1 first, then verified, then alphabetical
        data.sort(function(a, b) {
          if ((a.priority || 99) !== (b.priority || 99)) return (a.priority || 99) - (b.priority || 99);
          if (a.verified !== b.verified) return a.verified ? -1 : 1;
          return (a.name || '').localeCompare(b.name || '');
        });
        setSuppliers(data);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = suppliers.filter(function(s) {
    if (country !== 'All' && s.country !== country) return false;
    if (category !== 'All') {
      const cat = (s.product_category || '').toLowerCase();
      const prods = (Array.isArray(s.products) ? s.products.join(' ') : '').toLowerCase();
      if (!cat.includes(category.toLowerCase()) && !prods.includes(category.toLowerCase())) return false;
    }
    if (role !== 'All') {
      const rt = ROLE_TYPE[s.role] || 'Supplier';
      if (rt !== role) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const searchable = ((s.name || '') + ' ' + (s.country || '') + ' ' + (Array.isArray(s.products) ? s.products.join(' ') : '') + ' ' + (s.notes || '')).toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  const selectStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4,
    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: '6px 10px', cursor: 'pointer',
  };

  if (loading) return <div className="loading">Loading suppliers</div>;

  // Group by role type
  const supplierCards = filtered.filter(s => (ROLE_TYPE[s.role] || 'Supplier') === 'Supplier');
  const buyerCards    = filtered.filter(s => (ROLE_TYPE[s.role] || '') === 'Buyer');
  const intelCards    = filtered.filter(s => (ROLE_TYPE[s.role] || '') === 'Competitive Intel');

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          style={{ ...selectStyle, flex: 1, minWidth: 160 }} />
        <select value={country}  onChange={e => setCountry(e.target.value)}  style={selectStyle}>
          {COUNTRIES.map(c  => <option key={c}>{c}</option>)}
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={role}     onChange={e => setRole(e.target.value)}     style={selectStyle}>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
          {filtered.length} of {suppliers.length}
        </span>
      </div>

      {supplierCards.length > 0 && (
        <div className="page-section">
          <div className="section-label" style={{ marginBottom: 12 }}>
            Suppliers ({supplierCards.length})
          </div>
          <div className="card-grid card-grid--2">
            {supplierCards.map(s => <SupplierCard key={s.id} s={s} />)}
          </div>
        </div>
      )}

      {buyerCards.length > 0 && (
        <div className="page-section">
          <div className="section-label" style={{ marginBottom: 12 }}>
            Buyers ({buyerCards.length})
          </div>
          <div className="card-grid card-grid--2">
            {buyerCards.map(s => <SupplierCard key={s.id} s={s} />)}
          </div>
        </div>
      )}

      {intelCards.length > 0 && (
        <div className="page-section">
          <div className="section-label" style={{ marginBottom: 12 }}>
            Competitive Intel ({intelCards.length})
          </div>
          <div className="card-grid card-grid--2">
            {intelCards.map(s => <SupplierCard key={s.id} s={s} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          No suppliers match your filters
        </div>
      )}
    </div>
  );
}
