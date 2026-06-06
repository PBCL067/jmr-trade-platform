import React, { useState, useEffect } from 'react';
import { fetchCollection } from './firebase';
import Opportunities from './Opportunities';
import ProductIntel from './ProductIntel';
import Signals from './Signals';
import Suppliers from './Suppliers';
import Contacts from './Contacts';
import SupplierMap from './SupplierMap';
import MarketIntel from './MarketIntel';
import LandedCost from './LandedCost';
import Learn from './Learn';
import Research from './Research';
import Buyers from './Buyers';
import './App.css';

const NAV = [
  { id: 'opportunities', label: 'Opportunities', icon: '\u25c9' },
  { id: 'intel',         label: 'Product Intel', icon: '\u25a0' },
  { id: 'market',       label: 'Market Intel',  icon: '\u25cb' },
  { id: 'landed',        label: 'Landed Cost',   icon: '\u25c6' },
  { id: 'signals',       label: 'Signals',       icon: '\u25c8' },
  { id: 'suppliers',     label: 'Suppliers',     icon: '\u25ce' },
  { id: 'map',          label: 'Supplier Map',  icon: '\u25b3' },
  { id: 'learn',         label: 'Learn',         icon: '\u25d4' },
  { id: 'contacts',      label: 'Contacts',      icon: '\u25a1' },
  { id: 'buyers',        label: 'Buyers',        icon: '\u25d6' },
  { id: 'research',     label: 'Research',      icon: '\u25c8' },
];

export default function App() {
  const [active,     setActive]     = useState('opportunities');
  const [topSignals, setTopSignals] = useState([]);
  const [menuOpen,   setMenuOpen]   = useState(false);

  useEffect(function() {
    (async function() {
      try {
        const docs = await fetchCollection('signals');
        const sorted = docs
          .filter(function(d) { return d.signal === 'BUY' || d.signal === 'SELL'; })
          .sort(function(a, b) { return Math.abs(b.combined_score) - Math.abs(a.combined_score); })
          .slice(0, 2);
        setTopSignals(sorted);
      } catch(e) { console.error(e); }
    })();
  }, []);

  function navigate(id) {
    setActive(id);
    setMenuOpen(false);
  }

  const renderPage = () => {
    switch (active) {
      case 'opportunities': return <Opportunities />;
      case 'intel':         return <ProductIntel />;
      case 'landed':        return <LandedCost />;
      case 'signals':       return <Signals />;
      case 'suppliers':     return <Suppliers />;
      case 'map':           return <SupplierMap />;
      case 'market':        return <MarketIntel />;
      case 'learn':         return <Learn />;
      case 'contacts':      return <Contacts />;
      case 'research':     return <Research />;
      case 'buyers':        return <Buyers />;
      default:              return <Opportunities />;
    }
  };

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="app">
      {/* Overlay for mobile menu */}
      {menuOpen && (
        <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={'sidebar' + (menuOpen ? ' sidebar--open' : '')}>
        <div className="sidebar-logo">
          <span className="logo-mark">JMR</span>
          <span className="logo-sub">Trade Intelligence</span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(item => (
            <button key={item.id}
              className={'nav-item' + (active === item.id ? ' nav-item--active' : '')}
              onClick={() => navigate(item.id)}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="status-dot" />
          <span className="status-text">Live Data</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu">
              <span /><span /><span />
            </button>
            <div className="top-bar-title">{NAV.find(i => i.id === active)?.label}</div>
          </div>
          <div className="top-bar-meta">
            {topSignals.map(function(s) {
              const score = s.combined_score >= 0 ? '+' + s.combined_score.toFixed(2) : s.combined_score.toFixed(2);
              const label = s.commodity.replace(/_/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
              return (
                <span key={s.commodity} className="meta-tag"
                  style={{ color: s.signal === 'BUY' ? '#2ecc71' : '#e74c3c',
                           borderColor: s.signal === 'BUY' ? '#2ecc71' : '#e74c3c' }}>
                  {s.signal} {label} {score}
                </span>
              );
            })}
            <span className="meta-date meta-date--desktop">{today}</span>
          </div>
        </header>
        <div className="page-body">{renderPage()}</div>
      </main>
    </div>
  );
}
