import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '../i18n';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { id, name, role, language }
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            const savedLang = localStorage.getItem('i18nextLng');
            if (savedLang) {
                i18n.changeLanguage(savedLang);
            }

            if (token) {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    // User preference overrides manual session change if it exists
                    if (parsedUser.language) {
                        i18n.changeLanguage(parsedUser.language);
                    }
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, [token]);

    const login = (jwtData, userData) => {
        setToken(jwtData);
        setUser(userData);
        localStorage.setItem('token', jwtData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Apply user's language preference during login
        if (userData.language) {
            i18n.changeLanguage(userData.language);
        }
        
        navigate('/dashboard');
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('i18nextLng');
        i18n.changeLanguage('en');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
