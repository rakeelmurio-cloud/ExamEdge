import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Forum = () => {
  const moduleData = {
    "Year 1": ["Introduction to Programming", "Mathematics for Computing", "Database Management"],
    "Year 2": ["Object Oriented Programming", "Software Engineering", "Computer Networks"],
    "Year 3": ["IT Project Management", "Cyber Security", "Data Science"],
    "Year 4": ["Distributed Systems", "Machine Learning", "Professional Practice"]
  };

  const [posts, setPosts] = useState([]);
  const [filterYear, setFilterYear] = useState('All');
  const [filterModule, setFilterModule] = useState('All');
  const [replyText, setReplyText] = useState({}); 
  const [newPost, setNewPost] = useState({ 
    title: '', 
    content: '', 
    year: 'Year 1', 
    module: moduleData["Year 1"][0] 
  });

  const loggedInUser = JSON.parse(localStorage.getItem('user'))?.email || "Guest Student";

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/forum/posts');
      setPosts(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const filteredPosts = posts.filter(post => {
    const yearMatch = filterYear === 'All' || post.year === filterYear;
    const moduleMatch = filterModule === 'All' || post.module === filterModule;
    return yearMatch && moduleMatch;
  });

  const handleYearChange = (e) => {
    const selectedYear = e.target.value;
    setNewPost({ ...newPost, year: selectedYear, module: moduleData[selectedYear][0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/forum/create', { ...newPost, author: loggedInUser });
      setPosts([res.data, ...posts]);
      setNewPost({ ...newPost, title: '', content: '' });
      alert("Question posted!");
    } catch (err) { alert("Post failed."); }
  };

  const handleReply = async (postId) => {
    if (!replyText[postId]) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/forum/${postId}/reply`, {
        text: replyText[postId],
        user: loggedInUser
      });
      setPosts(posts.map(p => p._id === postId ? res.data : p));
      setReplyText({ ...replyText, [postId]: '' }); 
    } catch (err) { alert("Reply failed."); }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Delete this question?")) {
      try {
        await axios.delete(`http://localhost:5000/api/forum/${postId}`);
        setPosts(posts.filter(p => p._id !== postId));
      } catch (err) { alert("Delete failed"); }
    }
  };

  const handleEditReply = async (postId, index, currentText) => {
    const newText = window.prompt("Edit your reply:", currentText);
    if (newText && newText !== currentText) {
      try {
        const res = await axios.put(`http://localhost:5000/api/forum/${postId}/reply/${index}`, { text: newText });
        setPosts(posts.map(p => p._id === postId ? res.data : p));
      } catch (err) { alert("Edit failed"); }
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <h1 style={styles.header}> <span style={styles.gradientText}>Forum</span></h1>
        
        {/* --- ASK A QUESTION --- */}
        <form onSubmit={handleSubmit} style={styles.glassCard}>
          <h3 style={{color: '#f8fafc', marginBottom: '15px', fontSize: '1.2rem'}}>Start a Discussion</h3>
          <div style={styles.row}>
            <select style={styles.select} value={newPost.year} onChange={handleYearChange}>
              {Object.keys(moduleData).map(y => <option key={y} value={y} style={{color: 'black'}}>{y}</option>)}
            </select>
            <select style={styles.select} value={newPost.module} onChange={(e) => setNewPost({...newPost, module: e.target.value})}>
              {moduleData[newPost.year].map(m => <option key={m} value={m} style={{color: 'black'}}>{m}</option>)}
            </select>
          </div>
          <input style={styles.input} placeholder="Topic Title" value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} required />
          <textarea style={{...styles.input, height: '90px', resize: 'none'}} placeholder="Describe your doubt in detail..." value={newPost.content} onChange={(e) => setNewPost({...newPost, content: e.target.value})} required />
          <button type="submit" style={styles.primaryBtn}>Post Question</button>
        </form>

        {/* --- FILTER BAR --- */}
        <div style={styles.filterBar}>
          <span style={{color: '#94a3b8', fontSize: '0.9rem'}}>Filter Feed:</span>
          <select style={styles.miniSelect} onChange={(e) => {setFilterYear(e.target.value); setFilterModule('All');}}>
            <option value="All">All Years</option>
            {Object.keys(moduleData).map(y => <option key={y} value={y} style={{color: 'black'}}>{y}</option>)}
          </select>
          <select style={styles.miniSelect} value={filterModule} onChange={(e) => setFilterModule(e.target.value)}>
            <option value="All">All Modules</option>
            {filterYear !== 'All' && moduleData[filterYear].map(m => <option key={m} value={m} style={{color: 'black'}}>{m}</option>)}
          </select>
        </div>

        {/* --- DISCUSSION FEED --- */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          {filteredPosts.length > 0 ? filteredPosts.map(post => {
            const isPostOwner = post.author === loggedInUser;
            
            return (
              <div key={post._id} style={styles.postCard}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div style={styles.postMeta}>{post.year} • {post.module} • By {post.author.split('@')[0]}</div>
                  {isPostOwner && (
                    <button onClick={() => handleDeletePost(post._id)} style={styles.deleteBtn}>Delete</button>
                  )}
                </div>
                
                <h3 style={{color: '#8b5cf6', margin: '12px 0', fontSize: '1.3rem'}}>{post.title}</h3>
                <p style={{color: '#cbd5e1', marginBottom: '20px', fontSize: '1rem', lineHeight: '1.5'}}>{post.content}</p>

                {/* Replies Section */}
                <div style={styles.replySection}>
                  {post.replies?.map((r, i) => (
                    <div key={i} style={styles.replyItem}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span><strong style={{color: '#a78bfa'}}>{r.user.split('@')[0]}:</strong> <span style={{color: '#e2e8f0'}}>{r.text}</span></span>
                        {r.user === loggedInUser && (
                          <button onClick={() => handleEditReply(post._id, i, r.text)} style={styles.editBtn}>Edit</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Interaction Area */}
                {!isPostOwner ? (
                  <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                    <input 
                      style={styles.replyInput} 
                      placeholder="Suggest an answer..." 
                      value={replyText[post._id] || ''}
                      onChange={(e) => setReplyText({...replyText, [post._id]: e.target.value})}
                    />
                    <button style={styles.replyBtn} onClick={() => handleReply(post._id)}>Reply</button>
                  </div>
                ) : (
                  <p style={{fontSize: '0.8rem', color: '#64748b', marginTop: '15px', fontStyle: 'italic', textAlign: 'center'}}>
                    You are the author of this post.
                  </p>
                )}
              </div>
            );
          }) : <p style={{textAlign: 'center', color: '#94a3b8', marginTop: '40px'}}>No questions found in this category.</p>}
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 100%)',
    paddingBottom: '60px'
  },
  container: { padding: '60px 20px', maxWidth: '850px', margin: '0 auto' },
  header: { textAlign: 'center', fontSize: '3rem', marginBottom: '40px', color: 'white', fontWeight: '800', letterSpacing: '-1px' },
  gradientText: {
    background: 'linear-gradient(to right, #8b5cf6, #d946ef)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  glassCard: { 
    background: 'rgba(30, 41, 59, 0.5)', 
    padding: '30px', 
    borderRadius: '24px', 
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    backdropFilter: 'blur(12px)',
    display: 'flex', 
    flexDirection: 'column', 
    gap: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },
  row: { display: 'flex', gap: '15px' },
  select: { 
    flex: 1, 
    background: 'rgba(15, 23, 42, 0.8)', // Matching your input field transparency
    color: '#cbd5e1', 
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    padding: '12px', 
    borderRadius: '12px',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none', // Removes default OS styling in some browsers
    // This ensures that when the list opens, the options have the dark background
    backgroundColor: '#1e293b', 
  },
  option: {
    background: '#1e293b',
    color: 'white'
  },
  input: { 
    background: 'rgba(15, 23, 42, 0.6)', 
    color: 'white', 
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    padding: '14px', 
    borderRadius: '12px', 
    outline: 'none',
    fontSize: '1rem'
  },
  primaryBtn: { 
    background: '#8b5cf6', 
    color: 'white', 
    padding: '14px', 
    border: 'none', 
    borderRadius: '12px', 
    fontWeight: '700', 
    cursor: 'pointer',
    transition: '0.3s ease',
    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
  },
  filterBar: { display: 'flex', gap: '15px', margin: '40px 0 25px', alignItems: 'center', justifyContent: 'center' },
  miniSelect: {
    background: 'rgba(30, 41, 59, 0.8)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '8px 12px',
    borderRadius: '10px',
    outline: 'none',
    cursor: 'pointer'
  },
  postCard: { 
    background: 'rgba(30, 41, 59, 0.4)', 
    padding: '25px', 
    borderRadius: '22px', 
    border: '1px solid rgba(255, 255, 255, 0.05)',
    transition: '0.3s ease',
    backdropFilter: 'blur(8px)'
  },
  postMeta: { fontSize: '0.75rem', color: '#a78bfa', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
  deleteBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', opacity: '0.8' },
  editBtn: { background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' },
  replySection: { borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '15px', marginTop: '15px' },
  replyItem: { background: 'rgba(15, 23, 42, 0.4)', padding: '10px 15px', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '8px' },
  replyInput: { 
    flex: 1, 
    background: 'rgba(15, 23, 42, 0.8)', 
    color: 'white', 
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    padding: '10px 15px', 
    borderRadius: '10px', 
    fontSize: '0.9rem', 
    outline: 'none' 
  },
  replyBtn: { 
    background: 'transparent', 
    color: '#8b5cf6', 
    border: '1px solid #8b5cf6', 
    padding: '8px 20px', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontSize: '0.85rem', 
    fontWeight: 'bold',
    transition: '0.3s'
  }
};

export default Forum;