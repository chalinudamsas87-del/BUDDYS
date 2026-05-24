import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import './Stories.css';

export default function Stories() {
  const { currentUser, userProfile } = useAuth();
  const [stories, setStories] = useState([]);
  const [viewingStory, setViewingStory] = useState(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [storyFile, setStoryFile] = useState(null);
  const [storyPreview, setStoryPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => { fetchStories(); }, []);

  async function fetchStories() {
    const since = Timestamp.fromDate(new Date(Date.now() - 24 * 3600 * 1000));
    const q = query(collection(db, 'stories'), where('createdAt', '>=', since), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const raw = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Group by user
    const map = {};
    raw.forEach(s => {
      if (!map[s.uid]) map[s.uid] = { uid: s.uid, displayName: s.displayName, photoURL: s.photoURL, items: [] };
      map[s.uid].items.push(s);
    });
    setStories(Object.values(map));
  }

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setStoryFile(f);
    setStoryPreview(URL.createObjectURL(f));
  }

  async function uploadStory() {
    if (!storyFile) return;
    setUploading(true);
    try {
      const path = `stories/${currentUser.uid}/${uuidv4()}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, storyFile);
      const url = await getDownloadURL(storageRef);
      const isVideo = storyFile.type.startsWith('video');
      await addDoc(collection(db, 'stories'), {
        uid: currentUser.uid,
        displayName: userProfile.displayName,
        photoURL: userProfile.photoURL || '',
        mediaURL: url,
        mediaType: isVideo ? 'video' : 'image',
        createdAt: Timestamp.now()
      });
      toast.success('Story added!');
      setShowCreate(false);
      setStoryFile(null);
      setStoryPreview(null);
      fetchStories();
    } catch (e) {
      toast.error('Upload failed');
    }
    setUploading(false);
  }

  const currentStories = viewingStory ? stories.find(s => s.uid === viewingStory)?.items || [] : [];

  return (
    <div className="stories-section">
      {/* Add story */}
      <div className="story-item add-story" onClick={() => setShowCreate(true)}>
        <div className="story-avatar-wrap">
          {userProfile?.photoURL
            ? <img src={userProfile.photoURL} alt="" className="story-avatar" />
            : <div className="avatar-placeholder story-avatar">{userProfile?.displayName?.slice(0, 2).toUpperCase() || 'ME'}</div>
          }
          <div className="story-add-btn"><Plus size={14} /></div>
        </div>
        <span className="story-name">Add Story</span>
      </div>

      {/* User stories */}
      {stories.map(group => (
        <div key={group.uid} className="story-item" onClick={() => { setViewingStory(group.uid); setStoryIndex(0); }}>
          <div className="story-avatar-wrap has-story">
            {group.photoURL
              ? <img src={group.photoURL} alt="" className="story-avatar" />
              : <div className="avatar-placeholder story-avatar">{group.displayName?.slice(0, 2).toUpperCase()}</div>
            }
          </div>
          <span className="story-name">{group.displayName?.split(' ')[0]}</span>
        </div>
      ))}

      {/* Story viewer */}
      {viewingStory && currentStories.length > 0 && (
        <div className="story-viewer-overlay" onClick={() => setViewingStory(null)}>
          <div className="story-viewer" onClick={e => e.stopPropagation()}>
            <div className="story-progress-bar">
              {currentStories.map((_, i) => (
                <div key={i} className={`story-progress-seg${i <= storyIndex ? ' done' : ''}`} />
              ))}
            </div>
            <div className="story-header">
              <div className="flex items-center gap-2">
                {currentStories[storyIndex]?.photoURL
                  ? <img src={currentStories[storyIndex].photoURL} alt="" className="avatar" style={{ width: 36, height: 36 }} />
                  : <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: 13 }}>{currentStories[storyIndex]?.displayName?.slice(0, 2).toUpperCase()}</div>
                }
                <span style={{ fontWeight: 600, fontSize: 14 }}>{currentStories[storyIndex]?.displayName}</span>
              </div>
              <button className="btn btn-ghost btn-icon-round" onClick={() => setViewingStory(null)}><X size={18} /></button>
            </div>
            <div className="story-media">
              {currentStories[storyIndex]?.mediaType === 'video'
                ? <video src={currentStories[storyIndex].mediaURL} autoPlay muted loop className="story-media-content" />
                : <img src={currentStories[storyIndex]?.mediaURL} alt="" className="story-media-content" />
              }
            </div>
            {storyIndex > 0 && (
              <button className="story-nav prev" onClick={() => setStoryIndex(i => i - 1)}><ChevronLeft size={24} /></button>
            )}
            {storyIndex < currentStories.length - 1 && (
              <button className="story-nav next" onClick={() => setStoryIndex(i => i + 1)}><ChevronRight size={24} /></button>
            )}
          </div>
        </div>
      )}

      {/* Create story modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-box" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 24 }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 18 }}>Add Story</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowCreate(false)}><X size={18} /></button>
              </div>
              {storyPreview ? (
                <div style={{ position: 'relative', marginBottom: 16 }}>
                  {storyFile?.type.startsWith('video')
                    ? <video src={storyPreview} controls style={{ width: '100%', borderRadius: 'var(--radius-md)', maxHeight: 300, objectFit: 'cover' }} />
                    : <img src={storyPreview} alt="" style={{ width: '100%', borderRadius: 'var(--radius-md)', maxHeight: 300, objectFit: 'cover' }} />
                  }
                  <button className="btn btn-ghost btn-icon" style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)' }} onClick={() => { setStoryFile(null); setStoryPreview(null); }}><X size={16} /></button>
                </div>
              ) : (
                <div className="upload-area" onClick={() => fileRef.current.click()}>
                  <Upload size={32} color="var(--text-muted)" />
                  <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>Click to upload photo or video</p>
                  <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFile} />
                </div>
              )}
              <button className="btn btn-primary w-full" onClick={uploadStory} disabled={!storyFile || uploading}>
                {uploading ? <span className="spinner" /> : 'Share Story'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
