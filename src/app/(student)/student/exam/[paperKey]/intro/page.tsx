// Exam intro/rules page - student reviews then clicks "Start" to begin.
import { notFound } from "next/navigation";
import Link from "next/link";
import { verifyStudent } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { StartExamButton } from "@/components/exam/start-exam-button";

interface Props {
  params: Promise<{ paperKey: string }>;
}

export default async function ExamIntroPage({ params }: Props) {
  const { paperKey } = await params;
  const user = await verifyStudent();

  const paper = await prisma.examPaper.findUnique({ where: { key: paperKey } });
  if (!paper || !paper.isActive) notFound();
  if (paper.gradeId !== user.gradeId) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/student/exam" className="text-brand-700 hover:underline font-display font-semibold">
        ← Đề thi
      </Link>
      <article className="rounded-3xl bg-white border-2 border-ink-100 shadow-[0_5px_0_0_rgb(0_0_0/.08)] p-8 space-y-5">
        <h1 className="font-display font-bold text-3xl text-ink-900">{paper.nameVi}</h1>
        <ul className="space-y-2 text-ink-800">
          <li><strong>Số câu:</strong> {paper.totalQuestions} câu</li>
          <li><strong>Thời gian:</strong> {paper.durationMinutes} phút</li>
          <li><strong>Thang điểm:</strong> {paper.totalPoints.toString()}</li>
          <li><strong>Hình thức:</strong> Trắc nghiệm + tự luận ngắn</li>
        </ul>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-amber-900 text-sm">
          <p className="font-bold mb-2">Lưu ý:</p>
          <ul className="space-y-1 list-disc pl-5">
            <li>Khi bắt đầu, đồng hồ đếm ngược sẽ chạy không dừng.</li>
            <li>Bài tự lưu mỗi 30 giây - vào lại được nếu mất kết nối.</li>
            <li>Hết giờ, bài sẽ tự nộp.</li>
          </ul>
        </div>
        <StartExamButton examPaperId={paper.id} />
      </article>
    </div>
  );
}
