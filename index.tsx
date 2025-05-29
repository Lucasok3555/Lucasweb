/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import ReactDOM from 'react-dom/client';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

function App() {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const chatInstance = ai.chats.create({
        model: 'gemini-2.5-flash-preview-04-17',
        config: {
          systemInstruction: 'You are a helpful and friendly chat assistant.',
        },
      });
      setChat(chatInstance);
    } catch (e) {
      console.error("Failed to initialize Gemini chat:", e);
      setError("Failed to initialize AI. Please check your API key and network connection.");
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !chat || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      text: userInput.trim(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const stream = await chat.sendMessageStream({ message: userMessage.text });
      let currentText = '';
      const modelMessageId = Date.now().toString() + '-model';

      // Add a placeholder for the model's message
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: modelMessageId, role: 'model', text: '...' }
      ]);

      for await (const chunk of stream) {
        currentText += chunk.text;
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === modelMessageId ? { ...msg, text: currentText } : msg
          )
        );
      }
       if (currentText === '') {
         setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === modelMessageId ? { ...msg, text: "I'm sorry, I couldn't generate a response." } : msg
          )
        );
      }
    } catch (e) {
      console.error('Error sending message:', e);
      setError('An error occurred while sending your message. Please try again.');
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now().toString() + '-error', role: 'model', text: 'Error: Could not get response.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Gemini Chat</h1>
      </header>
      {error && <p className="error-message">{error}</p>}
      <div className="messages-area" aria-live="polite">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <p>{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="input-area">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
          aria-label="Chat message input"
          disabled={isLoading || !chat}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e as unknown as FormEvent);
            }
          }}
        />
        <button type="submit" disabled={isLoading || !chat || !userInput.trim()}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
