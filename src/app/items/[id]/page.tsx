import Image from "next/image"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
import { ArrowLeft, MapPin, MessageCircle, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MOCK_ITEMS } from "@/lib/data"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import React from "react"

export default function ItemPage({ params }: { params: { id: string } }) {
    const { user } = useAuth()
    const router = useRouter()
    const [item, setItem] = React.useState<any>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isStartingChat, setIsStartingChat] = React.useState(false)

    React.useEffect(() => {
        const fetchItem = async () => {
            setIsLoading(true)
            const { data, error } = await supabase
                .from("items")
                .select("*, profiles(*)") // Fetch item and related profile
                .eq("id", params.id)
                .single()

            if (error) {
                console.error("Error fetching item:", error)
            } else {
                setItem(data)
            }
            setIsLoading(false)
        }

        fetchItem()
    }, [params.id])

    const handleMessage = async () => {
        if (!user) {
            router.push("/login")
            return
        }

        if (!item || user.id === item.user_id) return

        setIsStartingChat(true)
        try {
            // Check for existing conversation for this item where current user is a participant
            const { data: existingConv } = await supabase
                .from("conversations")
                .select("id")
                .eq("item_id", item.id)
                .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
                .single()

            if (existingConv) {
                router.push(`/chat/${existingConv.id}`)
                return
            }

            // Create new conversation
            const { data: newConv, error } = await supabase
                .from("conversations")
                .insert({
                    item_id: item.id,
                    user1_id: user.id,
                    user2_id: item.user_id,
                })
                .select()
                .single()

            if (error) throw error

            if (newConv) {
                router.push(`/chat/${newConv.id}`)
            }
        } catch (error) {
            console.error("Error starting conversation:", error)
            alert("Failed to start conversation")
            setIsStartingChat(false)
        }
    }

    if (isLoading) {
        return <div className="flex min-h-screen items-center justify-center">Loading...</div>
    }

    if (!item) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Item not found</h1>
                <Button asChild>
                    <Link href="/">Return Home</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-4xl py-8 px-4">
            <Button variant="ghost" asChild className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
                <Link href="/" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Feed
                </Link>
            </Button>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="overflow-hidden rounded-xl border bg-muted/30">
                    <div className="relative aspect-square w-full">
                        <Image
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <Badge variant={item.type === "lost" ? "destructive" : "secondary"}>
                                {item.type === "lost" ? "Lost" : "Found"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                {new Date(item.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold">{item.title}</h1>
                        <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{item.location}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold">Description</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                    </div>

                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={item.profiles?.avatar_url} />
                                <AvatarFallback>{item.profiles?.full_name?.[0] || "?"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-medium">{item.profiles?.full_name || "Unknown User"}</p>
                                <p className="text-sm text-muted-foreground">
                                    {item.type === "lost" ? "Reported this item" : "Found this item"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        {user?.id !== item.user_id && (
                            <Button
                                className="flex-1 gap-2"
                                onClick={handleMessage}
                                disabled={isStartingChat}
                            >
                                <MessageCircle className="h-4 w-4" />
                                {isStartingChat ? "Starting Chat..." : `Message ${item.type === "lost" ? "Owner" : "Finder"}`}
                            </Button>
                        )}
                        <Button variant="outline" className="flex-1 gap-2">
                            <Share2 className="h-4 w-4" />
                            Share
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
