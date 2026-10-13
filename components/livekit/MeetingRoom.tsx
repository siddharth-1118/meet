"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Users,
  Radio,
  Share2,
  Subtitles,
  Send,
  ShieldCheck,
} from "lucide-react";

interface MeetingRoomProps {
  roomName: string;
  onLeave: () => void;
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({
  roomName,
  onLeave,
}) => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "System", text: "Welcome to NexMeet encrypted room.", time: "Now" },
    { sender: "Alice Smith", text: "Audio and video look crystal clear!", time: "Just now" },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let localStream: MediaStream | null = null;
    const startMedia = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
        }
      } catch (e) {
        console.warn("Camera preview fallback mode:", e);
      }
    };

    if (isCameraOn) {
      startMedia();
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isCameraOn]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: "You", text: inputMessage.trim(), time: "Now" },
    ]);
    setInputMessage("");
  };

  const participants = [
    { name: "You (Host)", isLocal: true, mic: isMicOn, cam: isCameraOn },
    { name: "Alice Smith", isLocal: false, mic: true, cam: true, initials: "AS" },
    { name: "John Doe", isLocal: false, mic: false, cam: true, initials: "JD" },
    { name: "Mike Johnson", isLocal: false, mic: true, cam: false, initials: "MJ" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-card border border-border rounded-xl overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between bg-card/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">{roomName}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            Live Room
          </span>
          {isRecording && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-destructive" /> REC
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Users className="h-4 w-4" /> 4 Connected
        </div>
      </div>

      {/* Main Content: Video Grid + Optional Chat */}
      <div className="flex-1 flex min-h-0">
        {/* Video Grid */}
        <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto bg-muted/20">
          {participants.map((p, idx) => (
            <div
              key={idx}
              className="relative aspect-video rounded-xl bg-muted border border-border/80 overflow-hidden flex items-center justify-center shadow-sm"
            >
              {p.isLocal && isCameraOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                    {p.initials || "YO"}
                  </div>
                </div>
              )}

              {/* Participant status tag */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-background/80 backdrop-blur px-2.5 py-1 rounded-md text-xs border border-border/60">
                <span className="font-medium">{p.name}</span>
                {p.mic ? (
                  <Mic className="h-3 w-3 text-primary" />
                ) : (
                  <MicOff className="h-3 w-3 text-destructive" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Drawer */}
        {showChat && (
          <div className="w-80 border-l border-border flex flex-col bg-card">
            <div className="p-3 border-b border-border font-semibold text-xs text-muted-foreground uppercase tracking-wider">
              In-Call Chat
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-y-auto text-sm">
              {chatMessages.map((msg, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div className="p-2 rounded bg-muted/50 text-xs">{msg.text}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-t border-border flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                className="h-9 text-xs"
              />
              <Button type="submit" size="sm" className="h-9 px-3">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="h-16 border-t border-border px-6 flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <Button
            variant={captionsEnabled ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setCaptionsEnabled(!captionsEnabled)}
            className="text-xs gap-1.5"
          >
            <Subtitles className="h-4 w-4" />
            <span className="hidden sm:inline">Captions</span>
          </Button>

          <Button
            variant={isRecording ? "destructive" : "ghost"}
            size="sm"
            onClick={() => setIsRecording(!isRecording)}
            className="text-xs gap-1.5"
          >
            <Radio className="h-4 w-4" />
            <span className="hidden sm:inline">{isRecording ? "Stop REC" : "Record"}</span>
          </Button>
        </div>

        {/* Center Media Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={isMicOn ? "secondary" : "destructive"}
            size="icon"
            onClick={() => setIsMicOn(!isMicOn)}
            className="rounded-full"
            title={isMicOn ? "Mute Mic" : "Unmute Mic"}
          >
            {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>

          <Button
            variant={isCameraOn ? "secondary" : "destructive"}
            size="icon"
            onClick={() => setIsCameraOn(!isCameraOn)}
            className="rounded-full"
            title={isCameraOn ? "Stop Video" : "Start Video"}
          >
            {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>

          <Button
            variant={isScreenSharing ? "secondary" : "outline"}
            size="icon"
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className="rounded-full"
            title="Share Screen"
          >
            <Share2 className="h-4 w-4" />
          </Button>

          <Button
            variant="destructive"
            onClick={onLeave}
            className="rounded-full px-5 gap-2 font-medium"
          >
            <PhoneOff className="h-4 w-4" /> Leave
          </Button>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          <Button
            variant={showChat ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowChat(!showChat)}
            className="text-xs gap-1.5"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Chat</span>
          </Button>
        </div>
      </div>
    </div>
  );
};