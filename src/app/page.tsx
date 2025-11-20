"use client"

import * as React from "react"
import Link from "next/link"
import { PlusCircle, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FeedItem, Item } from "@/components/feed-item"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"

const CATEGORIES = [
  "All Categories",
  "Electronics",
  "Clothing",
  "Accessories",
  "Books",
  "IDs/Documents",
  "Bags",
  "Sports Equipment",
  "Other",
]

export default function HomePage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("All Categories")
  const [items, setItems] = React.useState<Item[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching items:", error)
      } else {
        // Map Supabase data to Item interface if needed, though they should match closely
        // We might need to handle the 'user' field if we want to display user info
        setItems(data as any[])
      }
      setIsLoading(false)
    }

    fetchItems()
  }, [])

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === "All Categories" || item.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const lostItems = filteredItems.filter((item) => item.type === "lost")
  const foundItems = filteredItems.filter((item) => item.type === "found")

  return (
    <div className="container mx-auto min-h-screen max-w-5xl px-4 py-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campus Lost & Found</h1>
          <p className="text-muted-foreground">
            Report lost items or help others find theirs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/report/found">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Found Something
                </Link>
              </Button>
              <Button asChild>
                <Link href="/report/lost">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Lost Something
                </Link>
              </Button>
            </div>
          ) : (
            <Button asChild>
              <Link href="/login">Login to Report</Link>
            </Button>
          )}
        </div>
      </header>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">Loading items...</div>
      ) : (
        <Tabs defaultValue="lost" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lost">Lost Items ({lostItems.length})</TabsTrigger>
            <TabsTrigger value="found">Found Items ({foundItems.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="lost" className="mt-6">
            {lostItems.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {lostItems.map((item, index) => (
                  <FeedItem key={item.id} item={item} index={index} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <p>No lost items found matching your criteria.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="found" className="mt-6">
            {foundItems.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {foundItems.map((item, index) => (
                  <FeedItem key={item.id} item={item} index={index} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <p>No found items found matching your criteria.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
