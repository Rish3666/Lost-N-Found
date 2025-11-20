"use client"

import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import * as React from "react"

export default function ChatListPage() {
    const { user } = useAuth()
    const [conversations, setConversations] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        if (!user) return

        const fetchConversations = async () => {
            setIsLoading(true)
            // Fetch conversations where the user is either user1 or user2
            const { data, error } = await supabase
                .from("conversations")
                .select(`
                    id,
                    updated_at,
                    user1:profiles!user1_id(id, full_name, avatar_url),
                    user2:profiles!user2_id(id, full_name, avatar_url),
                    items(title)
                `)
                .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
                .order("updated_at", { ascending: false })

            if (error) {
                console.error("Error fetching conversations:", error)
            } else {
                // Transform data to identify the "other" user
                const formattedConversations = data.map((conv: any) => {
                    const otherUser = conv.user1.id === user.id ? conv.user2 : conv.user1
                    return {
                        id: conv.id,
                        otherUser,
                        itemTitle: conv.items?.title,
                        updatedAt: new Date(conv.updated_at).toLocaleDateString(),
                    }
                })
                setConversations(formattedConversations)
            }
            setIsLoading(false)
        }

        fetchConversations()
    }, [user])

    if (isLoading) {
        return <div className="flex min-h-screen items-center justify-center">Loading conversations...</div>
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold">Messages</h1>
            <div className="space-y-4">
                {conversations.map((conversation) => (
                    <Link key={conversation.id} href={`/chat/${conversation.id}`}>
                        <Card className="transition-colors hover:bg-muted/50">
                            <CardContent className="flex items-center gap-4 p-4">
                                <Avatar>
                                    <AvatarImage src={conversation.otherUser.avatar_url} />
                                    <AvatarFallback>{conversation.otherUser.full_name?.[0] || "?"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">{conversation.otherUser.full_name}</h3>
                                        <span className="text-xs text-muted-foreground">
                                            {conversation.updatedAt}
                                        </span>
                                    </div>
                                    {conversation.itemTitle && (
                                        <p className="truncate text-xs text-muted-foreground">
                                            Re: {conversation.itemTitle}
                                        </p>
                                    )}
                                    <p className="truncate text-sm text-muted-foreground">
                                        Click to view messages
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                {conversations.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <MessageCircle className="mb-4 h-12 w-12 opacity-20" />
                        <p>No messages yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
