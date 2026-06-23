"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
  unit_price: number
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
  profiles?: {
    full_name: string
    role: string
  } | null
}

interface FloralLogisticsDashboardProps {
  inventoryItems: InventoryItem[]
  initialLogs: StockLog[]
  token: string
  userId: string
}

export default function FloralLogisticsDashboard({
  inventoryItems,
  initialLogs,
  token,
  userId
}: FloralLogisticsDashboardProps) {
  const [logs, setLogs] = React.useState<StockLog[]>(initialLogs)
  const [selectedItemId, setSelectedItemId] = React.useState(inventoryItems[0]?.id || "")
  const [quantity, setQuantity] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const router = useRouter()
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [timeFilter, setTimeFilter] = React.useState<"all" | "last_week" | "last_month" | "custom_date">("all")
  const [customDate, setCustomDate] = React.useState<string>("")

  const selectedItem = React.useMemo(() => {
    return inventoryItems.find(item => item.id === selectedItemId)
  }, [inventoryItems, selectedItemId])

  React.useEffect(() => {
    const qtyVal = parseFloat(quantity)
    if (!isNaN(qtyVal) && qtyVal > 0 && selectedItem?.unit_price) {
      const computedPrice = (qtyVal * selectedItem.unit_price).toFixed(2)
      setPrice(computedPrice)
    } else {
      setPrice("")
    }
  }, [quantity, selectedItem])

  React.useEffect(() => {
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg(null)
        setErrorMsg(null)
      }, 30000)
      return () => clearTimeout(timer)
    }
  }, [successMsg, errorMsg])

  const filteredLogs = React.useMemo(() => {
    const now = new Date()
    return logs.filter(log => {
      const logDate = new Date(log.created_at)
      if (timeFilter === "all") return true
      if (timeFilter === "last_week") {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(now.getDate() - 7)
        return logDate >= oneWeekAgo
      }
      if (timeFilter === "last_month") {
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(now.getMonth() - 1)
        return logDate >= oneMonthAgo
      }
      if (timeFilter === "custom_date" && customDate) {
        const cd = new Date(customDate)
        return logDate.getDate() === cd.getDate() && logDate.getMonth() === cd.getMonth() && logDate.getFullYear() === cd.getFullYear()
      }
      return true
    })
  }, [logs, timeFilter, customDate])

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
    const parsedPrice = parseFloat(price)
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setErrorMsg("Please enter a valid positive quantity number.")
      return
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMsg("Please enter a valid positive price.")
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
          id: crypto.randomUUID(),
          item_id: selectedItemId,
          quantity_changed: parsedQty,
          type: "incoming",
          user_id: userId,
          department: "Floral"
        })
        .select(`
          id,
          quantity_changed,
          type,
          created_at,
          inventory_items:item_id (
            name,
            unit
          ),
          profiles:user_id (
            full_name,
            role
          )
        `)
        .single()

      if (logError) throw new Error(logError.message)

      // 2. Fetch current item stock to perform the increment
      const selectedItem = inventoryItems.find(i => i.id === selectedItemId)
      if (!selectedItem) throw new Error("Selected item not found.")

      // 3. Insert into shipments table
      const { error: shipmentError } = await clientSupabase
        .from("shipments")
        .insert({
          id: crypto.randomUUID(),
          item_id: selectedItemId,
          item_name: selectedItem.name,
          quantity: parsedQty,
          price: parsedPrice,
          department: "Floral"
        })

      if (shipmentError) throw new Error(`Shipment Error: ${shipmentError.message}`)

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
      setPrice("")
      setSuccessMsg(`Registered shipment of ${parsedQty} ${selectedItem.unit} of ${selectedItem.name} successfully.`)

      router.refresh()
    } catch (err: any) {
      console.error("Error registering shipment:", err)
      setErrorMsg(err.message || "Failed to log incoming shipment.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-3 mt-4 sm:mt-6">
      {/* Shipment Entry Form */}
      <Card className="lg:col-span-1 border-0 shadow-lg bg-card/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl h-full overflow-hidden flex flex-col">
        <CardHeader className="pb-4 shrink-0">
          <CardTitle className="text-xl font-extrabold flex items-center gap-2.5">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <ArrowDownToLine className="h-5 w-5" />
            </div>
            Receive Shipment
          </CardTitle>
          <CardDescription className="text-sm mt-1.5 opacity-80">
            Log incoming floral items directly to inventory storage.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <form onSubmit={handleRegisterShipment} className="space-y-5 flex-1 flex flex-col">
            <div className="space-y-1.5 shrink-0">
              <Label htmlFor="item">Select Floral Item</Label>
              <select
                id="item"
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl border border-input/50 bg-background/80 px-3.5 py-2 text-sm shadow-xs transition-colors hover:bg-background focus:bg-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 focus:border-primary/40"
              >
                {inventoryItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.current_stock} {item.unit} available)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 shrink-0">
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
                  className="pr-16 h-11 rounded-xl border-input/50 bg-background/80 hover:bg-background focus:bg-background transition-all focus-visible:ring-2 focus-visible:ring-primary/40"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none select-none">
                  {inventoryItems.find(i => i.id === selectedItemId)?.unit || ""}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 shrink-0">
              <Label htmlFor="price">Price (LKR)</Label>
              <div className="relative">
                <Input
                  id="price"
                  type="text"
                  placeholder="0.00"
                  value={price ? `LKR ${parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : ""}
                  disabled={true}
                  className="pr-16 h-11 rounded-xl border-input/50 bg-muted/65 text-muted-foreground transition-all cursor-not-allowed select-none font-bold"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none select-none">
                  LKR
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 shrink-0 relative">
              <div className="absolute bottom-full left-0 right-0 mb-4 flex flex-col gap-2 z-10">
                {errorMsg && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in slide-in-from-top-1 shadow-md">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="leading-tight">{errorMsg}</p>
                  </div>
                )}

                {successMsg && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in slide-in-from-top-1 shadow-md">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="leading-tight">{successMsg}</p>
                  </div>
                )}
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || !selectedItemId}
                className="w-full h-12 rounded-xl text-base font-bold tracking-tight gap-2 shadow-md hover:shadow-lg transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Logging...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Log Goods Arrival
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Logistics Journal Log */}
      <Card className="lg:col-span-2 border-0 shadow-lg bg-card/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl h-full overflow-hidden flex flex-col">
        <CardHeader className="pb-4 shrink-0 flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-extrabold flex items-center gap-2.5">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <History className="h-5 w-5" />
              </div>
              Floral Logistics Journal
            </CardTitle>
            <CardDescription className="text-sm mt-1.5 opacity-80">
              Review live operational logs and shipment entries for floral logistics.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <select
              value={timeFilter}
              onChange={e => setTimeFilter(e.target.value as any)}
              className="h-10 rounded-xl border border-input/50 bg-background/80 px-3 text-sm shadow-xs focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all outline-none"
            >
              <option value="all">All Time</option>
              <option value="last_week">Within last week</option>
              <option value="last_month">Within last month</option>
              <option value="custom_date">Specific Date...</option>
            </select>
            {timeFilter === "custom_date" && (
              <Input
                type="date"
                value={customDate}
                onChange={e => setCustomDate(e.target.value)}
                className="h-10 w-auto rounded-xl border-input/50 bg-background/80"
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-2 flex-1 flex flex-col min-h-0">
          {filteredLogs.length > 0 ? (
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 max-h-[460px]">
              {filteredLogs.map((log) => {
                const isIncoming = log.type === "incoming" || log.type === "IN"
                const item = log.inventory_items
                const fullName = log.profiles?.full_name || "Unknown User"
                const role = log.profiles?.role || "Staff"

                return (
                  <div key={log.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-background/50 border border-border/30 hover:bg-background hover:shadow-md hover:border-border/60 transition-all duration-300 gap-3 sm:gap-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110",
                        isIncoming ? "bg-emerald-500/15 text-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "bg-blue-500/15 text-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                      )}>
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground tracking-tight">
                          {item ? item.name : "Inventory Item"}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-[11px] font-medium text-muted-foreground mt-1 opacity-80">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(log.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                          <span className="flex items-center gap-1.5 capitalize bg-background/60 px-2 py-0.5 rounded-md border border-border/50">
                            <User className="h-3.5 w-3.5" />
                            {fullName} ({role}) • {log.type} Action
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className={cn(
                      "text-sm sm:text-base font-black tracking-tight px-2.5 sm:px-3 py-1 rounded-lg backdrop-blur-sm self-start sm:self-auto shrink-0",
                      isIncoming ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400" : "text-blue-600 bg-blue-500/10 dark:text-blue-400"
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
