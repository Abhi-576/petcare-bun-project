"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, X, Send, MessageCircle, PawPrint } from "lucide-react";

type ChatMessage = {
  id: number;
  from: "bot" | "user";
  text: string;
  link?: { label: string; href: string };
};
const rules: {
  test: RegExp;
  text: string;
  link?: { label: string; href: string };
}[] = [
  {
    test: /find|search|browse|discover|sitter/i,
    text: "You can browse sitter profiles, compare nightly rates, and use the filters to narrow results by location and pet type.",
    link: { label: "Find a sitter", href: "/sitters" },
  },
  {
    test: /message|chat|contact|talk/i,
    text: "Booking conversations are available to the owner and sitter once a booking request exists. Open Messages from your account menu to view and reply.",
    link: { label: "Open messages", href: "/owner/messages" },
  },
  {
    test: /book|booking|reserve|reservation/i,
    text: "To request a stay, open a sitter profile, choose your pet and dates, and submit a booking request. The sitter needs to accept it. Online payments are not enabled yet.",
    link: { label: "Browse sitters", href: "/sitters" },
  },
  {
    test: /register|sign.?up|create account|join/i,
    text: "Choose Log in, then Create an account. You can register as a pet owner or a sitter. Sitters should complete their profile and availability after registration.",
    link: { label: "Create an account", href: "/auth/register" },
  },
  {
    test: /login|log in|sign.?in|password|logout|log out/i,
    text: "Use Log in to access your account. When signed in, your name, Dashboard, Messages, and Log out controls appear in the site header. Password reset emails are not configured yet.",
    link: { label: "Log in", href: "/auth/login" },
  },
  {
    test: /availability|calendar|dates/i,
    text: "Sitters can manage available dates from their dashboard. Dates overlapping a confirmed stay cannot be marked unavailable.",
    link: { label: "Sitter availability", href: "/sitter/availability" },
  },
  {
    test: /pet profile|my pet|add a pet|pets/i,
    text: "Pet owners can add pets and keep feeding instructions, allergies, medication notes, and emergency details in the pet profile.",
    link: { label: "My pets", href: "/owner/pets" },
  },
  {
    test: /safety|verify|verification|trust/i,
    text: "Read the safety page for platform guidance. Any identity or background-check process depends on configured verification providers; do not assume a sitter has been externally checked unless their profile explicitly says so.",
    link: { label: "Safety promise", href: "/safety" },
  },
  {
    test: /price|cost|fee|payment|pay|refund/i,
    text: "The booking summary shows the sitter subtotal and platform fee before you submit. Payment processing and payouts are not enabled in this version, so no card charge is made.",
    link: { label: "How it works", href: "/how-it-works" },
  },
  {
    test: /help|support|human|problem|error|issue/i,
    text: "I’m a simple FAQ assistant and can’t inspect your account or contact support. For account-specific problems, check the relevant dashboard and any error message shown there.",
    link: { label: "Account login", href: "/auth/login" },
  },
];
function answer(question: string) {
  const match = rules.find((rule) => rule.test.test(question));
  return (
    match ?? {
      text: "I can help with finding sitters, bookings, messages, pet profiles, availability, account access, safety, and payment status. Try asking about one of those topics.",
    }
  );
}

export function HelpChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: "bot",
      text: "Hi! I’m the PetCare help bot. I answer common questions using a small set of built-in rules. What can I help you with?",
    },
  ]);
  const [nextId, setNextId] = useState(2);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open]);
  function send(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question) return;
    const response = answer(question);
    setMessages((old) => [
      ...old,
      { id: nextId, from: "user", text: question },
      { id: nextId + 1, from: "bot", text: response.text, link: (response as any).link },
    ]);
    setNextId((id) => id + 2);
    setInput("");
  }
  return (
    <div className="help-chat-root">
      <button
        className="help-chat-launcher"
        aria-label={open ? "Close PetCare help chat" : "Open PetCare help chat"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <X size={20} />
        ) : (
          <>
            <MessageCircle size={20} />
            <span>Help</span>
          </>
        )}
      </button>
      {open && (
        <section className="help-chat-window" aria-label="PetCare help chatbot">
          <header className="help-chat-head">
            <span className="help-chat-avatar">
              <PawPrint size={18} />
            </span>
            <div>
              <strong>PetCare help</strong>
              <small>Rule-based FAQ assistant · not AI</small>
            </div>
            <button aria-label="Close chat" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </header>
          <div className="help-chat-messages" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`help-chat-message ${message.from}`}
              >
                {message.from === "bot" && <Bot size={14} />}
                <div>
                  <p>{message.text}</p>
                  {message.link && (
                    <Link
                      href={message.link.href}
                      onClick={() => setOpen(false)}
                    >
                      {message.link.label} ↗
                    </Link>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="help-chat-suggestions">
            <button onClick={() => setInput("How do I find a sitter?")}>
              Find a sitter
            </button>
            <button onClick={() => setInput("How do messages work?")}>
              Messages
            </button>
            <button onClick={() => setInput("Are payments enabled?")}>
              Payments
            </button>
          </div>
          <form className="help-chat-form" onSubmit={send}>
            <input
              aria-label="Ask PetCare help"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              maxLength={500}
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={!input.trim()}
            >
              <Send size={16} />
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
