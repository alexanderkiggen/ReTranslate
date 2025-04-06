// app/layout.js
import '../styles/globals.css';

export const metadata = {
  title: 'ReTranslate',
  description: 'Bulk translation tool',
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>
        <header style={{ padding: '1rem', background: '#f0f0f0' }}>
          <h1>ReTranslate</h1>
        </header>
        <main style={{ padding: '1rem' }}>
          {children}
        </main>
        <footer style={{ padding: '1rem', background: '#f0f0f0' }}>
          <p>&copy; 2023 ReTranslate</p>
        </footer>
      </body>
    </html>
  );
}
