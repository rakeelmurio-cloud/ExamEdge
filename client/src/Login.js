import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const emailRegex = /^it\d{8}@my\.sliit\.lk$/;
    if (!emailRegex.test(email)) {
      setError("Use your SLIIT student email.");
      return;
    }
    console.log("Logging in...");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input type="email" placeholder="itxxxxxxxx@my.sliit.lk" style={styles.input}
            value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" style={styles.input}
            value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.submitBtn}>Login</button>
        </form>
        <p style={styles.footerText}>New to ExamEdge? <Link to="/register" style={styles.link}>Create Account</Link></p>
      </div>
    </div>
  );
};

// Use the same 'styles' object from the Register component above
const styles = { container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '85vh' },
  card: { background: 'var(--bg-surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border)', width: '380px', textAlign: 'center' },
  title: { color: 'var(--primary)', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { background: 'var(--bg-deep)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white' },
  toggleGroup: { display: 'flex', gap: '10px', marginBottom: '20px' },
  activeBtn: { flex: 1, padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  inactiveBtn: { flex: 1, padding: '10px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' },
  submitBtn: { background: 'var(--primary)', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  error: { color: '#ff4d4d', fontSize: '0.8rem', margin: 0 },
  footerText: { marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' },
  link: { color: 'var(--primary)', textDecoration: 'none' } }; // Copy-paste the styles object from Register.js

export default Login;