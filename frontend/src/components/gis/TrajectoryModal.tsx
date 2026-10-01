import React, { useEffect, useState, useRef } from 'react';
import { X, Navigation, AlertCircle, RotateCcw, ZoomIn, ZoomOut, Compass, Table, Box } from 'lucide-react';
import type { TrajectoryResponse } from '../../types/gis';

interface TrajectoryModalProps {
  wellId: string | null;
  wellName: string | null;
  onClose: () => void;
}

export const TrajectoryModal: React.FC<TrajectoryModalProps> = ({
  wellId,
  wellName,
  onClose
}) => {
  const [data, setData] = useState<TrajectoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'3D' | 'TABLE'>('3D');

  // 3D Orbit State
  const [rotX, setRotX] = useState<number>(25); // Pitch (degrees)
  const [rotY, setRotY] = useState<number>(-35); // Yaw (degrees)
  const [zoom, setZoom] = useState<number>(1.0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showFormations, setShowFormations] = useState<boolean>(true);
  const [showOffsetWells, setShowOffsetWells] = useState<boolean>(true);

  // Mouse interaction state
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!wellId) return;

    const fetchTrajectory = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/gis/wells/${wellId}/trajectory?max_points=120`);
        if (!resp.ok) {
          throw new Error(`HTTP error ${resp.status}`);
        }
        const json = await resp.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Failed to load trajectory survey data');
      } finally {
        setLoading(false);
      }
    };

    fetchTrajectory();
  }, [wellId]);

  // 3D Canvas Rendering Engine
  useEffect(() => {
    if (activeTab !== '3D' || !canvasRef.current || !data || !data.points || data.points.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    // Normalize coordinates for 3D projection
    const pts = data.points;
    const maxTVD = Math.max(...pts.map(p => p.TVD), 100);
    const minX = Math.min(...pts.map(p => p.X));
    const maxX = Math.max(...pts.map(p => p.X));
    const minY = Math.min(...pts.map(p => p.Y));
    const maxY = Math.max(...pts.map(p => p.Y));

    const spanX = Math.max(maxX - minX, 200);
    const spanY = Math.max(maxY - minY, 200);
    const centerNormX = (minX + maxX) / 2;
    const centerNormY = (minY + maxY) / 2;

    // Scale factor
    const baseScale = (Math.min(width, height) * 0.35 * zoom) / Math.max(maxTVD, spanX, spanY);

    const radX = (rotX * Math.PI) / 180; // Pitch
    const radY = (rotY * Math.PI) / 180; // Yaw

    // Project 3D point (x, y, z) to 2D Canvas (px, py)
    // z = TVD depth (z=0 is ground surface, positive z is subterranean depth going down)
    const project = (x: number, y: number, z: number) => {
      const dx = (x - centerNormX);
      const dy = (y - centerNormY);
      const dz = z - maxTVD / 2;

      // Rotate around Y axis (Yaw)
      const x1 = dx * Math.cos(radY) - dy * Math.sin(radY);
      const y1 = dx * Math.sin(radY) + dy * Math.cos(radY);
      const z1 = dz;

      // Rotate around X axis (Pitch) - Positive Z moves DOWNWARDS on canvas screen
      const x2 = x1;
      const y2 = y1 * Math.cos(radX) + z1 * Math.sin(radX);
      const z2 = -y1 * Math.sin(radX) + z1 * Math.cos(radX);

      // Screen projection
      const px = width / 2 + x2 * baseScale;
      const py = height / 2 + y2 * baseScale;

      return { px, py, depthOrder: z2 };
    };

    // 1. Draw Subterranean Grid & Axis Box
    if (showGrid) {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;

      // Ground Surface Grid (Z = 0)
      const gridSize = Math.max(spanX, spanY, 600);
      const gridSteps = 6;
      for (let i = -gridSteps; i <= gridSteps; i++) {
        const stepOffset = (i / gridSteps) * gridSize;
        
        // E-W lines
        const p1 = project(centerNormX + stepOffset, centerNormY - gridSize, 0);
        const p2 = project(centerNormX + stepOffset, centerNormY + gridSize, 0);
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();

        // N-S lines
        const p3 = project(centerNormX - gridSize, centerNormY + stepOffset, 0);
        const p4 = project(centerNormX + gridSize, centerNormY + stepOffset, 0);
        ctx.beginPath();
        ctx.moveTo(p3.px, p3.py);
        ctx.lineTo(p4.px, p4.py);
        ctx.stroke();
      }

      // Vertical Depth Pillars at Grid Corners
      const corners = [
        { x: centerNormX - gridSize, y: centerNormY - gridSize },
        { x: centerNormX + gridSize, y: centerNormY - gridSize },
        { x: centerNormX + gridSize, y: centerNormY + gridSize },
        { x: centerNormX - gridSize, y: centerNormY + gridSize }
      ];

      corners.forEach(c => {
        const topP = project(c.x, c.y, 0);
        const botP = project(c.x, c.y, maxTVD);
        ctx.beginPath();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = '#334155';
        ctx.moveTo(topP.px, topP.py);
        ctx.lineTo(botP.px, botP.py);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Depth Axis Labels
      ctx.font = '10px monospace';
      ctx.fillStyle = '#64748b';
      for (let d = 0; d <= maxTVD; d += 500) {
        const p = project(centerNormX - gridSize, centerNormY - gridSize, d);
        ctx.fillText(`${d}m`, p.px - 35, p.py + 3);
        ctx.beginPath();
        ctx.arc(p.px, p.py, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Draw Translucent Formation Layers in 3D (Well-Specific Lithology)
    if (showFormations) {
      const defaultFormations = [
        { name: 'Tipam Group Sandstone', top: 0, bottom: 800, color: 'rgba(59, 130, 246, 0.07)' },
        { name: 'Girujan Claystone', top: 800, bottom: 1500, color: 'rgba(16, 185, 129, 0.07)' },
        { name: 'Barail Group Sandstone', top: 1500, bottom: 2500, color: 'rgba(245, 158, 11, 0.09)' },
        { name: 'Kopili Formation Shale', top: 2500, bottom: maxTVD, color: 'rgba(239, 68, 68, 0.08)' }
      ];

      const activeFormations = (data.formations && data.formations.length > 0)
        ? data.formations.map((f, idx) => {
            const colors = [
              'rgba(59, 130, 246, 0.07)',
              'rgba(16, 185, 129, 0.07)',
              'rgba(245, 158, 11, 0.09)',
              'rgba(168, 85, 247, 0.08)',
              'rgba(239, 68, 68, 0.08)',
              'rgba(14, 165, 233, 0.08)'
            ];
            return {
              name: f.name,
              top: f.top,
              bottom: f.bottom,
              color: colors[idx % colors.length]
            };
          })
        : defaultFormations;

      const rSize = Math.max(spanX, spanY, 600);

      activeFormations.forEach(f => {
        if (f.top < maxTVD) {
          const c1 = project(centerNormX - rSize, centerNormY - rSize, f.top);
          const c2 = project(centerNormX + rSize, centerNormY - rSize, f.top);
          const c3 = project(centerNormX + rSize, centerNormY + rSize, f.top);
          const c4 = project(centerNormX - rSize, centerNormY + rSize, f.top);

          ctx.fillStyle = f.color;
          ctx.beginPath();
          ctx.moveTo(c1.px, c1.py);
          ctx.lineTo(c2.px, c2.py);
          ctx.lineTo(c3.px, c3.py);
          ctx.lineTo(c4.px, c4.py);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = f.color.replace('0.07', '0.3').replace('0.08', '0.3').replace('0.09', '0.4');
          ctx.lineWidth = 1;
          ctx.stroke();

          // Formation Tag Label in 3D
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px monospace';
          ctx.fillText(`— ${f.name} (${f.top}m)`, c2.px + 8, c2.py + 3);
        }
      });
    }

    // 3. Draw Translucent Offset Wells (Anti-Collision Overlay)
    if (showOffsetWells && data.offset_wells && data.offset_wells.length > 0) {
      data.offset_wells.forEach(ow => {
        const oPts = ow.points;
        if (!oPts || oPts.length < 2) return;

        ctx.strokeStyle = '#64748b90';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);

        for (let i = 0; i < oPts.length - 1; i++) {
          const op1 = project(oPts[i].X, oPts[i].Y, oPts[i].TVD);
          const op2 = project(oPts[i + 1].X, oPts[i + 1].Y, oPts[i + 1].TVD);

          ctx.beginPath();
          ctx.moveTo(op1.px, op1.py);
          ctx.lineTo(op2.px, op2.py);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        // Offset Wellhead label
        const oHead = project(oPts[0].X, oPts[0].Y, 0);
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.fillText(`${ow.well_name}`, oHead.px + 8, oHead.py + 3);
      });
    }

    // 4. Draw Wellhead Marker (Surface Z = 0)
    const wellhead = project(pts[0].X, pts[0].Y, 0);
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(wellhead.px, wellhead.py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffedd5';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fb923c';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`Wellhead (0m)`, wellhead.px + 10, wellhead.py + 4);

    // 5. Draw Primary Active Well Trajectory Pipe Segments
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = project(pts[i].X, pts[i].Y, pts[i].TVD);
      const p2 = project(pts[i + 1].X, pts[i + 1].Y, pts[i + 1].TVD);

      const inc = pts[i].inclination;

      // Color code by inclination angle
      let strokeColor = '#10b981'; // Green for vertical (< 5 deg)
      if (inc >= 5 && inc < 20) strokeColor = '#3b82f6'; // Blue tangent
      else if (inc >= 20 && inc < 45) strokeColor = '#f59e0b'; // Yellow/Orange build
      else if (inc >= 45) strokeColor = '#ef4444'; // Red high angle / horizontal

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.stroke();

      // Outer glow for pipe
      ctx.strokeStyle = strokeColor + '40';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.stroke();
    }

    // 6. Draw Drill Bit / BHA at Total Depth (TD)
    const tdPt = pts[pts.length - 1];
    const bitP = project(tdPt.X, tdPt.Y, tdPt.TVD);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(bitP.px, bitP.py, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pulse ring around bit
    ctx.strokeStyle = '#ef444480';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(bitP.px, bitP.py, 12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`Drill Bit (TD: ${tdPt.TVD}m, Inc: ${tdPt.inclination}°)`, bitP.px + 14, bitP.py + 4);

    // 7. 3D Compass Rose Indicator (Top Right Canvas)
    const compX = width - 50;
    const compY = 50;
    const compLen = 25;

    // North Axis (Y)
    const nEnd = {
      px: compX - Math.sin(radY) * compLen,
      py: compY - Math.cos(radY) * Math.cos(radX) * compLen
    };
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(compX, compY);
    ctx.lineTo(nEnd.px, nEnd.py);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('N', nEnd.px + 3, nEnd.py);

    // East Axis (X)
    const eEnd = {
      px: compX + Math.cos(radY) * compLen,
      py: compY + Math.sin(radY) * Math.cos(radX) * compLen
    };
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(compX, compY);
    ctx.lineTo(eEnd.px, eEnd.py);
    ctx.stroke();
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('E', eEnd.px + 3, eEnd.py);

  }, [activeTab, data, rotX, rotY, zoom, showGrid, showFormations, showOffsetWells]);

  // Mouse Orbit Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;

    setRotY(prev => prev + dx * 0.5);
    setRotX(prev => Math.max(-85, Math.min(85, prev - dy * 0.5)));

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom(prev => Math.max(0.4, Math.min(3.0, prev + zoomDelta)));
  };

  if (!wellId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full p-6 space-y-4 text-xs shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[#0F2C59]">
              <Navigation size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#0F2C59]">3D Interactive Wellbore Trajectory Model</h3>
                {data?.profile_type && (
                  <span className="text-[10px] bg-cyan-100 text-cyan-950 border border-cyan-300 px-2.5 py-0.5 rounded-md font-extrabold uppercase">
                    {data.profile_type}
                  </span>
                )}
                <span className="text-[10px] bg-emerald-100 text-emerald-950 border border-emerald-300 px-2 py-0.5 rounded-md font-extrabold">
                  CURSOR ORBIT ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">{wellName} ({wellId}) • Upper Assam Basin Subsurface</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl text-xs">
              <button
                onClick={() => setActiveTab('3D')}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
                  activeTab === '3D' ? 'bg-[#0F2C59] text-white font-extrabold' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Box size={14} />
                <span>3D Model</span>
              </button>
              <button
                onClick={() => setActiveTab('TABLE')}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
                  activeTab === 'TABLE' ? 'bg-[#0F2C59] text-white font-extrabold' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Table size={14} />
                <span>Survey Table</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-20 text-center text-xs font-semibold text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            Loading 3D trajectory survey points and subsurface model...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-xs font-bold text-rose-950 bg-rose-50 rounded-xl border border-rose-200 p-4">
            {error}
          </div>
        ) : !data || !data.available || !data.points || data.points.length === 0 ? (
          <div className="py-14 text-center space-y-2 bg-slate-50 rounded-xl border border-slate-200 p-6">
            <AlertCircle size={24} className="mx-auto text-amber-600" />
            <div className="text-xs font-extrabold text-slate-900">Trajectory data unavailable</div>
            <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto">
              No directional survey or inclination/azimuth points recorded for well {wellId}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Trajectory Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div>
                <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider block">Max Depth (MD / TVD)</span>
                <span className="font-extrabold text-slate-900">{data.max_md}m / <span className="text-[#0F2C59] font-extrabold">{data.max_tvd}m</span></span>
              </div>
              <div>
                <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider block">Max Inclination Angle</span>
                <span className="font-extrabold text-amber-900">
                  {data.max_inc ?? Math.max(...data.points.map(p => p.inclination))}°
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider block">Target Azimuth</span>
                <span className="font-extrabold text-emerald-800">
                  {data.target_azimuth ?? data.points[data.points.length - 1].azimuth}°
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider block">Kick-off Point (KOP)</span>
                <span className="font-extrabold text-[#0F2C59]">{data.kop_m ? `${data.kop_m}m` : 'N/A (Vertical)'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider block">Horizontal Departure</span>
                <span className="font-extrabold text-purple-900">{data.departure_m ?? 0} m</span>
              </div>
            </div>

            {/* TAB 1: 3D INTERACTIVE MODEL VIEW */}
            {activeTab === '3D' && (
              <div className="space-y-3">
                {/* 3D Control Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700 text-xs flex items-center gap-1 font-bold">
                      <Compass size={15} className="text-[#0F2C59]" />
                      <span>3D Controls:</span>
                    </span>
                    <button
                      onClick={() => { setRotX(25); setRotY(-35); setZoom(1.0); }}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
                      title="Reset 3D camera angle"
                    >
                      <RotateCcw size={13} />
                      <span>Reset 3D View</span>
                    </button>
                    <button
                      onClick={() => { setRotX(90); setRotY(0); }}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition-colors shadow-2xs"
                    >
                      Top View (Plan)
                    </button>
                    <button
                      onClick={() => { setRotX(0); setRotY(-90); }}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition-colors shadow-2xs"
                    >
                      Side View (Profile)
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
                      <button
                        onClick={() => setZoom(prev => Math.min(3.0, prev + 0.2))}
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs"
                        title="Zoom In"
                      >
                        <ZoomIn size={14} />
                      </button>
                      <span className="text-xs font-extrabold text-slate-900 w-12 text-center">{Math.round(zoom * 100)}%</span>
                      <button
                        onClick={() => setZoom(prev => Math.max(0.4, prev - 0.2))}
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs"
                        title="Zoom Out"
                      >
                        <ZoomOut size={14} />
                      </button>
                    </div>

                    <label className="flex items-center gap-1.5 text-xs text-slate-800 font-bold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showFormations}
                        onChange={e => setShowFormations(e.target.checked)}
                        className="rounded border-slate-300 bg-white text-[#0F2C59] focus:ring-0"
                      />
                      <span>Formations</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs text-slate-800 font-bold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showGrid}
                        onChange={e => setShowGrid(e.target.checked)}
                        className="rounded border-slate-300 bg-white text-[#0F2C59] focus:ring-0"
                      />
                      <span>Grid</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs text-indigo-950 font-bold cursor-pointer select-none bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                      <input
                        type="checkbox"
                        checked={showOffsetWells}
                        onChange={e => setShowOffsetWells(e.target.checked)}
                        className="rounded border-indigo-300 bg-white text-indigo-600 focus:ring-0"
                      />
                      <span>Offset Wells (Anti-Collision)</span>
                    </label>
                  </div>
                </div>

                {/* 3D Canvas Container */}
                <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-slate-200 bg-[#050A14] shadow-xl cursor-grab active:cursor-grabbing">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                    className="w-full h-full block"
                  />

                  {/* 3D Overlay Help Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 border border-slate-200 backdrop-blur-md px-3.5 py-2 rounded-lg text-xs text-slate-800 font-semibold shadow-md flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Click & Drag mouse to rotate 3D model • Scroll wheel to zoom</span>
                  </div>

                  {/* Inclination Color Scale Legend */}
                  <div className="absolute bottom-3 right-3 bg-white/95 border border-slate-200 backdrop-blur-md p-3 rounded-xl text-xs font-semibold text-slate-800 space-y-1.5 shadow-md">
                    <div className="font-extrabold text-slate-900 border-b border-slate-200 pb-1">Inclination Scale</div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      <span>Vertical (&lt;5°)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                      <span>Tangent (5°-20°)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                      <span>Build-up (20°-45°)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                      <span>High Angle (&gt;45°)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SURVEY DATA TABLE VIEW */}
            {activeTab === 'TABLE' && (
              <div className="max-h-[420px] overflow-y-auto overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 text-[10px] text-slate-600 uppercase tracking-wider font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">MD (m)</th>
                      <th className="py-2.5 px-3">TVD (m)</th>
                      <th className="py-2.5 px-3">X Easting (m)</th>
                      <th className="py-2.5 px-3">Y Northing (m)</th>
                      <th className="py-2.5 px-3">Inclination (°)</th>
                      <th className="py-2.5 px-3">Azimuth (°)</th>
                      <th className="py-2.5 px-3">Wellbore Section</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {data.points.map((pt, idx) => {
                      let incBadge = 'bg-emerald-100 text-emerald-950 border-emerald-300';
                      if (pt.inclination >= 5 && pt.inclination < 20) incBadge = 'bg-blue-100 text-blue-950 border-blue-300';
                      else if (pt.inclination >= 20 && pt.inclination < 45) incBadge = 'bg-amber-100 text-amber-950 border-amber-300';
                      else if (pt.inclination >= 45) incBadge = 'bg-rose-100 text-rose-950 border-rose-300';

                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-extrabold text-slate-900">{pt.MD}m</td>
                          <td className="py-2.5 px-3 text-[#0F2C59] font-extrabold">{pt.TVD}m</td>
                          <td className="py-2.5 px-3 text-purple-900 font-bold">{pt.X >= 0 ? `+${pt.X.toFixed(2)}` : pt.X.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-cyan-900 font-bold">{pt.Y >= 0 ? `+${pt.Y.toFixed(2)}` : pt.Y.toFixed(2)}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold border ${incBadge}`}>
                              {pt.inclination.toFixed(1)}°
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-emerald-800 font-extrabold">{pt.azimuth.toFixed(1)}°</td>
                          <td className="py-2.5 px-3">
                            <span className="text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-300 font-bold">
                              {pt.section || (pt.MD === 0 ? 'Surface Wellhead' : 'Survey Station')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>Source: <strong className="text-slate-900 font-bold">OIL_AUTHORIZED Directional Survey</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-[#0F2C59] text-white text-xs font-extrabold transition-colors shadow-2xs"
          >
            Close 3D Trajectory
          </button>
        </div>
      </div>
    </div>
  );
};

