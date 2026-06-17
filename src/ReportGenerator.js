import React from 'react';

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
  'Djibouti':     [0.78, 0.42], 'Guinea':         [0.15, 0.45], 'Mauritania':   [0.18, 0.25],
};

const COUNTRY_FLAGS = {"Algeria": "\ud83c\udde9\ud83c\uddff", "Egypt": "\ud83c\uddea\ud83c\uddec", "Morocco": "\ud83c\uddf2\ud83c\udde6", "Libya": "\ud83c\uddf1\ud83c\uddfe", "Tunisia": "\ud83c\uddf9\ud83c\uddf3", "South Africa": "\ud83c\uddff\ud83c\udde6", "Nigeria": "\ud83c\uddf3\ud83c\uddec", "Kenya": "\ud83c\uddf0\ud83c\uddea", "Ghana": "\ud83c\uddec\ud83c\udded", "Senegal": "\ud83c\uddf8\ud83c\uddf3", "Ivory Coast": "\ud83c\udde8\ud83c\uddee", "Cameroon": "\ud83c\udde8\ud83c\uddf2", "Tanzania": "\ud83c\uddf9\ud83c\uddff", "Ethiopia": "\ud83c\uddea\ud83c\uddf9", "Angola": "\ud83c\udde6\ud83c\uddf4", "Mozambique": "\ud83c\uddf2\ud83c\uddff", "Zambia": "\ud83c\uddff\ud83c\uddf2", "Zimbabwe": "\ud83c\uddff\ud83c\uddfc", "Uganda": "\ud83c\uddfa\ud83c\uddec", "Congo": "\ud83c\udde8\ud83c\uddec", "Dem. Rep. of the Congo": "\ud83c\udde8\ud83c\udde9", "Gabon": "\ud83c\uddec\ud83c\udde6", "Mali": "\ud83c\uddf2\ud83c\uddf1", "Niger": "\ud83c\uddf3\ud83c\uddea", "Burkina Faso": "\ud83c\udde7\ud83c\uddeb", "Togo": "\ud83c\uddf9\ud83c\uddec", "Benin": "\ud83c\udde7\ud83c\uddef", "Mauritius": "\ud83c\uddf2\ud83c\uddfa", "Cabo Verde": "\ud83c\udde8\ud83c\uddfb", "Somalia": "\ud83c\uddf8\ud83c\uddf4", "Sudan": "\ud83c\uddf8\ud83c\udde9", "Djibouti": "\ud83c\udde9\ud83c\uddef", "Guinea": "\ud83c\uddec\ud83c\uddf3", "Mauritania": "\ud83c\uddf2\ud83c\uddf7", "Argentina": "\ud83c\udde6\ud83c\uddf7", "Brazil": "\ud83c\udde7\ud83c\uddf7", "Uruguay": "\ud83c\uddfa\ud83c\uddfe", "Paraguay": "\ud83c\uddf5\ud83c\uddfe"};

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 50" height="44"><text x="0" y="38" font-family="Syne, sans-serif" font-weight="800" font-size="34" fill="#ffffff">JMR</text><path d="M0 16 Q42 5 84 16" fill="none" stroke="#c8993a" stroke-width="3" stroke-linecap="round"/><circle cx="0" cy="16" r="3.5" fill="#c8993a"/><circle cx="84" cy="16" r="3.5" fill="#ffffff"/><text x="100" y="38" font-family="Syne, sans-serif" font-weight="500" font-size="34" fill="#c8993a" letter-spacing="1">GLOBAL</text></svg>`;

function fmt(n) {
  if (!n && n !== 0) return '$0';
  if (n >= 1e9) return '$' + (n/1e9).toFixed(2) + 'B';
  if (n >= 1e6) return '$' + (n/1e6).toFixed(1) + 'M';
  if (n >= 1e3) return '$' + (n/1e3).toFixed(0) + 'K';
  return '$' + n.toFixed(0);
}

