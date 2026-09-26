// ==========================================================================
// eRTMAC-NWIS Master Data Store
// Oil India Limited — Upper Assam Shelf Basin
// ==========================================================================

export interface Well {
  id: string;
  name: string;
  field: string;
  basin: string;
  lat: number;
  lng: number;
  targetDepth: number;
  status: 'Drilling' | 'Producing' | 'Offset Reference';
  spudDate: string;
}

export interface Formation {
  id: string;
  name: string;
  topDepth: number;
  bottomDepth: number;
  color: string;
  hazards: string[];
  cssClass: string;
}

export interface DrillingEvent {
  id: string;
  wellId: string;
  field: string;
  formation: string;
  depth: number;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  nptHours: number;
  costLossINR: number;
  rootCause: string;
  mitigation: string;
  startTime: string;
  endTime: string;
}

export interface RealTimePoint {
  timestamp: string;
  depth: number;
  rop: number;
  wob: number;
  torque: number;
  rpm: number;
  spp: number;
  flowRate: number;
  hookload: number;
  mudWeight: number;
  pitGain: number;
  gasUnits: number;
  flowIn: number;
  flowOut: number;
  label: string;
}

export interface CasingRecord {
  wellId: string;
  size: string;
  settingDepth: number;
  grade: string;
  weight: string;
}

// --- Wells Master ---
export const WELLS: Well[] = [
  { id: 'DUL_104', name: 'Duliajan-104', field: 'Duliajan', basin: 'Upper Assam Shelf', lat: 26.857, lng: 95.340, targetDepth: 3510, status: 'Drilling', spudDate: '2023-11-15' },
  { id: 'DUL_92', name: 'Duliajan-92', field: 'Duliajan', basin: 'Upper Assam Shelf', lat: 26.844, lng: 95.328, targetDepth: 3480, status: 'Offset Reference', spudDate: '2022-10-20' },
  { id: 'DUL_88', name: 'Duliajan-88', field: 'Duliajan', basin: 'Upper Assam Shelf', lat: 26.851, lng: 95.315, targetDepth: 3400, status: 'Offset Reference', spudDate: '2022-11-01' },
  { id: 'DUL_99', name: 'Duliajan-99', field: 'Duliajan', basin: 'Upper Assam Shelf', lat: 26.832, lng: 95.305, targetDepth: 3550, status: 'Producing', spudDate: '2022-12-10' },
  { id: 'NHK_45', name: 'Naharkatiya-45', field: 'Naharkatiya', basin: 'Upper Assam Shelf', lat: 27.282, lng: 95.350, targetDepth: 3420, status: 'Producing', spudDate: '2023-01-05' },
  { id: 'NHK_52', name: 'Naharkatiya-52', field: 'Naharkatiya', basin: 'Upper Assam Shelf', lat: 27.297, lng: 95.365, targetDepth: 3460, status: 'Producing', spudDate: '2023-02-12' },
  { id: 'NHK_61', name: 'Naharkatiya-61', field: 'Naharkatiya', basin: 'Upper Assam Shelf', lat: 27.272, lng: 95.342, targetDepth: 3500, status: 'Producing', spudDate: '2023-03-20' },
  { id: 'MOR_12', name: 'Moran-12', field: 'Moran', basin: 'Upper Assam Shelf', lat: 27.182, lng: 94.920, targetDepth: 3350, status: 'Offset Reference', spudDate: '2023-01-15' },
  { id: 'MOR_18', name: 'Moran-18', field: 'Moran', basin: 'Upper Assam Shelf', lat: 27.194, lng: 94.935, targetDepth: 3400, status: 'Offset Reference', spudDate: '2023-02-20' },
  { id: 'MOR_25', name: 'Moran-25', field: 'Moran', basin: 'Upper Assam Shelf', lat: 27.177, lng: 94.910, targetDepth: 3380, status: 'Offset Reference', spudDate: '2023-04-01' },
  { id: 'DIG_04', name: 'Digboi-04', field: 'Digboi', basin: 'Upper Assam Shelf', lat: 27.382, lng: 95.620, targetDepth: 3100, status: 'Producing', spudDate: '2021-06-10' },
  { id: 'DIG_11', name: 'Digboi-11', field: 'Digboi', basin: 'Upper Assam Shelf', lat: 27.393, lng: 95.632, targetDepth: 3150, status: 'Producing', spudDate: '2021-08-15' },
  { id: 'DIG_19', name: 'Digboi-19', field: 'Digboi', basin: 'Upper Assam Shelf', lat: 27.377, lng: 95.615, targetDepth: 3200, status: 'Producing', spudDate: '2022-01-10' },
  { id: 'RUD_08', name: 'Rudrasagar-08', field: 'Rudrasagar', basin: 'Upper Assam Shelf', lat: 26.912, lng: 94.610, targetDepth: 3300, status: 'Offset Reference', spudDate: '2022-05-20' },
  { id: 'RUD_15', name: 'Rudrasagar-15', field: 'Rudrasagar', basin: 'Upper Assam Shelf', lat: 26.927, lng: 94.625, targetDepth: 3340, status: 'Offset Reference', spudDate: '2022-07-15' },
  { id: 'RUD_22', name: 'Rudrasagar-22', field: 'Rudrasagar', basin: 'Upper Assam Shelf', lat: 26.900, lng: 94.595, targetDepth: 3360, status: 'Offset Reference', spudDate: '2022-09-10' },
  { id: 'SIB_07', name: 'Sibsagar-07', field: 'Sibsagar', basin: 'Upper Assam Shelf', lat: 26.982, lng: 94.630, targetDepth: 3400, status: 'Producing', spudDate: '2022-11-05' },
  { id: 'JOR_03', name: 'Jorhat-03', field: 'Jorhat', basin: 'Upper Assam Shelf', lat: 26.752, lng: 94.200, targetDepth: 3250, status: 'Offset Reference', spudDate: '2022-03-15' },
];

