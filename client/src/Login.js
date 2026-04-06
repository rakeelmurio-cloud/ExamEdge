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
  setError(""); // Clear previous errors

  try {
    const response = await axios.post('http://localhost:5000/api/users/login', {
      email,
      password
    });

    if (response.status === 200) {
      console.log("Logged in successfully!");
      // Optional: Save user data to localStorage so the app "remembers" who is logged in
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard'); 
    }
  } catch (err) {
    // If the backend returns 401 (Unauthorized), this block runs
    setError(err.response?.data?.error || "Invalid credentials. Try again.");
  }
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

// Use the exact same styles object from Register.js to keep the look consistent
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '85vh' },
  card: { background: 'var(--bg-surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border)', width: '380px', textAlign: 'center' },
  title: { color: 'var(--primary)', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { background: 'var(--bg-deep)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'white', outline: 'none' },
  submitBtn: { background: 'var(--primary)', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  error: { color: '#ff4d4d', fontSize: '0.8rem', margin: 0 },
  footerText: { marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' },
  link: { color: 'var(--primary)', textDecoration: 'none' }
};

export default Login;