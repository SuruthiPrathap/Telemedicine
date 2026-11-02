import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API } from '../config';

function Register() {
    const { t, i18n } = useTranslation();
    const [form, setForm] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'Patient',
        language: i18n.language 
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch(`${API}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');
            alert(t('register.success'));
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '60px auto' }}>
            <h1 className="page-title" style={{ textAlign: 'center' }}>{t('register.title')}</h1>
            <div className="card" style={{ padding: '40px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>{t('register.name')}</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="John Doe"
                            onChange={e => setForm({...form, name: e.target.value})} 
                        />
                    </div>
                    <div className="input-group">
                        <label>{t('register.email')}</label>
                        <input 
                            type="email" 
                            required 
                            placeholder="email@example.com"
                            onChange={e => setForm({...form, email: e.target.value})} 
                        />
                    </div>
                    <div className="input-group">
                        <label>{t('register.password')}</label>
                        <input 
                            type="password" 
                            required 
                            onChange={e => setForm({...form, password: e.target.value})} 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="input-group">
                            <label>{t('register.role')}</label>
                            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                                <option value="Patient">{t('roles.patient')}</option>
                                <option value="Doctor">{t('roles.doctor')}</option>
                                <option value="Pharmacy">{t('roles.pharmacy')}</option>
                                <option value="Admin">{t('roles.admin')}</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>{t('register.language')}</label>
                            <select value={form.language} onChange={e => setForm({...form, language: e.target.value})}>
                                <option value="en">English</option>
                                <option value="hi">हिंदी</option>
                                <option value="pa">ਪੰਜਾਬੀ</option>
                                <option value="ta">தமிழ்</option>
                            </select>
                        </div>
                    </div>

                    {error && <p style={{ color: 'var(--danger-red)', marginBottom: 12, fontSize: '14px' }}>{error}</p>}
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '16px' }}>
                        {t('register.btn')}
                    </button>
                </form>
                
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        {t('register.haveAccount')} <Link to="/login" style={{ color: 'var(--primary-accent)', fontWeight: '600' }}>{t('register.login')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
