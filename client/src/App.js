import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './index.css';

const Navbar = () => (
  <nav style={{ 
    background: 'var(--glass)', 
    backdropFilter: 'blur(10px)', 
    padding: '1rem 3rem', 
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid var(--border)'
  }}>
    <Link to="/" style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '1.4rem', textDecoration: 'none' }}>
      Exam<span style={{ color: 'var(--primary)' }}>Edge</span>
    </Link>
    
    <div style={{ display: 'flex', gap: '30px' }}>
      {['Peer', 'Forum', 'Notes', 'Quiz'].map((item) => (
        <Link 
          key={item}
          to={`/${item.toLowerCase()}`} 
          style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '500', transition: '0.3s' }}
          onMouseOver={(e) => e.target.style.color = 'var(--primary)'}
          onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
        >
          {item}
        </Link>
      ))}
    </div>
  </nav>
);

const Dashboard = () => (
  <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
    <div style={{ marginBottom: '40px' }}>
      <span style={{ 
        background: 'var(--primary-glow)',
        color: 'var(--primary)', 
        padding: '5px 15px', 
        borderRadius: '20px', 
        fontSize: '0.8rem', 
        fontWeight: 'bold',
        border: '1px solid var(--primary)'
      }}>
        V1.0 LIVE
      </span>
      <h1 style={{ fontSize: '3.5rem', marginTop: '20px', fontWeight: '800' }}>
        Empowering <span style={{ color: 'var(--primary)' }}>Peer Learning</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
        The all-in-one student support platform for SLIIT developers. Collaborate, share notes, and ace your exams.
      </p>
    </div>

    {/* Stylish Stat Cards */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '50px' }}>
      {[
        { label: 'Active Students', val: '1,240+' },
        { label: 'Notes Shared', val: '850' },
        { label: 'Quizzes Taken', val: '3,100' }
      ].map((stat, i) => (
        <div key={i} style={{ 
          background: 'var(--bg-surface)', 
          padding: '30px', 
          borderRadius: '16px', 
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '2rem', margin: '0', color: 'var(--primary)' }}>{stat.val}</h2>
          <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>{stat.label}</p>
        </div>
      ))}
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* These placeholders stay until your team injects their actual code */}
        <Route path="/peer" element={<div style={{padding: '50px'}}><h2>Peer Learning Module</h2></div>} />
        <Route path="/forum" element={<div style={{padding: '50px'}}><h2>Discussion Forum</h2></div>} />
        <Route path="/notes" element={<div style={{padding: '50px'}}><h2>Notes Sharing</h2></div>} />
        <Route path="/quiz" element={<div style={{padding: '50px'}}><h2>Quiz Generation</h2></div>} />
      </Routes>
    </Router>
  );
}

export default App;