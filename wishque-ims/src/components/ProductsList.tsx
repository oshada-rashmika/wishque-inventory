"use client"

import * as React from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Coins, Check, AlertTriangle, Loader2, Info, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

interface InventoryItem {
  id: string
  name: string
  unit: string
  current_stock: number
}

interface ProductRecipe {
  id: string
  required_quantity: number
  inventory_items: InventoryItem | null
}

interface Product {
  id: string
  name: string
  category: string
  department: string
  price: number
  product_recipes?: ProductRecipe[]
}

interface ProductsListProps {
  initialProducts: Product[]
  token: string
}

function SimpleBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors focus:outline-hidden",
      className
    )}>
      {children}
    </span>
  )
}

export default function ProductsList({ initialProducts, token }: ProductsListProps) {
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
  const [recipes, setRecipes] = React.useState<ProductRecipe[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)

  const handleProductClick = async (product: Product) => {
    setSelectedProduct(product)
    setIsOpen(true)
    setIsLoading(true)
    setError(null)
    setRecipes([])

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const clientSupabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${token}` } }
      })

      // Inline client query matching against 'product_recipes' junction table.
      // Fetches required quantities and matching ingredient stock levels.
      const { data, error: queryError } = await clientSupabase
        .from("product_recipes")
        .select(`
          id,
          required_quantity,
          inventory_items:ingredient_id (
            id,
            name,
            unit,
            current_stock
          )
        `)
        .eq("product_id", product.id)

      if (queryError) {
        throw new Error(queryError.message)
      }

      setRecipes((data as any) || [])
    } catch (err: any) {
      console.error("Error fetching recipes client-side:", err)
      setError("Failed to fetch product recipe data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {initialProducts.map((product) => {
          return (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="group cursor-pointer border border-border/60 bg-card/45 backdrop-blur-md hover:bg-accent/15 hover:border-primary/50 transition-all duration-300 rounded-xl p-4 flex flex-col justify-between shadow-xs select-none active:scale-99"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <SimpleBadge className="bg-secondary text-secondary-foreground text-[10px] tracking-wide uppercase border-transparent">
                    {product.category}
                  </SimpleBadge>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <Coins className="h-4 w-4 text-emerald-500/80" />
                    <span>LKR {parseFloat(product.price as any).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground mt-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 pt-3">
                <span className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 opacity-60" />
                  Tap to view recipe & live stock
                </span>
                <span className="font-semibold text-primary/80 group-hover:translate-x-0.5 transition-transform">
                  View Details &rarr;
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* shadcn Dialog Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md border border-border/80 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <SimpleBadge className="bg-secondary text-secondary-foreground text-[9px] tracking-wide uppercase border-transparent">
                {selectedProduct?.category}
              </SimpleBadge>
              {selectedProduct && (
                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  LKR {parseFloat(selectedProduct.price as any).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              )}
            </div>
            <DialogTitle className="text-lg font-extrabold tracking-tight text-foreground mt-1">
              {selectedProduct?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ingredients recipe breakdown with real-time warehouse inventory count.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-2">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <span className="text-xs text-muted-foreground font-medium animate-pulse">Querying live ingredient stocks...</span>
              </div>
            ) : error ? (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-xs">{error}</p>
              </div>
            ) : recipes.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Recipe Requirements & Stock
                </h4>
                <div className="divide-y divide-border/40 rounded-xl border border-border/60 bg-background/50 overflow-hidden">
                  {recipes.map((recipe) => {
                    const item = recipe.inventory_items
                    if (!item) return null

                    const current = item.current_stock || 0
                    const needed = recipe.required_quantity
                    const isAvailable = current >= needed

                    return (
                      <div key={recipe.id} className="flex items-center justify-between p-3 text-xs hover:bg-accent/5 transition-colors">
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Required: <span className="font-semibold text-foreground/80">{needed} {item.unit}</span>
                          </p>
                        </div>
                        
                        {/* Live Stock Badge Indicator */}
                        <SimpleBadge className={cn(
                          "px-2 py-0.5 text-[10px] font-bold border",
                          isAvailable
                            ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/20 animate-pulse"
                        )}>
                          {isAvailable ? (
                            <>
                              <Check className="h-3 w-3 mr-1 text-emerald-600 dark:text-emerald-400" />
                              Available: {current} {item.unit}
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3 w-3 mr-1 text-rose-600 dark:text-rose-400" />
                              Shortage: {current} {item.unit}
                            </>
                          )}
                        </SimpleBadge>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 border border-dashed border-border/60 rounded-xl text-center text-muted-foreground">
                <Info className="h-6 w-6 opacity-45 mb-1.5 text-muted-foreground" />
                <p className="text-xs font-semibold">No Recipe Mapping Found</p>
                <p className="text-[11px] opacity-80 mt-0.5">This product has no ingredients mapped in the database.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-border/40 pt-3">
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="cursor-pointer">
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
