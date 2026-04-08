import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Forum from './Forum';
import PeerMatching from './PeerMatching';
import RoleSelection from './RoleSelection';
import TutorDashboard from './TutorDashboard';
import NotesVault from './NotesVault';
import UploadNotes from './UploadNotes';
import QuizGen from './QuizGen';
import Progress from './Progress';

// Navbar Component: Sleek and Sticky
const Navbar = () => {
    const location = useLocation();
    const hideNavbarPaths = ['/', '/register', '/login'];
    
    if (hideNavbarPaths.includes(location.pathname)) return null;

    return (
        <nav style={S.navbar}>
            <Link to="/dashboard" style={S.logo}>
                Exam<span style={S.logoGrad}>Edge</span>
            </Link>
            
            <Link to="/" style={S.logoutBtn} className="logout-hover">
                Logout
            </Link>
        </nav>
    );
};

// Dashboard Component: High-impact Glassmorphism Grid
const Dashboard = () => (
    <div style={S.dashContainer}>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .card-hover:hover { 
                transform: translateY(-8px) scale(1.02); 
                border-color: rgba(139, 92, 246, 0.4) !important;
                background: rgba(255, 255, 255, 0.05) !important;
                box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            }
            .logout-hover:hover {
                background: #8b5cf6 !important;
                box-shadow: 0 0 15px rgba(139, 92, 246, 0.4);
                color: white !important;
            }
        `}</style>

        <div style={S.content}>
            {/* Hero Section */}
            <header style={{ ...S.hero, animation: 'slideUp 0.6s ease' }}>
                <h1 style={S.mainTitle}>
                    Empowering <span style={S.gradText}>Peer Learning.</span>
                </h1>
                <p style={S.sub}>
                    The all-in-one platform for SLIIT students to collaborate, share, and succeed.
                </p>
            </header>

            {/* Feature Grid */}
            <div style={S.grid}>
                {[
                    { title: 'Discussion Forum', desc: 'Ask doubts and help others in real-time', icon: '💬', link: '/forum' },
                    { title: 'Notes Vault', desc: 'Access and share curated lecture materials', icon: '📚', link: '/notes' },
                    { title: 'Peer Matching', desc: 'Find the perfect partner for study sessions', icon: '🤝', link: '/peer' },
                    { title: 'Quiz Gen', desc: 'Generate custom tests to master your modules', icon: '⚡', link: '/quiz' }
                ].map((card, i) => (
                    <Link key={i} to={card.link} style={{ textDecoration: 'none', animation: `slideUp ${0.7 + i * 0.1}s ease` }}>
                        <div style={S.card} className="card-hover">
                            <div style={S.cardIcon}>{card.icon}</div>
                            <h3 style={S.cardTitle}>{card.title}</h3>
                            <p style={S.cardDesc}>{card.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    </div>
);

function App() {
    return (
        <Router>
            <div style={{ fontFamily: "'Sora', sans-serif" }}>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/forum" element={<Forum />} />
                    <Route path="/peer" element={<PeerMatching />} />
                    <Route path="/select-role" element={<RoleSelection />} />
                    <Route path="/tutor-dashboard" element={<TutorDashboard />} />
                    <Route path="/notes" element={<NotesVault />} />
                    <Route path="/upload-notes" element={<UploadNotes />} />
                    <Route path="/quiz" element={<QuizGen />} />
                    <Route path="/progress" element={<Progress />} />
                </Routes>
            </div>
        </Router>
    );
}

const S = {
    // --- Navbar ---
    navbar: { 
        background: 'rgba(10, 10, 18, 0.8)', 
        backdropFilter: 'blur(16px)', 
        padding: '1.2rem 5%', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000 
    },
    logo: { 
        color: '#fff', 
        fontWeight: 800, 
        fontSize: '1.4rem', 
        textDecoration: 'none',
        letterSpacing: '-0.5px'
    },
    logoGrad: { color: '#8b5cf6' },
    logoutBtn: { 
        padding: '10px 24px', 
        borderRadius: '12px', 
        border: '1px solid rgba(139, 92, 246, 0.5)', 
        color: '#fff', 
        background: 'transparent',
        textDecoration: 'none', 
        fontSize: '0.85rem', 
        fontWeight: 700,
        transition: '0.3s'
    },

    // --- Dashboard ---
    dashContainer: {
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 0%, #161033 0%, #06060c 100%)',
        color: '#fff',
        paddingBottom: '80px'
    },
    content: {
        padding: '80px 20px',
        maxWidth: '1100px',
        margin: '0 auto',
    },
    hero: { textAlign: 'center', marginBottom: '80px' },
    mainTitle: {
        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
        fontWeight: 800,
        marginBottom: '20px',
        lineHeight: 1.1
    },
    gradText: {
        background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    sub: { color: '#94a3b8', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 },
    
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '24px',
    },
    card: {
        background: 'rgba(255, 255, 255, 0.02)',
        padding: '50px 30px',
        borderRadius: '32px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        textAlign: 'center',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        cursor: 'pointer',
    },
    cardIcon: { fontSize: '3.5rem', marginBottom: '25px', display: 'block' },
    cardTitle: { fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px', color: '#fff' },
    cardDesc: { color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }
};

export default App;