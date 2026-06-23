"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { loginAction } from "@/app/actions/auth"

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" className="mr-2">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const AppleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" className="mr-2 fill-foreground">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.62-1.496 3.6-2.998 1.14-1.662 1.604-3.27 1.625-3.344-.034-.017-3.13-1.203-3.161-4.79-.026-2.994 2.45-4.436 2.56-4.502-1.393-2.036-3.535-2.313-4.303-2.355-2.015-.152-3.873 1.258-4.607 1.258zM15.534 3.82c.846-1.026 1.417-2.451 1.261-3.877-1.215.049-2.723.811-3.593 1.821-.776.883-1.464 2.336-1.282 3.738 1.353.105 2.766-.653 3.614-1.682z"/>
  </svg>
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({})
  const [authError, setAuthError] = React.useState<string | null>(null)
  
  const [popupMessage, setPopupMessage] = React.useState<string | null>(null)

  const showPopup = (msg: string) => {
    setPopupMessage(msg)
    setTimeout(() => setPopupMessage(null), 3000)
  }

  const validateForm = () => {
    const tempErrors: { email?: string; password?: string } = {}
    if (!email) {
      tempErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Please enter a valid email address"
    }
    if (!password) {
      tempErrors.password = "Password is required"
    } else if (password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters"
    }
    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAuthError(null)
    if (!validateForm()) return

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await loginAction(null, formData)
      
      if (result?.error) {
        setAuthError(result.error)
      } else if (result?.success && result?.department) {
        router.push(`/dashboard/${result.department}`)
      }
    })
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-background px-4 py-12 sm:px-6 lg:px-8 overflow-hidden select-none font-sans">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl dark:from-primary/10 opacity-70" />
      </div>

      {/* Top Left Logo */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-20 animate-in fade-in slide-in-from-left-4 duration-700">
        <Image
          src="/logo.png"
          alt="Wishque Logo"
          width={40}
          height={40}
          className="h-10 w-auto object-contain hover:opacity-80 transition-opacity"
          priority
        />
      </div>

      {/* Toast Notification */}
      {popupMessage && (
        <div className="fixed top-8 z-50 animate-in fade-in slide-in-from-top-4 slide-out-to-top-4 duration-300 bg-foreground text-background px-5 py-2.5 rounded-full shadow-2xl font-semibold text-sm flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
           {popupMessage}
        </div>
      )}

      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-700 delay-150 fill-mode-both">
        <div className="bg-white dark:bg-card p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-black/[0.04] dark:border-white/[0.04] backdrop-blur-xl">
          
          <div className="mb-8">
            <h2 className="text-[26px] font-bold tracking-tight text-foreground mb-1.5">Welcome back</h2>
            <p className="text-[15px] text-muted-foreground font-medium">Log in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                  if (authError) setAuthError(null)
                }}
                aria-invalid={!!errors.email}
                disabled={isPending}
                className="h-12 bg-zinc-50 dark:bg-background/50 border-transparent hover:border-border focus:border-border focus:bg-white dark:focus:bg-background rounded-xl transition-all px-4 shadow-none"
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1 ml-1 font-medium animate-in fade-in slide-in-from-top-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1 pr-1">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-primary/80 hover:text-primary transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                    if (authError) setAuthError(null)
                  }}
                  aria-invalid={!!errors.password}
                  disabled={isPending}
                  className="h-12 pr-12 bg-zinc-50 dark:bg-background/50 border-transparent hover:border-border focus:border-border focus:bg-white dark:focus:bg-background rounded-xl transition-all px-4 shadow-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isPending}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1 ml-1 font-medium animate-in fade-in slide-in-from-top-1">
                  {errors.password}
                </p>
              )}
            </div>

            {authError && (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-sm text-destructive animate-in fade-in zoom-in-95 duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="font-medium leading-snug">{authError}</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isPending} 
              className="w-full h-12 rounded-xl font-bold text-[15px] shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] dark:shadow-none hover:-translate-y-0.5 transition-all duration-200"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-white dark:bg-card px-4 text-muted-foreground/60 font-semibold">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => showPopup("Google sign-in is coming soon!")}
                className="flex items-center justify-center px-4 h-11 border border-border/50 rounded-xl bg-transparent hover:bg-zinc-50 dark:hover:bg-muted/40 transition-colors shadow-sm text-[13px] font-semibold text-foreground/80 hover:text-foreground"
              >
                <GoogleIcon /> Google
              </button>
              <button
                type="button"
                onClick={() => showPopup("Apple sign-in is coming soon!")}
                className="flex items-center justify-center px-4 h-11 border border-border/50 rounded-xl bg-transparent hover:bg-zinc-50 dark:hover:bg-muted/40 transition-colors shadow-sm text-[13px] font-semibold text-foreground/80 hover:text-foreground"
              >
                <AppleIcon /> Apple
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
