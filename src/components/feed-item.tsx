import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Calendar, Tag } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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
}

interface FeedItemProps {
    item: Item
    index?: number
}

export function FeedItem({ item, index = 0 }: FeedItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
        >
            <Card className="overflow-hidden transition-all hover:shadow-md">
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                    />
                    <div className="absolute left-2 top-2">
                        <Badge variant={item.type === "lost" ? "destructive" : "default"}>
                            {item.type === "lost" ? "Lost" : "Found"}
                        </Badge>
                    </div>
                </div>
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                        <h3 className="line-clamp-1 text-lg font-semibold">{item.title}</h3>
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                        {item.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            <span>{item.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{item.location}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                    <Button asChild className="w-full" variant="outline">
                        <Link href={`/items/${item.id}`}>View Details</Link>
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    )
}
