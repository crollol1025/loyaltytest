import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
const stripePromise = loadStripe('pk_test_51RLJAXEHLCRcIqqichjJlEB0TWBwLfUlj4qMEDNVAVtg38FCROcT4eKyVQt0yuYtm8HOPndgM2XsIGQ87wbNmGvo00aRcMkcBK');

const questions = [
  { question: "Do you feel that your partner communicates openly with you?", options: ["Yes", "No", "Sometimes"], weights: [1, 0, 0.5] },
  { question: "Has your partner ever been secretive about their phone or social media?", options: ["Yes", "No", "Not sure"], weights: [0, 1, 0.5] },
  { question: "Do you trust your partner to be honest with you?", options: ["Yes", "No", "It depends"], weights: [1, 0, 0.5] },
  { question: "Has your partner introduced you to their close friends and family?", options: ["Yes", "No", "Not yet"], weights: [1, 0, 0.5] },
  { question: "Do you feel valued in your relationship?", options: ["Yes", "No", "Sometimes"], weights: [1, 0, 0.5] },
  { question: "Has your partner ever lied about something important?", options: ["Yes", "No", "Not sure"], weights: [0, 1, 0.5] },
  { question: "Does your partner make time for you, even when they’re busy?", options: ["Yes", "No", "Sometimes"], weights: [1, 0, 0.5] },
  { question: "Do you have access to your partner's personal accounts (e.g., social media, email)?", options: ["Yes", "No", "Sometimes"], weights: [0, 1, 0.5] },
  { question: "Has your partner been defensive when discussing sensitive topics?", options: ["Yes", "No", "Sometimes"], weights: [0, 1, 0.5] },
  { question: "Do you feel emotionally supported by your partner?", options: ["Yes", "No", "Sometimes"], weights: [1, 0, 0.5] },
  { question: "Does your partner make an effort to resolve conflicts in a healthy way?", options: ["Yes", "No", "Sometimes"], weights: [1, 0, 0.5] },
  { question: "Does your partner express affection through actions or words?", options: ["Yes", "No", "Sometimes"], weights: [1, 0, 0.5] },
  { question: "Has your partner ever betrayed your trust?", options: ["Yes", "No", "Not sure"], weights: [0, 1, 0.5] },
  { question: "Does your partner prioritize spending time with you over others?", options: ["Yes", "No", "Sometimes"], weights: [1, 0, 0.5] },
  { question: "Do you feel that your partner is honest about their feelings?", options: ["Yes", "No", "Sometimes"], weights: [1, 0, 0.5] },
  { question: "Has your partner ever hidden things from you?", options: ["Yes", "No", "Not sure"], weights: [0, 1, 0.5] },
  { question: "Does your partner show respect for your boundaries?", options: ["Yes", "No", "Sometimes"], weights: [1, 0, 0.5] },
  { question: "Has your partner ever been jealous without cause?", options: ["Yes", "No", "Sometimes"], weights: [0, 1, 0.5] },
  { question: "Does your partner apologize when they're wrong?", options: ["Yes", "No", "Sometimes"], weights: [1, 0, 0.5] },
  { question: "Does your partner make an effort to understand your point of view?", options: ["Yes", "No", "Sometimes"], weights: [1, 0, 0.5] },
  { question: "Does your partner make promises and keep them?", options: ["Yes", "No", "Sometimes"], weights: [1, 0, 0.5] },
  { question: "Does your partner encourage your personal growth and independence?", options: ["Yes", "No", "Sometimes"], weights: [1, 0, 0.5] },
  { question: "Does your partner maintain healthy friendships outside of the relationship?", options: ["Yes", "No", "Sometimes"], weights: [1, 0, 0.5] },
  { question: "Has your partner ever cheated on you?", options: ["Yes", "No", "Not sure"], weights: [0, 1, 0.5] },
  { question: "Does your partner support you in difficult situations?", options: ["Yes", "No", "Sometimes"], weights: [1, 0, 0.5] },
  { question: "Does your partner respect your time and commitments?", options: ["Yes", "No", "Sometimes"], weights: [1, 0, 0.5] },
  { question: "Does your partner share important decisions with you?", options: ["Yes", "No", "Sometimes"], weights: [1, 0, 0.5] },
  { question: "Has your partner ever ignored your needs?", options: ["Yes", "No", "Sometimes"], weights: [0, 1, 0.5] },
  { question: "Does your partner prioritize your emotional well-being?", options: ["Yes", "No", "Sometimes"], weights: [1, 0, 0.5] },
  { question: "Does your partner respect your privacy?", options: ["Yes", "No", "Sometimes"], weights: [1, 0, 0.5] },
];

