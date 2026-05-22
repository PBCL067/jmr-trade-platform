import React, { useState, useEffect } from 'react';
import { fetchCollection } from './firebase';

const COUNTRIES = ['All', 'Argentina', 'Brazil', 'Uruguay', 'Colombia', 'South Africa'];
const CATEGORIES = ['All', 'Modified Starch', 'Dairy', 'Edible Oils', 'Coffee', 'Grains', 'Food Manufacturing'];
const ROLES = ['All', 'Supplier', 'Buyer'];

const ROLE_COLOR = {
  'Manufacturer': '#3b82f6', 'Manufacturer/Exporter': '#3b82f6',
  'Exporter': '#3b82f6', 'Export Authority / Cooperative': '#3b82f6',
  'Grain Trader/Exporter': '#3b82f6',
  'Buyer/Distributor': '#2ecc71', 'Buyer / Food Manufacturer': '#2ecc71',
  'Buyer / Dairy Manufacturer': '#2ecc71',
  'Domestic Producer': '#4a5a70',
};

function SupplierCard({ s }) {
  const roleColor = ROLE_COLOR[s.role] || '#4a5a70';
  const isSupplier = s.role && (s.role.includes('Manufacturer') || s.role.includes('Exporter') || s.role.includes('Trader') || s.role.includes('Cooperative'));
  const isBuyer = s.role && s.role.includes('Buyer');

  return (
    <div className="card" style={{ borderLeft: '3px solid ' + roleColor }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div className="card-title">{s.name}</div>
          <div className="card-sub">{s.city || s.country} &nbsp;&middot;&nbsp; {s.role}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          {s.verified && (
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#2ecc71',
              background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.2)',
              padding: '2px 7px', borderRadius: 3 }}>VERIFIED</span>
          )}
          {s.priority === 1 && (
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#e8b84b',
              background: 'rgba(232,184,75,0.1)', border: '1px solid rgba(232,184,75,0.2)',
              padding: '2px 7px', borderRadius: 3 }}>PRIORITY</span>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        {s.products && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
            {(Array.isArray(s.products) ? s.products : [s.products]).slice(0, 4).map(p => (
              <span key={p} style={{ fontSize: 11, color: 'var(--text-muted)',
                background: 'var(--bg-hover)', border: '1px solid var(--border)',
                padding: '2px 7px', borderRadius: 3, fontFamily: 'var(--font-mono)' }}>{p}</span>
            ))}
          </div>
        )}

        {s.fobPriceRange && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0',
            borderBottom: '1px solid var(--border)', fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>FOB Price</span>
            <span className="val val--gold">{s.fobPriceRange}</span>
          </div>
        )}
        {s.website && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0',
            borderBottom: '1px solid var(--border)', fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>Website</span>
            <span style={{ color: 'var(--blue)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{s.website}</span>
          </div>
        )}
        {s.contact_approach && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0',
            fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>Contact</span>
            <span style={{ color: 'var(--text-secondary)', textAlign: 'right', maxWidth: '60%' }}>{s.contact_approach}</span>
          </div>
        )}
      </div>

      {s.notes && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>{s.notes}</div>
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
        setSuppliers(data);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = suppliers.filter(function(s) {
    if (country !== 'All' && s.country !== country) return false;
    if (category !== 'All' && !(s.product_category || '').includes(category) &&
        !(Array.isArray(s.products) && s.products.some(p => p.includes(category)))) return false;
    if (role === 'Supplier' && s.role && s.role.includes('Buyer') && !s.role.includes('Manufacturer')) return false;
    if (role === 'Buyer' && s.role && !s.role.includes('Buyer')) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) &&
        !(s.notes || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selectStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4,
    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12,
    padding: '6px 10px', cursor: 'pointer',
  };

  if (loading) return <div className="loading">Loading suppliers</div>;

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search suppliers..."
          style={{ ...selectStyle, flex: 1, minWidth: 180 }} />
        <select value={country} onChange={e => setCountry(e.target.value)} style={selectStyle}>
          {COUNTRIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={role} onChange={e => setRole(e.target.value)} style={selectStyle}>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
          {filtered.length} found
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {filtered.map(s => <SupplierCard key={s.id} s={s} />)}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          No suppliers match your filters
        </div>
      )}
    </div>
  );
}
