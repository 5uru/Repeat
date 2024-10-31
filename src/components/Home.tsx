import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Deck } from '../App'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface HomeProps {
    decks: Deck[];
    setDecks: React.Dispatch<React.SetStateAction<Deck[]>>;
}

export function Home({ decks, setDecks }: HomeProps) {
    const [newDeckName, setNewDeckName] = useState('')

    const handleCreateDeck = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newDeckName.trim()) {
            try {
                const response = await fetch('http://localhost:8000/decks?name=' + encodeURIComponent(newDeckName), {
                    method: 'POST',
                })
                if (!response.ok) {
                    throw new Error('Failed to create deck')
                }
                const newDeck = await response.json()
                setDecks([...decks, newDeck])
                setNewDeckName('')
            } catch (error) {
                console.error('Error creating deck:', error)
            }
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Your Decks</h1>
            <form onSubmit={handleCreateDeck} className="flex gap-2">
                <div className="flex-grow">
                    <Label htmlFor="new-deck-name" className="sr-only">New Deck Name</Label>
                    <Input
                        id="new-deck-name"
                        value={newDeckName}
                        onChange={(e) => setNewDeckName(e.target.value)}
                        placeholder="Enter new deck name"
                    />
                </div>
                <Button type="submit">Create Deck</Button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {decks.map((deck) => (
                    <Card key={deck.id}>
                        <CardContent className="p-4">
                            <h2 className="text-xl font-semibold">{deck.name}</h2>
                            <p className="text-muted-foreground">{deck.cards.length} cards</p>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Link to={`/deck/${deck.id}`}>
                                <Button variant="outline">View Deck</Button>
                            </Link>
                            <Link to={`/study/${deck.id}`}>
                                <Button>Study</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}