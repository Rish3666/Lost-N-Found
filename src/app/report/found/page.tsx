"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/image-upload"
import DynamicMap from "@/components/dynamic-map"

import { supabase } from "@/lib/supabase"

const CATEGORIES = [
    "Electronics",
    "Clothing",
    "Accessories",
    "Books",
    "IDs/Documents",
    "Bags",
    "Sports Equipment",
    "Other",
]

export default function ReportFoundPage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const [formData, setFormData] = React.useState({
        title: "",
        description: "",
        category: "",
        location: "",
        coordinates: null as [number, number] | null,
        date: "",
        isWithSecurity: false,
        images: [] as string[],
    })

    React.useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        }
    }, [user, isLoading, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        if (!user) {
            router.push("/login")
            return
        }

        try {
            const { error } = await supabase.from("items").insert({
                title: formData.title,
                description: formData.description,
                category: formData.category,
                location: formData.location,
                coordinates: formData.coordinates,
                date_lost_found: formData.date,
                image_url: formData.images[0] || null,
                type: "found",
                status: "active",
                user_id: user.id,
            })

            if (error) throw error

            alert("Found item posted successfully!")
            router.push("/")
        } catch (error) {
            console.error("Error posting found item:", error)
            alert("Failed to post found item. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading || !user) {
        return <div className="flex min-h-screen items-center justify-center">Loading...</div>
    }

    return (
        <div className="container mx-auto max-w-2xl py-8 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>Post Found Item</CardTitle>
                    <CardDescription>
                        Help return this item to its owner by providing details.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Photos</Label>
                            <ImageUpload
                                value={formData.images}
                                onChange={(images) => setFormData({ ...formData, images })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Item Name</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Black Umbrella"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
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

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the item (condition, specific features...)"
                                className="min-h-[100px]"
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="location">Found Location</Label>
                                <Input
                                    id="location"
                                    placeholder="e.g., Cafeteria Table 5"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Date Found</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1 pt-2">
                            <Label className="text-xs text-muted-foreground">Pinpoint on Map (Optional)</Label>
                            <DynamicMap
                                selectedLocation={formData.coordinates}
                                onLocationSelect={(lat, lng) => setFormData({ ...formData, coordinates: [lat, lng] })}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="security"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={formData.isWithSecurity}
                                onChange={(e) => setFormData({ ...formData, isWithSecurity: e.target.checked })}
                            />
                            <Label htmlFor="security">I have handed this item to Security/Lost & Found Office</Label>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Posting..." : "Post Found Item"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
