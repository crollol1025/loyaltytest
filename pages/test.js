import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51RLJAXEHLCRcIqqichjJlEB0TWBwLfUlj4qMEDNVAVtg38FCROcT4eKyVQt0yuYtm8HOPndgM2XsIGQ87wbNmGvo00aRcMkcBK');

const options = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
const weights = [0, 0.25, 0.5, 0.75, 1];

const topics = [
  "Trust",
  "Emotional Loyalty",
  "Phone & Social Media Behavior",
  "Interactions with Others",
  "Communication",
  "Independence vs Secrecy",
  "Defending the Relationship",
  "Consistency & Reliability",
  "Moral Alignment",
  "Commitment & Long-Term Thinking"
];

const questions = [
  { question: "I feel like I can trust my partner completely." },
  { question: "My partner shares their plans and whereabouts with me openly." },
  { question: "My partner is honest with me, even about difficult topics." },
  { question: "I don’t feel the need to check up on my partner." },
  { question: "My partner never gives me a reason to feel suspicious." },
  { question: "My partner is emotionally invested in our relationship." },
  { question: "My partner talks positively about our future together." },
  { question: "My partner expresses their love regularly." },
  { question: "I don’t question my partner’s love for me." },
  { question: "My partner never makes me feel replaceable." },
  { question: "My partner hides nothing from me on their phone or social media." },
  { question: "My partner never hides conversations from me." },
  { question: "My partner avoids following or interacting with flirty content." },
  { question: "My partner is transparent about who they message." },
  { question: "My partner wouldn’t mind if I looked at their phone." },
  { question: "My partner doesn't flirt with others in front of me." },
  { question: "My partner avoids situations that could lead to temptation." },
  { question: "My partner doesn’t seek attention from others romantically." },
  { question: "My partner doesn’t act differently around certain people." },
  { question: "My partner respects how I feel about who they hang out with." },
  { question: "We discuss relationship expectations openly." },
  { question: "My partner respects my opinions and concerns." },
  { question: "My partner understands what behavior makes me uncomfortable." },
  { question: "We talk about what loyalty means to each of us." },
  { question: "My partner shares their thoughts and feelings honestly." },
  { question: "My partner doesn't keep old romantic interests around." },
  { question: "My partner avoids forming overly close relationships with others." },
  { question: "My partner doesn't have secretive friendships." },
  { question: "My partner tells me if someone flirts with them." },
  { question: "My partner would tell me if they developed feelings for someone else." },
  { question: "My partner defends our relationship when needed." },
  { question: "My partner sets boundaries with people who disrespect us." },
  { question: "My partner speaks positively about me to others." },
  { question: "My partner would confront someone who disrespected me." },
  { question: "My partner acts proud to be in this relationship." },
  { question: "My partner keeps their promises to me." },
  { question: "My partner’s actions always match their words." },
  { question: "My partner has proven their loyalty over time." },
  { question: "My partner is consistent with their affection." },
  { question: "I can count on my partner to do the right thing." },
  { question: "My partner values loyalty as much as I do." },
  { question: "My partner believes in monogamy." },
  { question: "My partner avoids doing things that would make me uncomfortable." },
  { question: "My partner considers how their actions affect me." },
  { question: "My partner is someone I share core values with." },
  { question: "My partner includes me in long-term plans." },
  { question: "My partner sees our relationship lasting a long time." },
  { question: "My partner makes decisions with \"us\" in mind." },
  { question: "My partner stays loyal even when we're apart." },
  { question: "My partner is committed to growing with me over time." }
];

questions.forEach(q => {
  q.options = options;
  q.weights = weights;
});

const QUESTIONS_PER_PAGE = 5;

const getResult = (score) => {
  if (score >= 40) return "Your partner is highly loyal to you!";
  else if (score >= 30) return "Your partner is moderately loyal to you.";
  else if (score >= 20) return "There are some signs of low loyalty in your relationship.";
  else return "Your partner may be uncommitted in the relationship.";
};

