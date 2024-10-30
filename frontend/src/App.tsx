import React, { useState, useEffect } from 'react';
import { Button, Card, Input } from 'shadcn-ui';
import axios from 'axios';

const App = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      const response = await axios.get('http://localhost:5000/flashcards');
      setFlashcards(response.data);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    }
  };

  const createFlashcard = async () => {
    try {
      const response = await axios.post('http://localhost:5000/flashcards', {
        question,
        answer,
      });
      setFlashcards([...flashcards, response.data.data]);
      setQuestion('');
      setAnswer('');
    } catch (error) {
      console.error('Error creating flashcard:', error);
    }
  };

  return (
    <div className="app">
      <h1>Repeat</h1>
      <div className="flashcard-form">
        <Input
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <Input
          placeholder="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <Button onClick={createFlashcard}>Create Flashcard</Button>
      </div>
      <div className="flashcards">
        {flashcards.map((flashcard) => (
          <Card key={flashcard.id}>
            <p>Question: {flashcard.question}</p>
            <p>Answer: {flashcard.answer}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default App;
