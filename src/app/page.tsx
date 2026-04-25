// Landing page — port of docs/wireframe/landing.html.
// Hero + role split features + footer. Vietnamese, neutral theme (mixes student & parent visuals).
// Auto-redirects signed-in users to their role home.
import Link from "next/link";
import { redirect } from "next/navigation";
import { Gamepad2, BarChart3, ShieldCheck, WifiOff, Sparkles, Star, Flame } from "lucide-react";
import { auth } from "@/auth";
import { MimiSVG } from "@/components/mimi/mimi-svg";

export default async function Home() {
  const session = await auth();
  if (session?.user?.role === "STUDENT") redirect("/student");
  if (session?.user?.role === "PARENT") redirect("/parent");

  return (
    <div className="theme-student min-h-screen bg-paper text-ink-900">
      {/* NAV */}
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500 grid place-items-center text-white font-display font-bold">
            M
          </div>
          <span className="font-display text-xl font-bold">Toán SGK</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/student/signin"
            className="px-4 py-2 rounded-lg text-brand-700 font-semibold hover:bg-brand-50"
          >
            Học sinh
          </Link>
          <Link
            href="/parent/signin"
            className="px-4 py-2 rounded-lg border border-ink-400/30 font-semibold hover:bg-ink-900/5"
          >
            Phụ huynh
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-block bg-sun-500/20 text-sun-700 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full">
            Theo SGK Kết Nối Tri Thức
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-bold mt-4 leading-tight">
            Luyện toán <span className="text-brand-500">vui vẻ</span>
            <br />
            mỗi ngày 10 phút
          </h1>
          <p className="mt-5 text-lg text-ink-600 max-w-lg">
            Ứng dụng luyện toán lớp 4-5 bám sát chương trình SGK Kết Nối Tri Thức. Bạn Mimi sẽ đồng hành cùng em học mỗi ngày!
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/student/signin"
              className="bg-sun-500 text-ink-900 font-display font-bold px-8 py-4 rounded-2xl text-lg shadow-chunky-sun active:translate-y-[3px] active:shadow-none transition-transform"
            >
              Em là học sinh
            </Link>
            <Link
              href="/parent/signin"
              className="bg-white border-2 border-ink-400/30 font-semibold px-8 py-4 rounded-2xl text-lg shadow-flat hover:shadow-soft transition-shadow"
            >
              Tôi là phụ huynh
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-ink-400">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              An toàn cho trẻ
            </span>
            <span className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" aria-hidden="true" />
              Hoạt động offline
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              Không quảng cáo
            </span>
          </div>
        </div>

        {/* HERO ILLUSTRATION: Mimi + floating cards */}
        <div className="relative h-96">
          <div className="absolute inset-0 grid place-items-center">
            <div className="w-60 h-60 rounded-full bg-sun-500/10 ring-8 ring-sun-500/20 grid place-items-center">
              <MimiSVG state="cheering" size={200} />
            </div>
          </div>
          <div className="absolute top-4 left-4 bg-white rounded-2xl shadow-flat px-4 py-3 text-sm font-bold flex items-center gap-2">
            <Flame className="w-4 h-4 text-coral-500" aria-hidden="true" />
            <span><span className="text-coral-500">7</span> ngày liên tiếp</span>
          </div>
          <div className="absolute bottom-8 right-0 bg-white rounded-2xl shadow-flat px-4 py-3 text-sm font-bold flex items-center gap-2">
            <Star className="w-4 h-4 text-sun-500" aria-hidden="true" />
            <span>+120 XP</span>
          </div>
          <div className="absolute top-24 right-4 bg-brand-500 text-white rounded-full px-3 py-1 text-xs font-bold">
            Tuyệt vời!
          </div>
        </div>
      </section>

      {/* FEATURES: role split */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="font-display text-3xl font-bold text-center mb-10">
          Hai trải nghiệm, một mục tiêu
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* STUDENT card — chunky student feel */}
          <div className="bg-white rounded-3xl shadow-flat p-8 border-2 border-brand-500/20">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 grid place-items-center mb-5">
              <Gamepad2 className="w-8 h-8 text-brand-500" aria-hidden="true" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-3">Dành cho học sinh</h3>
            <ul className="space-y-2 text-ink-600">
              <li className="flex gap-2"><span className="text-brand-500">•</span>Luyện theo chủ đề SGK lớp 4-5</li>
              <li className="flex gap-2"><span className="text-brand-500">•</span>Huy chương, XP, chuỗi ngày</li>
              <li className="flex gap-2"><span className="text-brand-500">•</span>Mimi khen thưởng mỗi lần đúng</li>
              <li className="flex gap-2"><span className="text-brand-500">•</span>Đăng nhập bằng mã PIN 4 số</li>
            </ul>
            <Link
              href="/student/signin"
              className="bg-brand-500 text-white font-display font-bold px-6 py-3 rounded-2xl inline-block mt-6 shadow-chunky-brand active:translate-y-[3px] active:shadow-none transition-transform"
            >
              Vào luyện ngay
            </Link>
          </div>

          {/* PARENT card — flat parent feel */}
          <div className="bg-white rounded-2xl shadow-soft p-8 border border-ink-400/20">
            <div className="w-12 h-12 rounded-lg bg-ink-900/5 grid place-items-center mb-5">
              <BarChart3 className="w-6 h-6 text-ink-600" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Dành cho phụ huynh</h3>
            <ul className="space-y-2 text-ink-600 text-sm">
              <li className="flex gap-2"><span>•</span>Đánh giá tổng hợp 0-100 điểm</li>
              <li className="flex gap-2"><span>•</span>Phân tích điểm mạnh, điểm yếu</li>
              <li className="flex gap-2"><span>•</span>Nhiệt đồ luyện tập 7 ngày</li>
              <li className="flex gap-2"><span>•</span>Không áp lực, không so sánh</li>
            </ul>
            <Link
              href="/parent/signin"
              className="bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-lg inline-block mt-6 text-sm hover:shadow-md transition-shadow"
            >
              Đăng nhập phụ huynh
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-400/20 py-6 text-center text-sm text-ink-400">
        © 2026 Toán SGK — Không thu thập dữ liệu nhạy cảm của trẻ.
      </footer>
    </div>
  );
}
