"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { LogOut, User, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export interface UserProfile {
  full_name: string | null
  role: string
  department: string
}

interface NavbarProps {
  profile: UserProfile
}

const getDepartmentStyles = (dept: string) => {
  const normalized = dept.trim().toLowerCase()
  switch (normalized) {
    case "hr":
      return "bg-rose-500/10 text-rose-700 border border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30"
    case "accounts":
      return "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30"
    case "operations":
      return "bg-blue-500/10 text-blue-700 border border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30"
    case "product development":
    case "product-development":
      return "bg-purple-500/10 text-purple-700 border border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30"
    case "bakery":
      return "bg-amber-500/10 text-amber-700 border border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30"
    case "floral":
      return "bg-teal-500/10 text-teal-700 border border-teal-500/20 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30"
    case "stores":
      return "bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30"
    default:
      return "bg-slate-500/10 text-slate-700 border border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30"
  }
}

const getInitials = (name: string | null) => {
  if (!name) return "UI"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return "UI"
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}


export default function Navbar({ profile }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      await logoutAction()
      router.push("/login")
    } catch (error) {
      console.error("Error during log out:", error)
      setIsLoggingOut(false)
    }
  }

  const deptStyles = getDepartmentStyles(profile.department)
  const normalizedDept = profile.department.trim().toLowerCase()
  const isAssistantManager = profile.role.includes("Assistant Manager")
  const dashboardPath = `/dashboard/${normalizedDept.replace(/\s+/g, "-")}`
  
  const isActiveDashboard = pathname === dashboardPath
  const isActiveProducts = pathname === "/dashboard/products"
  const isActiveInventory = pathname === `${dashboardPath}/inventory`

  const navLinks = [
    { href: dashboardPath, label: "Dashboard", active: isActiveDashboard },
    ...(isAssistantManager ? [{ href: `${dashboardPath}/inventory`, label: "Inventory", active: isActiveInventory }] : []),
    { href: "/dashboard/products", label: "Products", active: isActiveProducts },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="w-full px-4 sm:px-6 flex h-14 sm:h-16 items-center justify-between">
        {/* Left: Logo + Desktop Nav */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
          <Link 
            href={dashboardPath}
            className="transition-opacity hover:opacity-80 active:scale-95"
          >
            <div className="relative flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-background shadow-xs border border-border/40">
              <Image
                src="/logo.png"
                alt="Wishque IMS Logo"
                width={44}
                height={44}
                className="object-contain drop-shadow-sm"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 border-l border-border/30 pl-5 ml-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 text-[13px] font-bold rounded-lg transition-all",
                  link.active 
                    ? "bg-primary/10 text-primary shadow-xs" 
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Profile + Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-muted/60 hover:bg-muted ring-offset-background transition-all hover:ring-2 hover:ring-primary/20 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer select-none p-0 overflow-hidden border border-border/40"
              >
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-bold text-xs sm:text-sm tracking-wide">
                  {getInitials(profile.full_name)}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64!" align="end" sideOffset={8}>
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-sm font-bold text-primary border border-border/40">
                      {getInitials(profile.full_name)}
                    </div>
                    <div className="flex flex-col space-y-0.5 min-w-0">
                      <p className="text-sm font-bold leading-none text-foreground truncate">
                        {profile.full_name || "IMS User"}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium leading-tight truncate">
                        {profile.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 pt-2 border-t border-border/40">
                    <span className={cn(
                      "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide shadow-2xs transition-colors",
                      deptStyles
                    )}>
                      {profile.department}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive p-2.5 rounded-md flex items-center font-bold text-xs"
              >
                <LogOut className="mr-2 h-4 w-4 shrink-0" />
                <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-border/40 bg-muted/30 hover:bg-muted/60 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/98 backdrop-blur-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-3 text-sm font-bold rounded-xl transition-all",
                  link.active 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

