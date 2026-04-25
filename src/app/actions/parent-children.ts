"use server";
// Server action: parent creates a child (student) account from their dashboard.
// Verifies parent session, hashes 4-digit PIN, creates User with role=STUDENT, parentId=parent.id.
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyParent } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { hashPin } from "@/lib/auth-hashing";

const childSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên").max(80),
  username: z
    .string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/, "Chỉ được dùng chữ, số, dấu gạch dưới và gạch nối"),
  pin: z
    .string()
    .length(4, "Mã PIN phải có 4 chữ số")
    .regex(/^\d{4}$/, "Mã PIN chỉ gồm chữ số"),
});

export type CreateChildState = { error?: string; success?: string } | undefined;

export async function createChildAccount(
  _prevState: CreateChildState,
  formData: FormData,
): Promise<CreateChildState> {
  const parent = await verifyParent();

  const parsed = childSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    pin: formData.get("pin"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  const { name, username, pin } = parsed.data;

  // Username uniqueness check (User.username is @unique in schema)
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return { error: "Tên đăng nhập đã được sử dụng" };
  }

  const pinHash = await hashPin(pin);
  await prisma.user.create({
    data: {
      name,
      username,
      pinHash,
      role: "STUDENT",
      parentId: parent.id,
    },
  });

  // Refresh parent dashboard so new child appears
  revalidatePath("/parent");
  return { success: `Đã tạo tài khoản cho ${name}` };
}
