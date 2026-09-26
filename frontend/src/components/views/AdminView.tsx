import React, { useState } from 'react';
import { ShieldCheck, Users, Clock, Key, Eye, EyeOff, Lock, UserCheck } from 'lucide-react';

interface UserRecord {
  id: string;
  name: string;
  role: string;
  department: string;
  lastLogin: string;
  status: 'Active' | 'Inactive';
  permissions: string[];
}

const USERS: UserRecord[] = [
  { id: 'USR-001', name: 'Rajesh Kumar', role: 'Drilling Engineer', department: 'Drilling Operations', lastLogin: '5 min ago', status: 'Active', permissions: ['View All', 'Edit Parameters', 'Approve Actions'] },
  { id: 'USR-002', name: 'Priya Sharma', role: 'Geologist', department: 'Geology & Geophysics', lastLogin: '2 hr ago', status: 'Active', permissions: ['View All', 'Edit Geology', 'Upload Documents'] },
  { id: 'USR-003', name: 'Amit Borpatra', role: 'Operations Manager', department: 'Operations', lastLogin: '30 min ago', status: 'Active', permissions: ['View All', 'Approve Actions', 'Admin'] },
  { id: 'USR-004', name: 'Deepak Gogoi', role: 'Mud Engineer', department: 'Fluids Engineering', lastLogin: '1 hr ago', status: 'Active', permissions: ['View All', 'Edit Mud Program'] },
  { id: 'USR-005', name: 'Sunita Kalita', role: 'Data Analyst', department: 'IT & Analytics', lastLogin: '3 days ago', status: 'Inactive', permissions: ['View Dashboard', 'Run Reports'] },
  { id: 'USR-006', name: 'Manoj Das', role: 'Field Supervisor', department: 'Field Operations', lastLogin: '15 min ago', status: 'Active', permissions: ['View All', 'Update Events'] },
];

interface AuditEntry {
  timestamp: string;
  user: string;
  action: string;
  detail: string;
  ip: string;
}

const AUDIT_LOG: AuditEntry[] = [
  { timestamp: '2 min ago', user: 'Rajesh Kumar', action: 'Modified Parameter', detail: 'Updated mud weight from 1.22 to 1.24 g/cc for DUL-104', ip: '10.0.1.45' },
  { timestamp: '15 min ago', user: 'Manoj Das', action: 'Logged Event', detail: 'Created incident INC-DUL104-TORQUE at 2,132m', ip: '10.0.1.78' },
  { timestamp: '30 min ago', user: 'Amit Borpatra', action: 'Approved Action', detail: 'Approved mud weight increase for Barail transit', ip: '10.0.1.12' },
  { timestamp: '1 hr ago', user: 'Priya Sharma', action: 'Uploaded Document', detail: 'Uploaded Geology_Update_DUL104_2023.pdf', ip: '10.0.1.33' },
  { timestamp: '2 hr ago', user: 'Deepak Gogoi', action: 'Updated Mud Program', detail: 'Added 3% Glycol to active mud system', ip: '10.0.1.55' },
  { timestamp: '4 hr ago', user: 'System', action: 'Auto Backup', detail: 'Scheduled database backup completed successfully', ip: '10.0.1.1' },
];

const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'roles'>('users');

  return (
    <div className="fade-in">
      <div className="view-header">
        <h1 className="view-header__title">Admin Panel — RBAC & Audit Trail</h1>
        <span className="view-header__badge view-header__badge--analysis">Security</span>
      </div>

      {/* Summary */}
      <div className="metrics-grid mb-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="metric-tile metric-tile--info">
          <div className="metric-tile__label"><Users size={14} /> Total Users</div>
          <div className="metric-tile__value">{USERS.length}</div>
        </div>
        <div className="metric-tile metric-tile--normal">
          <div className="metric-tile__label"><UserCheck size={14} /> Active Now</div>
          <div className="metric-tile__value">{USERS.filter(u => u.status === 'Active').length}</div>
        </div>
        <div className="metric-tile metric-tile--info">
          <div className="metric-tile__label"><Key size={14} /> Roles Defined</div>
          <div className="metric-tile__value">{new Set(USERS.map(u => u.role)).size}</div>
        </div>
        <div className="metric-tile metric-tile--info">
          <div className="metric-tile__label"><Clock size={14} /> Audit Entries</div>
          <div className="metric-tile__value">{AUDIT_LOG.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div className={`tab ${activeTab === 'users' ? 'tab--active' : ''}`} onClick={() => setActiveTab('users')}>User Management</div>
        <div className={`tab ${activeTab === 'audit' ? 'tab--active' : ''}`} onClick={() => setActiveTab('audit')}>Audit Trail</div>
        <div className={`tab ${activeTab === 'roles' ? 'tab--active' : ''}`} onClick={() => setActiveTab('roles')}>Role Definitions</div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card__header">
            <span className="card__title"><Users size={14} /> Registered Users</span>
          </div>
          <div className="card__body--flush">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Permissions</th>
                </tr>
              </thead>
              <tbody>
                {USERS.map(user => (
                  <tr key={user.id}>
                    <td style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, color: 'var(--text-primary)' }}>{user.name}</td>
                    <td style={{ fontFamily: 'var(--font-sans)' }}>{user.role}</td>
                    <td style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-tertiary)' }}>{user.department}</td>
                    <td>
                      <span className={`badge badge--${user.status === 'Active' ? 'normal' : 'warning'}`}>{user.status}</span>
                    </td>
                    <td>{user.lastLogin}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        {user.permissions.slice(0, 2).map((p, i) => (
                          <span key={i} className="provenance-tag">{p}</span>
                        ))}
                        {user.permissions.length > 2 && (
                          <span className="provenance-tag">+{user.permissions.length - 2}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === 'audit' && (
        <div className="card">
          <div className="card__header">
            <span className="card__title"><Clock size={14} /> System Audit Trail</span>
            <span className="provenance-tag">Immutable Log</span>
          </div>
          <div className="card__body--flush">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Detail</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {AUDIT_LOG.map((entry, i) => (
                  <tr key={i}>
                    <td style={{ whiteSpace: 'nowrap' }}>{entry.timestamp}</td>
                    <td style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, color: 'var(--text-primary)' }}>{entry.user}</td>
                    <td>
                      <span className="badge badge--info">{entry.action}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-sans)', fontSize: 11 }}>{entry.detail}</td>
                    <td>{entry.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { role: 'Drilling Engineer', perms: ['View All Data', 'Edit Parameters', 'Approve Well Actions', 'Run Simulations'], level: 'Level 3' },
            { role: 'Geologist', perms: ['View All Data', 'Edit Geology Data', 'Upload Documents', 'Annotate Formations'], level: 'Level 2' },
            { role: 'Operations Manager', perms: ['View All Data', 'Approve Actions', 'Admin Panel', 'Export Reports', 'User Management'], level: 'Level 4' },
            { role: 'Mud Engineer', perms: ['View Dashboard', 'Edit Mud Program', 'Update Fluid Records'], level: 'Level 2' },
            { role: 'Data Analyst', perms: ['View Dashboard', 'Run Reports', 'Export Data'], level: 'Level 1' },
            { role: 'Field Supervisor', perms: ['View All Data', 'Update Events', 'Log Incidents'], level: 'Level 3' },
          ].map((r, i) => (
            <div key={i} className="card">
              <div className="card__body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-heading)' }}>{r.role}</div>
                  <span className="badge badge--info">{r.level}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {r.perms.map((p, j) => (
                    <div key={j} style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Lock size={10} style={{ color: 'var(--accent-green)' }} /> {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminView;
