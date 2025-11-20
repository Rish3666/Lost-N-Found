"use client"

import Link from "next/link"
import { Bell, MessageSquare, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { MOCK_NOTIFICATIONS } from "@/lib/data"

export default function NotificationsPage() {
    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold">Notifications</h1>
            <div className="space-y-4">
                {MOCK_NOTIFICATIONS.map((notification) => (
                    <Link key={notification.id} href={notification.link}>
                        <Card className={`transition-colors hover:bg-muted/50 ${!notification.read ? "bg-muted/20" : ""}`}>
                            <CardContent className="flex items-start gap-4 p-4">
                                <div className={`mt-1 rounded-full p-2 ${notification.type === "match" ? "bg-blue-100 text-blue-600" :
                                        notification.type === "message" ? "bg-green-100 text-green-600" :
                                            "bg-gray-100 text-gray-600"
                                    }`}>
                                    {notification.type === "match" && <AlertCircle className="h-4 w-4" />}
                                    {notification.type === "message" && <MessageSquare className="h-4 w-4" />}
                                    {notification.type === "status" && <CheckCircle className="h-4 w-4" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className={`font-semibold ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                                            {notification.title}
                                        </h3>
                                        <span className="text-xs text-muted-foreground">
                                            {notification.timestamp}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {notification.message}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <div className="mt-2 h-2 w-2 rounded-full bg-primary" />
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                {MOCK_NOTIFICATIONS.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <Bell className="mb-4 h-12 w-12 opacity-20" />
                        <p>No notifications yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
