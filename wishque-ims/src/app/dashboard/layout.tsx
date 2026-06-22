"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import { LogOut } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    await logoutAction()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/95 px-6 backdrop-blur">
        <div className="font-bold text-lg font-sans">Wishque IMS</div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="gap-2 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? "Signing out..." : "Sign Out"}
        </Button>
      </header>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
