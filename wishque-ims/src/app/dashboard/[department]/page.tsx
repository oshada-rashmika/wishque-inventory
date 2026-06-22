import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BakeryIngredientList from "@/components/BakeryIngredientList"
import BakeryLogisticsDashboard from "@/components/BakeryLogisticsDashboard"

export async function mutateStockBalance(itemId: string, newStock: number) {
  "use server"

  if (!itemId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemId)) {
    throw new Error("Invalid item ID format.")
  }

  if (typeof newStock !== "number" || isNaN(newStock) || newStock < 0) {
    throw new Error("Stock value must be a valid non-negative number.")
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

  const { data, error } = await supabase
    .from("inventory_items")
    .update({ current_stock: parseFloat(newStock.toFixed(2)) })
    .eq("id", itemId)
    .select("id, name, current_stock")
    .single()

  if (error) {
    console.error(`[MUTATE_STOCK_FAIL] Failed to update stock for item ${itemId}: ${error.message}`)
    throw new Error(`Failed to update stock: ${error.message}`)
  }

  return { success: true, updatedItem: data }
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

  // Fetch logistics data server-side if user is Bakery Assistant Manager
  let stockLogs: any[] = []
  let inventoryItems: any[] = []

  if (profile.department === "Bakery" && profile.role === "Assistant Manager") {
    // 1. Fetch bakery items
    const { data: items } = await supabase
      .from("inventory_items")
      .select("id, name, unit, current_stock")
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
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    if (logs) stockLogs = logs
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight capitalize">
          {profile.department} Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back. Logged in as: <span className="font-semibold text-foreground">{profile.role}</span>
        </p>
      </div>

      {profile.department === "Bakery" && profile.role === "Head Chef" ? (
        <BakeryIngredientList />
      ) : profile.department === "Bakery" && profile.role === "Assistant Manager" ? (
        <BakeryLogisticsDashboard
          inventoryItems={inventoryItems}
          initialLogs={stockLogs}
          token={token}
          userId={profile.id}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profile.department === "HR" && profile.role === "Assistant Manager" && (
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

          {!(profile.department === "HR" && profile.role === "Assistant Manager") && (
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
    </div>
  )
}
