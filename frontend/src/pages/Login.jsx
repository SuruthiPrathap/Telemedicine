import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { API } from '../config';

function Login() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch(`${API}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if (res.status === 404 && data.error === 'USER_NOT_FOUND') {
                setError('User not found. Redirecting to registration...');
                setTimeout(() => window.location.href = '/register', 2000);
                return;
            }

            if (!res.ok) throw new Error(data.error || 'Login failed');
            
            login(data.token, data.user);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '80px auto' }}>
            <h1 className="page-title" style={{ textAlign: 'center' }}>{t('login.title')}</h1>
            <div className="card" style={{ padding: '40px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>{t('login.email')}</label>
                        <input type="email" required placeholder="email@example.com" onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <label>{t('login.password')}</label>
                        <input type="password" required onChange={e => setPassword(e.target.value)} />
                    </div>
                    {error && <p style={{ color: 'var(--danger-red)', marginBottom: 12, fontSize: '14px' }}>{error}</p>}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', marginTop: '10px' }}>
                        {t('login.btn')}
                    </button>
                </form>
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        {t('login.noAccount')} <Link to="/register" style={{ color: 'var(--primary-accent)', fontWeight: '600' }}>{t('login.register')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
