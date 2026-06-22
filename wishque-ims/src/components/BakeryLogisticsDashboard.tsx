"use client"

import * as React from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, ArrowDownToLine, History, Calendar, User, Package, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface InventoryItem {
  id: string
  name: string
  unit: string
  current_stock: number
}

interface StockLog {
  id: string
  quantity_changed: number
  type: string
  created_at: string
  inventory_items: {
    name: string
    unit: string
  } | null
}

interface BakeryLogisticsDashboardProps {
  inventoryItems: InventoryItem[]
  initialLogs: StockLog[]
  token: string
  userId: string
}

export default function BakeryLogisticsDashboard({
  inventoryItems,
  initialLogs,
  token,
  userId
}: BakeryLogisticsDashboardProps) {
  const [logs, setLogs] = React.useState<StockLog[]>(initialLogs)
  const [selectedItemId, setSelectedItemId] = React.useState(inventoryItems[0]?.id || "")
  const [quantity, setQuantity] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const clientSupabase = React.useMemo(() => {
    return createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    })
  }, [token, supabaseUrl, supabaseKey])

  const handleRegisterShipment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItemId || !quantity) return

    const parsedQty = parseFloat(quantity)
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setErrorMsg("Please enter a valid positive quantity number.")
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      // 1. Insert shipment log in stock_logs
      const { data: newLog, error: logError } = await clientSupabase
        .from("stock_logs")
        .insert({
          item_id: selectedItemId,
          quantity_changed: parsedQty,
          type: "incoming",
          user_id: userId
        })
        .select(`
          id,
          quantity_changed,
          type,
          created_at,
          inventory_items:item_id (
            name,
            unit
          )
        `)
        .single()

      if (logError) throw new Error(logError.message)

      // 2. Fetch current item stock to perform the increment
      const selectedItem = inventoryItems.find(i => i.id === selectedItemId)
      if (!selectedItem) throw new Error("Selected item not found.")

      const updatedStock = parseFloat((selectedItem.current_stock + parsedQty).toFixed(2))

      // 3. Update stock quantity in inventory_items
      const { error: updateError } = await clientSupabase
        .from("inventory_items")
        .update({ current_stock: updatedStock })
        .eq("id", selectedItemId)

      if (updateError) throw new Error(updateError.message)

      // 4. Update local state items
      selectedItem.current_stock = updatedStock
      if (newLog) {
        setLogs(prev => [newLog as any, ...prev])
      }

      setQuantity("")
      setSuccessMsg(`Registered shipment of ${parsedQty} ${selectedItem.unit} of ${selectedItem.name} successfully.`)
    } catch (err: any) {
      console.error("Error registering shipment:", err)
      setErrorMsg(err.message || "Failed to log incoming shipment.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Shipment Entry Form */}
      <Card className="md:col-span-1 border border-border/60 bg-card/45 backdrop-blur-md shadow-xs h-fit">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ArrowDownToLine className="h-5 w-5 text-primary" />
            Receive Shipment
          </CardTitle>
          <CardDescription className="text-xs">
            Log incoming bakery ingredients directly to warehouse storage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegisterShipment} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="item">Select Ingredient</Label>
              <select
                id="item"
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-9 rounded-lg border border-input bg-background/50 px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus:border-ring"
              >
                {inventoryItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.current_stock} {item.unit} available)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity Received</Label>
              <div className="relative">
                <Input
                  id="quantity"
                  type="number"
                  step="any"
                  placeholder="e.g. 50"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={isSubmitting}
                  className="pr-16 bg-background/50 focus:bg-background transition-all"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none select-none">
                  {inventoryItems.find(i => i.id === selectedItemId)?.unit || ""}
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="leading-tight">{errorMsg}</p>
              </div>
            )}

            {successMsg && (
              <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="leading-tight">{successMsg}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !selectedItemId}
              className="w-full cursor-pointer h-9 gap-1.5 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging shipment...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Log Goods Arrival
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Logistics Journal Log */}
      <Card className="md:col-span-2 border border-border/60 bg-card/45 backdrop-blur-md shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Logistics Journal
          </CardTitle>
          <CardDescription className="text-xs">
            Review live operational logs and shipment entries for bakery logistics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {logs.length > 0 ? (
            <div className="divide-y divide-border/40 rounded-xl border border-border/60 bg-background/50 overflow-hidden">
              {logs.map((log) => {
                const isIncoming = log.type === "incoming"
                const item = log.inventory_items

                return (
                  <div key={log.id} className="flex items-center justify-between p-3.5 hover:bg-accent/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg shrink-0",
                        isIncoming ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"
                      )}>
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {item ? item.name : "Inventory Item"}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(log.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                          <span className="flex items-center gap-1 capitalize">
                            <User className="h-3 w-3" />
                            {log.type} Action
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className={cn(
                      "text-sm font-extrabold tracking-tight",
                      isIncoming ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"
                    )}>
                      {isIncoming ? "+" : "-"}{log.quantity_changed} {item?.unit}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-border/40 rounded-xl bg-background/30">
              <History className="h-6 w-6 mx-auto opacity-35 text-muted-foreground mb-1.5" />
              <p className="text-xs font-semibold text-muted-foreground">No Shipment Entries Mapped</p>
              <p className="text-[10px] text-muted-foreground/80 mt-0.5">Recent logistics changes will be tracked here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
