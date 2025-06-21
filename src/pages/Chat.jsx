import { useEffect, useRef, useState } from "react";
import "../App.css";
import { Link } from "react-router-dom";

function Chat() {
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
  const textareaRef = useRef("");

  useEffect(() => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto"; // Reset height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set to content height
  }, [input]);

  useEffect(() => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

    // Avval boshlang‘ich theme o‘rnatish
    document.documentElement.setAttribute(
      "data-theme",
      systemTheme.matches ? "dark" : "light"
    );

    // Agar theme systemda o‘zgarsa, saytga ham o‘zgartirish
    const handleChange = (e) => {
      document.documentElement.setAttribute(
        "data-theme",
        e.matches ? "dark" : "light"
      );
    };

    systemTheme.addEventListener("change", handleChange);

    return () => {
      systemTheme.removeEventListener("change", handleChange);
    };
  }, []);

  const handleShare = (messageId, text) => {
    if (navigator.share) {
      navigator
        .share({
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
              text: `It's good to know, bro. ${userName}! I'll catch on my mind your name.`,
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
              text: `Yo, what's up ${
                userName || "bro"
              }! How are you doing. What can I help with?`,
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
              text: "I'm sorry to hear that. Remember, you're worthy of love and hChatiness. Stay strong!",
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
    <div className={`Chat ${theme}`}>
      <header className="header">
        <div className="logo">Chat with {userName || "Bro"}</div>
        <nav>
          <div className="navlink">
            <Link to={"/price"}>Pricing</Link>
          </div>
        </nav>
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
                    <span className="touch:w-10 flex h-8 w-8 items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon"
                      >
                        <path d="M12.668 10.667C12.668 9.95614 12.668 9.46258 12.6367 9.0791C12.6137 8.79732 12.5758 8.60761 12.5244 8.46387L12.4688 8.33399C12.3148 8.03193 12.0803 7.77885 11.793 7.60254L11.666 7.53125C11.508 7.45087 11.2963 7.39395 10.9209 7.36328C10.5374 7.33197 10.0439 7.33203 9.33301 7.33203H6.5C5.78896 7.33203 5.29563 7.33195 4.91211 7.36328C4.63016 7.38632 4.44065 7.42413 4.29688 7.47559L4.16699 7.53125C3.86488 7.68518 3.61186 7.9196 3.43555 8.20703L3.36524 8.33399C3.28478 8.49198 3.22795 8.70352 3.19727 9.0791C3.16595 9.46259 3.16504 9.95611 3.16504 10.667V13.5C3.16504 14.211 3.16593 14.7044 3.19727 15.0879C3.22797 15.4636 3.28473 15.675 3.36524 15.833L3.43555 15.959C3.61186 16.2466 3.86474 16.4807 4.16699 16.6348L4.29688 16.6914C4.44063 16.7428 4.63025 16.7797 4.91211 16.8027C5.29563 16.8341 5.78896 16.835 6.5 16.835H9.33301C10.0439 16.835 10.5374 16.8341 10.9209 16.8027C11.2965 16.772 11.508 16.7152 11.666 16.6348L11.793 16.5645C12.0804 16.3881 12.3148 16.1351 12.4688 15.833L12.5244 15.7031C12.5759 15.5594 12.6137 15.3698 12.6367 15.0879C12.6681 14.7044 12.668 14.211 12.668 13.5V10.667ZM13.998 12.665C14.4528 12.6634 14.8011 12.6602 15.0879 12.6367C15.4635 12.606 15.675 12.5492 15.833 12.4688L15.959 12.3975C16.2466 12.2211 16.4808 11.9682 16.6348 11.666L16.6914 11.5361C16.7428 11.3924 16.7797 11.2026 16.8027 10.9209C16.8341 10.5374 16.835 10.0439 16.835 9.33301V6.5C16.835 5.78896 16.8341 5.29563 16.8027 4.91211C16.7797 4.63025 16.7428 4.44063 16.6914 4.29688L16.6348 4.16699C16.4807 3.86474 16.2466 3.61186 15.959 3.43555L15.833 3.36524C15.675 3.28473 15.4636 3.22797 15.0879 3.19727C14.7044 3.16593 14.211 3.16504 13.5 3.16504H10.667C9.9561 3.16504 9.46259 3.16595 9.0791 3.19727C8.79739 3.22028 8.6076 3.2572 8.46387 3.30859L8.33399 3.36524C8.03176 3.51923 7.77886 3.75343 7.60254 4.04102L7.53125 4.16699C7.4508 4.32498 7.39397 4.53655 7.36328 4.91211C7.33985 5.19893 7.33562 5.54719 7.33399 6.00195H9.33301C10.022 6.00195 10.5791 6.00131 11.0293 6.03809C11.4873 6.07551 11.8937 6.15471 12.2705 6.34668L12.4883 6.46875C12.984 6.7728 13.3878 7.20854 13.6533 7.72949L13.7197 7.87207C13.8642 8.20859 13.9292 8.56974 13.9619 8.9707C13.9987 9.42092 13.998 9.97799 13.998 10.667V12.665ZM18.165 9.33301C18.165 10.022 18.1657 10.5791 18.1289 11.0293C18.0961 11.4302 18.0311 11.7914 17.8867 12.1279L17.8203 12.2705C17.5549 12.7914 17.1509 13.2272 16.6553 13.5313L16.4365 13.6533C16.0599 13.8452 15.6541 13.9245 15.1963 13.9619C14.8593 13.9895 14.4624 13.9935 13.9951 13.9951C13.9935 14.4624 13.9895 14.8593 13.9619 15.1963C13.9292 15.597 13.864 15.9576 13.7197 16.2939L13.6533 16.4365C13.3878 16.9576 12.9841 17.3941 12.4883 17.6982L12.2705 17.8203C11.8937 18.0123 11.4873 18.0915 11.0293 18.1289C10.5791 18.1657 10.022 18.165 9.33301 18.165H6.5C5.81091 18.165 5.25395 18.1657 4.80371 18.1289C4.40306 18.0962 4.04235 18.031 3.70606 17.8867L3.56348 17.8203C3.04244 17.5548 2.60585 17.151 2.30176 16.6553L2.17969 16.4365C1.98788 16.0599 1.90851 15.6541 1.87109 15.1963C1.83431 14.746 1.83496 14.1891 1.83496 13.5V10.667C1.83496 9.978 1.83432 9.42091 1.87109 8.9707C1.90851 8.5127 1.98772 8.10625 2.17969 7.72949L2.30176 7.51172C2.60586 7.0159 3.04236 6.6122 3.56348 6.34668L3.70606 6.28027C4.04237 6.136 4.40303 6.07083 4.80371 6.03809C5.14051 6.01057 5.53708 6.00551 6.00391 6.00391C6.00551 5.53708 6.01057 5.14051 6.03809 4.80371C6.0755 4.34588 6.15483 3.94012 6.34668 3.56348L6.46875 3.34473C6.77282 2.84912 7.20856 2.44514 7.72949 2.17969L7.87207 2.11328C8.20855 1.96886 8.56979 1.90385 8.9707 1.87109C9.42091 1.83432 9.978 1.83496 10.667 1.83496H13.5C14.1891 1.83496 14.746 1.83431 15.1963 1.87109C15.6541 1.90851 16.0599 1.98788 16.4365 2.17969L16.6553 2.30176C17.151 2.60585 17.5548 3.04244 17.8203 3.56348L17.8867 3.70606C18.031 4.04235 18.0962 4.40306 18.1289 4.80371C18.1657 5.25395 18.165 5.81091 18.165 6.5V9.33301Z"></path>
                      </svg>
                    </span>
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
                    <span className="touch:w-10 flex h-8 w-8 items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon"
                      >
                        <path d="M2.66821 12.6663V12.5003C2.66821 12.1331 2.96598 11.8353 3.33325 11.8353C3.70052 11.8353 3.99829 12.1331 3.99829 12.5003V12.6663C3.99829 13.3772 3.9992 13.8707 4.03052 14.2542C4.0612 14.6298 4.11803 14.8413 4.19849 14.9993L4.2688 15.1263C4.44511 15.4137 4.69813 15.6481 5.00024 15.8021L5.13013 15.8577C5.2739 15.9092 5.46341 15.947 5.74536 15.97C6.12888 16.0014 6.62221 16.0013 7.33325 16.0013H12.6663C13.3771 16.0013 13.8707 16.0014 14.2542 15.97C14.6295 15.9394 14.8413 15.8825 14.9993 15.8021L15.1262 15.7308C15.4136 15.5545 15.6481 15.3014 15.802 14.9993L15.8577 14.8695C15.9091 14.7257 15.9469 14.536 15.97 14.2542C16.0013 13.8707 16.0012 13.3772 16.0012 12.6663V12.5003C16.0012 12.1332 16.2991 11.8355 16.6663 11.8353C17.0335 11.8353 17.3313 12.1331 17.3313 12.5003V12.6663C17.3313 13.3553 17.3319 13.9124 17.2952 14.3626C17.2624 14.7636 17.1974 15.1247 17.053 15.4613L16.9866 15.6038C16.7211 16.1248 16.3172 16.5605 15.8215 16.8646L15.6038 16.9866C15.227 17.1786 14.8206 17.2578 14.3625 17.2952C13.9123 17.332 13.3553 17.3314 12.6663 17.3314H7.33325C6.64416 17.3314 6.0872 17.332 5.63696 17.2952C5.23642 17.2625 4.87552 17.1982 4.53931 17.054L4.39673 16.9866C3.87561 16.7211 3.43911 16.3174 3.13501 15.8216L3.01294 15.6038C2.82097 15.2271 2.74177 14.8206 2.70435 14.3626C2.66758 13.9124 2.66821 13.3553 2.66821 12.6663ZM9.33521 12.5003V4.9388L7.13696 7.13704C6.87732 7.39668 6.45625 7.39657 6.19653 7.13704C5.93684 6.87734 5.93684 6.45631 6.19653 6.19661L9.52954 2.86263L9.6311 2.77962C9.73949 2.70742 9.86809 2.66829 10.0002 2.66829C10.1763 2.66838 10.3454 2.73819 10.47 2.86263L13.804 6.19661C14.0633 6.45628 14.0634 6.87744 13.804 7.13704C13.5443 7.39674 13.1222 7.39674 12.8625 7.13704L10.6653 4.93977V12.5003C10.6651 12.8673 10.3673 13.1652 10.0002 13.1654C9.63308 13.1654 9.33538 12.8674 9.33521 12.5003Z"></path>
                      </svg>
                    </span>
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
        <div className="input-orqasi">
          <div className="input-area">
          <textarea
            ref={textareaRef}
            value={input}
            maxLength={250}
            rows={1}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask something"
            className="chat-input"
          />
          <button
            onClick={() => setInput("")}
            className="clear-btn"
            title="Clear input"
          >
            ✕
          </button>
          <button onClick={handleSend} className="send-button">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="icon"
            >
              <path d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z"></path>
            </svg>
          </button>
        </div>
        </div>
      </main>
      <div className="infocha">
        <p>ChatBro can make mistakes. Check if it is important.</p>
      </div>
    </div>
  );
}

export default Chat;
