"use client"

import * as React from "react"
import { Croissant, Flower2, PackageOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import FloralIngredientList from "./FloralIngredientList"
import BakeryInventoryGrid from "./BakeryInventoryGrid"

interface ProductionInventoryDashboardProps {
  inventoryItems: any[]
  mutateStockBalance: any
}

export default function ProductionInventoryDashboard({
  inventoryItems,
  mutateStockBalance
}: ProductionInventoryDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<"bakery" | "floral">("bakery")

  const bakeryItems = React.useMemo(() => inventoryItems.filter(item => item.department === "Bakery"), [inventoryItems])
  const floralItems = React.useMemo(() => inventoryItems.filter(item => item.department === "Floral"), [inventoryItems])

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight capitalize flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
              <PackageOpen className="h-6 w-6" />
            </div>
            Current Inventory
          </h1>
          <p className="text-muted-foreground mt-3 font-medium opacity-80">
            A minimalist overview of your combined bakery and floral stock.
          </p>
        </div>

        {/* Custom Clean Toggle Switch */}
        <div className="inline-flex items-center p-1.5 bg-muted/40 border border-border/50 rounded-2xl backdrop-blur-sm shadow-inner shrink-0">
          <button
            onClick={() => setActiveTab("bakery")}
            className={cn(
              "relative flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-xl transition-all duration-300 outline-none cursor-pointer",
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
              "relative flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-xl transition-all duration-300 outline-none cursor-pointer",
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

      <div className="relative mt-8">
        {activeTab === "bakery" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <BakeryInventoryGrid inventoryItems={bakeryItems} />
          </div>
        )}

        {activeTab === "floral" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <FloralIngredientList initialIngredients={floralItems} mutateStockBalance={mutateStockBalance} />
          </div>
        )}
      </div>
    </div>
  )
}
