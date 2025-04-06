// components/ProgressBar.jsx
'use client';

export default function ProgressBar({ progress }) {
  return (
    <div style={{ border: '1px solid #000', width: '100%', marginTop: '1rem' }}>
      <div style={{ width: `${progress}%`, background: '#0070f3', height: '1rem' }}></div>
    </div>
  );
}
