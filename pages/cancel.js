import Link from 'next/link';

export default function Cancel() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px', padding: '0 20px' }}>
      <h1 style={{ color: '#ff4d4d' }}>❌ Payment Canceled</h1>
      <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
        Oops! It seems your payment was canceled. We understand that sometimes things don&rsquo;t go as planned.
      </p>
      <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
        If you&rsquo;d like to try again, you can start over below. 
        Feel free to reach out to us if you have any questions or need assistance.
      </p>

      <div style={{ marginTop: '30px' }}>
        <Link href="/test">
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#ff6666',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            🔄 Try Again
          </button>
        </Link>
      </div>
    </div>
  );
}
