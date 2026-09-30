import os
import pandas as pd
from fastapi import APIRouter
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class WellSummary(BaseModel):
    well_id: str
    well_name: str
    field_name: str
    target_formation: str
    status: str
    data_status: str

PROCESSED_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "data", "processed"))

@router.get("", response_model=List[WellSummary])
def list_available_wells():
    path_wells = os.path.join(PROCESSED_DIR, "wells_master.csv")
    path_form = os.path.join(PROCESSED_DIR, "formations.csv")
    
    form_map = {}
    if os.path.exists(path_form):
        try:
            df_f = pd.read_csv(path_form)
            for _, r in df_f.iterrows():
                w_clean = str(r.get("well_id", "")).replace("-", "_").upper()
                if w_clean not in form_map:
                    form_map[w_clean] = str(r.get("formation_name", "Barail Group Sandstone"))
        except Exception:
            pass

    wells = []
    if os.path.exists(path_wells):
        try:
            df_w = pd.read_csv(path_wells)
            for _, r in df_w.iterrows():
                w_id = str(r.get("well_id", ""))
                w_clean = w_id.replace("-", "_").upper()
                w_name = str(r.get("well_name", f"Well {w_id}"))
                f_name = str(r.get("field", "Assam Field"))
                status = str(r.get("status", "Producing"))
                t_form = form_map.get(w_clean, "Barail Group Sandstone")

                wells.append({
                    "well_id": w_id.replace("-", "_"),
                    "well_name": f"{w_name} ({w_id.replace('_', '-')})",
                    "field_name": f_name,
                    "target_formation": t_form,
                    "status": status,
                    "data_status": "OIL_AUTHORIZED"
                })
        except Exception as e:
            print(f"Error loading wells_master.csv: {e}")

    if not wells:
        wells = [
            {"well_id": "DUL_92", "well_name": "Duliajan-92 (DUL-92)", "field_name": "Duliajan Field", "target_formation": "Barail Group Sandstone", "status": "Producing", "data_status": "OIL_AUTHORIZED"},
            {"well_id": "DUL_88", "well_name": "Duliajan-88 (DUL-88)", "field_name": "Duliajan Field", "target_formation": "Kopili Shale Transition", "status": "Producing", "data_status": "OIL_AUTHORIZED"},
            {"well_id": "DUL_99", "well_name": "Duliajan-99 (DUL-99)", "field_name": "Duliajan Field", "target_formation": "Sylhet Karst Limestone", "status": "Producing", "data_status": "OIL_AUTHORIZED"},
            {"well_id": "DUL_104", "well_name": "Duliajan-104 (DUL-104)", "field_name": "Duliajan Field", "target_formation": "Upper Barail Shale", "status": "Producing", "data_status": "OIL_AUTHORIZED"}
        ]

    return wells

