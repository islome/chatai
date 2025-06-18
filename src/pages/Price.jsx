import React, { useState, useEffect, useRef } from "react";
import "./Subscription.css";

function Subscription() {
  const [theme, setTheme] = useState("light");
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    document.documentElement.setAttribute(
      "data-theme",
      systemTheme.matches ? "dark" : "light"
    );

    const handleChange = (e) => {
      document.documentElement.setAttribute(
        "data-theme",
        e.matches ? "dark" : "light"
      );
      setTheme(e.matches ? "dark" : "light");
    };

    systemTheme.addEventListener("change", handleChange);
    return () => systemTheme.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      console.log("Message sent:", input); // Replace with your send logic
      setInput("");
    }
  };

  return (
    <div className="subscription-page">
      <button className="back-button" onClick={() => window.history.back()}>
        ← Back
      </button>
      <h1 className="subscription-title">Unlock the Pro version of ChatBro</h1>
      <p className="subscription-subtitle">
        Upgrade to Pro for unlimited chats, advanced features, and priority support.
      </p>

      <div className="pricing-card">
        <h2 className="plan-title">Pro Plan</h2>
        <p className="plan-price">
          $9.99<span>/month</span>
        </p>
        <ul className="features-list">
          <li>Unlimited chat messages</li>
          <li>Access to advanced AI models</li>
          <li>Priority customer support</li>
          <li>Exclusive Pro features (coming soon)</li>
          <li>Ad-free experience</li>
        </ul>
        <button className="subscribe-button">Subscribe Now</button>
        <p className="cancel-note">Cancel anytime. No long-term contracts.</p>
      </div>

      <div className="chat-input-container">
        <textarea
          ref={textareaRef}
          value={input}
          maxLength={250}
          rows={1}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about Pro..."
          className="chat-input"
        />
        <button
          className="send-button"
          onClick={() => {
            console.log("Message sent:", input); // Replace with your send logic
            setInput("");
          }}
        >
          Send
        </button>
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-item">
          <h3>What is ChatBro Pro?</h3>
          <p>
            ChatBro Pro is a premium subscription that offers enhanced features,
            unlimited usage, and priority support for a seamless experience.
          </p>
        </div>
        <div className="faq-item">
          <h3>Can I cancel my subscription?</h3>
          <p>
            Yes, you can cancel anytime from your account settings with no penalties.
          </p>
        </div>
        <div className="faq-item">
          <h3>Is there a free trial?</h3>
          <p>
            Currently, we don’t offer a free trial, but our pricing is flexible, and
            you can cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Subscription;