export function generateTradeFlowReport({ flows, exporter, importer, layer }) {
  const totalFob   = flows.reduce((s, f) => s + (f.fob_usd || 0), 0);
  const totalVol   = flows.reduce((s, f) => s + (f.volume_mt || 0), 0);
  const avgPrice   = totalVol > 0 ? totalFob / (totalVol * 1000) : 0;
  const processors = flows.filter(f => f.importer_is_processor).length;

  const marketMap = {};
  flows.forEach(f => { marketMap[f.importer] = (marketMap[f.importer]||0) + (f.fob_usd||0); });
  const topMarkets = Object.entries(marketMap).sort((a,b) => b[1]-a[1]).slice(0,5);

  const productMap = {};
  flows.forEach(f => { const k = f.product||f.hs_code; productMap[k] = (productMap[k]||0) + (f.fob_usd||0); });
  const topProducts = Object.entries(productMap).sort((a,b) => b[1]-a[1]).slice(0,5);

  const PRODUCT_ICONS = {'Corn':'🌽','Corn (Maize)':'🌽','Soybean Meal':'🫘','Full Cream Milk Powder':'🥛','Milk Powder FCMP':'🥛','Sunflower Oil':'🌻','Soybean Oil':'🫙','Soya Lecithin':'🧪','Modified Starch':'🏭','Soybeans':'🫘','Wheat':'🌾','Sugar':'🍬','Soy Protein':'💪'};
  const sorted = [...flows].sort((a,b) => (b.fob_usd||0)-(a.fob_usd||0));
  const half = Math.ceil(sorted.length/2);
  const col1 = sorted.slice(0, half);
  const col2 = sorted.slice(half);

  const title = `TRADE FLOW: ${(exporter||'ALL').toUpperCase()} → ${(importer||'ALL AFRICA').toUpperCase()}`;
  const subtitle = layer === 'ALL' || !layer ? 'L1 + L2 FLOWS OVERVIEW' : layer === 'L1' ? 'L1 PRIMARY FLOWS ONLY' : 'L2 VALUE-ADDED FLOWS ONLY';

  const mapFlowsJson = JSON.stringify(flows.map(f => ({importer: f.importer, fob_usd: f.fob_usd||0, layer: f.layer||'L1'})));
  const africaPosJson = JSON.stringify(AFRICA_COUNTRIES_POS);

  const tableRow = (f, i) => `
    <tr style="background:${f.layer==='L2'?'rgba(74,158,218,0.06)':i%2===0?'rgba(255,255,255,0.02)':'transparent'}">
      <td style="color:#8a9ab5;font-size:11px;width:24px">${i+1}</td>
      <td style="color:#fff;font-weight:600;font-size:12px">${f.product||f.hs_code||''}</td>
      <td style="color:#8a9ab5;font-size:12px">${f.importer||''}</td>
      <td><span style="padding:2px 7px;border-radius:3px;font-size:9px;font-weight:700;
        background:${f.layer==='L2'?'rgba(74,158,218,0.15)':'rgba(46,204,113,0.15)'};
        color:${f.layer==='L2'?'#4a9eda':'#2ecc71'};
        border:1px solid ${f.layer==='L2'?'rgba(74,158,218,0.3)':'rgba(46,204,113,0.3)'}">${f.layer||'L1'}</span></td>
      <td style="color:#c8993a;font-weight:700;font-size:13px">${fmt(f.fob_usd)}</td>
      <td style="color:#ccc;font-size:12px">${f.volume_mt?f.volume_mt.toLocaleString(undefined,{maximumFractionDigits:0}):'-'}</td>
      <td style="color:#ccc;font-size:12px">${f.price_per_kg?'$'+f.price_per_kg.toFixed(2):'-'}</td>
      <td style="color:${f.importer_is_processor?'#e8b84b':'#4a5a70'};font-size:12px">${f.importer_is_processor?'YES ⚡':'–'}</td>
    </tr>`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>JMR Trade Flow Report</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0b1929;font-family:'IBM Plex Mono',monospace;color:#fff;width:1100px;overflow-x:hidden}
  .page{width:1100px;background:#0b1929;padding:36px;overflow:hidden}
  .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid rgba(200,153,58,0.35)}
  .title-block{text-align:center;flex:1;padding:0 20px}
  .main-title{font-family:'Syne',sans-serif;font-weight:800;font-size:26px;color:#fff;letter-spacing:0.04em;line-height:1.2;text-transform:uppercase}
  .sub-title{font-size:12px;color:#c8993a;letter-spacing:0.18em;margin-top:6px;text-transform:uppercase}
  .flow-badge{background:#c8993a;border-radius:10px;padding:12px 16px;text-align:center;min-width:80px;flex-shrink:0}
  .flow-num{font-family:'Syne',sans-serif;font-weight:800;font-size:36px;color:#0b1929;line-height:1}
  .flow-lbl{font-size:8px;color:#0b1929;letter-spacing:0.1em;margin-top:4px;font-weight:600}
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
  .stat{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:16px}
  .stat-icon{font-size:22px;margin-bottom:8px}
  .stat-label{font-size:8px;letter-spacing:0.14em;color:#8a9ab5;margin-bottom:6px;text-transform:uppercase}
  .stat-value{font-family:'Syne',sans-serif;font-weight:800;font-size:30px;color:#c8993a;line-height:1}
  .stat-unit{font-size:10px;color:#8a9ab5;margin-top:4px}
  .mid-section{display:grid;grid-template-columns:1.1fr 0.9fr;gap:20px;margin-bottom:24px}
  .map-box{background:rgba(255,255,255,0.03);border-radius:10px;overflow:hidden}
  .map-header{padding:14px 16px;background:rgba(200,153,58,0.06);border-bottom:1px solid rgba(200,153,58,0.12)}
  .map-title{font-family:'Syne',sans-serif;font-weight:700;font-size:13px;color:#fff;margin-bottom:4px}
  .map-sub{font-size:10px;color:#8a9ab5;line-height:1.5}
  .right-col{display:flex;flex-direction:column;gap:16px}
  .panel{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:18px}
  .panel-title{font-size:9px;letter-spacing:0.16em;color:#c8993a;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid rgba(200,153,58,0.2);text-transform:uppercase}
  .market-row{display:flex;align-items:center;gap:8px;margin-bottom:10px}
  .mkt-num{font-size:11px;color:#8a9ab5;width:16px;flex-shrink:0}
  .mkt-flag{font-size:16px;flex-shrink:0}
  .mkt-name{flex:1;font-size:12px;color:#fff}
  .mkt-bar-wrap{width:80px;background:rgba(255,255,255,0.08);border-radius:2px;height:5px;flex-shrink:0}
  .mkt-bar{background:#c8993a;height:5px;border-radius:2px}
  .mkt-val{font-size:11px;color:#c8993a;width:52px;text-align:right;font-weight:700;flex-shrink:0}
  .mkt-pct{font-size:10px;color:#8a9ab5;width:32px;text-align:right;flex-shrink:0}
  .prod-row{display:flex;align-items:center;gap:8px;margin-bottom:10px}
  .prod-icon{font-size:18px;flex-shrink:0}
  .prod-name{flex:1;font-size:12px;color:#fff}
  .prod-val{font-size:12px;color:#4a9eda;font-weight:700;flex-shrink:0}
  .prod-pct{font-size:10px;color:#8a9ab5;width:36px;text-align:right;flex-shrink:0}
  .detail-label{font-size:9px;letter-spacing:0.16em;color:#c8993a;margin-bottom:10px;text-transform:uppercase}
  .detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px;margin-bottom:24px;width:100%;overflow:hidden}
  table{width:100%;border-collapse:collapse}
  th{background:rgba(200,153,58,0.12);color:#c8993a;padding:6px 6px;text-align:left;font-size:8px;letter-spacing:0.08em;border-bottom:1px solid rgba(200,153,58,0.25);text-transform:uppercase}
  td{padding:5px 6px;border-bottom:1px solid rgba(255,255,255,0.04);vertical-align:middle;font-size:11px;word-break:break-word}
  .takeaways{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;clear:both;width:100%}
  .takeaway{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:14px}
  .ta-icon{font-size:24px;margin-bottom:8px}
  .ta-title{font-family:'Syne',sans-serif;font-weight:700;font-size:12px;color:#fff;margin-bottom:5px}
  .ta-text{font-size:10px;color:#8a9ab5;line-height:1.6}
  .footer{display:flex;justify-content:space-between;align-items:center;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);font-size:10px;color:#8a9ab5}
  .legend{display:flex;gap:16px;margin-top:10px;padding:8px 16px}
  .leg-item{display:flex;align-items:center;gap:6px;font-size:10px;color:#8a9ab5}
  .leg-dot{width:10px;height:10px;border-radius:50%}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body><div class="page">

  <div class="header">
    <div style="display:flex;flex-direction:column;gap:6px">
      <div style="display:flex;align-items:flex-end;gap:8px;line-height:1">
        <span style="font-family:'Syne',sans-serif;font-weight:800;font-size:36px;color:#fff;letter-spacing:0.02em">JMR</span>
        <div style="display:flex;flex-direction:column;padding-bottom:4px">
          <svg width="90" height="16" viewBox="0 0 90 16" style="display:block">
            <path d="M0 8 Q45 0 90 8" fill="none" stroke="#c8993a" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="0" cy="8" r="3" fill="#c8993a"/>
            <circle cx="90" cy="8" r="3" fill="#ffffff"/>
          </svg>
          <span style="font-family:'Syne',sans-serif;font-weight:500;font-size:16px;color:#c8993a;letter-spacing:2px;margin-top:2px">GLOBAL</span>
        </div>
      </div>
      <div style="font-size:9px;letter-spacing:0.22em;color:#c8993a">GLOBAL INGREDIENTS</div>
    </div
    <div class="title-block">
      <div class="main-title">${title}</div>
      <div class="sub-title">${subtitle}</div>
    </div>
    <div class="flow-badge">
      <div class="flow-num">${flows.length}</div>
      <div class="flow-lbl">TOTAL FLOWS<br>${layer==='ALL'||!layer?'L1 + L2':layer}</div>
    </div>
  </div>

  <div class="stats">
    <div class="stat"><div class="stat-icon">💰</div><div class="stat-label">Total FOB Value</div><div class="stat-value">${fmt(totalFob)}</div><div class="stat-unit">USD</div></div>
    <div class="stat"><div class="stat-icon">⚓</div><div class="stat-label">Total Volume</div><div class="stat-value">${(totalVol/1e6).toFixed(2)}M</div><div class="stat-unit">MT</div></div>
    <div class="stat"><div class="stat-icon">📊</div><div class="stat-label">Weighted Avg Price</div><div class="stat-value">$${avgPrice.toFixed(2)}</div><div class="stat-unit">/KG</div></div>
    <div class="stat"><div class="stat-icon">🏭</div><div class="stat-label">Flows to Processors</div><div class="stat-value">${processors}</div><div class="stat-unit">YES ⚡</div></div>
  </div>

  <div class="mid-section">
    <div class="map-box">
      <div class="map-header">
        <div class="map-title">STRONG TRADE CONNECTIONS</div>
        <div class="map-sub">Key agricultural & ingredient flows from ${exporter||'Mercosur'} to markets across Africa.</div>
      </div>
      <canvas id="map-canvas" width="460" height="320" style="display:block"></canvas>
      <div class="legend">
        <div class="leg-item"><div class="leg-dot" style="background:#2ecc71"></div>L1 – Primary Ingredients</div>
        <div class="leg-item"><div class="leg-dot" style="background:#4a9eda"></div>L2 – Value Added Ingredients</div>
      </div>
    </div>
    <div class="right-col">
      <div class="panel">
        <div class="panel-title">Top 5 Markets by FOB Value</div>
        ${topMarkets.map(([name,val],i) => `
          <div class="market-row">
            <div class="mkt-num">${i+1}</div>
            <div style="font-size:10px;font-weight:700;color:#c8993a;width:28px;flex-shrink:0">${name.slice(0,2).toUpperCase()||'🌍'}</div>
            <div class="mkt-name">${name}</div>
            <div class="mkt-bar-wrap"><div class="mkt-bar" style="width:${(val/topMarkets[0][1]*100).toFixed(0)}%"></div></div>
            <div class="mkt-val">${fmt(val)}</div>
            <div class="mkt-pct">${(val/totalFob*100).toFixed(1)}%</div>
          </div>`).join('')}
      </div>
      <div class="panel">
        <div class="panel-title">Top Products by FOB Value</div>
        ${topProducts.map(([name,val]) => `
          <div class="prod-row">
            <div style="width:8px;height:8px;border-radius:50%;background:#c8993a;flex-shrink:0;margin-top:3px"||'📦'}</div>
            <div class="prod-name">${name}</div>
            <div class="prod-val">${fmt(val)}</div>
            <div class="prod-pct">${(val/totalFob*100).toFixed(1)}%</div>
          </div>`).join('')}
      </div>
    </div>
  </div>

  <div class="detail-label">Trade Flows Detail (${layer==='ALL'||!layer?'L1 + L2':layer})</div>
  <div class="detail-grid">
    <table>
      <thead><tr><th>#</th><th>Product</th><th>To</th><th>Layer</th><th>FOB Value</th><th>Vol MT</th><th>$/KG</th><th>Proc?</th></tr></thead>
      <tbody>${col1.map((f,i) => tableRow(f,i)).join('')}</tbody>
    </table>
    <table>
      <thead><tr><th>#</th><th>Product</th><th>To</th><th>Layer</th><th>FOB Value</th><th>Vol MT</th><th>$/KG</th><th>Proc?</th></tr></thead>
      <tbody>${col2.map((f,i) => tableRow(f,i+half)).join('')}</tbody>
    </table>
  </div>

  <div class="takeaways">
    <div class="takeaway"><div class="ta-icon">🌍</div><div class="ta-title">North Africa leads</div><div class="ta-text">${topMarkets.slice(0,3).map(m=>m[0]).join(', ')} account for ${(topMarkets.slice(0,3).reduce((s,m)=>s+m[1],0)/totalFob*100).toFixed(1)}% of total FOB value.</div></div>
    <div class="takeaway"><div class="ta-icon">🌾</div><div class="ta-title">${topProducts[0]?.[0]||''} dominates</div><div class="ta-text">${topProducts[0]?.[0]||''} represents ${topProducts[0]?(topProducts[0][1]/totalFob*100).toFixed(1):0}% of total trade value.</div></div>
    <div class="takeaway"><div class="ta-icon">🏭</div><div class="ta-title">Value added</div><div class="ta-text">${flows.filter(f=>f.layer==='L2').length} L2 flows across ${[...new Set(flows.filter(f=>f.layer==='L2').map(f=>f.importer))].length} markets.</div></div>
    <div class="takeaway"><div class="ta-icon">🤝</div><div class="ta-title">Diverse reach</div><div class="ta-text">${flows.length} unique flows across ${[...new Set(flows.map(f=>f.importer))].length} African countries.</div></div>
  </div>

  <div class="footer">
    <div>Source: JMR Trade Intelligence Platform &nbsp;|&nbsp; Data Period: Latest Available</div>
    <div style="color:#c8993a;letter-spacing:0.08em">www.jmrglobalgroup.com</div>
  </div>
</div>

<script>
(function() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 460, H = 320;
  const pad = { l: 110, r: 10, t: 15, b: 15 };
  const mapW = W - pad.l - pad.r, mapH = H - pad.t - pad.b;

  ctx.fillStyle = '#0d1a2e';
  ctx.fillRect(0,0,W,H);

  // Africa outline
  ctx.beginPath();
  [[0.18,0.05],[0.55,0.02],[0.85,0.15],[1.00,0.35],[0.95,0.55],[0.80,0.70],[0.75,0.95],[0.55,1.00],[0.35,0.90],[0.20,0.70],[0.05,0.50],[0.00,0.30],[0.10,0.10]].forEach(([x,y],i) => {
    const px = pad.l+x*mapW, py = pad.t+y*mapH;
    i===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
  });
  ctx.closePath();
  ctx.fillStyle='#1a3460'; ctx.fill();
  ctx.strokeStyle='#2a4a7f'; ctx.lineWidth=1; ctx.stroke();

  const argX=50, argY=H*0.58;
  // Argentina shape (simplified)
  ctx.beginPath();
  ctx.arc(argX, argY, 16, 0, Math.PI*2);
  ctx.fillStyle='rgba(200,153,58,0.15)'; ctx.fill();
  ctx.strokeStyle='#c8993a'; ctx.lineWidth=2; ctx.stroke();
  ctx.fillStyle='#c8993a'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
  ctx.fillText('${(exporter||'ARG').slice(0,3).toUpperCase()}', argX, argY+4);
  ctx.fillText('${COUNTRY_FLAGS[exporter||'Argentina']||'🇦🇷'}', argX, argY-20);

  const POS = ${JSON.stringify(AFRICA_COUNTRIES_POS)};
  const flows = ${JSON.stringify(flows.map(f=>({importer:f.importer,fob_usd:f.fob_usd||0,layer:f.layer||'L1'})))};
  const maxFob = Math.max(...flows.map(f=>f.fob_usd||0), 1);
  const dests = [...new Set(flows.map(f=>f.importer))];

  dests.forEach(dest => {
    const pos = POS[dest]; if(!pos) return;
    const destFlows = flows.filter(f=>f.importer===dest);
    const total = destFlows.reduce((s,f)=>s+(f.fob_usd||0),0);
    const px = pad.l+pos[0]*mapW, py = pad.t+pos[1]*mapH;
    const w = Math.max(0.5, Math.min(4, total/maxFob*4));
    const hasL2 = destFlows.some(f=>f.layer==='L2');
    const col = hasL2?'rgba(74,158,218,0.75)':'rgba(200,153,58,0.75)';

    ctx.beginPath(); ctx.moveTo(argX,argY);
    ctx.quadraticCurveTo((argX+px)/2, Math.min(argY,py)-55, px, py);
    ctx.strokeStyle=col; ctx.lineWidth=w; ctx.stroke();

    ctx.beginPath(); ctx.arc(px,py,Math.max(3,w*1.8),0,Math.PI*2);
    ctx.fillStyle=hasL2?'#4a9eda':'#2ecc71'; ctx.fill();
  });
})();
</script>
</body></html>`;

  const win = window.open('', '_blank', 'width=960,height=900');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 1800);
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
  body{background:#0b1929;font-family:'IBM Plex Mono',monospace;color:#fff;width:1100px;overflow-x:hidden}
  .page{width:1100px;background:#0b1929;padding:36px;overflow:hidden}
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
  .footer{display:flex;justify-content:space-between;align-items:center;margin-top:32px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);font-size:10px;color:#8a9ab5}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body><div class="page">
  <div class="header">
    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
      <span style="font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#fff">JMR</span>
      <div style="display:flex;flex-direction:column;justify-content:center">
        <svg width="70" height="12" viewBox="0 0 70 12">
          <path d="M0 6 Q35 0 70 6" fill="none" stroke="#c8993a" stroke-width="2" stroke-linecap="round"/>
          <circle cx="0" cy="6" r="2.5" fill="#c8993a"/>
          <circle cx="70" cy="6" r="2.5" fill="#fff"/>
        </svg>
        <span style="font-family:'Syne',sans-serif;font-weight:500;font-size:13px;color:#c8993a;letter-spacing:2px">GLOBAL</span>
      </div>
    </div>
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
  body{background:#0b1929;font-family:'IBM Plex Mono',monospace;color:#fff;width:1100px;overflow-x:hidden}
  .page{width:1100px;background:#0b1929;padding:36px;overflow:hidden}
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
  .footer{display:flex;justify-content:space-between;align-items:center;margin-top:32px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);font-size:10px;color:#8a9ab5}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body><div class="page">
  <div class="header">
    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
      <span style="font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#fff">JMR</span>
      <div style="display:flex;flex-direction:column;justify-content:center">
        <svg width="70" height="12" viewBox="0 0 70 12">
          <path d="M0 6 Q35 0 70 6" fill="none" stroke="#c8993a" stroke-width="2" stroke-linecap="round"/>
          <circle cx="0" cy="6" r="2.5" fill="#c8993a"/>
          <circle cx="70" cy="6" r="2.5" fill="#fff"/>
        </svg>
        <span style="font-family:'Syne',sans-serif;font-weight:500;font-size:13px;color:#c8993a;letter-spacing:2px">GLOBAL</span>
      </div>
    </div>
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
  body{background:#0b1929;font-family:'IBM Plex Mono',monospace;color:#fff;width:1100px;overflow-x:hidden}
  .page{width:1100px;background:#0b1929;padding:36px;overflow:hidden}
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
  .footer{display:flex;justify-content:space-between;align-items:center;margin-top:32px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);font-size:10px;color:#8a9ab5}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body><div class="page">
  <div class="header">
    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
      <span style="font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#fff">JMR</span>
      <div style="display:flex;flex-direction:column;justify-content:center">
        <svg width="70" height="12" viewBox="0 0 70 12">
          <path d="M0 6 Q35 0 70 6" fill="none" stroke="#c8993a" stroke-width="2" stroke-linecap="round"/>
          <circle cx="0" cy="6" r="2.5" fill="#c8993a"/>
          <circle cx="70" cy="6" r="2.5" fill="#fff"/>
        </svg>
        <span style="font-family:'Syne',sans-serif;font-weight:500;font-size:13px;color:#c8993a;letter-spacing:2px">GLOBAL</span>
      </div>
    </div>
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
  const today = new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});

  // Compute landed costs
  const rows = (suppliers||[]).map(s => {
    const ins = (s.fob||0) * INSURANCE;
    const landed = (s.fob||0) + (s.freight||0) + ins;
    const margin = (saMarket||0) - landed;
    const status = margin > 0.05 ? 'VIABLE' : margin > 0 ? 'MARGINAL' : 'NOT VIABLE';
    const color  = margin > 0.05 ? '#2ecc71' : margin > 0 ? '#e8b84b' : '#e74c3c';
    const isMercosur = MERCOSUR.includes(s.name);
    return { ...s, ins, landed, margin, status, color, isMercosur };
  });

  const bestMercosur = rows.filter(r => r.isMercosur).sort((a,b) => a.landed - b.landed)[0];
  const bestAny = rows.sort((a,b) => a.landed - b.landed)[0];
  const mercosurAdvantage = bestMercosur && bestAny && !bestMercosur.isMercosur
    ? null : bestMercosur ? (saMarket - bestMercosur.landed) : null;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>JMR Landed Cost Analysis</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0b1929;font-family:'IBM Plex Mono',monospace;color:#fff;width:1100px;overflow-x:hidden}
  .page{width:1100px;background:#0b1929;padding:36px;overflow:hidden}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid rgba(200,153,58,0.4)}
  .logo-area{display:flex;flex-direction:column;gap:4px}
  .logo-text{font-family:'Syne',sans-serif;font-weight:800;font-size:32px;color:#fff;letter-spacing:0.05em}
  .logo-sub{font-size:10px;letter-spacing:0.25em;color:#c8993a;margin-top:2px}
  .title-area{text-align:center;flex:1;padding:0 40px}
  .report-title{font-family:'Syne',sans-serif;font-weight:800;font-size:30px;color:#fff;letter-spacing:0.05em;margin-bottom:6px}
  .report-sub{font-size:13px;color:#c8993a;letter-spacing:0.15em}
  .rate-box{background:rgba(200,153,58,0.12);border:1px solid rgba(200,153,58,0.35);border-radius:10px;padding:18px 24px;text-align:center;min-width:120px}
  .rate-val{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#c8993a}
  .rate-lbl{font-size:9px;letter-spacing:0.15em;color:#8a9ab5;margin-top:4px}
  .hero{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px}
  .hero-card{border-radius:10px;padding:22px;position:relative;overflow:hidden}
  .hero-icon{font-size:28px;margin-bottom:10px}
  .hero-label{font-size:9px;letter-spacing:0.14em;color:#8a9ab5;margin-bottom:8px;text-transform:uppercase}
  .hero-value{font-family:'Syne',sans-serif;font-weight:800;font-size:32px;margin-bottom:4px}
  .hero-sub{font-size:10px;color:#8a9ab5;line-height:1.5}
  .section-label{font-size:10px;letter-spacing:0.18em;color:#c8993a;margin-bottom:14px;text-transform:uppercase;border-bottom:1px solid rgba(200,153,58,0.2);padding-bottom:8px}
  .main-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px}
  .panel{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:24px}
  table{width:100%;border-collapse:collapse}
  th{background:rgba(200,153,58,0.12);color:#c8993a;padding:10px 14px;text-align:left;font-size:9px;letter-spacing:0.12em;border-bottom:1px solid rgba(200,153,58,0.25)}
  td{padding:11px 14px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;vertical-align:middle}
  .viable{background:rgba(46,204,113,0.12);color:#2ecc71;border:1px solid rgba(46,204,113,0.3);padding:3px 10px;border-radius:4px;font-size:9px;font-weight:700;letter-spacing:0.06em;display:inline-block}
  .marginal{background:rgba(232,184,75,0.12);color:#e8b84b;border:1px solid rgba(232,184,75,0.3);padding:3px 10px;border-radius:4px;font-size:9px;font-weight:700;letter-spacing:0.06em;display:inline-block}
  .notviable{background:rgba(231,76,60,0.12);color:#e74c3c;border:1px solid rgba(231,76,60,0.3);padding:3px 10px;border-radius:4px;font-size:9px;font-weight:700;letter-spacing:0.06em;display:inline-block}
  .bar-wrap{width:80px;background:rgba(255,255,255,0.08);border-radius:3px;height:6px;display:inline-block;vertical-align:middle;margin-right:6px}
  .bar-fill{height:6px;border-radius:3px}
  .takeaways{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px}
  .takeaway{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:18px}
  .takeaway-icon{font-size:28px;margin-bottom:10px}
  .takeaway-title{font-family:'Syne',sans-serif;font-weight:700;font-size:14px;color:#fff;margin-bottom:6px}
  .takeaway-text{font-size:11px;color:#8a9ab5;line-height:1.65}
  .footer{display:flex;justify-content:space-between;align-items:center;margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.1);font-size:10px;color:#8a9ab5}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body><div class="page">

  <!-- HEADER -->
  <div class="header">
    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
      <span style="font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#fff">JMR</span>
      <div style="display:flex;flex-direction:column;justify-content:center">
        <svg width="70" height="12" viewBox="0 0 70 12">
          <path d="M0 6 Q35 0 70 6" fill="none" stroke="#c8993a" stroke-width="2" stroke-linecap="round"/>
          <circle cx="0" cy="6" r="2.5" fill="#c8993a"/>
          <circle cx="70" cy="6" r="2.5" fill="#fff"/>
        </svg>
        <span style="font-family:'Syne',sans-serif;font-weight:500;font-size:13px;color:#c8993a;letter-spacing:2px">GLOBAL</span>
      </div>
    </div>
    <div class="title-area">
      <div class="report-title">LANDED COST ANALYSIS</div>
      <div class="report-sub">${product||''} · DELIVERED DURBAN · ${today}</div>
    </div>
    <div class="rate-box">
      <div class="rate-val">R${(zarUsd||16.44).toFixed(2)}</div>
      <div class="rate-lbl">ZAR / USD<br>LIVE RATE</div>
    </div>
  </div>

  <!-- HERO STATS -->
  <div class="hero">
    <div class="hero-card" style="background:rgba(200,153,58,0.1);border:1px solid rgba(200,153,58,0.25)">
      <div class="hero-icon">🌍</div>
      <div class="hero-label">SA Market Price</div>
      <div class="hero-value" style="color:#c8993a">$${(saMarket||0).toFixed(3)}<span style="font-size:16px">/kg</span></div>
      <div class="hero-sub">Current CIF Durban benchmark</div>
    </div>
    <div class="hero-card" style="background:rgba(46,204,113,0.08);border:1px solid rgba(46,204,113,0.2)">
      <div class="hero-icon">⭐</div>
      <div class="hero-label">Best Mercosur Landed</div>
      <div class="hero-value" style="color:#2ecc71">$${bestMercosur?(bestMercosur.landed).toFixed(3):'N/A'}<span style="font-size:16px">/kg</span></div>
      <div class="hero-sub">${bestMercosur?.name||'No Mercosur supplier'} · inc. freight + insurance</div>
    </div>
    <div class="hero-card" style="background:rgba(74,158,218,0.08);border:1px solid rgba(74,158,218,0.2)">
      <div class="hero-icon">📦</div>
      <div class="hero-label">Tariff</div>
      <div class="hero-value" style="color:#4a9eda;font-size:22px">${tariffNote||'See SARS'}</div>
      <div class="hero-sub">SA import duty — SARS Schedule 1</div>
    </div>
    <div class="hero-card" style="background:${bestMercosur&&bestMercosur.margin>0.05?'rgba(46,204,113,0.08)':'rgba(231,76,60,0.08)'};border:1px solid ${bestMercosur&&bestMercosur.margin>0.05?'rgba(46,204,113,0.2)':'rgba(231,76,60,0.2)'}">
      <div class="hero-icon">${bestMercosur&&bestMercosur.margin>0.05?'✅':'⚠️'}</div>
      <div class="hero-label">Mercosur Margin</div>
      <div class="hero-value" style="color:${bestMercosur&&bestMercosur.margin>0.05?'#2ecc71':'#e74c3c'}">${bestMercosur?(bestMercosur.margin>=0?'+':'')+bestMercosur.margin.toFixed(3):'N/A'}<span style="font-size:16px">/kg</span></div>
      <div class="hero-sub">vs SA market price</div>
    </div>
  </div>

  <!-- MAIN TABLE -->
  <div class="section-label">SUPPLIER COMPARISON — DELIVERED DURBAN</div>
  <table style="margin-bottom:28px">
    <thead><tr>
      <th>ORIGIN</th><th>FOB $/KG</th><th>FREIGHT $/KG</th><th>INSURANCE</th><th>TOTAL LANDED</th><th>VS MARKET</th><th>MARGIN BAR</th><th>STATUS</th>
    </tr></thead>
    <tbody>
      ${rows.sort((a,b) => a.landed-b.landed).map(s => {
        const maxMargin = Math.max(...rows.map(r => Math.abs(r.margin)));
        const barPct = maxMargin > 0 ? Math.min(100, Math.abs(s.margin)/maxMargin*100).toFixed(0) : 0;
        return `<tr style="background:${s.isMercosur?'rgba(46,204,113,0.04)':'transparent'}">
          <td style="color:${s.isMercosur?'#2ecc71':'#fff'};font-weight:${s.isMercosur?600:400}">
            ${s.isMercosur?'★ ':''}${s.name}
          </td>
          <td style="color:#c8993a;font-family:'Syne',sans-serif;font-weight:700">$${(s.fob||0).toFixed(3)}</td>
          <td style="color:#8a9ab5">$${(s.freight||0).toFixed(3)}</td>
          <td style="color:#8a9ab5">$${s.ins.toFixed(3)}</td>
          <td style="color:#fff;font-family:'Syne',sans-serif;font-weight:700;font-size:14px">$${s.landed.toFixed(3)}</td>
          <td style="color:${s.color};font-weight:700">${s.margin>=0?'+':''}${s.margin.toFixed(3)}</td>
          <td>
            <div class="bar-wrap"><div class="bar-fill" style="width:${barPct}%;background:${s.color}"></div></div>
          </td>
          <td><span class="${s.status==='VIABLE'?'viable':s.status==='MARGINAL'?'marginal':'notviable'}">${s.status}</span></td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>

  <!-- TAKEAWAYS -->
  <div class="section-label">KEY TAKEAWAYS</div>
  <div class="takeaways">
    <div class="takeaway">
      <div class="takeaway-icon">🏆</div>
      <div class="takeaway-title">Cheapest Origin</div>
      <div class="takeaway-text">${rows[0]?.name||'N/A'} delivers the lowest landed cost at $${rows[0]?.landed.toFixed(3)||'N/A'}/kg — ${rows[0]?.isMercosur?'a Mercosur supplier':'non-Mercosur origin'}.</div>
    </div>
    <div class="takeaway">
      <div class="takeaway-icon">⭐</div>
      <div class="takeaway-title">Mercosur Position</div>
      <div class="takeaway-text">${bestMercosur?`${bestMercosur.name} is the most competitive Mercosur origin at $${bestMercosur.landed.toFixed(3)}/kg landed — ${bestMercosur.margin>0.05?'VIABLE margin of $'+bestMercosur.margin.toFixed(3)+'/kg vs SA market.':'margin is thin, needs negotiation.'}`:'No Mercosur suppliers currently listed for this product.'}</div>
    </div>
    <div class="takeaway">
      <div class="takeaway-icon">📊</div>
      <div class="takeaway-title">Viable Origins</div>
      <div class="takeaway-text">${rows.filter(r=>r.status==='VIABLE').length} of ${rows.length} origins are viable at current SA market price of $${(saMarket||0).toFixed(3)}/kg. ${rows.filter(r=>r.status==='MARGINAL').length} are marginal.</div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div>Source: JMR Trade Intelligence Platform &nbsp;|&nbsp; SARS Schedule 1 &nbsp;|&nbsp; UN Comtrade &nbsp;|&nbsp; FX: frankfurter.app</div>
    <div style="color:#c8993a;letter-spacing:0.08em">www.jmrglobalgroup.com</div>
  </div>

</div></body></html>`;

  const win = window.open('', '_blank', 'width=1250,height=900');
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
  body{background:#0b1929;font-family:'IBM Plex Mono',monospace;color:#fff;width:1100px;overflow-x:hidden}
  .page{width:1100px;background:#0b1929;padding:36px;overflow:hidden}
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
  .footer{display:flex;justify-content:space-between;align-items:center;margin-top:32px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);font-size:10px;color:#8a9ab5}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body><div class="page">
  <div class="header">
    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
      <span style="font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#fff">JMR</span>
      <div style="display:flex;flex-direction:column;justify-content:center">
        <svg width="70" height="12" viewBox="0 0 70 12">
          <path d="M0 6 Q35 0 70 6" fill="none" stroke="#c8993a" stroke-width="2" stroke-linecap="round"/>
          <circle cx="0" cy="6" r="2.5" fill="#c8993a"/>
          <circle cx="70" cy="6" r="2.5" fill="#fff"/>
        </svg>
        <span style="font-family:'Syne',sans-serif;font-weight:500;font-size:13px;color:#c8993a;letter-spacing:2px">GLOBAL</span>
      </div>
    </div>
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
  body{background:#0b1929;font-family:'IBM Plex Mono',monospace;color:#fff;width:1100px;overflow-x:hidden}
  .page{width:1100px;background:#0b1929;padding:36px;overflow:hidden}
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
  .footer{display:flex;justify-content:space-between;align-items:center;margin-top:32px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);font-size:10px;color:#8a9ab5}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body><div class="page">
  <div class="header">
    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
      <span style="font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#fff">JMR</span>
      <div style="display:flex;flex-direction:column;justify-content:center">
        <svg width="70" height="12" viewBox="0 0 70 12">
          <path d="M0 6 Q35 0 70 6" fill="none" stroke="#c8993a" stroke-width="2" stroke-linecap="round"/>
          <circle cx="0" cy="6" r="2.5" fill="#c8993a"/>
          <circle cx="70" cy="6" r="2.5" fill="#fff"/>
        </svg>
        <span style="font-family:'Syne',sans-serif;font-weight:500;font-size:13px;color:#c8993a;letter-spacing:2px">GLOBAL</span>
      </div>
    </div>
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
