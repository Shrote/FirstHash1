"use client"

import Link from "next/link"

export function NavMain({ items }) {
  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
        >
          <item.icon className="w-5 h-5" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
