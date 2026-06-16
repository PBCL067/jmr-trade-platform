import React, { useRef } from 'react';

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 50" height="36">
  <text x="0" y="38" font-family="Syne, sans-serif" font-weight="800" font-size="34" fill="#ffffff">JMR</text>
  <path d="M0 16 Q42 5 84 16" fill="none" stroke="#c8993a" stroke-width="3" stroke-linecap="round"/>
  <circle cx="0" cy="16" r="3.5" fill="#c8993a"/>
  <circle cx="84" cy="16" r="3.5" fill="#0d1f3c"/>
  <text x="100" y="38" font-family="Syne, sans-serif" font-weight="500" font-size="34" fill="#ffffff" letter-spacing="1">GLOBAL</text>
</svg>`;

// Approximate coordinates for Africa map (normalized 0-1 within Africa bounding box)
// Africa bbox: lon -18 to 52, lat -35 to 38
const AFRICA_COUNTRIES_POS = {
  'Algeria':      [0.42, 0.12], 'Egypt':         [0.72, 0.18], 'Morocco':      [0.18, 0.12],
  'Libya':        [0.55, 0.18], 'Tunisia':        [0.45, 0.10], 'South Africa': [0.55, 0.88],
  'Nigeria':      [0.42, 0.48], 'Kenya':          [0.72, 0.55], 'Ghana':        [0.33, 0.50],
  'Senegal':      [0.12, 0.40], 'Ivory Coast':    [0.28, 0.52], 'Cameroon':     [0.48, 0.53],
  'Tanzania':     [0.68, 0.63], 'Ethiopia':       [0.72, 0.43], 'Angola':       [0.48, 0.70],
  'Mozambique':   [0.65, 0.72], 'Zambia':         [0.58, 0.68], 'Zimbabwe':     [0.60, 0.75],
  'Uganda':       [0.65, 0.50], 'Dem. Rep. of the Congo': [0.52, 0.60],
  'Congo':        [0.48, 0.58], 'Gabon':          [0.44, 0.57], 'Mali':         [0.30, 0.32],
  'Niger':        [0.42, 0.32], 'Burkina Faso':   [0.32, 0.40], 'Togo':         [0.36, 0.48],
  'Benin':        [0.38, 0.46], 'Mauritius':      [0.85, 0.72], 'Cabo Verde':   [0.05, 0.30],
  'Somalia':      [0.80, 0.48], 'Sudan':          [0.65, 0.30], 'Djibouti':     [0.78, 0.42],
  'Guinea':       [0.15, 0.45], 'Mauritania':     [0.18, 0.25],
};

const ARGENTINA_POS = [-0.35, 0.60]; // normalized position left of Africa map

function fmt(n) {
  if (!n) return '$0';
  if (n >= 1e9) return '$' + (n/1e9).toFixed(2) + 'B';
  if (n >= 1e6) return '$' + (n/1e6).toFixed(1) + 'M';
  if (n >= 1e3) return '$' + (n/1e3).toFixed(0) + 'K';
  return '$' + n.toFixed(0);
}

function AfricaMapSVG({ flows, exporter }) {
  const W = 500, H = 380;
  const pad = { l: 120, r: 20, t: 20, b: 20 };
  const mapW = W - pad.l - pad.r;
  const mapH = H - pad.t - pad.b;

  // Argentina position (left side)
  const argX = 40, argY = H * 0.55;

  // Get unique destinations
  const destinations = [...new Set(flows.map(f => f.importer))];
  const maxFob = Math.max(...flows.map(f => f.fob_usd || 0));

  function countryPos(name) {
    const pos = AFRICA_COUNTRIES_POS[name];
    if (!pos) return null;
    return [pad.l + pos[0] * mapW, pad.t + pos[1] * mapH];
  }

  return (
    <svg width={W} height={H} style={{fontFamily:'sans-serif'}}>
      {/* Dark background */}
      <rect width={W} height={H} fill="#0d1f3c" rx="8"/>

      {/* Africa outline - simplified polygon */}
      <polygon points={`
        ${pad.l + 0.18*mapW},${pad.t + 0.05*mapH}
        ${pad.l + 0.55*mapW},${pad.t + 0.02*mapH}
        ${pad.l + 0.85*mapW},${pad.t + 0.15*mapH}
        ${pad.l + 1.00*mapW},${pad.t + 0.35*mapH}
        ${pad.l + 0.95*mapW},${pad.t + 0.55*mapH}
        ${pad.l + 0.80*mapW},${pad.t + 0.70*mapH}
        ${pad.l + 0.75*mapW},${pad.t + 0.95*mapH}
        ${pad.l + 0.55*mapW},${pad.t + 1.00*mapH}
        ${pad.l + 0.35*mapW},${pad.t + 0.90*mapH}
        ${pad.l + 0.20*mapW},${pad.t + 0.70*mapH}
        ${pad.l + 0.05*mapW},${pad.t + 0.50*mapH}
        ${pad.l + 0.00*mapW},${pad.t + 0.30*mapH}
        ${pad.l + 0.10*mapW},${pad.t + 0.10*mapH}
      `} fill="#1a3460" stroke="#2a4a7f" strokeWidth="1"/>

      {/* Argentina label */}
      <circle cx={argX} cy={argY} r="12" fill="#c8993a" opacity="0.9"/>
      <text x={argX} y={argY-16} fill="#c8993a" fontSize="10" textAnchor="middle" fontWeight="bold">
        {exporter || 'ARGENTINA'}
      </text>

      {/* Flow lines */}
      {destinations.map(dest => {
        const pos = countryPos(dest);
        if (!pos) return null;
        const destFlows = flows.filter(f => f.importer === dest);
        const totalFob = destFlows.reduce((s, f) => s + (f.fob_usd || 0), 0);
        const strokeW = Math.max(0.5, Math.min(4, (totalFob / maxFob) * 4));
        const opacity = Math.max(0.3, Math.min(0.9, totalFob / maxFob));
        const hasL2 = destFlows.some(f => f.layer === 'L2');
        return (
          <g key={dest}>
            <path
              d={`M ${argX} ${argY} Q ${(argX + pos[0])/2} ${Math.min(argY, pos[1]) - 60} ${pos[0]} ${pos[1]}`}
              fill="none"
              stroke={hasL2 ? '#4a9eda' : '#c8993a'}
              strokeWidth={strokeW}
              opacity={opacity}
            />
            <circle cx={pos[0]} cy={pos[1]} r={Math.max(3, strokeW * 1.5)}
              fill={hasL2 ? '#4a9eda' : '#2ecc71'} opacity="0.9"/>
          </g>
        );
      })}

      {/* Legend */}
      <circle cx={pad.l + 5} cy={H - 30} r="5" fill="#2ecc71"/>
      <text x={pad.l + 14} y={H - 26} fill="#ccc" fontSize="9">L1 – Primary Ingredients</text>
      <circle cx={pad.l + 5} cy={H - 15} r="5" fill="#4a9eda"/>
      <text x={pad.l + 14} y={H - 11} fill="#ccc" fontSize="9">L2 – Value Added Ingredients</text>
    </svg>
  );
}

export function generateTradeFlowReport({ flows, exporter, importer, layer, zarUsd }) {
  const totalFob   = flows.reduce((s, f) => s + (f.fob_usd || 0), 0);
  const totalVol   = flows.reduce((s, f) => s + (f.volume_mt || 0), 0);
  const avgPrice   = totalVol > 0 ? totalFob / (totalVol * 1000) : 0;
  const processors = flows.filter(f => f.importer_is_processor).length;

  // Top 5 markets
  const marketMap = {};
  flows.forEach(f => {
    if (!marketMap[f.importer]) marketMap[f.importer] = 0;
    marketMap[f.importer] += f.fob_usd || 0;
  });
  const topMarkets = Object.entries(marketMap)
    .sort((a,b) => b[1]-a[1]).slice(0,5);

  // Top products
  const productMap = {};
  flows.forEach(f => {
    const k = f.product || f.hs_code;
    if (!productMap[k]) productMap[k] = 0;
    productMap[k] += f.fob_usd || 0;
  });
  const topProducts = Object.entries(productMap)
    .sort((a,b) => b[1]-a[1]).slice(0,5);

  const title = `TRADE FLOW: ${(exporter||'ALL').toUpperCase()} → ${(importer||'ALL AFRICA').toUpperCase()}`;
  const subtitle = layer === 'ALL' ? 'L1 + L2 FLOWS OVERVIEW' :
                   layer === 'L1'  ? 'L1 PRIMARY FLOWS ONLY' : 'L2 VALUE-ADDED FLOWS ONLY';

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>JMR Trade Flow Report</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#0d1f3c; font-family:'IBM Plex Mono', monospace; color:#fff; width:1200px; }
  .page { width:1200px; min-height:1600px; background:#0d1f3c; padding:40px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; padding-bottom:24px; border-bottom:1px solid rgba(200,153,58,0.3); }
  .logo-area { display:flex; flex-direction:column; gap:4px; }
  .logo-text { font-family:'Syne',sans-serif; font-weight:800; font-size:28px; color:#fff; letter-spacing:0.05em; }
  .logo-sub { font-size:10px; letter-spacing:0.2em; color:#c8993a; }
  .title-area { text-align:center; flex:1; padding:0 40px; }
  .title { font-family:'Syne',sans-serif; font-weight:800; font-size:32px; color:#fff; letter-spacing:0.05em; margin-bottom:6px; }
  .subtitle { font-size:14px; color:#c8993a; letter-spacing:0.15em; }
  .flow-count { background:#c8993a; border-radius:8px; padding:16px 20px; text-align:center; min-width:100px; }
  .flow-count .num { font-family:'Syne',sans-serif; font-weight:800; font-size:36px; color:#0d1f3c; }
  .flow-count .lbl { font-size:9px; letter-spacing:0.1em; color:#0d1f3c; margin-top:2px; }
  .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
  .stat-box { background:rgba(255,255,255,0.05); border:1px solid rgba(200,153,58,0.2); border-radius:8px; padding:20px; }
  .stat-icon { font-size:24px; margin-bottom:8px; }
  .stat-label { font-size:9px; letter-spacing:0.12em; color:#8a9ab5; margin-bottom:6px; }
  .stat-value { font-family:'Syne',sans-serif; font-weight:800; font-size:28px; color:#c8993a; }
  .stat-unit { font-size:11px; color:#8a9ab5; margin-top:2px; }
  .main-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:28px; }
  .map-section { background:rgba(255,255,255,0.03); border-radius:8px; overflow:hidden; }
  .right-panel { display:flex; flex-direction:column; gap:16px; }
  .panel { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:20px; }
  .panel-title { font-size:10px; letter-spacing:0.15em; color:#c8993a; margin-bottom:14px; border-bottom:1px solid rgba(200,153,58,0.2); padding-bottom:8px; }
  .market-row { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
  .market-num { font-size:11px; color:#8a9ab5; width:16px; }
  .market-name { flex:1; font-size:13px; color:#fff; }
  .market-bar-wrap { width:120px; background:rgba(255,255,255,0.08); border-radius:2px; height:6px; }
  .market-bar { background:#c8993a; height:6px; border-radius:2px; }
  .market-value { font-size:12px; color:#c8993a; width:60px; text-align:right; font-weight:600; }
  .market-pct { font-size:10px; color:#8a9ab5; width:36px; text-align:right; }
  .product-row { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
  .product-name { flex:1; font-size:12px; color:#fff; }
  .product-value { font-size:12px; color:#4a9eda; font-weight:600; }
  .product-pct { font-size:10px; color:#8a9ab5; width:36px; text-align:right; }
  .detail-table { width:100%; border-collapse:collapse; margin-bottom:28px; font-size:11px; }
  .detail-table th { background:rgba(200,153,58,0.15); color:#c8993a; padding:8px 10px; text-align:left; letter-spacing:0.08em; font-size:9px; border-bottom:1px solid rgba(200,153,58,0.3); }
  .detail-table td { padding:7px 10px; border-bottom:1px solid rgba(255,255,255,0.05); color:#ccc; }
  .detail-table tr:nth-child(even) td { background:rgba(255,255,255,0.02); }
  .l1-badge { background:rgba(46,204,113,0.15); color:#2ecc71; border:1px solid rgba(46,204,113,0.3); padding:2px 7px; border-radius:3px; font-size:9px; }
  .l2-badge { background:rgba(74,158,218,0.15); color:#4a9eda; border:1px solid rgba(74,158,218,0.3); padding:2px 7px; border-radius:3px; font-size:9px; }
  .takeaways { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
  .takeaway { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:16px; }
  .takeaway-icon { font-size:28px; margin-bottom:10px; }
  .takeaway-title { font-family:'Syne',sans-serif; font-weight:700; font-size:13px; color:#fff; margin-bottom:6px; }
  .takeaway-text { font-size:11px; color:#8a9ab5; line-height:1.6; }
  .footer { display:flex; justify-content:space-between; align-items:center; padding-top:20px; border-top:1px solid rgba(255,255,255,0.1); margin-top:auto; }
  .footer-left { font-size:10px; color:#8a9ab5; }
  .footer-right { font-size:10px; color:#c8993a; letter-spacing:0.08em; }
  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style>
</head>
<body>
<div class="page">
  <!-- HEADER -->
  <div class="header">
    <div class="logo-area">
      <div class="logo-text">JMR <span style="color:#c8993a">⬡</span></div>
      <div class="logo-sub">GLOBAL INGREDIENTS</div>
    </div>
    <div class="title-area">
      <div class="title">${title}</div>
      <div class="subtitle">${subtitle}</div>
    </div>
    <div class="flow-count">
      <div class="num">${flows.length}</div>
      <div class="lbl">TOTAL FLOWS<br>${layer === 'ALL' ? 'L1 + L2' : layer}</div>
    </div>
  </div>

  <!-- STATS ROW -->
  <div class="stats-row">
    <div class="stat-box">
      <div class="stat-icon">💰</div>
      <div class="stat-label">TOTAL FOB VALUE</div>
      <div class="stat-value">${fmt(totalFob)}</div>
      <div class="stat-unit">USD</div>
    </div>
    <div class="stat-box">
      <div class="stat-icon">⚓</div>
      <div class="stat-label">TOTAL VOLUME</div>
      <div class="stat-value">${(totalVol/1e6).toFixed(2)}M</div>
      <div class="stat-unit">MT</div>
    </div>
    <div class="stat-box">
      <div class="stat-icon">📊</div>
      <div class="stat-label">WEIGHTED AVG PRICE</div>
      <div class="stat-value">$${avgPrice.toFixed(2)}</div>
      <div class="stat-unit">/KG</div>
    </div>
    <div class="stat-box">
      <div class="stat-icon">🏭</div>
      <div class="stat-label">FLOWS TO PROCESSORS</div>
      <div class="stat-value">${processors}</div>
      <div class="stat-unit">YES ⚡</div>
    </div>
  </div>

  <!-- MAIN GRID: MAP + RANKINGS -->
  <div class="main-grid">
    <div class="map-section">
      <div style="padding:16px;background:rgba(200,153,58,0.05);border-bottom:1px solid rgba(200,153,58,0.1)">
        <div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:4px">STRONG TRADE CONNECTIONS</div>
        <div style="font-size:11px;color:#8a9ab5;line-height:1.5">Key agricultural & ingredient flows from ${exporter||'Mercosur'} to markets across Africa.</div>
      </div>
      <div id="map-container" style="background:#0d1a2e;padding:16px;min-height:300px;display:flex;align-items:center;justify-content:center">
        <canvas id="map-canvas" width="460" height="300"></canvas>
      </div>
    </div>
    <div class="right-panel">
      <div class="panel">
        <div class="panel-title">TOP 5 MARKETS BY FOB VALUE</div>
        ${topMarkets.map(([name, val], i) => `
          <div class="market-row">
            <div class="market-num">${i+1}</div>
            <div class="market-name">${name}</div>
            <div class="market-bar-wrap"><div class="market-bar" style="width:${(val/topMarkets[0][1]*100).toFixed(0)}%"></div></div>
            <div class="market-value">${fmt(val)}</div>
            <div class="market-pct">${(val/totalFob*100).toFixed(1)}%</div>
          </div>`).join('')}
      </div>
      <div class="panel">
        <div class="panel-title">TOP PRODUCTS BY FOB VALUE</div>
        ${topProducts.map(([name, val]) => `
          <div class="product-row">
            <div class="product-name">${name}</div>
            <div class="product-value">${fmt(val)}</div>
            <div class="product-pct">${(val/totalFob*100).toFixed(1)}%</div>
          </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- DETAIL TABLE -->
  <div style="font-size:10px;letter-spacing:0.15em;color:#c8993a;margin-bottom:12px;">TRADE FLOWS DETAIL (${layer === 'ALL' ? 'L1 + L2' : layer})</div>
  <table class="detail-table">
    <thead>
      <tr>
        <th>#</th><th>PRODUCT</th><th>TO</th><th>LAYER</th>
        <th>FOB VALUE (USD)</th><th>VOLUME (MT)</th><th>$/KG</th><th>PROCESSOR?</th>
      </tr>
    </thead>
    <tbody>
      ${flows.sort((a,b) => (b.fob_usd||0)-(a.fob_usd||0)).map((f, i) => `
        <tr>
          <td style="color:#8a9ab5">${i+1}</td>
          <td style="color:#fff;font-weight:600">${f.product || f.hs_code}</td>
          <td style="color:#8a9ab5">${f.importer}</td>
          <td><span class="${f.layer === 'L2' ? 'l2-badge' : 'l1-badge'}">${f.layer||'L1'}</span></td>
          <td style="color:#c8993a">${fmt(f.fob_usd)}</td>
          <td style="color:#ccc">${f.volume_mt ? f.volume_mt.toLocaleString(undefined,{maximumFractionDigits:0}) : '-'}</td>
          <td style="color:#ccc">${f.price_per_kg ? '$'+f.price_per_kg.toFixed(2) : '-'}</td>
          <td style="color:${f.importer_is_processor ? '#e8b84b' : '#4a5a70'}">${f.importer_is_processor ? 'YES ⚡' : '–'}</td>
        </tr>`).join('')}
    </tbody>
  </table>

  <!-- TAKEAWAYS -->
  <div class="takeaways">
    <div class="takeaway">
      <div class="takeaway-icon">🌍</div>
      <div class="takeaway-title">North Africa leads</div>
      <div class="takeaway-text">${topMarkets.slice(0,3).map(m=>m[0]).join(', ')} account for ${(topMarkets.slice(0,3).reduce((s,m)=>s+m[1],0)/totalFob*100).toFixed(1)}% of total FOB value.</div>
    </div>
    <div class="takeaway">
      <div class="takeaway-icon">🌾</div>
      <div class="takeaway-title">${topProducts[0]?.[0] || 'Top product'} dominates</div>
      <div class="takeaway-text">${topProducts[0]?.[0]} represents ${topProducts[0] ? (topProducts[0][1]/totalFob*100).toFixed(1) : 0}% of total trade value.</div>
    </div>
    <div class="takeaway">
      <div class="takeaway-icon">🏭</div>
      <div class="takeaway-title">Value added opportunities</div>
      <div class="takeaway-text">${flows.filter(f=>f.layer==='L2').length} L2 flows identified across ${[...new Set(flows.filter(f=>f.layer==='L2').map(f=>f.importer))].length} markets.</div>
    </div>
    <div class="takeaway">
      <div class="takeaway-icon">🤝</div>
      <div class="takeaway-title">Diverse market reach</div>
      <div class="takeaway-text">${flows.length} unique trade flows across ${[...new Set(flows.map(f=>f.importer))].length} African countries.</div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-left">Source: JMR Trade Intelligence Platform &nbsp;|&nbsp; Data Period: Latest Available</div>
    <div class="footer-right">www.jmrglobalgroup.com</div>
  </div>
