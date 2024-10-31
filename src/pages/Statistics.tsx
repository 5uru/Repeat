import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Brain, Trophy, Clock, Target, Calendar } from 'lucide-react'

interface StatsData {
    totalCards: number
    cardsLearned: number
    averageAccuracy: number
    dailyStats: Array<{
        date: string
        cardsReviewed: number
    }>
    reviewsByDay: Array<{
        day: string
        reviews: number
        accuracy: number
    }>
    timeSpent: number
    streak: number
}

type TimeRange = '7days' | '30days' | '90days' | '365days'

export function Statistics() {
    const [isLoading, setIsLoading] = useState(true)
    const [timeRange, setTimeRange] = useState<TimeRange>('30days')
    const [stats, setStats] = useState<StatsData | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        fetchStats()
    }, [timeRange])

    const fetchStats = async () => {
        setIsLoading(true)
        try {
            const data = await api.getStatistics()
            setStats({
                totalCards: data.totalCards,
                cardsLearned: data.cardsLearned,
                averageAccuracy: data.averageAccuracy,
                dailyStats: data.dailyStats,
                reviewsByDay: formatReviewData(data.dailyStats),
                timeSpent: calculateTotalTime(data.dailyStats),
                streak: calculateStreak(data.dailyStats)
            })
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load statistics',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const formatReviewData = (dailyStats: any[]) => {
        // Format data for the charts
        return dailyStats.map(stat => ({
            day: new Date(stat.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
            }),
            reviews: stat.cardsReviewed,
            accuracy: stat.accuracy || 0
        }))
    }

    const calculateTotalTime = (dailyStats: any[]) => {
        return dailyStats.reduce((acc, stat) => acc + (stat.timeSpent || 0), 0)
    }

    const calculateStreak = (dailyStats: any[]) => {
        let streak = 0
        const today = new Date()

        for (let i = dailyStats.length - 1; i >= 0; i--) {
            const statDate = new Date(dailyStats[i].date)
            const diffDays = Math.floor(
                (today.getTime() - statDate.getTime()) / (1000 * 60 * 60 * 24)
            )

            if (diffDays === streak && dailyStats[i].cardsReviewed > 0) {
                streak++
            } else {
                break
            }
        }

        return streak
    }

    if (isLoading) {
        return <StatisticsSkeleton />
    }

    if (!stats) {
        return null
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Statistics</h1>
                <Select
                    value={timeRange}
                    onValueChange={(value) => setTimeRange(value as TimeRange)}
                >
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7days">Last 7 days</SelectItem>
                        <SelectItem value="30days">Last 30 days</SelectItem>
                        <SelectItem value="90days">Last 90 days</SelectItem>
                        <SelectItem value="365days">Last year</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Cards"
                    value={stats.totalCards}
                    icon={<Brain className="h-6 w-6" />}
                />
                <StatCard
                    title="Cards Learned"
                    value={stats.cardsLearned}
                    percentage={(stats.cardsLearned / stats.totalCards) * 100}
                    icon={<Trophy className="h-6 w-6" />}
                />
                <StatCard
                    title="Study Streak"
                    value={stats.streak}
                    suffix="days"
                    icon={<Calendar className="h-6 w-6" />}
                />
                <StatCard
                    title="Average Accuracy"
                    value={Math.round(stats.averageAccuracy)}
                    suffix="%"
                    icon={<Target className="h-6 w-6" />}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Reviews Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Reviews</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.reviewsByDay}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="day"
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis />
                                <Tooltip />
                                <Bar
                                    dataKey="reviews"
                                    fill="hsl(var(--primary))"
                                    name="Reviews"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Accuracy Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Accuracy Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.reviewsByDay}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="day"
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="accuracy"
                                    stroke="hsl(var(--primary))"
                                    name="Accuracy"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

interface StatCardProps {
    title: string
    value: number
    icon: React.ReactNode
    suffix?: string
    percentage?: number
}

function StatCard({ title, value, icon, suffix, percentage }: StatCardProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
                    {icon}
                </div>
                <div className="space-y-2">
                    <p className="text-3xl font-bold">
                        {value.toLocaleString()}{suffix && ` ${suffix}`}
                    </p>
                    {percentage !== undefined && (
                        <Progress value={percentage} className="h-2" />
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function StatisticsSkeleton() {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-36" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array(4).fill(0).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-6 rounded-full" />
                            </div>
                            <Skeleton className="h-8 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array(2).fill(0).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-80 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}