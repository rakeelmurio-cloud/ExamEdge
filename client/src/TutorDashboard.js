import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TutorDashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [meeting, setMeeting] = useState({ date: '', time: '', link: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      try {
        const resReq = await axios.get(`http://localhost:5000/api/peer/requests/${user.email}`);
        const resUp = await axios.get(`http://localhost:5000/api/peer/sessions/tutor/${user.email}`);
        setRequests(resReq.data);
        setUpcoming(resUp.data);
      } catch (err) {
        console.error("Error loading dashboard data", err);
      }
    }
  };

  const handleAcceptFinal = async () => {
    if (!meeting.date || !meeting.time || !meeting.link) return alert("Please fill all fields.");

    try {
      await axios.put(`http://localhost:5000/api/peer/accept-session/${selectedId}`, {
        date: meeting.date,
        time: meeting.time,
        googleMeetLink: meeting.link
      });
      alert("✅ Session scheduled successfully!");
      setIsModalOpen(false);
      setMeeting({ date: '', time: '', link: '' });
      fetchDashboardData(); // Refresh both lists
    } catch (err) {
      alert("Error accepting request.");
    }
  };

  return (
    <div style={styles.container}>
      {/* --- SIDEBAR --- */}
      <div style={styles.sidebar}>
        
        <nav style={styles.nav}>
          <div style={styles.navItemActive}>📊 Overview</div>
          <div style={styles.navItem} onClick={() => navigate('/dashboard')}>📖 Switch to Student</div>
        </nav>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div style={styles.main}>
        <header style={styles.header}>
          <h1 style={styles.welcome}>Tutor Control Center</h1>
          <p style={styles.subtitle}>Manage your academic assistance sessions.</p>
        </header>

        {/* --- SCHEDULED SESSIONS --- */}
        <div style={{ ...styles.section, marginBottom: '30px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          <h2 style={styles.sectionTitle}>📅 Scheduled Sessions</h2>
          {upcoming.length > 0 ? upcoming.map(s => (
            <div key={s._id} style={styles.requestCard}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{s.module}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Student: {s.studentEmail}</p>
              </div>
              <div style={{ color: '#a78bfa', fontWeight: '600' }}>{s.date} at {s.time}</div>
              <a href={s.googleMeetLink} target="_blank" rel="noreferrer" style={styles.meetBtnSmall}>Start Meeting</a>
            </div>
          )) : <p style={{ color: '#475569' }}>No upcoming sessions yet.</p>}
        </div>

        {/* --- PENDING REQUESTS --- */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Pending Requests</h2>
          {requests.length > 0 ? requests.map(r => (
            <div key={r._id} style={styles.requestCard}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{r.studentEmail}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Module: {r.module}</p>
              </div>
              <button onClick={() => { setSelectedId(r._id); setIsModalOpen(true); }} style={styles.acceptBtn}>
                Accept & Schedule
              </button>
            </div>
          )) : <p style={{ color: '#475569' }}>No pending requests.</p>}
        </div>
      </div>

      {/* --- CUSTOM CENTER MODAL --- */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ marginTop: 0 }}>Schedule Session</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>Enter the details for the student.</p>
            
            <label style={styles.modalLabel}>Date</label>
            <input type="date" style={styles.modalInput} onChange={e => setMeeting({ ...meeting, date: e.target.value })} />

            <label style={styles.modalLabel}>Time</label>
            <input type="time" style={styles.modalInput} onChange={e => setMeeting({ ...meeting, time: e.target.value })} />

            <label style={styles.modalLabel}>Google Meet Link</label>
            <input type="text" placeholder="https://meet.google.com/..." style={styles.modalInput} onChange={e => setMeeting({ ...meeting, link: e.target.value })} />

            <div style={styles.modalActions}>
              <button onClick={() => setIsModalOpen(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleAcceptFinal} style={styles.confirmBtn}>Confirm & Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', height: '100vh', background: '#020617', color: 'white', fontFamily: 'Inter, sans-serif' },
  sidebar: { width: '260px', background: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '30px' },
  logo: { fontSize: '1.5rem', fontWeight: '800', marginBottom: '50px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '10px' },
  navItem: { padding: '12px 15px', borderRadius: '10px', cursor: 'pointer', color: '#94a3b8' },
  navItemActive: { padding: '12px 15px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' },
  main: { flex: 1, padding: '50px', overflowY: 'auto' },
  header: { marginBottom: '40px' },
  welcome: { fontSize: '2rem', fontWeight: '700', margin: 0 },
  subtitle: { color: '#94a3b8' },
  section: { background: 'rgba(30, 41, 59, 0.4)', borderRadius: '24px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)' },
  sectionTitle: { fontSize: '1.2rem', marginBottom: '20px' },
  requestCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '15px 20px', borderRadius: '12px', marginBottom: '10px' },
  acceptBtn: { background: '#8b5cf6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  meetBtnSmall: { background: '#22c55e', color: 'white', textDecoration: 'none', padding: '8px 15px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold' },
  
  // MODAL STYLES
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#1e293b', padding: '40px', borderRadius: '24px', width: '400px', border: '1px solid rgba(255,255,255,0.1)' },
  modalLabel: { display: 'block', color: '#a78bfa', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '5px', marginTop: '15px', textTransform: 'uppercase' },
  modalInput: { width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px', borderRadius: '10px', outline: 'none' },
  modalActions: { display: 'flex', gap: '15px', marginTop: '30px' },
  cancelBtn: { flex: 1, background: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '12px', borderRadius: '10px', cursor: 'pointer' },
  confirmBtn: { flex: 1, background: '#8b5cf6', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }
};

export default TutorDashboard;