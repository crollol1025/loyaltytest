import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51RLJAXEHLCRcIqqichjJlEB0TWBwLfUlj4qMEDNVAVtg38FCROcT4eKyVQt0yuYtm8HOPndgM2XsIGQ87wbNmGvo00aRcMkcBK');

const options = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
const weights = [0, 0.25, 0.5, 0.75, 1];

const questions = [
  { question: "Do you feel that your partner communicates openly with you?" },
  { question: "Has your partner ever been secretive about their phone or social media?" },
  { question: "Do you trust your partner to be honest with you?" },
  { question: "Has your partner introduced you to their close friends and family?" },
  { question: "Do you feel valued in your relationship?" },
  { question: "Has your partner ever lied about something important?" },
  { question: "Does your partner make time for you, even when they’re busy?" },
  { question: "Do you have access to your partner's personal accounts (e.g., social media, email)?" },
  { question: "Has your partner been defensive when discussing sensitive topics?" },
  { question: "Do you feel emotionally supported by your partner?" },
  { question: "Does your partner make an effort to resolve conflicts in a healthy way?" },
  { question: "Does your partner express affection through actions or words?" },
  { question: "Has your partner ever betrayed your trust?" },
  { question: "Does your partner prioritize spending time with you over others?" },
  { question: "Do you feel that your partner is honest about their feelings?" },
  { question: "Has your partner ever hidden things from you?" },
  { question: "Does your partner show respect for your boundaries?" },
  { question: "Has your partner ever been jealous without cause?" },
  { question: "Does your partner apologize when they're wrong?" },
  { question: "Does your partner make an effort to understand your point of view?" },
  { question: "Does your partner make promises and keep them?" },
  { question: "Does your partner encourage your personal growth and independence?" },
  { question: "Does your partner maintain healthy friendships outside of the relationship?" },
  { question: "Has your partner ever cheated on you?" },
  { question: "Does your partner support you in difficult situations?" },
  { question: "Does your partner respect your time and commitments?" },
  { question: "Does your partner share important decisions with you?" },
  { question: "Has your partner ever ignored your needs?" },
  { question: "Does your partner prioritize your emotional well-being?" },
  { question: "Does your partner respect your privacy?" },
  { question: "Does your partner involve you in long-term plans?" },
  { question: "Do you feel emotionally secure in your relationship?" },
  { question: "Has your partner shown consistent effort in the relationship?" },
  { question: "Do you feel your partner truly listens to you?" },
  { question: "Does your partner express gratitude towards you?" },
  { question: "Has your partner respected your career goals or passions?" },
  { question: "Do you feel prioritized in your partner's life?" },
  { question: "Has your partner demonstrated reliability over time?" },
  { question: "Do you believe your partner defends you in your absence?" },
  { question: "Does your partner initiate meaningful conversations?" },
  { question: "Is your partner transparent about finances?" },
  { question: "Does your partner respect your alone time or personal space?" },
  { question: "Do you feel safe to express your vulnerabilities to your partner?" },
  { question: "Has your partner maintained integrity when tested?" },
  { question: "Does your partner challenge you to become better?" },
  { question: "Has your partner celebrated your successes?" },
  { question: "Does your partner have your back when conflicts arise?" },
  { question: "Do you feel your relationship has mutual respect?" },
  { question: "Is your partner willing to compromise?" },
  { question: "Has your partner ever taken responsibility for a mistake?" },
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
    localStorage.setItem('relationshipScore', score);
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score }),
    });

    const session = await response.json();
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({ sessionId: session.sessionId });

    if (error) console.error('Stripe Checkout Error:', error);
    else setIsPaymentCompleted(true);
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