// --- Formations (Upper Assam Shelf) ---
export const FORMATIONS: Formation[] = [
  { id: 'FORM-01', name: 'Tipam Sandstone', topDepth: 0, bottomDepth: 800, color: '#22c55e', hazards: ['Stable zone'], cssClass: 'formation-band--tipam' },
  { id: 'FORM-02', name: 'Girujan Clay', topDepth: 800, bottomDepth: 1500, color: '#8b5cf6', hazards: ['Swelling clay', 'Tight hole risk'], cssClass: 'formation-band--girujan' },
  { id: 'FORM-03', name: 'Namsang Formation', topDepth: 1200, bottomDepth: 1800, color: '#06b6d4', hazards: ['Bit vibration', 'Directional drift'], cssClass: 'formation-band--namsang' },
  { id: 'FORM-04', name: 'Barail Group', topDepth: 1800, bottomDepth: 2500, color: '#f59e0b', hazards: ['Reactive shale', 'Stuck pipe', 'Pack-off'], cssClass: 'formation-band--barail' },
  { id: 'FORM-05', name: 'Kopili Formation', topDepth: 2500, bottomDepth: 3200, color: '#ef4444', hazards: ['Overpressure', 'Gas kick', 'High EMW required'], cssClass: 'formation-band--kopili' },
  { id: 'FORM-06', name: 'Sylhet Limestone', topDepth: 3000, bottomDepth: 3500, color: '#f97316', hazards: ['Lost circulation', 'Karst fractures'], cssClass: 'formation-band--sylhet' },
];

