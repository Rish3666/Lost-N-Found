"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

interface AuthContextType {
    user: User | null
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    register: (email: string, password: string, fullName: string) => Promise<void>
    isLoading: boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const router = useRouter()

    React.useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user ?? null)
                setIsLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const login = async (email: string, password: string) => {
        setIsLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setIsLoading(false)
            throw error
        }
    }

    const logout = async () => {
        setIsLoading(true)
        await supabase.auth.signOut()
        router.push("/login")
        setIsLoading(false)
    }

    const register = async (email: string, password: string, fullName: string) => {
        setIsLoading(true)

        // Basic validation for .edu email
        if (!email.endsWith(".edu")) {
            setIsLoading(false)
            throw new Error("Please use a valid .edu university email address.")
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        })

        if (error) {
            setIsLoading(false)
            throw error
        }

        setIsLoading(false)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = React.useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
