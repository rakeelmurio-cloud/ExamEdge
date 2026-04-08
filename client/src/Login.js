import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Inside your Login.js handleLogin function
const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  try {
    const res = await axios.post('http://localhost:5000/api/users/login', {
      email,
      password
    });

    // SAVE BOTH: The user object and the specific email string
    localStorage.setItem('user', JSON.stringify(res.data.user));
    localStorage.setItem('userEmail', res.data.user.email); 

    if (res.data.user.role === 'tutor') {
      navigate('/select-role');
    } else {
      navigate('/dashboard');
    }
  } catch (err) {
    setError(err.response?.data?.error || "Invalid credentials");
  }
};

  return (
    <div style={styles.container}>

      {/* LOGO */}
      <div style={styles.logoContainer}>
        <h2 style={styles.logoText}>
          Exam<span style={{ color: 'var(--primary, #8b5cf6)' }}>Edge</span>
        </h2>
      </div>

      {/* CARD */}
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Secure access to your academic portal</p>

        <form onSubmit={handleLogin} style={styles.form}>

          {/* EMAIL */}
          <div style={styles.inputBox}>
            <span style={styles.icon}>📧</span>
            <input
              type="email"
              placeholder="it23414150@my.sliit.lk"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div style={styles.inputBox}>
            <span style={styles.icon}>🔒</span>
            <input
              type="password"
              placeholder="••••••••"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          {/* BUTTON */}
          <button type="submit" style={styles.button}>
            Sign In →
          </button>

        </form>

        <div style={styles.divider}></div>

        {/* FOOTER */}
        <p style={styles.footerText}>Don't have an account?</p>

        <div style={styles.links}>
          {/* Updated links to include role parameter */}
          <Link to="/register?role=student" style={styles.student}>Student Register</Link>
          <Link to="/register?role=tutor" style={styles.tutor}>Tutor Register</Link>
        </div>
      </div>

      {/* BOTTOM TEXT */}
      

    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    background: 'radial-gradient(circle at top, #1e293b, #020617)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
    color: '#fff'
  },

  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px'
  },

  logoBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
  },

  logoText: {
    fontWeight: '600'
  },

  card: {
    width: '400px',
    padding: '40px',
    borderRadius: '20px',
    background: 'rgba(30,41,59,0.6)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    textAlign: 'center'
  },

  title: {
    fontSize: '26px',
    fontWeight: '600',
    marginBottom: '5px'
  },

  subtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    marginBottom: '25px'
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },

  inputBox: {
  display: 'flex',
  alignItems: 'center',
  background: '#e2e8f0',   
  borderRadius: '12px',
  padding: '12px 14px'
},

  icon: {
    marginRight: '8px',
    color: '#334155'
  },

  input: {
    border: 'none',
    outline: 'none',
    background: 'none', // Critical fix
    backgroundColor: 'transparent', // Critical fix
    width: '100%',
    color: '#0f172a', // Dark text color
    fontSize: '14px',
    padding: '2px 0',
    // Prevent the default white box in some browsers
    ':-webkit-autofill': {
      boxShadow: '0 0 0 1000px #e2e8f0 inset',
      WebkitTextFillColor: '#0f172a'
    }
  },

  button: {
    marginTop: '10px',
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '15px'
  },

  error: {
    color: '#ef4444',
    fontSize: '0.85rem'
  },

  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.1)',
    margin: '20px 0'
  },

  footerText: {
    color: '#94a3b8',
    fontSize: '13px'
  },

  links: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '10px'
  },

  student: {
    color: '#6366f1',
    textDecoration: 'none',
    fontSize: '14px'
  },

  tutor: {
    color: '#f59e0b',
    textDecoration: 'none',
    fontSize: '14px'
  },

  bottomText: {
    marginTop: '20px',
    fontSize: '11px',
    color: '#64748b'
  }
};

export default Login;