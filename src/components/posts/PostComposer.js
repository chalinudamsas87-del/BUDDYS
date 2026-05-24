import React, { useState, useRef } from 'react';
import { Image, Video, FileText, X, Send, Smile } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import './PostComposer.css';

const CLOUDINARY_CLOUD_NAME = 'g2jdlit4';
const CLOUDINARY_UPLOAD_PRESET = 'Buddys';

export default function PostComposer({ onPost }) {
  const { currentUser, userProfile } = useAuth();
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();
  const videoRef = useRef();

  function addFiles(e) {
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected]);
    const newPreviews = selected.map(f => ({ url: URL.createObjectURL(f), type: f.type.startsWith('video') ? 'video' : 'image', name: f.name }));
    setPreviews(prev => [...prev, ...newPreviews]);
  }

  function removeFile(i) {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  }

  async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
      { method: 'POST', body: formData }
    );
    const data = await res.json();
    return data.secure_url;
  }

  async function handlePost() {
    if (!text.trim() && files.length === 0) return;
    setLoading(true);
    try {
      const mediaItems = [];
      for (const file of files) {
        const url = await uploadToCloudinary(file);
        mediaItems.push({ url, type: file.type.startsWith('video') ? 'video' : 'image' });
      }
      await addDoc(collection(db, 'posts'), {
        uid: currentUser.uid,
        displayName: userProfile.displayName,
        photoURL: userProfile.photoURL || '',
        username: userProfile.username,
        text: text.trim(),
        media: mediaItems,
        likes: [],
        comments: 0,
        shares: 0,
        createdAt: serverTimestamp()
      });
      toast.success('Post shared!');
      setText('');
      setFiles([]);
      setPreviews([]);
      if (onPost) onPost();
    } catch (e) {
      toast.error('Post failed');
    }
    setLoading(false);
  }

  const initials = userProfile?.displayName?.slice(0, 2).toUpperCase() || 'ME';

  return (
    <div className="post-composer card">
      <div className="composer-top">
        {userProfile?.photoURL
          ? <img src={userProfile.photoURL} alt="" className="avatar" style={{ width: 42, height: 42 }} />
          : <div className="avatar-placeholder" style={{ width: 42, height: 42, fontSize: 14 }}>{initials}</div>
        }
        <div className="composer-input-wrap">
          <textarea
            className="input-field composer-textarea"
            placeholder={`What's on your mind, ${userProfile?.displayName?.split(' ')[0] || 'friend'}?`}
            value={text}
            onChange={e => setText(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      {previews.length > 0 && (
        <div className="composer-previews">
          {previews.map((p, i) => (
            <div key={i} className="preview-item">
              {p.type === 'video'
                ? <video src={p.url} className="preview-media" muted />
                : <img src={p.url} alt="" className="preview-media" />
              }
              <button className="preview-remove" onClick={() => removeFile(i)}><X size={12} /></button>
            </div>
          ))}
        </div>
      )}

      <div className="composer-footer">
        <div className="composer-actions">
          <button className="composer-btn" onClick={() => fileRef.current.click()} title="Photo">
            <Image size={18} /><span>Photo</span>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={addFiles} />
          </button>
          <button className="composer-btn" onClick={() => videoRef.current.click()} title="Video">
            <Video size={18} /><span>Video</span>
            <input ref={videoRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={addFiles} />
          </button>
          <button className="composer-btn" title="Text">
            <FileText size={18} /><span>Post</span>
          </button>
          <button className="composer-btn" title="Emoji">
            <Smile size={18} />
          </button>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={handlePost}
          disabled={loading || (!text.trim() && files.length === 0)}
        >
          {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <><Send size={14} /> Share</>}
        </button>
      </div>
    </div>
  );
}
