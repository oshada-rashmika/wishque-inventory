import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PackageOpen, AlertTriangle } from "lucide-react"
import FloralIngredientList from "@/components/FloralIngredientList"
import StoreItemsList from "@/components/StoreItemsList"
import { mutateStockBalance } from "../page"

export default async function InventoryPage({ params }: { params: Promise<{ department: string }> }) {
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, department, role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.department.toLowerCase().replace(/\s+/g, "-") !== departmentParam) {
    redirect("/login")
  }

  // Only allow Assistant Manager: Bakery, Floral, or Store
  if (!(["Bakery", "Floral", "Store", "Stores"].includes(profile.department) && profile.role.includes("Assistant Manager"))) {
    redirect(`/dashboard/${departmentParam}`)
  }

  const { data: inventoryItems } = await supabase
    .from("inventory_items")
    .select("id, name, unit, current_stock, minimum_threshold")
    .eq("department", profile.department)
    .order("name", { ascending: true })

  if (!inventoryItems) return null

  if (profile.department === "Floral") {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight capitalize flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
              <PackageOpen className="h-6 w-6" />
            </div>
            Current Inventory
          </h1>
          <p className="text-muted-foreground mt-3 font-medium opacity-80">
            A minimalist overview of your entire floral stock.
          </p>
        </div>
        <div className="mt-8">
          <FloralIngredientList initialIngredients={inventoryItems} mutateStockBalance={mutateStockBalance} />
        </div>
      </div>
    )
  }

  if (profile.department === "Store" || profile.department === "Stores") {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight capitalize flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
              <PackageOpen className="h-6 w-6" />
            </div>
            Current Inventory
          </h1>
          <p className="text-muted-foreground mt-3 font-medium opacity-80">
            A minimalist overview of your entire store stock.
          </p>
        </div>
        <div className="mt-8">
          <StoreItemsList initialIngredients={inventoryItems} mutateStockBalance={mutateStockBalance} />
        </div>
      </div>
    )
  }

  // Bakery rendering (Read-only)
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight capitalize flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
            <PackageOpen className="h-6 w-6" />
          </div>
          Current Inventory
        </h1>
        <p className="text-muted-foreground mt-3 font-medium opacity-80">
          A minimalist read-only overview of your entire bakery stock.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
        {inventoryItems.map((item: any) => {
          const isLowStock = item.current_stock <= item.minimum_threshold

          return (
            <Card key={item.id} className="border-0 shadow-lg bg-card/40 backdrop-blur-xl rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
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
                  <span className={`text-3xl font-black tracking-tighter ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
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
    </div>
  )
}
