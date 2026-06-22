export const dynamic = 'force-dynamic'
export const revalidate = 0

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertTriangle, DollarSign, Calculator } from "lucide-react"
import BakeryIngredientList from "@/components/BakeryIngredientList"
import BakeryLogisticsDashboard from "@/components/BakeryLogisticsDashboard"

export async function mutateStockBalance(
  itemId: string,
  newStock: number,
  quantityChanged: number,
  type: "IN" | "OUT" | "WASTE"
) {
  "use server"

  if (!itemId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemId)) {
    throw new Error("Invalid item ID format.")
  }

  if (typeof newStock !== "number" || isNaN(newStock) || newStock < 0) {
    throw new Error("Stock value must be a valid non-negative number.")
  }

  if (typeof quantityChanged !== "number" || isNaN(quantityChanged) || quantityChanged <= 0) {
    throw new Error("Quantity changed must be a positive number.")
  }

  if (type !== "IN" && type !== "OUT" && type !== "WASTE") {
    throw new Error("Invalid mutation type. Must be IN, OUT, or WASTE.")
  }

  const cookieStore = await cookies()
  const token = cookieStore.get("sb-access-token")?.value

  if (!token) {
    throw new Error("Unauthorized access.")
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  })

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error("User session expired or invalid.")
  }

  const { data: updatedItem, error: updateError } = await supabase
    .from("inventory_items")
    .update({ current_stock: parseFloat(newStock.toFixed(2)) })
    .eq("id", itemId)
    .select("id, name, current_stock")
    .single()

  if (updateError) {
    console.error(`[MUTATE_STOCK_FAIL] Failed to update stock for item ${itemId}: ${updateError.message}`)
    throw new Error(`Failed to update stock: ${updateError.message}`)
  }

  const { error: logError } = await supabase
    .from("stock_logs")
    .insert({
      id: crypto.randomUUID(),
      item_id: itemId,
      quantity_changed: quantityChanged,
      type: type,
      user_id: user.id
    })

  if (logError) {
    console.error(`[MUTATE_STOCK_LOG_FAIL] Failed to write transaction log for item ${itemId}: ${logError.message}`)
    throw new Error(`Stock updated, but failed to write log: ${logError.message}`)
  }

  return { success: true, updatedItem }
}

export default async function DashboardPage({ params }: { params: Promise<{ department: string }> }) {
  const resolvedParams = await params
  const departmentParam = resolvedParams.department

  const cookieStore = await cookies()
  const token = cookieStore.get("sb-access-token")?.value

  if (!token) {
    redirect("/login")
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  })

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, department, role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    redirect("/login")
  }

  const normalizedDept = profile.department.toLowerCase().replace(/\s+/g, "-")

  if (normalizedDept !== departmentParam) {
    redirect(`/dashboard/${normalizedDept}`)
  }

  let consumptionCost = 0
  if (profile.role.includes("Assistant Manager") && ["Bakery", "Floral", "Stores", "Stationery"].includes(profile.department)) {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const { data: shipments } = await supabase
      .from("shipments")
      .select("price")
      .eq("department", profile.department)
      .gte("created_at", firstDayOfMonth)
      
    if (shipments && shipments.length > 0) {
      consumptionCost = shipments.reduce((sum, s) => sum + Number(s.price || 0), 0)
    }
  }

  // Fetch logistics data server-side if user is Bakery Assistant Manager
  let stockLogs: any[] = []
  let inventoryItems: any[] = []
  let bakeryIngredients: any[] = []

  if (profile.department === "Bakery" && profile.role === "Head Chef") {
    const { data: items } = await supabase
      .from("inventory_items")
      .select("id, name, unit, current_stock, minimum_threshold")
      .eq("department", "Bakery")
      .order("name", { ascending: true })
    if (items) bakeryIngredients = items
  }

  if (profile.department === "Bakery" && profile.role.includes("Assistant Manager")) {
    // 1. Fetch bakery items
    const { data: items } = await supabase
      .from("inventory_items")
      .select("id, name, unit, current_stock, minimum_threshold")
      .eq("department", "Bakery")
      .order("name", { ascending: true })

    if (items) inventoryItems = items

    // 2. Fetch stock logs
    const { data: logs } = await supabase
      .from("stock_logs")
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
      .order("created_at", { ascending: false })
      .limit(1000)

    if (logs) stockLogs = logs
  }

  const isBakeryAsstManager = profile.department === "Bakery" && profile.role.includes("Assistant Manager")
  const lowStockItems = isBakeryAsstManager ? inventoryItems.filter((item: any) => item.current_stock <= item.minimum_threshold) : []

  return (
    <div className="space-y-6">
      {lowStockItems.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="p-2 bg-red-500/20 rounded-xl">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
          </div>
          <p className="text-sm text-red-800 dark:text-red-300 font-medium leading-relaxed">
            <strong className="font-bold">⚠️ Attention:</strong> [{lowStockItems.map((i: any) => i.name).join(", ")}] {lowStockItems.length === 1 ? "is" : "are"} currently below safety thresholds!
          </p>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight capitalize">
          {profile.department} Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back. Logged in as: <span className="font-semibold text-foreground">{profile.role}</span>
        </p>
      </div>

      {profile.department === "Bakery" && profile.role.includes("Head Chef") ? (
        <BakeryIngredientList initialIngredients={bakeryIngredients} mutateStockBalance={mutateStockBalance} />
      ) : profile.department === "Bakery" && profile.role.includes("Assistant Manager") ? (
        <BakeryLogisticsDashboard
          inventoryItems={inventoryItems}
          initialLogs={stockLogs}
          token={token}
          userId={profile.id}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profile.department === "HR" && profile.role.includes("Assistant Manager") && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Staff Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Review daily logs and leave requests.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Rosters</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Manage shift allocations and schedules.</p>
                </CardContent>
              </Card>
            </>
          )}

          {!(profile.department === "HR" && profile.role.includes("Assistant Manager")) && (
            <Card>
              <CardHeader>
                <CardTitle>General Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Standard operational metrics and alerts.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {profile.role.includes("Assistant Manager") && ["Bakery", "Floral", "Stores", "Stationery"].includes(profile.department) && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-xl rounded-3xl overflow-hidden mt-6 relative">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <DollarSign className="w-32 h-32" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-extrabold flex items-center gap-2.5">
               <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                 <Calculator className="h-5 w-5" />
               </div>
               Estimated Department Consumption Cost
            </CardTitle>
            <CardDescription className="text-sm mt-1.5 opacity-80">
               Aggregated current-month spending value for raw materials.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
             <div className="flex items-baseline gap-1.5">
               <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">LKR</span>
               <span className="text-4xl font-black tracking-tighter text-foreground">
                 {consumptionCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </span>
             </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