</div>

<script>
// Draw map on canvas
(function() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 460, H = 300;
  const pad = { l: 100, r: 10, t: 10, b: 10 };
  const mapW = W - pad.l - pad.r;
  const mapH = H - pad.t - pad.b;

  // Background
  ctx.fillStyle = '#0d1a2e';
  ctx.fillRect(0, 0, W, H);

  // Africa shape
  ctx.beginPath();
  const pts = [
    [0.18,0.05],[0.55,0.02],[0.85,0.15],[1.00,0.35],[0.95,0.55],
    [0.80,0.70],[0.75,0.95],[0.55,1.00],[0.35,0.90],[0.20,0.70],
    [0.05,0.50],[0.00,0.30],[0.10,0.10]
  ];
  pts.forEach(([x,y], i) => {
    const px = pad.l + x*mapW, py = pad.t + y*mapH;
    i === 0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
  });
  ctx.closePath();
  ctx.fillStyle = '#1a3460';
  ctx.fill();
  ctx.strokeStyle = '#2a4a7f';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Argentina dot
  const argX = 40, argY = H * 0.55;
  ctx.beginPath();
  ctx.arc(argX, argY, 10, 0, Math.PI*2);
  ctx.fillStyle = '#c8993a';
  ctx.fill();
  ctx.fillStyle = '#c8993a';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('${(exporter||'ARG').toUpperCase().slice(0,3)}', argX, argY - 14);

  const POSITIONS = ${JSON.stringify(AFRICA_COUNTRIES_POS)};
  const flows = ${JSON.stringify(flows.map(f => ({importer: f.importer, fob_usd: f.fob_usd, layer: f.layer})))};
  const maxFob = Math.max(...flows.map(f => f.fob_usd || 0));

  const destinations = [...new Set(flows.map(f => f.importer))];
  destinations.forEach(dest => {
    const pos = POSITIONS[dest];
    if (!pos) return;
    const destFlows = flows.filter(f => f.importer === dest);
    const totalFob = destFlows.reduce((s,f) => s + (f.fob_usd||0), 0);
    const px = pad.l + pos[0]*mapW;
    const py = pad.t + pos[1]*mapH;
    const strokeW = Math.max(0.5, Math.min(3.5, (totalFob/maxFob)*3.5));
    const hasL2 = destFlows.some(f => f.layer === 'L2');

    // Flow line
    ctx.beginPath();
    ctx.moveTo(argX, argY);
    const cpx = (argX + px)/2;
    const cpy = Math.min(argY, py) - 50;
    ctx.quadraticCurveTo(cpx, cpy, px, py);
    ctx.strokeStyle = hasL2 ? 'rgba(74,158,218,0.7)' : 'rgba(200,153,58,0.7)';
    ctx.lineWidth = strokeW;
    ctx.stroke();

    // Destination dot
    ctx.beginPath();
    ctx.arc(px, py, Math.max(3, strokeW*1.5), 0, Math.PI*2);
    ctx.fillStyle = hasL2 ? '#4a9eda' : '#2ecc71';
    ctx.fill();
  });
})();
</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=1250,height=900');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 1500);
}

