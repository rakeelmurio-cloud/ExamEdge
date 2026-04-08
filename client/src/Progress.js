import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'examedge_progress';

const Progress = () => {
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        setRecords(data.reverse()); // newest first
    }, []);

    const total = records.length;
    const passed = records.filter(r => r.passed).length;
    const passRate = total ? Math.round((passed / total) * 100) : 0;
    const avgScore = total ? Math.round(records.reduce((s, r) => s + r.pct, 0) / total) : 0;
    const bestScore = total ? Math.max(...records.map(r => r.pct)) : 0;

    const getGradeColor = (pct) => {
        if (pct >= 90) return '#00e5a0';
        if (pct >= 80) return '#38bdf8';
        if (pct >= 70) return '#a78bfa';
        if (pct >= 60) return '#fbbf24';
        return '#f87171';
    };

    return (
        <div style={S.page}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;800;900&display=swap');
                @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                @keyframes fillBar { from { width: 0%; } to { width: var(--w); } }
                .row-hover:hover { background: rgba(255,255,255,0.04) !important; }
            `}</style>

            <div style={S.center}>
                

                <div style={{ animation: 'fadeUp 0.5s ease' }}>
                    <div style={S.pill}>Your Learning Journey</div>
                    <h1 style={S.h1}>My <span style={S.grad}>Progress</span></h1>
                    <p style={S.sub}>Track every quiz you've taken — your scores, pass rate, and improvement over time.</p>
                </div>

                {/* Summary cards */}
                <div style={S.summaryGrid}>
                    {[
                        { icon: '📝', val: total, label: 'Quizzes Taken', color: '#a78bfa' },
                        { icon: '✅', val: passed, label: 'Passed', color: '#00e5a0' },
                        { icon: '❌', val: total - passed, label: 'Failed', color: '#f87171' },
                        { icon: '📈', val: `${avgScore}%`, label: 'Avg Score', color: '#38bdf8' },
                        { icon: '🏆', val: `${bestScore}%`, label: 'Best Score', color: '#fbbf24' },
                    ].map(({ icon, val, label, color }) => (
                        <div key={label} style={S.statCard}>
                            <div style={{ fontSize: '1.8rem' }}>{icon}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color }}>{val}</div>
                            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: 2 }}>{label}</div>
                        </div>
                    ))}
                </div>

                {/* Pass rate bar */}
                {total > 0 && (
                    <div style={S.barCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Overall Pass Rate</span>
                            <span style={{ color: passRate >= 60 ? '#00e5a0' : '#f87171', fontWeight: 800, fontSize: '1.1rem' }}>{passRate}%</span>
                        </div>
                        <div style={{ height: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${passRate}%`, background: passRate >= 60 ? 'linear-gradient(90deg,#00e5a0,#38bdf8)' : 'linear-gradient(90deg,#f87171,#fbbf24)', borderRadius: 999, transition: 'width 1s ease' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.78rem', color: '#334155' }}>
                            <span>{passed} passed</span><span>{total - passed} failed</span>
                        </div>
                    </div>
                )}

                {/* Score trend bars */}
                {total > 0 && (
                    <div style={S.trendCard}>
                        <h3 style={S.sectionTitle}>Score History</h3>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, padding: '0 4px' }}>
                            {[...records].reverse().slice(-20).map((r, i) => (
                                <div key={i} title={`${r.pct}% — ${new Date(r.date).toLocaleDateString()}`}
                                    style={{ flex: 1, height: `${r.pct}%`, minHeight: 4, background: getGradeColor(r.pct), borderRadius: '4px 4px 0 0', opacity: 0.85, transition: 'opacity 0.2s', cursor: 'default' }} />
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.72rem', color: '#334155' }}>
                            <span>Oldest</span><span>Most Recent</span>
                        </div>
                    </div>
                )}

                {/* History table */}
                <div style={S.tableCard}>
                    <h3 style={S.sectionTitle}>Quiz History</h3>
                    {total === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: '#334155' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎯</div>
                            <p>No quizzes yet. Upload a PDF to get started!</p>
                            <button onClick={() => window.location.href = '/'} style={{ ...S.goBtn, marginTop: 20 }}>Take First Quiz →</button>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    {['#','Date','File','Score','Result','Time'].map(h => (
                                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((r, i) => (
                                    <tr key={i} className="row-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}>
                                        <td style={S.td}>{total - i}</td>
                                        <td style={S.td}>{new Date(r.date).toLocaleDateString()}</td>
                                        <td style={{ ...S.td, color: '#64748b', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.fileName || '—'}</td>
                                        <td style={S.td}>
                                            <span style={{ color: getGradeColor(r.pct), fontWeight: 700 }}>{r.pct}%</span>
                                            <span style={{ color: '#334155', fontSize: '0.78rem', marginLeft: 6 }}>({r.correct}/{r.total})</span>
                                        </td>
                                        <td style={S.td}>
                                            <span style={{ background: r.passed ? 'rgba(0,229,160,0.1)' : 'rgba(248,113,113,0.1)', color: r.passed ? '#00e5a0' : '#f87171', border: `1px solid ${r.passed ? 'rgba(0,229,160,0.3)' : 'rgba(248,113,113,0.3)'}`, borderRadius: 6, padding: '2px 10px', fontSize: '0.78rem', fontWeight: 700 }}>
                                                {r.passed ? 'PASS' : 'FAIL'}
                                            </span>
                                        </td>
                                        <td style={{ ...S.td, fontFamily: 'monospace', color: '#475569' }}>
                                            {r.timeTaken ? `${String(Math.floor(r.timeTaken/60)).padStart(2,'0')}:${String(r.timeTaken%60).padStart(2,'0')}` : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {total > 0 && (
                    <button onClick={() => { if (window.confirm('Clear all progress history?')) { localStorage.removeItem(STORAGE_KEY); setRecords([]); } }}
                        style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontSize: '0.85rem', marginTop: 8 }}>
                        🗑 Clear History
                    </button>
                )}
            </div>
        </div>
    );
};

const S = {
    page: { minHeight: '100vh', background: 'radial-gradient(ellipse at 80% 0%, #0d1a30 0%, #060612 70%)', color: '#fff', padding: '40px 20px', fontFamily: "'Sora', sans-serif" },
    center: { maxWidth: 860, margin: '0 auto' },
    backBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', borderRadius: 10, padding: '8px 18px', cursor: 'pointer', fontSize: '0.85rem', marginBottom: 32, display: 'inline-block' },
    pill: { display: 'inline-block', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', color: '#38bdf8', borderRadius: 999, padding: '4px 18px', fontSize: '0.78rem', letterSpacing: '.08em', marginBottom: 16 },
    h1: { fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, marginBottom: 10, lineHeight: 1.1 },
    grad: { background: 'linear-gradient(135deg,#38bdf8,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    sub: { color: '#475569', marginBottom: 36, lineHeight: 1.7, fontSize: '0.9rem' },
    summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 20 },
    statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '18px 8px', textAlign: 'center' },
    barCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px', marginBottom: 16 },
    trendCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px', marginBottom: 16 },
    tableCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px', marginBottom: 16, overflow: 'hidden' },
    sectionTitle: { color: '#94a3b8', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 16 },
    td: { padding: '12px', fontSize: '0.88rem', color: '#94a3b8', verticalAlign: 'middle' },
    goBtn: { background: 'linear-gradient(135deg,#7c3aed,#db2777)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 12, fontWeight: 700, cursor: 'pointer' },
};

export default Progress;