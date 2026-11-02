import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import SymptomChecker from './pages/SymptomChecker';
import Pharmacy from './pages/Pharmacy';
import Prescriptions from './pages/Prescriptions';
import HealthRecords from './pages/HealthRecords';
import AdminDashboard from './pages/AdminDashboard';
import PharmacyAdmin from './pages/PharmacyAdmin';
import VideoCall from './pages/VideoCall';
import LandingPage from './pages/LandingPage';
import MyOrders from './pages/MyOrders';

function MainLayout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Determine what links to show based on Role
  const isPatient = user?.role === 'Patient';
  const isDoctor = user?.role === 'Doctor';
  const isAdmin = user?.role === 'Admin';
  const isPharmacy = user?.role === 'Pharmacy';

  return (
    <div className="app-container">
      <nav className="sidebar">
        <h2>{t('nav.brand')}</h2>
        
        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>{t('sidebar.dashboard')}</Link>
        <Link to="/pharmacy" className={location.pathname === '/pharmacy' ? 'active' : ''}>{t('sidebar.findMedicines')}</Link>

        {isPatient && <Link to="/my-orders" className={location.pathname === '/my-orders' ? 'active' : ''}>{t('sidebar.myOrders')}</Link>}

        {isPharmacy && <Link to="/inventory" className={location.pathname === '/inventory' ? 'active' : ''}>{t('sidebar.manageInventory')}</Link>}

        {isPatient && <Link to="/symptom-checker" className={location.pathname === '/symptom-checker' ? 'active' : ''}>{t('sidebar.symptomChecker')}</Link>}
        
        {(isPatient || isDoctor) && (
          <>
            <Link to="/health-records" className={location.pathname === '/health-records' ? 'active' : ''}>{t('sidebar.healthRecords')}</Link>
            <Link to="/prescriptions" className={location.pathname === '/prescriptions' ? 'active' : ''}>{t('sidebar.prescriptions')}</Link>
            <Link to="/video" className={location.pathname === '/video' ? 'active' : ''}>{t('sidebar.videoConsult')}</Link>
          </>
        )}

        {isAdmin && (
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>{t('sidebar.manageUsers')}</Link>
        )}

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 12 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                    {(user?.name || 'U').charAt(0)}
                </div>
                <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{user?.name || 'User'}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase' }}>{user?.role ? t(`roles.${user.role.toLowerCase()}`) : t('roles.guest')}</p>
                      {user?.role === 'Patient' && user?.patientId && (
                        <p style={{ fontSize: '11px', color: 'var(--primary-accent)', margin: 0, fontWeight: '700' }}>• {user.patientId}</p>
                      )}
                    </div>
                </div>
            </div>

            {/* Language Switcher */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    <span style={{ fontSize: '14px' }}>🌐</span> {t('sidebar.language')}
                </div>
                <select 
                    value={i18n.language} 
                    onChange={(e) => {
                        const newLang = e.target.value;
                        i18n.changeLanguage(newLang);
                        localStorage.setItem('i18nextLng', newLang);
                    }}
                    style={{ 
                        padding: '10px 14px', 
                        fontSize: '13px', 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        color: 'white',
                        cursor: 'pointer',
                        width: '100%',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                </select>
            </div>

            <button onClick={logout} className="btn" style={{ 
                padding: '12px 16px', 
                backgroundColor: 'rgba(239, 68, 68, 0.15)', 
                color: '#ef4444', 
                width: '100%',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                fontSize: '14px'
            }}>
                {t('sidebar.logout')}
            </button>
        </div>
      </nav>
      
      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/symptom-checker" element={<ProtectedRoute allowedRoles={['Patient']}><SymptomChecker /></ProtectedRoute>} />
          <Route path="/pharmacy" element={<Pharmacy />} />
          <Route path="/video" element={<ProtectedRoute allowedRoles={['Patient', 'Doctor']}><VideoCall /></ProtectedRoute>} />
          <Route path="/prescriptions" element={<ProtectedRoute allowedRoles={['Patient', 'Doctor']}><Prescriptions /></ProtectedRoute>} />
          <Route path="/health-records" element={<ProtectedRoute allowedRoles={['Patient', 'Doctor']}><HealthRecords /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute allowedRoles={['Pharmacy']}><PharmacyAdmin /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute allowedRoles={['Patient']}><MyOrders /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* All authenticated dashboard routes go under here */}
        <Route path="/*" element={
            <ProtectedRoute>
                <MainLayout />
            </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
