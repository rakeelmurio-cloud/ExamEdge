import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const moduleData = {
    "Year 1": ["Introduction to Programming", "Mathematics for Computing", "Database Management"],
    "Year 2": ["Object Oriented Programming", "Software Engineering", "Computer Networks"],
    "Year 3": ["IT Project Management", "Cyber Security", "Data Science"],
    "Year 4": ["Distributed Systems", "Machine Learning", "Professional Practice"]
};

const NotesVault = () => {
    const [allNotes, setAllNotes] = useState([]);
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [filterYear, setFilterYear] = useState('');
    const [filterModule, setFilterModule] = useState('');
    const navigate = useNavigate();

    // Get current logged-in user email
    const currentStudentEmail = localStorage.getItem('userEmail');

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/notes');
            // Ensure every note has a likedBy array to prevent errors
            const sanitizedData = res.data.map(note => ({
                ...note,
                likedBy: note.likedBy || []
            }));
            setAllNotes(sanitizedData);
        } catch (err) {
            console.error("Error fetching notes:", err);
        }
    };

    // Recalculate filtered notes whenever filters OR the main list changes
    useEffect(() => {
        let temp = [...allNotes];
        if (filterYear) temp = temp.filter(n => n.year === filterYear);
        if (filterModule) temp = temp.filter(n => n.module === filterModule);
        setFilteredNotes(temp);
    }, [filterYear, filterModule, allNotes]);

    const handleLike = async (id) => {
        if (!currentStudentEmail) {
            alert("Please log in to like this note!");
            return;
        }

        try {
            const res = await axios.put(`http://localhost:5000/api/notes/${id}/like`, {
                studentId: currentStudentEmail
            });

            // Update state with the fresh note data returned from the server
            // The server returns the updated note object with the new likedBy array
            setAllNotes(prev => prev.map(note => note._id === id ? { ...res.data, likedBy: res.data.likedBy || [] } : note));
        } catch (err) {
            console.error("Like failed:", err.response?.data?.message || err.message);
        }
    };

    const downloadFile = async (url, fileName) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            window.open(url, '_blank');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.headerSection}>
                <h1 style={styles.title}>Notes <span style={{ color: '#8b5cf6' }}>Vault</span></h1>
                <div style={styles.filterGroup}>
                    <select style={styles.select} value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setFilterModule(''); }}>
                        <option value="">All Years</option>
                        {Object.keys(moduleData).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select style={styles.select} value={filterModule} onChange={(e) => setFilterModule(e.target.value)} disabled={!filterYear}>
                        <option value="">All Modules</option>
                        {filterYear && moduleData[filterYear].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <button onClick={() => navigate('/upload-notes')} style={styles.uploadBtn}>+ Upload</button>
                </div>
            </div>

            <div style={styles.grid}>
                {filteredNotes.map(note => {
                    // Logic: Count is the length of the likedBy array from the DB
                    const noteLikes = note.likedBy || [];
                    const totalLikes = noteLikes.length;
                    const hasLiked = noteLikes.includes(currentStudentEmail);

                    return (
                        <div key={note._id} style={styles.card}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📄</div>
                            <h3 style={styles.cardTitle}>{note.title}</h3>
                            <p style={styles.cardSubText}>{note.year} • {note.module}</p>

                            <div style={styles.actionRow}>
                                <button
                                    onClick={() => handleLike(note._id)}
                                    className="like-btn-pop"
                                    style={{
                                        ...styles.likeBtn,
                                        background: hasLiked ? '#8b5cf6' : 'rgba(139, 92, 246, 0.1)',
                                        color: hasLiked ? 'white' : '#8b5cf6',
                                        // Student B can still click if Student A already liked it
                                        cursor: hasLiked ? 'default' : 'pointer',
                                        border: hasLiked ? '1px solid #8b5cf6' : '1px solid rgba(139, 92, 246, 0.5)'
                                    }}
                                >
                                    <span style={{ marginRight: '5px' }}>❤️</span> {totalLikes}
                                </button>
                                <div style={styles.linkGroup}>
                                    <a href={`http://localhost:5000/${note.fileUrl}`} target="_blank" rel="noreferrer" style={styles.subLink}>View</a>
                                    <button onClick={() => downloadFile(`http://localhost:5000/${note.fileUrl}`, note.title)} style={styles.dlBtn}>Download</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <style>{`
                .like-btn-pop:active { transform: scale(1.2); transition: 0.1s; }
                .like-btn-pop { transition: all 0.2s ease; }
            `}</style>
        </div>
    );
};

const styles = {
    container: { padding: '80px 20px', minHeight: '100vh', background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 100%)', color: 'white' },
    headerSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '60px', gap: '25px' },
    title: { fontSize: '3.5rem', fontWeight: '800', margin: 0 },
    filterGroup: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
    select: { padding: '12px', borderRadius: '12px', background: 'rgba(30, 41, 59, 0.8)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.1)', cursor: 'pointer' },
    uploadBtn: { padding: '12px 25px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' },
    card: { background: 'rgba(30, 41, 59, 0.5)', padding: '25px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', backdropFilter: 'blur(10px)' },
    cardTitle: { fontSize: '1.2rem', marginBottom: '5px' },
    cardSubText: { fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px' },
    actionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' },
    likeBtn: { padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', transition: 'all 0.2s ease' },
    linkGroup: { display: 'flex', gap: '12px' },
    subLink: { color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem' },
    dlBtn: { background: 'none', border: 'none', color: '#8b5cf6', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }
};

export default NotesVault;