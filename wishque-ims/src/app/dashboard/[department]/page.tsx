import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BakeryIngredientList from "@/components/BakeryIngredientList"

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
    .select("department, role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    redirect("/login")
  }

  const normalizedDept = profile.department.toLowerCase().replace(/\s+/g, "-")

  if (normalizedDept !== departmentParam) {
    redirect(`/dashboard/${normalizedDept}`)
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
