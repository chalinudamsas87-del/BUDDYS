import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home, Bell, ShoppingBag, HelpCircle, Play, BookOpen,
  Settings, LogOut, User, Shield, Menu, X, ChevronRight,
  Zap
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/', icon: Home, label: 'Home', exact: true },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
  { to: '/quizzes', icon: HelpCircle, label: 'Quizzes' },
  { to: '/watch', icon: Play, label: 'Watch' },
  { to: '/memories', icon: BookOpen, label: 'Memories' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const initials = userProfile?.displayName?.slice(0, 2).toUpperCase() || 'ME';

  const SidebarContent = () => (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon"><Zap size={20} /></div>
        <span className="logo-text">Meetly</span>
      </div>

      <div className="sidebar-profile" onClick={() => { navigate('/profile/' + currentUser?.uid); setMobileOpen(false); }}>
        <div className="profile-avatar-wrap">
          {userProfile?.photoURL
            ? <img src={userProfile.photoURL} alt="" className="avatar" style={{ width: 44, height: 44 }} />
            : <div className="avatar-placeholder" style={{ width: 44, height: 44, fontSize: 15 }}>{initials}</div>
          }
          <span className="online-dot" />
        </div>
        <div className="profile-info">
          <span className="profile-name">{userProfile?.displayName || 'User'}</span>
          <span className="profile-handle">@{userProfile?.username || 'user'}</span>
        </div>
        <ChevronRight size={16} className="profile-arrow" />
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={20} />
            <span>{label}</span>
            {label === 'Notifications' && <span className="nav-badge">3</span>}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => `nav-item admin-item${isActive ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>
            <Shield size={20} />
            <span>Admin Dashboard</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={() => { navigate('/profile/' + currentUser?.uid); setMobileOpen(false); }}>
          <User size={20} />
          <span>My Profile</span>
        </button>
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
        <Menu size={22} />
      </button>

      {/* Desktop sidebar */}
      <div className="sidebar-desktop"><SidebarContent /></div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)}>
          <div className="sidebar-mobile" onClick={e => e.stopPropagation()}>
            <button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={22} /></button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
