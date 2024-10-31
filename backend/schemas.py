# backend/schemas.py
from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class SettingsBase(BaseModel):
    notifications_enabled: bool = True
    cards_per_day: int = 20
    dark_mode: bool = False

class Settings(SettingsBase):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)

class CardBase(BaseModel):
    front: str
    back: str

class CardCreate(CardBase):
    deck_id: int

class Card(CardBase):
    id: int
    deck_id: int
    created_at: datetime
    next_review: Optional[datetime] = None
    ease_factor: float = 2.5
    interval: int = 0
    model_config = ConfigDict(from_attributes=True)

class DeckBase(BaseModel):
    name: str

class DeckCreate(DeckBase):
    pass

class DeckWithStats(DeckBase):
    id: int
    created_at: datetime
    card_count: int
    due_cards: int
    model_config = ConfigDict(from_attributes=True)

class ReviewCreate(BaseModel):
    quality: int  # 1-5 rating

class ReviewOut(ReviewCreate):
    id: int
    card_id: int
    reviewed_at: datetime
    model_config = ConfigDict(from_attributes=True)

class StatisticsBase(BaseModel):
    total_cards: int
    cards_learned: int
    average_accuracy: float
    daily_stats: List[dict]