// --- Drilling Events/Incidents ---
export const DRILLING_EVENTS: DrillingEvent[] = [
  {
    id: 'INC-DUL92-01', wellId: 'DUL_92', field: 'Duliajan', formation: 'Barail Group',
    depth: 2210, type: 'Stuck Pipe', severity: 'High', nptHours: 36.5, costLossINR: 4560000,
    rootCause: 'Reactive Smectite/Illite shale expansion due to low mud weight (1.16 g/cc)',
    mitigation: '50 bbl Glycol Spotting Pill, 4-hr soak time, mud weight raised to 1.25 g/cc',
    startTime: '2022-11-14T04:30:00', endTime: '2022-11-15T17:00:00'
  },
  {
    id: 'INC-DUL88-01', wellId: 'DUL_88', field: 'Duliajan', formation: 'Kopili Formation',
    depth: 2842, type: 'Gas Kick', severity: 'Critical', nptHours: 22, costLossINR: 3200000,
    rootCause: 'High pressure gas influx (SICP 350 psi, SIDPP 240 psi) in overpressured Kopili zone',
    mitigation: 'Shut-in well, API Barite weighting up to 1.36 g/cc EMW via Wait & Weight method',
    startTime: '2022-12-02T14:00:00', endTime: '2022-12-03T12:00:00'
  },
  {
    id: 'INC-DUL99-01', wellId: 'DUL_99', field: 'Duliajan', formation: 'Sylhet Limestone',
    depth: 3210, type: 'Mud Loss', severity: 'Critical', nptHours: 44, costLossINR: 5800000,
    rootCause: '100% total fluid loss into karst fracture network in Sylhet limestone',
    mitigation: 'Annular top-up, 60 bbl Coarse LCM pill (Nut Plug + Mica), Class-G cement squeeze',
    startTime: '2023-01-15T09:00:00', endTime: '2023-01-17T05:00:00'
  },
  {
    id: 'INC-MOR12-01', wellId: 'MOR_12', field: 'Moran', formation: 'Barail Group',
    depth: 2185, type: 'High Torque', severity: 'Medium', nptHours: 14, costLossINR: 1800000,
    rootCause: 'Rotational torque elevation to 24 kN.m due to tight hole in reactive claystone',
    mitigation: 'High vis sweep, 3% Glycol addition, back-reaming 2,150m to 2,185m',
    startTime: '2023-02-10T11:15:00', endTime: '2023-02-11T01:15:00'
  },
  {
    id: 'INC-NHK45-01', wellId: 'NHK_45', field: 'Naharkatiya', formation: 'Kopili Formation',
    depth: 2790, type: 'Gas Influx', severity: 'Medium', nptHours: 18.5, costLossINR: 2400000,
    rootCause: 'Connection gas spike to 1,800 units during pipe connection at Kopili top',
    mitigation: 'Increased mud weight from 1.22 to 1.28 g/cc EMW, circulated bottoms-up',
    startTime: '2023-03-05T16:30:00', endTime: '2023-03-06T11:00:00'
  },
];

// --- Casing Records ---
export const CASING_RECORDS: CasingRecord[] = [
  { wellId: 'DUL_92', size: '20 in', settingDepth: 80, grade: 'K-55', weight: '94 lb/ft' },
  { wellId: 'DUL_92', size: '13-3/8 in', settingDepth: 800, grade: 'L-80', weight: '68 lb/ft' },
  { wellId: 'DUL_92', size: '9-5/8 in', settingDepth: 1800, grade: 'N-80', weight: '47 lb/ft' },
  { wellId: 'DUL_92', size: '7 in Liner', settingDepth: 3520, grade: 'P-110', weight: '29 lb/ft' },
  { wellId: 'DUL_88', size: '8.5 in Hole', settingDepth: 2842, grade: 'P-110', weight: '29 lb/ft' },
  { wellId: 'DUL_99', size: '8.5 in Hole', settingDepth: 3210, grade: 'P-110', weight: '29 lb/ft' },
  { wellId: 'DUL_104', size: '12.25 in Hole', settingDepth: 2120, grade: 'L-80', weight: '68 lb/ft' },
];

// --- Simulated Real-Time Stream (latest 60 data points for DUL_104) ---
function generateRealtimeStream(): RealTimePoint[] {
  const points: RealTimePoint[] = [];
  const baseDepth = 2120;
  const now = new Date();
  for (let i = 0; i < 60; i++) {
    const t = new Date(now.getTime() - (59 - i) * 60000);
    const depth = baseDepth + i * 0.2;
    const isAnomaly = i >= 48 && i <= 55;
    points.push({
      timestamp: t.toISOString(),
      depth: Math.round(depth * 10) / 10,
      rop: isAnomaly ? 8 + Math.random() * 3 : 14 + Math.random() * 2,
      wob: 17 + Math.random() * 2,
      torque: isAnomaly ? 16 + Math.random() * 4 : 10 + Math.random() * 2,
      rpm: 118 + Math.random() * 5,
      spp: 2290 + Math.random() * 40,
      flowRate: 1780 + Math.random() * 40,
      hookload: isAnomaly ? 175 + Math.random() * 10 : 165 + Math.random() * 5,
      mudWeight: 1.24,
      pitGain: isAnomaly ? 2 + Math.random() * 3 : 0,
      gasUnits: isAnomaly ? 200 + Math.random() * 300 : 45 + Math.random() * 10,
      flowIn: 1790 + Math.random() * 30,
      flowOut: isAnomaly ? 1810 + Math.random() * 30 : 1785 + Math.random() * 30,
      label: isAnomaly ? 'anomaly' : 'normal',
    });
  }
  return points;
}

