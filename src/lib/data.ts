export interface Item {
    id: string
    title: string
    description: string
    category: string
    location: string
    date: string
    image: string
    type: "lost" | "found"
    status: "active" | "resolved"
    user: {
        name: string
        email: string
    }
}

export const MOCK_ITEMS: Item[] = [
    {
        id: "1",
        title: "Blue Hydro Flask",
        description: "32oz Hydro Flask, blue with stickers. Lost near the library. It has a 'Save the Bees' sticker on the bottom.",
        category: "Accessories",
        location: "Library",
        date: "2023-10-25",
        image: "https://images.unsplash.com/photo-1602143407151-01114192003b?auto=format&fit=crop&q=80&w=1000",
        type: "lost",
        status: "active",
        user: {
            name: "Alice Smith",
            email: "alice@university.edu"
        }
    },
    {
        id: "2",
        title: "Calculus Textbook",
        description: "Found a Calculus 101 textbook on a bench outside the science building. Looks new.",
        category: "Books",
        location: "Science Building",
        date: "2023-10-26",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=1000",
        type: "found",
        status: "active",
        user: {
            name: "Bob Jones",
            email: "bob@university.edu"
        }
    },
    {
        id: "3",
        title: "AirPods Pro Case",
        description: "Lost my AirPods Pro case (no pods inside). Has a cat sticker.",
        category: "Electronics",
        location: "Student Center",
        date: "2023-10-24",
        image: "https://images.unsplash.com/photo-1603351154351-5cf99bc5f16d?auto=format&fit=crop&q=80&w=1000",
        type: "lost",
        status: "active",
        user: {
            name: "Charlie Brown",
            email: "charlie@university.edu"
        }
    },
    {
        id: "4",
        title: "Black Umbrella",
        description: "Found a black umbrella in the cafeteria. Left on table 5.",
        category: "Accessories",
        location: "Cafeteria",
        date: "2023-10-26",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=1000",
        type: "found",
        status: "active",
        user: {
            name: "Diana Prince",
            email: "diana@university.edu"
        }
    },
]

export interface Message {
    id: string
    senderId: string
    text: string
    timestamp: string
}

export interface Conversation {
    id: string
    itemId: string
    otherUser: {
        name: string
        avatar?: string
    }
    lastMessage: string
    lastMessageTime: string
    messages: Message[]
}

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: "1",
        itemId: "1",
        otherUser: {
            name: "Alice Smith",
        },
        lastMessage: "Is this still available?",
        lastMessageTime: "10:30 AM",
        messages: [
            { id: "1", senderId: "other", text: "Hi, I think I found your Hydro Flask!", timestamp: "10:00 AM" },
            { id: "2", senderId: "me", text: "Really? That's great! Where is it?", timestamp: "10:05 AM" },
            { id: "3", senderId: "other", text: "I left it at the front desk of the library.", timestamp: "10:30 AM" },
        ]
    },
    {
        id: "2",
        itemId: "2",
        otherUser: {
            name: "Bob Jones",
        },
        lastMessage: "Thanks for finding it!",
        lastMessageTime: "Yesterday",
        messages: [
            { id: "1", senderId: "me", text: "Hi Bob, I saw your post about the textbook.", timestamp: "Yesterday" },
            { id: "2", senderId: "other", text: "Yes, do you want to meet up to get it?", timestamp: "Yesterday" },
        ]
    }
]

export interface Notification {
    id: string
    type: "match" | "message" | "status"
    title: string
    message: string
    timestamp: string
    read: boolean
    link: string
}

export const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        type: "match",
        title: "New Potential Match!",
        message: "A 'Blue Hydro Flask' was found that matches your lost item report.",
        timestamp: "10 mins ago",
        read: false,
        link: "/items/2" // Mock link
    },
    {
        id: "2",
        type: "message",
        title: "New Message from Alice",
        message: "Hi, I think I found your Hydro Flask!",
        timestamp: "1 hour ago",
        read: true,
        link: "/chat/1"
    },
    {
        id: "3",
        type: "status",
        title: "Item Status Updated",
        message: "Your 'Calculus Textbook' has been marked as resolved.",
        timestamp: "Yesterday",
        read: true,
        link: "/items/2"
    }
]
