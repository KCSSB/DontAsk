import React from "react";
import "./NotificationList.css";
import notificationBell_icon from "./notificationBell_icon.png";

const notifications = [];

export default function NotificationList({ show }) {
  return (
    <div className={`notification-wrapper ${show ? "active" : ""}`}>
      <div className="notification-list-container">
        <div className="notification-header">
          <div className="notification-icon">
            <img src={notificationBell_icon} alt="NOTIFICATIONS" />
          </div>
          <h3 className="notification-header-title">Уведомления</h3>
        </div>
        <div className="notification-list-content">
          {notifications.length === 0 ? (
            <p className="no-notifications-text">Новых уведомлений нет</p>
          ) : (
            <ul></ul>
          )}
        </div>
      </div>
    </div>
  );
}
