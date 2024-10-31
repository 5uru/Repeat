const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    async getDueCards(deckId) {
        const response = await fetch(`http://localhost:8000/decks/${deckId}/due_cards/`);
        return response.json();
    },

    async reviewCard(cardId, quality) {
        const response = await fetch(`http://localhost:8000/cards/${cardId}/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quality }),
        });
        return response.json();
    },

    async createDeck(name) {
        const response = await fetch('http://localhost:8000/decks/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
        });
        return response.json();
    },

    async createCard(deckId, front, back) {
        const response = await fetch(`http://localhost:8000/decks/${deckId}/cards/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ front, back }),
        });
        return response.json();
    },
});