import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import ChatbotWidget from '../Chatbot/ChatbotWidget';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
};

export default Layout;