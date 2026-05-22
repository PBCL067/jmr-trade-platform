import React, { useState } from 'react';

const TOPICS = [
  {
    id: 'what_we_do',
    title: 'What does JMR actually do?',
    icon: '\u25c9',
    content: [
      { type: 'text', text: "We are a commodity trading company. We find products made cheaply in South America and sell them to buyers in Africa. We focus on dry goods and long-life food ingredients that survive a long sea journey without refrigeration." },
      { type: 'text', text: "Think of it like this: a factory in South Africa needs a powder to thicken their sauces. They currently buy it from Thailand. We found that Argentina makes the same powder cheaper. Our job is to connect the Argentine manufacturer with the South African buyer, handle the paperwork and logistics, and take a margin in the middle." },
      { type: 'highlight', label: 'Our current focus', text: 'Argentina \u2192 South Africa. Products: Modified Starch and Full Cream Milk Powder.' },
    ]
  },
  {
    id: 'modified_starch',
    title: 'What is Modified Starch?',
    icon: '\u25a0',
    content: [
      { type: 'text', text: "Starch is a white powder found naturally in corn, wheat, potatoes and cassava. It is what makes gravy thick and gives sauces their body. Modified starch is starch that has been chemically or physically treated to make it more stable. It does not break down when heated, frozen, or mixed with acids." },
      { type: 'text', text: "You encounter modified starch every day without knowing it. It is in most supermarket sauces, soups, yoghurts, noodles, baby food, and even paper and cardboard. Food manufacturers buy it in bulk as a raw ingredient." },
      { type: 'chain', label: 'How it is made', steps: ['Corn (or cassava, wheat, potato)', 'Wet milling \u2192 extracts native starch', 'Chemical or heat treatment \u2192 modifies the starch', 'Drying \u2192 white powder', 'Bagged in 25kg or 1,000kg sacks \u2192 exported'] },
      { type: 'highlight', label: 'Why Argentina?', text: "Argentina is the world number 3 corn exporter. Corn is the cheapest raw material for starch. This is why Argentine modified starch costs $0.69/kg FOB while German starch costs $2.18/kg \u2014 same product, much cheaper raw material and labour." },
      { type: 'highlight', label: 'Who buys it in South Africa?', text: "Food manufacturers like Tiger Brands, RCL Foods, and Premier Foods. Also paper mills and textile factories. The total SA market is about 57,000 tonnes per year worth $65 million." },
    ]
  },
  {
    id: 'milk_powder',
    title: 'What is Full Cream Milk Powder?',
    icon: '\u25a1',
    content: [
      { type: 'text', text: "Full cream milk powder is exactly what it sounds like \u2014 fresh whole milk with almost all the water removed. You end up with a fine off-white powder that lasts 12 to 24 months without refrigeration. Add water and you get milk again." },
      { type: 'text', text: "It is used in chocolate manufacturing, baked goods, infant formula, ice cream, and anywhere fresh milk would spoil before it could be used. South Africa imports it because domestic milk production does not fully meet industrial demand." },
      { type: 'chain', label: 'How it is made', steps: ['Fresh cow milk collected from farms', 'Pasteurised and standardised', 'Evaporator removes most of the water', 'Spray dryer \u2192 fine powder', 'Packed in 25kg bags \u2192 exported'] },
      { type: 'highlight', label: 'Why Argentina and Uruguay?', text: "Both countries have massive dairy farming industries on the Pampas grasslands. Low land costs and grass-fed cattle make their milk powder among the cheapest in the world. New Zealand is the global benchmark but it is on the other side of the planet from South Africa." },
      { type: 'highlight', label: 'The opportunity', text: "Uruguay already sells milk powder to South Africa at $3.53/kg CIF. Argentina produces the same product at $3.61/kg FOB. The margin is tight \u2014 tariff rates need to be confirmed before this becomes a confirmed deal." },
    ]
  },
  {
    id: 'trade_terms',
    title: 'Trade terms explained simply',
    icon: '\u25ce',
    content: [
      { type: 'glossary', items: [
        { term: 'FOB (Free On Board)', def: "The price of the product loaded onto a ship at the origin port. Argentina FOB $0.69/kg means that is what you pay to get it on a ship in Buenos Aires. You still need to pay for the ship journey, insurance, and import duties on top." },
        { term: 'CIF (Cost, Insurance, Freight)', def: "The price of the product delivered to the destination port, including sea freight and insurance. Thailand CIF $0.92/kg to South Africa means Thailand can deliver it to Durban port for $0.92/kg all-in." },
        { term: 'Landed cost', def: "The total cost of getting a product into a buyer warehouse. FOB price plus sea freight plus insurance plus import tariff plus port handling plus local trucking. This is the number that matters when comparing suppliers." },
        { term: 'Metric tonne (MT)', def: "1,000 kilograms. A 20-foot shipping container holds about 25 MT of powder. The SA modified starch market is 57,000 MT per year \u2014 that is about 2,300 containers." },
        { term: 'HS Code', def: "A universal 6-digit number that identifies every traded product in the world. Modified starch is HS 350510. Full cream milk powder is HS 040221. Every country uses the same codes so customs officials anywhere can identify what is in a container." },
        { term: 'FCL (Full Container Load)', def: "You are renting an entire shipping container. A 20-foot FCL holds roughly 25 tonnes of product. It is cheaper per kg than sharing a container with other cargo." },
        { term: 'MOQ (Minimum Order Quantity)', def: "The smallest order a supplier will accept. Many food ingredient manufacturers will not sell less than one full container (25 MT). This is the first question to ask any supplier." },
        { term: 'MFN Tariff', def: "Most Favoured Nation rate \u2014 the standard import duty SA charges all countries. Argentina is NOT in the SACU-Mercosur preferential schedule for starch or dairy, so standard MFN rates apply. These need to be confirmed from the SARS tariff book." },
      ]}
    ]
  },
  {
    id: 'countries',
    title: 'Key countries and what they produce',
    icon: '\u25d0',
    content: [
      { type: 'country', name: 'Argentina', flag: 'AR', region: 'South America', role: 'Exporter',
        summary: "One of the great agricultural exporters. The Pampas region \u2014 a vast flat grassland \u2014 produces enormous quantities of corn, soybeans, wheat and sunflowers. Buenos Aires and Rosario are major export ports.",
        produces: ['Corn (3rd largest exporter)', 'Soybeans (3rd largest)', 'Wheat (7th largest)', 'Sunflower Oil (2nd largest)', 'Modified Starch', 'Milk Powder', 'Beef'],
        relevance: "Our primary sourcing country. Cheap raw materials plus established food processing industry equals competitive prices on processed ingredients." },
      { type: 'country', name: 'Uruguay', flag: 'UY', region: 'South America', role: 'Exporter',
        summary: "Small country between Argentina and Brazil. Highly developed dairy industry relative to its size. Already has trade relationships with South Africa.",
        produces: ['Full Cream Milk Powder (major exporter)', 'Beef', 'Wool', 'Soybeans'],
        relevance: "Uruguay Conaprole already sells milk powder to SA at $3.53/kg CIF. We need to match or beat this to win business." },
      { type: 'country', name: 'South Africa', flag: 'ZA', region: 'Southern Africa', role: 'Importer / Exporter',
        summary: "The most industrialised economy in Africa and our primary target market. Large food manufacturing sector that imports significant volumes of ingredients. Major ports at Durban, Cape Town and Port Elizabeth.",
        produces: ['Maize', 'Wine', 'Citrus', 'Sugar', 'Gold', 'Platinum'],
        relevance: "Our buyer market. SA food manufacturers import $65M of modified starch and $17M of milk powder per year \u2014 and currently buy none of it from Argentina." },
      { type: 'country', name: 'Brazil', flag: 'BR', region: 'South America', role: 'Exporter',
        summary: "Agricultural superpower. The largest coffee and soybean exporter in the world. Large starch and dairy industries. Our neighbour and sometimes competitor.",
        produces: ['Coffee (world number 1)', 'Soybeans (world number 1)', 'Sugar', 'Corn', 'Modified Starch', 'Beef'],
        relevance: "Brazil currently sells starch to SA at $1.25/kg. We can undercut them from Argentina at $0.80/kg landed." },
    ]
  },
  {
    id: 'signals',
    title: 'What are the Coffee and Wheat signals?',
    icon: '\u25c8',
    content: [
      { type: 'text', text: "The Signals tab shows whether our model thinks coffee and wheat prices are likely to go up (BUY) or down (SELL) in the near term. This matters because the commodities we trade are priced off these benchmarks." },
      { type: 'text', text: "The model looks at four things: what a statistical model predicts (Model A), whether the World Bank price forecast was too low or too high (Forecast Surprise), how anxious the public is about food prices based on Google search trends (Sentiment), and whether this time of year is historically good or bad for prices (Seasonal)." },
      { type: 'highlight', label: 'Current reading (May 2026)', text: "Coffee is a strong BUY (+1.85) \u2014 all signals aligned. Wheat is a fragile BUY (+0.61) \u2014 driven by sentiment only, with the model and seasonality both negative. Watch wheat carefully." },
      { type: 'highlight', label: 'Why does this matter for us?', text: "If coffee prices spike, export revenue from coffee-producing countries rises and it becomes harder to source cheaply. If wheat prices fall, competing modified starch producers who use wheat starch get cheaper raw materials and can undercut us." },
    ]
  },
];

