import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
    ArrowRight,
    ThumbsUp,
    ThumbsDown,
    Timer,
    ArrowLeft,
    X
} from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/components/ui/use-toast'
import { api, type Card as CardType } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'

interface StudySession {
    startTime: Date
    cardsStudied: number
    correctAnswers: number
    totalTime: number
}

export function Study() {
    const { deckId } = useParams<{ deckId: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()

    const [isLoading, setIsLoading] = useState(true)
    const [cards, setCards] = useState<CardType[]>([])
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [showAnswer, setShowAnswer] = useState(false)
    const [progress, setProgress] = useState(0)
    const [showExitDialog, setShowExitDialog] = useState(false)
    const [session, setSession] = useState<StudySession>({
        startTime: new Date(),
        cardsStudied: 0,
        correctAnswers: 0,
        totalTime: 0
    })
    const [studyTimer, setStudyTimer] = useState<NodeJS.Timer>()

    useEffect(() => {
        fetchCards()
        // Start session timer
        const timer = setInterval(() => {
            setSession(prev => ({
                ...prev,
                totalTime: Math.floor(
                    (new Date().getTime() - prev.startTime.getTime()) / 1000
                )
            }))
        }, 1000)
        setStudyTimer(timer)

        return () => {
            if (timer) clearInterval(timer)
        }
    }, [deckId])

    const fetchCards = async () => {
        if (!deckId) return
        setIsLoading(true)
        try {
            const dueCards = await api.getDueCards(Number(deckId))
            setCards(dueCards)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load study cards',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleShowAnswer = () => setShowAnswer(true)

    const handleReview = async (quality: number) => {
        if (!cards[currentCardIndex]) return

        try {
            await api.reviewCard(cards[currentCardIndex].id, quality)

            setSession(prev => ({
                ...prev,
                cardsStudied: prev.cardsStudied + 1,
                correctAnswers: prev.correctAnswers + (quality >= 3 ? 1 : 0)
            }))

            if (currentCardIndex < cards.length - 1) {
                setCurrentCardIndex(prev => prev + 1)
                setShowAnswer(false)
                setProgress(((currentCardIndex + 1) / cards.length) * 100)
            } else {
                handleSessionComplete()
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to record review',
                variant: 'destructive',
            })
        }
    }

    const handleSessionComplete = () => {
        if (studyTimer) clearInterval(studyTimer)

        toast({
            title: 'Study Session Complete! 🎉',
            description: `You reviewed ${session.cardsStudied} cards with ${
                Math.round((session.correctAnswers / session.cardsStudied) * 100)
            }% accuracy.`,
        })

        navigate(`/deck/${deckId}`)
    }

    const handleExit = () => {
        setShowExitDialog(true)
    }

    if (isLoading) {
        return <StudySkeleton />
    }

    if (cards.length === 0) {
        return (
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-3xl font-bold mb-4">No Cards Due</h1>
                <p className="text-muted-foreground mb-8">
                    Great job! You've completed all your reviews for now.
                </p>
                <Button onClick={() => navigate(`/deck/${deckId}`)}>
                    Return to Deck
                </Button>
            </div>
        )
    }

    const currentCard = cards[currentCardIndex]
    const formattedTime = new Date(session.totalTime * 1000)
        .toISOString()
        .substr(14, 5)

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <Button
                    variant="outline"
                    onClick={handleExit}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Exit
                </Button>
                <div className="flex items-center text-muted-foreground">
                    <Timer className="mr-2 h-4 w-4" />
                    {formattedTime}
                </div>
            </div>

            <Progress value={progress} className="mb-8" />

            <Card className="mb-8">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-sm text-muted-foreground">
                            Card {currentCardIndex + 1} of {cards.length}
                        </h2>
                        <span className="text-sm text-muted-foreground">
              {Math.round((session.correctAnswers / (currentCardIndex + 1)) * 100)}% accuracy
            </span>
                    </div>

                    <div className="min-h-[200px] flex flex-col justify-center">
                        <p className="text-xl text-center mb-4">{currentCard.front}</p>
                        {showAnswer && (
                            <div className="mt-4 p-4 bg-muted rounded-lg">
                                <p className="text-lg text-center">{currentCard.back}</p>
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between items-center p-4">
                    {!showAnswer ? (
                        <Button
                            className="w-full"
                            onClick={handleShowAnswer}
                        >
                            Show Answer
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <div className="flex w-full space-x-4">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleReview(1)}
                            >
                                <ThumbsDown className="mr-2 h-4 w-4" />
                                Again
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleReview(3)}
                            >
                                Hard
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={() => handleReview(4)}
                            >
                                Good
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={() => handleReview(5)}
                            >
                                <ThumbsUp className="mr-2 h-4 w-4" />
                                Easy
                            </Button>
                        </div>
                    )}
                </CardFooter>
            </Card>

            <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Exit Study Session?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your progress will be saved, but the session will end.
                            Are you sure you want to exit?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Continue Studying</AlertDialogCancel>
                        <AlertDialogAction onClick={() => navigate(`/deck/${deckId}`)}>
                            Exit Session
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function StudySkeleton() {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-6 w-20" />
            </div>

            <Skeleton className="h-2 w-full mb-8" />

            <Card>
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>

                    <div className="min-h-[200px] flex flex-col justify-center space-y-4">
                        <Skeleton className="h-8 w-3/4 mx-auto" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </CardContent>

                <CardFooter className="p-4">
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        </div>
    )
}