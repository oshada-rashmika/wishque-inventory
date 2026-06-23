"use client"

import * as React from "react"
import Image from "next/image"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertTriangle, Tag, Coins, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

interface InventoryItem {
  id: string
  name: string
  unit: string
  current_stock: number
  minimum_threshold: number
  department: string
  unit_price: number
  consumption?: number
}

interface BakeryInventoryGridProps {
  inventoryItems: InventoryItem[]
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

export default function BakeryInventoryGrid({ inventoryItems }: BakeryInventoryGridProps) {
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)

  const handleCardClick = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsOpen(true)
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
        {inventoryItems.map((item) => {
          const isLowStock = item.current_stock <= item.minimum_threshold
          const itemImage = IMAGE_MAP[item.name] || "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=120&h=120&fit=crop"

          return (
            <Card
              key={item.id}
              onClick={() => handleCardClick(item)}
              className={cn(
                "border-0 shadow-lg bg-card/40 backdrop-blur-xl rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.01] hover:border-primary/20 select-none active:scale-[0.99]",
                isLowStock && "border border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40"
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center justify-between">
                  <span className="truncate pr-2">{item.name}</span>
                  {isLowStock && (
                    <div className="px-2.5 py-1 bg-red-500/10 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                      <AlertTriangle className="h-3 w-3" />
                      Low
                    </div>
                  )}
                </CardTitle>
                <CardDescription className="text-xs font-medium opacity-60">
                  Minimum threshold: {item.minimum_threshold} {item.unit}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 pb-5">
                <div className="flex items-baseline gap-1.5">
                  <span className={cn(
                    "text-3xl font-black tracking-tighter",
                    isLowStock ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                  )}>
                    {item.current_stock}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {item.unit}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detail Pop-up Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md border border-border/85 shadow-2xl rounded-2xl bg-card/95 backdrop-blur-md">
          <DialogHeader className="flex flex-row items-center gap-4 text-left border-b border-border/40 pb-4">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border/60 bg-muted shrink-0 shadow-xs">
              {selectedItem && (
                <Image
                  src={IMAGE_MAP[selectedItem.name] || "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=120&h=120&fit=crop"}
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
            {/* Grid details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-secondary/35 rounded-xl border border-border/45">
                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 opacity-60" />
                  Department
                </div>
                <div className="text-sm font-extrabold text-foreground mt-1.5 capitalize">
                  {selectedItem?.department}
                </div>
              </div>

              <div className="p-3 bg-secondary/35 rounded-xl border border-border/45">
                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 opacity-60 text-emerald-500" />
                  Unit Price
                </div>
                <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5">
                  LKR {selectedItem?.unit_price ? parseFloat(selectedItem.unit_price as any).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
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
                      selectedItem && selectedItem.current_stock <= selectedItem.minimum_threshold ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                    )}>
                      {selectedItem?.current_stock} <span className="text-xs font-semibold text-muted-foreground">{selectedItem?.unit}</span>
                    </span>
                  </div>
                  <div className="text-right space-y-1 border-l border-border/50 pl-4">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      Min Threshold
                    </span>
                    <span className="text-sm font-extrabold text-muted-foreground">
                      {selectedItem?.minimum_threshold} {selectedItem?.unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Consumption (Last 30 Days) card */}
              <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 col-span-2">
                <div className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 opacity-80" />
                  Consumption (Last 30 Days)
                </div>
                <div className="text-lg font-extrabold text-foreground mt-1 flex items-baseline gap-1">
                  <span>{selectedItem?.consumption || 0}</span>
                  <span className="text-xs font-semibold text-muted-foreground">{selectedItem?.unit}</span>
                </div>
              </div>
            </div>

            {/* Warnings if Low Stock */}
            {selectedItem && selectedItem.current_stock <= selectedItem.minimum_threshold && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <ShieldAlert className="h-4 w-4 shrink-0 animate-bounce" />
                <span>Attention: This item is below safety levels. Restock required.</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
