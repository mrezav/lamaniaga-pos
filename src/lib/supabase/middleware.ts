import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Memvalidasi sesi user
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Rute-rute yang boleh diakses tanpa login
  const isPublicRoute = 
    pathname === '/' ||
    pathname.startsWith('/login') || 
    pathname.startsWith('/register') || 
    pathname.startsWith('/auth') || 
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/api')

  // Logika Proteksi: Hanya jika rute BUKAN publik
  if (!isPublicRoute) {
    // Jika tidak ada user, baru arahkan ke login
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Kita hilangkan pengecekan email_confirmed_at di sini 
    // agar proses verifikasi di auth/callback bisa berjalan lancar
  }

  // Jika user sudah login, cegah akses kembali ke login/register
  if (user && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}
