import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { db } from '../firebase';
import PostComposer from '../components/posts/PostComposer';
import PostCard from '../components/posts/PostCard';
import Stories from '../components/stories/Stories';
import { Flame, Users, Sparkles } from 'lucide-react';
import './HomePage.css';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  const fetchPosts = useCallback(async (afterDoc = null) => {
    setLoading(true);
    try {
      let q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
      if (afterDoc) q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), startAfter(afterDoc), limit(PAGE_SIZE));
      const snap = await getDocs(q);
      const newPosts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (afterDoc) setPosts(prev => [...prev, ...newPosts]);
      else setPosts(newPosts);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  function handleDelete(id) { setPosts(prev => prev.filter(p => p.id !== id)); }

  return (
    <div className="feed-area">
      <div className="feed-center">
        <div className="stories-card card" style={{ marginBottom: 16 }}>
          <Stories />
        </div>
        <PostComposer onPost={() => fetchPosts()} />
        {loading && posts.length === 0 ? (
          <div className="loading-overlay">
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-feed card">
            <Sparkles size={40} color="var(--accent)" />
            <h3>Your feed is empty</h3>
            <p>Start following people or create your first post!</p>
          </div>
        ) : (
          <>
            {posts.map(post => <PostCard key={post.id} post={post} onDelete={handleDelete} />)}
            {hasMore && (
              <button className="btn btn-secondary w-full" onClick={() => fetchPosts(lastDoc)} disabled={loading}>
                {loading ? <span className="spinner" /> : 'Load more'}
              </button>
            )}
          </>
        )}
      </div>
      <aside className="feed-right">
        <div className="card right-widget">
          <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
            <Flame size={18} color="var(--amber)" />
            <h4 style={{ fontFamily: 'Space Grotesk', fontSize: 15 }}>Trending</h4>
          </div>
          {['#MeetlyLaunch', '#Photography', '#TechNews', '#TravelVibes', '#MusicMonday'].map(tag => (
            <div key={tag} className="trending-item">
              <span className="trending-tag">{tag}</span>
              <span className="trending-count">{Math.floor(Math.random() * 5000 + 500)} posts</span>
            </div>
          ))}
        </div>
        <div className="card right-widget" style={{ marginTop: 16 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
            <Users size={18} color="var(--teal)" />
            <h4 style={{ fontFamily: 'Space Grotesk', fontSize: 15 }}>Suggested Friends</h4>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
            Sign in to see friend suggestions
          </p>
        </div>
      </aside>
    </div>
  );
}
