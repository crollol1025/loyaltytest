import Link from 'next/link';
import Stripe from 'stripe';

const getResultMessage = (score) => {
  if (score >= 21) return (
    "🎉 Congratulations! It looks like your partner is highly loyal to you. " +
    "Your relationship demonstrates strong foundations of trust, honesty, and emotional security. " +
    "They are likely transparent with you, respect your boundaries, and prioritize your well-being. " +
    "This level of loyalty often reflects deep mutual respect and love. " +
    "To maintain this healthy dynamic, keep nurturing open communication, show appreciation regularly, and continue fostering intimacy both emotionally and physically. " +
    "Consider exploring new shared experiences together to deepen your bond even further. Remember, even the strongest relationships thrive with continuous effort and kindness."
  );
  else if (score >= 12) return (
    "Your partner shows signs of moderate loyalty. There are many positive aspects to your relationship, " +
    "but also areas that might benefit from attention. They may care deeply for you, yet inconsistencies or occasional doubts might arise. " +
    "This doesn’t necessarily indicate serious problems, but it suggests opportunities for growth. " +
    "Consider having honest conversations about expectations, boundaries, and feelings to strengthen trust. " +
    "Mutual vulnerability and open dialogue can help close any gaps and reinforce commitment. " +
    "Don’t shy away from addressing small issues before they grow—healthy relationships are built through continuous tuning and understanding."
  );
  else if (score >= 4) return (
    "There are some signs of low loyalty in your relationship. This could mean that certain behaviors or dynamics are raising red flags, " +
    "such as secrecy, avoidance, or inconsistency. However, please remember: no test can fully capture the complexity of a relationship. " +
    "People and situations change, and context matters. Use these insights as a prompt for reflection, not as a definitive judgment. " +
    "If you feel uneasy or hurt, try to create a safe space for honest conversation with your partner. " +
    "Discuss your needs, boundaries, and expectations clearly. If challenges persist or trust remains shaky, " +
    "consider seeking guidance from a counselor or relationship professional. Early intervention can prevent deeper wounds and open doors for healing."
  );
  else return (
    "⚠️ The test suggests that your partner may be showing signs of being uncommitted or disengaged in the relationship. " +
    "However, it's crucial to approach this result thoughtfully—this test is a tool for reflection, not a final verdict. " +
    "Relationships are complex, and many factors (including stress, personal issues, or misunderstandings) can affect loyalty and connection. " +
    "If you're feeling distant or disconnected, prioritize open and non-confrontational communication. Share your feelings, ask honest questions, and listen actively. " +
    "Sometimes clarity comes through conversation; other times, deeper issues may need professional support. " +
    "If trust has been broken or patterns of hurt continue, consider reaching out to a therapist to explore next steps and emotional healing. " +
    "Remember, you deserve respect, honesty, and emotional safety in any relationship."
  );
};

export default function Success({ customerName, amountTotal, score }) {
  const loyaltyPercent = Math.min(Math.round((score / 30) * 100), 100);
  const trustLevel = score >= 21 ? "High" : score >= 12 ? "Moderate" : "Low";
  const communication = score >= 21 ? "Strong" : score >= 12 ? "Fair" : "Weak";

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Test Evaluated!</h1>
      <p>Thank you, {customerName}!</p>

      <h2>Your Relationship Loyalty Test Results:</h2>

      <p style={{ maxWidth: '700px', margin: '20px auto', lineHeight: '1.8' }}>
        <strong>{getResultMessage(score)}</strong>
      </p>

      <Link href="/test">
        <a>Take the test again</a>
      </Link>
    </div>
  );
}

export async function getServerSideProps(context) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { session_id } = context.query;

  if (!session_id) {
    return { notFound: true };
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);

  // Retrieve score from session metadata (assuming you stored it there during checkout session creation)
  const score = parseFloat(session.metadata?.score || 0);

  return {
    props: {
      customerName: session.customer_details?.name || 'Customer',
      amountTotal: session.amount_total,
      score,
    },
  };
}
