import React, { useState } from 'react';
import Opportunities from './Opportunities';
import ModifiedStarch from './ModifiedStarch';
import MilkPowder from './MilkPowder';
import Signals from './Signals';
import Suppliers from './Suppliers';
import LandedCost from './LandedCost';
import Learn from './Learn';
import './App.css';

const NAV = [
  { id: 'opportunities', label: 'Opportunities',  icon: '\u25c9' },
  { id: 'starch',        label: 'Mod. Starch',    icon: '\u25a0' },
  { id: 'milk',          label: 'Milk Powder',    icon: '\u25a1' },
  { id: 'landed',        label: 'Landed Cost',    icon: '\u25c6' },
  { id: 'signals',       label: 'Signals',        icon: '\u25c8' },
  { id: 'suppliers',     label: 'Suppliers',      icon: '\u25ce' },
  { id: 'learn',         label: 'Learn',          icon: '\u25d4' },
];

export default function App() {
  const [active, setActive] = useState('opportunities');

  const renderPage = () => {
    switch (active) {
      case 'opportunities': return <Opportunities />;
      case 'starch':        return <ModifiedStarch />;
      case 'milk':          return <MilkPowder />;
      case 'landed':        return <LandedCost />;
      case 'signals':       return <Signals />;
      case 'suppliers':     return <Suppliers />;
      case 'learn':         return <Learn />;
      default:              return <Opportunities />;
    }
  };

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-mark">JMR</span>
          <span className="logo-sub">Trade Intelligence</span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(item => (
            <button key={item.id}
              className={'nav-item' + (active === item.id ? ' nav-item--active' : '')}
              onClick={() => setActive(item.id)}>
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
          <div className="top-bar-title">{NAV.find(i => i.id === active)?.label}</div>
          <div className="top-bar-meta">
            <span className="meta-tag">BUY Coffee +1.85</span>
            <span className="meta-tag">BUY Wheat +0.61</span>
            <span className="meta-date">{today}</span>
          </div>
        </header>
        <div className="page-body">{renderPage()}</div>
      </main>
    </div>
  );
}
