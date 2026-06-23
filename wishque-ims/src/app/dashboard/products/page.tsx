import * as React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChefHat, Database } from "lucide-react"
import ProductsList from "@/components/ProductsList"

export default async function ProductsPage() {
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

  // Get user authentication status
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  // Get profile department & role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("department, role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    redirect("/login")
  }

  if (["Store", "Stores", "Stationery"].includes(profile.department)) {
    redirect(`/dashboard/${profile.department.toLowerCase().replace(/\s+/g, "-")}`)
  }

  let query = supabase.from("products").select("id, name, category, department, price")
  
  if (profile.department === "Production") {
    query = query.in("department", ["Bakery", "Floral"])
  } else {
    query = query.eq("department", profile.department)
  }

  const { data: products, error: productsError } = await query

  if (productsError) {
    console.error("Error fetching products:", productsError.message)
  }

  const deptSlug = profile.department.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="size-8 p-0 rounded-lg cursor-pointer">
            <Link href={`/dashboard/${deptSlug}`} aria-label="Back to dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans">Products List</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Managing recipes and items for <span className="font-semibold text-foreground">{profile.department === "Production" ? "Bakery & Floral" : profile.department}</span>
            </p>
          </div>
        </div>

        <Button asChild size="sm" className="cursor-pointer gap-1.5 h-8">
          <Link href={`/dashboard/${deptSlug}`}>
            <ChefHat className="h-4 w-4" />
            <span className="hidden sm:inline">Go to Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>
        </Button>
      </div>

      {/* Main Interactive Products List Component */}
      {products && products.length > 0 ? (
        <ProductsList initialProducts={products as any[]} token={token!} userRole={profile.role} />
      ) : (
        <div className="text-center py-12 border border-dashed border-border/60 rounded-xl bg-card/20 flex flex-col items-center justify-center">
          <Database className="h-8 w-8 text-muted-foreground/60 mb-2" />
          <h3 className="text-sm font-bold text-foreground">No Products Found</h3>
          <p className="text-xs text-muted-foreground mt-1">There are no products listed for your department.</p>
        </div>
      )}
    </div>
  )
}
