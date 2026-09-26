import os
import csv
import pandas as pd

dataset_dir = r"c:\drill_well\dataset 1"
well_master_path = r"c:\drill_well\well_master.csv"
incidents_path = r"c:\drill_well\drilling_incidents.csv"

# 1. Build well_master.csv from the 21 well CSV files
well_records = []
field_mapping = {
    "DUL": "Duliajan Field",
    "MOR": "Moran Field",
    "NHK": "Naharkatiya Field",
    "DIG": "Digboi Field",
    "RUD": "Rudrasagar Field",
    "SIB": "Sibsagar Field",
    "JOR": "Jorhat Field"
}

files = [f for f in os.listdir(dataset_dir) if f.endswith(".csv")]

for f in sorted(files):
    filepath = os.path.join(dataset_dir, f)
    df = pd.read_csv(filepath)
    
    well_id = f.replace("_well.csv", "").replace("_R", "")
    prefix = well_id.split("_")[0]
    field_name = field_mapping.get(prefix, "Regional Assam Offset")
    
    start_lat = round(df["Y_LOC"].iloc[0], 4)
    start_long = round(df["X_LOC"].iloc[0], 4)
    max_depth = round(df["DEPTH_MD"].max(), 1)
    
    well_records.append([
        well_id,
        f"{field_name.split()[0]}-{well_id.split('_')[-1]}",
        field_name,
        "Upper Assam Shelf",
        start_lat,
        start_long,
        max_depth,
        "Producing" if "R" not in f else "Offset Reference",
        "2021-04-15",
        "2021-08-20"
    ])

master_header = [
    "well_id", "well_name", "field", "basin", "latitude", "longitude",
    "target_depth_m", "status", "spud_date", "completion_date"
]

with open(well_master_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(master_header)
    writer.writerows(well_records)

print(f"Successfully generated {len(well_records)} well master records in {well_master_path}")

# 2. Build drilling_incidents.csv
incidents_data = [
    ["INC-DUL92-01", "DUL_92", "Duliajan Field", "Barail Group", 2210.0, "Stuck Pipe", "High", 36.5, 4560000, "Reactive Smectite/Illite shale expansion due to low mud weight (1.16 g/cc)", "50 bbl Glycol Spotting Pill, 4-hr soak time, mud weight raised to 1.25 g/cc"],
    ["INC-DUL88-01", "DUL_88", "Duliajan Field", "Kopili Formation", 2842.0, "Gas Kick", "Critical", 22.0, 3200000, "High pressure gas influx (SICP 350 psi, SIDPP 240 psi) in overpressured Kopili zone", "Shut-in well, API Barite weighting up to 1.36 g/cc EMW via Wait & Weight method"],
    ["INC-DUL99-01", "DUL_99", "Duliajan Field", "Sylhet Limestone", 3210.0, "Mud Loss", "Critical", 44.0, 5800000, "100% total fluid loss into karst fracture network in Sylhet limestone", "Annular top-up, 60 bbl Coarse LCM pill (Nut Plug + Mica), Class-G cement squeeze"],
    ["INC-MOR12-01", "MOR_12", "Moran Field", "Barail Group", 2185.0, "High Torque", "Medium", 14.0, 1800000, "Rotational torque elevation to 24 kN.m due to tight hole in reactive claystone", "High vis sweep, 3% Glycol addition, back-reaming 2,150m to 2,185m"],
    ["INC-NHK45-01", "NHK_45", "Naharkatiya Field", "Kopili Formation", 2790.0, "Gas Influx", "Medium", 18.5, 2400000, "Connection gas spike to 1,800 units during pipe connection at Kopili top", "Increased mud weight from 1.22 to 1.28 g/cc EMW, circulated bottoms-up"]
]

incidents_header = [
    "incident_id", "well_id", "field", "formation", "depth_m", "hazard_type",
    "severity", "npt_hours", "cost_loss_inr", "root_cause", "mitigation_applied"
]

with open(incidents_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(incidents_header)
    writer.writerows(incidents_data)

print(f"Successfully generated {len(incidents_data)} incident records in {incidents_path}")
