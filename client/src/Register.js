import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Tesseract from 'tesseract.js';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const moduleData = {
    "Year 1": ["Introduction to Programming", "Mathematics for Computing", "Database Management"],
    "Year 2": ["Object Oriented Programming", "Software Engineering", "Computer Networks"],
    "Year 3": ["IT Project Management", "Cyber Security", "Data Science"],
    "Year 4": ["Distributed Systems", "Machine Learning", "Professional Practice"]
  };

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student',
    year: '',
    module: '',
    grade: ''
  });
  
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'tutor' || roleParam === 'student') {
      setFormData(prev => ({ ...prev, role: roleParam }));
    }
  }, [location]);

  const handleIdUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const itMatch = formData.email.match(/\d{8}/);
    const targetITNumber = itMatch ? itMatch[0] : null;

    if (!targetITNumber) {
      setError("Please enter your SLIIT email (itxxxxxxxx) first.");
      e.target.value = null; 
      setFileName('');
      return;
    }

    setIsVerifying(true);
    setError("");
    setIdVerified(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.filter = 'grayscale(100%) contrast(300%) brightness(80%)';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        try {
          const { data: { text } } = await Tesseract.recognize(canvas.toDataURL(), 'eng');
          const cleanNumbersOnly = text.replace(/\D/g, '');
          
          if (targetITNumber && cleanNumbersOnly.includes(targetITNumber)) {
            setIdVerified(true);
            setError("");
          } else {
            const uniqueMiddle = targetITNumber.substring(2, 6); 
            if (cleanNumbersOnly.includes(uniqueMiddle)) {
                setIdVerified(true);
                setError("");
            } else {
                setIdVerified(false);
                setError(`Verification failed: IT Number not detected.`);
            }
          }
        } catch (err) {
          setError("Scanning error.");
        } finally {
          setIsVerifying(false);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const emailRegex = /^it\d{8}@my\.sliit\.lk$/;
    if (!emailRegex.test(formData.email)) {
      setError("Use your itxxxxxxxx@my.sliit.lk email.");
      return false;
    }
    if (formData.role === 'tutor' && !idVerified) {
      setError("Student ID verification required for Tutors.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        await axios.post('http://localhost:5000/api/users/register', formData);
        alert("Registration Successful!");
        navigate('/login');
      } catch (err) {
        setError("Registration failed.");
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.logoContainer}>
        <div style={styles.logoBox}>⚡</div>
        <h2 style={styles.logoText}>ExamEdge</h2>
      </div>

      <div style={styles.card}>
        <h2 style={styles.title}>{formData.role === 'tutor' ? 'Tutor Registration' : 'Student Registration'}</h2>
        <p style={styles.subtitle}>Enter details to create your account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputBox}>
            <span style={styles.icon}>📧</span>
            <input
              type="email"
              placeholder="itxxxxxxxx@my.sliit.lk"
              style={styles.input}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div style={styles.inputBox}>
            <span style={styles.icon}>🔒</span>
            <input
              type="password"
              placeholder="Password"
              style={styles.input}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          {formData.role === 'tutor' && (
            <>
              {/* ID UPLOAD SECTION WITH INSTRUCTIONS */}
              <div style={{...styles.uploadArea, borderColor: idVerified ? '#22c55e' : fileName ? '#6366f1' : '#cbd5e1'}}>
                <label style={styles.uploadLabel}>
                  <span style={{fontSize: '20px', marginBottom: '5px'}}>🪪</span>
                  <strong>Upload Student ID Card</strong>
                  <span style={styles.uploadHint}>Front side with IT Number visible</span>
                  <input type="file" accept="image/*" style={styles.hiddenInput} onChange={handleIdUpload} />
                </label>
                {fileName && <p style={styles.fileName}>Selected: {fileName}</p>}
              </div>
              
              {isVerifying && <p style={styles.verifyMsg}>Verifying ID... Please wait.</p>}
              {idVerified && <p style={{...styles.verifyMsg, color: '#22c55e'}}>✅ ID Verified</p>}

              <div style={styles.inputBox}>
                <span style={styles.icon}>📅</span>
                <select style={styles.select} required value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value, module: ''})}>
                  <option value="" disabled>Year</option>
                  {Object.keys(moduleData).map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>

              <div style={styles.inputBox}>
                <span style={styles.icon}>📚</span>
                <select style={styles.select} required disabled={!formData.year} value={formData.module} onChange={(e) => setFormData({...formData, module: e.target.value})}>
                  <option value="" disabled>Specialization Module</option>
                  {formData.year && moduleData[formData.year].map(mod => <option key={mod} value={mod}>{mod}</option>)}
                </select>
              </div>

              <div style={styles.inputBox}>
                <span style={styles.icon}>🎓</span>
                <select style={styles.select} required value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})}>
                  <option value="" disabled>Grade Obtained</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                </select>
              </div>
            </>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <button 
            type="submit" 
            style={{...styles.button, opacity: (formData.role === 'tutor' && !idVerified) ? 0.6 : 1}}
            disabled={formData.role === 'tutor' && !idVerified}
          >
            Create Account
          </button>
        </form>

        <div style={styles.divider}></div>
        <p style={styles.footerText}>Already have an account? <Link to="/login" style={styles.link}>Login</Link></p>
      </div>
    </div>
  );
};

const styles = {
  container: { height: '100vh', background: 'radial-gradient(circle at top, #1e293b, #020617)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#fff' },
  logoContainer: { position: 'absolute', top: '40px', display: 'flex', alignItems: 'center', gap: '10px' },
  logoBox: { width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(45deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontWeight: '700', letterSpacing: '1px' },
  card: { width: '420px', padding: '30px 40px', borderRadius: '24px', background: 'rgba(30,41,59,0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' },
  title: { fontSize: '22px', fontWeight: '700', marginBottom: '5px' },
  subtitle: { fontSize: '13px', color: '#94a3b8', marginBottom: '25px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  inputBox: { display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '12px', padding: '10px 14px' },
  icon: { marginRight: '10px', color: '#64748b' },
  input: { border: 'none', outline: 'none', background: 'transparent', width: '100%', color: '#0f172a', fontSize: '14px' },
  select: { border: 'none', outline: 'none', background: 'none', width: '100%', color: '#0f172a', fontSize: '14px' },
  
  // New Upload Area Styles
  uploadArea: { border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '15px', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.3s' },
  uploadLabel: { display: 'flex', flexDirection: 'column', color: '#cbd5e1', fontSize: '13px', cursor: 'pointer' },
  uploadHint: { fontSize: '11px', color: '#94a3b8', marginTop: '3px' },
  hiddenInput: { display: 'none' },
  fileName: { fontSize: '11px', color: '#818cf8', marginTop: '8px', fontWeight: '600' },

  button: { marginTop: '10px', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(45deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: '700', cursor: 'pointer' },
  divider: { height: '1px', background: 'rgba(255,255,255,0.1)', margin: '15px 0' },
  error: { color: '#fb7185', fontSize: '12px', fontWeight: '500', textAlign: 'left' },
  verifyMsg: { fontSize: '11px', color: '#818cf8', marginTop: '-5px', textAlign: 'left', fontWeight: '600' },
  footerText: { color: '#94a3b8', fontSize: '13px' },
  link: { color: '#818cf8', textDecoration: 'none' }
};

export default Register;