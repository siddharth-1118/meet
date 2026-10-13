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
  User,
  Bell,
  Shield,
  Clock,
  Sparkles,
  Calendar,
  Check,
  Copy,
  ExternalLink,
  LogOut,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const [googleStatus, setGoogleStatus] = useState<{
    isConfigured: boolean;
    isConnected: boolean;
    email: string | null;
  }>({
    isConfigured: false,
    isConnected: false,
    email: null,
  });
  const [loadingGoogle, setLoadingGoogle] = useState(true);
  const [copiedRedirect, setCopiedRedirect] = useState(false);

  const redirectUri = typeof window !== "undefined"
    ? `${window.location.origin}/api/auth/callback/google`
    : "http://localhost:3000/api/auth/callback/google";

  const fetchGoogleStatus = async () => {
    try {
      const res = await fetch("/api/auth/google/status");
      if (res.ok) {
        const data = await res.json();
        setGoogleStatus(data);
      }
    } catch (e) {
      console.error("Error fetching Google status:", e);
    } finally {
      setLoadingGoogle(false);
    }
  };

  useEffect(() => {
    fetchGoogleStatus();
  }, []);

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Google Calendar?")) return;
    try {
      await fetch("/api/auth/google/status", { method: "DELETE" });
      await fetchGoogleStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const copyUri = () => {
    navigator.clipboard.writeText(redirectUri);
    setCopiedRedirect(true);
    setTimeout(() => setCopiedRedirect(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Account & Platform Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal profile, Google Meet integration, notification thresholds, and security policies.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Google Meet & Calendar Integration */}
        <Card className="md:col-span-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                Google Calendar &amp; Meet Integration
              </span>
              {googleStatus.isConnected ? (
                <span className="text-xs bg-emerald-500/10 text-emerald-600 font-semibold px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Connected: {googleStatus.email || "Active"}
                </span>
              ) : (
                <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
                  {googleStatus.isConfigured ? "Not Connected" : "Configuration Needed"}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              NexMeet integrates directly with Google Calendar to generate authentic{" "}
              <code className="text-foreground font-mono text-xs">meet.google.com</code> video meetings,
              automatically invite participants, and sync schedules.
            </p>

            <div className="p-3.5 rounded-lg border bg-muted/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Authorized Redirect URI</div>
                  <div className="text-xs text-muted-foreground">
                    Required when configuring OAuth 2.0 in Google Cloud Console
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-background px-2.5 py-1.5 rounded border">
                    {redirectUri}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyUri} className="h-8 gap-1">
                    {copiedRedirect ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-xs text-emerald-600">Copied</span>
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

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-border/50 gap-3">
                <div className="text-xs text-muted-foreground">
                  Credentials status:{" "}
                  <span className={googleStatus.isConfigured ? "text-emerald-600 font-semibold" : "text-amber-600 font-medium"}>
                    {googleStatus.isConfigured ? "GOOGLE_CLIENT_ID configured in .env.local" : "Pending in .env.local"}
                  </span>
                </div>
                <div>
                  {googleStatus.isConnected ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDisconnect}
                      className="text-red-600 hover:text-red-700 hover:bg-red-500/10 gap-1.5 h-8"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Disconnect Google
                    </Button>
                  ) : (
                    <a href="/api/auth/google">
                      <Button size="sm" className="gap-1.5 h-8 bg-primary">
                        <Sparkles className="h-3.5 w-3.5" /> Connect Google Account
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Domain Parent Website Integration & Gatekeeper */}
        <Card className="md:col-span-2 border-blue-500/20 bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Multi-Domain Website Integration &amp; Security Gatekeeper
              </span>
              <span className="text-xs bg-blue-500/10 text-blue-600 font-semibold px-2.5 py-1 rounded-full border border-blue-500/20">
                REST API v1 Active
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Domain leads and heads on your parent website can schedule and conduct Google Meet calls
              without needing your master host presence. The <strong>NexMeet Security Gatekeeper</strong> strictly
              verifies that only invited domain members can enter and isolates different domains.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* REST API Box */}
              <div className="p-3.5 rounded-lg border bg-muted/30 space-y-2">
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  1. Parent Site REST API Endpoint
                </div>
                <div className="text-xs font-mono bg-background p-2 rounded border truncate select-all">
                  POST /api/v1/meetings
                </div>
                <div className="text-[11px] text-muted-foreground leading-relaxed">
                  Call this from your backend when a Domain Lead schedules a meeting. Pass{" "}
                  <code>domainId</code>, <code>domainLeadEmail</code>, and <code>invitedEmails</code>.
                </div>
              </div>

              {/* Iframe Embed Box */}
              <div className="p-3.5 rounded-lg border bg-muted/30 space-y-2">
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  2. Gatekeeper Iframe Embed
                </div>
                <div className="text-xs font-mono bg-background p-2 rounded border truncate select-all">
                  &lt;iframe src=&quot;.../gatekeeper/[ID]?embed=true&quot; ... /&gt;
                </div>
                <div className="text-[11px] text-muted-foreground leading-relaxed">
                  Embed the Gatekeeper in your parent website or redirect users to it. Pass{" "}
                  <code>?email=...&amp;domain=...</code> for seamless single sign-on.
                </div>
              </div>
            </div>

            {/* Security Architecture Guarantees */}
            <div className="rounded-lg bg-muted/40 p-3.5 border space-y-1.5 text-xs">
              <div className="font-semibold text-foreground mb-1">Enforced Security Guarantees:</div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span><strong>Autonomous Call Flow:</strong> Domain leads and members enter and conduct meetings without you needing to join.</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span><strong>Protected Master Host Controls:</strong> Domain leads never receive your master Google credentials or administrative powers.</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span><strong>Strict Member Whitelist:</strong> Only explicitly invited email addresses can enter; uninvited external visitors are blocked.</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span><strong>Domain Boundary Isolation:</strong> Members from Domain A are prevented from accessing Domain B sessions.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14" fallback="SD" />
              <div>
                <Button variant="outline" size="sm">Change Avatar</Button>
              </div>
            </div>
            <div>
              <Label className="mb-1 block">Full Name</Label>
              <Input defaultValue="Siddharth V" />
            </div>
            <div>
              <Label className="mb-1 block">Email</Label>
              <Input defaultValue="siddharth@nexmeet.local" />
            </div>
            <Button size="sm">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Timezone & Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Timezone & Presence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-1 block">Working Hours</Label>
              <Input defaultValue="09:00 - 17:00" />
            </div>
            <div>
              <Label className="mb-1 block">Primary Timezone</Label>
              <Select defaultValue="IST">
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC (Universal Time)</SelectItem>
                  <SelectItem value="EST">EST (US Eastern)</SelectItem>
                  <SelectItem value="PST">PST (US Pacific)</SelectItem>
                  <SelectItem value="IST">IST (India Standard Time)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="sync-cal" className="cursor-pointer">Sync Google Calendar</Label>
              <Switch id="sync-cal" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Invitations</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Meeting Reminders (15 min prior)</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Transcript Generation Alerts</span>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security & Access */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Enforce Two-Factor Auth</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Automatic Session Timeout (30 min)</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">End-to-End Encryption (E2EE)</span>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}