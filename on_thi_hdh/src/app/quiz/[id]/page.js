import fs from "fs";
import path from "path";
import QuizClient from "./QuizClient";

export default async function QuizPage({ params }) {
  // Await params since it's a Promise in this version of Next.js
  const { id } = await params;
  let quiz = null;
  let errorMsg = null;

  try {
    const quizzesDir = path.join(process.cwd(), "src/data/quizzes");
    const filePath = path.join(quizzesDir, `${id}.json`);

    // Ensure security against directory traversal
    const resolvedPath = path.resolve(filePath);
    const resolvedDir = path.resolve(quizzesDir);

    if (!resolvedPath.startsWith(resolvedDir)) {
      errorMsg = "Mã đề thi không hợp lệ.";
    } else if (fs.existsSync(resolvedPath)) {
      const fileContent = fs.readFileSync(resolvedPath, "utf8");
      quiz = JSON.parse(fileContent);
    } else {
      errorMsg = "Không tìm thấy đề thi này trong hệ thống.";
    }
  } catch (e) {
    console.error("Lỗi tải đề thi:", e);
    errorMsg = "Đã xảy ra lỗi hệ thống khi tải đề thi.";
  }

  if (errorMsg || !quiz) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <div className="quiz-box">
          <h2 style={{ color: "var(--danger)", marginBottom: "1rem" }}>Lỗi</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>{errorMsg}</p>
          <a href="/" className="btn btn-primary">
            Quay lại trang chủ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header" style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem" }}>{quiz.title}</h1>
        <p style={{ fontSize: "1rem" }}>{quiz.description}</p>
      </header>
      <main>
        <QuizClient quiz={quiz} />
      </main>
    </div>
  );
}
