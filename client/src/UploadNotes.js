import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const moduleData = {
    "Year 1": ["Introduction to Programming", "Mathematics for Computing", "Database Management"],
    "Year 2": ["Object Oriented Programming", "Software Engineering", "Computer Networks"],
    "Year 3": ["IT Project Management", "Cyber Security", "Data Science"],
    "Year 4": ["Distributed Systems", "Machine Learning", "Professional Practice"]
};

const UploadNotes = () => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [year, setYear] = useState('');
    const [module, setModule] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert("Please select a PDF file.");
        
        setLoading(true);
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('title', title);
        formData.append('year', year);
        formData.append('module', module);

        try {
            await axios.post('http://localhost:5000/api/notes/upload', formData);
            alert("Upload successful!");
            navigate('/notes');
        } catch (err) { 
            alert("Upload failed."); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={S.page}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;800;900&display=swap');
                @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                @keyframes spin { to { transform: rotate(360deg); } }
                .btn-hover:hover { opacity: 0.88; transform: translateY(-1px); }
                .input-focus:focus { border-color: #a78bfa !important; outline: none; background: rgba(255,255,255,0.05) !important; }
            `}</style>

            <div style={S.center}>
                <div style={{ animation: 'fadeUp 0.6s ease', marginBottom: '30px' }}>
                    <h1 style={S.h1}>Share <span style={S.grad}>Notes.</span></h1>
                    <p style={S.sub}>Contribute to the vault and help your peers excel.</p>
                </div>

                <div style={{ ...S.uploadCard, animation: 'fadeUp 0.7s ease' }}>
                    <form onSubmit={handleUpload} style={S.form}>
                        <div style={S.inputGroup}>
                            <label style={S.label}>Document Title</label>
                            <input 
                                className="input-focus"
                                style={S.input} 
                                placeholder="e.g. Week 4 Machine Learning" 
                                onChange={(e) => setTitle(e.target.value)} 
                                required 
                            />
                        </div>

                        <div style={S.row}>
                            <div style={{ ...S.inputGroup, flex: 1 }}>
                                <label style={S.label}>Academic Year</label>
                                <select 
                                    className="input-focus"
                                    style={S.input} 
                                    onChange={(e) => {setYear(e.target.value); setModule('');}} 
                                    required
                                >
                                    <option value="" style={{background: '#0f0a28'}}>Select Year</option>
                                    {Object.keys(moduleData).map(y => <option key={y} value={y} style={{background: '#0f0a28'}}>{y}</option>)}
                                </select>
                            </div>

                            <div style={{ ...S.inputGroup, flex: 1 }}>
                                <label style={S.label}>Module</label>
                                <select 
                                    className="input-focus"
                                    style={S.input} 
                                    onChange={(e) => setModule(e.target.value)} 
                                    value={module} 
                                    disabled={!year} 
                                    required
                                >
                                    <option value="" style={{background: '#0f0a28'}}>Select Module</option>
                                    {year && moduleData[year].map(m => <option key={m} value={m} style={{background: '#0f0a28'}}>{m}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={S.inputGroup}>
                            <label style={S.label}>PDF File</label>
                            <div style={S.fileWrapper}>
                                <input 
                                    type="file" 
                                    accept=".pdf" 
                                    onChange={(e) => setFile(e.target.files[0])} 
                                    style={S.fileInput}
                                    required 
                                />
                                <div style={S.fileDummy}>
                                    {file ? `✅ ${file.name}` : '📁 Drag or click to upload PDF'}
                                </div>
                            </div>
                        </div>

                        <div style={S.buttonRow}>
                            <button 
                                type="submit" 
                                disabled={loading}
                                style={loading ? S.btnOff : S.btn} 
                                className="btn-hover"
                            >
                                {loading ? <span style={S.spinner} /> : '⚡ Upload to Vault'}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => navigate('/notes')} 
                                style={S.cancelBtn} 
                                className="btn-hover"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const S = {
    page: { minHeight: '100vh', background: 'radial-gradient(ellipse at 20% 0%, #130d2e 0%, #060612 70%)', color: '#fff', padding: '60px 20px', fontFamily: "'Sora', sans-serif", display: 'flex', justifyContent: 'center', alignItems: 'center' },
    center: { maxWidth: 500, width: '100%', textAlign: 'center' },
    h1: { fontSize: 'clamp(2.2rem, 5vw, 3rem)', fontWeight: 900, marginBottom: 10, lineHeight: 1.1 },
    grad: { background: 'linear-gradient(135deg,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitFillColor: 'transparent' },
    sub: { color: '#64748b', margin: '0 auto', fontSize: '1rem', lineHeight: 1.6 },
    
    uploadCard: { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px', padding: '40px', backdropFilter: 'blur(16px)', textAlign: 'left' },
    form: { display: 'flex', flexDirection: 'column', gap: '24px' },
    
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', paddingLeft: '4px' },
    input: { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '12px', padding: '14px', fontSize: '0.9rem', transition: 'all 0.2s' },
    
    row: { display: 'flex', gap: '16px' },
    
    fileWrapper: { position: 'relative', height: '60px', width: '100%', overflow: 'hidden' },
    fileInput: { position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 2 },
    fileDummy: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(139,92,246,0.05)', border: '1px dashed rgba(139,92,246,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: '#a78bfa', transition: 'all 0.2s' },
    
    buttonRow: { display: 'flex', gap: '12px', marginTop: '8px' },
    btn: { flex: 2, background: 'linear-gradient(135deg,#7c3aed,#db2777)', color: '#fff', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    btnOff: { flex: 2, background: '#1e293b', color: '#475569', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: 800, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    cancelBtn: { flex: 1, background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' },
    
    spinner: { display: 'inline-block', width: 20, height: 20, border: '3px solid rgba(255,255,255,0.2)', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }
};

export default UploadNotes;