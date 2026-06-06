import os, requests, zipfile, pandas as pd
from datetime import date, datetime
from dateutil.relativedelta import relativedelta

# ============================================================
# JMR GLOBAL - MONTHLY SARS TRADE DATA UPDATER
# Run on the 1st of each month to pull latest SARS bilateral
# trade data and flag significant changes vs prior period.
# ============================================================

BASE_URL = "https://www.sars.gov.za/wp-content/uploads/Docs/TradeStats/2026TradeStats/"
OUTPUT_DIR = r"C:\Users\mcall\JMR Global\commodity_research\trade_data_sars"
EXTRACT_DIR = os.path.join(OUTPUT_DIR, "extracted")

SECTIONS = {
    1: 'Live Animals (Dairy/MPC)',
    2: 'Vegetables (Starches)',
    3: 'Animal/Veg Fats (Oils)',
    4: 'Prepared Foodstuffs (Modified Starch)',
    6: 'Chemicals (Lecithin)',
}
MERCOSUR = ['Argentina', 'Brazil', 'Uruguay', 'Paraguay']

def get_latest_sars_url():
    """Build the URL for the current year's bilateral trade file."""
    year = date.today().year
    filename = f"Cumulative-Bilateral-Trade-by-Country-{year}.zip"
    return f"https://www.sars.gov.za/wp-content/uploads/Docs/TradeStats/2026TradeStats/{filename}", year

def download_latest(url, year):
    """Download the latest SARS ZIP file."""
    local_path = os.path.join(OUTPUT_DIR, f"Cumulative-Bilateral-Trade-by-Country-{year}-latest.zip")
    print(f"Downloading {url}...")
    r = requests.get(url, timeout=30)
    if r.status_code == 200:
        with open(local_path, 'wb') as f:
            f.write(r.content)
        print(f"Downloaded: {len(r.content)/1024:.0f} KB")
        return local_path
    else:
        print(f"Failed: HTTP {r.status_code}")
        return None

def extract_and_parse(zip_path, year):
    """Extract ZIP and parse the Excel file."""
    out_dir = os.path.join(EXTRACT_DIR, str(year) + "_latest")
    os.makedirs(out_dir, exist_ok=True)
    with zipfile.ZipFile(zip_path) as z:
        z.extractall(out_dir)
        fname = z.namelist()[0]
    
    xlsx_path = os.path.join(out_dir, fname)
    xl = pd.ExcelFile(xlsx_path)
    sheet = [s for s in xl.sheet_names if 'America' in s][0]
    df = pd.read_excel(xlsx_path, sheet_name=sheet, header=None)
    
    # Find imports block
    region_rows = df[df.iloc[:,0] == df.iloc[1,0]].index.tolist()
    import_start = region_rows[1]
    imports = df.iloc[import_start:].copy()
    imports.columns = df.iloc[import_start + 1].values
    imports = imports.iloc[2:].reset_index(drop=True)
    
    results = []
    for sec_num, sec_name in SECTIONS.items():
        row = imports[imports.iloc[:,0] == sec_num]
        if row.empty:
            continue
        for country in MERCOSUR:
            cols = [c for c in imports.columns if str(c) == country]
            if cols:
                val = row.iloc[0][cols[0]]
                if pd.notna(val) and val > 0:
                    results.append({
                        'year': year,
                        'pulled_date': str(date.today()),
                        'section': sec_num,
                        'section_name': sec_name,
                        'country': country,
                        'value_zar': val,
                    })
    return pd.DataFrame(results)

def compare_vs_prior(df_new, year):
    """Compare new data vs last saved version."""
    prior_path = os.path.join(OUTPUT_DIR, "mercosur_sa_imports_summary.csv")
    if not os.path.exists(prior_path):
        print("No prior data found - saving as baseline.")
        return
    
    df_prior = pd.read_csv(prior_path)
    df_prior_year = df_prior[df_prior['year'] == year]
    
    print(f"\n{'='*65}")
    print(f"CHANGES VS PRIOR PULL - {year} YTD")
    print(f"{'='*65}")
    
    alerts = []
    for sec_num, sec_name in SECTIONS.items():
        new_val = df_new[df_new['section'] == sec_num]['value_zar'].sum()
        old_val = df_prior_year[df_prior_year['section'] == sec_num]['value_zar'].sum()
        
        if old_val > 0:
            change_pct = (new_val - old_val) / old_val * 100
            flag = "🟢" if change_pct > 10 else "🔴" if change_pct < -10 else "⚪"
            print(f"{flag} Section {sec_num} ({sec_name[:30]})")
            print(f"   Prior: R{old_val/1e6:.1f}M → New: R{new_val/1e6:.1f}M ({change_pct:+.1f}%)")
            if abs(change_pct) > 15:
                alerts.append(f"ALERT: {sec_name} changed {change_pct:+.1f}%")
    
    if alerts:
        print(f"\n{'='*65}")
        print("SIGNIFICANT CHANGES TO REVIEW:")
        for a in alerts:
            print(f"  ⚠ {a}")
    else:
        print("\nNo significant changes (>15%) detected.")

def save_updated(df_new):
    """Append new data to the master CSV."""
    master_path = os.path.join(OUTPUT_DIR, "mercosur_sa_imports_2023_2026.csv")
    if os.path.exists(master_path):
        df_master = pd.read_csv(master_path)
        # Remove existing entries for this year's latest pull
        df_master = df_master[df_master['year'] != df_new['year'].iloc[0]]
        df_master = pd.concat([df_master, df_new], ignore_index=True)
    else:
        df_master = df_new
    df_master.to_csv(master_path, index=False)
    
    # Also update summary
    df_new['value_zar_bn'] = (df_new['value_zar'] / 1e9).round(3)
    df_new['note'] = 'YTD latest'
    df_new.to_csv(os.path.join(OUTPUT_DIR, "mercosur_sa_imports_summary.csv"), index=False)
    print(f"\nData saved to: {OUTPUT_DIR}")

# ============================================================
# MAIN
# ============================================================
print(f"JMR GLOBAL - SARS MONTHLY UPDATER")
print(f"Run date: {date.today()}")
print(f"{'='*65}")

url, year = get_latest_sars_url()
zip_path = download_latest(url, year)

if zip_path:
    df_new = extract_and_parse(zip_path, year)
    print(f"\nParsed {len(df_new)} data points for {year}")
    
    print(f"\nCURRENT YTD TOTALS ({year})")
    print(f"{'─'*65}")
    for sec_num, sec_name in SECTIONS.items():
        val = df_new[df_new['section'] == sec_num]['value_zar'].sum()
        if val > 0:
            print(f"  Section {sec_num} ({sec_name[:35]:<35}) R{val/1e6:>8.1f}M")
    
    compare_vs_prior(df_new, year)
    save_updated(df_new)
    
    print(f"\n{'='*65}")
    print("Done. Run this script on the 1st of each month.")
    print(f"Next run: {(date.today() + relativedelta(months=1)).replace(day=1)}")