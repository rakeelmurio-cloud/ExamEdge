import React, { useState, useEffect } from 'react';
import axios from 'axios';

const moduleData = {
    "Year 1": ["Introduction to Programming", "Mathematics for Computing", "Database Management"],
    "Year 2": ["Object Oriented Programming", "Software Engineering", "Computer Networks"],
    "Year 3": ["IT Project Management", "Cyber Security", "Data Science"],
    "Year 4": ["Distributed Systems", "Machine Learning", "Professional Practice"]
};

const PeerMatching = () => {
    const [tutors, setTutors] = useState([]);
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [filterYear, setFilterYear] = useState('Year 2');
    const [filterModule, setFilterModule] = useState(moduleData["Year 2"][0]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTutors();
        fetchUpcoming();
    }, [filterYear, filterModule]);

    const fetchUpcoming = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            try {
                const res = await axios.get(`http://localhost:5000/api/peer/sessions/student/${user.email}`);
                setUpcomingSessions(res.data);
            } catch (err) { console.error(err); }
        }
    };

    const fetchTutors = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/peer/tutors`, {
                params: { year: filterYear, module: filterModule }
            });
            setTutors(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleRequest = async (tutorEmail) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return alert("Please log in first.");
        try {
            await axios.post('http://localhost:5000/api/peer/request-session', {
                studentEmail: user.email,
                tutorEmail: tutorEmail,
                module: filterModule 
            });
            alert("✅ Request sent! The tutor will review your session.");
        } catch (err) { alert("Failed to send request."); }
    };

    return (
        <div style={S.page}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
                @keyframes slideIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .card-hover:hover { transform: translateY(-5px); border-color: rgba(139, 92, 246, 0.4) !important; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5); }
                .btn-hover:hover { opacity: 0.9; transform: scale(1.02); }
                select:focus { border-color: #a78bfa !important; outline: none; }
            `}</style>

            <div style={S.container}>
                <header style={{ textAlign: 'center', marginBottom: 60, animation: 'slideIn 0.6s ease' }}>
                    <h1 style={S.h1}>Study <span style={S.grad}>Partners.</span></h1>
                    <p style={S.sub}>Connect with top-performing peers for 1-on-1 guidance.</p>
                </header>

                {/* --- UPCOMING SESSIONS --- */}
                {upcomingSessions.length > 0 && (
                    <section style={{ marginBottom: 60, animation: 'slideIn 0.7s ease' }}>
                        <h2 style={S.sectionTitle}>📅 Confirmed Sessions</h2>
                        <div style={S.grid}>
                            {upcomingSessions.map(session => (
                                <div key={session._id} style={S.confirmedCard} className="card-hover">
                                    <div style={S.confirmedTag}>Live Session</div>
                                    <h3 style={S.cardTitle}>{session.module}</h3>
                                    <p style={S.cardSub}>With {session.tutorEmail}</p>
                                    <div style={S.timeBox}>{session.date} • {session.time}</div>
                                    <a href={session.googleMeetLink} target="_blank" rel="noreferrer" style={S.meetBtn} className="btn-hover">
                                        Join Meeting
                                    </a>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* --- FILTERS --- */}
                <div style={S.filterBox}>
                    <div style={S.row}>
                        <div style={S.inputGroup}>
                            <label style={S.label}>Academic Year</label>
                            <select style={S.select} value={filterYear} onChange={(e) => {
                                setFilterYear(e.target.value);
                                setFilterModule(moduleData[e.target.value][0]);
                            }}>
                                {Object.keys(moduleData).map(y => <option key={y} value={y} style={S.opt}>{y}</option>)}
                            </select>
                        </div>
                        <div style={S.inputGroup}>
                            <label style={S.label}>Module</label>
                            <select style={S.select} value={filterModule} onChange={(e) => setFilterModule(e.target.value)}>
                                {moduleData[filterYear].map(m => <option key={m} value={m} style={S.opt}>{m}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- TUTOR SEARCH RESULTS --- */}
                <div style={S.grid}>
                    {loading ? (
                        <p style={S.status}>Scanning the vault for tutors...</p>
                    ) : tutors.length > 0 ? (
                        tutors.map((tutor, i) => (
                            <div key={i} style={S.tutorCard} className="card-hover">
                                <div style={S.avatar}>{tutor.email.charAt(0).toUpperCase()}</div>
                                <h3 style={S.cardTitle}>{tutor.name || "Academic Peer"}</h3>
                                <p style={S.cardSub}>{tutor.email}</p>
                                <div style={S.badgeRow}>
                                    <span style={S.moduleBadge}>{filterModule}</span>
                                    <span style={S.gradeBadge}>Grade: {tutor.grade || 'A'}</span>
                                </div>
                                <button style={S.connectBtn} onClick={() => handleRequest(tutor.email)} className="btn-hover">
                                    Request Session
                                </button>
                            </div>
                        ))
                    ) : (
                        <p style={S.status}>No tutors found for this specific module yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const S = {
    page: { minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, #161033 0%, #06060c 100%)', color: '#fff', fontFamily: "'Sora', sans-serif", padding: '80px 20px' },
    container: { maxWidth: 1100, margin: '0 auto' },
    h1: { fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: 800, marginBottom: 12 },
    grad: { background: 'linear-gradient(135deg, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    sub: { color: '#94a3b8', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' },
    
    sectionTitle: { fontSize: '1.4rem', fontWeight: 700, marginBottom: 25, color: '#e2e8f0', letterSpacing: '-0.02em' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
    
    confirmedCard: { background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: 30, borderRadius: 28, backdropFilter: 'blur(10px)', transition: '0.3s' },
    confirmedTag: { background: '#10b981', color: '#fff', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', padding: '4px 10px', borderRadius: 8, display: 'inline-block', marginBottom: 15 },
    timeBox: { padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, fontSize: '0.85rem', margin: '15px 0', color: '#10b981', fontWeight: 600 },
    meetBtn: { display: 'block', background: '#10b981', color: '#fff', textAlign: 'center', textDecoration: 'none', padding: '14px', borderRadius: 14, fontWeight: 700, transition: '0.2s' },

    filterBox: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '30px', borderRadius: '32px', backdropFilter: 'blur(20px)', marginBottom: 50 },
    row: { display: 'flex', gap: 20, flexWrap: 'wrap' },
    inputGroup: { flex: 1, minWidth: 250, display: 'flex', flexDirection: 'column', gap: 10 },
    label: { color: '#a78bfa', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' },
    select: { background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '15px', borderRadius: '16px', cursor: 'pointer', transition: '0.2s' },
    opt: { background: '#0f172a' },

    tutorCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 35, borderRadius: 32, textAlign: 'center', transition: '0.3s' },
    avatar: { width: 64, height: 64, background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
    cardTitle: { fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: 4 },
    cardSub: { color: '#64748b', fontSize: '0.85rem', marginBottom: 20 },
    badgeRow: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 25 },
    moduleBadge: { background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', padding: '6px 12px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 600 },
    gradeBadge: { color: '#10b981', fontSize: '0.8rem', fontWeight: 800 },
    connectBtn: { width: '100%', background: '#8b5cf6', color: '#fff', border: 'none', padding: '14px', borderRadius: 14, fontWeight: 700, cursor: 'pointer', transition: '0.2s' },
    status: { color: '#64748b', textAlign: 'center', gridColumn: '1 / -1', padding: '40px' }
};

export default PeerMatching;