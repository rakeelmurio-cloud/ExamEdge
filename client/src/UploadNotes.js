import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const moduleData = {
    "Year 1": ["Introduction to Programming", "Mathematics for Computing", "Database Management"],
    "Year 2": ["Object Oriented Programming", "Software Engineering", "Computer Networks"],
    "Year 3": ["IT Project Management", "Cyber Security", "Data Science"],
    "Year 4": ["Distributed Systems", "Machine Learning", "Professional Practice"]
};

const UploadNotes = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [module, setModule] = useState('');
  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', title);
    formData.append('year', year);
    formData.append('module', module);

    try {
      await axios.post('http://localhost:5000/api/notes/upload', formData);
      alert("Upload successful!");
      navigate('/notes');
    } catch (err) { alert("Upload failed."); }
  };

  return (
    <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0f172a'}}>
      <div style={{background: 'rgba(30, 41, 59, 0.7)', padding: '40px', borderRadius: '25px', width: '400px', color: 'white', border: '1px solid rgba(255,255,255,0.1)'}}>
        <h2 style={{textAlign: 'center', marginBottom: '25px'}}>Share Your <span style={{color: '#8b5cf6'}}>Notes</span></h2>
        <form onSubmit={handleUpload} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
          <input 
            style={formStyles.input} 
            placeholder="Document Title" 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
          
          <select style={formStyles.input} onChange={(e) => {setYear(e.target.value); setModule('');}} required>
            <option value="">Select Year</option>
            {Object.keys(moduleData).map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select style={formStyles.input} onChange={(e) => setModule(e.target.value)} value={module} disabled={!year} required>
            <option value="">Select Module</option>
            {year && moduleData[year].map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} required />
          
          <div style={{display: 'flex', gap: '10px'}}>
            <button type="submit" style={formStyles.btn}>Upload</button>
            <button type="button" onClick={() => navigate('/notes')} style={formStyles.cancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const formStyles = {
  input: { padding: '12px', borderRadius: '10px', background: '#0f172a', border: '1px solid #334155', color: 'white' },
  btn: { flex: 2, padding: '12px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  cancel: { flex: 1, padding: '12px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '10px', cursor: 'pointer' }
};

export default UploadNotes;