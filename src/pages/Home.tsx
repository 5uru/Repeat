import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Plus, Play, Trophy, Calendar } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import type { Deck } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'

export function Home() {
    const [decks, setDecks] = useState<Deck[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [newDeckName, setNewDeckName] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [stats, setStats] = useState({
        totalCards: 0,
        cardsReviewed: 0,
        streak: 0
    })
    const { toast } = useToast()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [decksData, statsData] = await Promise.all([
                api.getDecks(),
                api.getStatistics()
            ])

            setDecks(decksData)
            setStats({
                totalCards: statsData.totalCards,
                cardsReviewed: statsData.dailyStats[statsData.dailyStats.length - 1]?.cardsReviewed || 0,
                streak: calculateStreak(statsData.dailyStats)
            })
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load data. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const calculateStreak = (dailyStats: Array<{ date: string; cardsReviewed: number }>) => {
        let streak = 0
        const today = new Date()

        for (let i = dailyStats.length - 1; i >= 0; i--) {
            const statDate = new Date(dailyStats[i].date)
            const diffDays = Math.floor((today.getTime() - statDate.getTime()) / (1000 * 60 * 60 * 24))

            if (diffDays === streak && dailyStats[i].cardsReviewed > 0) {
                streak++
            } else {
                break
            }
        }

        return streak
    }

    const handleCreateDeck = async () => {
        if (!newDeckName.trim()) return

        setIsCreating(true)
        try {
            const newDeck = await api.createDeck(newDeckName)
            setDecks([...decks, newDeck])
            setNewDeckName('')
            toast({
                title: 'Success',
                description: `${newDeckName} has been created.`,
            })
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create deck. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl font-bold">Welcome back!</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Cards"
                    value={stats.totalCards}
                    icon={<Trophy className="h-6 w-6" />}
                    isLoading={isLoading}
                />
                <StatsCard
                    title="Reviewed Today"
                    value={stats.cardsReviewed}
                    icon={<Calendar className="h-6 w-6" />}
                    isLoading={isLoading}
                />
                <StatsCard
                    title="Current Streak"
                    value={stats.streak}
                    suffix="days"
                    icon={<Trophy className="h-6 w-6" />}
                    isLoading={isLoading}
                />
            </div>

            {/* Decks Grid */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Your Decks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isLoading ? (
                        Array(4).fill(0).map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-6">
                                    <Skeleton className="h-6 w-1/3 mb-4" />
                                    <Skeleton className="h-4 w-1/2 mb-2" />
                                    <Skeleton className="h-2 w-full" />
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <>
                            {decks.map(deck => (
                                <DeckCard key={deck.id} deck={deck} />
                            ))}
                            <CreateDeckCard
                                newDeckName={newDeckName}
                                setNewDeckName={setNewDeckName}
                                onCreateDeck={handleCreateDeck}
                                isCreating={isCreating}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

interface StatsCardProps {
    title: string
    value: number
    icon: React.ReactNode
    suffix?: string
    isLoading?: boolean
}

function StatsCard({ title, value, icon, suffix, isLoading }: StatsCardProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                    {icon}
                </div>
                {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                ) : (
                    <p className="text-3xl font-bold">
                        {value.toLocaleString()}{suffix && ` ${suffix}`}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

interface DeckCardProps {
    deck: Deck
}

function DeckCard({ deck }: DeckCardProps) {
    const progress = (deck.cardCount > 0)
        ? ((deck.cardCount - deck.dueCards) / deck.cardCount) * 100
        : 0

    return (
        <Card>
            <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{deck.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    {deck.cardCount} cards • {deck.dueCards} due
                </p>
                <Progress value={progress} className="mb-4" />
            </CardContent>
            <CardFooter className="bg-muted p-4">
                <Link to={`/study/${deck.id}`} className="w-full">
                    <Button className="w-full">
                        <Play className="mr-2 h-4 w-4" /> Start Review
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}

interface CreateDeckCardProps {
    newDeckName: string
    setNewDeckName: (name: string) => void
    onCreateDeck: () => void
    isCreating: boolean
}

function CreateDeckCard({
                            newDeckName,
                            setNewDeckName,
                            onCreateDeck,
                            isCreating
                        }: CreateDeckCardProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card className="flex items-center justify-center cursor-pointer hover:bg-accent transition-colors">
                    <CardContent className="p-6 text-center">
                        <Plus className="h-12 w-12 text-muted-foreground mb-2 mx-auto" />
                        <p className="text-lg font-semibold">Create New Deck</p>
                    </CardContent>
                </Card>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Deck</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="deck-name">Deck Name</Label>
                    <Input
                        id="deck-name"
                        value={newDeckName}
                        onChange={(e) => setNewDeckName(e.target.value)}
                        placeholder="Enter deck name..."
                        disabled={isCreating}
                    />
                </div>
                <Button
                    onClick={onCreateDeck}
                    disabled={!newDeckName.trim() || isCreating}
                >
                    {isCreating ? 'Creating...' : 'Create Deck'}
                </Button>
            </DialogContent>
        </Dialog>
    )
}