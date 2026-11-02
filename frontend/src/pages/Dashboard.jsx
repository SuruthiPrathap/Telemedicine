import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardChart from '../components/DashboardChart';
import { Pill, FolderOpen, Hospital, Users, Video } from 'lucide-react';
import { API } from '../config';

function Dashboard() {
    const { user, token } = useAuth();
    const { t } = useTranslation();
    const [summary, setSummary] = useState({ users: 0, prescriptions: 0, records: 0, pharmacies: 0 });
    const [activityData, setActivityData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, activityRes] = await Promise.all([
                    fetch(`${API}/api/stats/summary`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API}/api/stats/activity`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                
                if (!summaryRes.ok || !activityRes.ok) {
                    throw new Error(`API error: summary ${summaryRes.status}, activity ${activityRes.status}`);
                }
                const summaryData = await summaryRes.json();
                const activityJson = await activityRes.json();

                setError('');
                setSummary(summaryData);

                // Process activity data for Recharts
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
                        name: day.split('-').slice(1).join('/'), // MM/DD
                        prescriptions: presMatch ? presMatch.count : 0,
                        records: recMatch ? recMatch.count : 0
                    };
                });

                setActivityData(chartData);
            } catch (err) {
                console.error("Dashboard failed to fetch stats", err);
                setError('Cannot load data from the server. Make sure the backend and MongoDB are running, then log in again.');
            }
            setLoading(false);
        };
        fetchData();
    }, [token]);

    const statsConfig = [
        { label: t('stats.prescriptions'), val: summary.prescriptions, color: '#3b82f6', icon: <Pill size={24} color="#3b82f6" /> },
        { label: t('stats.records'),       val: summary.records,       color: '#10b981', icon: <FolderOpen size={24} color="#10b981" /> },
        { label: t('stats.pharmacies'),    val: summary.pharmacies,    color: '#ec4899', icon: <Hospital size={24} color="#ec4899" /> },
        { label: t('stats.users'),         val: summary.users,         color: '#8b5cf6', icon: <Users size={24} color="#8b5cf6" /> },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>{t('stats.overview')}</h1>
                {(user.role === 'Patient' || user.role === 'Doctor') && (
                    <Link to="/video" style={{ textDecoration: 'none' }}>
                        <button className="btn btn-primary" style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}>
                            <Video size={18} /> {t('stats.videoBtn')}
                        </button>
                    </Link>
                )}
            </div>

            <div style={{ marginBottom: 24 }}>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '18px' }}>
                    {t('dashboard.welcome')} <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{user.name}</span>! {t('stats.monitoring')}
                </p>
                {user.role === 'Patient' && user.patientId && (
                    <div style={{ marginTop: '12px', padding: '12px 16px', background: '#e0f2fe', borderRadius: '8px', display: 'inline-block', border: '1px solid #bae6fd', color: '#0369a1', fontSize: '15px' }}>
                        <strong style={{ marginRight: '8px' }}>Your Patient ID:</strong> 
                        <span style={{ fontFamily: 'monospace', fontSize: '16px', letterSpacing: '1px', background: '#fff', padding: '4px 8px', borderRadius: '4px', border: '1px solid #7dd3fc' }}>
                            {user.patientId}
                        </span>
                    </div>
                )}
            </div>

            {error && <p style={{ color: '#ef4444', marginBottom: 20 }}>⚠ {error}</p>}
            {loading ? <p>Loading system metrics...</p> : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                        {statsConfig.map((stat, idx) => (
                            <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '24px', borderLeft: `6px solid ${stat.color}`, background: 'rgba(30, 41, 59, 0.4)' }}>
                                <div style={{ marginBottom: '8px' }}>{stat.icon}</div>
                                <h2 style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: '#fff' }}>
                                    {stat.val}
                                </h2>
                                <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase' }}>{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="card" style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>{t('stats.activityTrends')}</h3>
                            <div style={{ display: 'flex', gap: '15px', fontSize: '12px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></div> {t('stats.prescriptions')}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div> {t('stats.records')}
                                </span>
                            </div>
                        </div>
                        <DashboardChart data={activityData} />
                    </div>
                </>
            )}
        </div>
    );
}

export default Dashboard;