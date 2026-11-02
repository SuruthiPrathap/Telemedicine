import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function SymptomChecker() {
    const { t } = useTranslation();
    const [symptoms, setSymptoms] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const checkSymptoms = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:5001/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symptoms })
            });

            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            setResult(data);
        } catch (err) {
            try {
                const offRes = await fetch('/offline_symptoms.json');
                const offlineData = await offRes.json();
                
                const lowerSymptoms = symptoms.toLowerCase();
                let foundMatch = null;
                for (const conditionData of Object.values(offlineData)) {
                    if (conditionData.keywords.some(kw => lowerSymptoms.includes(kw))) {
                        foundMatch = conditionData;
                        break;
                    }
                }

                if (foundMatch) {
                    setResult({
                        condition: foundMatch.condition,
                        confidence: t('checker.offlineEstimate'),
                        recommendation: foundMatch.recommendation,
                        disclaimer: t('checker.offlineDisclaimer')
                    });
                } else {
                    setResult({
                        condition: t('checker.unknown'),
                        confidence: "N/A",
                        recommendation: t('checker.noInternet'),
                        disclaimer: t('checker.offlineDisclaimer')
                    });
                }
            } catch (offlineErr) {
                setError(t('checker.apiError'));
            }
        }
        setLoading(false);
    };

    return (
        <div>
            <h1 className="page-title">{t('checker.title')}</h1>
            
            <div className="alert-warning" style={{ borderRadius: '12px' }}>
                <strong className="uppercase text-xs tracking-widest block mb-2">{t('checker.labelDisclaimer')}</strong>
                <p className="text-sm opacity-90">{t('checker.disclaimer')}</p>
            </div>

            <div className="card" style={{ padding: '32px' }}>
                <div className="input-group">
                    <label>{t('checker.label')}</label>
                    <textarea 
                        rows="4" 
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder={t('checker.placeholder')}
                    />
                </div>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '16px' }} onClick={checkSymptoms} disabled={loading || !symptoms.trim()}>
                    {loading ? t('checker.analyzing') : t('checker.btn')}
                </button>
                {error && <p style={{color: 'var(--danger-red)', marginTop: 10, fontSize: '14px'}}>{error}</p>}
            </div>

            {result && (
                <div className="card animate-fade-up" style={{borderLeft: '4px solid var(--success-green)', padding: '30px'}}>
                    <h3 style={{marginBottom: 16, color: '#fff', fontSize: '20px'}}>{t('checker.context')} {result.condition}</h3>
                    <div className="space-y-4">
                        <p>
                            <strong className="text-slate-400 mr-2">{t('checker.confidence')}</strong> 
                            <span className="text-white bg-white/10 px-2 py-1 rounded">
                                {result.confidence}{typeof result.confidence === 'number' ? '%' : ''}
                            </span>
                        </p>
                        <p><strong className="text-slate-400 block mb-2">{t('checker.recommendation')}</strong> <span className="text-slate-200 leading-relaxed">{result.recommendation}</span></p>
                    </div>
                    <p style={{marginTop: 24, fontSize: '0.8em', color: 'var(--text-muted)', borderTop: '1px solid var(--glass-border)', paddingTop: 16}}>
                        {result.disclaimer}
                    </p>
                </div>
            )}
        </div>
    );
}

export default SymptomChecker;
