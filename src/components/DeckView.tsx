import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Deck, Card } from '../App'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card as UICard, CardContent, CardFooter } from '@/components/ui/card'

interface DeckViewProps {
    decks: Deck[];
    setDecks: React.Dispatch<React.SetStateAction<Deck[]>>;
}

export function DeckView({ decks, setDecks }: DeckViewProps) {
    const { id } = useParams<{ id: string }>()
    const [deck, setDeck] = useState<Deck | null>(null)
    const [newCard, setNewCard] = useState({ front: '', back: '' })

    useEffect(() => {

        const currentDeck = decks.find(d => d.id === id)
        if (currentDeck) {
            setDeck(currentDeck)
        }
    }, [id, decks])

    const handleAddCard = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newCard.front && newCard.back && deck) {
            try {
                const response = await fetch(`http://localhost:8000/decks/${deck.id}/cards?front=${encodeURIComponent(newCard.front)}&back=${encodeURIComponent(newCard.back)}`, {
                    method: 'POST',
                })
                if (!response.ok) {
                    throw new Error('Failed to add card')
                }
                const addedCard = await response.json()
                const updatedDeck = { ...deck, cards: [...deck.cards, addedCard] }
                setDeck(updatedDeck)
                setDecks(decks.map(d => d.id === deck.id ? updatedDeck : d))
                setNewCard({ front: '', back: '' })
            } catch (error) {
                console.error('Error adding card:', error)
            }
        }
    }

    if (!deck) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">{deck.name}</h1>
            <Link to={`/study/${deck.id}`}>
                <Button>Study Deck</Button>
            </Link>
            <form onSubmit={handleAddCard} className="space-y-4">
                <div>
                    <Label htmlFor="card-front">Front</Label>
                    <Input
                        id="card-front"
                        value={newCard.front}
                        onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                        placeholder="Front of card"
                    />
                </div>
                <div>
                    <Label htmlFor="card-back">Back</Label>
                    <Textarea
                        id="card-back"
                        value={newCard.back}
                        onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                        placeholder="Back of card"
                    />
                </div>
                <Button type="submit">Add Card</Button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deck.cards.map((card: Card) => (
                    <UICard key={card.id}>
                        <CardContent className="p-4">
                            <p className="font-semibold">Front: {card.front}</p>
                            <p className="text-muted-foreground">Back: {card.back}</p>
                        </CardContent>
                    </UICard>
                ))}
            </div>
        </div>
    )
}