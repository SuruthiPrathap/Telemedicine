import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { API } from '../config';

function Pharmacy() {
    const { t } = useTranslation();
    const [inventoryItems, setInventoryItems] = useState([]);
    const [nearbyPharmacies, setNearbyPharmacies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [viewMode, setViewMode] = useState('pharmacies');
    const [cart, setCart] = useState({});
    const [orderSuccess, setOrderSuccess] = useState('');
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalSearchQuery, setModalSearchQuery] = useState('');
    const { token } = useAuth();

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
                    setUserLocation(loc);
                    fetchData(loc.lat, loc.lng);
                },
                () => fetchData()
            );
        } else {
            fetchData();
        }
    }, [token]);

    const fetchData = (lat, lng) => {
        const params = (lat && lng) ? `?lat=${lat}&lng=${lng}` : '';
        
        Promise.all([
            fetch(`${API}/api/pharmacy/inventory${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(r => r.json()),
            fetch(`${API}/api/public/pharmacies${params}`).then(r => r.json())
        ]).then(([inv, pharms]) => {
            setInventoryItems(Array.isArray(inv) ? inv : []);
            setNearbyPharmacies(Array.isArray(pharms) ? pharms : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    const getStatusStyle = (status) => {
        if (status === 'In Stock') return { color: '#10B981' };
        if (status === 'Waiting for Delivery') return { color: '#F59E0B' };
        return { color: '#EF4444' };
    };

    const getStatusText = (status) => {
        if (status === 'In Stock') return t('pharmacy.inStock');
        if (status === 'Waiting for Delivery') return t('pharmacy.waiting');
        if (status === 'Out of Stock') return t('pharmacy.outOfStock');
        return status;
    };

    const addToCart = (item) => {
        const key = `${item.pharmacy_user_id}_${item.id}`;
        setCart(prev => ({
            ...prev,
            [key]: {
                ...item,
                qty: (prev[key]?.qty || 0) + 1
            }
        }));
    };

    const removeFromCart = (key) => {
        setCart(prev => {
            const next = { ...prev };
            if (next[key].qty > 1) next[key] = { ...next[key], qty: next[key].qty - 1 };
            else delete next[key];
            return next;
        });
    };

    const placeOrder = async (pharmacyUserId) => {
        const items = Object.values(cart)
            .filter(c => c.pharmacy_user_id === pharmacyUserId)
            .map(c => ({ medicine_id: c.id, quantity: c.qty }));
        
        if (items.length === 0) return false;
        try {
            const res = await fetch(`${API}/api/orders`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ pharmacy_user_id: pharmacyUserId, items })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            // Clear cart items for this pharmacy
            setCart(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(k => { if (k.startsWith(pharmacyUserId)) delete next[k]; });
                return next;
            });
            setOrderSuccess(`Order placed! Total: ₹${data.total_amount?.toFixed(2)}. Order ID: ${data.order_id?.slice(-8).toUpperCase()}`);
            setTimeout(() => setOrderSuccess(''), 5000);
            return true;
        } catch (err) {
            alert(err.message || 'Failed to place order');
            return false;
        }
    };

    const filteredItems = inventoryItems.filter(item =>
        item.medicine_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.pharmacy_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupedData = filteredItems.reduce((acc, item) => {
        const key = item.pharmacy_user_id || item.pharmacy_name;
        if (!acc[key]) {
            acc[key] = {
                pharmacy_name: item.pharmacy_name,
                address: item.address || 'Address not listed',
                distance: item.distance || 'Unknown',
                pharmacy_user_id: item.pharmacy_user_id,
                medicines: []
            };
        }
        acc[key].medicines.push(item);
        return acc;
    }, {});

    const cartTotal = Object.values(cart).reduce((sum, c) => sum + (c.price * c.qty), 0);
    const cartCount = Object.values(cart).reduce((sum, c) => sum + c.qty, 0);

    const tabBtn = (mode, emoji, label) => (
        <button onClick={() => setViewMode(mode)} style={{
            padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: 'none',
            borderBottom: viewMode === mode ? '3px solid var(--primary-accent)' : '3px solid transparent',
            background: viewMode === mode ? 'rgba(99,102,241,0.08)' : 'transparent',
            color: viewMode === mode ? 'var(--primary-accent)' : 'var(--text-muted)',
            borderRadius: '8px 8px 0 0', transition: 'all 0.3s ease'
        }}>{emoji} {label}</button>
    );

    return (
        <div>
            <h1 className="page-title">{t('pharmacy.title')}</h1>

            {userLocation && (
                <div style={{ padding: '10px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📍 {t('pharmacy.locationDetected')}
                </div>
            )}

            {orderSuccess && (
                <div style={{ padding: '14px 20px', background: 'rgba(16,185,129,0.15)', border: '1px solid #10B981', borderRadius: '10px', marginBottom: '16px', color: '#10B981', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>✅ {orderSuccess}</span>
                    <Link to="/my-orders" style={{ color: '#10B981', textDecoration: 'underline', fontSize: '13px' }}>{t('sidebar.myOrders')}</Link>
                </div>
            )}

            {/* Cart Banner */}
            {cartCount > 0 && (
                <div style={{ padding: '14px 20px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600' }}>🛒 {cartCount} {t('pharmacy.itemsInCart')} — ₹{cartTotal.toFixed(2)}</span>
                </div>
            )}

            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)' }}>
                {tabBtn('pharmacies', '🏥', t('pharmacy.nearbyPharmacies'))}
                {tabBtn('medicines', '💊', t('pharmacy.allMedicines'))}
            </div>

            {/* Nearby Pharmacies View */}
            {viewMode === 'pharmacies' && (
                <div>
                    {loading ? <p>{t('pharmacy.loading')}</p> : (
                        nearbyPharmacies.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                <p style={{ fontSize: '48px', margin: '0 0 12px' }}>🏥</p>
                                <p>{t('pharmacy.noPharmacies')}</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                                {nearbyPharmacies.map((pharm, idx) => (
                                    <div key={idx} className="card" style={{ padding: '24px', marginBottom: 0, transition: 'all 0.3s ease', cursor: 'pointer', border: '1px solid var(--glass-border)', position: 'relative', overflow: 'hidden' }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'translateY(-6px)';
                                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(99, 102, 241, 0.15)';
                                            e.currentTarget.style.borderColor = 'var(--primary-accent)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.borderColor = 'var(--glass-border)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                            <div>
                                                <h3 style={{ color: 'var(--primary-accent)', margin: '0 0 6px', fontSize: '20px', fontWeight: '700' }}>{pharm.name}</h3>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>📍 {pharm.address}</p>
                                            </div>
                                            {pharm.distance !== 'Unknown' && (
                                                <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', whiteSpace: 'nowrap' }}>
                                                    {pharm.distance}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
                                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>💊 {pharm.medicines_in_stock} {t('pharmacy.medsAvailable')}</span>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button className="btn" onClick={(e) => { e.stopPropagation(); setViewMode('medicines'); setSearchQuery(pharm.name); }} style={{ padding: '8px 14px', fontSize: '12px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-muted)' }}>
                                                    {t('pharmacy.viewMedicines')}
                                                </button>
                                                <button className="btn" onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    setSelectedPharmacy(pharm);
                                                    setIsModalOpen(true);
                                                    setModalSearchQuery('');
                                                }} style={{ padding: '8px 14px', fontSize: '12px', background: 'var(--primary-gradient)', color: 'white', border: 'none', fontWeight: '700', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                                                    🛒 {t('pharmacy.buyMedicine')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            )}

            {/* All Medicines View */}
            {viewMode === 'medicines' && (
                <div>
                    <div className="input-group" style={{ maxWidth: '600px', marginBottom: '24px' }}>
                        <input type="text" placeholder={t('pharmacy.searchPlaceholder')}
                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ fontSize: '16px', padding: '14px 20px', borderRadius: '30px', width: '100%', boxSizing: 'border-box' }} />
                    </div>

                    {loading ? <p>{t('pharmacy.loading')}</p> : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
                            {Object.keys(groupedData).length === 0 && <p style={{ color: 'var(--text-muted)' }}>{t('pharmacy.noMedicines')}</p>}

                            {Object.entries(groupedData).map(([key, pharmacy]) => {
                                const pharmacyCartItems = Object.entries(cart).filter(([k]) => k.startsWith(pharmacy.pharmacy_user_id));
                                const pharmacyTotal = pharmacyCartItems.reduce((s, [, c]) => s + c.price * c.qty, 0);
                                
                                return (
                                    <div key={key} className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', marginBottom: '16px' }}>
                                            <h3 style={{ color: 'var(--primary-accent)', marginBottom: 6, fontSize: '20px' }}>{pharmacy.pharmacy_name}</h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                <span>📍 {pharmacy.address}</span>
                                                <span>•</span>
                                                <span style={{ color: '#10B981', fontWeight: 'bold' }}>{pharmacy.distance}</span>
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                                            {pharmacy.medicines.map(med => {
                                                const cartKey = `${med.pharmacy_user_id}_${med.id}`;
                                                const inCart = cart[cartKey];
                                                return (
                                                    <div key={med.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--glass-bg)', padding: '12px 14px', borderRadius: '8px', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <span style={{ fontWeight: '600', color: 'var(--text-main)', display: 'block' }}>{med.medicine_name}</span>
                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{med.dosage || t('pharmacy.standardDosage')}</span>
                                                                {med.price > 0 && <span style={{ fontSize: '13px', color: '#10B981', fontWeight: '700' }}>₹{med.price}</span>}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                                            <span style={{ fontWeight: '700', fontSize: '11px', padding: '3px 10px', borderRadius: '12px', ...getStatusStyle(med.status), background: med.status === 'In Stock' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                                                                {getStatusText(med.status)}
                                                            </span>
                                                            {med.status === 'In Stock' && (
                                                                inCart ? (
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                        <button onClick={() => removeFromCart(cartKey)} style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'rgba(239,68,68,0.1)', color: '#EF4444', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                                                                        <span style={{ fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{inCart.qty}</span>
                                                                        <button onClick={() => addToCart(med)} style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'rgba(16,185,129,0.1)', color: '#10B981', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                                                                    </div>
                                                                ) : (
                                                                    <button onClick={() => addToCart(med)} style={{ padding: '5px 12px', fontSize: '11px', borderRadius: '6px', border: '1px solid var(--primary-accent)', background: 'rgba(99,102,241,0.1)', color: 'var(--primary-accent)', cursor: 'pointer', fontWeight: '600' }}>
                                                                        🛒 {t('pharmacy.buy')}
                                                                    </button>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {pharmacyCartItems.length > 0 && (
                                            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: '600', fontSize: '15px' }}>Subtotal: ₹{pharmacyTotal.toFixed(2)}</span>
                                                <button className="btn btn-primary" onClick={() => placeOrder(pharmacy.pharmacy_user_id)} style={{ padding: '10px 20px', fontSize: '13px' }}>
                                                    {t('pharmacy.placeOrder')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Quick Buy Modal */}
            {isModalOpen && selectedPharmacy && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setIsModalOpen(false)}>
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '24px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', animation: 'modalSlideUp 0.3s ease-out' }} onClick={e => e.stopPropagation()}>
                        <style>{`
                            @keyframes modalSlideUp {
                                from { opacity: 0; transform: translateY(20px) scale(0.95); }
                                to { opacity: 1; transform: translateY(0) scale(1); }
                            }
                        `}</style>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', position: 'relative' }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                            <h2 style={{ margin: 0, color: 'var(--primary-accent)', fontSize: '24px' }}>{selectedPharmacy.name}</h2>
                            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>📍 {selectedPharmacy.address}</p>
                        </div>

                        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                            <div className="input-group" style={{ marginBottom: '20px' }}>
                                <input 
                                    type="text" 
                                    placeholder={t('pharmacy.searchPlaceholder')}
                                    value={modalSearchQuery} 
                                    onChange={(e) => setModalSearchQuery(e.target.value)}
                                    style={{ fontSize: '15px', padding: '12px 20px', borderRadius: '12px', width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }} 
                                    autoFocus
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {inventoryItems
                                    .filter(item => 
                                        item.pharmacy_user_id === selectedPharmacy.owner_id && 
                                        item.medicine_name.toLowerCase().includes(modalSearchQuery.toLowerCase())
                                    )
                                    .map(med => {
                                        const cartKey = `${med.pharmacy_user_id}_${med.id}`;
                                        const inCart = cart[cartKey];
                                        return (
                                            <div key={med.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ fontWeight: '600', color: 'white', display: 'block', fontSize: '16px' }}>{med.medicine_name}</span>
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{med.dosage || t('pharmacy.standardDosage')}</span>
                                                        <span style={{ fontSize: '14px', color: '#10B981', fontWeight: '700' }}>₹{med.price}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    {med.status === 'In Stock' && (
                                                        inCart ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '30px', border: '1px solid var(--glass-border)' }}>
                                                                <button onClick={() => removeFromCart(cartKey)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#EF4444', cursor: 'pointer', fontWeight: 'bold' }}>−</button>
                                                                <span style={{ fontWeight: '700', minWidth: '24px', textAlign: 'center' }}>{inCart.qty}</span>
                                                                <button onClick={() => addToCart(med)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'rgba(16,185,129,0.1)', color: '#10B981', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => addToCart(med)} style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-gradient)', color: 'white', cursor: 'pointer', fontWeight: '600' }}>
                                                                {t('pharmacy.buy')}
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>

                        {Object.entries(cart).filter(([k]) => k.startsWith(selectedPharmacy.owner_id)).length > 0 && (
                            <div style={{ padding: '24px', borderTop: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>{t('pharmacy.itemsInCart')}</span>
                                    <span style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>
                                        ₹{Object.entries(cart)
                                            .filter(([k]) => k.startsWith(selectedPharmacy.owner_id))
                                            .reduce((s, [, c]) => s + c.price * c.qty, 0)
                                            .toFixed(2)}
                                    </span>
                                </div>
                                <button className="btn btn-primary" onClick={async () => { 
                                    const success = await placeOrder(selectedPharmacy.owner_id); 
                                    if (success) setIsModalOpen(false); 
                                }} style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '12px' }}>
                                    {t('pharmacy.placeOrder')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Pharmacy;
