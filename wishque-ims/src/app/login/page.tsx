"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { loginAction } from "@/app/actions/auth"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({})
  const [authError, setAuthError] = React.useState<string | null>(null)

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
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 overflow-hidden select-none">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-radial from-primary/30 to-transparent blur-3xl" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-radial from-primary/20 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-8 text-center">
          <Image
            src="/logo.png"
            alt="Wishque Logo"
            width={56}
            height={56}
            className="h-14 w-auto object-contain mb-3"
            priority
          />
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">Wishque IMS</h2>
          <p className="text-sm text-muted-foreground mt-1">Inventory Management System</p>
        </div>

        <Card className="border border-border/60 bg-card/75 backdrop-blur-md shadow-2xl transition-all duration-300">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials below to access your account
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5">
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
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
                  className="bg-background/50 focus:bg-background transition-all"
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-0.5" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                  >
                    Forgot password?
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
                    className="pr-10 bg-background/50 focus:bg-background transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isPending}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive mt-0.5" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 my-1">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  className="h-4 w-4 rounded border-input text-primary bg-background focus:ring-ring cursor-pointer accent-primary"
                  disabled={isPending}
                />
                <label
                  htmlFor="remember"
                  className="text-xs font-medium leading-none text-muted-foreground cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me for 30 days
                </label>
              </div>

              {authError && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive transition-all animate-in fade-in-0 slide-in-from-top-2 duration-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="font-semibold leading-none tracking-tight mb-1">Sign-in failed</h5>
                    <p className="text-xs opacity-90 leading-relaxed">{authError}</p>
                  </div>
                </div>
              )}

              <Button type="submit" disabled={isPending} className="w-full mt-2 cursor-pointer relative h-9">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
