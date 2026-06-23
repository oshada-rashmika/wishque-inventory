"use client"

import * as React from "react"
import { Layers, Croissant, Flower2 } from "lucide-react"
import { cn } from "@/lib/utils"
import BakeryLogisticsDashboard from "./BakeryLogisticsDashboard"
import FloralLogisticsDashboard from "./FloralLogisticsDashboard"

interface ProductionLogisticsDashboardProps {
  inventoryItems: any[]
  initialLogs: any[]
  token: string
  userId: string
}

export default function ProductionLogisticsDashboard({
  inventoryItems,
  initialLogs,
  token,
  userId
}: ProductionLogisticsDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<"bakery" | "floral">("bakery")

  const bakeryItems = React.useMemo(() => inventoryItems.filter(item => item.department === "Bakery"), [inventoryItems])
  const floralItems = React.useMemo(() => inventoryItems.filter(item => item.department === "Floral"), [inventoryItems])
  
  const bakeryLogs = React.useMemo(() => initialLogs.filter(log => log.inventory_items?.department === "Bakery" || log.department === "Bakery"), [initialLogs])
  const floralLogs = React.useMemo(() => initialLogs.filter(log => log.inventory_items?.department === "Floral" || log.department === "Floral"), [initialLogs])

  return (
    <div className="space-y-6">
      {/* Custom Clean Toggle Switch */}
      <div className="flex justify-center sm:justify-start">
        <div className="inline-flex items-center p-1.5 bg-muted/40 border border-border/50 rounded-2xl backdrop-blur-sm shadow-inner">
          <button
            onClick={() => setActiveTab("bakery")}
            className={cn(
              "relative flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 outline-none cursor-pointer",
              activeTab === "bakery" ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {activeTab === "bakery" && (
              <div
                className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-amber-500/20 transition-all duration-300"
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Croissant className={cn("h-4 w-4", activeTab === "bakery" ? "text-amber-500" : "opacity-60")} />
              Bakery
            </span>
          </button>

          <button
            onClick={() => setActiveTab("floral")}
            className={cn(
              "relative flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 outline-none cursor-pointer",
              activeTab === "floral" ? "text-teal-700 dark:text-teal-300" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {activeTab === "floral" && (
              <div
                className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-teal-500/20 transition-all duration-300"
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Flower2 className={cn("h-4 w-4", activeTab === "floral" ? "text-teal-500" : "opacity-60")} />
              Floral
            </span>
          </button>
        </div>
      </div>

      <div className="relative">
        {activeTab === "bakery" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <BakeryLogisticsDashboard
              inventoryItems={bakeryItems}
              initialLogs={bakeryLogs}
              token={token}
              userId={userId}
            />
          </div>
        )}

        {activeTab === "floral" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <FloralLogisticsDashboard
              inventoryItems={floralItems}
              initialLogs={floralLogs}
              token={token}
              userId={userId}
            />
          </div>
        )}
      </div>
    </div>
  )
}
