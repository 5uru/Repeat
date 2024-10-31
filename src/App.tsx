import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Home } from './components/Home'
import { DeckView } from './components/DeckView'
import { Study } from './components/Study'
import { Button } from '@/components/ui/button'

export interface Deck {
    id: string;
    name: string;
    cards: Card[];
}

export interface Card {
    id: string;
    front: string;
    back: string;
}

export default function App() {
    const [decks, setDecks] = useState<Deck[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchDecks()
    }, [])

    const fetchDecks = async () => {
        try {
            const response = await fetch('http://localhost:8000/decks')
            if (!response.ok) {
                throw new Error('Failed to fetch decks')
            }
            const data = await response.json()
            setDecks(data)
        } catch (error) {
            console.error('Error fetching decks:', error)
            setError('Failed to load decks. Please try again later.')
        }
    }

    return (
        <Router>
            <div className="min-h-screen bg-background text-foreground">
                <header className="bg-primary text-primary-foreground p-4">
                    <nav className="container mx-auto flex justify-between items-center">
                        <Link to="/" className="text-2xl font-bold">Repeat</Link>
                        <Link to="/">
                            <Button variant="secondary">Home</Button>
                        </Link>
                    </nav>
                </header>
                <main className="container mx-auto p-4">
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    <Routes>
                        <Route path="/" element={<Home decks={decks} setDecks={setDecks} />} />
                        <Route path="/deck/:id" element={<DeckView decks={decks} setDecks={setDecks} />} />
                        <Route path="/study/:id" element={<Study decks={decks} />} />
                    </Routes>
                </main>
            </div>
        </Router>
    )
}