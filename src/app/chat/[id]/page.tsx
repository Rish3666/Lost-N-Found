"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import * as React from "react"

export default function ChatPage({ params }: { params: { id: string } }) {
    const { user } = useAuth()
    const router = useRouter()
    const [messages, setMessages] = React.useState<any[]>([])
    const [newMessage, setNewMessage] = React.useState("")
    const [otherUser, setOtherUser] = React.useState<any>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const messagesEndRef = React.useRef<HTMLDivElement>(null)

    // Scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    React.useEffect(() => {
        scrollToBottom()
    }, [messages])

    React.useEffect(() => {
        if (!user) return

        const fetchConversationDetails = async () => {
            setIsLoading(true)

            // 1. Fetch conversation to get participants
            const { data: conversation, error: convError } = await supabase
                .from("conversations")
                .select(`
                    *,
                    user1:profiles!user1_id(*),
                    user2:profiles!user2_id(*)
                `)
                .eq("id", params.id)
                .single()

            if (convError || !conversation) {
                console.error("Error fetching conversation:", convError)
                // Handle error (e.g., redirect)
                return
            }

            // Identify other user
            const other = conversation.user1.id === user.id ? conversation.user2 : conversation.user1
            setOtherUser(other)

            // 2. Fetch existing messages
            const { data: msgs, error: msgError } = await supabase
                .from("messages")
                .select("*")
                .eq("conversation_id", params.id)
                .order("created_at", { ascending: true })

            if (msgError) {
                console.error("Error fetching messages:", msgError)
            } else {
                setMessages(msgs || [])
            }

            setIsLoading(false)
        }

        fetchConversationDetails()

        // 3. Subscribe to new messages
        const channel = supabase
            .channel(`chat:${params.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `conversation_id=eq.${params.id}`,
                },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [params.id, user])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !user) return

        const text = newMessage.trim()
        setNewMessage("") // Optimistic clear

        const { error } = await supabase.from("messages").insert({
            conversation_id: params.id,
            sender_id: user.id,
            content: text,
        })

        if (error) {
            console.error("Error sending message:", error)
            alert("Failed to send message")
            setNewMessage(text) // Restore text on error
        }
    }

    if (isLoading) {
        return <div className="flex min-h-screen items-center justify-center">Loading chat...</div>
    }

    if (!otherUser) {
        return <div>Conversation not found</div>
    }

    return (
        <div className="container mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col px-4 py-4">
            <div className="mb-4 flex items-center gap-4 border-b pb-4">
                <Button asChild variant="ghost" size="icon">
                    <Link href="/chat">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <Avatar>
                    <AvatarImage src={otherUser.avatar_url} />
                    <AvatarFallback>{otherUser.full_name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="font-semibold">{otherUser.full_name}</h1>
                </div>
            </div>

            <Card className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg px-4 py-2 ${message.sender_id === user?.id
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                    }`}
                            >
                                <p>{message.content}</p>
                                <span className="mt-1 block text-xs opacity-70">
                                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="border-t p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                            placeholder="Type a message..."
                            className="flex-1"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <Button type="submit" size="icon">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    )
}
