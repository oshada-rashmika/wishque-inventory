"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push("/login")
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/login")
      }
    }
    
    checkUser()

    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login")
      } else if (session) {
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Verifying session...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-sans">
          Wishque IMS
        </h1>
        <p className="text-base text-muted-foreground">
          Inventory Management System boilerplate initialized successfully. You are logged in.
        </p>
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push("/login")
          }}
          className="mt-4 px-4 py-2 text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 rounded-lg transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </main>
  )
}