from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uuid

app = FastAPI()

class Card(BaseModel):
    id: str
    front: str
    back: str

class Deck(BaseModel):
    id: str
    name: str
    cards: List[Card] = []

# In-memory storage (replace with a database in a production app)
decks = {}

@app.post("/decks", response_model=Deck)
async def create_deck(name: str):
    deck_id = str(uuid.uuid4())
    new_deck = Deck(id=deck_id, name=name)
    decks[deck_id] = new_deck
    return new_deck

@app.get("/decks", response_model=List[Deck])
async def get_decks():
    return list(decks.values())

@app.get("/decks/{deck_id}", response_model=Deck)
async def get_deck(deck_id: str):
    if deck_id not in decks:
        raise HTTPException(status_code=404, detail="Deck not found")
    return decks[deck_id]

@app.post("/decks/{deck_id}/cards", response_model=Card)
async def add_card(deck_id: str, front: str, back: str):
    if deck_id not in decks:
        raise HTTPException(status_code=404, detail="Deck not found")
    card_id = str(uuid.uuid4())
    new_card = Card(id=card_id, front=front, back=back)
    decks[deck_id].cards.append(new_card)
    return new_card

@app.get("/decks/{deck_id}/cards", response_model=List[Card])
async def get_cards(deck_id: str):
    if deck_id not in decks:
        raise HTTPException(status_code=404, detail="Deck not found")
    return decks[deck_id].cards

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)