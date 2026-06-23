import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { PackageOpen } from "lucide-react"
import FloralIngredientList from "@/components/FloralIngredientList"
import StoreItemsList from "@/components/StoreItemsList"
import BakeryInventoryGrid from "@/components/BakeryInventoryGrid"
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
    .select("id, name, unit, current_stock, minimum_threshold, department, unit_price, consumption")
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

      <BakeryInventoryGrid inventoryItems={inventoryItems as any[]} />
    </div>
  )
}
