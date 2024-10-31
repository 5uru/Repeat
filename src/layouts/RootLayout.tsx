import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export function RootLayout() {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className={cn(
                        "container mx-auto py-6 px-8",
                        "min-h-screen"
                    )}>
                        <Outlet />
                    </div>
                </ScrollArea>
            </main>
        </div>
    )
}