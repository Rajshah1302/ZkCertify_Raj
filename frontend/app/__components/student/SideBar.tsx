import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, UserCircle, Briefcase, GraduationCap, Calendar, MessageSquare } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    title: "Dashboard",
    href: "/student",
    icon: LayoutDashboard,
  },
  {
    title: "Profile",
    href: "/student/profile",
    icon: UserCircle,
  },
  {
    title: "Jobs",
    href: "/student/jobs",
    icon: Briefcase,
  },
  {
    title: "Skills",
    href: "/student/test",
    icon: GraduationCap,
  },
  {
    title: "Events",
    href: "/student/events",
    icon: Calendar,
  },
  {
    title: "Messages",
    href: "/student/messages",
    icon: MessageSquare,
  },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <Button
            key={item.href}
            variant={pathname === item.href ? "secondary" : "ghost"}
            className={cn("w-full justify-start gap-2", pathname === item.href && "bg-muted")}
            asChild
          >
            <Link href={item.href}>
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}

