import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-20 pb-24">
      <div className="w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-sm p-8 animate-in zoom-in-95 duration-500">
        <LoginForm />
      </div>
    </div>
  )
}
