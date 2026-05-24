import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield, Users, FileText, Trash2, Ban, CheckCircle,
  TrendingUp, Activity, Settings, Eye, EyeOff, BarChart2
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminPage.css';

export default function AdminPage() {
  const { isAdmin, currentUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ users: 0, posts: 0, reports: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    loadData();
  }, [isAdmin]);

  async function loadData() {
    setLoading(true);
    try {
      const [usersSnap, postsSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50)))
      ]);
      const usersData = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const postsData = postsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(usersData);
      setPosts(postsData);
      setStats({ users: usersData.length, posts: postsData.length, reports: 0 });
    } catch (e) { toast.error('Failed to load data'); }
    setLoading(false);
  }

  async function banUser(uid, isBanned) {
    await updateDoc(doc(db, 'users', uid), { isBanned: !isBanned });
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isBanned: !isBanned } : u));
    toast.success(isBanned ? 'User unbanned' : 'User banned');
  }

  async function verifyUser(uid, isVerified) {
    await updateDoc(doc(db, 'users', uid), { isVerified: !isVerified });
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isVerified: !isVerified } : u));
    toast.success(isVerified ? 'Verification removed' : 'User verified');
  }

  async function deletePost(id) {
    if (!window.confirm('Delete this post?')) return;
    await deleteDoc(doc(db, 'posts', id));
    setPosts(prev => prev.filter(p => p.id !== id));
    toast.success('Post deleted');
  }

  async function deleteUser(uid) {
    if (!window.confirm('Delete this user and all their data? This cannot be undone.')) return;
    await deleteDoc(doc(db, 'users', uid));
    setUsers(prev => prev.filter(u => u.uid !== uid));
    toast.success('User deleted');
  }

  if (!isAdmin) return null;

  const tabs = [
    { id: 'overview', icon: BarChart2, label: 'Overview' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'posts', icon: FileText, label: 'Posts' },
  ];

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="flex items-center gap-3">
          <div className="admin-badge-icon"><Shield size={22} /></div>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 22 }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Full control — visible only to you</p>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`admin-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : (
        <>
          {tab === 'overview' && (
            <div className="admin-overview">
              <div className="stats-grid">
                <div className="stat-card card">
                  <div className="stat-card-icon users-icon"><Users size={24} /></div>
                  <div className="stat-card-num">{stats.users}</div>
                  <div className="stat-card-label">Total Users</div>
                </div>
                <div className="stat-card card">
                  <div className="stat-card-icon posts-icon"><FileText size={24} /></div>
                  <div className="stat-card-num">{stats.posts}</div>
                  <div className="stat-card-label">Total Posts</div>
                </div>
                <div className="stat-card card">
                  <div className="stat-card-icon active-icon"><Activity size={24} /></div>
                  <div className="stat-card-num">{users.filter(u => !u.isBanned).length}</div>
                  <div className="stat-card-label">Active Users</div>
                </div>
                <div className="stat-card card">
                  <div className="stat-card-icon banned-icon"><Ban size={24} /></div>
                  <div className="stat-card-num">{users.filter(u => u.isBanned).length}</div>
                  <div className="stat-card-label">Banned Users</div>
                </div>
              </div>
              <div className="card" style={{ padding: 24, marginTop: 20 }}>
                <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: 16 }}>Recent Activity</h3>
                {posts.slice(0, 5).map(p => (
                  <div key={p.id} className="activity-item">
                    <div className="avatar-placeholder" style={{ width: 32, height: 32, fontSize: 11, flexShrink: 0 }}>{p.displayName?.slice(0, 2).toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{p.displayName}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}> posted</span>
                      {p.text && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.text}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="admin-table-wrap card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.uid} className={user.isBanned ? 'banned-row' : ''}>
                      <td>
                        <div className="flex items-center gap-2">
                          {user.photoURL
                            ? <img src={user.photoURL} alt="" className="avatar" style={{ width: 32, height: 32 }} />
                            : <div className="avatar-placeholder" style={{ width: 32, height: 32, fontSize: 11 }}>{user.displayName?.slice(0, 2).toUpperCase()}</div>
                          }
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>
                              {user.displayName}
                              {user.isVerified && <CheckCircle size={12} color="var(--accent)" style={{ marginLeft: 4, verticalAlign: 'middle' }} />}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user.email}</td>
                      <td>
                        {user.isBanned
                          ? <span className="badge badge-danger">Banned</span>
                          : user.isAdmin
                          ? <span className="badge badge-warning">Admin</span>
                          : <span className="badge badge-success">Active</span>
                        }
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className={`btn btn-sm ${user.isVerified ? 'btn-secondary' : 'btn-outline'}`}
                            onClick={() => verifyUser(user.uid, user.isVerified)}
                            title={user.isVerified ? 'Remove verification' : 'Verify user'}
                          >
                            <CheckCircle size={13} />
                          </button>
                          <button
                            className={`btn btn-sm ${user.isBanned ? 'btn-secondary' : 'btn-danger'}`}
                            onClick={() => banUser(user.uid, user.isBanned)}
                            disabled={user.isAdmin}
                          >
                            <Ban size={13} /> {user.isBanned ? 'Unban' : 'Ban'}
                          </button>
                          {!user.isAdmin && (
                            <button className="btn btn-sm btn-danger" onClick={() => deleteUser(user.uid)}>
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'posts' && (
            <div className="admin-table-wrap card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Author</th>
                    <th>Content</th>
                    <th>Likes</th>
                    <th>Media</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post.id}>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{post.displayName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{post.username}</div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.text || <em style={{ color: 'var(--text-muted)' }}>No text</em>}
                      </td>
                      <td style={{ fontSize: 13 }}>{post.likes?.length || 0}</td>
                      <td>
                        {post.media?.length > 0
                          ? <span className="badge badge-accent">{post.media.length} file(s)</span>
                          : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>None</span>
                        }
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-danger" onClick={() => deletePost(post.id)}>
                          <Trash2 size={13} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
