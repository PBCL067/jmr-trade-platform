// Source: SARS Schedule 1 Part 1
// Update this file when SARS amends tariff rates
// Last updated: 2026-05-15

export const TARIFFS = {
  "source": "SARS Schedule 1 Part 1",
  "last_updated": "2026-05-15",
  "next_review": "Check sars.gov.za quarterly for amendments",
  "rates": {
    "350510": {
      "description": "Modified Starch",
      "general": "FREE",
      "sadc": "FREE",
      "mercosur": "FREE",
      "afcfta": "FREE",
      "eu": "FREE",
      "general_pct": 0,
      "mercosur_pct": 0,
      "unit": "ad_valorem",
      "confirmed": true,
      "notes": "FREE across all trading partners"
    },
    "040221": {
      "description": "Full Cream Milk Powder",
      "general": "450c/kg",
      "sadc": "FREE",
      "mercosur": "450c/kg",
      "afcfta": "180c/kg",
      "eu": "FREE",
      "general_zar_per_kg": 4.5,
      "mercosur_zar_per_kg": 4.5,
      "unit": "specific",
      "confirmed": true,
      "notes": "No MERCOSUR preference. SADC free. AfCFTA 180c/kg."
    },
    "151211": {
      "description": "Sunflower Oil (crude)",
      "general": "10%",
      "sadc": "FREE",
      "mercosur": "4%",
      "afcfta": "TBC",
      "eu": "FREE",
      "general_pct": 0.1,
      "mercosur_pct": 0.04,
      "unit": "ad_valorem",
      "confirmed": true,
      "notes": "MERCOSUR preferential rate 4% vs 10% MFN. Argentina/Brazil/Uruguay/Paraguay qualify."
    },
    "150790": {
      "description": "Soybean Oil",
      "general": "10%",
      "sadc": "FREE",
      "mercosur": "10%",
      "afcfta": "TBC",
      "eu": "FREE",
      "general_pct": 0.1,
      "mercosur_pct": 0.1,
      "unit": "ad_valorem",
      "confirmed": true,
      "notes": "No MERCOSUR preference. All origins pay 10% MFN."
    },
    "230400": {
      "description": "Soybean Meal",
      "general": "6.6%",
      "sadc": "FREE",
      "mercosur": "2.64%",
      "afcfta": "TBC",
      "eu": "FREE",
      "general_pct": 0.066,
      "mercosur_pct": 0.0264,
      "unit": "ad_valorem",
      "confirmed": true,
      "notes": "MERCOSUR preferential 2.64% vs 6.6% MFN. Argentina/Brazil qualify."
    },
    "100590": {
      "description": "Corn (Maize)",
      "general": "FREE",
      "sadc": "FREE",
      "mercosur": "FREE",
      "afcfta": "FREE",
      "eu": "FREE",
      "general_pct": 0,
      "mercosur_pct": 0,
      "unit": "ad_valorem",
      "confirmed": true,
      "notes": "FREE across all trading partners"
    },
    "120190": {
      "description": "Soybeans",
      "general": "FREE",
      "sadc": "FREE",
      "mercosur": "FREE",
      "afcfta": "FREE",
      "eu": "FREE",
      "general_pct": 0,
      "mercosur_pct": 0,
      "unit": "ad_valorem",
      "confirmed": true,
      "notes": "FREE across all trading partners"
    },
    "120600": {
      "description": "Peanuts / Sunflower Seeds",
      "general": "TBC",
      "sadc": "TBC",
      "mercosur": "TBC",
      "afcfta": "TBC",
      "eu": "TBC",
      "general_pct": null,
      "mercosur_pct": null,
      "unit": "ad_valorem",
      "confirmed": false,
      "notes": "Not yet confirmed from SARS Schedule 1. Check HS 1202.42 for peanuts."
    }
  }
};

// Helper: get tariff rate for a supplier (MERCOSUR countries get preferential rate)
export const MERCOSUR_COUNTRIES = ['Argentina', 'Brazil', 'Uruguay', 'Paraguay'];

export function getTariffUsd(hsCode, supplierName, zarUsd) {
  const t = TARIFFS.rates[hsCode];
  if (!t) return { rate: 0, label: 'Unknown', confirmed: false };
  const isMercosur = MERCOSUR_COUNTRIES.includes(supplierName);
  if (t.unit === 'specific') {
    const zarPerKg = isMercosur ? (t.mercosur_zar_per_kg || t.general_zar_per_kg) : t.general_zar_per_kg;
    return { rate: zarPerKg / zarUsd, label: isMercosur ? t.mercosur : t.general, confirmed: t.confirmed };
  }
  const pct = isMercosur ? (t.mercosur_pct ?? t.general_pct) : t.general_pct;
  return { rate: pct, label: isMercosur ? t.mercosur : t.general, confirmed: t.confirmed, isPct: true };
}