export default function Test() {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [pageIndex, setPageIndex] = useState(0);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);

  const currentQuestions = questions.slice(
    pageIndex * QUESTIONS_PER_PAGE,
    (pageIndex + 1) * QUESTIONS_PER_PAGE
  );

  const handleAnswerChange = (questionIdx, value) => {
    const newAnswers = [...answers];
    newAnswers[pageIndex * QUESTIONS_PER_PAGE + questionIdx] = value;
    setAnswers(newAnswers);
  };

  const allAnswered = currentQuestions.every((_, idx) =>
    answers[pageIndex * QUESTIONS_PER_PAGE + idx] !== null
  );

  const handleNext = () => {
    if ((pageIndex + 1) * QUESTIONS_PER_PAGE >= questions.length) {
      const finalScore = answers.reduce((sum, val, idx) => {
        const answerIndex = options.indexOf(val);
        return sum + (questions[idx].weights[answerIndex] || 0);
      }, 0);
      setScore(finalScore);
      setIsLoadingResult(true);
      setTimeout(() => {
        setIsLoadingResult(false);
        setIsTestFinished(true);
      }, 3000);
    } else {
      setPageIndex(pageIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }
  };

  const handlePayment = async () => {
    try {
      localStorage.setItem('relationshipScore', score);

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} - ${errorText}`);
      }

      const session = await response.json();
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId: session.sessionId });

      if (error) {
        console.error('Stripe Checkout Error:', error);
        alert('Stripe checkout failed.');
      } else {
        setIsPaymentCompleted(true);
      }
    } catch (err) {
      console.error('Checkout Error:', err.message);
      alert('There was a problem starting the payment process.');
    }
  };

  const handleRetry = () => {
    setAnswers(Array(questions.length).fill(null));
    setPageIndex(0);
    setIsTestFinished(false);
    setIsLoadingResult(false);
    setScore(0);
    setIsPaymentCompleted(false);
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="test-container">
        <h1>Is Your Partner Loyal to You?</h1>
        <p>Answer the following questions to evaluate your relationship.</p>

        {!isTestFinished && !isLoadingResult && (
          <>
            <progress
              value={pageIndex + 1}
              max={Math.ceil(questions.length / QUESTIONS_PER_PAGE)}
              style={{
                width: '100%', height: '12px', borderRadius: '6px', marginBottom: '20px',
                backgroundColor: '#e0f0ff', color: '#4da6ff'
              }}
            />
            <h2 style={{ marginTop: 0 }}>{topics[pageIndex]}</h2>
            <div className="likert-scale-labels">
              {options.map((label, idx) => (
                <span key={idx}>{label}</span>
              ))}
            </div>
            {currentQuestions.map((q, idx) => (
              <div key={idx} className="question-block">
                <h3>{q.question}</h3>
                <div className="options-row">
                  {q.options.map((opt, i) => (
                    <label key={i} className="circle-option">
                      <input
                        type="radio"
                        name={`q-${pageIndex * QUESTIONS_PER_PAGE + idx}`}
                        value={opt}
                        checked={answers[pageIndex * QUESTIONS_PER_PAGE + idx] === opt}
                        onChange={() => handleAnswerChange(idx, opt)}
                      />
                      <span className={`circle ${opt.toLowerCase().replace(" ", "-")}`} />
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button onClick={handlePrevious} disabled={pageIndex === 0}>
                Back
              </button>
              <button disabled={!allAnswered} onClick={handleNext}>
                {(pageIndex + 1) * QUESTIONS_PER_PAGE >= questions.length ? 'Finish' : 'Next Page'}
              </button>
            </div>
          </>
        )}

        {isLoadingResult && <div><h2>Processing your results...</h2></div>}

        {isTestFinished && !isPaymentCompleted && (
          <div>
            <h2>Your answers are ready to be processed!</h2>
            <button onClick={handlePayment}>See My Results</button>
          </div>
        )}

        {isPaymentCompleted && (
          <div>
            <h2>Your Results</h2>
            <p>{getResult(score)}</p>
            <button onClick={handleRetry}>Retake Test</button>
          </div>
        )}
      </div>
    </Elements>
  );
}
