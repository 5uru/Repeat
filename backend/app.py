from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

class Flashcard(BaseModel):
    id: int
    question: str
    answer: str

flashcards = []

@app.get("/")
def read_root():
    return {"message": "Welcome to Repeat"}

@app.get("/flashcards", response_model=List[Flashcard])
def get_flashcards():
    return flashcards

@app.post("/flashcards", response_model=Flashcard)
def create_flashcard(flashcard: Flashcard):
    flashcards.append(flashcard)
    return flashcard