function Chain({ steps }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0, margin: '12px 0' }}>
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div style={{ padding: '6px 12px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{step}</div>
          {i < steps.length - 1 && <div style={{ color: 'var(--gold-bright)', fontSize: 16, padding: '0 4px' }}>&#8594;</div>}
        </React.Fragment>
      ))}
    </div>
  );
}

function CountryCard({ c }) {
  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{c.name}</div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-hover)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 3 }}>{c.flag}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>{c.summary}</p>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Key exports</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {c.produces.map(p => (
            <span key={p} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-hover)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 3 }}>{p}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: '8px 12px', background: 'rgba(200,153,58,0.05)', border: '1px solid rgba(200,153,58,0.15)', borderRadius: 4, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--gold-bright)' }}>Why it matters: </strong>{c.relevance}
      </div>
    </div>
  );
}

function TopicContent({ blocks }) {
  return (
    <div style={{ padding: '20px 0' }}>
      {blocks.map((block, i) => {
        if (block.type === 'text') return (
          <p key={i} style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>{block.text}</p>
        );
        if (block.type === 'highlight') return (
          <div key={i} style={{ margin: '16px 0', padding: '12px 16px', background: 'rgba(200,153,58,0.06)', border: '1px solid rgba(200,153,58,0.2)', borderRadius: 6 }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--gold-bright)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{block.label}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{block.text}</div>
          </div>
        );
        if (block.type === 'chain') return (
          <div key={i} style={{ margin: '16px 0' }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{block.label}</div>
            <Chain steps={block.steps} />
          </div>
        );
        if (block.type === 'glossary') return (
          <div key={i}>
            {block.items.map(item => (
              <div key={item.term} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--gold-bright)', fontSize: 13, marginBottom: 6 }}>{item.term}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item.def}</div>
              </div>
            ))}
          </div>
        );
        if (block.type === 'country') return <CountryCard key={i} c={block} />;
        return null;
      })}
    </div>
  );
}

export default function Learn() {
  const [active, setActive] = useState('what_we_do');
  const topic = TOPICS.find(t => t.id === active);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, minHeight: '70vh' }}>
      <div>
        {TOPICS.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '11px 14px', marginBottom: 4, borderRadius: 6,
              background: active === t.id ? 'var(--bg-hover)' : 'none',
              border: active === t.id ? '1px solid var(--border-bright)' : '1px solid transparent',
              cursor: 'pointer', textAlign: 'left',
              color: active === t.id ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}>
            <span style={{ fontSize: 14 }}>{t.icon}</span>
            <span style={{ fontSize: 13, fontWeight: active === t.id ? 600 : 400 }}>{t.title}</span>
          </button>
        ))}
      </div>
      <div className="card" style={{ alignSelf: 'start' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 4 }}>{topic.title}</div>
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 12 }}>
          <TopicContent blocks={topic.content} />
        </div>
      </div>
    </div>
  );
}
