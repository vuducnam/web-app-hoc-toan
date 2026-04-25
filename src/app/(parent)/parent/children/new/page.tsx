// Parent: page to add a new child account. Verifies session via layout DAL.
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AddChildForm } from "@/components/parent/add-child-form";

export const metadata: Metadata = {
  title: "Thêm học sinh — Phụ huynh | Toán SGK",
};

export default async function AddChildPage() {
  // Load grades so the form can render a required grade selector.
  const grades = await prisma.grade.findMany({
    select: { id: true, key: true, name: true },
    orderBy: { key: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto py-8 flex flex-col gap-6">
      <div>
        <Link
          href="/parent"
          className="text-sm text-ink-600 hover:text-ink-900"
        >
          ← Quay lại bảng theo dõi
        </Link>
        <h1 className="text-2xl font-semibold text-ink-900 mt-2">
          Thêm tài khoản học sinh
        </h1>
        <p className="text-sm text-ink-600 mt-1">
          Tạo tài khoản cho con. Bé sẽ đăng nhập bằng tên và mã PIN 4 số.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-flat p-6 border border-ink-400/10">
        <AddChildForm grades={grades} />
      </div>
    </div>
  );
}
