"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function NavMain({ items }) {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = React.useState({})

  const toggleMenu = (title) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  return (
    <nav className="space-y-2 px-2">
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href)
        const isOpen = openMenus[item.title] || false

        return (
          <div key={item.title}>
            {item.children ? (
              <>
                <button
                  onClick={() => toggleMenu(item.title)}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded hover:bg-muted",
                    isActive && "bg-muted font-semibold"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {isOpen && (
                  <div className="ml-6 space-y-1 mt-1">
                    {item.children.map((child) => {
                      const childActive = pathname === child.href
                      return (
                        <Link
                          key={child.key}
                          href={child.href}
                          className={cn(
                            "block px-2 py-1 text-sm rounded hover:bg-muted",
                            childActive && "bg-muted font-semibold"
                          )}
                        >
                          {child.title}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded hover:bg-muted",
                  isActive && "bg-muted font-semibold"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
