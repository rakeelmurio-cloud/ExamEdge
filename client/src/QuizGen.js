import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const getGrade = (correct, total) => {
    const pct = Math.round((correct / total) * 100);
    if (pct >= 90) return { letter: 'A+', color: '#00e5a0', label: 'Outstanding!', pass: true };
    if (pct >= 80) return { letter: 'A',  color: '#38bdf8', label: 'Excellent!',   pass: true };
    if (pct >= 70) return { letter: 'B',  color: '#a78bfa', label: 'Good Job!',    pass: true };
    if (pct >= 60) return { letter: 'C',  color: '#fbbf24', label: 'Keep Going',   pass: true };
    return             { letter: 'F',  color: '#f87171', label: 'Need More Study', pass: false };
};

const STORAGE_KEY = 'examedge_progress';

const saveProgress = (result) => {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    existing.push({ ...result, date: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

// ─── PDF Download (print-based, fully readable) ───────────────────────────────
const downloadPDF = (quiz, userAnswers, fileName, correct, timeTaken) => {
    const total = quiz.length;
    const pct = Math.round((correct / total) * 100);
    const g = getGrade(correct, total);
    const gradeColors = { 'A+': '#00e5a0', A: '#38bdf8', B: '#a78bfa', C: '#fbbf24', F: '#f87171' };
    const col = gradeColors[g.letter] || '#a78bfa';

    const rows = quiz.map((q, i) => {
        const isCorrect = userAnswers[i] === q.answer;
        const opts = q.options.map((opt, oi) => {
            const isAns = opt === q.answer;
            const isUserWrong = opt === userAnswers[i] && !isCorrect;
            const cls = isAns ? 'opt-correct' : isUserWrong ? 'opt-wrong' : '';
            const sym = isAns ? '✓' : isUserWrong ? '✗' : '○';
            const tag = isAns
                ? '<span class="tag correct-tag">Correct Answer</span>'
                : isUserWrong ? '<span class="tag wrong-tag">Your Answer</span>' : '';
            return `<div class="opt ${cls}">${sym} ${['A','B','C','D'][oi]}. ${opt} ${tag}</div>`;
        }).join('');

        return `
        <div class="qblock ${isCorrect ? 'correct' : 'wrong'}">
            <div class="qheader">
                <span>Q${i + 1}. ${q.question}</span>
                <span>${isCorrect ? '✅ Correct' : '❌ Incorrect'}</span>
            </div>
            <div class="options">${opts}</div>
        </div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Quiz Result — ExamEdge</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI', Arial, sans-serif; background:#fff; color:#1e293b; }

  .header { background:#0f0a28; color:#fff; padding:32px 48px; }
  .header h1 { font-size:22px; font-weight:800; margin-bottom:6px; }
  .header p { color:#94a3b8; font-size:13px; }

  .summary { display:flex; gap:14px; padding:24px 48px; background:#f8fafc; border-bottom:1px solid #e2e8f0; flex-wrap:wrap; }
  .scard { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:14px 20px; text-align:center; flex:1; min-width:90px; }
  .scard .val { font-size:26px; font-weight:900; color:${col}; }
  .scard .lbl { font-size:11px; color:#94a3b8; margin-top:4px; text-transform:uppercase; letter-spacing:.06em; }

  .pbar-wrap { padding:0 48px 20px; background:#f8fafc; }
  .pbar-track { height:10px; background:#e2e8f0; border-radius:999px; overflow:hidden; }
  .pbar-fill { height:100%; width:${pct}%; background:${col}; border-radius:999px; }
  .pbar-labels { display:flex; justify-content:space-between; font-size:11px; color:#94a3b8; margin-top:5px; }

  .section-title { padding:20px 48px 10px; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.08em; }

  .qblock { margin:0 48px 14px; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0; page-break-inside:avoid; }
  .qblock.correct { border-left:4px solid #10b981; }
  .qblock.wrong   { border-left:4px solid #ef4444; }

  .qheader { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; padding:12px 16px; background:#f1f5f9; font-size:13.5px; font-weight:600; color:#1e293b; }
  .qheader span:last-child { white-space:nowrap; font-size:13px; flex-shrink:0; }

  .options { padding:10px 16px; display:flex; flex-direction:column; gap:7px; }
  .opt { padding:8px 12px; border-radius:8px; font-size:13px; color:#475569; background:#f8fafc; display:flex; align-items:center; gap:10px; }
  .opt-correct { background:#ecfdf5; color:#065f46; font-weight:600; }
  .opt-wrong   { background:#fef2f2; color:#991b1b; }
  .tag { margin-left:auto; font-size:11px; font-weight:700; padding:2px 8px; border-radius:4px; white-space:nowrap; }
  .correct-tag { background:#d1fae5; color:#065f46; }
  .wrong-tag   { background:#fee2e2; color:#991b1b; }

  .footer { margin:28px 48px; padding-top:14px; border-top:1px solid #e2e8f0; font-size:11px; color:#94a3b8; text-align:center; }

  @media print {
    body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .qblock { page-break-inside:avoid; }
  }
</style>
</head>
<body>
  <div class="header">
    <h1>📋 ExamEdge — Quiz Result Report</h1>
    <p>Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp; File: ${fileName || 'Unknown'} &nbsp;|&nbsp; Time taken: ${fmt(timeTaken)}</p>
  </div>

  <div class="summary">
    <div class="scard"><div class="val">${g.letter}</div><div class="lbl">Grade</div></div>
    <div class="scard"><div class="val">${pct}%</div><div class="lbl">Score</div></div>
    <div class="scard"><div class="val">${correct}/${total}</div><div class="lbl">Correct</div></div>
    <div class="scard"><div class="val">${total - correct}</div><div class="lbl">Wrong</div></div>
    <div class="scard"><div class="val" style="color:${g.pass ? '#10b981' : '#ef4444'}">${g.pass ? 'PASS' : 'FAIL'}</div><div class="lbl">Result</div></div>
    <div class="scard"><div class="val" style="font-size:18px">${fmt(timeTaken)}</div><div class="lbl">Time Taken</div></div>
  </div>

  <div class="pbar-wrap">
    <div class="pbar-track"><div class="pbar-fill"></div></div>
    <div class="pbar-labels"><span>${g.label}</span><span>${pct}%</span></div>
  </div>

  <div class="section-title">Question Review</div>
  ${rows}
  <div class="footer">ExamEdge AI Quiz Generator — Result Report</div>
</body>
</html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.focus(); win.print(); };
};

// ─── Main Component ───────────────────────────────────────────────────────────
const QuizGen = () => {
    const [file, setFile] = useState(null);
    const [quiz, setQuiz] = useState([]);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [phase, setPhase] = useState('upload');
    const [numPages, setNumPages] = useState(0);
    const [questionCount, setQuestionCount] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (phase !== 'quiz') return;
        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { clearInterval(intervalRef.current); submitQuiz(true); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, [phase]);

    const generateQuiz = async () => {
        if (!file) return alert('Please upload a PDF first!');
        const formData = new FormData();
        formData.append('pdf', file);
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/quiz/generate', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const questions = res.data.questions || [];
            const secs = res.data.timerSeconds || questions.length * 60;
            setQuiz(questions);
            setTimerSeconds(secs);
            setTimeLeft(secs);
            setUserAnswers({});
            setNumPages(res.data.numPages || 0);
            setQuestionCount(res.data.questionCount || questions.length);
            setStartTime(Date.now());
            setPhase('quiz');
        } catch (err) {
            console.error(err);
            alert('Failed to generate quiz. Check your server and Groq API key.');
        } finally {
            setLoading(false);
        }
    };

    const submitQuiz = (auto = false) => {
        clearInterval(intervalRef.current);
        if (!auto) {
            const unanswered = quiz.length - Object.keys(userAnswers).length;
            if (unanswered > 0 && !window.confirm(`${unanswered} question(s) unanswered. Submit anyway?`)) return;
        }
        const correct = quiz.filter((q, i) => userAnswers[i] === q.answer).length;
        const g = getGrade(correct, quiz.length);
        const timeTaken = Math.round((Date.now() - startTime) / 1000);
        saveProgress({
            total: quiz.length, correct, passed: g.pass,
            pct: Math.round((correct / quiz.length) * 100),
            timeTaken, fileName: file?.name
        });
        setPhase('result');
    };

    const correct = quiz.filter((q, i) => userAnswers[i] === q.answer).length;
    const g = quiz.length ? getGrade(correct, quiz.length) : null;
    const pct = quiz.length ? Math.round((correct / quiz.length) * 100) : 0;
    const timerPct = timerSeconds ? (timeLeft / timerSeconds) * 100 : 100;
    const timerColor = timeLeft > timerSeconds * 0.5 ? '#00e5a0' : timeLeft > timerSeconds * 0.2 ? '#fbbf24' : '#f87171';
    const timeTaken = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

    // ── UPLOAD ────────────────────────────────────────────────────────────────
    if (phase === 'upload') return (
        <div style={S.page}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;800;900&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                .btn-hover:hover { opacity: 0.88; transform: translateY(-1px); }
                .opt-hover:hover { background: rgba(99,102,241,0.12) !important; border-color: rgba(99,102,241,0.4) !important; }
            `}</style>
            <div style={S.center}>
                <button onClick={() => window.location.href = '/progress'} style={S.progressBtn}>
                    📊 My Progress
                </button>
                <div style={{ animation: 'fadeUp 0.6s ease' }}>
                    <h1 style={S.h1}><span style={S.grad}>Quiz.</span></h1>
                    <p style={S.sub}>Drop your lecture notes PDF and let AI test your knowledge.</p>
                </div>
                <div style={{ ...S.uploadCard, animation: 'fadeUp 0.7s ease' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>📄</div>
                    <p style={{ color: file ? '#a78bfa' : '#64748b', marginBottom: 20, fontWeight: file ? 600 : 400 }}>
                        {file ? `✅  ${file.name}` : 'No file selected'}
                    </p>
                    <label style={S.fileLabel} className="btn-hover">
                        Choose PDF
                        <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
                    </label>
                    <div style={S.hintGrid}>
                        {[['< 2 pages','8 questions','8 min'],['2–3 pages','15 questions','15 min'],['3–5 pages','25 questions','25 min'],['> 5 pages','35 questions','35 min']].map(([p,q,t]) => (
                            <div key={p} style={S.hintCard}>
                                <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.85rem' }}>{p}</div>
                                <div style={{ color: '#f1f5f9', fontWeight: 800 }}>{q}</div>
                                <div style={{ color: '#64748b', fontSize: '0.78rem' }}>⏱ {t}</div>
                            </div>
                        ))}
                    </div>
                    <button onClick={generateQuiz} disabled={loading || !file} style={!file || loading ? S.btnOff : S.btn} className="btn-hover">
                        {loading ? <><span style={S.spinner} /> Analyzing PDF…</> : '⚡ Generate Quiz'}
                    </button>
                </div>
            </div>
        </div>
    );

    // ── QUIZ ──────────────────────────────────────────────────────────────────
    if (phase === 'quiz') return (
        <div style={S.page}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .card-hover:hover { border-color: rgba(139,92,246,0.5) !important; transform: translateY(-2px); }
                .opt-hover:hover { background: rgba(99,102,241,0.12) !important; border-color: rgba(99,102,241,0.4) !important; }
            `}</style>
            <div style={{ ...S.center, maxWidth: 780 }}>
                <div style={S.stickyTimer}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.82rem', letterSpacing: '.05em' }}>⏱  TIME REMAINING</span>
                        <span style={{ color: timerColor, fontWeight: 900, fontSize: '1.5rem', fontFamily: 'monospace' }}>{fmt(timeLeft)}</span>
                    </div>
                    <div style={S.timerTrack}>
                        <div style={{ ...S.timerFill, width: `${timerPct}%`, background: timerColor }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.78rem', color: '#475569' }}>
                        <span>{Object.keys(userAnswers).length} / {quiz.length} answered</span>
                        <span>{numPages}-page PDF · {quiz.length} questions · 1 min/question</span>
                    </div>
                </div>

                {quiz.map((q, qi) => (
                    <div key={qi} style={{ ...S.card, borderColor: userAnswers[qi] ? 'rgba(99,102,241,0.55)' : 'rgba(255,255,255,0.06)' }} className="card-hover">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={S.qNum}>Question {qi + 1} <span style={{ color: '#334155' }}>/ {quiz.length}</span></span>
                            {userAnswers[qi] && <span style={{ color: '#6366f1', fontSize: '0.78rem' }}>✓ Answered</span>}
                        </div>
                        <h3 style={S.qText}>{q.question}</h3>
                        <div style={S.optGrid}>
                            {q.options.map((opt, oi) => (
                                <button key={oi}
                                    onClick={() => setUserAnswers(prev => ({ ...prev, [qi]: opt }))}
                                    style={{ ...S.optBtn, ...(userAnswers[qi] === opt ? S.optSel : {}) }}
                                    className="opt-hover">
                                    <span style={{ ...S.optLetter, ...(userAnswers[qi] === opt ? { background: '#6366f1', color: '#fff' } : {}) }}>
                                        {['A','B','C','D'][oi]}
                                    </span>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <button onClick={() => submitQuiz(false)} style={{ ...S.btn, width: '100%', padding: '16px', fontSize: '1.05rem', marginTop: 8 }} className="btn-hover">
                    Submit Quiz →
                </button>
            </div>
        </div>
    );

    // ── RESULT ────────────────────────────────────────────────────────────────
    return (
        <div style={S.page}>
            <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
            <div style={{ ...S.center, maxWidth: 780 }}>
                <div style={{ ...S.resultHero, animation: 'fadeUp 0.5s ease', borderColor: `${g.color}33` }}>
                    <div style={{ fontSize: '4rem', fontWeight: 900, color: g.color, lineHeight: 1 }}>{g.letter}</div>
                    <div style={{ color: g.color, fontSize: '1.1rem', marginTop: 6, fontWeight: 600 }}>{g.label}</div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', margin: '14px 0 4px' }}>{pct}%</div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{correct} correct · {quiz.length - correct} wrong · {quiz.length} total</div>
                    <div style={{ margin: '20px 0 8px', height: 10, background: 'rgba(255,255,255,0.07)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${g.color}, ${g.color}88)`, borderRadius: 999, transition: 'width 1s ease' }} />
                    </div>
                    <div style={S.statsRow}>
                        {[['✅', correct, '#00e5a0', 'Correct'], ['❌', quiz.length - correct, '#f87171', 'Wrong'], ['⏱', fmt(timeTaken), '#a78bfa', 'Time Taken'], ['📄', numPages, '#38bdf8', 'Pages']].map(([icon, val, col, label]) => (
                            <div key={label} style={S.statBox}>
                                <div style={{ fontSize: '1.4rem' }}>{icon}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: col }}>{val}</div>
                                <div style={{ fontSize: '0.75rem', color: '#475569' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {quiz.map((q, qi) => {
                    const ua = userAnswers[qi];
                    const isCorrect = ua === q.answer;
                    return (
                        <div key={qi} style={{ ...S.card, borderColor: isCorrect ? 'rgba(0,229,160,0.25)' : 'rgba(248,113,113,0.25)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span style={S.qNum}>Q{qi + 1}</span>
                                <span style={{ fontSize: '1.2rem' }}>{isCorrect ? '✅' : '❌'}</span>
                            </div>
                            <h3 style={{ ...S.qText, fontSize: '0.98rem', marginBottom: 14 }}>{q.question}</h3>
                            <div style={S.optGrid}>
                                {q.options.map((opt, oi) => {
                                    const isAns = opt === q.answer;
                                    const isWrong = opt === ua && !isCorrect;
                                    return (
                                        <div key={oi} style={{ ...S.optBtn, cursor: 'default',
                                            background: isAns ? 'rgba(0,229,160,0.1)' : isWrong ? 'rgba(248,113,113,0.1)' : 'rgba(15,23,42,0.4)',
                                            border: isAns ? '1px solid rgba(0,229,160,0.45)' : isWrong ? '1px solid rgba(248,113,113,0.45)' : '1px solid rgba(255,255,255,0.05)',
                                            color: isAns ? '#00e5a0' : isWrong ? '#f87171' : '#475569' }}>
                                            <span style={{ ...S.optLetter,
                                                background: isAns ? 'rgba(0,229,160,0.2)' : isWrong ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.04)',
                                                color: isAns ? '#00e5a0' : isWrong ? '#f87171' : '#475569' }}>
                                                {['A','B','C','D'][oi]}
                                            </span>
                                            <span style={{ flex: 1 }}>{opt}</span>
                                            {isAns && <span style={{ fontSize: '0.75rem', color: '#00e5a0' }}>✓ Correct</span>}
                                            {isWrong && <span style={{ fontSize: '0.75rem', color: '#f87171' }}>Your answer</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button onClick={() => { setPhase('upload'); setQuiz([]); setFile(null); }}
                        style={{ ...S.btn, flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                        className="btn-hover">
                        ← New Quiz
                    </button>
                    <button onClick={() => window.location.href = '/progress'}
                        style={{ ...S.btn, flex: 1, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)' }}
                        className="btn-hover">
                        📊 My Progress
                    </button>
                    <button onClick={() => downloadPDF(quiz, userAnswers, file?.name, correct, timeTaken)}
                        style={{ ...S.btn, flex: 1 }}
                        className="btn-hover">
                        ⬇ Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
    page: { minHeight: '100vh', background: 'radial-gradient(ellipse at 20% 0%, #130d2e 0%, #060612 70%)', color: '#fff', padding: '40px 20px', fontFamily: "'Sora', sans-serif" },
    center: { maxWidth: 680, margin: '0 auto', textAlign: 'center' },
    progressBtn: { position: 'fixed', top: 250, right: 20, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', color: '#818cf8', borderRadius: 10, padding: '8px 18px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', zIndex: 999 },
    h1: { fontSize: 'clamp(2rem,5vw,3.4rem)', fontWeight: 900, marginBottom: 12, lineHeight: 1.1 },
    grad: { background: 'linear-gradient(135deg,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    sub: { color: '#64748b', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.75, fontSize: '0.95rem' },
    uploadCard: { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '40px 32px', backdropFilter: 'blur(16px)' },
    fileLabel: { display: 'inline-block', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.35)', color: '#a78bfa', borderRadius: 10, padding: '10px 28px', cursor: 'pointer', fontWeight: 700, marginBottom: 28, transition: 'all 0.2s' },
    hintGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 28 },
    hintCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 8px', textAlign: 'center', lineHeight: 1.6 },
    btn: { background: 'linear-gradient(135deg,#7c3aed,#db2777)', color: '#fff', border: 'none', padding: '13px 32px', borderRadius: 12, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' },
    btnOff: { background: '#111827', color: '#374151', border: 'none', padding: '13px 32px', borderRadius: 12, fontWeight: 700, fontSize: '1rem', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
    spinner: { display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.25)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
    stickyTimer: { position: 'sticky', top: 16, zIndex: 100, background: 'rgba(6,6,18,0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 20px', marginBottom: 24 },
    timerTrack: { height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' },
    timerFill: { height: '100%', borderRadius: 999, transition: 'width 1s linear, background 0.5s' },
    card: { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px', marginBottom: 14, textAlign: 'left', transition: 'border-color 0.3s, transform 0.2s' },
    qNum: { color: '#6366f1', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' },
    qText: { fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.6, marginBottom: 16, color: '#e2e8f0' },
    optGrid: { display: 'flex', flexDirection: 'column', gap: 8 },
    optBtn: { display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px', cursor: 'pointer', color: '#94a3b8', fontSize: '0.9rem', textAlign: 'left', transition: 'all 0.18s', width: '100%' },
    optSel: { background: 'rgba(99,102,241,0.16)', border: '1px solid rgba(99,102,241,0.55)', color: '#c7d2fe' },
    optLetter: { minWidth: 28, height: 28, background: 'rgba(255,255,255,0.06)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.78rem', color: '#64748b', flexShrink: 0, transition: 'all 0.18s' },
    resultHero: { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '36px 24px', marginBottom: 20 },
    statsRow: { display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20, flexWrap: 'wrap' },
    statBox: { background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 20px', textAlign: 'center', minWidth: 80 },
};

export default QuizGen;