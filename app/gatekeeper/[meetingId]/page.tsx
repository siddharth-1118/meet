"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck,
  ShieldAlert,
  Video,
  Clock,
  ExternalLink,
  CheckCircle2,
  Lock,
  ArrowRight,
  Mail,
  RefreshCw,
  Building,
} from "lucide-react";

export default function GatekeeperPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const meetingId = (params?.meetingId as string) || "";
  const initialEmail = searchParams.get("email") || "";
  const domainId = searchParams.get("domain") || "";
  const isEmbed = searchParams.get("embed") === "true";

  const [emailInput, setEmailInput] = useState(initialEmail);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    allowed?: boolean;
    reason?: string;
    meetLink?: string;
    title?: string;
    domainId?: string;
    role?: string;
    startsAt?: string;
    timezone?: string;
  } | null>(null);

  const performVerification = async (emailToVerify: string) => {
    if (!emailToVerify.trim()) return;
    setVerifying(true);
    setVerifyResult(null);

    try {
      const res = await fetch("/api/gatekeeper/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId,
          email: emailToVerify.trim(),
          domainId: domainId || undefined,
        }),
      });

      const data = await res.json();
      setVerifyResult(data);
    } catch (e: any) {
      setVerifyResult({
        allowed: false,
        reason: "Failed to connect to Gatekeeper verification service.",
      });
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (initialEmail && meetingId) {
      performVerification(initialEmail);
    }
  }, [initialEmail, meetingId]);

  return (
    <div
      className={`min-h-[85vh] flex items-center justify-center p-4 ${
        isEmbed ? "bg-transparent p-2" : "bg-muted/10"
      }`}
    >
      <div className="w-full max-w-lg space-y-4">
        {/* Verification Card */}
        <Card className="border shadow-lg">
          <CardHeader className="text-center pb-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold">NexMeet Security Gatekeeper</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Domain boundary verification &amp; attendee authorization for Google Meet.
            </p>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            {/* If not verified yet */}
            {!verifyResult && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  performVerification(emailInput);
                }}
                className="space-y-4"
              >
                <div className="p-3 rounded-lg border bg-muted/30 text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Building className="h-3.5 w-3.5 text-primary" />
                    <span>Domain Isolated Meeting</span>
                  </div>
                  <p>
                    Only invited domain members can enter. Host controls and unauthorized domains
                    are restricted.
                  </p>
                </div>

                <div>
                  <Label htmlFor="gatekeeper-email" className="text-xs mb-1.5 block">
                    Enter your invited email address
                  </Label>
                  <div className="relative">
                    <Mail className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                    <Input
                      id="gatekeeper-email"
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={verifying} className="w-full gap-2">
                  {verifying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Verifying Permission...
                    </>
                  ) : (
                    <>
                      Verify Identity &amp; Enter <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* If VERIFIED: ALLOWED */}
            {verifyResult && verifyResult.allowed && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
                    <ShieldCheck className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 text-base">
                    Access Approved
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your invitation in domain{" "}
                    <strong className="text-foreground capitalize">
                      {verifyResult.domainId}
                    </strong>{" "}
                    is verified. You can join the call autonomously.
                  </p>
                </div>

                <div className="rounded-lg bg-card p-3.5 border space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Meeting Title:</span>
                    <span className="font-semibold text-foreground">{verifyResult.title}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Your Role:</span>
                    <span className="font-semibold text-primary capitalize">
                      {verifyResult.role?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Security:</span>
                    <span className="text-emerald-600 font-medium">
                      Host Controls Protected
                    </span>
                  </div>
                </div>

                <a
                  href={verifyResult.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button className="w-full gap-2 bg-primary text-primary-foreground h-11 text-sm font-semibold">
                    <Video className="h-4 w-4" />
                    Join Google Meet Call
                    <ExternalLink className="h-3.5 w-3.5 ml-auto opacity-70" />
                  </Button>
                </a>
              </div>
            )}

            {/* If VERIFIED: DENIED */}
            {verifyResult && !verifyResult.allowed && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-600 flex items-center justify-center mx-auto">
                    <ShieldAlert className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="font-bold text-red-700 dark:text-red-400 text-base">
                    Access Denied
                  </div>
                  <p className="text-xs text-red-600/90 leading-relaxed">
                    {verifyResult.reason ||
                      "You are not authorized to access this domain meeting."}
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-muted/40 text-xs text-muted-foreground space-y-1">
                  <div className="font-semibold text-foreground">Why was access blocked?</div>
                  <p>
                    • This meeting is strictly restricted to invited domain members.
                  </p>
                  <p>
                    • External accounts and uninvited guests cannot access the Google Meet link.
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setVerifyResult(null);
                    setEmailInput("");
                  }}
                  className="w-full text-xs"
                >
                  Try with another email
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security badge at bottom */}
        <div className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
          <span>Protected by NexMeet Domain Security Gatekeeper</span>
        </div>
      </div>
    </div>
  );
}
