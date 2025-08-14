import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const renderMessageWithLinks = (content: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 underline font-medium"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Bonjour ! Je suis votre assistant AutoExpert. Comment puis-je vous aider aujourd\'hui ?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeMessageAndRespond = (message: string): string => {
    const msg = message.toLowerCase().trim();
    
    // Mots-clés pour chaque catégorie
    const keywords = {
      remerciements: ['merci', 'merci beaucoup', 'je vous remercie', 'parfait', 'super', 'excellent', 'génial', 'ok merci', 'très bien'],
      rdv: ['rendez-vous', 'rdv', 'réservation', 'réserver', 'prendre', 'créneau', 'révision', 'contrôle technique', 'vidange'],
      auth: ['connexion', 'connecter', 'compte', 'espace', 'personnel', 'login', 'identifiant', 'mot de passe'],
      satisfaction: ['satisfaction', 'avis', 'note', 'évaluation', 'feedback', 'commentaire', 'service'],
      maintenance: ['maintenance', 'réparation', 'réparer', 'panne', 'problème', 'entretien', 'garage', 'mécanique'],
      home: ['accueil', 'services', 'proposez', 'offrez', 'que faites-vous', 'présentation', 'bonjour', 'salut', 'hello'],
      devis: ['devis', 'prix', 'tarif', 'coût', 'facture', 'estimation'],
      historique: ['historique', 'histoire', 'précédent', 'ancien', 'passé', 'dossier'],
      contact: ['contact', 'contacter', 'téléphone', 'appeler', 'numéro'],
      disponibilite: ['disponibilité', 'disponible', 'horaire', 'heure', 'ouvert', 'fermé', 'ouverture']
    };

    // Vérifier les correspondances
    for (const [category, categoryKeywords] of Object.entries(keywords)) {
      if (categoryKeywords.some(keyword => msg.includes(keyword))) {
        switch (category) {
          case 'remerciements':
            return 'Nous sommes toujours à votre disposition ! Bienvenue chez AutoExpert.';
          case 'rdv':
            return 'Parfait ! Vous pouvez réserver votre créneau ici : https://preview--automoto-hub-38.lovable.app/rdv';
          case 'auth':
            return 'Vous pouvez vous connecter à votre espace personnel ici : https://preview--automoto-hub-38.lovable.app/auth';
          case 'satisfaction':
            return 'Votre avis nous intéresse ! Partagez votre expérience ici : https://preview--automoto-hub-38.lovable.app/satisfaction';
          case 'maintenance':
            return 'Pour vos besoins de maintenance et réparation, consultez nos services ici : https://preview--automoto-hub-38.lovable.app/maintenance';
          case 'home':
            return 'Bienvenue sur AutoMoto Hub ! Nous proposons des services complets pour votre véhicule, découvrez-les ici : https://preview--automoto-hub-38.lovable.app/';
          case 'devis':
            return 'Vous pouvez demander votre devis en vous connectant à ce lien : https://preview--automoto-hub-38.lovable.app/auth';
          case 'historique':
            return 'Vous pouvez consulter votre historique en vous connectant à ce lien : https://preview--automoto-hub-38.lovable.app/auth';
          case 'contact':
            return 'Vous pouvez nous contacter au : 01 23 45 67 89';
          case 'disponibilite':
            return 'Nos horaires d\'ouverture : Lun-Ven 8h-18h';
        }
      }
    }

    // Réponse générale si aucune catégorie spécifique n'est détectée
    return 'Je suis là pour vous aider ! Pouvez-vous me préciser votre besoin ? Je peux vous orienter vers nos différents services : réservation, maintenance, espace client, ou satisfaction.';
  };

  const sendMessageToWebhook = async (message: string): Promise<string> => {
    try {
      // Analyser le message et fournir une réponse intelligente
      const intelligentResponse = analyzeMessageAndRespond(message);
      
      // Envoyer aussi au webhook n8n pour logging/traitement
      const response = await fetch('http://localhost:5678/webhook-test/assistant-autoexpert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          response: intelligentResponse,
          timestamp: new Date().toISOString(),
          source: 'autoexpert-website'
        }),
      });

      if (!response.ok) {
        console.warn(`Webhook warning: ${response.status}`);
      }

      return intelligentResponse;
    } catch (error) {
      console.error('Erreur envoi message chatbot:', error);
      // Fallback vers l'analyse locale même si le webhook échoue
      return analyzeMessageAndRespond(message);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const botResponse = await sendMessageToWebhook(inputMessage);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Désolé, je rencontre des difficultés techniques. Veuillez réessayer plus tard.',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Widget */}
      {isOpen && (
        <Card className="w-96 h-[500px] mb-4 shadow-2xl border border-border/50 bg-background/95 backdrop-blur-xl">
          <CardHeader className="pb-3 border-b border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg">Assistant AutoExpert</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 hover:bg-muted/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col h-[calc(500px-80px)]">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-start space-x-3",
                      message.isBot ? "justify-start" : "justify-end"
                    )}
                  >
                    {message.isBot && (
                      <div className="p-1.5 bg-primary/10 rounded-full">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                        message.isBot
                          ? "bg-muted text-foreground rounded-tl-sm"
                          : "bg-primary text-primary-foreground rounded-tr-sm"
                      )}
                    >
                      {renderMessageWithLinks(message.content)}
                    </div>
                    {!message.isBot && (
                      <div className="p-1.5 bg-primary/10 rounded-full">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start space-x-3">
                    <div className="p-1.5 bg-primary/10 rounded-full">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted px-4 py-2.5 rounded-2xl rounded-tl-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Input */}
            <div className="p-4 border-t border-border/30">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300 glow-primary"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
};

export default ChatbotWidget;