import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I assist you today?", isUser: false },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [theme, setTheme] = useState("light");
  const [likes, setLikes] = useState({});
  const [dislikes, setDislikes] = useState({});
  const [showTooltip, setShowTooltip] = useState({});
  const [showCopyTooltip, setShowCopyTooltip] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const handleShare = (messageId, text) => {
  if (navigator.share) {
    navigator.share({
      title: "ChatAI Response",
      text: text,
    })
      .then(() => {
        setShowTooltip((prev) => ({
          ...prev,
          [messageId]: { ...prev[messageId], share: "shared" },
        }));
        setTimeout(() => {
          setShowTooltip((prev) => ({
            ...prev,
            [messageId]: { ...prev[messageId], share: false },
          }));
        }, 1500);
      })
      .catch(() => {}); // Silent fail if user cancels
  } else {
    setShowTooltip((prev) => ({
      ...prev,
      [messageId]: { ...prev[messageId], share: "error" },
    }));
    setTimeout(() => {
      setShowTooltip((prev) => ({
        ...prev,
        [messageId]: { ...prev[messageId], share: false },
      }));
    }, 1500);
  }
};
  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    document.body.style.transition =
      "background-color 0.3s ease, color 0.3s ease";
  };

  const handleLike = (messageId) => {
    setLikes((prev) => ({
      ...prev,
      [messageId]: {
        count:
          (prev[messageId]?.count || 0) + (prev[messageId]?.active ? -1 : 1),
        active: !prev[messageId]?.active,
      },
    }));
    // If liking, remove dislike
    if (dislikes[messageId]?.active) {
      setDislikes((prev) => ({
        ...prev,
        [messageId]: {
          count: (prev[messageId]?.count || 1) - 1,
          active: false,
        },
      }));
    }
  };
  useEffect(() => {
    const savedLikes = JSON.parse(localStorage.getItem("likes") || "{}");
    setLikes(savedLikes);
  }, []);
  useEffect(
    () => localStorage.setItem("likes", JSON.stringify(likes)),
    [likes]
  );

  const handleDislike = (messageId) => {
    setDislikes((prev) => ({
      ...prev,
      [messageId]: {
        count:
          (prev[messageId]?.count || 0) + (prev[messageId]?.active ? -1 : 1),
        active: !prev[messageId]?.active,
      },
    }));
    // If disliking, remove like
    if (likes[messageId]?.active) {
      setLikes((prev) => ({
        ...prev,
        [messageId]: {
          count: (prev[messageId]?.count || 1) - 1,
          active: false,
        },
      }));
    }
  };

  const handleCopy = (messageId, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowCopyTooltip((prev) => ({ ...prev, [messageId]: true }));
      setTimeout(() => {
        setShowCopyTooltip((prev) => ({ ...prev, [messageId]: false }));
      }, 1500);
    });
  };

  const handleSend = async () => {
    if (input.trim() === "") return;
    const newMessage = { id: messages.length + 1, text: input, isUser: true };
    setMessages([...messages, newMessage]);
    setInput("");
    setIsThinking(true);

    try {
      if (/any jokes/i.test(input)) {
        const response = await fetch("https://api.api-ninjas.com/v1/dadjokes", {
          headers: { "X-Api-Key": "vbLr0fFwvqwW6Wlt9nOgJg==ZI8YGcjLH56Ad6Vq" },
        });
        const data = await response.json();
        if (data.error) {
          throw new Error("API error: Unable to fetch joke");
        }
        const joke = data.joke;
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, text: joke, isUser: false },
        ]);
        setIsThinking(false);
        return;
      }
      if (/tell me a joke|you got a joke/i.test(input)) {
        const response = await fetch(
          "https://v2.jokeapi.dev/joke/Programming,Miscellaneous,Dark,Spooky?type=single&safe-mode"
        );
        const data = await response.json();
        if (data.error) {
          throw new Error("API error: Unable to fetch joke");
        }
        const joke = data.joke;
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, text: joke, isUser: false },
        ]);
        setIsThinking(false);
        return;
      }

      if (/tell me a fact/i.test(input)) {
        const response = await fetch("https://api.api-ninjas.com/v1/facts", {
          headers: { "X-Api-Key": "vbLr0fFwvqwW6Wlt9nOgJg==ZI8YGcjLH56Ad6Vq" },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error("API error: Unable to fetch fact");
        }
        const fact = data[0]?.fact;
        if (!fact) {
          throw new Error("No fact received from API");
        }
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, text: `Did you know? ${fact}`, isUser: false },
        ]);
        setIsThinking(false);
        return;
      }

      if (
        /what is the bitcoin price|bitcoin price|hozir bitcoin narxi qancha/i.test(
          input
        )
      ) {
        const btcPrice = `The current Bitcoin price is $${(
          Math.random() * (110000 - 90000) +
          90000
        ).toFixed(2)} USD.`;
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, text: btcPrice, isUser: false },
        ]);
        setIsThinking(false);
        return;
      }

      // Simulate AI response for non-API cases
      setTimeout(() => {
        const aiResponses = [
          "I'm here to help!",
          "Can you elaborate on that?",
          "That's interesting, tell me more.",
          "Let me think about that for a moment.",
          "What do you mean by that?",
        ];

        const savedName = localStorage.getItem("userName");
        if (/what is my name|say my name/i.test(input)) {
          if (savedName) {
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: `Your name is ${savedName}.`,
                isUser: false,
              },
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: "I don't know your name yet. Could you tell me?",
                isUser: false,
              },
            ]);
          }
          setIsThinking(false);
          return;
        }
        if (/say again/i.test(input)) {
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && !lastMessage.isUser) {
            setMessages((prev) => [
              ...prev,
              { id: prev.length + 1, text: lastMessage.text, isUser: false },
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: "I don't have anything to repeat yet.",
                isUser: false,
              },
            ]);
          }
          setIsThinking(false);
          return;
        }
        if (/my name is (\w+)/i.test(input)) {
          const userName = input.match(/my name is (\w+)/i)[1];
          localStorage.setItem("userName", userName);
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: `Nice to meet you, ${userName}! I'll remember your name.`,
              isUser: false,
            },
          ]);
          setIsThinking(false);
          return;
        }
        if (/what is the time/i.test(input)) {
          const currentTime = new Date().toLocaleTimeString();
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: `The current time is ${currentTime}.`,
              isUser: false,
            },
          ]);
          setIsThinking(false);
          return;
        }
        if (/what is the date/i.test(input)) {
          const currentDate = new Date().toLocaleDateString();
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: `Today's date is ${currentDate}.`,
              isUser: false,
            },
          ]);
          setIsThinking(false);
          return;
        }
        if (/what is your name/i.test(input)) {
          setMessages((prev) => [
            ...prev,
            { id: prev.length + 1, text: "My name is ChatAI.", isUser: false },
          ]);
          setIsThinking(false);
          return;
        }
        if (/how are you|qalesan|qandaysan/i.test(input)) {
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: "Thank you for asking. I'm very good. How are you?",
              isUser: false,
            },
          ]);
          setIsThinking(false);
          return;
        }
        if (/forget my (\w+)'s name/i.test(input)) {
          const relation = input.match(/forget my (\w+)'s name/i)[1];
          const savedRelations = JSON.parse(
            localStorage.getItem("relations") || "{}"
          );
          if (savedRelations[relation]) {
            delete savedRelations[relation];
            localStorage.setItem("relations", JSON.stringify(savedRelations));
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: `Alright, we've never talked about your ${relation}.`,
                isUser: false,
              },
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: `I don't have your ${relation}'s name stored.`,
                isUser: false,
              },
            ]);
          }
          setIsThinking(false);
          return;
        }
        if (/me too|yaxshiman|I'm good|not bad/i.test(input)) {
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: "That sounds well. What's your plan for today?",
              isUser: false,
            },
          ]);
          setIsThinking(false);
          return;
        }
        if (
          /I'm not in mood|yaxshi emas|I'm sad|very bad|not good/i.test(input)
        ) {
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: "What's wrong, bro. Is there any problem with something",
              isUser: false,
            },
          ]);
          setIsThinking(false);
          return;
        }
        if (/how old are you/i.test(input)) {
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: "I'm so young, I was born in 2025! I don't even know what taxes are yet. Why do you need this info?",
              isUser: false,
            },
          ]);
          setIsThinking(false);
          return;
        }
        if (
          /who created you|kim seni yaratgan|seni kim yaratgan/i.test(input)
        ) {
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: "I was created by a student of PDP University's Frontend Developers to assist with your queries!",
              isUser: false,
            },
          ]);
          setIsThinking(false);
          return;
        }
        if (/where are you from/i.test(input)) {
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: "I'm from the digital realm, created to assist you wherever you are! So, what about you?",
              isUser: false,
            },
          ]);
          setIsThinking(false);
          return;
        }
        if (/uzbekcha gapir/i.test(input)) {
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: "Albatta bro. Men istagan tilinda gaplasha olaman. Lekin yanada ko'proq tillar ishlatish uchun Pro versiya obunasi bo'lishi kerak...",
              isUser: false,
            },
          ]);
          setIsThinking(false);
          return;
        }
        if (
          /^(hello|hi|hey|what's up|wassup|assallamu aleykum|nima gap|qalesan)$/i.test(
            input
          )
        ) {
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: `Hello ${userName}! It's a pleasure to chat with you. How can I assist you today?`,
              isUser: false,
            },
          ]);
          setIsThinking(false);
          return;
        }
        if (/what're you gonna do/i.test(input)) {
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: "I'm here to assist you with anything you need. Just ask!",
              isUser: false,
            },
          ]);
          setIsThinking(false);
          return;
        }
        if (/where am i/i.test(input)) {
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: "You are in a conversation with ChatAI, your virtual assistant! If you meant to ask about your location, I can't access that info.",
              isUser: false,
            },
          ]);
          setIsThinking(false);
          return;
        }
        if (/what is the weather/i.test(input)) {
          const weatherResponses = [
            "Looks sunny in the digital realm! What's the weather like where you are?",
            "I’d say it’s partly cloudy with a chance of fun chats. How’s your weather?",
            "No rain here, just clear skies for chatting! What's it like outside for you?",
          ];
          const randomWeather =
            weatherResponses[
              Math.floor(Math.random() * weatherResponses.length)
            ];
          setMessages((prev) => [
            ...prev,
            { id: prev.length + 1, text: randomWeather, isUser: false },
          ]);
          setIsThinking(false);
          return;
        }
        if (/calculate ([\d\s\+\-\*\/\(\)]+)/i.test(input)) {
          try {
            const expression = input.match(
              /calculate ([\d\s\+\-\*\/\(\)]+)/i
            )[1];
            const result = Function(`"use strict"; return (${expression})`)();
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: `The result of ${expression} is ${result}.`,
                isUser: false,
              },
            ]);
          } catch (error) {
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: "Sorry, I couldn’t calculate that. Make sure your expression is valid, like 'calculate (5 + 3) * 2'.",
                isUser: false,
              },
            ]);
          }
          setIsThinking(false);
          return;
        }
        if (/(great|awesome|amazing|cool)/i.test(input)) {
          const compliments = [
            "You’re absolutely killing it, bro!",
            "That’s the spirit! You’re awesome!",
            "Wow, you’re bringing the good vibes!",
          ];
          const randomCompliment =
            compliments[Math.floor(Math.random() * compliments.length)];
          setMessages((prev) => [
            ...prev,
            { id: prev.length + 1, text: randomCompliment, isUser: false },
          ]);
          setIsThinking(false);
          return;
        }
        if (/speak (spanish|espanol)/i.test(input)) {
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: "¡Claro, puedo hablar español! Pero para más idiomas, considera la versión Pro, amigo...",
              isUser: false,
            },
          ]);
          setIsThinking(false);
          return;
        }
        if (/my (\w+)'s name is (\w+)/i.test(input)) {
          const [, relation, name] = input.match(/my (\w+)'s name is (\w+)/i);
          const savedRelations = JSON.parse(
            localStorage.getItem("relations") || "{}"
          );
          savedRelations[relation] = name;
          localStorage.setItem("relations", JSON.stringify(savedRelations));
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: `It's good to know your ${relation}'s name! I'll remember that.`,
              isUser: false,
            },
          ]);
          setIsThinking(false);
          return;
        }
        if (/what is my (\w+)'s name/i.test(input)) {
          const relation = input.match(/what is my (\w+)'s name/i)[1];
          const savedRelations = JSON.parse(
            localStorage.getItem("relations") || "{}"
          );
          const name = savedRelations[relation];
          if (name) {
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: `Your ${relation}'s name is ${name}. We have talked about this before.`,
                isUser: false,
              },
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: `I don't know your ${relation}'s name yet. Could you tell me?`,
                isUser: false,
              },
            ]);
          }
          setIsThinking(false);
          return;
        }

        if (/what is my favorite (\w+)/i.test(input)) {
          const favoriteItem = input.match(/what is my favorite (\w+)/i)[1];
          const savedFavorites = JSON.parse(
            localStorage.getItem("favorites") || "{}"
          );
          const favorite = savedFavorites[favoriteItem];
          if (favorite) {
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: `Your favorite ${favoriteItem} is ${favorite}.`,
                isUser: false,
              },
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: `I don't know your favorite ${favoriteItem} yet. Could you tell me?`,
                isUser: false,
              },
            ]);
          }
          setIsThinking(false);
          return;
        }

        if (/my favorite (\w+) is (\w+)/i.test(input)) {
          const [_, favoriteItem, favorite] = input.match(
            /my favorite (\w+) is (\w+)/i
          );
          const savedFavorites = JSON.parse(
            localStorage.getItem("favorites") || "{}"
          );
          savedFavorites[favoriteItem] = favorite;
          localStorage.setItem("favorites", JSON.stringify(savedFavorites));
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: `Your favorite ${favoriteItem} is ${favorite}. That's awesome! I'll remember that.`,
              isUser: false,
            },
          ]);
          setIsThinking(false);
          return;
        }
        if (/what is my favorite (\w+)/i.test(input)) {
          const favoriteItem = input.match(/what is my favorite (\w+)/i)[1];
          const savedFavorites = JSON.parse(
            localStorage.getItem("favorites") || "{}"
          );
          const favorite = savedFavorites[favoriteItem];
          if (favorite) {
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: `Your favorite ${favoriteItem} is ${favorite}.`,
                isUser: false,
              },
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: `I don't know your favorite ${favoriteItem} yet. Could you tell me?`,
                isUser: false,
              },
            ]);
          }
          setIsThinking(false);
          return;
        }

        if (/what is my hobby/i.test(input)) {
          const hobby = localStorage.getItem("userHobby");
          if (hobby) {
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: `Your hobby is ${hobby}.`,
                isUser: false,
              },
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: "I don't know your hobby yet. Could you tell me?",
                isUser: false,
              },
            ]);
          }
          setIsThinking(false);
          return;
        }

        if (/my hobby is (\w+)/i.test(input)) {
          const hobby = input.match(/my hobby is (\w+)/i)[1];
          localStorage.setItem("userHobby", hobby);
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: `Great! Your hobby is ${hobby}. I'll remember that.`,
              isUser: false,
            },
          ]);
          setIsThinking(false);
          return;
        }
        if (/(i'?m sad|i'?m feeling down)/i.test(input)) {
          const encouragements = [
            "I’m here for you, bro. Wanna share what’s on your mind?",
            "Sorry to hear that. How about a joke to cheer you up? Just say 'tell me a joke'!",
            "It’s okay to feel down sometimes. I’m all ears if you want to talk!",
          ];
          const randomEncouragement =
            encouragements[Math.floor(Math.random() * encouragements.length)];
          setMessages((prev) => [
            ...prev,
            { id: prev.length + 1, text: randomEncouragement, isUser: false },
          ]);
          setIsThinking(false);
          return;
        }
        if (/she found another guy/i.test(input)) {
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: "I'm sorry to hear that. Remember, you're worthy of love and happiness. Stay strong!",
              isUser: false,
            },
          ]);
          setIsThinking(false);
          return;
        }
        if (/thanks|thank you/i.test(input)) {
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: "You're welcome! I'm here to help anytime.",
              isUser: false,
            },
          ]);
          setIsThinking(false);
          return;
        }
        if (/I'm from (\w+)/i.test(input)) {
          const userLocation = input.match(/I'm from (\w+)/i)[1];
          localStorage.setItem("userLocation", userLocation);
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              text: `Oh, you're from ${userLocation}! That's awesome! I'll remember that.`,
              isUser: false,
            },
          ]);
          setIsThinking(false);
          return;
        }
        if (/where am i from|qayerdanman/i.test(input)) {
          const userLocation = localStorage.getItem("userLocation");
          if (userLocation) {
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: `You told me you're from ${userLocation}.`,
                isUser: false,
              },
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: "I don't know where you're from yet. Could you tell me?",
                isUser: false,
              },
            ]);
          }
          setIsThinking(false);
          return;
        }
        // Fallback random response
        const randomResponse =
          aiResponses[Math.floor(Math.random() * aiResponses.length)];
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, text: randomResponse, isUser: false },
        ]);
        setIsThinking(false);
      }, 2000);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Oops, something went wrong with the API. Try again later!",
          isUser: false,
        },
      ]);
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const userName = localStorage.getItem("userName");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="app">
      <header className="header">
        <div className="logo">Chat with {userName || "Bro"}</div>
        <button
          className="theme-toggle-button"
          onClick={toggleTheme}
          title="change theme"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </header>

      <main className="chat-container">
        <div className="messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={message.isUser ? "chat-bubble-user" : "chat-bubble-ai"}
            >
              <span className="message-content">{message.text}</span>
              {!message.isUser && (
                <div className="message-actions">
                  <button
                    className={`action-button ${
                      likes[message.id]?.active ? "active" : ""
                    }`}
                    onClick={() => {
                      handleLike(message.id);
                      if (likes[message.id]?.active) {
                        alert("You liked this message!");
                      }
                    }}
                    aria-label="Like this response"
                    title="Like"
                  >
                    {likes[message.id]?.active ? "👏" : "👍"}{" "}
                  </button>
                  {!likes[message.id]?.active && (
                    <button
                      className={`action-button ${
                        dislikes[message.id]?.active ? "disliked" : ""
                      }`}
                      onClick={() => handleDislike(message.id)}
                      aria-label="Dislike this response"
                      title="Dislike"
                    >
                      👎 {dislikes[message.id]?.count}
                    </button>
                  )}
                  <button
                    className="action-button"
                    onClick={() => handleCopy(message.id, message.text)}
                    aria-label="Copy this response"
                    title="Copy"
                  >
                    📋
                  </button>
                  {showCopyTooltip[message.id] && (
                    <span className="tooltip">Copied!</span>
                  )}
                  <button
                    className="action-button"
                    onClick={() => handleShare(message.id, message.text)}
                    aria-label="Share this response"
                    title="Share"
                  >
                    🔗
                  </button>
                  {showTooltip[message.id]?.share && (
                    <span className="tooltip">
                      {showTooltip[message.id].share === "shared"
                        ? "Shared!"
                        : "Sharing not supported"}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
          <div className="thinking">
            {isThinking && <span>Thinking...</span>}
          </div>
          <span className="timestamp">
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <div ref={messagesEndRef} />
        </div>
        <div className="scroll-to-last">
          <button
            onClick={() =>
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            className="scroll-button"
            title="Scroll to last message"
          >
            🧲
          </button>
        </div>
        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="chat-input"
          />
          <button onClick={handleSend} className="send-button">
            Send
          </button>
          <button
            onClick={() => setInput("")}
            className="clear-btn"
            title="Clear input"
          >
            ✕
          </button>
        </div>
      </main>

      <footer className="footer">
        <p>© 2025 ChatAI. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
