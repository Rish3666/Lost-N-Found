"use client"

import dynamic from "next/dynamic"

const Map = dynamic(() => import("./map"), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full animate-pulse bg-muted" />,
})

export default Map
