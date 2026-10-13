"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/ui/avatar";
import {
  Check,
  Video,
  Calendar,
  Repeat,
  ShieldCheck,
  Users,
  Copy,
  ExternalLink,
  CalendarCheck,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  LogOut,
} from "lucide-react";

interface GoogleAuthStatus {
  isConfigured: boolean;
  isConnected: boolean;
  email: string | null;
  hasRefreshToken: boolean;
}

interface CreatedMeetingData {
  id: string;
  title: string;
  meetLink: string;
  htmlLink?: string | null;
  googleEventId?: string | null;
  startsAt: string;
  endsAt: string;
  timezone: string;
  provider: string;
  usedRealGoogleApi: boolean;
}

export default function CreateMeeting() {
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState<"google" | "nexmeet">("google");
  const [meetingType, setMeetingType] = useState<"instant" | "scheduled" | "recurring">("scheduled");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("design-guild");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [agenda, setAgenda] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 15);
    return d.toISOString().slice(0, 16);
  });
  const [duration, setDuration] = useState(45);
  const [timezone, setTimezone] = useState("UTC");
  const [attendeeEmails, setAttendeeEmails] = useState("");
  const [waitingRoom, setWaitingRoom] = useState(true);
  const [muteOnEntry, setMuteOnEntry] = useState(true);
  const [recording, setRecording] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [sendNotifications, setSendNotifications] = useState(true);
  const [strictGuestAccess, setStrictGuestAccess] = useState(true);

  // Google OAuth State
  const [googleStatus, setGoogleStatus] = useState<GoogleAuthStatus>({
    isConfigured: false,
    isConnected: false,
    email: null,
    hasRefreshToken: false,
  });
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Success state
  const [createdMeeting, setCreatedMeeting] = useState<CreatedMeetingData | null>(null);

  // Fetch Google Auth Status
  const fetchGoogleStatus = async () => {
    setIsLoadingAuth(true);
    try {
      const res = await fetch("/api/auth/google/status");
      if (res.ok) {
        const data = await res.json();
        setGoogleStatus(data);
      }
    } catch (e) {
      console.error("Failed to check Google status:", e);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  useEffect(() => {
    fetchGoogleStatus();

    // Check URL parameters for status/errors
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("google_connected") === "true") {
        fetchGoogleStatus();
      }
      if (params.get("google_error")) {
        setErrorMessage(
          params.get("google_error") === "missing_credentials"
            ? "Google OAuth credentials are missing from .env.local."
            : `Google Auth Error: ${decodeURIComponent(params.get("google_error") || "")}`
        );
      }
    }
  }, []);

  const handleDisconnectGoogle = async () => {
    if (!confirm("Are you sure you want to disconnect Google Calendar?")) return;
    try {
      await fetch("/api/auth/google/status", { method: "DELETE" });
      await fetchGoogleStatus();
    } catch (e) {
      console.error("Disconnect error:", e);
    }
  };

  const handleFinalizeMeeting = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const attendees = attendeeEmails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    try {
      if (provider === "google") {
        const res = await fetch("/api/meetings/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title || "NexMeet Google Meeting",
            description,
            agenda,
            startTime: meetingType === "instant" ? new Date().toISOString() : new Date(startDate).toISOString(),
            duration,
            timezone,
            attendees,
            networkId: selectedNetwork,
            meetingType,
            allowFallback: true, // Allows preview generation if credentials not yet configured
            sendNotifications,
            guestsCanInviteOthers: !strictGuestAccess,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to create Google Meet meeting");
        }

        setCreatedMeeting(data.meeting);
      } else {
        const res = await fetch("/api/meetings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title || "NexMeet In-App Session",
            description,
            agenda,
            networkId: selectedNetwork,
            type: meetingType,
            startTime: meetingType === "instant" ? new Date().toISOString() : new Date(startDate).toISOString(),
            duration,
            timezone,
            waitingRoom,
            recording,
            captions,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to create meeting");
        }

        setCreatedMeeting(data.meeting);
      }
    } catch (err: any) {
      console.error("Error finalizing meeting:", err);
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const steps = [
    { num: 1, name: "Provider & Type" },
    { num: 2, name: "Network" },
    { num: 3, name: "Details" },
    { num: 4, name: "Invite" },
    { num: 5, name: "Settings" },
    { num: 6, name: "Review" },
  ];

  // If meeting was created, render Success / Celebration view
  if (createdMeeting) {
    const isGoogle = createdMeeting.provider === "google";

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
        <Card className="border-primary/30 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <CalendarCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {isGoogle ? "Google Meet Successfully Created!" : "NexMeet Room Scheduled!"}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {isGoogle
                ? createdMeeting.usedRealGoogleApi
                  ? "Created directly in Google Calendar with live Google Meet video conference."
                  : "Google Meet session generated. Link is ready to share with attendees."
                : "Your encrypted NexMeet virtual room is provisioned."}
            </p>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            {/* Meeting Link Banner */}
            <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  {isGoogle ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Google Meet Video Link
                    </span>
                  ) : (
                    <span>NexMeet Video Room</span>
                  )}
                </span>
                <span className="text-[11px] bg-secondary px-2 py-0.5 rounded text-foreground">
                  {createdMeeting.timezone}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-background p-2.5 rounded-lg border">
                <LinkIcon className="h-4 w-4 text-primary shrink-0" />
                <input
                  type="text"
                  readOnly
                  value={createdMeeting.meetLink}
                  className="bg-transparent border-0 text-sm font-mono flex-1 focus:outline-none select-all truncate"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyLink(createdMeeting.meetLink)}
                  className="gap-1.5 shrink-0 h-8"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-xs text-emerald-600 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span className="text-xs">Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={createdMeeting.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full gap-2 bg-primary text-primary-foreground h-11">
                  <Video className="h-4 w-4" />
                  Join {isGoogle ? "Google Meet" : "NexMeet Room"} Now
                  <ExternalLink className="h-3.5 w-3.5 ml-auto opacity-70" />
                </Button>
              </a>

              {createdMeeting.htmlLink ? (
                <a
                  href={createdMeeting.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button variant="outline" className="w-full gap-2 h-11">
                    <Calendar className="h-4 w-4" />
                    View in Google Calendar
                    <ExternalLink className="h-3.5 w-3.5 ml-auto opacity-70" />
                  </Button>
                </a>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleCopyLink(createdMeeting.meetLink)}
                  className="w-full gap-2 h-11"
                >
                  <Copy className="h-4 w-4" />
                  Copy Invitation Details
                </Button>
              )}
            </div>

            {/* Summary Details */}
            <div className="rounded-lg bg-muted/40 p-4 space-y-2 text-sm border">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Title:</span>
                <span className="font-semibold">{createdMeeting.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Scheduled Time:</span>
                <span className="font-medium">
                  {new Date(createdMeeting.startsAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Provider:</span>
                <span className="font-medium capitalize">{createdMeeting.provider}</span>
              </div>
              {createdMeeting.googleEventId && (
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Google Event ID:</span>
                  <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
                    {createdMeeting.googleEventId}
                  </span>
                </div>
              )}
            </div>

            {/* Back to creation */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCreatedMeeting(null);
                  setStep(1);
                }}
                className="flex-1"
              >
                Schedule Another Meeting
              </Button>
              <a href="/calendar" className="flex-1">
                <Button variant="secondary" className="w-full">
                  Go to Calendar
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Create Meeting</h1>
        <p className="text-muted-foreground">
          Schedule authentic Google Meet video sessions or custom encrypted NexMeet rooms with calendar sync.
        </p>
      </header>

      {/* Stepper */}
      <div className="grid grid-cols-6 gap-2">
        {steps.map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setStep(s.num)}
            className={`py-2 px-1 text-center rounded-md border text-xs font-medium transition-colors ${
              step === s.num
                ? "bg-primary text-primary-foreground border-primary"
                : step > s.num
                ? "bg-muted text-foreground border-border"
                : "bg-background text-muted-foreground border-border/60 hover:bg-muted"
            }`}
          >
            <div className="truncate">{s.num}. {s.name}</div>
          </button>
        ))}
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="p-3.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 text-sm flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Notice: </span>
            {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step 1: Provider & Meeting Type */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Provider Selection Card */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>1. Select Meeting Provider</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Where should the call happen?
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Google Meet Option */}
                <button
                  type="button"
                  onClick={() => setProvider("google")}
                  className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all relative ${
                    provider === "google"
                      ? "border-primary bg-primary/5 ring-2 ring-primary"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        G
                      </div>
                      <span className="font-semibold text-base">Google Meet</span>
                    </div>
                    {provider === "google" && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Generates official <code className="text-primary font-mono text-[11px]">meet.google.com</code> link, automatically adds event to Google Calendar, and invites attendees.
                  </div>
                </button>

                {/* NexMeet Native Room Option */}
                <button
                  type="button"
                  onClick={() => setProvider("nexmeet")}
                  className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all relative ${
                    provider === "nexmeet"
                      ? "border-primary bg-primary/5 ring-2 ring-primary"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                        <Video className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-base">NexMeet Virtual Room</span>
                    </div>
                    {provider === "nexmeet" && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    In-browser WebRTC room with custom pre-join lobby, network governance, and domain-level recording.
                  </div>
                </button>
              </div>

              {/* Google Connection Bar (only visible when Google Meet is selected) */}
              {provider === "google" && (
                <div className="p-4 rounded-xl border bg-muted/30 space-y-3 mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          googleStatus.isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                        }`}
                      />
                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          Google Calendar Integration:
                          {googleStatus.isConnected ? (
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              Connected ({googleStatus.email || "Active"})
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-muted-foreground">
                              {googleStatus.isConfigured ? "Not Connected" : "Credentials Ready"}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {googleStatus.isConnected
                            ? "Connected to Google Calendar API. Meetings will be created on your Google account."
                            : "Connect your Google account to generate genuine meet.google.com links directly."}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {googleStatus.isConnected ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleDisconnectGoogle}
                          className="gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-500/10 h-8"
                        >
                          <LogOut className="h-3.5 w-3.5" /> Disconnect
                        </Button>
                      ) : (
                        <a href="/api/auth/google">
                          <Button size="sm" className="gap-1.5 text-xs h-8">
                            <Sparkles className="h-3.5 w-3.5" /> Connect with Google
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Credentials instructions helper */}
                  {!googleStatus.isConfigured && (
                    <div className="text-xs pt-1 border-t border-border/50">
                      <button
                        type="button"
                        onClick={() => setShowConfigHelp(!showConfigHelp)}
                        className="text-primary hover:underline flex items-center gap-1 font-medium"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                        {showConfigHelp ? "Hide Google OAuth instructions" : "How to connect Google Cloud Console (Client ID & Secret)"}
                      </button>

                      {showConfigHelp && (
                        <div className="mt-3 p-3 rounded-lg bg-background border space-y-2 text-muted-foreground text-xs leading-relaxed">
                          <p className="font-medium text-foreground">
                            Steps to configure real Google Meet links:
                          </p>
                          <ol className="list-decimal pl-4 space-y-1">
                            <li>
                              Open{" "}
                              <a
                                href="https://console.cloud.google.com/apis/dashboard"
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary underline"
                              >
                                Google Cloud Console
                              </a>
                              .
                            </li>
                            <li>Enable the <strong>Google Calendar API</strong> in your project.</li>
                            <li>
                              Go to <strong>APIs &amp; Services &gt; Credentials</strong>, create an <strong>OAuth 2.0 Client ID</strong> (Web Application).
                            </li>
                            <li>
                              Add Authorized Redirect URI:
                              <div className="my-1 font-mono text-[11px] bg-muted p-1.5 rounded text-foreground flex items-center justify-between">
                                <span>http://localhost:3000/api/auth/callback/google</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-[10px]"
                                  onClick={() => handleCopyLink("http://localhost:3000/api/auth/callback/google")}
                                >
                                  Copy
                                </Button>
                              </div>
                            </li>
                            <li>
                              Add <code className="bg-muted px-1 rounded">GOOGLE_CLIENT_ID</code> and <code className="bg-muted px-1 rounded">GOOGLE_CLIENT_SECRET</code> to your <code className="bg-muted px-1 rounded">.env.local</code>.
                            </li>
                          </ol>
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 pt-1">
                            Tip: You can also schedule meetings right now! If Google is not connected yet, NexMeet will generate a preview Google Meet link format so you can test the full flow immediately.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mode Selection Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">2. Meeting Schedule Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setMeetingType("instant")}
                  className={`p-4 rounded-lg border text-left flex flex-col gap-2 transition-all ${
                    meetingType === "instant"
                      ? "border-primary bg-primary/5 ring-2 ring-primary"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <Video className="h-6 w-6 text-primary" />
                  <div className="font-semibold text-sm">Instant Call</div>
                  <div className="text-xs text-muted-foreground">Start an immediate room and share link directly.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setMeetingType("scheduled")}
                  className={`p-4 rounded-lg border text-left flex flex-col gap-2 transition-all ${
                    meetingType === "scheduled"
                      ? "border-primary bg-primary/5 ring-2 ring-primary"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <Calendar className="h-6 w-6 text-primary" />
                  <div className="font-semibold text-sm">Scheduled Meeting</div>
                  <div className="text-xs text-muted-foreground">Pick a designated date, time window, and agenda.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setMeetingType("recurring")}
                  className={`p-4 rounded-lg border text-left flex flex-col gap-2 transition-all ${
                    meetingType === "recurring"
                      ? "border-primary bg-primary/5 ring-2 ring-primary"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <Repeat className="h-6 w-6 text-primary" />
                  <div className="font-semibold text-sm">Recurring Series</div>
                  <div className="text-xs text-muted-foreground">Weekly standups, syncs, or recurring reviews.</div>
                </button>
              </div>

              <Button onClick={() => setStep(2)} className="w-full mt-4">
                Next: Network Selection <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Network Selection */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Network Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">Governing Network</Label>
              <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a network domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="design-guild">Design Guild</SelectItem>
                  <SelectItem value="cs-department">CS Department</SelectItem>
                  <SelectItem value="startup-team">Startup Team</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Network access policies and recording retention will apply to this meeting.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Next: Meeting Details <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Meeting Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Meeting Title</Label>
              <Input
                placeholder="e.g. Q4 Roadmap Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {meetingType !== "instant" && (
              <div>
                <Label className="mb-1.5 block">Date &amp; Start Time</Label>
                <Input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            )}

            <div>
              <Label className="mb-1.5 block">Description</Label>
              <Input
                placeholder="Short description of the meeting goal"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-1.5 block">Agenda (Synchronized with Google Calendar)</Label>
              <Input
                placeholder="1. Topic A; 2. Topic B; 3. Action items"
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Duration (minutes)</Label>
                <Select
                  value={duration.toString()}
                  onValueChange={(val) => setDuration(parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC (Universal Time)</SelectItem>
                    <SelectItem value="America/New_York">EST (US Eastern)</SelectItem>
                    <SelectItem value="America/Los_Angeles">PST (US Pacific)</SelectItem>
                    <SelectItem value="Asia/Kolkata">IST (India Standard Time)</SelectItem>
                    <SelectItem value="Europe/London">GMT (London)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1">
                Next: Invite Attendees <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Invite People */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Invite Attendees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: "John Doe", email: "john@nexmeet.local", role: "Design Lead" },
                { name: "Alice Smith", email: "alice@nexmeet.local", role: "Staff Eng" },
                { name: "Mike Johnson", email: "mike@nexmeet.local", role: "Product Mgr" },
                { name: "Sarah Connor", email: "sarah@nexmeet.local", role: "Security" },
              ].map((attendee) => (
                <div
                  key={attendee.name}
                  onClick={() => {
                    if (!attendeeEmails.includes(attendee.email)) {
                      setAttendeeEmails((prev) => (prev ? `${prev}, ${attendee.email}` : attendee.email));
                    }
                  }}
                  className="p-3 border rounded-lg text-center bg-card hover:border-primary cursor-pointer transition-colors"
                >
                  <Avatar className="mx-auto mb-2" fallback={attendee.name.substring(0, 2)} />
                  <div className="text-xs font-semibold">{attendee.name}</div>
                  <div className="text-[10px] text-muted-foreground">{attendee.role}</div>
                  <div className="text-[10px] text-primary mt-1">+ Add</div>
                </div>
              ))}
            </div>

            <div>
              <Label className="mb-1.5 block">Attendee Email Addresses (comma separated)</Label>
              <Input
                placeholder="colleague@domain.com, partner@team.org"
                value={attendeeEmails}
                onChange={(e) => setAttendeeEmails(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                {provider === "google"
                  ? "Attendees will receive calendar invitations and the Google Meet video link directly from Google."
                  : "Invitees will receive NexMeet session notifications."}
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(5)} className="flex-1">
                Next: Security Settings <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Settings */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Room & Policy Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-emerald-500/5 border-emerald-500/20">
                <div>
                  <div className="font-medium text-sm flex items-center gap-2">
                    Send Calendar Email Invites
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-semibold">
                      Google Calendar
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Automatically sends email invitations with the Google Meet link, time, and RSVP to all attendees
                  </div>
                </div>
                <Switch checked={sendNotifications} onCheckedChange={setSendNotifications} />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Strict Attendee Access</div>
                  <div className="text-xs text-muted-foreground">
                    Only explicitly invited emails can join directly. Guests cannot invite outsiders, and uninvited people must ask host to join.
                  </div>
                </div>
                <Switch checked={strictGuestAccess} onCheckedChange={setStrictGuestAccess} />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Waiting Room</div>
                  <div className="text-xs text-muted-foreground">Admit attendees individually before entry</div>
                </div>
                <Switch checked={waitingRoom} onCheckedChange={setWaitingRoom} />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Mute on Entry</div>
                  <div className="text-xs text-muted-foreground">Keep mics muted until presenter invites questions</div>
                </div>
                <Switch checked={muteOnEntry} onCheckedChange={setMuteOnEntry} />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Record to Cloud</div>
                  <div className="text-xs text-muted-foreground">Automatically archive session and produce transcript</div>
                </div>
                <Switch checked={recording} onCheckedChange={setRecording} />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">AI Live Captions</div>
                  <div className="text-xs text-muted-foreground">Real-time speech-to-text transcriptions</div>
                </div>
                <Switch checked={captions} onCheckedChange={setCaptions} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(4)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(6)} className="flex-1">
                Next: Review <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Review & Confirm */}
      {step === 6 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Review & Launch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/40 p-4 space-y-2 text-sm border">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Platform Provider:</span>
                <span className="font-semibold text-primary capitalize flex items-center gap-1.5">
                  {provider === "google" ? "Google Meet (meet.google.com)" : "NexMeet In-App Room"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Title:</span>
                <span className="font-medium">{title || "Untitled Meeting"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Mode:</span>
                <span className="font-medium capitalize">{meetingType}</span>
              </div>
              {meetingType !== "instant" && (
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Start Time:</span>
                  <span className="font-medium">{new Date(startDate).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Network:</span>
                <span className="font-medium">{selectedNetwork}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{duration} minutes ({timezone})</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Attendees:</span>
                <span className="font-medium truncate max-w-[250px]">
                  {attendeeEmails || "None"}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(5)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleFinalizeMeeting}
                disabled={isSubmitting}
                className="flex-1 bg-primary text-primary-foreground gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating {provider === "google" ? "Google Meet..." : "Room..."}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {provider === "google" ? "Create Google Meet" : "Finalize & Launch"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}