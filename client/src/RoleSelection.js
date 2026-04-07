import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back!</h2>
        <p style={styles.subtitle}>How would you like to continue today?</p>
        
        <div style={styles.buttonContainer}>
          <div style={styles.optionBox} onClick={() => navigate('/dashboard')}>
            <div style={styles.icon}>📖</div>
            <h3>As a Student</h3>
            <p>Access forums, notes, and quizzes.</p>
          </div>

          <div style={styles.optionBox} onClick={() => navigate('/tutor-dashboard')}>
            <div style={styles.icon}>🎓</div>
            <h3>As a Tutor</h3>
            <p>Manage your sessions and students.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { height: '100vh', background: 'radial-gradient(circle at top, #1e293b, #020617)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { width: '600px', padding: '40px', borderRadius: '24px', background: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' },
  title: { fontSize: '2rem', color: 'white', marginBottom: '10px' },
  subtitle: { color: '#94a3b8', marginBottom: '40px' },
  buttonContainer: { display: 'flex', gap: '20px' },
  optionBox: { 
    flex: 1, padding: '30px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: '0.3s', color: 'white' 
  },
  icon: { fontSize: '3rem', marginBottom: '15px' }
};

export default RoleSelection;