export const REALTIME_STREAM = generateRealtimeStream();

// --- Current Drilling Status (DUL_104) ---
export const CURRENT_WELL = {
  id: 'DUL_104',
  name: 'Duliajan-104',
  currentDepth: 2132,
  targetDepth: 3510,
  currentFormation: 'Barail Group',
  holeSize: '12.25 in',
  mudWeight: 1.24,
  daysSinceSpud: 42,
  dailyCostINR: 1250000,
  bitOnBottom: true,
  lastTrip: '2 hrs ago',
  lastSurvey: '2,120m MD / 2,118m TVD / Inc 1.2° / Azi 045°',
};

// --- KPI Summary ---
export const KPI_DATA = {
  avgROP: 14.8,
  maxTorque: 12.1,
  currentWOB: 17.9,
  currentRPM: 120,
  currentSPP: 2305,
  flowRate: 1800,
  hookload: 168.5,
  mudWeight: 1.24,
  pitGain: 0.0,
  gasUnits: 48,
  totalNPTHours: 135,
  totalNPTCostINR: 17760000,
  wellsInField: 4,
  offsetWells: 17,
  activeDrillingWells: 1,
};

// --- AI Copilot Sample Messages ---
export const AI_MESSAGES = [
  {
    role: 'ai' as const,
    text: 'Welcome to eRTMAC-NWIS AI Copilot. I can help with drilling hazard analysis, offset well comparison, formation top prediction, and real-time anomaly interpretation for Upper Assam Shelf operations.',
  },
  {
    role: 'user' as const,
    text: 'What hazards should I expect while drilling through Barail Group at 2,200m in Duliajan field?',
  },
  {
    role: 'ai' as const,
    text: '**Barail Group (1,800–2,500m) — High Hazard Zone**\n\nBased on analysis of 5 offset wells in Duliajan field:\n\n• **Primary Risk:** Reactive shale (Smectite/Illite) causing wellbore instability\n• **Stuck Pipe Risk:** 60% probability based on INC-DUL92-01 (36.5 hrs NPT at 2,210m)\n• **Recommended Mud Weight:** ≥1.22 g/cc (current: 1.24 — within safe range)\n• **Mitigation:** Pre-treat with 3-5% Glycol inhibitor, maintain high-vis sweeps every 3 stands\n\n*Data source: SPE_Assam_Basin_Drilling_Hazards_Paper.pdf, INC-DUL92-01*',
  },
];

// --- Data Source Health ---
export const DATA_SOURCES = [
  { name: 'WITSML Real-Time Feed', status: 'Online', latency: '120ms', records: 148447, lastSync: '2 min ago' },
  { name: 'Wells Master Database', status: 'Online', latency: '45ms', records: 21, lastSync: '1 hr ago' },
  { name: 'Formation Reference', status: 'Online', latency: '32ms', records: 6, lastSync: '24 hr ago' },
  { name: 'Drilling Events Log', status: 'Online', latency: '55ms', records: 5, lastSync: '6 hr ago' },
  { name: 'SPE Document Archive', status: 'Online', latency: '180ms', records: 12, lastSync: '48 hr ago' },
  { name: 'Mud Program Records', status: 'Online', latency: '65ms', records: 340, lastSync: '4 hr ago' },
  { name: 'Well Trajectory Survey', status: 'Online', latency: '90ms', records: 19271, lastSync: '30 min ago' },
  { name: 'Casing & Cementing', status: 'Online', latency: '40ms', records: 7, lastSync: '12 hr ago' },
];
