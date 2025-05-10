import Link from 'next/link';

export default function Cancel() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Payment Canceled</h1>
      <p>Your payment was canceled. You can try again if you wish.</p>
      <Link href="/test">Take the test again</Link>
    </div>
  );
}
