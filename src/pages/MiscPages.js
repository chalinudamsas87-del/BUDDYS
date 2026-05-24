import React from 'react';
import { Bell, ShoppingBag, HelpCircle, Play, BookOpen, Settings } from 'lucide-react';

function PlaceholderPage({ icon: Icon, title, color }) {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-xl)', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: `1px solid ${color}40` }}>
        <Icon size={36} color={color} />
      </div>
      <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 26, marginBottom: 12 }}>{title}</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>This feature is coming soon. Stay tuned!</p>
    </div>
  );
}

export function NotificationsPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 22, marginBottom: 20 }}>Notifications</h2>
      {[1,2,3].map(n => (
        <div key={n} className="card" style={{ marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center', padding: 16 }}>
          <div className="avatar-placeholder" style={{ width: 44, height: 44, fontSize: 15, flexShrink: 0 }}>U{n}</div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500 }}>User{n} liked your post</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>2 hours ago</p>
          </div>
          <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}

export function MarketplacePage() {
  return <PlaceholderPage icon={ShoppingBag} title="Marketplace" color="var(--teal)" />;
}

export function QuizzesPage() {
  return <PlaceholderPage icon={HelpCircle} title="Quizzes" color="var(--pink)" />;
}

export function WatchPage() {
  return <PlaceholderPage icon={Play} title="Watch" color="var(--accent)" />;
}

export function MemoriesPage() {
  return <PlaceholderPage icon={BookOpen} title="Memories" color="var(--amber)" />;
}

export function SettingsPage() {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px' }}>
      <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 22, marginBottom: 24 }}>Settings</h2>
      {[
        { label: 'Privacy', desc: 'Control who can see your profile and posts' },
        { label: 'Notifications', desc: 'Manage email and push notification preferences' },
        { label: 'Account Security', desc: 'Password, two-factor authentication' },
        { label: 'Appearance', desc: 'Theme and display preferences' },
        { label: 'Language & Region', desc: 'Language, timezone settings' },
        { label: 'Connected Apps', desc: 'Third-party app permissions' },
      ].map(s => (
        <div key={s.label} className="card" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', padding: '16px 20px', cursor: 'pointer' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: 15 }}>{s.label}</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{s.desc}</p>
          </div>
          <Settings size={18} color="var(--text-muted)" />
        </div>
      ))}
    </div>
  );
}
