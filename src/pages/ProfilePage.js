import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/posts/PostCard';
import { Camera, Edit2, UserPlus, UserMinus, Grid3x3, List, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './ProfilePage.css';

export default function ProfilePage() {
  const { uid } = useParams();
  const { currentUser, userProfile, fetchUserProfile, isAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editName, setEditName] = useState('');
  const [view, setView] = useState('list');
  const [saving, setSaving] = useState(false);
  const avatarRef = useRef();
  const coverRef = useRef();
  const isOwn = currentUser?.uid === uid;

  useEffect(() => {
    loadProfile();
    loadPosts();
  }, [uid]);

  async function loadProfile() {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) { setProfile(snap.data()); setEditBio(snap.data().bio || ''); setEditName(snap.data().displayName || ''); }
    setLoading(false);
  }

  async function loadPosts() {
    const q = query(collection(db, 'posts'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  async function saveProfile() {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', uid), { displayName: editName, bio: editBio });
      await fetchUserProfile(uid);
      loadProfile();
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    setSaving(false);
  }

  async function uploadAvatar(e) {
    const file = e.target.files[0];
    if (!file) return;
    const storageRef = ref(storage, `avatars/${uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db, 'users', uid), { photoURL: url });
    await fetchUserProfile(uid);
    loadProfile();
    toast.success('Avatar updated!');
  }

  async function uploadCover(e) {
    const file = e.target.files[0];
    if (!file) return;
    const storageRef = ref(storage, `covers/${uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db, 'users', uid), { coverURL: url });
    loadProfile();
    toast.success('Cover updated!');
  }

  if (loading) return <div className="loading-overlay" style={{ marginTop: 100 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;
  if (!profile) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>User not found</div>;

  const initials = profile.displayName?.slice(0, 2).toUpperCase() || '??';

  return (
    <div className="profile-page">
      <div className="profile-cover-wrap">
        {profile.coverURL
          ? <img src={profile.coverURL} alt="" className="profile-cover" />
          : <div className="profile-cover-placeholder" />
        }
        {isOwn && (
          <button className="cover-edit-btn" onClick={() => coverRef.current.click()}>
            <Camera size={16} /> Edit Cover
            <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadCover} />
          </button>
        )}
      </div>

      <div className="profile-main card" style={{ marginTop: -40, position: 'relative', zIndex: 1, marginLeft: 24, marginRight: 24, borderRadius: 'var(--radius-xl)' }}>
        <div className="profile-top">
          <div className="profile-avatar-area">
            <div className="profile-avatar-wrap">
              {profile.photoURL
                ? <img src={profile.photoURL} alt="" className="profile-avatar" />
                : <div className="avatar-placeholder profile-avatar">{initials}</div>
              }
              {isOwn && (
                <button className="avatar-edit-btn" onClick={() => avatarRef.current.click()}>
                  <Camera size={14} />
                  <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadAvatar} />
                </button>
              )}
            </div>
          </div>
          <div className="profile-info">
            {editing ? (
              <div className="profile-edit-form">
                <input className="input-field" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Display name" />
                <textarea className="input-field" value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Bio…" rows={2} />
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={saving}>
                    {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Save'}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="profile-name">{profile.displayName}</h2>
                  {profile.isVerified && <CheckCircle size={18} color="var(--accent)" fill="var(--accent)" />}
                  {isAdmin && profile.isAdmin && <span className="badge badge-warning">Admin</span>}
                </div>
                <p className="profile-handle">@{profile.username}</p>
                {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                <div className="profile-stats">
                  <div className="stat"><span className="stat-n">{posts.length}</span><span className="stat-l">Posts</span></div>
                  <div className="stat"><span className="stat-n">{profile.followers?.length || 0}</span><span className="stat-l">Followers</span></div>
                  <div className="stat"><span className="stat-n">{profile.following?.length || 0}</span><span className="stat-l">Following</span></div>
                </div>
              </>
            )}
          </div>
          <div className="profile-actions">
            {isOwn && !editing && (
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                <Edit2 size={14} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="divider" />

        <div className="profile-posts-header">
          <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 16 }}>Posts</h3>
          <div className="view-toggle">
            <button className={`btn btn-ghost btn-icon${view === 'list' ? ' active-view' : ''}`} onClick={() => setView('list')}><List size={18} /></button>
            <button className={`btn btn-ghost btn-icon${view === 'grid' ? ' active-view' : ''}`} onClick={() => setView('grid')}><Grid3x3 size={18} /></button>
          </div>
        </div>

        {view === 'grid' ? (
          <div className="profile-grid">
            {posts.map(post => (
              post.media?.length > 0 && <div key={post.id} className="profile-grid-item">
                {post.media[0].type === 'video'
                  ? <video src={post.media[0].url} className="profile-grid-media" muted />
                  : <img src={post.media[0].url} alt="" className="profile-grid-media" />
                }
              </div>
            ))}
          </div>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} onDelete={id => setPosts(p => p.filter(x => x.id !== id))} />)
        )}

        {posts.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 14 }}>No posts yet</p>}
      </div>
    </div>
  );
}
