import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { API } from '../config';

// Load pdf.js dynamically
const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
const PDFJS_WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

function HealthRecords() {
    const { t } = useTranslation();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token, user } = useAuth();
    
    // Doctor Upload State
    const [form, setForm] = useState({ patient_id: '', details: '' });
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [readingFile, setReadingFile] = useState(false);

    const fetchRecords = () => {
        fetch(`${API}/api/health-records`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setRecords(data);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    const fetchPatients = () => {
        fetch(`${API}/api/patients`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setPatients(Array.isArray(data) ? data : []))
        .catch(err => console.error('Error fetching patients:', err));
    };

    useEffect(() => {
        fetchRecords();
        if (user?.role === 'Doctor') fetchPatients();
    }, [token, user]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setReadingFile(true);
        setForm(prev => ({ ...prev, file }));

        if (file.type === 'application/pdf') {
            try {
                // Load pdf.js if not loaded
                if (!window.pdfjsLib) {
                    const script = document.createElement('script');
                    script.src = PDFJS_CDN;
                    document.head.appendChild(script);
                    await new Promise(r => script.onload = r);
                }
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let fullText = '';
                
                // Read first 3 pages (to avoid huge extraction)
                const numPages = Math.min(pdf.numPages, 3);
                for (let i = 1; i <= numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n\n';
                }

                setForm(prev => ({ 
                    ...prev, 
                    details: fullText.trim() || `Document: ${file.name}\n(No selectable text found in PDF)` 
                }));
            } catch (err) {
                console.error('PDF extraction error:', err);
                setForm(prev => ({ ...prev, details: `Document: ${file.name}\n(Error extracting text)` }));
            }
        } else if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (event) => {
                setForm(prev => ({ ...prev, details: event.target.result.slice(0, 5000) }));
            };
            reader.readAsText(file);
        } else {
            setForm(prev => ({ 
                ...prev, 
                details: `Document: ${file.name}\nType: ${file.type}\nSize: ${(file.size / 1024).toFixed(2)} KB\n\n[Clinical summary...]` 
            }));
        }
        setReadingFile(false);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!form.file && !isDoctor) return alert('Please select a file');

        const typed = searchTerm.trim().toLowerCase();
        const match = patients.find(p => (p.patientId || '').toLowerCase() === typed || (p.name || '').toLowerCase() === typed);
        const patientId = form.patient_id || match?.patientId || '';
        if (isDoctor && !patientId) return alert('Please select a patient from the list first.');

        const formData = new FormData();
        formData.append('details', form.details);
        if (patientId) formData.append('patient_id', patientId);
        if (form.file) formData.append('file', form.file);

        try {
            const res = await fetch(`${API}/api/health-records`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`
                    // Don't set Content-Type, browser will do it for FormData
                },
                body: formData
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Upload failed');
            }
            setForm({ patient_id: '', details: '', file: null });
            setSearchTerm('');
            fetchRecords();
        } catch(err) {
            alert(err.message);
        }
    };

    const filteredPatients = (Array.isArray(patients) ? patients : []).filter(p => 
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.patientId || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleVerify = async (id) => {

        try {
            const res = await fetch(`${API}/api/health-records/${id}/verify`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Verification failed');
            fetchRecords();
        } catch(err) {
            alert(err.message);
        }
    };

    const isDoctor = user?.role === 'Doctor';
    const isAdmin = user?.role === 'Admin';

    return (
        <div>
            <h1 className="page-title">{t('health.title')}</h1>
            
            {(isDoctor || user?.role === 'Patient') && (
                <div className="card" style={{ backgroundColor: '#F9FAFB', overflow: 'visible' }}>
                    <h3 style={{ marginBottom: '16px' }}>{t('health.uploadTitle')}</h3>
                    <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {isDoctor && (
                            <div className="input-group" style={{ position: 'relative' }}>
                                <label>{t('health.patientId')} *</label>
                                <div className="searchable-dropdown">
                                    <input 
                                        type="text" 
                                        placeholder={form.patient_id ? `Selected: ${form.patient_id}` : "Search by Patient Name or ID..."}
                                        value={searchTerm}
                                        onChange={e => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                                        onFocus={() => setShowDropdown(true)}
                                        required={!form.patient_id}
                                    />
                                    {showDropdown && (
                                        <div className="dropdown-list" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto' }}>
                                            {filteredPatients.length > 0 ? filteredPatients.map(p => (
                                                <div key={p.patientId} style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }} 
                                                    onClick={() => { setForm({...form, patient_id: p.patientId}); setSearchTerm(p.name); setShowDropdown(false); }}>
                                                    <div style={{ fontWeight: '600' }}>{p.name}</div>
                                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{p.patientId}</div>
                                                </div>
                                            )) : <div style={{ padding: '10px 16px', color: '#9ca3af' }}>No patients found</div>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="input-group">
                            <label>{t('health.details')} (Readed Information)</label>
                            <textarea 
                                rows="4"
                                placeholder="Details will be automatically populated after file selection..."
                                required 
                                value={form.details} 
                                onChange={e => setForm({...form, details: e.target.value})} 
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <input type="file" accept=".pdf,image/*,.txt" style={{ width: '100%' }} onChange={handleFileChange} />
                                {readingFile && <small style={{ color: 'var(--primary-blue)' }}>Processing file content...</small>}
                            </div>
                            <button type="submit" className="btn btn-success" disabled={readingFile}>{t('health.uploadBtn')}</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ marginTop: '32px' }}>
                <h3 style={{ marginBottom: '16px' }}>{t('health.dbRecords')}</h3>
                {loading ? <p>{t('health.loading')}</p> : records.length === 0 ? <p>{t('health.noRecords')}</p> : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {records.map(record => (
                            <div key={record._id || record.id} className="card" style={{ marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px' }}>
                                <div>
                                    <h4 style={{ color: 'var(--primary-blue)', fontSize: '18px' }}>
                                        📄 {record.document_path || 'Untitled Document'}
                                    </h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: 6 }}>
                                        <strong>{t('health.date')}:</strong> {new Date(record.created_at).toLocaleDateString()}
                                    </p>
                                    {isDoctor && (
                                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: 4 }}>
                                            {t('health.forPatient')}: {record.patient_id_short || record.patient_id}
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <button 
                                        onClick={() => setSelectedRecord(record)} 
                                        className="btn btn-secondary"
                                        style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-accent)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
                                    >
                                        🔍 {t('health.openBtn') || 'View Details'}
                                    </button>
                                    <span style={{ 
                                        padding: '6px 12px', 
                                        backgroundColor: record.status === 'Verified' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                        color: record.status === 'Verified' ? 'var(--success-green)' : '#F59E0B', 
                                        borderRadius: '8px', 
                                        fontSize: '12px', 
                                        fontWeight: '700',
                                        textTransform: 'uppercase'
                                    }}>
                                        {record.status === 'Verified' ? t('health.verified') : t('health.pending')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedRecord && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: '#1E293B', padding: '40px', borderRadius: '24px', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ color: 'white', margin: 0, fontSize: '24px' }}>📄 Health Record Document</h2>
                            <button onClick={() => setSelectedRecord(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '24px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', minHeight: '400px' }}>
                                    <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '13px', color: '#94A3B8' }}>Document Preview</span>
                                        <span style={{ fontSize: '13px', color: 'var(--primary-accent)' }}>{selectedRecord.document_path}</span>
                                    </div>
                                    <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F172A' }}>
                                        <iframe 
                                            title="Document Preview"
                                            src={selectedRecord.document_path.startsWith('http') ? selectedRecord.document_path : `${API}/uploads/${selectedRecord.document_path}`} 
                                            style={{ width: '100%', height: '100%', border: 'none' }}
                                        ></iframe>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94A3B8', textTransform: 'uppercase' }}>Clinical Information</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div>
                                            <p style={{ margin: 0, color: '#64748B', fontSize: '12px' }}>Patient ID</p>
                                            <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>{selectedRecord.patient_id_short || selectedRecord.patient_id}</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, color: '#64748B', fontSize: '12px' }}>Upload Date</p>
                                            <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>{new Date(selectedRecord.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, color: '#64748B', fontSize: '12px' }}>Status</p>
                                            <p style={{ margin: '4px 0 0 0', fontWeight: '700', color: selectedRecord.status === 'Verified' ? 'var(--success-green)' : '#F59E0B' }}>
                                                {selectedRecord.status.toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', flex: 1 }}>
                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#94A3B8', textTransform: 'uppercase' }}>Clinical Notes</h4>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#CBD5E1', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                        {selectedRecord.details || 'No notes provided.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
                            <button onClick={() => setSelectedRecord(null)} className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>{t('health.closeBtn') || 'Close'}</button>
                            {(isDoctor || isAdmin) && selectedRecord.status === 'Pending Verification' && (
                                <button 
                                    onClick={() => {
                                        handleVerify(selectedRecord._id || selectedRecord.id);
                                        setSelectedRecord(null);
                                    }} 
                                    className="btn btn-primary"
                                >
                                    Verify Record
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HealthRecords;