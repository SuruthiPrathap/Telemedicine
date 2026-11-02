import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { API } from '../config';

function MyOrders() {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        fetch(`${API}/api/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
        .catch(() => setLoading(false));
    }, [token]);

    const getStatusStyle = (status) => {
        const map = {
            'Pending': { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: '#F59E0B' },
            'Confirmed': { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', border: '#3B82F6' },
            'Ready for Pickup': { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', border: '#8B5CF6' },
            'Completed': { color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: '#10B981' },
            'Cancelled': { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: '#EF4444' }
        };
        const s = map[status] || map['Pending'];
        return { color: s.color, background: s.bg, border: `1px solid ${s.border}` };
    };

    const getStatusIcon = (status) => {
        const icons = { 'Pending': '⏳', 'Confirmed': '✅', 'Ready for Pickup': '📦', 'Completed': '🎉', 'Cancelled': '❌' };
        return icons[status] || '⏳';
    };

    return (
        <div>
            <h1 className="page-title">{t('orders.title')}</h1>

            {loading ? <p>{t('orders.loading')}</p> : orders.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 30px', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '56px', margin: '0 0 16px' }}>🛒</p>
                    <h3 style={{ margin: '0 0 8px', color: 'var(--text-main)' }}>{t('orders.noOrders')}</h3>
                    <p>{t('orders.noOrdersDesc')}</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {orders.map(order => (
                        <div key={order._id} className="card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {t('orders.orderId')}: #{order._id.slice(-8).toUpperCase()}
                                    </p>
                                    <h3 style={{ margin: '6px 0 4px', color: 'var(--primary-accent)', fontSize: '18px' }}>
                                        🏪 {order.pharmacy_name}
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                                        📍 {order.pharmacy_address} • {new Date(order.order_date).toLocaleDateString()}
                                    </p>
                                </div>
                                <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap', ...getStatusStyle(order.status) }}>
                                    {getStatusIcon(order.status)} {order.status}
                                </span>
                            </div>

                            <div style={{ background: 'var(--glass-bg)', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                                {order.items.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < order.items.length - 1 ? '1px solid var(--glass-border)' : 'none', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{item.medicine_name}</span>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>{item.dosage}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>× {item.quantity}</span>
                                            <span style={{ fontWeight: '700', color: '#10B981', marginLeft: '12px' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <p style={{ margin: 0, fontWeight: '800', fontSize: '20px', color: 'var(--text-main)' }}>
                                    {t('orders.total')}: ₹{order.total_amount?.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyOrders;
