import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Tesseract from 'tesseract.js';

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const moduleData = {
        "Year 1": ["Introduction to Programming", "Mathematics for Computing", "Database Management"],
        "Year 2": ["Object Oriented Programming", "Software Engineering", "Computer Networks"],
        "Year 3": ["IT Project Management", "Cyber Security", "Data Science"],
        "Year 4": ["Distributed Systems", "Machine Learning", "Professional Practice"]
    };

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'student',
        year: '',
        module: '',
        grade: ''
    });

    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [idVerified, setIdVerified] = useState(false);
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const roleParam = params.get('role');
        if (roleParam === 'tutor' || roleParam === 'student') {
            setFormData(prev => ({ ...prev, role: roleParam }));
        }
    }, [location]);

    const handleIdUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);

        const itMatch = formData.email.match(/\d{8}/);
        const targetITNumber = itMatch ? itMatch[0] : null;

        if (!targetITNumber) {
            setError("Please enter your SLIIT email first.");
            e.target.value = null;
            setFileName('');
            return;
        }

        setIsVerifying(true);
        setError("");
        setIdVerified(false);

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width * 2;
                canvas.height = img.height * 2;
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.filter = 'grayscale(100%) contrast(300%) brightness(80%)';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                try {
                    const { data: { text } } = await Tesseract.recognize(canvas.toDataURL(), 'eng');
                    const cleanNumbersOnly = text.replace(/\D/g, '');
                    const uniqueMiddle = targetITNumber.substring(2, 6);

                    if (cleanNumbersOnly.includes(targetITNumber) || cleanNumbersOnly.includes(uniqueMiddle)) {
                        setIdVerified(true);
                        setError("");
                    } else {
                        setIdVerified(false);
                        setError(`Verification failed: IT Number not detected.`);
                    }
                } catch (err) {
                    setError("Scanning error.");
                } finally {
                    setIsVerifying(false);
                }
            };
        };
        reader.readAsDataURL(file);
    };

    const validate = () => {
        const emailRegex = /^it\d{8}@my\.sliit\.lk$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/;
        if (!emailRegex.test(formData.email)) { setError("Use itxxxxxxxx@my.sliit.lk email."); return false; }
        if (!passwordRegex.test(formData.password)) { setError("Password too weak."); return false; }
        if (formData.role === 'tutor' && !idVerified) { setError("ID verification required."); return false; }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                await axios.post('http://localhost:5000/api/users/register', formData);
                alert("Registration Successful!");
                navigate('/login');
            } catch (err) { setError("Registration failed."); }
        }
    };

    return (
        <div style={S.page}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
                
                /* FORCIBLY REMOVE AUTOFILL WHITE BOX */
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus,
                input:-webkit-autofill:active {
                    -webkit-text-fill-color: #ffffff !important;
                    -webkit-box-shadow: 0 0 0px 1000px #0f172a inset !important;
                    box-shadow: 0 0 0px 1000px #0f172a inset !important;
                    transition: background-color 5000s ease-in-out 0s;
                }

                input::placeholder { 
                    color: rgba(255, 255, 255, 0.3) !important; 
                }
                
                select option { background: #0f172a; color: white; }

                .auth-btn:hover:not(:disabled) { 
                    transform: translateY(-2px); 
                    box-shadow: 0 10px 20px -5px rgba(139, 92, 246, 0.5); 
                }
            `}</style>

            <div style={S.container}>
                <header style={S.logoContainer}>
                    <h2 style={S.logoText}>
                        Exam<span style={{ color: '#8b5cf6' }}>Edge</span>
                    </h2>
                </header>

                <div style={S.card}>
                    <h1 style={S.title}>{formData.role === 'tutor' ? 'Tutor Registration' : 'Student Registration'}</h1>
                    <p style={S.subtitle}>Join the SLIIT peer network today</p>

                    <form onSubmit={handleSubmit} style={S.form}>
                        {/* EMAIL */}
                        <div style={S.inputGroup}>
                            <label style={S.label}>Institutional Email</label>
                            <div style={S.inputWrapper}>
                                <span style={S.icon}>📧</span>
                                <input
                                    type="email"
                                    placeholder="itxxxxxxxx@my.sliit.lk"
                                    style={S.input}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div style={S.inputGroup}>
                            <label style={S.label}>Security Password</label>
                            <div style={S.inputWrapper}>
                                <span style={S.icon}>🔒</span>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    style={S.input}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <p style={S.hint}>6+ chars with uppercase & special char</p>
                        </div>

                        {formData.role === 'tutor' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {/* ID UPLOAD */}
                                <div style={{
                                    ...S.uploadArea,
                                    borderColor: idVerified ? '#22c55e' : isVerifying ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                                    background: idVerified ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255,255,255,0.02)'
                                }}>
                                    <label style={S.uploadLabel}>
                                        <span style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🪪</span>
                                        <span style={{ fontWeight: 700 }}>Upload Student ID Card</span>
                                        <span style={S.uploadHint}>Scanning for IT number...</span>
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleIdUpload} />
                                    </label>
                                    {fileName && <p style={S.fileName}>{fileName}</p>}
                                    {isVerifying && <p style={S.verifyMsg}>Verifying...</p>}
                                    {idVerified && <p style={S.verifiedMsg}>✅ ID Verified</p>}
                                </div>

                                {/* SELECTS */}
                                <div style={S.inputWrapper}>
                                    <span style={S.icon}>📅</span>
                                    <select style={S.select} required value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value, module: '' })}>
                                        <option value="" disabled>Select Year</option>
                                        {Object.keys(moduleData).map(year => <option key={year} value={year}>{year}</option>)}
                                    </select>
                                </div>

                                <div style={S.inputWrapper}>
                                    <span style={S.icon}>📚</span>
                                    <select style={S.select} required disabled={!formData.year} value={formData.module} onChange={(e) => setFormData({ ...formData, module: e.target.value })}>
                                        <option value="" disabled>Specialization Module</option>
                                        {formData.year && moduleData[formData.year].map(mod => <option key={mod} value={mod}>{mod}</option>)}
                                    </select>
                                </div>

                                <div style={S.inputWrapper}>
                                    <span style={S.icon}>🎓</span>
                                    <select style={S.select} required value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })}>
                                        <option value="" disabled>Grade Obtained</option>
                                        <option value="A">Grade A</option>
                                        <option value="B">Grade B</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {error && <p style={S.error}>{error}</p>}

                        <button
                            type="submit"
                            style={{ ...S.button, opacity: (formData.role === 'tutor' && !idVerified) ? 0.5 : 1 }}
                            disabled={formData.role === 'tutor' && !idVerified}
                            className="auth-btn"
                        >
                            Complete Registration →
                        </button>
                    </form>

                    <div style={S.divider}></div>
                    <p style={S.footerText}>Already have an account? <Link to="/login" style={S.link}>Login</Link></p>
                </div>
            </div>
        </div>
    );
};

const S = {
    page: { minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, #161033 0%, #06060c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora', sans-serif", padding: '40px 20px' },
    container: { width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    logoContainer: { marginBottom: '25px' },
    logoText: { fontSize: '2.2rem', fontWeight: 800, color: '#fff', letterSpacing: '-1.5px' },
    card: { width: '100%', padding: '40px 35px', borderRadius: '32px', background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(25px)', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' },
    title: { fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: '8px', letterSpacing: '-0.5px' },
    subtitle: { fontSize: '0.85rem', color: '#94a3b8', marginBottom: '30px' },
    form: { display: 'flex', flexDirection: 'column', gap: '18px' },
    inputGroup: { textAlign: 'left' },
    label: { fontSize: '0.65rem', fontWeight: 800, color: '#a78bfa', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.8px' },
    inputWrapper: { display: 'flex', alignItems: 'center', background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '12px 16px' },
    icon: { marginRight: '12px', fontSize: '1.1rem' },
    input: { border: 'none', outline: 'none', background: 'transparent', width: '100%', color: '#fff', fontSize: '0.95rem', fontFamily: "'Sora', sans-serif" },
    select: { border: 'none', outline: 'none', background: 'transparent', width: '100%', color: '#fff', fontSize: '0.95rem', fontFamily: "'Sora', sans-serif", cursor: 'pointer' },
    hint: { fontSize: '10px', color: '#64748b', marginTop: '6px', marginLeft: '4px' },
    uploadArea: { border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '20px', padding: '20px', textAlign: 'center', transition: '0.3s' },
    uploadLabel: { cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#cbd5e1', fontSize: '0.8rem' },
    uploadHint: { fontSize: '11px', color: '#64748b', marginTop: '4px' },
    fileName: { fontSize: '10px', color: '#8b5cf6', marginTop: '10px', fontWeight: 600 },
    verifiedMsg: { color: '#22c55e', fontSize: '11px', fontWeight: 700, marginTop: '8px' },
    verifyMsg: { color: '#a78bfa', fontSize: '11px', fontWeight: 700, marginTop: '8px' },
    button: { padding: '16px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #db2777)', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '1rem', transition: '0.3s' },
    error: { color: '#f87171', fontSize: '0.8rem', fontWeight: 600, textAlign: 'left' },
    divider: { height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '20px 0' },
    footerText: { color: '#94a3b8', fontSize: '0.85rem' },
    link: { color: '#a78bfa', textDecoration: 'none', fontWeight: 700 }
};

export default Register;