// ── GAP ANALYSIS REPORT ──────────────────────────────────────────────────────
export function generateGapReport({ gaps, filterExporter, filterLabel }) {
  const fmt = (n) => n >= 1e9 ? '$'+(n/1e9).toFixed(1)+'B' : n >= 1e6 ? '$'+(n/1e6).toFixed(1)+'M' : n >= 1e3 ? '$'+(n/1e3).toFixed(0)+'K' : '$'+n.toFixed(0);
  const untapped = gaps.filter(g => g.label === 'UNTAPPED' || g.label === 'NEAR UNTAPPED');
  const totalL1 = gaps.reduce((s,g) => s + (g.l1_usd||0), 0);
  const LABEL_COLOR = { 'UNTAPPED':'#e74c3c','NEAR UNTAPPED':'#e74c3c','UNDER-PROCESSED':'#e8b84b','PROCESSING':'#2ecc71' };

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>JMR Gap Analysis Report</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0d1f3c;font-family:'IBM Plex Mono',monospace;color:#fff;width:1200px}
  .page{width:1200px;min-height:1400px;background:#0d1f3c;padding:40px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid rgba(200,153,58,0.3)}
  .logo-text{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#fff}
  .logo-sub{font-size:10px;letter-spacing:0.2em;color:#c8993a;margin-top:4px}
  .title{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#fff;text-align:center}
  .subtitle{font-size:13px;color:#c8993a;letter-spacing:0.15em;text-align:center;margin-top:6px}
  .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px}
  .stat{background:rgba(255,255,255,0.05);border:1px solid rgba(200,153,58,0.2);border-radius:8px;padding:20px}
  .stat-label{font-size:9px;letter-spacing:0.12em;color:#8a9ab5;margin-bottom:8px}
  .stat-value{font-family:'Syne',sans-serif;font-weight:800;font-size:32px;color:#c8993a}
  .gap-card{background:rgba(255,255,255,0.04);border-radius:8px;padding:16px;margin-bottom:12px;border-left:4px solid #e74c3c}
  .gap-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
  .gap-title{font-family:'Syne',sans-serif;font-weight:700;font-size:15px}
  .gap-badge{font-size:9px;letter-spacing:0.08em;padding:3px 10px;border-radius:3px;font-weight:700}
  .gap-desc{font-size:11px;color:#8a9ab5;line-height:1.6;margin-bottom:10px}
  .gap-stats{display:flex;gap:12px}
  .gap-stat{background:rgba(255,255,255,0.05);border-radius:4px;padding:8px 12px;font-size:11px}
  .footer{display:flex;justify-content:space-between;margin-top:32px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);font-size:10px;color:#8a9ab5}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body><div class="page">
  <div class="header">
    <div><div class="logo-text">JMR <span style="color:#c8993a">⬡</span></div><div class="logo-sub">GLOBAL INGREDIENTS</div></div>
    <div><div class="title">GAP ANALYSIS: ${filterExporter === 'All' ? 'ALL MERCOSUR' : filterExporter.toUpperCase()} → AFRICA</div>
    <div class="subtitle">${filterLabel === 'All' ? 'ALL SIGNALS' : filterLabel} · ${gaps.length} PAIRS ANALYSED</div></div>
    <div style="background:#e74c3c;border-radius:8px;padding:16px 20px;text-align:center">
      <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:32px;color:#fff">${untapped.length}</div>
      <div style="font-size:9px;color:#fff;letter-spacing:0.1em">UNTAPPED<br>PAIRS</div>
    </div>
  </div>
  <div class="stats">
    <div class="stat"><div class="stat-label">TOTAL L1 RAW FLOWING</div><div class="stat-value">${fmt(totalL1)}</div><div style="font-size:10px;color:#8a9ab5;margin-top:4px">raw commodities Mercosur → Africa</div></div>
    <div class="stat"><div class="stat-label">UNTAPPED / NEAR UNTAPPED</div><div class="stat-value" style="color:#e74c3c">${untapped.length}</div><div style="font-size:10px;color:#8a9ab5;margin-top:4px">country pairs buying raw, zero processed</div></div>
    <div class="stat"><div class="stat-label">LARGEST UNTAPPED</div><div class="stat-value" style="color:#e8b84b">${fmt(gaps[0]?.l1_usd||0)}</div><div style="font-size:10px;color:#8a9ab5;margin-top:4px">${gaps[0]?.exporter} → ${gaps[0]?.importer}</div></div>
  </div>
  ${gaps.map(g => {
    const tops = typeof g.top_products === 'string' ? JSON.parse(g.top_products||'[]') : (g.top_products||[]);
    const color = LABEL_COLOR[g.label]||'#4a5a70';
    return `<div class="gap-card" style="border-left-color:${color}">
      <div class="gap-header">
        <div class="gap-title">${g.exporter} → ${g.importer}</div>
        <span class="gap-badge" style="background:${color}22;color:${color};border:1px solid ${color}44">${g.label}</span>
      </div>
      <div class="gap-desc">${g.description}</div>
      <div class="gap-stats">
        <div class="gap-stat"><span style="color:#8a9ab5">Raw bought </span><span style="color:#fff;font-weight:600">${fmt(g.l1_usd)}</span></div>
        <div class="gap-stat"><span style="color:#8a9ab5">Processed </span><span style="color:${g.l2_usd>0?'#e8b84b':'#e74c3c'};font-weight:600">${g.l2_usd>0?fmt(g.l2_usd):'ZERO'}</span></div>
        ${tops.slice(0,3).map(p=>`<div class="gap-stat" style="color:#8a9ab5">${p.product} ${fmt(p.fob_usd)}</div>`).join('')}
      </div>
    </div>`;
  }).join('')}
  <div class="footer"><div>Source: JMR Trade Intelligence Platform | Data Period: 2025</div><div style="color:#c8993a">www.jmrglobalgroup.com</div></div>
</div></body></html>`;

  const win = window.open('', '_blank', 'width:1250,height:900');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 1500);
}

// ── MARKET INTEL REPORT ───────────────────────────────────────────────────────
export function generateMarketIntelReport({ products, filterGap, sortBy }) {
  const fmt = (n) => n >= 1e9 ? '$'+(n/1e9).toFixed(1)+'B' : n >= 1e6 ? '$'+(n/1e6).toFixed(1)+'M' : n >= 1e3 ? '$'+(n/1e3).toFixed(0)+'K' : '$'+n.toFixed(0);
  const GAP_COLOR = {'UNTAPPED':'#e74c3c','UNDERREPRESENTED':'#e8b84b','COMPETING':'#3b82f6','LATAM DOMINANT':'#2ecc71'};
  const totalMarket = products.reduce((s,p) => s+(p.total_cif_usd||0), 0);

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>JMR Market Intel Report</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0d1f3c;font-family:'IBM Plex Mono',monospace;color:#fff;width:1200px}
  .page{width:1200px;min-height:1400px;background:#0d1f3c;padding:40px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid rgba(200,153,58,0.3)}
  .logo-text{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#fff}
  .logo-sub{font-size:10px;letter-spacing:0.2em;color:#c8993a;margin-top:4px}
  .title{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#fff;text-align:center}
  .subtitle{font-size:13px;color:#c8993a;letter-spacing:0.15em;text-align:center;margin-top:6px}
  .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-bottom:28px}
  .card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:20px}
  .card-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
  .card-title{font-family:'Syne',sans-serif;font-weight:700;font-size:16px}
  .badge{font-size:9px;padding:3px 10px;border-radius:3px;font-weight:700;letter-spacing:0.06em}
  .card-market{font-family:'Syne',sans-serif;font-weight:800;font-size:24px;color:#c8993a;margin-bottom:4px}
  .card-sub{font-size:10px;color:#8a9ab5;margin-bottom:12px}
  .supplier-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:11px}
  .bar-wrap{flex:1;background:rgba(255,255,255,0.08);border-radius:2px;height:4px}
  .bar{height:4px;border-radius:2px}
  .footer{display:flex;justify-content:space-between;margin-top:32px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);font-size:10px;color:#8a9ab5}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body><div class="page">
  <div class="header">
    <div><div class="logo-text">JMR <span style="color:#c8993a">⬡</span></div><div class="logo-sub">GLOBAL INGREDIENTS</div></div>
    <div><div class="title">MARKET INTELLIGENCE REPORT</div>
    <div class="subtitle">${filterGap === 'All' ? 'ALL SIGNALS' : filterGap} · ${products.length} PRODUCTS · SA IMPORT DATA 2024</div></div>
    <div style="background:rgba(200,153,58,0.15);border:1px solid rgba(200,153,58,0.3);border-radius:8px;padding:16px 20px;text-align:center">
      <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#c8993a">${fmt(totalMarket)}</div>
      <div style="font-size:9px;color:#8a9ab5;letter-spacing:0.1em">TOTAL SA<br>IMPORT MARKET</div>
    </div>
  </div>
  <div class="grid">
    ${products.map(p => {
      const tops = typeof p.top_suppliers === 'string' ? JSON.parse(p.top_suppliers||'[]') : (p.top_suppliers||[]);
      const color = GAP_COLOR[p.gap_signal]||'#4a5a70';
      const maxVal = tops[0]?.cif_usd || 1;
      return `<div class="card" style="border-top:3px solid ${color}">
        <div class="card-header">
          <div class="card-title">${p.product}</div>
          <span class="badge" style="background:${color}22;color:${color};border:1px solid ${color}44">${p.gap_signal||'N/A'}</span>
        </div>
        <div class="card-market">${fmt(p.total_cif_usd)}</div>
        <div class="card-sub">SA annual imports · LATAM share: <span style="color:${p.latam_pct>20?'#2ecc71':'#e74c3c'}">${(p.latam_pct||0).toFixed(1)}%</span></div>
        <div style="font-size:9px;color:#8a9ab5;letter-spacing:0.08em;margin-bottom:8px">TOP SUPPLIERS</div>
        ${tops.slice(0,5).map(s => `
          <div class="supplier-row">
            <div style="width:110px;color:${s.is_latam?'#2ecc71':'#ccc'}">${s.is_latam?'★ ':''}${s.origin}</div>
            <div class="bar-wrap"><div class="bar" style="width:${(s.cif_usd/maxVal*100).toFixed(0)}%;background:${s.is_latam?'#2ecc71':'#3b82f6'}"></div></div>
            <div style="color:#c8993a;width:55px;text-align:right">${fmt(s.cif_usd)}</div>
          </div>`).join('')}
        <div style="margin-top:10px;font-size:10px;color:#8a9ab5;line-height:1.6;border-top:1px solid rgba(255,255,255,0.06);padding-top:8px">${p.gap_note||''}</div>
      </div>`;
    }).join('')}
  </div>
  <div class="footer"><div>Source: JMR Trade Intelligence Platform | UN Comtrade 2024</div><div style="color:#c8993a">www.jmrglobalgroup.com</div></div>
</div></body></html>`;

  const win = window.open('', '_blank', 'width:1250,height:900');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 1500);
}

// ── SIGNALS REPORT ────────────────────────────────────────────────────────────
export function generateSignalsReport({ signals, filter }) {
  const entries = Object.entries(signals).filter(([,s]) => filter === 'ALL' || s.signal === filter);
  const counts = {BUY:0,SELL:0,NEUTRAL:0};
  Object.values(signals).forEach(s => { if(counts[s.signal]!==undefined) counts[s.signal]++; });
  const SIGNAL_COLOR = {BUY:'#2ecc71',SELL:'#e74c3c',NEUTRAL:'#e8b84b'};
  const LABELS = {coffee_arabica:'Coffee Arabica',coffee_robusta:'Coffee Robusta',wheat_hrw:'Wheat HRW',wheat_srw:'Wheat SRW',corn:'Corn',soybeans:'Soybeans',soybean_oil:'Soybean Oil',soybean_meal:'Soybean Meal',sunflower_oil:'Sunflower Oil',rapeseed_oil:'Rapeseed Oil',palm_oil:'Palm Oil',sugar:'Sugar',rice:'Rice'};

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>JMR Commodity Signals Report</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0d1f3c;font-family:'IBM Plex Mono',monospace;color:#fff;width:1200px}
  .page{width:1200px;min-height:1200px;background:#0d1f3c;padding:40px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid rgba(200,153,58,0.3)}
  .logo-text{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#fff}
  .logo-sub{font-size:10px;letter-spacing:0.2em;color:#c8993a;margin-top:4px}
  .title{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#fff;text-align:center}
  .subtitle{font-size:13px;color:#c8993a;letter-spacing:0.15em;text-align:center;margin-top:6px}
  .counts{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px}
  .count-box{border-radius:8px;padding:20px;text-align:center}
  .count-num{font-family:'Syne',sans-serif;font-weight:800;font-size:48px}
  .count-lbl{font-size:10px;letter-spacing:0.12em;margin-top:4px}
  table{width:100%;border-collapse:collapse;margin-bottom:28px}
  th{background:rgba(200,153,58,0.15);color:#c8993a;padding:10px 12px;text-align:left;font-size:9px;letter-spacing:0.1em;border-bottom:1px solid rgba(200,153,58,0.3)}
  td{padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px}
  .score-bar{width:100px;background:rgba(255,255,255,0.08);border-radius:2px;height:6px;display:inline-block;vertical-align:middle;margin-right:8px}
  .score-fill{height:6px;border-radius:2px}
  .footer{display:flex;justify-content:space-between;margin-top:32px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);font-size:10px;color:#8a9ab5}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body><div class="page">
  <div class="header">
    <div><div class="logo-text">JMR <span style="color:#c8993a">⬡</span></div><div class="logo-sub">GLOBAL INGREDIENTS</div></div>
    <div><div class="title">COMMODITY SIGNALS REPORT</div>
    <div class="subtitle">World Bank Pink Sheet · ${filter === 'ALL' ? 'ALL SIGNALS' : filter+' ONLY'} · Latest Available Data</div></div>
    <div style="background:rgba(200,153,58,0.15);border:1px solid rgba(200,153,58,0.3);border-radius:8px;padding:16px 20px;text-align:center">
      <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#c8993a">${Object.keys(signals).length}</div>
      <div style="font-size:9px;color:#8a9ab5;letter-spacing:0.1em">COMMODITIES<br>TRACKED</div>
    </div>
  </div>
  <div class="counts">
    <div class="count-box" style="background:rgba(46,204,113,0.1);border:1px solid rgba(46,204,113,0.3)">
      <div class="count-num" style="color:#2ecc71">${counts.BUY}</div>
      <div class="count-lbl" style="color:#2ecc71">BUY SIGNALS</div>
    </div>
    <div class="count-box" style="background:rgba(232,184,75,0.1);border:1px solid rgba(232,184,75,0.3)">
      <div class="count-num" style="color:#e8b84b">${counts.NEUTRAL}</div>
      <div class="count-lbl" style="color:#e8b84b">NEUTRAL</div>
    </div>
    <div class="count-box" style="background:rgba(231,76,60,0.1);border:1px solid rgba(231,76,60,0.3)">
      <div class="count-num" style="color:#e74c3c">${counts.SELL}</div>
      <div class="count-lbl" style="color:#e74c3c">SELL SIGNALS</div>
    </div>
  </div>
  <table>
    <thead><tr>
      <th>COMMODITY</th><th>SIGNAL</th><th>PRICE</th><th>SCORE</th>
      <th>3M CHANGE</th><th>12M CHANGE</th><th>5YR RANK</th><th>12M AVG</th>
    </tr></thead>
    <tbody>
      ${entries.map(([name, s]) => {
        const color = SIGNAL_COLOR[s.signal]||'#4a5a70';
        const scoreAbs = Math.min(Math.abs(s.combined_score||0)/2*100, 100);
        return `<tr>
          <td style="color:#fff;font-weight:600">${LABELS[name]||name}</td>
          <td><span style="background:${color}22;color:${color};border:1px solid ${color}44;padding:2px 8px;border-radius:3px;font-size:9px;font-weight:700">${s.signal}</span></td>
          <td style="color:#c8993a">${s.price||'-'} <span style="color:#8a9ab5;font-size:10px">${s.price_unit||''}</span></td>
          <td>
            <span class="score-bar"><span class="score-fill" style="width:${scoreAbs.toFixed(0)}%;background:${color}"></span></span>
            <span style="color:${color}">${s.combined_score>=0?'+':''}${(s.combined_score||0).toFixed(2)}</span>
          </td>
          <td style="color:${(s.trend_3m_pct||0)>=0?'#2ecc71':'#e74c3c'}">${(s.trend_3m_pct||0)>=0?'+':''}${s.trend_3m_pct||0}%</td>
          <td style="color:${(s.trend_12m_pct||0)>=0?'#2ecc71':'#e74c3c'}">${(s.trend_12m_pct||0)>=0?'+':''}${s.trend_12m_pct||0}%</td>
          <td style="color:${(s.pct_rank_5yr||0)>0.7?'#e74c3c':(s.pct_rank_5yr||0)<0.3?'#2ecc71':'#e8b84b'}">${Math.round((s.pct_rank_5yr||0)*100)}th</td>
          <td style="color:#8a9ab5">${s.ma12||'-'}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
  <div class="footer"><div>Source: World Bank Pink Sheet | JMR Trade Intelligence Platform</div><div style="color:#c8993a">www.jmrglobalgroup.com</div></div>
</div></body></html>`;

  const win = window.open('', '_blank', 'width:1250,height:900');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 1500);
}

// ── LANDED COST REPORT ────────────────────────────────────────────────────────
export function generateLandedCostReport({ product, suppliers, zarUsd, tariffNote, saMarket }) {
  const INSURANCE = 0.005;
  const MERCOSUR = ['Argentina','Brazil','Uruguay','Paraguay'];

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>JMR Landed Cost Report</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0d1f3c;font-family:'IBM Plex Mono',monospace;color:#fff;width:1200px}
  .page{width:1200px;background:#0d1f3c;padding:40px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid rgba(200,153,58,0.3)}
  .logo-text{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#fff}
  .logo-sub{font-size:10px;letter-spacing:0.2em;color:#c8993a;margin-top:4px}
  .title{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#fff;text-align:center}
  .subtitle{font-size:13px;color:#c8993a;letter-spacing:0.15em;text-align:center;margin-top:6px}
  table{width:100%;border-collapse:collapse;margin-bottom:28px}
  th{background:rgba(200,153,58,0.15);color:#c8993a;padding:10px 14px;text-align:left;font-size:9px;letter-spacing:0.1em;border-bottom:1px solid rgba(200,153,58,0.3)}
  td{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px}
  .footer{display:flex;justify-content:space-between;margin-top:32px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);font-size:10px;color:#8a9ab5}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body><div class="page">
  <div class="header">
    <div><div class="logo-text">JMR <span style="color:#c8993a">⬡</span></div><div class="logo-sub">GLOBAL INGREDIENTS</div></div>
    <div><div class="title">LANDED COST ANALYSIS</div>
    <div class="subtitle">${product||''} · DELIVERED DURBAN · ZAR/USD ${zarUsd?.toFixed(2)||'16.44'}</div></div>
    <div style="background:rgba(200,153,58,0.15);border:1px solid rgba(200,153,58,0.3);border-radius:8px;padding:16px 20px;text-align:center">
      <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:24px;color:#c8993a">$${(saMarket||0).toFixed(3)}</div>
      <div style="font-size:9px;color:#8a9ab5;letter-spacing:0.1em">SA MARKET<br>PRICE /KG</div>
    </div>
  </div>
  <div style="margin-bottom:16px;padding:12px 16px;background:rgba(255,255,255,0.04);border-radius:6px;font-size:11px;color:#8a9ab5">
    Tariff: <span style="color:#c8993a">${tariffNote||'See SARS Schedule 1'}</span> &nbsp;|&nbsp; Insurance: 0.5% of FOB &nbsp;|&nbsp; ★ = Mercosur preferential supplier
  </div>
  <table>
    <thead><tr>
      <th>SUPPLIER ORIGIN</th><th>FOB $/KG</th><th>FREIGHT $/KG</th><th>INSURANCE</th><th>TARIFF</th><th>LANDED $/KG</th><th>VS MARKET</th><th>STATUS</th>
    </tr></thead>
    <tbody>
      ${(suppliers||[]).map(s => {
        const ins = (s.fob||0) * INSURANCE;
        const landed = (s.fob||0) + (s.freight||0) + ins;
        const margin = (saMarket||0) - landed;
        const status = margin > 0.05 ? 'VIABLE' : margin > 0 ? 'MARGINAL' : 'NOT VIABLE';
        const color = margin > 0.05 ? '#2ecc71' : margin > 0 ? '#e8b84b' : '#e74c3c';
        const isMercosur = MERCOSUR.includes(s.name);
        return `<tr style="background:${s.highlight?'rgba(46,204,113,0.04)':'transparent'}">
          <td style="color:${isMercosur?'#2ecc71':'#fff'};font-weight:${isMercosur?'600':'400'}">${isMercosur?'★ ':''}${s.name}</td>
          <td style="color:#c8993a">$${(s.fob||0).toFixed(3)}</td>
          <td style="color:#ccc">$${(s.freight||0).toFixed(3)}</td>
          <td style="color:#ccc">$${ins.toFixed(3)}</td>
          <td style="color:#8a9ab5">$0.000</td>
          <td style="color:#fff;font-weight:600">$${landed.toFixed(3)}</td>
          <td style="color:${color};font-weight:600">${margin>=0?'+':''}${margin.toFixed(3)}</td>
          <td><span style="background:${color}22;color:${color};border:1px solid ${color}44;padding:2px 8px;border-radius:3px;font-size:9px;font-weight:700">${status}</span></td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
  <div class="footer"><div>Source: JMR Trade Intelligence Platform | SARS Schedule 1 | UN Comtrade</div><div style="color:#c8993a">www.jmrglobalgroup.com</div></div>
</div></body></html>`;

  const win = window.open('', '_blank', 'width:1250,height:900');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 1500);
}

// ── ACTIVE DEALS REPORT ───────────────────────────────────────────────────────
export function generateDealsReport({ deals, filter }) {
  const STATUS_COLOR = {Pipeline:'#e8b84b',Research:'#4a9eda',Closed:'#4a5a70',Confirmed:'#2ecc71'};
  const today = new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>JMR Active Deals Report</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0d1f3c;font-family:'IBM Plex Mono',monospace;color:#fff;width:1200px}
  .page{width:1200px;min-height:1200px;background:#0d1f3c;padding:40px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid rgba(200,153,58,0.3)}
  .logo-text{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#fff}
  .logo-sub{font-size:10px;letter-spacing:0.2em;color:#c8993a;margin-top:4px}
  .title{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#fff;text-align:center}
  .subtitle{font-size:13px;color:#c8993a;letter-spacing:0.15em;text-align:center;margin-top:6px}
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}
  .stat{border-radius:8px;padding:16px;text-align:center}
  .stat-num{font-family:'Syne',sans-serif;font-weight:800;font-size:36px}
  .stat-lbl{font-size:9px;letter-spacing:0.1em;margin-top:4px}
  .deal-card{background:rgba(255,255,255,0.04);border-radius:8px;padding:20px;margin-bottom:16px}
  .deal-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
  .deal-title{font-family:'Syne',sans-serif;font-weight:700;font-size:18px}
  .deal-meta{font-size:11px;color:#8a9ab5;margin-top:4px}
  .badge{font-size:9px;padding:4px 12px;border-radius:4px;font-weight:700;letter-spacing:0.06em}
  .deal-notes{font-size:12px;color:#8a9ab5;line-height:1.7;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:4px;margin-bottom:12px}
  .next-action{padding:10px 14px;background:rgba(232,184,75,0.08);border:1px solid rgba(232,184,75,0.2);border-radius:4px;font-size:12px;color:#e8b84b}
  .footer{display:flex;justify-content:space-between;margin-top:32px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);font-size:10px;color:#8a9ab5}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body><div class="page">
  <div class="header">
    <div><div class="logo-text">JMR <span style="color:#c8993a">⬡</span></div><div class="logo-sub">GLOBAL INGREDIENTS</div></div>
    <div><div class="title">ACTIVE DEAL PIPELINE</div>
    <div class="subtitle">${filter === 'All' ? 'ALL DEALS' : filter.toUpperCase()} · Generated ${today}</div></div>
    <div style="background:rgba(200,153,58,0.15);border:1px solid rgba(200,153,58,0.3);border-radius:8px;padding:16px 20px;text-align:center">
      <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:32px;color:#c8993a">${deals.length}</div>
      <div style="font-size:9px;color:#8a9ab5;letter-spacing:0.1em">ACTIVE<br>DEALS</div>
    </div>
  </div>
  <div class="stats">
    ${['Pipeline','Research','Confirmed','Closed'].map(s => {
      const count = deals.filter(d => d.status === s).length;
      const color = STATUS_COLOR[s]||'#4a5a70';
      return `<div class="stat" style="background:${color}15;border:1px solid ${color}30">
        <div class="stat-num" style="color:${color}">${count}</div>
        <div class="stat-lbl" style="color:${color}">${s.toUpperCase()}</div>
      </div>`;
    }).join('')}
  </div>
  ${deals.map(d => {
    const color = STATUS_COLOR[d.status]||'#4a5a70';
    const spec = d.spec ? (typeof d.spec === 'string' ? JSON.parse(d.spec) : d.spec) : {};
    return `<div class="deal-card" style="border-left:4px solid ${color}">
      <div class="deal-header">
        <div>
          <div class="deal-title">${d.title}</div>
          <div class="deal-meta">
            ${d.route_from&&d.route_to?`${d.route_from} → ${d.route_to} &nbsp;|&nbsp;`:''}
            ${d.product?`${d.product} &nbsp;|&nbsp;`:''}
            ${d.port_origin&&d.port_destination?`⚓ ${d.port_origin} → ${d.port_destination}`:''}
          </div>
        </div>
        <span class="badge" style="background:${color}22;color:${color};border:1px solid ${color}44">${(d.status||'').toUpperCase()}</span>
      </div>
      ${Object.keys(spec).length>0?`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        ${Object.entries(spec).map(([k,v])=>`<span style="font-size:10px;color:#a855f7;background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);padding:2px 8px;border-radius:3px">${k}: ${Array.isArray(v)?v.join(', '):v}</span>`).join('')}
      </div>`:''}
      ${d.price_cif_benchmark?`<div style="display:inline-flex;gap:8px;align-items:center;margin-bottom:10px;padding:6px 12px;background:rgba(255,255,255,0.05);border-radius:4px">
        <span style="font-size:11px;color:#8a9ab5">CIF BENCHMARK</span>
        <span style="font-size:14px;color:#e8b84b;font-weight:700">$${d.price_cif_benchmark?.toLocaleString()}/MT</span>
        ${d.cif_benchmark_notes?`<span style="font-size:11px;color:#8a9ab5">— ${d.cif_benchmark_notes}</span>`:''}
      </div>`:''}
      ${d.notes?`<div class="deal-notes">${d.notes}</div>`:''}
      ${d.next_action?`<div class="next-action"><span style="font-size:9px;letter-spacing:0.08em;display:block;margin-bottom:4px">NEXT ACTION</span>${d.next_action}${d.next_action_date?`<span style="font-size:10px;color:#8a9ab5;display:block;margin-top:4px">${d.next_action_date}</span>`:''}</div>`:''}
    </div>`;
  }).join('')}
  <div class="footer"><div>Source: JMR Trade Intelligence Platform · Confidential</div><div style="color:#c8993a">www.jmrglobalgroup.com</div></div>
</div></body></html>`;

  const win = window.open('', '_blank', 'width:1250,height:900');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 1500);
}

// ── PRODUCT INTEL REPORT ──────────────────────────────────────────────────────
export function generateProductIntelReport({ product, p, liveSuppliers }) {
  const fmt = (n) => n >= 1e9 ? '$'+(n/1e9).toFixed(2)+'B' : n >= 1e6 ? '$'+(n/1e6).toFixed(1)+'M' : n >= 1e3 ? '$'+(n/1e3).toFixed(0)+'K' : '$'+n.toFixed(0);
  const today = new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>JMR Product Intel Report</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0d1f3c;font-family:'IBM Plex Mono',monospace;color:#fff;width:1200px}
  .page{width:1200px;min-height:1200px;background:#0d1f3c;padding:40px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid rgba(200,153,58,0.3)}
  .logo-text{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#fff}
  .logo-sub{font-size:10px;letter-spacing:0.2em;color:#c8993a;margin-top:4px}
  .title{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#fff;text-align:center}
  .subtitle{font-size:13px;color:#c8993a;letter-spacing:0.15em;text-align:center;margin-top:6px}
  .hero{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}
  .hero-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:20px}
  .hero-label{font-size:9px;letter-spacing:0.12em;color:#8a9ab5;margin-bottom:8px}
  .hero-value{font-family:'Syne',sans-serif;font-weight:800;font-size:28px}
  .hero-sub{font-size:10px;color:#8a9ab5;margin-top:4px}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
  .panel{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:20px}
  .panel-title{font-size:9px;letter-spacing:0.12em;color:#8a9ab5;margin-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:8px}
  table{width:100%;border-collapse:collapse}
  th{color:#8a9ab5;padding:6px 8px;text-align:left;font-size:9px;letter-spacing:0.08em;border-bottom:1px solid rgba(255,255,255,0.06)}
  td{padding:8px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:11px}
  .opp{padding:14px 16px;background:rgba(46,204,113,0.06);border:1px solid rgba(46,204,113,0.2);border-radius:6px;margin-bottom:16px}
  .footer{display:flex;justify-content:space-between;margin-top:32px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);font-size:10px;color:#8a9ab5}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body><div class="page">
  <div class="header">
    <div><div class="logo-text">JMR <span style="color:#c8993a">⬡</span></div><div class="logo-sub">GLOBAL INGREDIENTS</div></div>
    <div><div class="title">PRODUCT INTELLIGENCE: ${(product||'').toUpperCase()}</div>
    <div class="subtitle">${p?.hs||''} · SA IMPORT MARKET ANALYSIS · ${today}</div></div>
    <div style="background:rgba(200,153,58,0.15);border:1px solid rgba(200,153,58,0.3);border-radius:8px;padding:16px 20px;text-align:center;min-width:100px">
      <div style="font-size:9px;color:#8a9ab5;letter-spacing:0.1em;margin-bottom:4px">JMR DEAL</div>
      <div style="font-size:9px;color:#2ecc71;font-weight:700">${p?.key_supplier?'ACTIVE':''}</div>
    </div>
  </div>
  <div class="hero">
    ${(p?.hero||[]).map(h => `<div class="hero-card">
      <div class="hero-label">${h.label}</div>
      <div class="hero-value" style="color:${h.color||'#c8993a'}">${h.value}</div>
      <div class="hero-sub">${h.sub||''}</div>
    </div>`).join('')}
  </div>
  <div class="grid2">
    <div class="panel">
      <div class="panel-title">WHO SUPPLIES SOUTH AFRICA TODAY (LIVE COMTRADE)</div>
      <table>
        <thead><tr><th>SUPPLIER</th><th>VOLUME (MT)</th><th>FOB VALUE</th><th>$/KG</th></tr></thead>
        <tbody>
          ${(liveSuppliers||[]).slice(0,10).map(s => {
            const isLatam = ['Argentina','Brazil','Uruguay','Paraguay','Chile'].includes(s.partner_name);
            const priceKg = s.qty_kg > 0 ? s.fob_value_usd / s.qty_kg : null;
            return `<tr style="background:${isLatam?'rgba(46,204,113,0.06)':'transparent'}">
              <td style="color:${isLatam?'#2ecc71':'#fff'};font-weight:${isLatam?'600':'400'}">${isLatam?'★ ':''}${s.partner_name}</td>
              <td style="color:#ccc">${s.qty_kg?(s.qty_kg/1000).toFixed(0)+' MT':'-'}</td>
              <td style="color:#c8993a">$${(s.fob_value_usd/1000).toFixed(0)}K</td>
              <td style="color:${isLatam?'#2ecc71':'#8a9ab5'}">${priceKg?'$'+priceKg.toFixed(3):'-'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    <div class="panel">
      <div class="panel-title">GLOBAL FOB PRICE COMPARISON ($/KG)</div>
      ${(p?.global_exporters||[]).map(e => {
        const maxFob = Math.max(...(p?.global_exporters||[]).map(x=>x.fob_per_kg||0));
        const pct = maxFob > 0 ? (e.fob_per_kg/maxFob*100).toFixed(0) : 0;
        const isArg = e.exporter === 'Argentina';
        return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <div style="width:110px;font-size:11px;color:${isArg?'#2ecc71':'#ccc'}">${isArg?'★ ':''}${e.exporter}</div>
          <div style="flex:1;background:rgba(255,255,255,0.08);border-radius:2px;height:6px">
            <div style="width:${pct}%;background:${isArg?'#2ecc71':'#3b82f6'};height:6px;border-radius:2px"></div>
          </div>
          <div style="font-size:11px;color:#c8993a;width:50px;text-align:right">$${e.fob_per_kg?.toFixed(3)}</div>
        </div>`;
      }).join('')}
    </div>
  </div>
  ${p?.opportunity?`<div class="opp">
    <div style="font-size:12px;font-weight:600;color:#2ecc71;margin-bottom:8px">THE OPPORTUNITY</div>
    <div style="font-size:12px;color:#ccc;line-height:1.7">${p.opportunity}</div>
  </div>`:''}
  <div class="panel" style="margin-bottom:20px">
    <div class="panel-title">DEAL STATUS</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div>
        <div style="font-size:10px;color:#8a9ab5;margin-bottom:4px">KEY SUPPLIER</div>
        <div style="font-size:13px;font-weight:600;color:#fff;margin-bottom:2px">${p?.key_supplier||'—'}</div>
        <div style="font-size:11px;color:#8a9ab5">${p?.key_supplier_sub||''}</div>
      </div>
      <div>
        <div style="font-size:10px;color:#8a9ab5;margin-bottom:4px">KEY BUYER</div>
        <div style="font-size:13px;font-weight:600;color:${p?.key_buyer_color||'#fff'};margin-bottom:2px">${p?.key_buyer||'—'}</div>
        <div style="font-size:11px;color:#8a9ab5">${p?.key_buyer_sub||''}</div>
      </div>
    </div>
    ${p?.next_step?`<div style="margin-top:14px;padding:10px 14px;background:rgba(231,76,60,0.08);border:1px solid rgba(231,76,60,0.3);border-radius:4px;font-size:12px;color:#e74c3c">⚠ Pending: ${p.next_step}</div>`:''}
  </div>
  <div class="footer"><div>Source: JMR Trade Intelligence Platform | UN Comtrade | Confidential</div><div style="color:#c8993a">www.jmrglobalgroup.com</div></div>
</div></body></html>`;

  const win = window.open('', '_blank', 'width:1250,height:900');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 1500);
}
