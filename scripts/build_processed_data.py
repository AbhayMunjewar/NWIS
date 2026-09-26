import os
import glob
import math
import csv
import pandas as pd
import numpy as np

root = r"c:\drill_well"
processed_dir = os.path.join(root, "data", "processed")
dataset1_dir = os.path.join(root, "dataset 1")

os.makedirs(processed_dir, exist_ok=True)

print("Starting Data Processing Pipeline...")

# ==============================================================================
# 1. data/processed/formations.csv
# ==============================================================================
print("\n1. Generating data/processed/formations.csv ...")
formation_rows = []

well_csvs = sorted(glob.glob(os.path.join(dataset1_dir, "*.csv")))

for filepath in well_csvs:
    filename = os.path.basename(filepath)
    df = pd.read_csv(filepath)
    well_id = filename.replace("_well.csv", "").replace("_R", "")
    
    # Identify continuous blocks of formation
    df["formation_block"] = (df["ASSAM_FORMATION"] != df["ASSAM_FORMATION"].shift()).cumsum()
    
    grouped = df.groupby(["formation_block", "ASSAM_FORMATION"])
    
    for (block_id, form_name), group in grouped:
        top_d = round(group["DEPTH_MD"].min(), 2)
        bot_d = round(group["DEPTH_MD"].max(), 2)
        
        # Most common lithology in this interval
        lith = group["FORCE_2020_LITHOFACIES_LITHOLOGY"].mode()[0] if not group["FORCE_2020_LITHOFACIES_LITHOLOGY"].empty else "Unknown"
        
        formation_rows.append({
            "well_id": well_id,
            "formation_name": form_name,
            "top_depth": top_d,
            "bottom_depth": bot_d,
            "lithology": lith,
            "data_status": "DERIVED"
        })

df_formations = pd.DataFrame(formation_rows)
df_formations.drop_duplicates(subset=["well_id", "formation_name", "top_depth", "bottom_depth"], inplace=True)
form_out_path = os.path.join(processed_dir, "formations.csv")
df_formations.to_csv(form_out_path, index=False)
print(f"Created {form_out_path} ({len(df_formations)} rows, {df_formations['well_id'].nunique()} unique wells)")

# ==============================================================================
# 2. data/processed/well_trajectory.csv
# ==============================================================================
print("\n2. Generating data/processed/well_trajectory.csv ...")
traj_rows = []

for filepath in well_csvs:
    filename = os.path.basename(filepath)
    df = pd.read_csv(filepath)
    well_id = filename.replace("_well.csv", "").replace("_R", "")
    
    md_vals = df["DEPTH_MD"].values
    x_vals = df["X_LOC"].values
    y_vals = df["Y_LOC"].values
    z_vals = df["Z_LOC"].values
    tvd_vals = np.abs(z_vals)
    
    n_pts = len(df)
    inc_vals = np.zeros(n_pts)
    az_vals = np.zeros(n_pts)
    
    # Calculate inclination and azimuth between sequential points
    for i in range(1, n_pts):
        dmd = md_vals[i] - md_vals[i-1]
        dtvd = tvd_vals[i] - tvd_vals[i-1]
        dx = x_vals[i] - x_vals[i-1]
        dy = y_vals[i] - y_vals[i-1]
        
        if dmd > 0:
            # Inclination angle with vertical
            cos_inc = max(-1.0, min(1.0, dtvd / dmd))
            inc_vals[i] = round(math.degrees(math.acos(cos_inc)), 2)
            
            # Azimuth angle from North
            if dx != 0 or dy != 0:
                az_vals[i] = round(math.degrees(math.atan2(dx, dy)) % 360.0, 2)
            else:
                az_vals[i] = az_vals[i-1]
        else:
            inc_vals[i] = inc_vals[i-1]
            az_vals[i] = az_vals[i-1]
            
    for i in range(n_pts):
        traj_rows.append({
            "well_id": well_id,
            "MD": round(md_vals[i], 2),
            "X": round(x_vals[i], 6),
            "Y": round(y_vals[i], 6),
            "Z": round(z_vals[i], 2),
            "TVD": round(tvd_vals[i], 2),
            "inclination": inc_vals[i],
            "azimuth": az_vals[i],
            "data_status": "DERIVED"
        })

df_traj = pd.DataFrame(traj_rows)
df_traj.drop_duplicates(subset=["well_id", "MD"], inplace=True)
traj_out_path = os.path.join(processed_dir, "well_trajectory.csv")
df_traj.to_csv(traj_out_path, index=False)
print(f"Created {traj_out_path} ({len(df_traj)} rows, {df_traj['well_id'].nunique()} unique wells)")

