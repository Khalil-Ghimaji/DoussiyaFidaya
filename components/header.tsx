import Link from "next/link"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { LogOut, User, Settings, Menu } from "lucide-react"
import { NotificationBell } from "@/components/notification-bell"
import { fetchGraphQL } from "@/lib/graphql-client"

// This component uses Server-Side Rendering (SSR) to fetch user data
async function getCurrentUser() {
  const token = (await cookies()).get("token")?.value || ""
  const userId = (await cookies()).get("userId")?.value || ""
  if (!token) {
    return null
  }

  try {
    const query = `
    query MyQuery($id: String = "") {
      findFirstUsers(where: {id: {equals: $id}}) {
        first_name
        email
        id
        role
        is_verified
        last_login
        last_name
        profile_picture
      }
    }`
    console.log("Fetching current user with ID:", userId)
    const { data } = await fetchGraphQL(query, { id: userId })
    return data.findFirstUsers
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}

export default async function Header() {
  console.log("Header component rendered")
  const user = await getCurrentUser()
    console.log("Current user:", user)

  return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">MediSystem</span>
            </Link>

            <nav className="hidden md:flex gap-6">
              <Link href="/services" className="text-muted-foreground hover:text-foreground transition-colors">
                Services
              </Link>
              <Link href="/doctors" className="text-muted-foreground hover:text-foreground transition-colors">
                Médecins
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                À propos
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <ModeToggle />

            {user && <NotificationBell user={user} />}

            {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        {user.profile_picture ? (
                            <AvatarImage src={user.profile_picture || "/placeholder.svg"} alt={user.first_name} />
                        ) : (
                            <AvatarFallback>
                              {user.first_name.charAt(0)}
                              {user.last_name.charAt(0)}
                            </AvatarFallback>
                        ) as ReactNode}
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Paramètres</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <form action="/api/auth/logout" method="POST">
                        <button className="flex w-full items-center">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Se déconnecter</span>
                        </button>
                      </form>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <div className="hidden md:flex items-center gap-4">
                  <Button variant="ghost" asChild>
                    <Link href="/auth/login">Se connecter</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/register">S'inscrire</Link>
                  </Button>
                </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/services">Services</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/doctors">Médecins</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/about">À propos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contact">Contact</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {!user ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/auth/login">Se connecter</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/auth/register">S'inscrire</Link>
                      </DropdownMenuItem>
                    </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
  )
}