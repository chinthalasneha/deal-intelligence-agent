import React from 'react';
import { motion } from 'framer-motion';
import { Check, Calendar, Flag, Sparkles } from 'lucide-react';
import './CallTimeline.css';

export default function CallTimeline({ calls, selectedCallNumber, onSelectCall }) {
  if (!calls || calls.length === 0) return null;

  // Helper to determine sentiment class
  const getSentimentClass = (sentiment) => {
    if (!sentiment) return 'neutral';
    const s = sentiment.toLowerCase();
    if (s.includes('positive') || s.includes('ready') || s.includes('won') || s.includes('enthusiastic')) {
      return 'success';
    }
    if (s.includes('neutral') || s.includes('warming')) {
      return 'warning';
    }
    return 'danger';
  };

  return (
    <div className="timeline-root">
      {/* Top Header Bar */}
      <div className="timeline-header">
        <div className="timeline-title-group">
          <Sparkles className="timeline-title-icon" />
          <h3 className="timeline-title-text">
            Sales Call Memory Timeline
          </h3>
        </div>

        {/* Sentiment Legend */}
        <div className="timeline-legend">
          <span className="timeline-legend-item">
            <span className="timeline-legend-dot danger" />
            Hesitant
          </span>
          <span className="timeline-legend-item">
            <span className="timeline-legend-dot warning" />
            Warming Up
          </span>
          <span className="timeline-legend-item">
            <span className="timeline-legend-dot success" />
            Positive / Closed
          </span>
        </div>
      </div>

      {/* Calls Stepper Box Container (Calls Green Background + Cream Border) */}
      <div className="timeline-stepper-box">
        {/* Progress Connecting Line */}
        <div className="timeline-track">
          <motion.div
            className="timeline-progress-bar"
            initial={{ width: '0%' }}
            animate={{
              width: `${((selectedCallNumber - 1) / (calls.length - 1 || 1)) * 100}%`,
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>

        {/* Stepper Nodes */}
        <div className="timeline-nodes-row">
          {calls.map((call) => {
            const isSelected = call.call_number === selectedCallNumber;
            const isCompleted = call.call_number < selectedCallNumber;
            const sentimentClass = getSentimentClass(call.sentiment);

            return (
              <div key={call.call_number} className="timeline-node-item">
                {/* Node Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectCall(call.call_number)}
                  className={`timeline-node-btn ${
                    isSelected
                      ? 'is-selected'
                      : isCompleted
                      ? `is-completed sentiment-${sentimentClass}`
                      : `is-upcoming sentiment-${sentimentClass}`
                  }`}
                >
                  {/* Outer Pulsing Ring Indicator on Selected Call */}
                  {isSelected && (
                    <span className="timeline-node-ring animate-ping" />
                  )}

                  {/* Icon or Number */}
                  {isCompleted ? (
                    <Check className="w-6 h-6 stroke-[3]" />
                  ) : (
                    <span>{call.call_number}</span>
                  )}
                </motion.button>

                {/* Call Label & Sentiment Badge */}
                <div className="timeline-call-info">
                  <span
                    className={`timeline-call-label ${isSelected ? 'is-selected' : ''}`}
                  >
                    Call #{call.call_number}
                  </span>

                  <span className={`timeline-sentiment-badge ${sentimentClass}`}>
                    {call.sentiment || 'Call Record'}
                  </span>
                </div>

                {/* Hover Tooltip */}
                <div className="timeline-tooltip">
                  <div className="timeline-tooltip-card">
                    <div className="timeline-tooltip-date">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{call.date}</span>
                    </div>
                    <div className="timeline-tooltip-stage">
                      <Flag className="w-3.5 h-3.5" />
                      <span>{call.deal_stage}</span>
                    </div>
                    <p className="timeline-tooltip-quote">
                      "{call.key_quote}"
                    </p>
                  </div>
                  <div className="timeline-tooltip-arrow" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
