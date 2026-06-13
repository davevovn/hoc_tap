"use client";

import { useState } from "react";
import Link from "next/link";

export default function QuizClient({ quiz }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  // selectedAnswers: { [questionIndex]: [selectedOptionIndices] }
  const [selectedAnswers, setSelectedAnswers] = useState({});
  // checkedQuestions: { [questionIndex]: boolean }
  const [checkedQuestions, setCheckedQuestions] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;

  const isChecked = checkedQuestions[currentIdx] || false;
  const userSelections = selectedAnswers[currentIdx] || [];
  const correctAnswers = currentQuestion ? (currentQuestion.correct || []) : [];

  // Check if an option is selected for the current question
  const isOptionSelected = (optIdx) => {
    return userSelections.includes(optIdx);
  };

  // Toggle or select option
  const handleOptionClick = (optIdx) => {
    if (submitted || isChecked) return; // Disable changes after checking or final submission

    const questionType = currentQuestion.type;

    let newSelections = [];
    if (questionType === "single") {
      newSelections = [optIdx];
    } else {
      // multiple choice
      if (userSelections.includes(optIdx)) {
        newSelections = userSelections.filter((id) => id !== optIdx);
      } else {
        newSelections = [...userSelections, optIdx];
      }
    }

    setSelectedAnswers({
      ...selectedAnswers,
      [currentIdx]: newSelections,
    });
  };

  // Check if a question is answered correctly
  const checkQuestionCorrectness = (qIdx) => {
    const q = questions[qIdx];
    const userAnswers = selectedAnswers[qIdx] || [];
    const correctAnswers = q.correct || [];

    if (userAnswers.length !== correctAnswers.length) return false;

    const sortedUser = [...userAnswers].sort((a, b) => a - b);
    const sortedCorrect = [...correctAnswers].sort((a, b) => a - b);

    return sortedCorrect.every((val, index) => val === sortedUser[index]);
  };

  // Handle checking the current question
  const handleCheckQuestion = () => {
    setCheckedQuestions({
      ...checkedQuestions,
      [currentIdx]: true,
    });
  };

  // Handle submit quiz (final completion)
  const handleSubmit = () => {
    let correctCount = 0;
    for (let i = 0; i < totalQuestions; i++) {
      if (checkQuestionCorrectness(i)) {
        correctCount++;
      }
    }
    setScore(correctCount);
    setSubmitted(true);
    setCurrentIdx(0); // Reset page to view results page
  };

  // Reset quiz state to try again
  const handleReset = () => {
    setSelectedAnswers({});
    setCheckedQuestions({});
    setSubmitted(false);
    setScore(0);
    setCurrentIdx(0);
  };

  // Progress percentage
  const progressPercent = totalQuestions > 0 ? ((currentIdx + 1) / totalQuestions) * 100 : 0;

  // Result messages based on score percentage
  const getResultMessage = () => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage === 100) return { title: "Xuất sắc!", desc: "Bạn đã trả lời đúng tất cả các câu hỏi!" };
    if (percentage >= 80) return { title: "Tuyệt vời!", desc: "Bạn nắm rất vững kiến thức này." };
    if (percentage >= 50) return { title: "Đạt!", desc: "Bạn đã vượt qua bài thi, nhưng có thể làm tốt hơn." };
    return { title: "Cần cố gắng thêm!", desc: "Hãy ôn lại lý thuyết và thử sức lại nhé." };
  };

  if (totalQuestions === 0) {
    return (
      <div className="quiz-box" style={{ textAlign: "center" }}>
        <p>Đề thi này chưa có câu hỏi nào.</p>
        <Link href="/" className="btn btn-secondary" style={{ marginTop: "1rem" }}>
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  // Submitted view (Results + Review)
  if (submitted) {
    const resultMsg = getResultMessage();
    const percent = Math.round((score / totalQuestions) * 100);

    return (
      <div className="container">
        <div className="quiz-box results-card">
          <div className="score-circle-container">
            <div className="score-circle">
              <span className="score-number">{score}/{totalQuestions}</span>
              <span className="score-total">{percent}%</span>
            </div>
          </div>
          <h2 className="results-title">{resultMsg.title}</h2>
          <p className="results-description">{resultMsg.desc}</p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button onClick={handleReset} className="btn btn-primary">
              Làm lại bài thi
            </button>
            <Link href="/" className="btn btn-secondary">
              Quay lại trang chủ
            </Link>
          </div>
        </div>

        {/* Detailed Review Section */}
        <h2 className="review-section-header">Xem lại chi tiết bài làm</h2>
        {questions.map((q, qIdx) => {
          const isCorrect = checkQuestionCorrectness(qIdx);
          const userAnswers = selectedAnswers[qIdx] || [];
          const correctAnswers = q.correct || [];

          return (
            <div key={q.id} className={`review-card ${isCorrect ? "correct-card" : "incorrect-card"}`}>
              <span className={`review-status-badge ${isCorrect ? "status-correct" : "status-incorrect"}`}>
                {isCorrect ? "Đúng" : "Sai"}
              </span>

              <h4 className="question-text" style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
                Câu {qIdx + 1}: {q.question}
              </h4>

              <div className="options-list">
                {q.options.map((opt, optIdx) => {
                  const isUserSelected = userAnswers.includes(optIdx);
                  const isCorrectAnswer = correctAnswers.includes(optIdx);

                  let optionClass = "";
                  let iconClass = "indicator-neutral";
                  let iconText = "";

                  if (isCorrectAnswer) {
                    optionClass = "correct-choice";
                    iconClass = "indicator-correct";
                    iconText = "✓";
                  } else if (isUserSelected && !isCorrectAnswer) {
                    optionClass = "incorrect-choice";
                    iconClass = "indicator-incorrect";
                    iconText = "✗";
                  }

                  if (isUserSelected) {
                    optionClass += " user-selected";
                  }

                  return (
                    <div key={optIdx} className={`review-option ${optionClass}`}>
                      <div className={`review-indicator ${iconClass}`}>
                        {iconText}
                      </div>
                      <span className="option-content">{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Show hint / correction details */}
              {!isCorrect && (
                <p className="review-feedback-msg" style={{ fontWeight: "600", color: "var(--danger)" }}>
                  * Đáp án đúng là: {correctAnswers.map(idx => `Lựa chọn số ${idx + 1}`).join(", ")}
                </p>
              )}

              {/* Show explanation in review */}
              {q.explanation && (
                <div className="explanation-box" style={{ marginTop: "1rem" }}>
                  <div className="explanation-title">Giải thích</div>
                  <div className="explanation-content">{q.explanation}</div>
                </div>
              )}
            </div>
          );
        })}

        <span onClick={handleReset} className="footer-link">
          Làm lại bài thi từ đầu
        </span>
      </div>
    );
  }

  // Current question correctness if checked
  const isCurrentCorrect = checkQuestionCorrectness(currentIdx);

  // Quiz Taking View
  return (
    <div className="container">
      <div className="quiz-box">
        {/* Progress header */}
        <div className="progress-container">
          <div className="progress-info">
            <span>Tiến độ: Câu {currentIdx + 1}/{totalQuestions}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="progress-bar-outer">
            <div className="progress-bar-inner" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* Question body */}
        <div className="question-section">
          <span className={`question-type-tag ${currentQuestion.type === "single" ? "type-single" : "type-multiple"}`}>
            {currentQuestion.type === "single" ? "Chọn 1 đáp án đúng" : "Chọn nhiều đáp án đúng"}
          </span>
          <h2 className="question-text">
            Câu {currentIdx + 1}: {currentQuestion.question}
          </h2>

          <div className="options-list">
            {currentQuestion.options.map((option, optIdx) => {
              const selected = isOptionSelected(optIdx);
              const isCorrectAnswer = correctAnswers.includes(optIdx);
              const isUserIncorrect = selected && !isCorrectAnswer;

              let optionClass = "";
              if (isChecked) {
                optionClass += " disabled";
                if (isCorrectAnswer) {
                  optionClass += " correct-choice-checked";
                } else if (selected) {
                  optionClass += " incorrect-choice-checked";
                }
              } else if (selected) {
                optionClass += " selected";
              }

              return (
                <div
                  key={optIdx}
                  className={`option-item ${optionClass}`}
                  onClick={() => handleOptionClick(optIdx)}
                >
                  {isChecked ? (
                    <div
                      className={`review-indicator ${isCorrectAnswer ? "indicator-correct" : isUserIncorrect ? "indicator-incorrect" : "indicator-neutral"}`}
                      style={{ borderRadius: currentQuestion.type === "single" ? "50%" : "6px", marginRight: "1rem" }}
                    >
                      {isCorrectAnswer ? "✓" : isUserIncorrect ? "✗" : ""}
                    </div>
                  ) : (
                    <div className={`option-indicator ${currentQuestion.type === "single" ? "type-single-indicator" : "type-multiple-indicator"}`}>
                      {currentQuestion.type === "single" ? (
                        <div className="option-indicator-dot"></div>
                      ) : (
                        <div className="option-indicator-check"></div>
                      )}
                    </div>
                  )}
                  <span className="option-content">{option}</span>
                </div>
              );
            })}
          </div>

          {/* Immediate Feedback Box after Check */}
          {isChecked && (
            <div style={{ marginTop: "1.5rem" }}>
              <div className={`feedback-header ${isCurrentCorrect ? "feedback-correct" : "feedback-incorrect"}`}>
                <span>{isCurrentCorrect ? "✓ Chính xác!" : "✗ Chưa chính xác!"}</span>
              </div>
              
              {!isCurrentCorrect && (
                <p style={{ color: "var(--danger)", fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                  Đáp án đúng: {correctAnswers.map(idx => `Lựa chọn số ${idx + 1}`).join(", ")}
                </p>
              )}

              {currentQuestion.explanation && (
                <div className="explanation-box">
                  <div className="explanation-title">Giải thích</div>
                  <div className="explanation-content">{currentQuestion.explanation}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="quiz-actions">
          <button
            onClick={() => setCurrentIdx(currentIdx - 1)}
            disabled={currentIdx === 0}
            className="btn btn-secondary"
          >
            Câu trước
          </button>

          {!isChecked ? (
            <button
              onClick={handleCheckQuestion}
              disabled={userSelections.length === 0}
              className="btn btn-primary"
            >
              Kiểm tra
            </button>
          ) : currentIdx === totalQuestions - 1 ? (
            <button onClick={handleSubmit} className="btn btn-success">
              Nộp bài & Xem kết quả
            </button>
          ) : (
            <button
              onClick={() => setCurrentIdx(currentIdx + 1)}
              className="btn btn-primary"
            >
              Câu tiếp theo
            </button>
          )}
        </div>
      </div>
      <Link href="/" className="footer-link">
        Hủy làm bài, quay lại Trang chủ
      </Link>
    </div>
  );
}
