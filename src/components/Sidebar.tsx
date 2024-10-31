import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
    Home,
    Layers,
    BarChart2,
    Settings,
    BookOpen,
    Calendar,
    Star,
    Bell
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { api } from '@/lib/api'

interface NavItemProps {
    to: string
    icon: React.ReactNode
    label: string
    badge?: number
}

const NavItem = ({ to, icon, label, badge }: NavItemProps) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <NavLink
                    to={to}
                    className={({ isActive }) =>
                        cn(
                            "flex items-center justify-between w-full p-2 rounded-lg transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                        )
                    }
                >
                    <div className="flex items-center gap-3">
                        {icon}
                        <span className="text-sm font-medium">{label}</span>
                    </div>
                    {badge !== undefined && badge > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                            {badge}
                        </Badge>
                    )}
                </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right">
                {label}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
)

export function Sidebar() {
    const [dueCards, setDueCards] = useState(0)
    const [isCollapsed, setIsCollapsed] = useState(false)

    useEffect(() => {
        const fetchDueCards = async () => {
            try {
                const decks = await api.getDecks()
                const totalDue = decks.reduce((sum, deck) => sum + deck.dueCards, 0)
                setDueCards(totalDue)
            } catch (error) {
                console.error('Failed to fetch due cards:', error)
            }
        }

        fetchDueCards()
        // Set up polling for due cards every 5 minutes
        const interval = setInterval(fetchDueCards, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <aside className={cn(
            "flex flex-col h-screen bg-card border-r",
            isCollapsed ? "w-[60px]" : "w-64",
            "transition-all duration-300 ease-in-out"
        )}>
            {/* App Logo/Title */}
            <div className="p-4 border-b">
                <div className="flex items-center space-x-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    {!isCollapsed && <span className="text-lg font-bold">Repeat</span>}
                </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-2 space-y-1">
                <NavItem
                    to="/"
                    icon={<Home className="h-5 w-5" />}
                    label="Home"
                />
                <NavItem
                    to="/study"
                    icon={<Star className="h-5 w-5" />}
                    label="Study"
                    badge={dueCards}
                />
                <NavItem
                    to="/decks"
                    icon={<Layers className="h-5 w-5" />}
                    label="Decks"
                />
                <NavItem
                    to="/calendar"
                    icon={<Calendar className="h-5 w-5" />}
                    label="Calendar"
                />
                <NavItem
                    to="/statistics"
                    icon={<BarChart2 className="h-5 w-5" />}
                    label="Statistics"
                />
            </nav>

            {/* Bottom Section */}
            <div className="p-2 border-t space-y-1">
                <NavItem
                    to="/notifications"
                    icon={<Bell className="h-5 w-5" />}
                    label="Notifications"
                />
                <NavItem
                    to="/settings"
                    icon={<Settings className="h-5 w-5" />}
                    label="Settings"
                />
            </div>

            {/* Collapse Button */}
            <Button
                variant="ghost"
                size="icon"
                className="m-2"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                ) : (
                    <ChevronLeft className="h-4 w-4" />
                )}
            </Button>
        </aside>
    )
}

// Add these imports at the top
import { ChevronLeft, ChevronRight } from 'lucide-react'