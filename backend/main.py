# backend/main.py
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import uvicorn

from . import models, schemas
from .database import get_db, engine

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Repeat - Spaced Repetition System")

# CORS middleware configuration
app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
)

# Deck routes
@app.get("/decks/", response_model=List[schemas.DeckWithStats])
async def get_decks(db: Session = Depends(get_db)):
    decks = db.query(models.Deck).all()
    now = datetime.utcnow()

    result = []
    for deck in decks:
        card_count = len(deck.cards)
        due_cards = sum(1 for card in deck.cards
                        if card.next_review is None or card.next_review <= now)
        result.append({
                "id": deck.id,
                "name": deck.name,
                "created_at": deck.created_at,
                "card_count": card_count,
                "due_cards": due_cards
        })
    return result

@app.post("/decks/", response_model=schemas.DeckWithStats)
async def create_deck(deck: schemas.DeckCreate, db: Session = Depends(get_db)):
    db_deck = models.Deck(**deck.dict())
    db.add(db_deck)
    db.commit()
    db.refresh(db_deck)
    return {
            "id": db_deck.id,
            "name": db_deck.name,
            "created_at": db_deck.created_at,
            "card_count": 0,
            "due_cards": 0
    }

@app.get("/decks/{deck_id}", response_model=schemas.DeckWithStats)
async def get_deck(deck_id: int, db: Session = Depends(get_db)):
    deck = db.query(models.Deck).filter(models.Deck.id == deck_id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    now = datetime.utcnow()
    card_count = len(deck.cards)
    due_cards = sum(1 for card in deck.cards
                    if card.next_review is None or card.next_review <= now)

    return {
            "id": deck.id,
            "name": deck.name,
            "created_at": deck.created_at,
            "card_count": card_count,
            "due_cards": due_cards
    }

# Card routes
@app.get("/decks/{deck_id}/cards/", response_model=List[schemas.Card])
async def get_deck_cards(deck_id: int, db: Session = Depends(get_db)):
    cards = db.query(models.Card).filter(models.Card.deck_id == deck_id).all()
    return cards

@app.get("/decks/{deck_id}/due_cards/", response_model=List[schemas.Card])
async def get_due_cards(deck_id: int, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    cards = (db.query(models.Card)
             .filter(models.Card.deck_id == deck_id)
             .filter((models.Card.next_review <= now) |
                     (models.Card.next_review == None))
             .all())
    return cards

@app.post("/cards/", response_model=schemas.Card)
async def create_card(card: schemas.CardCreate, db: Session = Depends(get_db)):
    db_card = models.Card(**card.dict())
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card

@app.post("/cards/{card_id}/review", response_model=schemas.ReviewOut)
async def review_card(card_id: int, review: schemas.ReviewCreate,
                      db: Session = Depends(get_db)):
    card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    # Update card based on review quality
    if review.quality >= 3:  # Successful recall
        if card.interval == 0:
            card.interval = 1
        elif card.interval == 1:
            card.interval = 6
        else:
            card.interval = int(card.interval * card.ease_factor)
        card.ease_factor = min(2.5, card.ease_factor + 0.1)
    else:  # Failed recall
        card.interval = 0
        card.ease_factor = max(1.3, card.ease_factor - 0.2)

    card.next_review = datetime.utcnow() + timedelta(days=card.interval)

    # Create review record
    db_review = models.Review(
            card_id=card.id,
            quality=review.quality,
            reviewed_at=datetime.utcnow()
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)

    return db_review

# Statistics routes
@app.get("/statistics", response_model=schemas.StatisticsBase)
async def get_statistics(db: Session = Depends(get_db)):
    total_cards = db.query(models.Card).count()
    cards_learned = db.query(models.Card).filter(models.Card.interval > 0).count()

    # Calculate daily stats for the last 7 days
    now = datetime.utcnow()
    seven_days_ago = now - timedelta(days=7)
    daily_reviews = db.query(models.Review) \
        .filter(models.Review.reviewed_at >= seven_days_ago) \
        .all()

    daily_stats = {}
    for review in daily_reviews:
        date = review.reviewed_at.date().isoformat()
        if date not in daily_stats:
            daily_stats[date] = {'date': date, 'cardsReviewed': 0}
        daily_stats[date]['cardsReviewed'] += 1

    # Calculate average accuracy
    total_reviews = len(daily_reviews)
    successful_reviews = sum(1 for review in daily_reviews if review.quality >= 3)
    average_accuracy = (successful_reviews / total_reviews * 100) if total_reviews > 0 else 0

    return {
            "total_cards": total_cards,
            "cards_learned": cards_learned,
            "average_accuracy": average_accuracy,
            "daily_stats": list(daily_stats.values())
    }

# Settings routes
@app.get("/settings", response_model=schemas.Settings)
async def get_settings(db: Session = Depends(get_db)):
    settings = db.query(models.Settings).first()
    if not settings:
        settings = models.Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@app.post("/settings", response_model=schemas.Settings)
async def update_settings(settings_update: schemas.SettingsBase,
                          db: Session = Depends(get_db)):
    settings = db.query(models.Settings).first()
    if not settings:
        settings = models.Settings(**settings_update.dict())
        db.add(settings)
    else:
        for key, value in settings_update.dict().items():
            setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)