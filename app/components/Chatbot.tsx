"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../css/Chatbot.module.css";
import chatbot, { fetchChatHistory } from "../../lib/chatbotApi";
import Message from "../interface/chatbot";
import { useAuth } from "../context/AuthContext";

export default function Chatbot() {
  // KHÔNG gọi bất kỳ hook nào conditionally (trong if/else)
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [shouldShake, setShouldShake] = useState(false);
  const [showGreetingBubble, setShowGreetingBubble] = useState(false);
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // luôn gọi hook (dù có xài hay không)
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const greetingText = "👋 Chào bạn! Bạn cần mình hỗ trợ gì không nè?";
  const greetingMsg = (): Message => ({
    sender: "bot",
    text: greetingText,
    timestamp: Date.now().toString(),
    timeText: new Date().toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  });

  // dùng state để đảm bảo mounted trước khi dùng window/localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadHistory = async () => {
      const greeting = greetingMsg();

      if (isLoggedIn) {
        const serverMsgs = await fetchChatHistory();
        setMessages([greeting, ...serverMsgs]);
      } else {
        const saved = localStorage.getItem("chat_history");
        const localMsgs = saved ? JSON.parse(saved) : [];
        setMessages([greeting, ...localMsgs]);
      }
    };

    loadHistory();
  }, [isLoggedIn, mounted]);

  useEffect(() => {
    if (!mounted || isLoggedIn) return;

    const msgsToSave = messages.filter((m) => m.text !== greetingText);
    localStorage.setItem("chat_history", JSON.stringify(msgsToSave));
  }, [messages, isLoggedIn, mounted]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!mounted || isOpen) return;

    let showTimeout: NodeJS.Timeout;
    let loopInterval: NodeJS.Timeout;
    let shakeInterval: NodeJS.Timeout;

  

    const loop = () => {
      setShowGreetingBubble(true);
      setTimeout(() => setShowGreetingBubble(false), 4000);
    };

    showTimeout = setTimeout(loop, 6000);
    loopInterval = setInterval(loop, 30000);
    shakeInterval = setInterval(() => {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 600);
    }, 1000);

    return () => {
      clearTimeout(showTimeout);
      clearInterval(loopInterval);
      clearInterval(shakeInterval);
    };
  }, [isOpen, mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const now = new Date();
    const userMessage: Message = {
      sender: "user",
      text: input,
      timestamp: now.getTime().toString(),
      timeText: now.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const audio = new Audio("/sounds/send.mp3");
    audio.play().catch(() => {});

    try {
      const { answer, time } = await chatbot(input);
      const botMessage: Message = {
        sender: "bot",
        text: answer,
        timestamp: Date.now().toString(),
        timeText: time,
      };
      setMessages((prev) => [...prev, botMessage]);
      const audio = new Audio("/sounds/send.mp3");
      audio.play().catch(() => {});
    } catch (err) {
      console.error("Lỗi:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Có lỗi xảy ra. Thử lại sau nhé." },
      ]);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
  };

  if (!mounted) return null; // tránh lỗi hydration mismatch

  return (
    <>
      <button
        className={`${styles.chatIcon} ${
          !isOpen && shouldShake ? styles.shake : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        💬
      </button>

      {!isOpen && showGreetingBubble && (
        <div className={styles.miniBubble}>{greetingText}</div>
      )}

      {isOpen && (
        <div className={styles.chatBox}>
          <div className={styles.header}>
            <span>Hỏi đáp cùng Egomall</span>
            <button onClick={() => setIsOpen(false)}>✖</button>
            {!isLoggedIn && (
              <div className={styles.headerNote}>
                🔒 Đăng nhập để trải nghiệm website tốt hơn!
              </div>
            )}
          </div>

          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={
                  msg.sender === "user" ? styles.userMsg : styles.botMsg
                }
              >
                <div>{msg.text}</div>
                {msg.timeText && (
                  <div className={styles.timeText}>{msg.timeText}</div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.suggestions}>
            <span onClick={() => handleSuggestionClick("Sản phẩm nào đang giảm giá?")}>🔥 Khuyến mãi</span>
            <span onClick={() => handleSuggestionClick("Thành phần của sản phẩm là gì?")}>🌿 Thành phần</span>
            <span onClick={() => handleSuggestionClick("Chính sách đổi trả thế nào?")}>🔁 Đổi trả</span>
          </div>

          <form className={styles.inputArea} onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bạn muốn hỏi gì?"
            />
            <button type="submit">Gửi</button>
          </form>
        </div>
      )}
    </>
  );
}
