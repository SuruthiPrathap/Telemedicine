import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { API } from '../config';

function PharmacyAdmin() {
    const { t } = useTranslation();
    const [inventory, setInventory] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'profile' | 'orders'
    const { token } = useAuth();
    
    // Form State
    const [form, setForm] = useState({ medicine_name: '', dosage: '', status: 'In Stock', price: '', quantity: '', description: '', category: 'General' });

    // Profile State
    const [profile, setProfile] = useState({ name: '', address: '', latitude: '', longitude: '' });
    const [profileSaved, setProfileSaved] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);

    const fetchInventory = () => {
        fetch(`${API}/api/pharmacy/inventory`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setInventory(Array.isArray(data) ? data : []);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    const fetchProfile = () => {
        fetch(`${API}/api/pharmacy/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data && data.name) {
                setProfile({
                    name: data.name || '',
                    address: data.address || '',
                    latitude: data.location?.coordinates?.[1]?.toString() || '',
                    longitude: data.location?.coordinates?.[0]?.toString() || ''
                });
            }
        })
        .catch(err => console.error(err));
    };

    const fetchOrders = () => {
        fetch(`${API}/api/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setOrders(Array.isArray(data) ? data : []))
        .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchInventory();
        fetchProfile();
        fetchOrders();
    }, [token]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API}/api/pharmacy/profile`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profile)
            });
            if (!res.ok) throw new Error('Failed to save profile');
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 3000);
        } catch(err) {
            alert(err.message);
        }
    };

    const detectLocation = () => {
        if (!("geolocation" in navigator)) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setProfile(prev => ({
                    ...prev,
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6)
                }));
                setDetectingLocation(false);
            },
            (error) => {
                alert("Could not detect location: " + error.message);
                setDetectingLocation(false);
            }
        );
    };

    const handleAddMedicine = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API}/api/pharmacy/inventory`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...form,
                    price: parseFloat(form.price) || 0,
                    quantity: parseInt(form.quantity) || 0
                })
            });
            if (!res.ok) throw new Error('Failed to add medicine');
            setForm({ medicine_name: '', dosage: '', status: 'In Stock', price: '', quantity: '', description: '', category: 'General' });
            fetchInventory();
        } catch(err) {
            alert(err.message);
        }
    };

    const handleUpdateMedicine = async (id, updates) => {
        try {
            const res = await fetch(`${API}/api/pharmacy/inventory/${id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });
            if (!res.ok) throw new Error('Failed to update medicine');
            fetchInventory();
        } catch(err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this medicine?")) return;
        try {
            const res = await fetch(`${API}/api/pharmacy/inventory/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete medicine');
            fetchInventory();
        } catch(err) {
            alert(err.message);
        }
    };

    const handleOrderStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch(`${API}/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error('Failed to update order');
            fetchOrders();
        } catch(err) {
            alert(err.message);
        }
    };

    const getStatusStyle = (status) => {
        if (status === 'In Stock') return { color: 'var(--success-green)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success-green)' };
        if (status === 'Waiting for Delivery') return { color: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #F59E0B' };
        return { color: 'var(--danger-red)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-red)' };
    };

    const getStatusText = (status) => {
        if (status === 'In Stock') return t('pharmacy.inStock');
        if (status === 'Waiting for Delivery') return t('pharmacy.waiting');
        if (status === 'Out of Stock') return t('pharmacy.outOfStock');
        return status;
    };

    const getOrderStatusStyle = (status) => {
        const styles = {
            'Pending': { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: '#F59E0B' },
            'Confirmed': { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', border: '#3B82F6' },
            'Ready for Pickup': { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', border: '#8B5CF6' },
            'Completed': { color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: '#10B981' },
            'Cancelled': { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: '#EF4444' }
        };
        const s = styles[status] || styles['Pending'];
        return { color: s.color, background: s.bg, border: `1px solid ${s.border}` };
    };

    const inStockItems = inventory.filter(i => i.status !== 'Out of Stock');
    const outOfStockItems = inventory.filter(i => i.status === 'Out of Stock');

    const tabStyle = (tab) => ({
        padding: '12px 28px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        border: 'none',
        borderBottom: activeTab === tab ? '3px solid var(--primary-accent)' : '3px solid transparent',
        background: activeTab === tab ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
        color: activeTab === tab ? 'var(--primary-accent)' : 'var(--text-muted)',
        transition: 'all 0.3s ease',
        borderRadius: '8px 8px 0 0'
    });

    const InventoryCard = ({ item }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [editPrice, setEditPrice] = useState(item.price);

        const handleSavePrice = () => {
            handleUpdateMedicine(item.id, { price: parseFloat(editPrice) || 0 });
            setIsEditing(false);
        };

        return (
            <div className="card" style={{ marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '18px', color: 'var(--text-main)', margin: 0 }}>{item.medicine_name}</h4>
                        <span style={{ fontSize: '14px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>{item.dosage || 'N/A'}</span>
                        
                        {isEditing ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input 
                                    type="number" 
                                    value={editPrice} 
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    style={{ width: '80px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--primary-accent)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                />
                                <button onClick={handleSavePrice} style={{ padding: '4px 8px', background: 'var(--success-green)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✓</button>
                                <button onClick={() => setIsEditing(false)} style={{ padding: '4px 8px', background: 'var(--danger-red)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                            </div>
                        ) : (
                            <span 
                                onClick={() => setIsEditing(true)} 
                                style={{ fontSize: '16px', color: '#10B981', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="Click to edit price"
                            >
                                ₹{item.price} ✎
                            </span>
                        )}

                        {item.quantity > 0 && <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Qty: {item.quantity}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                        <button className="btn" onClick={() => handleUpdateMedicine(item.id, { status: 'In Stock' })} style={{ padding: '4px 10px', fontSize: '12px', opacity: item.status === 'In Stock' ? 0.3 : 1 }} disabled={item.status === 'In Stock'}>
                            {t('pharmacy.setInStock')}
                        </button>
                        <button className="btn" onClick={() => handleUpdateMedicine(item.id, { status: 'Out of Stock' })} style={{ padding: '4px 10px', fontSize: '12px', opacity: item.status === 'Out of Stock' ? 0.3 : 1 }} disabled={item.status === 'Out of Stock'}>
                            {t('pharmacy.setOutOfStock')}
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDelete(item.id)} style={{ padding: '4px 10px', fontSize: '12px' }}>
                            {t('pharmacy.remove')}
                        </button>
                    </div>
                </div>
                <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', ...getStatusStyle(item.status) }}>
                    {getStatusText(item.status)}
                </span>
            </div>
        );
    };

    return (
        <div>
            <h1 className="page-title">{t('pharmacy.adminTitle')}</h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: 0 }}>
                <button style={tabStyle('profile')} onClick={() => setActiveTab('profile')}>
                    🏪 {t('pharmacy.profileTab')}
                </button>
                <button style={tabStyle('inventory')} onClick={() => setActiveTab('inventory')}>
                    💊 {t('pharmacy.inventoryTab')}
                </button>
                <button style={tabStyle('orders')} onClick={() => setActiveTab('orders')}>
                    📦 {t('pharmacy.ordersTab')} {orders.length > 0 && <span style={{ background: 'var(--primary-accent)', color: '#fff', borderRadius: '50%', padding: '2px 7px', fontSize: '11px', marginLeft: '6px' }}>{orders.filter(o => o.status === 'Pending').length || ''}</span>}
                </button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="card" style={{ borderColor: 'var(--primary-accent)', padding: '30px' }}>
                    <h3 style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🏪 {t('pharmacy.profileTitle')}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                        {t('pharmacy.profileDesc')}
                    </p>

                    {profileSaved && (
                        <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.15)', border: '1px solid #10B981', borderRadius: '8px', color: '#10B981', marginBottom: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            ✅ {t('pharmacy.profileSaved')}
                        </div>
                    )}

                    <form onSubmit={handleSaveProfile}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>{t('pharmacy.pharmacyName')}</label>
                                <input type="text" placeholder="e.g. MedPlus Pharmacy" required value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>{t('pharmacy.pharmacyAddress')}</label>
                                <input type="text" placeholder="e.g. 123 Main St, Village Name" required value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', marginBottom: '20px', alignItems: 'end' }}>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>{t('pharmacy.latitude')}</label>
                                <input type="text" placeholder="e.g. 13.0827" value={profile.latitude} onChange={e => setProfile({...profile, latitude: e.target.value})} />
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>{t('pharmacy.longitude')}</label>
                                <input type="text" placeholder="e.g. 80.2707" value={profile.longitude} onChange={e => setProfile({...profile, longitude: e.target.value})} />
                            </div>
                            <button type="button" onClick={detectLocation} className="btn" style={{ padding: '14px 20px', height: 'fit-content', whiteSpace: 'nowrap' }} disabled={detectingLocation}>
                                {detectingLocation ? '📡 Detecting...' : '📍 ' + t('pharmacy.detectLocation')}
                            </button>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ padding: '14px 32px' }}>
                            💾 {t('pharmacy.saveProfile')}
                        </button>
                    </form>
                </div>
            )}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
                <>
                    <div className="card" style={{ borderColor: 'var(--primary-accent)', padding: '30px' }}>
                        <h3 style={{ marginBottom: '20px' }}>{t('pharmacy.addTitle')}</h3>
                        <form onSubmit={handleAddMedicine}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('pharmacy.medName')}</label>
                                    <input type="text" placeholder="e.g. Amoxicillin" required value={form.medicine_name} onChange={e => setForm({...form, medicine_name: e.target.value})} />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('pharmacy.dosage')}</label>
                                    <input type="text" placeholder="e.g. 500mg" value={form.dosage} onChange={e => setForm({...form, dosage: e.target.value})} />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('pharmacy.price')} *</label>
                                    <input type="number" placeholder="₹ 0" min="0" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('pharmacy.quantity')}</label>
                                    <input type="number" placeholder="0" min="0" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('pharmacy.initialStatus')}</label>
                                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                                        <option value="In Stock">{t('pharmacy.inStock')}</option>
                                        <option value="Waiting for Delivery">{t('pharmacy.waiting')}</option>
                                        <option value="Out of Stock">{t('pharmacy.outOfStock')}</option>
                                    </select>
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('pharmacy.category')}</label>
                                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                                        <option value="General">General</option>
                                        <option value="Antibiotics">Antibiotics</option>
                                        <option value="Pain Relief">Pain Relief</option>
                                        <option value="Vitamins">Vitamins</option>
                                        <option value="Chronic Care">Chronic Care</option>
                                        <option value="First Aid">First Aid</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ padding: '14px 24px', height: 'fit-content' }}>{t('pharmacy.addBtn')}</button>
                            </div>
                        </form>
                    </div>

                    <div style={{ marginTop: '40px' }}>
                        {loading ? <p>{t('pharmacy.loadingInv')}</p> : (
                            <>
                                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                                    <div className="card" style={{ flex: 1, padding: '20px', borderLeft: '4px solid var(--success-green)' }}>
                                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{t('pharmacy.inStockItems')}</p>
                                        <h2 style={{ margin: 0 }}>{inStockItems.length}</h2>
                                    </div>
                                    <div className="card" style={{ flex: 1, padding: '20px', borderLeft: '4px solid var(--danger-red)' }}>
                                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{t('pharmacy.outOfStockItems')}</p>
                                        <h2 style={{ margin: 0 }}>{outOfStockItems.length}</h2>
                                    </div>
                                </div>

                                <h3 style={{ marginBottom: '16px', color: 'var(--success-green)' }}>{t('pharmacy.detailedStock')}</h3>
                                {inventory.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>{t('pharmacy.noMedicinesReg')}</p> : (
                                    <div style={{ display: 'grid', gap: '16px' }}>
                                        {inventory.sort((a,b) => a.medicine_name.localeCompare(b.medicine_name)).map(item => <InventoryCard key={item.id} item={item} />)}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div>
                    <h3 style={{ marginBottom: '16px', color: 'var(--primary-accent)' }}>📦 {t('pharmacy.incomingOrders')}</h3>
                    {orders.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            <p style={{ fontSize: '48px', margin: '0 0 12px 0' }}>📭</p>
                            <p>{t('pharmacy.noOrders')}</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {orders.map(order => (
                                <div key={order._id} className="card" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Order #{order._id.slice(-8).toUpperCase()}</p>
                                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                                                {new Date(order.order_date).toLocaleDateString()} • {new Date(order.order_date).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <span style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', ...getOrderStatusStyle(order.status) }}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div style={{ background: 'var(--glass-bg)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: idx < order.items.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                                                <span>{item.medicine_name} ({item.dosage}) × {item.quantity}</span>
                                                <span style={{ fontWeight: '600', color: '#10B981' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p style={{ margin: 0, fontWeight: '700', fontSize: '18px' }}>Total: ₹{order.total_amount?.toFixed(2)}</p>
                                        {order.status === 'Pending' && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button className="btn btn-primary" onClick={() => handleOrderStatus(order._id, 'Confirmed')} style={{ padding: '8px 16px', fontSize: '12px' }}>
                                                    ✅ Confirm
                                                </button>
                                                <button className="btn btn-danger" onClick={() => handleOrderStatus(order._id, 'Cancelled')} style={{ padding: '8px 16px', fontSize: '12px' }}>
                                                    ❌ Cancel
                                                </button>
                                            </div>
                                        )}
                                        {order.status === 'Confirmed' && (
                                            <button className="btn" onClick={() => handleOrderStatus(order._id, 'Ready for Pickup')} style={{ padding: '8px 16px', fontSize: '12px', background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid #8B5CF6' }}>
                                                📦 Ready for Pickup
                                            </button>
                                        )}
                                        {order.status === 'Ready for Pickup' && (
                                            <button className="btn" onClick={() => handleOrderStatus(order._id, 'Completed')} style={{ padding: '8px 16px', fontSize: '12px', background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid #10B981' }}>
                                                ✅ Mark Completed
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default PharmacyAdmin;
