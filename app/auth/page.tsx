import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AuthForm } from "@/components/auth-form"
import { StarField } from "@/components/star-field"

export default async function AuthPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <StarField />
      <AuthForm />
    </main>
  )
}
