import { create } from "zustand";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  timestamp: number;
};

type ChatState = {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;

  addMessage: (msg: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  clearMessages: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isOpen: false,
  isLoading: false,

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setLoading: (isLoading) => set({ isLoading }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (isOpen) => set({ isOpen }),
  clearMessages: () => set({ messages: [] }),
}));
