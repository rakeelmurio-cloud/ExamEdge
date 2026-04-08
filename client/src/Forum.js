import React, { useState, useEffect } from 'react';
import axios from 'axios';

const moduleData = {
    "Year 1": ["Introduction to Programming", "Mathematics for Computing", "Database Management"],
    "Year 2": ["Object Oriented Programming", "Software Engineering", "Computer Networks"],
    "Year 3": ["IT Project Management", "Cyber Security", "Data Science"],
    "Year 4": ["Distributed Systems", "Machine Learning", "Professional Practice"]
};

const Forum = () => {
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
        } catch (err) { console.error(err); }
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
            alert("Topic created in the vault!");
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

    return (
        <div style={S.page}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .post-hover:hover { border-color: rgba(139, 92, 246, 0.3) !important; background: rgba(30, 41, 59, 0.5) !important; }
                input:focus, textarea:focus, select:focus { border-color: #a78bfa !important; outline: none; background: rgba(15, 23, 42, 0.8) !important; }
            `}</style>

            <div style={S.container}>
                <h1 style={S.h1}>Knowledge <span style={S.grad}>Forum.</span></h1>
                
                {/* --- ASK A QUESTION --- */}
                <form onSubmit={handleSubmit} style={S.glassCard}>
                    <h3 style={S.cardLabel}>Start a Discussion</h3>
                    <div style={S.row}>
                        <select style={S.select} value={newPost.year} onChange={handleYearChange}>
                            {Object.keys(moduleData).map(y => <option key={y} value={y} style={S.opt}>{y}</option>)}
                        </select>
                        <select style={S.select} value={newPost.module} onChange={(e) => setNewPost({...newPost, module: e.target.value})}>
                            {moduleData[newPost.year].map(m => <option key={m} value={m} style={S.opt}>{m}</option>)}
                        </select>
                    </div>
                    <input style={S.input} placeholder="What is your question?" value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} required />
                    <textarea style={S.textarea} placeholder="Provide more context for your peers..." value={newPost.content} onChange={(e) => setNewPost({...newPost, content: e.target.value})} required />
                    <button type="submit" style={S.primaryBtn}>Post to Community</button>
                </form>

                {/* --- FILTER BAR --- */}
                <div style={S.filterBar}>
                    <span style={S.filterLabel}>Feed Filter:</span>
                    <select style={S.miniSelect} onChange={(e) => {setFilterYear(e.target.value); setFilterModule('All');}}>
                        <option value="All">All Years</option>
                        {Object.keys(moduleData).map(y => <option key={y} value={y} style={S.opt}>{y}</option>)}
                    </select>
                    <select style={S.miniSelect} value={filterModule} onChange={(e) => setFilterModule(e.target.value)}>
                        <option value="All">All Modules</option>
                        {filterYear !== 'All' && moduleData[filterYear].map(m => <option key={m} value={m} style={S.opt}>{m}</option>)}
                    </select>
                </div>

                {/* --- DISCUSSION FEED --- */}
                <div style={S.feed}>
                    {filteredPosts.length > 0 ? filteredPosts.map(post => {
                        const isOwner = post.author === loggedInUser;
                        return (
                            <div key={post._id} style={S.postCard} className="post-hover">
                                <div style={S.postHeader}>
                                    <div style={S.meta}>{post.year} • {post.module}</div>
                                    <div style={S.authorTag}>By {post.author.split('@')[0]}</div>
                                </div>
                                
                                <h3 style={S.postTitle}>{post.title}</h3>
                                <p style={S.postContent}>{post.content}</p>

                                <div style={S.replySection}>
                                    {post.replies?.map((r, i) => (
                                        <div key={i} style={S.replyItem}>
                                            <strong style={S.replyUser}>{r.user.split('@')[0]}</strong>
                                            <span style={S.replyText}>{r.text}</span>
                                        </div>
                                    ))}
                                </div>

                                {!isOwner && (
                                    <div style={S.interaction}>
                                        <input 
                                            style={S.replyInput} 
                                            placeholder="Write a helpful response..." 
                                            value={replyText[post._id] || ''}
                                            onChange={(e) => setReplyText({...replyText, [post._id]: e.target.value})}
                                        />
                                        <button style={S.replyBtn} onClick={() => handleReply(post._id)}>Reply</button>
                                    </div>
                                )}
                            </div>
                        );
                    }) : <p style={S.empty}>The forum is quiet. Be the first to ask a question!</p>}
                </div>
            </div>
        </div>
    );
};

const S = {
    page: { minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, #161033 0%, #06060c 100%)', color: '#fff', fontFamily: "'Sora', sans-serif", padding: '80px 20px' },
    container: { maxWidth: 850, margin: '0 auto' },
    h1: { textAlign: 'center', fontSize: '3rem', fontWeight: 800, marginBottom: 50 },
    grad: { background: 'linear-gradient(135deg, #a78bfa, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    
    glassCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '32px', padding: '35px', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.6s ease' },
    cardLabel: { fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' },
    row: { display: 'flex', gap: '15px' },
    select: { flex: 1, background: 'rgba(15,23,42,0.6)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', padding: '14px', borderRadius: '16px', cursor: 'pointer' },
    opt: { background: '#0f0a28', color: '#fff' },
    input: { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '16px', borderRadius: '16px', fontSize: '0.95rem' },
    textarea: { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '16px', borderRadius: '16px', fontSize: '0.95rem', height: 100, resize: 'none' },
    primaryBtn: { background: 'linear-gradient(135deg, #7c3aed, #db2777)', color: '#fff', padding: '16px', border: 'none', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(124, 58, 237, 0.4)' },

    filterBar: { display: 'flex', gap: '15px', margin: '50px 0 30px', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.7s ease' },
    filterLabel: { color: '#64748b', fontSize: '0.85rem', fontWeight: 600 },
    miniSelect: { background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 18px', borderRadius: '14px', fontSize: '0.85rem', cursor: 'pointer' },

    feed: { display: 'flex', flexDirection: 'column', gap: '25px' },
    postCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', borderRadius: '28px', transition: '0.3s ease', animation: 'fadeIn 0.8s ease' },
    postHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 15 },
    meta: { fontSize: '0.7rem', color: '#a78bfa', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' },
    authorTag: { fontSize: '0.75rem', color: '#64748b', fontWeight: 600 },
    postTitle: { fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: 12 },
    postContent: { color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6, marginBottom: 25 },

    replySection: { background: 'rgba(15, 23, 42, 0.3)', borderRadius: '18px', padding: '10px' },
    replyItem: { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: '10px', alignItems: 'baseline' },
    replyUser: { color: '#ec4899', fontSize: '0.85rem', minWidth: '70px' },
    replyText: { color: '#e2e8f0', fontSize: '0.9rem' },

    interaction: { display: 'flex', gap: '12px', marginTop: '20px' },
    replyInput: { flex: 1, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '12px 18px', borderRadius: '14px', fontSize: '0.9rem' },
    replyBtn: { background: '#8b5cf6', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: 700, cursor: 'pointer' },
    empty: { textAlign: 'center', color: '#64748b', marginTop: 40 }
};

export default Forum;