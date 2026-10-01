import React, { useEffect, useState, useCallback } from 'react';
import { MapPin, Compass, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useCurrentWell } from '../lib/wellContext';
import { getDashboardPermission } from '../lib/rbac';
import { Badge } from '../components/common/Badge';
import { LeafletWellMap } from '../components/gis/LeafletWellMap';
import { WellFilterBar } from '../components/gis/WellFilterBar';
import { NearbyWellListTable } from '../components/gis/NearbyWellListTable';
import { SelectedWellDrawer } from '../components/gis/SelectedWellDrawer';
import type { GisFilterState, GisResponse, GisWell } from '../types/gis';

export const GisMapDashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentWell } = useCurrentWell();
  const permLevel = getDashboardPermission(user?.roleCode, 'map');
  const isReadOnly = permLevel === 'VIEW';
  const roleCode = user?.roleCode || 'DRILLING_ENGINEER';

  // Determine role-based detail level
  const detailLevel: 'DETAILED' | 'CONTEXT' | 'SUMMARY' =
    roleCode === 'DRILLING_ENGINEER' || roleCode === 'GEOLOGIST'
      ? 'DETAILED'
      : roleCode === 'ERTMAC_OPERATOR'
      ? 'CONTEXT'
      : 'SUMMARY';

  // Filter State
  const [filters, setFilters] = useState<GisFilterState>({
    centerWellId: currentWell?.wellId || 'DUL_92',
    radiusKm: 100,
    field: '',
    formation: '',
    status: '',
    hazardType: '',
    minDepth: '',
    maxDepth: ''
  });

  // Data State
  const [data, setData] = useState<GisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWell, setSelectedWell] = useState<GisWell | null>(null);

  // Synchronize filter centerWellId if global currentWell changes
  useEffect(() => {
    if (currentWell?.wellId && currentWell.wellId !== filters.centerWellId) {
      setFilters(prev => ({ ...prev, centerWellId: currentWell.wellId }));
    }
  }, [currentWell?.wellId]);

  // Fetch GIS Nearby Wells Data from backend
  const fetchGisData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('center_well_id', filters.centerWellId);
      params.append('radius_km', filters.radiusKm.toString());
      if (filters.field) params.append('field', filters.field);
      if (filters.formation) params.append('formation', filters.formation);
      if (filters.status) params.append('status', filters.status);
      if (filters.hazardType) params.append('hazard_type', filters.hazardType);
      if (filters.minDepth) params.append('min_depth', filters.minDepth);
      if (filters.maxDepth) params.append('max_depth', filters.maxDepth);

      const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/gis/wells?${params.toString()}`);
      if (!resp.ok) {
        throw new Error(`GIS service returned HTTP error ${resp.status}`);
      }
      const json: GisResponse = await resp.json();
      setData(json);

      // Auto-select center well or first well if selectedWell is not in new list
      if (json.wells && json.wells.length > 0) {
        const centerObj = json.wells.find(w => w.is_current_well) || json.wells[0];
        setSelectedWell(centerObj);
      } else {
        setSelectedWell(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load GIS spatial nearby wells data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchGisData();
  }, [fetchGisData]);

  const handleFilterChange = (key: keyof GisFilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      centerWellId: currentWell?.wellId || 'DUL_92',
      radiusKm: 100,
      field: '',
      formation: '',
      status: '',
      hazardType: '',
      minDepth: '',
      maxDepth: ''
    });
  };

  const availableWellsList = data?.wells && data.wells.length > 0
    ? data.wells.map(w => ({ well_id: w.well_id, well_name: w.well_name }))
    : [
        { well_id: 'DUL_92', well_name: 'Duliajan-92' },
        { well_id: 'DUL_88', well_name: 'Duliajan-88' },
        { well_id: 'DUL_99', well_name: 'Duliajan-99' },
        { well_id: 'DUL_104', well_name: 'Duliajan-104' },
        { well_id: 'NHK_45', well_name: 'Naharkatiya-45' },
        { well_id: 'NHK_52', well_name: 'Naharkatiya-52' },
        { well_id: 'NHK_61', well_name: 'Naharkatiya-61' },
        { well_id: 'MOR_12', well_name: 'Moran-12' },
        { well_id: 'MOR_18', well_name: 'Moran-18' },
        { well_id: 'MOR_25', well_name: 'Moran-25' },
        { well_id: 'DIG_04', well_name: 'Digboi-04' },
        { well_id: 'DIG_11', well_name: 'Digboi-11' },
        { well_id: 'DIG_19', well_name: 'Digboi-19' },
        { well_id: 'RUD_08', well_name: 'Rudrasagar-08' },
        { well_id: 'RUD_15', well_name: 'Rudrasagar-15' },
        { well_id: 'RUD_22', well_name: 'Rudrasagar-22' },
        { well_id: '15_9-23', well_name: 'Regional-9-23' },
        { well_id: '16_2-7', well_name: 'Regional-2-7' },
        { well_id: '34_10_16', well_name: 'Regional-16' },
        { well_id: 'JOR_03', well_name: 'Jorhat-03' },
        { well_id: 'SIB_07', well_name: 'Sibsagar-07' }
      ];

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 border border-blue-300 text-blue-900 shadow-2xs">
              <MapPin size={22} className="text-blue-900" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Dashboard 2 — Nearby Wells / GIS
                </h1>
                <Badge variant={permLevel === 'FULL' ? 'full' : permLevel === 'USE' ? 'use' : 'view'}>
                  {permLevel} ACCESS
                </Badge>
              </div>
              <p className="text-sm text-slate-900 font-semibold mt-1 leading-snug">
                Geospatial mapping, offset well spatial proximity & basin geology intelligence
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs">
            <Compass size={14} className="text-blue-700" />
            <span className="text-slate-600">Active Global Well:</span>
            <span className="text-slate-900 font-extrabold">
              {currentWell ? currentWell.wellName : 'No active well'}
            </span>
          </div>

          <button
            onClick={fetchGisData}
            disabled={loading}
            className="p-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs transition-colors"
            title="Refresh GIS spatial data"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : 'text-slate-700'} />
          </button>
        </div>
      </div>

      {/* Read-Only Notice */}
      {isReadOnly && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-xs text-blue-950 font-semibold">
          <AlertCircle size={16} className="shrink-0 text-blue-700" />
          <span>
            <strong>Executive Read-Only View:</strong> Displaying high-level GIS spatial summary for <span className="font-extrabold underline">{user?.roleDisplayName}</span>. Spatial editing tools restricted.
          </span>
        </div>
      )}

      {/* Filters Control Bar */}
      <WellFilterBar
        filters={filters}
        onChangeFilter={handleFilterChange}
        onReset={handleResetFilters}
        availableWells={availableWellsList}
        availableFields={data?.available_fields || []}
        availableFormations={data?.available_formations || []}
        availableStatuses={data?.available_statuses || []}
        availableHazards={data?.available_hazard_types || []}
      />

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-950 flex items-center justify-between">
          <span>Nearby well GIS data could not be loaded: {error}</span>
          <button
            onClick={fetchGisData}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors shadow-2xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="py-20 text-center text-xs font-semibold text-slate-600 bg-white rounded-xl border border-slate-200 shadow-xs">
          Loading GIS spatial layers and nearby well coordinates...
        </div>
      )}

      {/* GIS Content Grid */}
      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Map Container */}
            <div className={`${selectedWell ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all`}>
              <LeafletWellMap
                centerWell={data.center_well}
                wells={data.wells}
                selectedWell={selectedWell}
                onSelectWell={(w) => setSelectedWell(w)}
                radiusKm={data.radius_km}
              />
            </div>

            {/* Selected Well Side Drawer */}
            {selectedWell && (
              <div className="lg:col-span-5">
                <SelectedWellDrawer
                  well={selectedWell}
                  onClose={() => setSelectedWell(null)}
                  roleCode={roleCode}
                />
              </div>
            )}
          </div>

          {/* Nearby Wells Table List */}
          <NearbyWellListTable
            wells={data.wells}
            selectedWell={selectedWell}
            onSelectWell={(w) => setSelectedWell(w)}
            roleCode={roleCode}
            detailLevel={detailLevel}
          />
        </div>
      )}
    </div>
  );
};

