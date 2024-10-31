# backend/models.py
from sqlalchemy import Column, ForeignKey, Integer, String, Float, DateTime, Boolean, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    settings = relationship("Settings", back_populates="user", uselist=False)
    decks = relationship("Deck", back_populates="user")

class Settings(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    notifications_enabled = Column(Boolean, default=True)
    cards_per_day = Column(Integer, default=20)
    dark_mode = Column(Boolean, default=False)
    user = relationship("User", back_populates="settings")

class Deck(Base):
    __tablename__ = "decks"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="decks")
    cards = relationship("Card", back_populates="deck", cascade="all, delete-orphan")

class Card(Base):
    __tablename__ = "cards"
    id = Column(Integer, primary_key=True, index=True)
    deck_id = Column(Integer, ForeignKey("decks.id"))
    front = Column(String)
    back = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    next_review = Column(DateTime, nullable=True)
    ease_factor = Column(Float, default=2.5)
    interval = Column(Integer, default=0)
    deck = relationship("Deck", back_populates="cards")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"))
    quality = Column(Integer)  # 1-5 rating
    reviewed_at = Column(DateTime, default=datetime.utcnow)
    card = relationship("Card")