import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2, Flag } from 'lucide-react';
import { doc, updateDoc, arrayUnion, arrayRemove, deleteDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import './PostCard.css';

export default function PostCard({ post, onDelete }) {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.likes?.includes(currentUser?.uid));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const canDelete = currentUser?.uid === post.uid || isAdmin;

  async function toggleLike() {
    const postRef = doc(db, 'posts', post.id);
    if (liked) {
      await updateDoc(postRef, { likes: arrayRemove(currentUser.uid) });
      setLikeCount(c => c - 1);
    } else {
      await updateDoc(postRef, { likes: arrayUnion(currentUser.uid) });
      setLikeCount(c => c + 1);
    }
    setLiked(l => !l);
  }

  async function deletePost() {
    if (!window.confirm('Delete this post?')) return;
    await deleteDoc(doc(db, 'posts', post.id));
    toast.success('Post deleted');
    if (onDelete) onDelete(post.id);
    setShowMenu(false);
  }

  async function submitComment() {
    if (!commentText.trim()) return;
    await addDoc(collection(db, 'posts', post.id, 'comments'), {
      uid: currentUser.uid,
      text: commentText.trim(),
      displayName: currentUser.displayName,
      createdAt: serverTimestamp()
    });
    setCommentText('');
    loadComments();
  }

  async function loadComments() {
    setLoadingComments(true);
    const { getDocs, query, collection: col, orderBy } = await import('firebase/firestore');
    const snap = await getDocs(query(col(db, 'posts', post.id, 'comments'), orderBy('createdAt', 'asc')));
    setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoadingComments(false);
  }

  function toggleComments() {
    if (!showComments) loadComments();
    setShowComments(v => !v);
  }

  const timeAgo = post.createdAt?.toDate
    ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })
    : 'just now';

  const initials = post.displayName?.slice(0, 2).toUpperCase() || '??';

  return (
    <div className="post-card card">
      {/* Header */}
      <div className="post-header">
        <div className="post-author" onClick={() => navigate('/profile/' + post.uid)}>
          {post.photoURL
            ? <img src={post.photoURL} alt="" className="avatar" style={{ width: 44, height: 44 }} />
            : <div className="avatar-placeholder" style={{ width: 44, height: 44, fontSize: 15 }}>{initials}</div>
          }
          <div>
            <div className="post-author-name">{post.displayName}</div>
            <div className="post-time">@{post.username} · {timeAgo}</div>
          </div>
        </div>
        <div className="post-menu-wrap">
          {canDelete && (
            <button className="btn btn-ghost btn-icon" onClick={() => setShowMenu(v => !v)}>
              <MoreHorizontal size={18} />
            </button>
          )}
          {showMenu && (
            <div className="post-dropdown">
              {canDelete && (
                <button className="post-menu-item danger" onClick={deletePost}>
                  <Trash2 size={15} /> Delete post
                </button>
              )}
              <button className="post-menu-item" onClick={() => setShowMenu(false)}>
                <Flag size={15} /> Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Text */}
      {post.text && <p className="post-text">{post.text}</p>}

      {/* Media */}
      {post.media?.length > 0 && (
        <div className={`post-media-grid cols-${Math.min(post.media.length, 3)}`}>
          {post.media.map((m, i) => (
            <div key={i} className="post-media-item" onClick={() => m.type === 'image' && setLightboxIdx(i)}>
              {m.type === 'video'
                ? <video src={m.url} controls className="post-media-content" />
                : <img src={m.url} alt="" className="post-media-content" />
              }
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="post-actions">
        <button className={`action-btn${liked ? ' liked' : ''}`} onClick={toggleLike}>
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          <span>{likeCount > 0 ? likeCount : ''}</span>
        </button>
        <button className="action-btn" onClick={toggleComments}>
          <MessageCircle size={18} />
          <span>{post.comments > 0 ? post.comments : ''}</span>
        </button>
        <button className="action-btn" onClick={() => { navigator.clipboard.writeText(window.location.origin + '/post/' + post.id); toast.success('Link copied!'); }}>
          <Share2 size={18} />
        </button>
        <button className="action-btn" style={{ marginLeft: 'auto' }}>
          <Bookmark size={18} />
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="post-comments">
          <div className="comment-input-row">
            <input
              className="input-field"
              style={{ flex: 1, padding: '8px 12px' }}
              placeholder="Write a comment…"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitComment()}
            />
            <button className="btn btn-primary btn-sm" onClick={submitComment}>Send</button>
          </div>
          {loadingComments ? <div style={{ textAlign: 'center', padding: 12, color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div> : (
            comments.map(c => (
              <div key={c.id} className="comment-item">
                <div className="avatar-placeholder" style={{ width: 32, height: 32, fontSize: 11, flexShrink: 0 }}>{c.displayName?.slice(0, 2).toUpperCase()}</div>
                <div className="comment-bubble">
                  <span className="comment-author">{c.displayName}</span>
                  <p className="comment-text">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div className="modal-overlay" onClick={() => setLightboxIdx(null)}>
          <img src={post.media[lightboxIdx].url} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 'var(--radius-lg)', objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
