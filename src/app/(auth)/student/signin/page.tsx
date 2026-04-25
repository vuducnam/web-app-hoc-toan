// Student signin page — server component shell that renders the client form.
import type { Metadata } from "next";
import { StudentSigninForm } from "@/components/auth/student-signin-form";
import { AuthBackLink } from "@/components/auth/auth-back-link";

export const metadata: Metadata = {
  title: "Đăng nhập học sinh — Math SGK",
};

export default function StudentSigninPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-blue-50">
      <AuthBackLink />
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
        <StudentSigninForm />
      </div>
    </main>
  );
}
