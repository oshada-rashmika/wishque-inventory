import * as React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChefHat, Check, AlertTriangle, Coins, Database } from "lucide-react"

// Since Badge component might not exist in components/ui, let's create a local simple badge style or import it if exists.
// Let's check if Badge exists. It was not listed in src/components/ui/ list_dir, so we'll build a clean inline badge or simple utility.
function SimpleBadge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </span>
  )
}

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

  // Fetch products with their corresponding recipes and ingredients
  // We perform a joined query to fetch the products, recipes, and matching inventory details.
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(`
      id,
      name,
      category,
      department,
      price,
      product_recipes (
        id,
        required_quantity,
        inventory_items:ingredient_id (
          id,
          name,
          unit,
          current_stock
        )
      )
    `)
    .eq("department", profile.department)

  if (productsError) {
    console.error("Error fetching products:", productsError.message)
  }

  const deptSlug = profile.department.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="size-8 p-0 rounded-lg cursor-pointer">
            <Link href={`/dashboard/${deptSlug}`} aria-label="Back to dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">Products List</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Managing recipes and items for <span className="font-semibold text-foreground">{profile.department}</span>
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

      {/* Main Grid View */}
      {products && products.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {products.map((product: any) => {
            // Check if we have enough stock for all recipe requirements
            let hasShortage = false
            const recipes = product.product_recipes || []
            
            recipes.forEach((recipe: any) => {
              const item = recipe.inventory_items
              if (item && item.current_stock < recipe.required_quantity) {
                hasShortage = true
              }
            })

            return (
              <Card key={product.id} className="overflow-hidden border border-border/60 bg-card/45 backdrop-blur-md shadow-xs flex flex-col justify-between hover:border-border/90 transition-all duration-300">
                <CardHeader className="space-y-1.5 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <SimpleBadge className="bg-secondary text-secondary-foreground text-[10px] tracking-wide uppercase">
                      {product.category}
                    </SimpleBadge>
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      <Coins className="h-4 w-4 text-emerald-500/80" />
                      <span>LKR {parseFloat(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold tracking-tight text-foreground mt-1">
                    {product.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 pt-0 flex-1">
                  <div className="border-t border-border/40 my-1" />
                  
                  {/* Recipes Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Required Ingredients
                      </h4>
                      <SimpleBadge className={hasShortage 
                        ? "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/25" 
                        : "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/25"
                      }>
                        {hasShortage ? "Stock Shortage" : "Production Ready"}
                      </SimpleBadge>
                    </div>

                    {recipes.length > 0 ? (
                      <div className="divide-y divide-border/30 rounded-lg border border-border/40 bg-background/50 overflow-hidden">
                        {recipes.map((recipe: any) => {
                          const item = recipe.inventory_items
                          if (!item) return null

                          const current = item.current_stock || 0
                          const req = recipe.required_quantity
                          const isAvailable = current >= req

                          return (
                            <div key={recipe.id} className="flex items-center justify-between p-2.5 text-xs">
                              <span className="font-semibold text-foreground">{item.name}</span>
                              <div className="flex items-center gap-4">
                                <span className="text-muted-foreground">
                                  Need: <span className="font-medium text-foreground">{req} {item.unit}</span>
                                </span>
                                <div className="flex items-center gap-1.5 min-w-[90px] justify-end">
                                  <span className={`font-semibold ${isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {current} {item.unit}
                                  </span>
                                  {isAvailable ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                  ) : (
                                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 border border-dashed border-border/40 rounded-lg text-center text-muted-foreground">
                        <Database className="h-5 w-5 opacity-40 mb-1" />
                        <span className="text-xs">No recipe mappings configured for this product.</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
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
