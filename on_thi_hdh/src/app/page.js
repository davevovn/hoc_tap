import fs from "fs";
import path from "path";
import Link from "next/link";

// Helper function to load all quizzes from the local directory
function getQuizzes() {
  try {
    const quizzesDir = path.join(process.cwd(), "src/data/quizzes");
    
    // Create directory if it doesn't exist (failsafe)
    if (!fs.existsSync(quizzesDir)) {
      return [];
    }

    const files = fs.readdirSync(quizzesDir);
    const quizzes = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const filePath = path.join(quizzesDir, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        try {
          const data = JSON.parse(fileContent);
          return {
            id: file.replace(".json", ""),
            title: data.title || "Đề thi không tên",
            description: data.description || "Không có mô tả.",
            questionCount: data.questions ? data.questions.length : 0,
          };
        } catch (e) {
          console.error(`Lỗi phân tích cú pháp tệp ${file}:`, e);
          return null;
        }
      })
      .filter((quiz) => quiz !== null);

    return quizzes;
  } catch (error) {
    console.error("Lỗi khi đọc danh sách đề thi:", error);
    return [];
  }
}

export default function Home() {
  const quizzes = getQuizzes();

  return (
    <div className="container">
      <header className="header">
        <h1>Hệ Thống Thi Trắc Nghiệm</h1>
        <p>Luyện tập kiến thức với các bộ đề trắc nghiệm đơn giản và hiệu quả</p>
      </header>

      <main>
        {quizzes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
            <p>Hiện tại chưa có đề thi nào trong hệ thống.</p>
            <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
              Hãy thêm các tệp tin JSON vào thư mục <code>src/data/quizzes/</code> để bắt đầu.
            </p>
          </div>
        ) : (
          <div className="quiz-grid">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="quiz-card">
                <div>
                  <h3>{quiz.title}</h3>
                  <p>{quiz.description}</p>
                </div>
                <div className="quiz-meta">
                  <span className="badge">{quiz.questionCount} câu hỏi</span>
                  <Link href={`/quiz/${quiz.id}`} className="btn btn-primary" style={{ padding: "0.6rem 1.2rem", fontSize: "0.85rem" }}>
                    Làm bài
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
