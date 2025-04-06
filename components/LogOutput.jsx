// components/LogOutput.jsx
'use client';

export default function LogOutput({ logMessages }) {
  return (
    <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#f7f7f7', height: '150px', overflowY: 'scroll' }}>
      {logMessages.map((msg, index) => (
        <div key={index}>{msg}</div>
      ))}
    </div>
  );
}
