"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import { cn } from "@/lib/utils"

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

export default function Navbar({ profile }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="w-full px-6 flex h-16 items-center justify-between">
        {/* Brand & Navigation */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link 
            href={dashboardPath}
            className="transition-opacity hover:opacity-80 active:scale-95"
          >
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-background shadow-xs border border-border/40">
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

          <nav className="flex items-center gap-1.5 border-l border-border/30 pl-5 ml-1">
            <Link
              href={dashboardPath}
              className={cn(
                "px-3 py-1.5 text-[13px] font-bold rounded-lg transition-all",
                isActiveDashboard 
                  ? "bg-primary/10 text-primary shadow-xs" 
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              Dashboard
            </Link>
            {isAssistantManager && (
              <Link
                href={`${dashboardPath}/inventory`}
                className={cn(
                  "px-3 py-1.5 text-[13px] font-bold rounded-lg transition-all",
                  isActiveInventory 
                    ? "bg-primary/10 text-primary shadow-xs" 
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                Current Inventory
              </Link>
            )}
            <Link
              href="/dashboard/products"
              className={cn(
                "px-3 py-1.5 text-[13px] font-bold rounded-lg transition-all",
                isActiveProducts 
                  ? "bg-primary/10 text-primary shadow-xs" 
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              Products
            </Link>
          </nav>
        </div>

        {/* User Details & Actions Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Department Badge (Desktop) */}
          <div className="hidden sm:inline-flex">
            <span className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide shadow-xs transition-colors",
              deptStyles
            )}>
              {profile.department}
            </span>
          </div>

          {/* User Profile Info */}
          <div className="flex flex-col text-right">
            <span className="text-xs sm:text-sm font-medium text-foreground leading-none tracking-tight">
              {profile.full_name || "IMS User"}
            </span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 font-normal leading-none">
              {profile.role}
            </span>
          </div>

          {/* Department Badge (Mobile) */}
          <div className="sm:hidden">
            <span className={cn(
              "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide shadow-xs transition-colors",
              deptStyles
            )}>
              {profile.department}
            </span>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-border/60" />

          {/* Log Out Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="gap-2 cursor-pointer text-xs h-9 px-3 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden xs:inline font-bold">
              {isLoggingOut ? "Logging out..." : "Log Out"}
            </span>
            <span className="xs:hidden">
              {isLoggingOut ? "..." : "Exit"}
            </span>
          </Button>
        </div>
      </div>
    </header>
  )
}
