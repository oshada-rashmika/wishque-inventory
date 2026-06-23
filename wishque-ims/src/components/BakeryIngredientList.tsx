"use client"

import * as React from "react"
import Image from "next/image"
import { Search, Plus, Minus, AlertTriangle, CheckCircle, Package, Loader2, Edit2, Info, Coins, Tag, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface Ingredient {
  id: string
  name: string
  image: string
  stock: number
  unit: string
  minThreshold: number
  department: string
  unitPrice: number
  consumption: number
}

interface DatabaseIngredient {
  id: string
  name: string
  unit: string
  current_stock: number
  minimum_threshold: number
  department?: string
  unit_price?: number
  consumption?: number
}

interface BakeryIngredientListProps {
  initialIngredients: DatabaseIngredient[]
  mutateStockBalance: (
    itemId: string,
    newStock: number,
    quantityChanged: number,
    type: "IN" | "OUT" | "WASTE",
    department?: string
  ) => Promise<{ success: boolean; updatedItem: any }>
}

const IMAGE_MAP: Record<string, string> = {
  Oreos: "https://images.unsplash.com/photo-1531257243018-c547a2e35767?w=120&h=120&fit=crop",
  Strawberries: "https://images.unsplash.com/photo-1568966299181-bb7282cc84f0?w=120&h=120&fit=crop",
  Flour: "https://images.unsplash.com/photo-1627485937980-221c88ac04f9?w=120&h=120&fit=crop",
  "Edible pearls": "https://images.unsplash.com/photo-1607516720808-c137456790c3?w=120&h=120&fit=crop",
  "Baking powder": "https://images.unsplash.com/photo-1638405803126-d12de49c7d47?w=120&h=120&fit=crop",
  Sugar: "https://images.unsplash.com/photo-1673791031093-eb8eefa60083?w=120&h=120&fit=crop",
  Butter: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=120&h=120&fit=crop",
  Vanilla: "https://images.unsplash.com/photo-1682482003115-b6abbd9e6834?w=120&h=120&fit=crop",
  Cocoa: "https://images.unsplash.com/photo-1507576164121-220762647800?w=120&h=120&fit=crop"
}

export default function BakeryIngredientList({ initialIngredients, mutateStockBalance }: BakeryIngredientListProps) {
  const [selectedItem, setSelectedItem] = React.useState<Ingredient | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)

  // Map database inventory items into our component format
  const getMappedIngredients = React.useCallback((items: DatabaseIngredient[]): Ingredient[] => {
    return items.map(item => ({
      id: item.id,
      name: item.name,
      unit: item.unit,
      stock: item.current_stock,
      minThreshold: item.minimum_threshold,
      department: item.department || "Bakery",
      unitPrice: item.unit_price || 0,
      consumption: item.consumption || 0,
      image: IMAGE_MAP[item.name] || "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=120&h=120&fit=crop"
    }))
  }, [])

  const [ingredients, setIngredients] = React.useState<Ingredient[]>(() => getMappedIngredients(initialIngredients))
  const [searchQuery, setSearchQuery] = React.useState("")
  const [reasons, setReasons] = React.useState<Record<string, string>>({})
  const [amounts, setAmounts] = React.useState<Record<string, string>>({})
  const [isMutatingId, setIsMutatingId] = React.useState<string | null>(null)

  // Sync state if initialIngredients prop changes
  React.useEffect(() => {
    setIngredients(getMappedIngredients(initialIngredients))
  }, [initialIngredients, getMappedIngredients])

  const handleUpdate = async (id: string) => {
    const item = ingredients.find(i => i.id === id)
    if (!item) return

    const amountStr = amounts[id]
    if (!amountStr) return

    const amount = parseFloat(amountStr)
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive amount.")
      return
    }

    const reason = reasons[id] || "OUT"
    let newStock = item.stock

    if (reason === "IN") {
      newStock += amount
    } else {
      newStock -= amount
      if (newStock < 0) newStock = 0
    }

    const actualChanged = reason === "IN" ? amount : parseFloat((item.stock - newStock).toFixed(2))
    if (actualChanged === 0 && reason !== "IN") return // nothing changed

    setIsMutatingId(id)
    try {
      await mutateStockBalance(id, parseFloat(newStock.toFixed(2)), actualChanged, reason as any)
      setIngredients(prev =>
        prev.map(i => i.id === id ? { 
          ...i, 
          stock: parseFloat(newStock.toFixed(2)),
          consumption: reason === "OUT" ? i.consumption + actualChanged : i.consumption
        } : i)
      )
      setAmounts(prev => ({ ...prev, [id]: "" }))
    } catch (err) {
      console.error("Failed to update stock:", err)
      alert("Failed to update inventory in database.")
    } finally {
      setIsMutatingId(null)
    }
  }

  const filteredIngredients = ingredients.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const lowStockCount = ingredients.filter(item => item.stock <= item.minThreshold).length

  return (
    <div className="space-y-6">
      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Items (Pastel Blue) */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 backdrop-blur-md shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Total Items</span>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{ingredients.length}</p>
          </div>
          <div className="p-2 bg-blue-500/20 rounded-lg shrink-0">
            <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Low Stock Alerts (Pastel Yellow/Amber) */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-amber-500/30 bg-amber-500/15 backdrop-blur-md shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-500 uppercase tracking-wider">Low Stock Alerts</span>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{lowStockCount}</p>
          </div>
          <div className={cn("p-2 rounded-lg shrink-0", lowStockCount > 0 ? "bg-amber-500/20" : "bg-amber-500/10")}>
            <AlertTriangle className={cn("h-6 w-6", lowStockCount > 0 ? "text-amber-600 dark:text-amber-500 animate-pulse" : "text-amber-500/60")} />
          </div>
        </div>

        {/* Status Checklist (Pastel Green) */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/15 backdrop-blur-md shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-500 uppercase tracking-wider">Status Checklist</span>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {lowStockCount === 0 ? "Perfect" : `${ingredients.length - lowStockCount} Good`}
            </p>
          </div>
          <div className="p-2 bg-emerald-500/20 rounded-lg shrink-0">
            <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
          </div>
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
            const isMutating = isMutatingId === item.id

            return (
              <div
                key={item.id}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-300 gap-4",
                  isLow 
                    ? "border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/15 hover:border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.1)] relative overflow-hidden" 
                    : "border-border/60 bg-card/50 hover:bg-accent/15 hover:border-border/95"
                )}
              >
                {/* Left Side: Image & Info */}
                <div 
                  onClick={() => {
                    setSelectedItem(item)
                    setIsDetailOpen(true)
                  }}
                  className="flex items-center gap-4 cursor-pointer hover:opacity-85 select-none transition-all flex-1"
                >
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
                    <h3 className="text-base font-semibold text-foreground leading-tight tracking-tight flex items-center gap-1.5 hover:text-primary transition-colors">
                      {item.name}
                      <Info className="h-3.5 w-3.5 opacity-40 hover:opacity-100 transition-opacity shrink-0" />
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
                  <div className="flex flex-col text-left sm:text-right min-w-[80px]">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold leading-none">
                      Current Stock
                    </span>
                    <span className={cn(
                      "text-lg font-extrabold mt-1 tracking-tight leading-none flex items-center justify-start sm:justify-end gap-1.5",
                      isLow ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                    )}>
                      {isMutating ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        item.stock
                      )}
                      <span className="text-xs font-semibold text-muted-foreground">{item.unit}</span>
                    </span>
                  </div>

                  {/* Big Touch Action Controls */}
                  <div className="flex items-center gap-2 sm:gap-3 ml-0 sm:ml-2 flex-wrap">
                    {/* Reason Select */}
                    <select
                      value={reasons[item.id] || "OUT"}
                      onChange={(e) => setReasons(prev => ({ ...prev, [item.id]: e.target.value }))}
                      disabled={isMutatingId !== null}
                      className="h-10 sm:h-12 min-h-[40px] sm:min-h-[48px] rounded-xl border border-border/80 bg-background/50 px-2 sm:px-2.5 text-[11px] sm:text-xs font-bold text-foreground shadow-xs cursor-pointer focus:ring-1 focus:ring-ring focus:outline-hidden disabled:opacity-50"
                    >
                      <option value="IN">IN (Restock)</option>
                      <option value="OUT">OUT (Production)</option>
                      <option value="WASTE">WASTE (Spoilage)</option>
                    </select>

                    <Input
                      type="number"
                      min="0"
                      step={item.unit === "kg" ? "1" : item.unit === "liters" ? "0.1" : "1"}
                      placeholder="Qty"
                      value={amounts[item.id] || ""}
                      onChange={(e) => setAmounts(prev => ({ ...prev, [item.id]: e.target.value }))}
                      disabled={isMutatingId !== null}
                      className="h-10 sm:h-12 w-16 sm:w-20 min-h-[40px] sm:min-h-[48px] rounded-xl text-center font-bold"
                    />

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleUpdate(item.id)}
                      disabled={isMutatingId !== null || !amounts[item.id]}
                      className="size-10 sm:size-12 min-h-[40px] sm:min-h-[48px] rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary border-border/70 hover:border-primary/30 active:scale-95 transition-all flex items-center justify-center shrink-0 disabled:opacity-50"
                      aria-label={`Update ${item.name}`}
                    >
                      <Edit2 className="h-5 w-5" />
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

      {/* Detail Pop-up Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md border border-border/85 shadow-2xl rounded-2xl bg-card/95 backdrop-blur-md">
          <DialogHeader className="flex flex-row items-center gap-4 text-left border-b border-border/40 pb-4">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border/60 bg-muted shrink-0 shadow-xs">
              {selectedItem && (
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg font-extrabold tracking-tight text-foreground">
                {selectedItem?.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Detailed inventory specification and pricing.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {(() => {
              const activeSelectedItem = ingredients.find(i => i.id === selectedItem?.id) || selectedItem;
              return (
                <>
                  {/* Grid details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-secondary/35 rounded-xl border border-border/45">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 opacity-60" />
                        Department
                      </div>
                      <div className="text-sm font-extrabold text-foreground mt-1.5 capitalize">
                        {activeSelectedItem?.department}
                      </div>
                    </div>

                    <div className="p-3 bg-secondary/35 rounded-xl border border-border/45">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                        <Coins className="h-3.5 w-3.5 opacity-60 text-emerald-500" />
                        Unit Price
                      </div>
                      <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5">
                        LKR {activeSelectedItem?.unitPrice ? parseFloat(activeSelectedItem.unitPrice as any).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                      </div>
                    </div>

                    <div className="p-3 bg-secondary/35 rounded-xl border border-border/45 col-span-2">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                            Current Stock Level
                          </span>
                          <span className={cn(
                            "text-2xl font-black tracking-tight",
                            activeSelectedItem && activeSelectedItem.stock <= activeSelectedItem.minThreshold ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                          )}>
                            {activeSelectedItem?.stock} <span className="text-xs font-semibold text-muted-foreground">{activeSelectedItem?.unit}</span>
                          </span>
                        </div>
                        <div className="text-right space-y-1 border-l border-border/50 pl-4">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                            Min Threshold
                          </span>
                          <span className="text-sm font-extrabold text-muted-foreground">
                            {activeSelectedItem?.minThreshold} {activeSelectedItem?.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Consumption (Last 30 Days) card */}
                    <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 col-span-2">
                      <div className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="h-3.5 w-3.5 opacity-80" />
                        Consumption (Last 30 Days)
                      </div>
                      <div className="text-lg font-extrabold text-foreground mt-1 flex items-baseline gap-1">
                        <span>{activeSelectedItem?.consumption || 0}</span>
                        <span className="text-xs font-semibold text-muted-foreground">{activeSelectedItem?.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Warnings if Low Stock */}
                  {activeSelectedItem && activeSelectedItem.stock <= activeSelectedItem.minThreshold && (
                    <div className="flex items-center gap-2.5 p-3 mt-4 rounded-xl border border-red-500/20 bg-red-500/10 text-xs font-semibold text-red-700 dark:text-red-400">
                      <AlertTriangle className="h-4 w-4 shrink-0 animate-bounce" />
                      <span>Attention: This item is below safety levels. Restock required.</span>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
