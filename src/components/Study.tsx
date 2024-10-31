import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Deck, Card } from '../App'
import { Button } from '@/components/ui/button'
import { Card as UICard, CardContent, CardFooter } from '@/components/ui/card'

interface StudyProps {
    decks: Deck[];
}

export function Study({ decks }: StudyProps) {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [deck, setDeck] = useState<Deck | null>(null)
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [showAnswer, setShowAnswer] = useState(false)

    useEffect(() => {
        const currentDeck = decks.find(d => d.id === id)
        if (currentDeck) {
            setDeck(currentDeck)
        }
    }, [id, decks])

    const handleShowAnswer = () => setShowAnswer(true)

    const handleNextCard = () => {
        setShowAnswer(false)
        if (deck && currentCardIndex < deck.cards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1)
        } else {
            navigate(`/deck/${id}`)
        }
    }

    if (!deck || deck.cards.length === 0) {
        return <div>No cards to study.</div>
    }

    const currentCard = deck.cards[currentCardIndex]

    return (
        <div className="max-w-md mx-auto space-y-6">
            <h1 className="text-3xl font-bold">{deck.name} - Study</h1>
            <UICard>
                <CardContent className="p-6">
                    <p className="text-xl mb-4">Card {currentCardIndex + 1} of {deck.cards.length}</p>
                    <p className="text-2xl font-semibold">{currentCard.front}</p>
                    {showAnswer && (
                        <div className="mt-4 p-4 bg-muted rounded-md">
                            <p className="text-xl">{currentCard.back}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    {!showAnswer ? (
                        <Button onClick={handleShowAnswer} className="w-full">Show Answer</Button>
                    ) : (
                        <Button onClick={handleNextCard} className="w-full">Next Card</Button>
                    )}
                </CardFooter>
            </UICard>
        </div>
    )
}