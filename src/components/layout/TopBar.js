import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Zap } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import './TopBar.css';

export default function TopBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (val) => {
    setSearchQuery(val);
    if (!val.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('username', '>=', val.toLowerCase()),
        where('username', '<=', val.toLowerCase() + '\uf8ff'),
        limit(6)
      );
      const snap = await getDocs(q);
      setResults(snap.docs.map(d => d.data()));
    } catch {}
    setSearching(false);
  };

  return (
    <header className="topbar">
      <div className="topbar-logo">
        <Zap size={18} />
        <span>Meetly</span>
      </div>

      <div className="search-wrap">
        <Search size={16} className="search-icon" />
        <input
          className="search-input"
          placeholder="Search people, posts…"
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => { setSearchQuery(''); setResults([]); }}>
            <X size={14} />
          </button>
        )}
        {(results.length > 0 || searching) && (
          <div className="search-dropdown">
            {searching && <div className="search-loading">Searching…</div>}
            {results.map(user => (
              <div
                key={user.uid}
                className="search-result"
                onClick={() => { navigate('/profile/' + user.uid); setSearchQuery(''); setResults([]); }}
              >
                {user.photoURL
                  ? <img src={user.photoURL} alt="" className="avatar" style={{ width: 34, height: 34 }} />
                  : <div className="avatar-placeholder" style={{ width: 34, height: 34, fontSize: 12 }}>{user.displayName?.slice(0, 2).toUpperCase()}</div>
                }
                <div>
                  <div className="result-name">{user.displayName}</div>
                  <div className="result-handle">@{user.username}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
