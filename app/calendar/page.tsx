"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Calendar,
  Clock,
  Users,
  CalendarDays,
  Plus,
  Video,
  ExternalLink,
  Copy,
  Check,
  CalendarPlus,
  Sparkles,
} from "lucide-react";

interface MeetingItem {
  id: string;
  title: string;
  description?: string;
  meetLink?: string;
  provider?: string;
  startsAt: string;
  endsAt: string;
  timezone?: string;
  status?: string;
}

export default function CalendarPage() {
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/meetings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.meetings)) {
          setMeetings(data.meetings);
        }
      })
      .catch((err) => console.error("Error loading meetings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (id: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDay = new Date().getDate();

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar & Scheduling</h1>
          <p className="text-muted-foreground">
            Manage your schedule, Google Meet video sessions, and synchronized domain events.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/create-meeting">
            <Button className="gap-2">
              <CalendarPlus className="h-4 w-4" /> Schedule Meeting
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Calendar View */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Monthly Schedule</CardTitle>
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-muted-foreground">
              {days.map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
                const isToday = date === currentDay;
                return (
                  <div
                    key={date}
                    className={`h-12 border rounded-md p-1 flex flex-col items-center justify-between transition-colors hover:border-primary cursor-pointer ${
                      isToday ? "border-primary bg-primary/10 font-bold" : "border-border/60"
                    }`}
                  >
                    <span className="text-xs">{date}</span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Agenda View */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Scheduled Sessions</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                Loading schedule...
              </div>
            ) : meetings.length === 0 ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-sm text-muted-foreground">No meetings scheduled yet.</p>
                <Link href="/create-meeting">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Schedule One Now
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {meetings.map((m) => {
                  const isGoogle = m.provider === "google";
                  const dateStr = new Date(m.startsAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={m.id}
                      className="p-3 rounded-lg border border-border bg-card space-y-2 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-sm leading-tight">{m.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {dateStr} ({m.timezone || "UTC"})
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            isGoogle
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {isGoogle ? "Google Meet" : "NexMeet"}
                        </span>
                      </div>

                      {m.meetLink && (
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={m.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button size="sm" variant="outline" className="w-full h-7 text-xs gap-1">
                              <Video className="h-3 w-3 text-primary" />
                              Join Call
                              <ExternalLink className="h-3 w-3 ml-auto opacity-70" />
                            </Button>
                          </a>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(m.id, m.meetLink!)}
                            className="h-7 px-2 text-xs"
                            title="Copy link"
                          >
                            {copiedId === m.id ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Availability Settings */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Availability Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Working Hours</label>
                <Input defaultValue="9:00 AM - 5:00 PM" className="w-full" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Default Timezone</label>
                <Select defaultValue="UTC">
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                    <SelectItem value="EST">EST (Eastern Standard Time)</SelectItem>
                    <SelectItem value="PST">PST (Pacific Standard Time)</SelectItem>
                    <SelectItem value="IST">IST (India Standard Time)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Switch defaultChecked id="default-avail" />
              <label htmlFor="default-avail" className="text-sm text-muted-foreground cursor-pointer">
                Synchronize Google Calendar busy slots with NexMeet availability
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}