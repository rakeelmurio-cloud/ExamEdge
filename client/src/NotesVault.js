import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const moduleData = {
    "Year 1": ["Introduction to Programming", "Mathematics for Computing", "Database Management"],
    "Year 2": ["Object Oriented Programming", "Software Engineering", "Computer Networks"],
    "Year 3": ["IT Project Management", "Cyber Security", "Data Science"],
    "Year 4": ["Distributed Systems", "Machine Learning", "Professional Practice"]
};

const NotesVault = () => {
    const [allNotes, setAllNotes] = useState([]);
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [filterYear, setFilterYear] = useState('');
    const [filterModule, setFilterModule] = useState('');
    const navigate = useNavigate();

    const currentStudentEmail = localStorage.getItem('userEmail');

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/notes');
            const sanitizedData = res.data.map(note => ({
                ...note,
                likedBy: note.likedBy || []
            }));
            setAllNotes(sanitizedData);
        } catch (err) {
            console.error("Error fetching notes:", err);
        }
    };

    useEffect(() => {
        let temp = [...allNotes];
        if (filterYear) temp = temp.filter(n => n.year === filterYear);
        if (filterModule) temp = temp.filter(n => n.module === filterModule);
        setFilteredNotes(temp);
    }, [filterYear, filterModule, allNotes]);

    const handleLike = async (id) => {
        if (!currentStudentEmail) {
            alert("Please log in to like this note!");
            return;
        }
        try {
            const res = await axios.put(`http://localhost:5000/api/notes/${id}/like`, {
                studentId: currentStudentEmail
            });
            setAllNotes(prev => prev.map(note => note._id === id ? { ...res.data, likedBy: res.data.likedBy || [] } : note));
        } catch (err) {
            console.error("Like failed:", err.response?.data?.message || err.message);
        }
    };

    const downloadFile = async (url, fileName) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            window.open(url, '_blank');
        }
    };

    return (
        <div style={S.page}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;800;900&display=swap');
                @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                .btn-hover:hover { opacity: 0.88; transform: translateY(-1px); }
                .card-hover:hover { border-color: rgba(139,92,246,0.5) !important; transform: translateY(-3px); background: rgba(255,255,255,0.04) !important; }
            `}</style>

            <div style={S.center}>
                <div style={{ animation: 'fadeUp 0.6s ease' }}>
                    <h1 style={S.h1}>Notes <span style={S.grad}>Vault.</span></h1>
                    <p style={S.sub}>Access, share, and study high-quality lecture notes curated by students.</p>
                </div>

                <div style={S.filterCard}>
                    <div style={S.filterGroup}>
                        <select style={S.select} value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setFilterModule(''); }}>
                            <option value="">All Years</option>
                            {Object.keys(moduleData).map(y => <option key={y} value={y} style={{background: '#0f0a28'}}>{y}</option>)}
                        </select>
                        <select style={S.select} value={filterModule} onChange={(e) => setFilterModule(e.target.value)} disabled={!filterYear}>
                            <option value="">All Modules</option>
                            {filterYear && moduleData[filterYear].map(m => <option key={m} value={m} style={{background: '#0f0a28'}}>{m}</option>)}
                        </select>
                        <button onClick={() => navigate('/upload-notes')} style={S.uploadBtn} className="btn-hover">
                            <span>+</span> Upload Notes
                        </button>
                    </div>
                </div>

                <div style={S.grid}>
                    {filteredNotes.map((note, index) => {
                        const totalLikes = (note.likedBy || []).length;
                        const hasLiked = (note.likedBy || []).includes(currentStudentEmail);

                        return (
                            <div key={note._id} style={{ ...S.card, animation: `fadeUp ${0.4 + index * 0.1}s ease` }} className="card-hover">
                                <div style={S.cardIcon}>📄</div>
                                <h3 style={S.cardTitle}>{note.title}</h3>
                                <div style={S.cardBadge}>{note.year}</div>
                                <p style={S.cardSubText}>{note.module}</p>

                                <div style={S.actionRow}>
                                    <button onClick={() => handleLike(note._id)} style={{ ...S.likeBtn, color: hasLiked ? '#ec4899' : '#64748b' }} className="btn-hover">
                                        <span style={{ fontSize: '1.2rem' }}>{hasLiked ? '❤️' : '🤍'}</span>
                                        {totalLikes}
                                    </button>
                                    <button onClick={() => downloadFile(note.fileUrl, note.title)} style={S.downloadBtn} className="btn-hover">
                                        Download PDF
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {filteredNotes.length === 0 && (
                    <div style={{ marginTop: 60, color: '#475569', fontStyle: 'italic' }}>
                        No notes found for the selected criteria.
                    </div>
                )}
            </div>
        </div>
    );
};

const S = {
    page: { minHeight: '100vh', background: 'radial-gradient(ellipse at 20% 0%, #130d2e 0%, #060612 70%)', color: '#fff', padding: '60px 20px', fontFamily: "'Sora', sans-serif" },
    center: { maxWidth: 1000, margin: '0 auto', textAlign: 'center' },
    h1: { fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: 900, marginBottom: 12, lineHeight: 1.1 },
    grad: { background: 'linear-gradient(135deg,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    sub: { color: '#64748b', maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.7, fontSize: '1rem' },
    
    filterCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '20px', marginBottom: 40, backdropFilter: 'blur(12px)' },
    filterGroup: { display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' },
    
    select: { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: 10, padding: '10px 16px', fontSize: '0.9rem', outline: 'none', cursor: 'pointer', minWidth: '180px' },
    
    uploadBtn: { background: 'linear-gradient(135deg,#7c3aed,#db2777)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' },
    
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' },
    
    card: { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '28px', textAlign: 'left', transition: 'all 0.3s ease', position: 'relative' },
    cardIcon: { fontSize: '2.5rem', marginBottom: '16px' },
    cardTitle: { fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    cardBadge: { display: 'inline-block', background: 'rgba(139,92,246,0.15)', color: '#a78bfa', padding: '4px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' },
    cardSubText: { color: '#64748b', fontSize: '0.85rem', marginBottom: '24px', lineHeight: '1.5', height: '40px', overflow: 'hidden' },
    
    actionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
    likeBtn: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' },
    downloadBtn: { flex: 1, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', padding: '10px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }
};

export default NotesVault;