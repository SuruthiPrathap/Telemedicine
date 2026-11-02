import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import DashboardChart from '../components/DashboardChart';
import { API } from '../config';

function AdminDashboard() {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [summary, setSummary] = useState({ users: 0, prescriptions: 0, records: 0, pharmacies: 0 });
    const [activityData, setActivityData] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { token, user: currentUser } = useAuth();

    // Add User Form State
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Patient' });

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API}/api/admin/users`, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            if (!res.ok) throw new Error(t('admin.accessDenied'));
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [summaryRes, activityRes] = await Promise.all([
                    fetch(`${API}/api/stats/summary`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API}/api/stats/activity`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                
                const summaryData = await summaryRes.json();
                const activityJson = await activityRes.json();

                setSummary(summaryData);

                // Process activity
                const days = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    days.push(date.toISOString().split('T')[0]);
                }
                const chartData = days.map(day => {
                    const presMatch = activityJson.prescriptions.find(p => p._id === day);
                    const recMatch = activityJson.records.find(r => r._id === day);
                    return {
                        name: day.split('-').slice(1).join('/'),
                        prescriptions: presMatch ? presMatch.count : 0,
                        records: recMatch ? recMatch.count : 0
                    };
                });
                setActivityData(chartData);

            } catch (err) {
                console.error(err);
            }
        };

        fetchUsers();
        fetchStats();
    }, [token, t]);

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const res = await fetch(`${API}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add user');
            
            setSuccess(`User ${newUser.name} added successfully!`);
            setNewUser({ name: '', email: '', password: '', role: 'Patient' });
            setShowAddForm(false);
            fetchUsers(); // Refresh list
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove user "${name}"?`)) return;
        
        setError('');
        setSuccess('');
        try {
            const res = await fetch(`${API}/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete user');
            
            setSuccess(`User ${name} removed successfully.`);
            fetchUsers(); // Refresh list
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateRole = async (id, newRole, name) => {
        setError('');
        setSuccess('');
        try {
            const res = await fetch(`${API}/api/admin/users/${id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update user');
            
            setSuccess(`User ${name} role updated to ${newRole}.`);
            fetchUsers(); // Refresh list
        } catch (err) {
            setError(err.message);
        }
    };

    const displayMetrics = [
        { label: t('admin.totalUsers'), val: summary.users, color: '#8b5cf6' },
        { label: t('admin.totalPrescriptions'), val: summary.prescriptions, color: '#3b82f6' },
        { label: t('admin.healthRecords'), val: summary.records, color: '#10b981' },
        { label: t('admin.pharmacies'), val: summary.pharmacies, color: '#ec4899' }
    ];

    return (
        <div style={{ paddingBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 className="page-title">{t('admin.title')}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{t('admin.desc')}</p>
                </div>
                <button 
                    className="btn btn-primary" 
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{ background: showAddForm ? '#6B7280' : 'var(--primary-accent)' }}
                >
                    {showAddForm ? 'Cancel' : '+ Add New User'}
                </button>
            </div>
            
            {error && <div className="alert-warning" style={{ marginBottom: 24, backgroundColor: '#FEF2F2', color: '#B91C1C', borderColor: '#FCA5A5' }}>{error}</div>}
            {success && <div className="alert-warning" style={{ marginBottom: 24, backgroundColor: '#ECFDF5', color: '#047857', borderColor: '#6EE7B7' }}>{success}</div>}

            {showAddForm && (
                <div className="card" style={{ padding: '24px', marginBottom: '32px', border: '1px solid var(--primary-accent)' }}>
                    <h3 style={{ marginBottom: '20px' }}>Add New System User</h3>
                    <form onSubmit={handleAddUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <input 
                            type="text" className="input-field" placeholder="Full Name" required
                            value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
                        />
                        <input 
                            type="email" className="input-field" placeholder="Email Address" required
                            value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                        />
                        <input 
                            type="password" className="input-field" placeholder="Password" required
                            value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                        />
                        <select 
                            className="input-field"
                            value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}
                        >
                            <option value="Patient">Patient</option>
                            <option value="Doctor">Doctor</option>
                            <option value="Pharmacy">Pharmacy</option>
                            <option value="Admin">Admin</option>
                        </select>
                        <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>Create User Account</button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {displayMetrics.map((m, i) => (
                    <div key={i} className="card" style={{ padding: '20px', textAlign: 'center', borderTop: `4px solid ${m.color}` }}>
                        <h2 style={{ fontSize: '28px', margin: 0 }}>{m.val}</h2>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>{m.label}</p>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: 20 }}>{t('admin.activityTrend')}</h3>
                    <DashboardChart data={activityData} />
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: 20 }}>{t('admin.userList')} ({users.length})</h3>
                    <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
                        {users.map(u => (
                            <div key={u.id} style={{ padding: '12px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {u.name}
                                        {u.id === currentUser.id && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(You)</span>}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                                    {u.patientId && <div style={{ fontSize: '10px', color: 'var(--primary-accent)' }}>ID: {u.patientId}</div>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <select 
                                        style={{ fontSize: '10px', fontWeight: 'bold', background: 'var(--glass-bg)', padding: '4px 8px', borderRadius: '10px', color: 'var(--primary-accent)', border: 'none', cursor: 'pointer' }}
                                        value={u.role}
                                        onChange={(e) => handleUpdateRole(u.id, e.target.value, u.name)}
                                    >
                                        <option value="Patient">PATIENT</option>
                                        <option value="Doctor">DOCTOR</option>
                                        <option value="Pharmacy">PHARMACY</option>
                                        <option value="Admin">ADMIN</option>
                                    </select>
                                    
                                    {u.id !== currentUser.id && (
                                        <button 
                                            onClick={() => handleDeleteUser(u.id, u.name)}
                                            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '18px', padding: '4px' }}
                                            title="Remove User"
                                        >
                                            &times;
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
