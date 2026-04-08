import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await axios.post('http://localhost:5000/api/users/login', { email, password });
            localStorage.setItem('user', JSON.stringify(res.data.user));
            localStorage.setItem('userEmail', res.data.user.email); 
            res.data.user.role === 'tutor' ? navigate('/select-role') : navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || "Invalid credentials");
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
                    font-family: 'Sora', sans-serif;
                }
                
                .auth-btn:hover { 
                    transform: translateY(-2px); 
                    box-shadow: 0 10px 20px -5px rgba(139, 92, 246, 0.5); 
                }

                .link-hover:hover {
                    text-decoration: underline !important;
                    opacity: 0.8;
                }
            `}</style>

            <div style={S.container}>
                {/* LOGO - Exact match to Navbar style */}
                <header style={S.logoContainer}>
                    <h2 style={S.logoText}>
                        Exam<span style={{ color: '#8b5cf6' }}>Edge</span>
                    </h2>
                </header>

                {/* LOGIN CARD */}
                <div style={S.card}>
                    <h1 style={S.title}>Welcome Back</h1>
                    <p style={S.subtitle}>Secure access to your academic vault</p>

                    <form onSubmit={handleLogin} style={S.form}>
                        {/* EMAIL */}
                        <div style={S.inputGroup}>
                            <label style={S.label}>Institutional Email</label>
                            <div style={S.inputWrapper}>
                                <span style={S.icon}>📧</span>
                                <input
                                    type="email"
                                    placeholder="it23xxxxxx@my.sliit.lk"
                                    style={S.input}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* PASSWORD */}
                        <div style={S.inputGroup}>
                            <label style={S.label}>Password</label>
                            <div style={S.inputWrapper}>
                                <span style={S.icon}>🔒</span>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    style={S.input}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && <p style={S.error}>{error}</p>}

                        <button type="submit" style={S.button} className="auth-btn">
                            Sign In →
                        </button>
                    </form>

                    <div style={S.divider}>
                        <span style={S.dividerText}>or</span>
                    </div>

                    {/* REGISTRATION LINKS */}
                    <p style={S.footerText}>New to the platform?</p>
                    <div style={S.linkContainer}>
                        <Link to="/register?role=student" style={S.studentLink} className="link-hover">
                            Register as Student
                        </Link>
                        <span style={{color: '#475569'}}>•</span>
                        <Link to="/register?role=tutor" style={S.tutorLink} className="link-hover">
                            Register as Tutor
                        </Link>
                    </div>
                </div>
                
                <p style={S.bottomTag}>SLIIT Peer-to-Peer Learning Network © 2026</p>
            </div>
        </div>
    );
};

const S = {
    page: { 
        minHeight: '100vh', 
        background: 'radial-gradient(ellipse at 50% 0%, #161033 0%, #06060c 100%)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontFamily: "'Sora', sans-serif",
        padding: '20px'
    },
    container: { 
        width: '100%', 
        maxWidth: '420px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
    },
    logoContainer: { marginBottom: '30px' },
    logoText: { 
        fontSize: '2.2rem', 
        fontWeight: 800, 
        color: '#fff', 
        letterSpacing: '-1.5px',
        margin: 0
    },
    card: { 
        width: '100%', 
        padding: '45px 35px', 
        borderRadius: '32px', 
        background: 'rgba(255, 255, 255, 0.03)', 
        backdropFilter: 'blur(25px)', 
        border: '1px solid rgba(255, 255, 255, 0.08)', 
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    },
    title: { 
        fontSize: '1.75rem', 
        fontWeight: 700, 
        color: '#fff', 
        marginBottom: '8px',
        letterSpacing: '-0.5px'
    },
    subtitle: { 
        fontSize: '0.9rem', 
        color: '#94a3b8', 
        marginBottom: '35px' 
    },
    form: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px' 
    },
    inputGroup: { textAlign: 'left' },
    label: { 
        fontSize: '0.7rem', 
        fontWeight: 800, 
        color: '#a78bfa', 
        marginBottom: '8px', 
        display: 'block', 
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    inputWrapper: { 
        display: 'flex', 
        alignItems: 'center', 
        background: '#0f172a', 
        border: '1px solid rgba(255, 255, 255, 0.1)', 
        borderRadius: '16px', 
        padding: '14px 18px',
        transition: '0.3s'
    },
    icon: { marginRight: '12px', fontSize: '1.1rem' },
    input: { 
        border: 'none', 
        outline: 'none', 
        background: 'transparent', 
        width: '100%', 
        color: '#fff', 
        fontSize: '0.95rem',
        fontFamily: "'Sora', sans-serif"
    },
    button: { 
        marginTop: '10px', 
        padding: '16px', 
        borderRadius: '16px', 
        border: 'none', 
        background: 'linear-gradient(135deg, #7c3aed, #db2777)', 
        color: '#fff', 
        fontWeight: 800, 
        cursor: 'pointer', 
        fontSize: '1rem',
        transition: '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },
    error: { 
        color: '#f87171', 
        fontSize: '0.8rem', 
        fontWeight: 600 
    },
    divider: { 
        height: '1px', 
        background: 'rgba(255, 255, 255, 0.1)', 
        margin: '30px 0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative'
    },
    dividerText: {
        background: '#0a0a14', /* Matches the local card depth background */
        padding: '0 15px',
        color: '#475569',
        fontSize: '0.8rem',
        position: 'absolute'
    },
    footerText: { 
        color: '#64748b', 
        fontSize: '0.85rem', 
        marginBottom: '10px' 
    },
    linkContainer: { 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '12px', 
        alignItems: 'center' 
    },
    studentLink: { 
        color: '#a78bfa', 
        textDecoration: 'none', 
        fontSize: '0.85rem', 
        fontWeight: 600 
    },
    tutorLink: { 
        color: '#f472b6', 
        textDecoration: 'none', 
        fontSize: '0.85rem', 
        fontWeight: 600 
    },
    bottomTag: {
        marginTop: '30px',
        fontSize: '0.7rem',
        color: '#475569',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '1px'
    }
};

export default Login;