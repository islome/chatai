import React from 'react';
import './Subscription.css';

function Subscription() {
  return (
    <div className="subscription-page">
      <h1 className="subscription-title">Unlock the Power of ChatAI Pro</h1>
      <p className="subscription-subtitle">
        Upgrade to Pro for unlimited chats, advanced features, and priority support.
      </p>

      <div className="pricing-card">
        <h2 className="plan-title">Pro Plan</h2>
        <p className="plan-price">$9.99<span>/month</span></p>
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

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-item">
          <h3>What is ChatAI Pro?</h3>
          <p>ChatAI Pro is a premium subscription that offers enhanced features, unlimited usage, and priority support for a seamless experience.</p>
        </div>
        <div className="faq-item">
          <h3>Can I cancel my subscription?</h3>
          <p>Yes, you can cancel anytime from your account settings with no penalties.</p>
        </div>
        <div className="faq-item">
          <h3>Is there a free trial?</h3>
          <p>Currently, we don’t offer a free trial, but our pricing is flexible, and you can cancel anytime.</p>
        </div>
      </div>
    </div>
  );
}

export default Subscription;