// src/context/ChatContext.tsx
import React, { createContext, useState, useContext, type ReactNode } from 'react';

interface ChatContextType {
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <ChatContext.Provider value={{ isChatOpen, setIsChatOpen }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};