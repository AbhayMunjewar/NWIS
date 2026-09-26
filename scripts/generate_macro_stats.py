import csv
import os

# Define output path
output_path = r"c:\drill_well\indian_well_statistics.csv"

# 7 Major OIL Fields in Upper Assam Shelf Basin
fields_config = {
    "Duliajan Field": {"base_exp": 12, "base_dev": 25, "depth": 3480, "npt_base": 4.2},
    "Moran Field": {"base_exp": 8, "base_dev": 16, "depth": 3390, "npt_base": 4.0},
    "Naharkatiya Field": {"base_exp": 10, "base_dev": 20, "depth": 3460, "npt_base": 4.1},
    "Digboi Field": {"base_exp": 3, "base_dev": 8, "depth": 3150, "npt_base": 2.8},
    "Rudrasagar Field": {"base_exp": 5, "base_dev": 11, "depth": 3320, "npt_base": 3.9},
    "Sibsagar Field": {"base_exp": 4, "base_dev": 9, "depth": 3280, "npt_base": 3.6},
    "Jorhat Field": {"base_exp": 3, "base_dev": 6, "depth": 3200, "npt_base": 3.5}
}

fiscal_years = [
    "2010-11", "2011-12", "2012-13", "2013-14", "2014-15",
    "2015-16", "2016-17", "2017-18", "2018-19", "2019-20",
    "2020-21", "2021-22", "2022-23", "2023-24", "2024-25"
]

header = [
    "fiscal_year", "basin", "field", "exploratory_drilled", "dev_drilled",
    "producing_wells", "dry_wells", "avg_depth_m", "total_metres",
    "avg_npt_days", "npt_cost_loss_lakhs"
]

rows = []

# Deterministic variations across years for realistic trends
year_multipliers = {
    "2010-11": 0.82, "2011-12": 0.85, "2012-13": 0.88, "2013-14": 0.90, "2014-15": 0.95,
    "2015-16": 0.92, "2016-17": 0.94, "2017-18": 0.98, "2018-19": 1.00, "2019-20": 1.05,
    "2020-21": 0.75, # COVID impact year
    "2021-22": 1.10, "2022-23": 1.15, "2023-24": 1.20, "2024-25": 1.25
}

for year in fiscal_years:
    mult = year_multipliers[year]
    for field_name, cfg in fields_config.items():
        exp = int(round(cfg["base_exp"] * mult))
        dev = int(round(cfg["base_dev"] * mult))
        total_wells = exp + dev
        
        # ~82-88% success rate
        dry = max(1, int(round(total_wells * 0.14)))
        producing = total_wells - dry
        
        # Depth slight annual increase (deeper targets over time)
        year_idx = fiscal_years.index(year)
        avg_depth = cfg["depth"] + (year_idx * 8)
        total_metres = total_wells * avg_depth
        
        # NPT improves slightly over time due to better tech
        npt_days = round(max(2.0, cfg["npt_base"] - (year_idx * 0.08)), 1)
        
        # Average rig rate in India ~22 Lakhs INR per day
        npt_cost = int(round(total_wells * npt_days * 22.5))
        
        rows.append([
            year,
            "Upper Assam Shelf",
            field_name,
            exp,
            dev,
            producing,
            dry,
            avg_depth,
            total_metres,
            npt_days,
            npt_cost
        ])

# Ensure scripts directory exists
os.makedirs(r"c:\drill_well\scripts", exist_ok=True)

with open(output_path, mode="w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(header)
    writer.writerows(rows)

print(f"Successfully generated {len(rows)} rows of Assam basin statistics in {output_path}")
