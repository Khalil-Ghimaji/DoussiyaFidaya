'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chatService } from './service';
import { ChatResponse, Specialist } from './types';

interface Message {
  content: string;
  isUser: boolean;
  type: 'text' | 'specialists';
}

const LoadingDots = () => {
  return (
    <div className="flex space-x-1 items-center">
      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
};

export function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Bonjour ! Je suis votre assistant médical. Comment puis-je vous aider aujourd'hui ?",
      isUser: false,
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatResponse = (data: ChatResponse): string => {
    let response = '';

    if (data.reassurance) {
      response += `💬 ${data.reassurance}\n\n`;
    }

    if (data.conseils_generaux?.length > 0) {
      response += "📋 Conseils généraux :\n";
      data.conseils_generaux.forEach((conseil, index) => {
        response += `• ${conseil}\n`;
      });
      response += '\n';
    }

    if (data.specialistes_recommandes?.length > 0) {
      response += "👨‍⚕️ Spécialistes recommandés :\n\n";
      data.specialistes_recommandes.forEach((specialist, index) => {
        response += `📌 ${specialist.specialite}\n`;
        response += `   ℹ️ Raison : ${specialist.raison}\n`;
        if (specialist.nom_medecin) response += `   👤 Médecin : ${specialist.nom_medecin}\n`;
        if (specialist.email) response += `   📧 Email : ${specialist.email}\n`;
        if (specialist.phone) response += `   📞 Téléphone : ${specialist.phone}\n`;
        if (specialist.address) response += `   📍 Adresse : ${specialist.address}\n`;
        response += '\n';
      });
    }

    if (data.message_final) {
      response += `✨ ${data.message_final}`;
    }

    return response.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { content: userMessage, isUser: true, type: 'text' }]);

    try {
      const data = await chatService.sendMessage({ user_prompt: userMessage });
      const formattedResponse = formatResponse(data);
      setMessages(prev => [...prev, { content: formattedResponse, isUser: false, type: 'text' }]);
    } catch (error) {
      console.error('Erreur:', error);
      setMessages(prev => [...prev, { 
        content: '❌ Désolé, une erreur est survenue. Veuillez réessayer plus tard.', 
        isUser: false, 
        type: 'text' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3",
              message.isUser ? "justify-end" : "justify-start"
            )}
          >
            {!message.isUser && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl p-4 shadow-sm",
                message.isUser
                  ? "bg-primary text-primary-foreground ml-12"
                  : "bg-white border border-gray-200 mr-12"
              )}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
            </div>
            {message.isUser && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="max-w-[80%] rounded-2xl p-4 shadow-sm bg-white border border-gray-200 mr-12">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">En train de réfléchir</span>
                <LoadingDots />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Décrivez vos symptômes ou posez votre question..."
            className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
} 