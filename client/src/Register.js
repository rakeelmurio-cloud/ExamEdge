import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    const emailRegex = /^it\d{8}@my\.sliit\.lk$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{6,})/;

    if (!emailRegex.test(formData.email)) {
      setError("Use SLIIT email (itxxxxxxxx@my.sliit.lk)");
      return false;
    }
    if (!passwordRegex.test(formData.password)) {
      setError("Password: 6+ chars, Upper, Lower, & Special char.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Logic for MongoDB goes here
      console.log("Registered:", formData);
      alert("Registration Successful!");
      navigate('/login'); // Moves user to Login page
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Join ExamEdge</h2>
        <div style={styles.toggleGroup}>
          <button type="button" onClick={() => setFormData({...formData, role: 'student'})} 
            style={formData.role === 'student' ? styles.activeBtn : styles.inactiveBtn}>Student</button>
          <button type="button" onClick={() => setFormData({...formData, role: 'tutor'})} 
            style={formData.role === 'tutor' ? styles.activeBtn : styles.inactiveBtn}>Tutor</button>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input type="email" placeholder="itxxxxxxxx@my.sliit.lk" style={styles.input}
            onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="Password" style={styles.input}
            onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.submitBtn}>Register as {formData.role}</button>
        </form>
        <p style={styles.footerText}>Already have an account? <Link to="/login" style={styles.link}>Login</Link></p>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '85vh' },
  card: { background: 'var(--bg-surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border)', width: '380px', textAlign: 'center' },
  title: { color: 'var(--primary)', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { background: 'var(--bg-deep)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white', outline: 'none' },
  toggleGroup: { display: 'flex', gap: '10px', marginBottom: '20px' },
  activeBtn: { flex: 1, padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  inactiveBtn: { flex: 1, padding: '10px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' },
  submitBtn: { background: 'var(--primary)', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  error: { color: '#ff4d4d', fontSize: '0.8rem', margin: 0 },
  footerText: { marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' },
  link: { color: 'var(--primary)', textDecoration: 'none' }
};

export default Register;