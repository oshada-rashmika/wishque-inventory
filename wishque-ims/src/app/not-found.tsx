"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Home, FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function NotFound() {
  const router = useRouter()
  const [dashboardUrl, setDashboardUrl] = React.useState<string>("/")
  const [checking, setChecking] = React.useState(true)

  React.useEffect(() => {
    async function resolveRoute() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("department")
            .eq("id", session.user.id)
            .single()

          if (profile?.department) {
            const normalizedDept = profile.department.trim().toLowerCase().replace(/\s+/g, "-")
            setDashboardUrl(`/dashboard/${normalizedDept}`)
          } else {
            setDashboardUrl("/")
          }
        } else {
          setDashboardUrl("/login")
        }
      } catch (err) {
        console.error("Error determining 404 redirect target:", err)
        setDashboardUrl("/")
      } finally {
        setChecking(false)
      }
    }
    resolveRoute()
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-background px-4 py-12 sm:px-6 lg:px-8 overflow-hidden select-none font-sans">
      
      {/* Background radial blobs matching Wishque IMS glow aesthetic */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl opacity-75 animate-pulse duration-[8000ms]" />
        <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-indigo-500/10 to-transparent blur-3xl opacity-75 animate-pulse duration-[6000ms]" />
      </div>

      {/* Glassmorphic 404 Card container */}
      <div className="relative z-10 w-full max-w-[480px] animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white dark:bg-card p-8 sm:p-12 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-black/[0.04] dark:border-white/[0.04] backdrop-blur-xl">
          
          {/* Logo container */}
          <div className="flex justify-center mb-8">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-background border border-border/40 p-2.5 shadow-sm hover:scale-105 transition-transform duration-300">
              <Image
                src="/logo.png"
                alt="Wishque IMS Logo"
                width={40}
                height={40}
                className="object-contain drop-shadow-xs"
                priority
              />
            </div>
          </div>

          {/* Animated Illustration */}
          <div className="relative flex items-center justify-center w-28 h-28 mx-auto mb-8">
            {/* Pulsing glow ring */}
            <div className="absolute inset-0 rounded-full bg-primary/5 dark:bg-primary/10 animate-ping opacity-60" />
            
            {/* Core icon background and container */}
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-primary/5 to-indigo-500/5 dark:from-primary/15 dark:to-indigo-500/15 border border-primary/10 dark:border-primary/20 shadow-inner">
              <FileQuestion className="w-11 h-11 text-primary/80 dark:text-primary animate-bounce duration-2000" />
            </div>
            
            {/* Miniature ambient particles */}
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-indigo-400/50 dark:bg-indigo-400/80 animate-pulse duration-1000" />
            <span className="absolute bottom-4 left-1.5 w-1.5 h-1.5 rounded-full bg-primary/30 dark:bg-primary/60 animate-pulse duration-700" />
          </div>

          {/* Error code heading */}
          <h1 className="text-7xl sm:text-8xl font-black tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground/60 select-none leading-none mb-4">
            404
          </h1>

          {/* Message Text */}
          <div className="text-center space-y-3 mb-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Lost in the System?
            </h2>
            <p className="text-sm sm:text-[15px] text-muted-foreground max-w-sm mx-auto leading-relaxed font-medium">
              We couldn't find the page you were looking for. The link might be broken, or the page may have been moved. Let's get you back on track.
            </p>
          </div>

          {/* Call-to-actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full">
            <Button
              asChild
              variant="default"
              size="lg"
              className="w-full sm:w-auto min-w-[160px] h-12 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5"
            >
              <Link href={dashboardUrl}>
                <Home className="w-4 h-4 mr-2" />
                {checking ? "Checking..." : "Return Home"}
              </Link>
            </Button>
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto min-w-[160px] h-12 rounded-xl font-bold border-border/60 hover:bg-muted/40 transition-all hover:-translate-y-0.5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Footer branding */}
          <div className="mt-10 pt-6 border-t border-border/30 text-center">
            <p className="text-[11px] text-muted-foreground/50 font-bold uppercase tracking-wider">
              Wishque IMS &bull; Solely developed by Oshada Rashmika
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
