import React, { useEffect, useState } from "react";

const Toast = ({ message, type, onClose }) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(true);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (isFading) {
      const fadeOutTimer = setTimeout(() => {
        onClose();
      }, 500);

      return () => {
        clearTimeout(fadeOutTimer);
      };
    }
  }, [isFading, onClose]);

  const typeClass = `toast-${type}`;

  return (
    <div className={`toast ${typeClass} ${isFading ? "fade-out" : ""}`}>
      <div className="toast-message">{message}</div>
      <button className="toast-close-button" onClick={onClose}>
        &times;
      </button>
    </div>
  );
};

export default Toast;
