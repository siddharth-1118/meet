"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Video, VideoOff, Settings2, ShieldCheck, ArrowRight } from "lucide-react";

interface PreJoinLobbyProps {
  onJoin: (roomName: string, participantName: string) => void;
  networkName: string;
}

export const PreJoinLobby: React.FC<PreJoinLobbyProps> = ({
  onJoin,
  networkName,
}) => {
  const [participantName, setParticipantName] = useState("Siddharth");
  const [role, setRole] = useState("host");
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let localStream: MediaStream | null = null;
    const startPreview = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          setStream(localStream);
          if (videoRef.current) {
            videoRef.current.srcObject = localStream;
          }
        }
      } catch (err) {
        console.warn("Media devices not accessible or permission denied, using simulated preview:", err);
      }
    };

    if (isCameraOn) {
      startPreview();
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isCameraOn]);

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraOn;
      });
    }
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicOn;
      });
    }
    setIsMicOn(!isMicOn);
  };

  const handleJoin = () => {
    if (!participantName.trim()) return;
    const room = `nexmeet-${(networkName || "general").toLowerCase()}-${Date.now().toString().slice(-4)}`;
    onJoin(room, participantName);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-lg p-6 md:p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5" /> Domain Encrypted Session
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Ready to join meeting?</h2>
          <p className="text-sm text-muted-foreground">
            Configure your audio and video before entering the room.
          </p>
        </div>

        {/* Video Preview Box */}
        <div className="relative aspect-video w-full bg-muted rounded-lg overflow-hidden border border-border flex items-center justify-center">
          {isCameraOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-background/50 flex items-center justify-center text-xl font-bold">
                {participantName.substring(0, 2).toUpperCase() || "U"}
              </div>
              <span className="text-xs">Camera is turned off</span>
            </div>
          )}

          {/* Quick controls on preview overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-background/80 backdrop-blur px-4 py-2 rounded-full border border-border/80 shadow">
            <Button
              type="button"
              variant={isMicOn ? "default" : "destructive"}
              size="icon"
              onClick={toggleMic}
              className="rounded-full h-9 w-9"
              title={isMicOn ? "Mute microphone" : "Unmute microphone"}
            >
              {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            <Button
              type="button"
              variant={isCameraOn ? "default" : "destructive"}
              size="icon"
              onClick={toggleCamera}
              className="rounded-full h-9 w-9"
              title={isCameraOn ? "Turn off camera" : "Turn on camera"}
            >
              {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Details & Join Form */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold mb-1 block">Display Name</label>
            <Input
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block">Role in Session</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="host">Host / Presenter</SelectItem>
                <SelectItem value="attendee">Attendee / Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleJoin}
          className="w-full gap-2 h-11 text-base font-medium"
        >
          Join Meeting Now <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};