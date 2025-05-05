import Link from "next/link"
import { cookies } from "next/headers"
import { getAuthenticatedClient } from "@/lib/graphql/client"
import { GET_CURRENT_USER } from "@/lib/graphql/queries/user"
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

// This component uses Server-Side Rendering (SSR) to fetch user data
async function getCurrentUser() {
  const token = cookies().get("auth_token")?.value

  if (!token) {
    return null
  }

  try {
    const client = getAuthenticatedClient(token)
    const { currentUser } = await client.request(GET_CURRENT_USER)
    return currentUser
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}

export default async function Header() {
  const user = await getCurrentUser()

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

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {user.profilePicture ? (
                      <AvatarImage src={user.profilePicture} alt={user.firstName} />
                    ) : (
                      <AvatarFallback>
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
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
              {!user && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/login">Se connecter</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/register">S'inscrire</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