# ==============================================================================
# 3. data/processed/casing_records.csv
# ==============================================================================
print("\n3. Generating data/processed/casing_records.csv ...")
casing_rows = [
    # Extracted from 01_DUL92_Stuck_Pipe_Complete.pdf
    {"well_id": "DUL_92", "casing_size": "20 in", "setting_depth": 80.0, "grade": None, "weight": None, "shoe_depth": 80.0, "source_document": "01_DUL92_Stuck_Pipe_Complete.pdf", "data_status": "SOURCE_EXTRACTED"},
    {"well_id": "DUL_92", "casing_size": "13-3/8 in", "setting_depth": 800.0, "grade": None, "weight": None, "shoe_depth": 800.0, "source_document": "01_DUL92_Stuck_Pipe_Complete.pdf", "data_status": "SOURCE_EXTRACTED"},
    {"well_id": "DUL_92", "casing_size": "9-5/8 in", "setting_depth": 1800.0, "grade": None, "weight": None, "shoe_depth": 1800.0, "source_document": "01_DUL92_Stuck_Pipe_Complete.pdf", "data_status": "SOURCE_EXTRACTED"},
    {"well_id": "DUL_92", "casing_size": "7 in Liner", "setting_depth": 3520.0, "grade": None, "weight": None, "shoe_depth": 3520.0, "source_document": "01_DUL92_Stuck_Pipe_Complete.pdf", "data_status": "SOURCE_EXTRACTED"},
    
    # Extracted from 02_DUL88_Gas_Kick_Complete.pdf
    {"well_id": "DUL_88", "casing_size": "8.5 in Hole", "setting_depth": 2842.0, "grade": None, "weight": None, "shoe_depth": 2842.0, "source_document": "02_DUL88_Gas_Kick_Complete.pdf", "data_status": "SOURCE_EXTRACTED"},
    
    # Extracted from 03_DUL99_Lost_Circulation_Complete.pdf
    {"well_id": "DUL_99", "casing_size": "8.5 in Hole", "setting_depth": 3210.0, "grade": None, "weight": None, "shoe_depth": 3210.0, "source_document": "03_DUL99_Lost_Circulation_Complete.pdf", "data_status": "SOURCE_EXTRACTED"},
    
    # Extracted from 04_DUL104_Current_Drilling_Complete.pdf
    {"well_id": "DUL_104", "casing_size": "12.25 in Hole", "setting_depth": 2120.0, "grade": None, "weight": None, "shoe_depth": 2120.0, "source_document": "04_DUL104_Current_Drilling_Complete.pdf", "data_status": "SOURCE_EXTRACTED"}
]

df_casing = pd.DataFrame(casing_rows)
casing_out_path = os.path.join(processed_dir, "casing_records.csv")
df_casing.to_csv(casing_out_path, index=False)
print(f"Created {casing_out_path} ({len(df_casing)} rows, {df_casing['well_id'].nunique()} unique wells)")

# ==============================================================================
# 4. data/processed/cementing_records.csv
# ==============================================================================
print("\n4. Generating data/processed/cementing_records.csv ...")
cementing_rows = [
    {
        "well_id": "DUL_99",
        "job_id": "CEM-DUL99-01",
        "depth": 3210.0,
        "cement_type": "Class-G Thixotropic Cement Plug",
        "cement_volume": "35 bbl",
        "pressure": None,
        "result": "Success - Returns Restored",
        "job_date": "2023-01-15",
        "remarks": "Placed 35 bbl Class-G cement plug across 3200m-3210m interval for total loss in Sylhet limestone. 12-hr set time.",
        "source_document": "03_DUL99_Lost_Circulation_Complete.pdf",
        "data_status": "SOURCE_EXTRACTED"
    },
    {
        "well_id": "DUL_92",
        "job_id": "CEM-DUL92-01",
        "depth": 1800.0,
        "cement_type": "Class-G Cement Slurry",
        "cement_volume": "65 bbl",
        "pressure": None,
        "result": "Success - Shoe Cementing Completed",
        "job_date": "2022-11-10",
        "remarks": "Cemented 9-5/8 in casing shoe across Barail group top at 1800m.",
        "source_document": "01_DUL92_Stuck_Pipe_Complete.pdf",
        "data_status": "SOURCE_EXTRACTED"
    }
]

df_cementing = pd.DataFrame(cementing_rows)
cementing_out_path = os.path.join(processed_dir, "cementing_records.csv")
df_cementing.to_csv(cementing_out_path, index=False)
print(f"Created {cementing_out_path} ({len(df_cementing)} rows, {df_cementing['well_id'].nunique()} unique wells)")

