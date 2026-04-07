import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PeerMatching = () => {
  const moduleData = {
    "Year 1": ["Introduction to Programming", "Mathematics for Computing", "Database Management"],
    "Year 2": ["Object Oriented Programming", "Software Engineering", "Computer Networks"],
    "Year 3": ["IT Project Management", "Cyber Security", "Data Science"],
    "Year 4": ["Distributed Systems", "Machine Learning", "Professional Practice"]
  };

  const [tutors, setTutors] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [filterYear, setFilterYear] = useState('Year 2');
  const [filterModule, setFilterModule] = useState(moduleData["Year 2"][0]);
  const [loading, setLoading] = useState(false);

  // Load data on mount and when filters change
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
      } catch (err) {
        console.error("Error fetching upcoming sessions", err);
      }
    }
  };

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/peer/tutors`, {
        params: { year: filterYear, module: filterModule }
      });
      setTutors(res.data);
    } catch (err) { 
      console.error("Error fetching tutors", err); 
    }
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
      alert("✅ Request sent successfully! Check back later for tutor acceptance.");
    } catch (err) { 
      alert("Failed to send request."); 
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <h1 style={styles.header}>Find a <span style={styles.gradientText}>Study Partner</span></h1>
        <p style={styles.subtitle}>Select your module to connect with available SLIIT tutors.</p>
        
        {/* --- UPCOMING SESSIONS SECTION --- */}
        {upcomingSessions.length > 0 && (
          <div style={{ marginBottom: '50px' }}>
            <h2 style={{ color: 'white', marginBottom: '20px', fontSize: '1.5rem' }}>📅 Your Upcoming Sessions</h2>
            <div style={styles.grid}>
              {upcomingSessions.map(session => (
                <div key={session._id} style={{ ...styles.tutorCard, border: '1px solid #22c55e', background: 'rgba(34, 197, 94, 0.05)' }}>
                  <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '0.7rem', marginBottom: '10px', textTransform: 'uppercase' }}>Confirmed Session</div>
                  <h3 style={styles.tutorName}>{session.module}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '10px' }}>Tutor: {session.tutorEmail}</p>
                  <p style={{ color: 'white', fontSize: '0.9rem', marginBottom: '15px' }}>
                    {session.date} | {session.time}
                  </p>
                  <a href={session.googleMeetLink} target="_blank" rel="noreferrer" style={styles.meetBtn}>Join Google Meet</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- FILTERS --- */}
        <div style={styles.glassCard}>
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Academic Year</label>
              <select style={styles.select} value={filterYear} onChange={(e) => {
                setFilterYear(e.target.value);
                setFilterModule(moduleData[e.target.value][0]);
              }}>
                {Object.keys(moduleData).map(y => <option key={y} value={y} style={styles.option}>{y}</option>)}
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Module Name</label>
              <select style={styles.select} value={filterModule} onChange={(e) => setFilterModule(e.target.value)}>
                {moduleData[filterYear].map(m => <option key={m} value={m} style={styles.option}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* --- TUTOR RESULTS --- */}
        <div style={styles.grid}>
          {loading ? (
            <p style={styles.message}>Searching for tutors...</p>
          ) : tutors.length > 0 ? (
            tutors.map((tutor, i) => (
              <div key={i} style={styles.tutorCard}>
                <div style={styles.avatar}>{tutor.email.charAt(0).toUpperCase()}</div>
                <h3 style={styles.tutorName}>{tutor.name || "Academic Tutor"}</h3>
                <p style={styles.tutorEmail}>{tutor.email}</p>
                <div style={styles.badge}>{filterModule}</div>
                <div style={styles.gradeBadge}>Grade: {tutor.grade || 'A'}</div>
                <button style={styles.connectBtn} onClick={() => handleRequest(tutor.email)}>Request Session</button>
              </div>
            ))
          ) : (
            <p style={styles.message}>No tutors found for this module.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: { minHeight: '100vh', background: 'radial-gradient(circle at top, #1e293b 0%, #020617 100%)', paddingBottom: '80px' },
  container: { padding: '60px 20px', maxWidth: '1100px', margin: '0 auto' },
  header: { textAlign: 'center', fontSize: '3rem', color: 'white', fontWeight: '800', marginBottom: '10px' },
  gradientText: { background: 'linear-gradient(to right, #8b5cf6, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { textAlign: 'center', color: '#94a3b8', marginBottom: '40px' },
  glassCard: { background: 'rgba(30, 41, 59, 0.4)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(12px)', marginBottom: '50px' },
  row: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  inputGroup: { flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '10px' },
  label: { color: '#a78bfa', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' },
  select: { background: 'rgba(15, 23, 42, 0.8)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '12px', outline: 'none' },
  option: { background: '#1e293b', color: 'white' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' },
  tutorCard: { background: 'rgba(30, 41, 59, 0.4)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center', backdropFilter: 'blur(10px)' },
  avatar: { width: '60px', height: '60px', background: 'linear-gradient(45deg, #8b5cf6, #d946ef)', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: 'white' },
  tutorName: { color: 'white', marginBottom: '5px', fontSize: '1.2rem' },
  tutorEmail: { color: '#94a3b8', fontSize: '0.85rem', marginBottom: '15px' },
  badge: { display: 'inline-block', background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', marginBottom: '8px' },
  gradeBadge: { color: '#22c55e', fontSize: '0.8rem', fontWeight: '700', marginBottom: '20px' },
  connectBtn: { width: '100%', background: '#8b5cf6', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' },
  meetBtn: { display: 'block', background: '#22c55e', color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '10px', fontWeight: 'bold', textAlign: 'center' },
  message: { color: '#94a3b8', textAlign: 'center', gridColumn: '1 / -1' }
};

export default PeerMatching;