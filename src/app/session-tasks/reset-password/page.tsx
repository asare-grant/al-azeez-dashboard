import {
  TaskResetPassword,
} from "@clerk/nextjs";

export default function ResetPasswordTaskPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <TaskResetPassword
          redirectUrlComplete="/session-tasks/reset-password/complete"
        />
      </div>
    </main>
  );
}