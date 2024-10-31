import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Play, Edit, Trash2, MoreVertical, Plus } from 'lucide-react'
import { api, type Card as CardType } from '@/lib/api'

export function Deck() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [cards, setCards] = useState<CardType[]>([])
    const [deckName, setDeckName] = useState('')
    const [showAddCard, setShowAddCard] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [editingCard, setEditingCard] = useState<CardType | null>(null)
    const [newCard, setNewCard] = useState({ front: '', back: '' })
    const [cardToDelete, setCardToDelete] = useState<number | null>(null)

    useEffect(() => {
        if (id) {
            fetchDeckData()
        }
    }, [id])

    const fetchDeckData = async () => {
        try {
            const [cards, deck] = await Promise.all([
                api.getDeckCards(Number(id)),
                api.getDeckDetails(Number(id))
            ])
            setCards(cards)
            setDeckName(deck.name)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load deck data',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddCard = async () => {
        if (!newCard.front.trim() || !newCard.back.trim()) return

        try {
            const card = await api.createCard(Number(id), newCard.front, newCard.back)
            setCards([...cards, card])
            setNewCard({ front: '', back: '' })
            setShowAddCard(false)
            toast({
                title: 'Success',
                description: 'Card added successfully',
            })
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to add card',
                variant: 'destructive',
            })
        }
    }

    const handleEditCard = async (cardId: number) => {
        if (!editingCard) return

        try {
            const updatedCard = await api.updateCard(
                cardId,
                editingCard.front,
                editingCard.back
            )
            setCards(cards.map(card =>
                card.id === cardId ? updatedCard : card
            ))
            setEditingCard(null)
            toast({
                title: 'Success',
                description: 'Card updated successfully',
            })
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update card',
                variant: 'destructive',
            })
        }
    }

    const handleDeleteCard = async (cardId: number) => {
        try {
            await api.deleteCard(cardId)
            setCards(cards.filter(card => card.id !== cardId))
            setCardToDelete(null)
            setShowDeleteConfirm(false)
            toast({
                title: 'Success',
                description: 'Card deleted successfully',
            })
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete card',
                variant: 'destructive',
            })
        }
    }

    if (isLoading) {
        return <DeckSkeleton />
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{deckName}</h1>
                <div className="flex gap-4">
                    <Button onClick={() => setShowAddCard(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Card
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => navigate(`/study/${id}`)}
                    >
                        <Play className="mr-2 h-4 w-4" />
                        Start Study
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {cards.map(card => (
                    <CardItem
                        key={card.id}
                        card={card}
                        onEdit={() => setEditingCard(card)}
                        onDelete={() => {
                            setCardToDelete(card.id)
                            setShowDeleteConfirm(true)
                        }}
                    />
                ))}
            </div>

            {/* Add Card Dialog */}
            <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Card</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="front">Front</Label>
                            <Input
                                id="front"
                                value={newCard.front}
                                onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                                placeholder="Enter the question or prompt"
                            />
                        </div>
                        <div>
                            <Label htmlFor="back">Back</Label>
                            <Textarea
                                id="back"
                                value={newCard.back}
                                onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                                placeholder="Enter the answer"
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddCard(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddCard}>Add Card</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Card Dialog */}
            <Dialog
                open={editingCard !== null}
                onOpenChange={() => setEditingCard(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Card</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-front">Front</Label>
                            <Input
                                id="edit-front"
                                value={editingCard?.front || ''}
                                onChange={(e) => setEditingCard(editingCard
                                    ? { ...editingCard, front: e.target.value }
                                    : null
                                )}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-back">Back</Label>
                            <Textarea
                                id="edit-back"
                                value={editingCard?.back || ''}
                                onChange={(e) => setEditingCard(editingCard
                                    ? { ...editingCard, back: e.target.value }
                                    : null
                                )}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditingCard(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => editingCard && handleEditCard(editingCard.id)}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Card</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this card? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowDeleteConfirm(false)
                                setCardToDelete(null)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => cardToDelete && handleDeleteCard(cardToDelete)}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

interface CardItemProps {
    card: CardType
    onEdit: () => void
    onDelete: () => void
}

function CardItem({ card, onEdit, onDelete }: CardItemProps) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <p className="font-medium">{card.front}</p>
                        <p className="text-muted-foreground">{card.back}</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={onDelete}
                                className="text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    )
}

function DeckSkeleton() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <Skeleton className="h-10 w-48" />
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
            <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}