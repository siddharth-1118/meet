import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Network, Video, FileText } from "lucide-react";

export const EmptyState = ({
  icon: Icon = Video,
  title,
  description,
  CTAText,
  onCTA,
}: {
  icon?: React.ElementType;
  title: string;
  description: string;
  CTAText?: string;
  onCTA?: () => void;
}) => {
  return (
    <div className="text-center py-16 px-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {CTAText && (
        <div className="mt-6">
          <Button onClick={onCTA}>{CTAText}</Button>
        </div>
      )}
    </div>
  );
};

export const NetworkEmptyState = ({ onCTA }: { onCTA?: () => void }) => (
  <EmptyState
    icon={Network}
    title="No Networks Configured"
    description="Organize meetings by domain, organization, or circle. Start by provisioning a network."
    CTAText="Create Network"
    onCTA={onCTA}
  />
);

export const MeetingEmptyState = ({ onCTA }: { onCTA?: () => void }) => (
  <EmptyState
    icon={Calendar}
    title="No Scheduled Meetings"
    description="Plan an instant call or scheduled session and invite network participants with granular roles."
    CTAText="Schedule Meeting"
    onCTA={onCTA}
  />
);