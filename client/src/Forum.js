import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Forum = () => {
  // 1. SLIIT Module Data Mapping
  const moduleData = {
    "Year 1": ["Introduction to Programming", "Mathematics for Computing", "Database Management"],
    "Year 2": ["Object Oriented Programming", "Software Engineering", "Computer Networks"],
    "Year 3": ["IT Project Management", "Cyber Security", "Data Science"],
    "Year 4": ["Distributed Systems", "Machine Learning", "Professional Practice"]
  };

  // 2. State Management
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

  // 3. Get Logged-in User Info
  const loggedInUser = JSON.parse(localStorage.getItem('user'))?.email || "Guest Student";

  // 4. Fetch Posts from MongoDB
  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/forum/posts');
      setPosts(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  // 5. Filtering Logic
  const filteredPosts = posts.filter(post => {
    const yearMatch = filterYear === 'All' || post.year === filterYear;
    const moduleMatch = filterModule === 'All' || post.module === filterModule;
    return yearMatch && moduleMatch;
  });

  // 6. Action Handlers
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
    <div style={styles.container}>
      <h1 style={styles.header}>Exam<span style={{color: 'var(--primary)'}}>Edge</span> Forum</h1>
      
      {/* --- ASK A QUESTION --- */}
      <form onSubmit={handleSubmit} style={styles.card}>
        <h3 style={{color: 'white', marginBottom: '5px'}}>Start a Discussion</h3>
        <div style={styles.row}>
          <select style={styles.select} value={newPost.year} onChange={handleYearChange}>
            {Object.keys(moduleData).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select style={styles.select} value={newPost.module} onChange={(e) => setNewPost({...newPost, module: e.target.value})}>
            {moduleData[newPost.year].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <input style={styles.input} placeholder="Topic Title" value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} required />
        <textarea style={{...styles.input, height: '70px'}} placeholder="What's your doubt?" value={newPost.content} onChange={(e) => setNewPost({...newPost, content: e.target.value})} required />
        <button type="submit" style={styles.btn}>Post Question</button>
      </form>

      {/* --- FILTER BAR --- */}
      <div style={styles.filterBar}>
        <span style={{color: '#888', fontSize: '0.9rem'}}>Filter Feed:</span>
        <select style={styles.miniSelect} onChange={(e) => {setFilterYear(e.target.value); setFilterModule('All');}}>
          <option value="All">All Years</option>
          {Object.keys(moduleData).map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select style={styles.miniSelect} value={filterModule} onChange={(e) => setFilterModule(e.target.value)}>
          <option value="All">All Modules</option>
          {filterYear !== 'All' && moduleData[filterYear].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* --- DISCUSSION FEED --- */}
      <div>
        {filteredPosts.length > 0 ? filteredPosts.map(post => {
          const isPostOwner = post.author === loggedInUser;
          
          return (
            <div key={post._id} style={styles.postCard}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={styles.postMeta}>{post.year} • {post.module} • By {post.author.split('@')[0]}</div>
                {isPostOwner && (
                  <button onClick={() => handleDeletePost(post._id)} style={styles.deleteBtn}>Delete</button>
                )}
              </div>
              
              <h3 style={{color: 'var(--primary)', margin: '8px 0'}}>{post.title}</h3>
              <p style={{color: 'white', marginBottom: '15px', fontSize: '0.95rem'}}>{post.content}</p>

              {/* Replies Section */}
              <div style={styles.replySection}>
                {post.replies?.map((r, i) => (
                  <div key={i} style={styles.replyItem}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span><strong style={{color: 'var(--primary)'}}>{r.user.split('@')[0]}:</strong> {r.text}</span>
                      {r.user === loggedInUser && (
                        <button onClick={() => handleEditReply(post._id, i, r.text)} style={styles.editBtn}>Edit</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Interaction Area */}
              {!isPostOwner ? (
                <div style={{display: 'flex', gap: '8px', marginTop: '12px'}}>
                  <input 
                    style={styles.replyInput} 
                    placeholder="Suggest an answer..." 
                    value={replyText[post._id] || ''}
                    onChange={(e) => setReplyText({...replyText, [post._id]: e.target.value})}
                  />
                  <button style={styles.replyBtn} onClick={() => handleReply(post._id)}>Reply</button>
                </div>
              ) : (
                <p style={{fontSize: '0.75rem', color: '#555', marginTop: '10px', fontStyle: 'italic'}}>
                  You cannot reply to your own post.
                </p>
              )}
            </div>
          );
        }) : <p style={{textAlign: 'center', color: '#666'}}>No questions found.</p>}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '40px 20px', maxWidth: '800px', margin: '0 auto' },
  header: { textAlign: 'center', fontSize: '2.5rem', marginBottom: '30px', color: 'white', fontWeight: '800' },
  card: { background: 'var(--bg-surface)', padding: '25px', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' },
  row: { display: 'flex', gap: '10px' },
  select: { flex: 1, background: 'var(--bg-deep)', color: 'white', border: '1px solid var(--border)', padding: '10px', borderRadius: '10px' },
  input: { background: 'var(--bg-deep)', color: 'white', border: '1px solid var(--border)', padding: '12px', borderRadius: '10px', outline: 'none' },
  btn: { background: 'var(--primary)', color: 'white', padding: '12px', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  filterBar: { display: 'flex', gap: '10px', margin: '30px 0 15px', alignItems: 'center', justifyContent: 'center' },
  miniSelect: {
  width: '120px',   // control how long it is
  background: 'var(--bg-deep)',
  color: 'white',
  border: '1px solid var(--border)',
  padding: '5px 8px',
  borderRadius: '6px'
  },
  postCard: { background: 'var(--bg-surface)', padding: '20px', borderRadius: '18px', border: '1px solid var(--border)', marginBottom: '20px' },
  postMeta: { fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase' },
  deleteBtn: { background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' },
  editBtn: { background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.7rem' },
  replySection: { borderTop: '1px solid #333', paddingTop: '10px', marginTop: '10px' },
  replyItem: { background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#bbb', marginBottom: '6px' },
  replyInput: { flex: 1, background: 'var(--bg-deep)', color: 'white', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' },
  replyBtn: { background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '6px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }
};

export default Forum;