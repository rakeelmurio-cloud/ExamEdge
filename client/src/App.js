import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import './index.css';

// Navbar only shows on internal pages
const Navbar = () => {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/register', '/login'];
  
  if (hideNavbarPaths.includes(location.pathname)) return null;

  return (
    <nav style={navStyles.navbar}>
      <Link to="/dashboard" style={navStyles.logo}>
        Exam<span style={{ color: 'var(--primary)' }}>Edge</span>
      </Link>
      
      <Link 
        to="/" 
        style={navStyles.logoutBtn}
        onMouseOver={(e) => {
          e.target.style.background = 'var(--primary)';
          e.target.style.boxShadow = '0 0 15px rgba(99, 102, 241, 0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'rgba(99, 102, 241, 0.1)';
          e.target.style.boxShadow = 'none';
        }}
      >
        Logout
      </Link>
    </nav>
  );
};

const Dashboard = () => (
  <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
      <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '15px' }}>
        Empowering <span style={{ color: 'var(--primary)' }}>Peer Learning</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
        The all-in-one platform for SLIIT students
      </p>
    </div>

    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: '30px'
    }}>
      {[
        { title: 'Discussion Forum', desc: 'Ask doubts and help others', icon: '💬', link: '/forum' },
        { title: 'Notes Vault', desc: 'Access shared lecture materials', icon: '📚', link: '/notes' },
        { title: 'Peer Matching', desc: 'Find a study partner for finals', icon: '🤝', link: '/peer' },
        { title: 'AI Quiz Gen', desc: 'Test yourself before the exam', icon: '⚡', link: '/quiz' }
      ].map((card, i) => (
        <Link key={i} to={card.link} style={{ textDecoration: 'none' }}>
          <div style={{ 
            background: 'var(--bg-surface)', 
            padding: '40px 30px', 
            borderRadius: '24px', 
            border: '1px solid var(--border)',
            textAlign: 'center',
            transition: '0.3s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.transform = 'translateY(-5px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>{card.icon}</div>
            <h3 style={{ color: 'white', marginBottom: '12px' }}>{card.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{card.desc}</p>
          </div>
        </Link>
      ))}
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
        <Route path="/forum" element={<div style={{padding: '50px'}}><h2>Discussion Forum</h2></div>} />
        {/* Add other teammate routes here */}
      </Routes>
    </Router>
  );
}

const navStyles = {
  navbar: { 
    background: 'var(--glass)', 
    backdropFilter: 'blur(10px)', 
    padding: '1rem 3rem', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottom: '1px solid var(--border)', 
    position: 'sticky', 
    top: 0, 
    zIndex: 100 
  },
  logo: { 
    color: 'var(--text-main)', 
    fontWeight: '800', 
    fontSize: '1.4rem', 
    textDecoration: 'none' 
  },
  logoutBtn: { 
    padding: '10px 24px', 
    borderRadius: '12px', 
    border: '1px solid var(--primary)', 
    color: 'white', 
    background: 'rgba(99, 102, 241, 0.1)', // Light indigo tint
    textDecoration: 'none', 
    fontSize: '0.9rem', 
    fontWeight: '600',
    transition: '0.3s all ease'
  }
};

export default App;