# ==============================================================================
# 5. data/processed/mud_program.csv
# ==============================================================================
print("\n5. Generating data/processed/mud_program.csv ...")
mud_rows = [
    {
        "well_id": "DUL_92",
        "depth": 2210.0,
        "mud_weight": 1.16,
        "viscosity": None,
        "fluid_type": "Water-Based Mud / KCl Glycol",
        "fluid_density": 1.16,
        "loss_control_material": "50 bbl Poly-Glycol Spotting Pill",
        "remarks": "Poly-glycol spotting pill pumped to dehydrate swollen Barail shales during stuck pipe event.",
        "source_document": "01_DUL92_Stuck_Pipe_Complete.pdf",
        "data_status": "SOURCE_EXTRACTED"
    },
    {
        "well_id": "DUL_88",
        "depth": 2842.0,
        "mud_weight": 1.36,
        "viscosity": None,
        "fluid_type": "Polymer Water-Based Mud",
        "fluid_density": 1.36,
        "loss_control_material": "API Barite Weighting Agent",
        "remarks": "Barite added to weight up mud from 1.24 g/cc to 1.36 g/cc EMW for Kopili gas kick kill.",
        "source_document": "02_DUL88_Gas_Kick_Complete.pdf",
        "data_status": "SOURCE_EXTRACTED"
    },
    {
        "well_id": "DUL_99",
        "depth": 3210.0,
        "mud_weight": 1.32,
        "viscosity": None,
        "fluid_type": "Water-Based Mud",
        "fluid_density": 1.32,
        "loss_control_material": "60 bbl LCM pill (Nut Plug / Mica / CaCO3)",
        "remarks": "Coarse LCM pill pumped for total lost circulation in Sylhet karst limestone.",
        "source_document": "03_DUL99_Lost_Circulation_Complete.pdf",
        "data_status": "SOURCE_EXTRACTED"
    },
    {
        "well_id": "DUL_104",
        "depth": 2205.0,
        "mud_weight": 1.20,
        "viscosity": None,
        "fluid_type": "Polymer Water-Based Mud",
        "fluid_density": 1.20,
        "loss_control_material": "25 bbl High-vis sweep / 2% Poly-Glycol",
        "remarks": "Mud conditioned with 2% Poly-Glycol for reactive shale torque warning.",
        "source_document": "04_DUL104_Current_Drilling_Complete.pdf",
        "data_status": "SOURCE_EXTRACTED"
    }
]

# Add mud weight interval summaries from dataset 1/*.csv
for filepath in well_csvs:
    filename = os.path.basename(filepath)
    df = pd.read_csv(filepath)
    well_id = filename.replace("_well.csv", "").replace("_R", "")
    
    # Sample every 500m depth interval for mud weight profile
    df["depth_bin"] = (df["DEPTH_MD"] // 500) * 500
    grouped_mud = df.groupby("depth_bin")
    
    for bin_d, group in grouped_mud:
        avg_mw = round(group["MUDWEIGHT"].mean(), 2)
        mid_d = round(group["DEPTH_MD"].mean(), 1)
        form_name = group["ASSAM_FORMATION"].mode()[0] if not group["ASSAM_FORMATION"].empty else "Unknown"
        
        mud_rows.append({
            "well_id": well_id,
            "depth": mid_d,
            "mud_weight": avg_mw,
            "viscosity": None,
            "fluid_type": "Water-Based Mud",
            "fluid_density": avg_mw,
            "loss_control_material": None,
            "remarks": f"Sampled log mud weight for {form_name}",
            "source_document": filename,
            "data_status": "SOURCE_EXTRACTED"
        })

df_mud = pd.DataFrame(mud_rows)
df_mud.drop_duplicates(subset=["well_id", "depth"], inplace=True)
mud_out_path = os.path.join(processed_dir, "mud_program.csv")
df_mud.to_csv(mud_out_path, index=False)
print(f"Created {mud_out_path} ({len(df_mud)} rows, {df_mud['well_id'].nunique()} unique wells)")

# ==============================================================================
# 6. data/processed/current_well_stream.csv
# ==============================================================================
print("\n6. Generating data/processed/current_well_stream.csv ...")
syn_stream_path = os.path.join(root, "NWIS_synthetic_sensor_timeseries.csv")

if os.path.exists(syn_stream_path):
    df_syn = pd.read_csv(syn_stream_path)
    
    df_stream = pd.DataFrame()
    df_stream["timestamp"] = df_syn["timestamp"]
    df_stream["well_id"] = df_syn["well_id"]
    df_stream["depth"] = df_syn["depth_m"]
    df_stream["ROP"] = df_syn["rop_m_hr"]
    df_stream["WOB"] = df_syn["wob_kN"]
    df_stream["torque"] = df_syn["torque_kNm"]
    df_stream["RPM"] = df_syn["rpm"]
    df_stream["SPP"] = df_syn["standpipe_pressure_psi"]
    df_stream["flow_rate"] = df_syn["flow_in_lpm"]
    df_stream["hookload"] = None  # Parameter not present in source, left NULL
    df_stream["source_file"] = "NWIS_synthetic_sensor_timeseries.csv"
    df_stream["data_status"] = "SYNTHETIC"
    
    stream_out_path = os.path.join(processed_dir, "current_well_stream.csv")
    df_stream.to_csv(stream_out_path, index=False)
    print(f"Created {stream_out_path} ({len(df_stream)} rows, {df_stream['well_id'].nunique()} unique wells)")

print("\nData processing complete!")
