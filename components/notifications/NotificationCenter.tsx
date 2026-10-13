"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Bell, Check, Trash2 } from "lucide-react";

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkRead,
  onClearAll,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="w-80 bg-card border border-border rounded-lg shadow-lg flex flex-col max-h-[500px]">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {unreadCount} new
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClearAll} className="h-8 px-2 text-xs text-muted-foreground">
          Clear all
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No notifications at this time
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-md border text-sm transition-colors ${
                notification.read
                  ? "bg-card border-border text-muted-foreground"
                  : "bg-muted/40 border-primary/20 text-foreground"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs leading-none mb-1">{notification.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{notification.body}</p>
                </div>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMarkRead(notification.id)}
                    className="h-6 w-6 text-primary hover:text-primary/80"
                    title="Mark as read"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-border bg-card">
        <Button variant="outline" size="sm" onClick={onClearAll} className="w-full text-xs">
          Mark all as read
        </Button>
      </div>
    </div>
  );
};