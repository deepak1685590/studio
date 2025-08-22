"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send } from 'lucide-react';
import { marketAnalysisChatbot } from '@/ai/flows/market-analysis-chatbot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { marked } from 'marked';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const initialBotMessage = "Hello! I'm Cathy, your friendly Market Analysis Chatbot. I can help you understand market trends, analyze assets, and provide insights. **I can also use Markdown for formatting!** How can I assist you today?";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ text: initialBotMessage, sender: 'bot' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(isOpen && scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages, isOpen]);
  

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await marketAnalysisChatbot({ query: input, language });
      const botMessage: Message = { text: response.response, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = { text: "Cathy: I'm sorry, I'm having trouble connecting right now. Please try again later.", sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const createMarkup = (text: string) => {
    const rawMarkup = marked(text, { sanitize: true });
    return { __html: rawMarkup as string };
  };

  return (
    <>
      <div 
        className={`fixed bottom-8 right-8 z-50 transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <Button 
          onClick={() => setIsOpen(true)} 
          className="rounded-full w-16 h-16 bg-primary text-background shadow-[0_0_15px_var(--primary),_0_0_30px_var(--primary)] hover:scale-110 transition-transform"
        >
          <Bot size={32} />
        </Button>
      </div>

      <div 
        className={`fixed bottom-8 right-8 w-[350px] h-[500px] bg-black/80 backdrop-blur-md border-2 border-primary rounded-2xl shadow-[0_0_25px_var(--primary)] z-50 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}
      >
        <header className="flex items-center justify-between p-3 border-b border-primary/50 text-background bg-gradient-to-r from-accent to-primary">
          <h3 className="font-headline text-lg">Cathy</h3>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-auto bg-transparent border-background/50 text-background h-8 focus:ring-background">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="bg-background text-foreground">
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="es">ES</SelectItem>
                <SelectItem value="fr">FR</SelectItem>
                <SelectItem value="de">DE</SelectItem>
                <SelectItem value="zh">ZH</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-background hover:bg-black/20" onClick={() => setIsOpen(false)}>
              <X />
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="flex flex-col gap-3">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'self-end bg-accent text-accent-foreground rounded-br-none' : 'self-start bg-secondary text-secondary-foreground border border-primary/20 rounded-bl-none'}`}
              >
                <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={createMarkup(msg.text)} />
              </div>
            ))}
            {isLoading && (
              <div className="self-start bg-secondary text-secondary-foreground border border-primary/20 rounded-2xl rounded-bl-none p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <footer className="p-3 border-t border-primary/50">
          <div className="flex items-center gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Cathy..."
              className="bg-input rounded-full focus:shadow-[0_0_10px_var(--primary)]"
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading} className="rounded-full w-10 h-10 flex-shrink-0 bg-primary hover:bg-primary/80">
              <Send size={20} className="text-background" />
            </Button>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Chatbot;
