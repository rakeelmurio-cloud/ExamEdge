import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Forum from './Forum';
import './index.css';
import PeerMatching from './PeerMatching';
import RoleSelection from './RoleSelection';
import TutorDashboard from './TutorDashboard';

// Navbar Component: Synced with the login page aesthetic
const Navbar = () => {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/register', '/login'];
  
  if (hideNavbarPaths.includes(location.pathname)) return null;

  return (
    <nav style={navStyles.navbar}>
      <Link to="/dashboard" style={navStyles.logo}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          <span style={{ letterSpacing: '-0.5px' }}>
            Exam<span style={{ color: 'var(--primary, #8b5cf6)' }}>Edge</span>
          </span>
        </div>
      </Link>
      
      <Link 
        to="/" 
        style={navStyles.logoutBtn}
        onMouseOver={(e) => {
          e.target.style.background = 'var(--primary, #8b5cf6)';
          e.target.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.4)';
          e.target.style.color = 'white';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'transparent';
          e.target.style.boxShadow = 'none';
          e.target.style.color = 'white';
        }}
      >
        Logout
      </Link>
    </nav>
  );
};

// Dashboard Component: Styled to match the Login Page theme
const Dashboard = () => (
  <div style={dashStyles.container}>
    <div style={dashStyles.content}>
      
      {/* Hero Section */}
      <div style={dashStyles.hero}>
        <h1 style={dashStyles.mainTitle}>
          Empowering <span style={dashStyles.gradientText}>Peer Learning</span>
        </h1>
        <p style={dashStyles.subtitle}>
          The all-in-one platform for SLIIT students to collaborate and succeed.
        </p>
      </div>

      {/* Feature Grid */}
      <div style={dashStyles.grid}>
        {[
          { title: 'Discussion Forum', desc: 'Ask doubts and help others', icon: '💬', link: '/forum' },
          { title: 'Notes Vault', desc: 'Access shared lecture materials', icon: '📚', link: '/notes' },
          { title: 'Peer Matching', desc: 'Find a study partner for finals', icon: '🤝', link: '/peer' },
          { title: 'AI Quiz Gen', desc: 'Test yourself before the exam', icon: '⚡', link: '/quiz' }
        ].map((card, i) => (
          <Link key={i} to={card.link} style={{ textDecoration: 'none' }}>
            <div 
              style={dashStyles.card}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={dashStyles.cardIcon}>{card.icon}</div>
              <h3 style={dashStyles.cardTitle}>{card.title}</h3>
              <p style={dashStyles.cardDesc}>{card.desc}</p>
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
      </Routes>
    </Router>
  );
}

// --- Styles Objects ---

const dashStyles = {
  container: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 100%)',
    color: '#ffffff',
    fontFamily: "'Inter', sans-serif",
  },
  content: {
    padding: '80px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '70px',
  },
  mainTitle: {
    fontSize: '3.5rem',
    fontWeight: '800',
    marginBottom: '15px',
    letterSpacing: '-1.5px',
  },
  gradientText: {
    background: 'linear-gradient(to right, #8b5cf6, #d946ef)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1.2rem',
    fontWeight: '400',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '25px',
  },
  card: {
    background: 'rgba(30, 41, 59, 0.5)',
    padding: '45px 30px',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    backdropFilter: 'blur(12px)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  cardIcon: {
    fontSize: '3rem',
    marginBottom: '20px',
    display: 'block',
  },
  cardTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    marginBottom: '10px',
    color: '#f8fafc',
  },
  cardDesc: {
    color: '#94a3b8',
    fontSize: '0.95rem',
    lineHeight: '1.6',
  }
};

const navStyles = {
  navbar: { 
    background: 'rgba(15, 23, 42, 0.8)', 
    backdropFilter: 'blur(15px)', 
    padding: '1.2rem 4rem', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
    position: 'sticky', 
    top: 0, 
    zIndex: 100 
  },
  logo: { 
    color: '#ffffff', 
    fontWeight: '800', 
    fontSize: '1.5rem', 
    textDecoration: 'none' 
  },
  logoIcon: {
    background: '#8b5cf6',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    fontSize: '1.2rem'
  },
  logoutBtn: { 
    padding: '10px 24px', 
    borderRadius: '12px', 
    border: '1px solid #8b5cf6', 
    color: 'white', 
    background: 'transparent',
    textDecoration: 'none', 
    fontSize: '0.9rem', 
    fontWeight: '600',
    transition: 'all 0.3s ease'
  }
};

export default App;