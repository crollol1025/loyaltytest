import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Is Your Partner Loyal to You?</h1>
      <p>Find out by taking our quick and insightful test.</p>
      <Link href="/test">
        <button style={{
          padding: '15px 30px',
          fontSize: '1.2rem',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '20px'
        }}>
          Start the Test
        </button>
      </Link>
      <p style={{ marginTop: '50px', fontSize: '0.9rem', color: '#666' }}>
        Disclaimer: This is not professional relationship advice. This is a general test intended for entertainment purposes only.
      </p>
    </div>
  );
}