const getResult = (score) => {
  if (score >= 21) return "Your partner is highly loyal to you!";
  else if (score >= 12) return "Your partner is moderately loyal to you.";
  else if (score >= 4) return "There are some signs of low loyalty in your relationship.";
  else return "Your partner may be uncommitted in the relationship.";
};

export default function Test() {
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);

  const handleAnswerChange = (event) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = event.target.value;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestionIndex];
    const answerIndex = currentQuestion.options.indexOf(currentAnswer);
    setScore(score + currentQuestion.weights[answerIndex]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsLoadingResult(true);
      setTimeout(() => {
        setIsLoadingResult(false);
        setIsTestFinished(true);
      }, 4000);
    }
  };

  const handlePayment = async () => {
    // 👉 SAVE SCORE BEFORE REDIRECT
    localStorage.setItem('relationshipScore', score);

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ score: score }),  // Send the score to the backend
    });

    const session = await response.json();
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.sessionId,
    });

    if (error) {
      console.error('Error redirecting to Checkout:', error);
    } else {
      setIsPaymentCompleted(true);
    }
  };

  const handleRetryTest = () => {
    setAnswers([]);
    setCurrentQuestionIndex(0);
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
              value={currentQuestionIndex}
              max={questions.length}
              style={{
                width: '100%',
                height: '12px',
                borderRadius: '6px',
                overflow: 'hidden',
                backgroundColor: '#e0f0ff',
                color: '#4da6ff',
                display: 'block',
                margin: '0 auto 20px auto'
              }}
            />
            <style jsx>{`
              progress::-webkit-progress-bar { background-color: #e0f0ff; border-radius: 6px; }
              progress::-webkit-progress-value { background-color: #4da6ff; border-radius: 6px; }
              progress::-moz-progress-bar { background-color: #4da6ff; border-radius: 6px; }
            `}</style>

            <div className="question-container">
              <h2>{questions[currentQuestionIndex].question}</h2>
              <div className="options-container">
                {questions[currentQuestionIndex].options.map((option, index) => (
                  <label key={index}>
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      value={option}
                      checked={answers[currentQuestionIndex] === option}
                      onChange={handleAnswerChange}
                    />
                    {option}
                  </label>
                ))}
              </div>
              <button
                onClick={handleNextQuestion}
                disabled={answers[currentQuestionIndex] === undefined}
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next Question'}
              </button>
            </div>
            <p style={{ marginTop: '15px' }}>{currentQuestionIndex + 1} / {questions.length}</p>
          </>
        )}

        {isLoadingResult && (
          <div className="loading-section" style={{ textAlign: 'center', marginTop: '50px' }}>
            <div className="spinner"></div>
            <h2>Evaluating test answers...</h2>
            <style jsx>{`
              .spinner {
                border: 6px solid #f3f3f3;
                border-top: 6px solid #4da6ff;
                border-radius: 50%;
                width: 48px;
                height: 48px;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px auto;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {isTestFinished && !isPaymentCompleted && (
          <div className="payment-section">
            <h2>Your answers are ready to be processed!</h2>
            <button onClick={handlePayment}>See My Results</button>
          </div>
        )}

        {isPaymentCompleted && (
          <div className="result-section">
            <h2>Your Results are Ready!</h2>
            <p>{getResult(score)}</p>
            <button onClick={handleRetryTest}>Retry the test</button>
          </div>
        )}
      </div>
    </Elements>
  );
}
