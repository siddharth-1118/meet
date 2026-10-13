"use client";

import { PreJoinLobby } from "@/components/livekit/PreJoinLobby";
import { MeetingRoom } from "@/components/livekit/MeetingRoom";
import { useState } from "react";

export default function RoomPage() {
  const [roomName, setRoomName] = useState("");
  const [networkName, setNetworkName] = useState("Design Guild");
  const [hasJoined, setHasJoined] = useState(false);

  const handleJoin = (room: string) => {
    setRoomName(room);
    setHasJoined(true);
  };

  if (hasJoined) {
    return (
      <MeetingRoom
        roomName={roomName}
        onLeave={() => setHasJoined(false)}
      />
    );
  }

  return (
    <PreJoinLobby
      onJoin={handleJoin}
      networkName={networkName}
    />
  );
}