"use client"

import * as React from "react"
import Image from "next/image"
import { Search, Plus, Minus, AlertTriangle, CheckCircle, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Ingredient {
  id: string
  name: string
  image: string
  stock: number
  unit: string
  minThreshold: number
}

const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: "1", name: "Oreos", image: "https://images.unsplash.com/photo-1531257243018-c547a2e35767?w=120&h=120&fit=crop", stock: 18, unit: "packs", minThreshold: 10 },
  { id: "2", name: "Strawberries", image: "https://images.unsplash.com/photo-1568966299181-bb7282cc84f0?w=120&h=120&fit=crop", stock: 8.5, unit: "kg", minThreshold: 5 },
  { id: "3", name: "Flour", image: "https://images.unsplash.com/photo-1627485937980-221c88ac04f9?w=120&h=120&fit=crop", stock: 120, unit: "kg", minThreshold: 50 },
  { id: "4", name: "Edible pearls", image: "https://images.unsplash.com/photo-1607516720808-c137456790c3?w=120&h=120&fit=crop", stock: 3.2, unit: "kg", minThreshold: 2 },
  { id: "5", name: "Baking powder", image: "https://images.unsplash.com/photo-1638405803126-d12de49c7d47?w=120&h=120&fit=crop", stock: 15, unit: "cans", minThreshold: 5 },
  { id: "6", name: "Sugar", image: "https://images.unsplash.com/photo-1673791031093-eb8eefa60083?w=120&h=120&fit=crop", stock: 85, unit: "kg", minThreshold: 30 },
  { id: "7", name: "Butter", image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=120&h=120&fit=crop", stock: 42, unit: "kg", minThreshold: 20 },
  { id: "8", name: "Vanilla", image: "https://images.unsplash.com/photo-1682482003115-b6abbd9e6834?w=120&h=120&fit=crop", stock: 4.8, unit: "liters", minThreshold: 2 },
  { id: "9", name: "Cocoa", image: "https://images.unsplash.com/photo-1507576164121-220762647800?w=120&h=120&fit=crop", stock: 12.5, unit: "kg", minThreshold: 8 }
]

export default function BakeryIngredientList() {
  const [ingredients, setIngredients] = React.useState<Ingredient[]>(INITIAL_INGREDIENTS)
  const [searchQuery, setSearchQuery] = React.useState("")

  const handleAdd = (id: string) => {
    setIngredients(prev =>
      prev.map(item => {
        if (item.id === id) {
          // Increment logic (packs/cans by 1, kg by 5, liters by 0.5)
          const step = item.unit === "kg" ? 5 : item.unit === "liters" ? 0.5 : 1
          return { ...item, stock: parseFloat((item.stock + step).toFixed(1)) }
        }
        return item
      })
    )
  }

  const handleDeduct = (id: string) => {
    setIngredients(prev =>
      prev.map(item => {
        if (item.id === id) {
          const step = item.unit === "kg" ? 5 : item.unit === "liters" ? 0.5 : 1
          const newStock = Math.max(0, item.stock - step)
          return { ...item, stock: parseFloat(newStock.toFixed(1)) }
        }
        return item
      })
    )
  }

  const filteredIngredients = ingredients.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const lowStockCount = ingredients.filter(item => item.stock <= item.minThreshold).length

  return (
    <div className="space-y-6">
      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-card/45 backdrop-blur-md shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Ingredients</span>
            <p className="text-2xl font-bold">{ingredients.length}</p>
          </div>
          <Package className="h-8 w-8 text-primary/60" />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-card/45 backdrop-blur-md shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Low Stock Alerts</span>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{lowStockCount}</p>
          </div>
          <AlertTriangle className={cn("h-8 w-8", lowStockCount > 0 ? "text-amber-500 animate-pulse" : "text-muted-foreground/45")} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-card/45 backdrop-blur-md shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status Checklist</span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {lowStockCount === 0 ? "Perfect" : `${ingredients.length - lowStockCount} Good`}
            </p>
          </div>
          <CheckCircle className="h-8 w-8 text-emerald-500" />
        </div>
      </div>

      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="text-xl font-bold text-foreground tracking-tight self-start sm:self-center">
          Bakery Ingredient Inventory
        </h2>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50 focus:bg-background transition-all"
          />
        </div>
      </div>

      {/* Ingredient Grid/List */}
      <div className="flex flex-col gap-3">
        {filteredIngredients.length > 0 ? (
          filteredIngredients.map(item => {
            const isLow = item.stock <= item.minThreshold
            return (
              <div
                key={item.id}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-300 gap-4",
                  isLow 
                    ? "border-amber-500/20 bg-amber-500/[0.02] hover:bg-amber-500/[0.04] hover:border-amber-500/40" 
                    : "border-border/60 bg-card/50 hover:bg-accent/15 hover:border-border/95"
                )}
              >
                {/* Left Side: Image & Info */}
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-border/50 bg-muted shrink-0 shadow-xs">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      unoptimized
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground leading-tight tracking-tight">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={cn(
                        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-xs",
                        isLow
                          ? "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                          : "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                      )}>
                        {isLow ? "Low Stock" : "In Stock"}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        Min: {item.minThreshold} {item.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Quantity Displays & Big Touch Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Current Stock Display */}
                  <div className="flex flex-col text-left sm:text-right">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold leading-none">
                      Current Stock
                    </span>
                    <span className={cn(
                      "text-lg font-extrabold mt-1 tracking-tight leading-none",
                      isLow ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                    )}>
                      {item.stock} <span className="text-xs font-semibold text-muted-foreground">{item.unit}</span>
                    </span>
                  </div>

                  {/* Big Touch Action Controls */}
                  <div className="flex items-center gap-3 ml-2">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleDeduct(item.id)}
                      className="size-12 min-h-[48px] rounded-xl cursor-pointer hover:bg-destructive/10 hover:text-destructive border-border/70 hover:border-destructive/30 active:scale-95 transition-all flex items-center justify-center shrink-0"
                      aria-label={`Deduct from ${item.name}`}
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleAdd(item.id)}
                      className="size-12 min-h-[48px] rounded-xl cursor-pointer hover:bg-emerald-500/10 hover:text-emerald-600 border-border/70 hover:border-emerald-500/30 active:scale-95 transition-all flex items-center justify-center shrink-0"
                      aria-label={`Add to ${item.name}`}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-10 border border-dashed border-border/60 rounded-xl bg-card/20">
            <p className="text-muted-foreground text-sm">No ingredients match your search query.</p>
          </div>
        )}
      </div>
    </div>
  )
}
