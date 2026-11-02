import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { API } from '../config';

function Prescriptions() {
    const { t } = useTranslation();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token, user } = useAuth();

    // Doctor Form State
    const [form, setForm] = useState({ patient_id: '', medicines: '', dosage: '' });
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchPrescriptions = () => {
        fetch(`${API}/api/prescriptions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setPrescriptions(data);
            setLoading(false);
        })
        .catch(err => {
            setError(t('prescriptions.noPrescriptions'));
            setLoading(false);
        });
    };

    const fetchPatients = () => {
        fetch(`${API}/api/patients`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setPatients(Array.isArray(data) ? data : []);
        })
        .catch(err => console.error('Error fetching patients:', err));
    };

    useEffect(() => {
        fetchPrescriptions();
        if (user?.role === 'Doctor') {
            fetchPatients();
        }
    }, [token, user]);

    const handleCreatePrescription = async (e) => {
        e.preventDefault();
        setError('');
        // Resolve the patient: selected from list, or typed exactly (ID or name)
        const typed = searchTerm.trim().toLowerCase();
        const match = patients.find(p => (p.patientId || '').toLowerCase() === typed || (p.name || '').toLowerCase() === typed);
        const patientId = form.patient_id || match?.patientId || '';
        if (!patientId) {
            setError('Please select a patient from the list (search by name or Patient ID, then click the patient).');
            return;
        }
        try {
            const res = await fetch(`${API}/api/prescriptions`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...form, patient_id: patientId })
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || errData.details || 'Failed to create prescription');
            }
            setForm({ patient_id: '', medicines: '', dosage: '' });
            setSearchTerm('');
            fetchPrescriptions(); // Refresh list
        } catch(err) {
            console.error('Prescription creation error:', err);
            setError(err.message === 'Failed to fetch' 
                ? 'Network Error: Cannot reach server or request blocked.'
                : `Error: ${err.message}`);
        }
    };

    const downloadPDF = (id) => {
        alert(`Generating PDF for prescription #${id}. \n(Requires backend PDF stream setup)`);
    };

    const filteredPatients = patients.filter(p => 
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.patientId || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isDoctor = user?.role === 'Doctor';

    return (
        <div>
            <h1 className="page-title">{isDoctor ? t('prescriptions.titleDoctor') : t('prescriptions.titlePatient')}</h1>
            
            {error && <div className="alert-warning" style={{ backgroundColor: '#FEF2F2', color: 'var(--danger-red)' }}>{error}</div>}

            {isDoctor && (
                <div className="card" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', overflow: 'visible' }}>
                    <h3 style={{ marginBottom: 24, color: 'var(--success-green)' }}>{t('prescriptions.issueTitle')}</h3>
                    <form onSubmit={handleCreatePrescription} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="input-group" style={{ position: 'relative' }}>
                            <label>{t('health.patientId')}</label>
                            <div className="searchable-dropdown" ref={dropdownRef}>
                                <input 
                                    type="text" 
                                    placeholder={form.patient_id ? `${form.patient_id}` : "Search by name or ID..."}
                                    value={searchTerm} 
                                    onChange={e => {
                                        setSearchTerm(e.target.value);
                                        setForm(f => ({ ...f, patient_id: '' }));
                                        setShowDropdown(true);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    autoComplete="off"
                                />
                                {showDropdown && (
                                    <div className="dropdown-list">
                                        {filteredPatients.length > 0 ? (
                                            filteredPatients.map(p => (
                                                <div 
                                                    key={p.patientId} 
                                                    className="dropdown-item"
                                                    onClick={() => {
                                                        setForm({ ...form, patient_id: p.patientId });
                                                        setSearchTerm(p.name);
                                                        setShowDropdown(false);
                                                    }}
                                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                                >
                                                    <span className="patient-name" style={{ fontWeight: '600' }}>{p.name}</span>
                                                    <span className="patient-id" style={{ 
                                                        backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                                                        color: 'var(--primary-accent)', 
                                                        padding: '2px 8px', 
                                                        borderRadius: '4px', 
                                                        fontWeight: 'bold',
                                                        fontSize: '11px'
                                                    }}>
                                                        {p.patientId}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-results">No patients found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {form.patient_id && !searchTerm.includes(form.patient_id) && (
                                <small style={{ marginTop: 8, color: 'var(--success-green)', fontWeight: 500 }}>
                                    Selected: {form.patient_id}
                                </small>
                            )}
                        </div>
                        <div className="input-group">
                            <label>{t('prescriptions.medicines')}</label>
                            <textarea required placeholder="Enter medicines..." value={form.medicines} onChange={e => setForm({...form, medicines: e.target.value})}></textarea>
                        </div>
                        <div className="input-group">
                            <label>{t('prescriptions.dosage')}</label>
                            <input type="text" required value={form.dosage} onChange={e => setForm({...form, dosage: e.target.value})} />
                        </div>
                        <button type="submit" className="btn btn-success" style={{ width: '200px' }}>{t('prescriptions.submitBtn')}</button>
                    </form>
                </div>
            )}

            <hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

            {loading ? <p>{t('prescriptions.loading')}</p> : prescriptions.length === 0 ? <p>{t('prescriptions.noPrescriptions')}</p> : (
                prescriptions.map(presc => (
                    <div key={presc._id || presc.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ color: 'var(--primary-blue)' }}>{t('prescriptions.prescBy')} {presc.doctor_name}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: 16 }}>{t('prescriptions.dateAdded')}: {new Date(presc.date).toLocaleDateString()}</p>
                                
                                {isDoctor && <p style={{ marginBottom: 8, fontWeight: 'bold' }}>{t('prescriptions.forPatient')}: {presc.patient_id_short || presc.patient_id}</p>}

                                <h4 style={{ marginBottom: 4 }}>{t('prescriptions.medicines')}</h4>
                                <p style={{ marginBottom: 12 }}>{presc.medicines}</p>
                                
                                <h4 style={{ marginBottom: 4 }}>{t('prescriptions.dosage')}</h4>
                                <p>{presc.dosage}</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => downloadPDF(presc._id || presc.id)}>
                                {t('prescriptions.downloadPDF')}
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default Prescriptions;