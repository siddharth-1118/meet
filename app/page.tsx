import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Network, Video, Radio, Plus, CalendarPlus, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">NexMeet Overview</h1>
        <p className="text-muted-foreground">
          Domain-specific meeting orchestration, network governance, and calendar intelligence.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Networks card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Networks</CardTitle>
            <Network className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Organize meetings by domain, organization, or project circles.
            </p>
            <Link href="/networks">
              <Button className="w-full gap-2">
                <Plus className="h-4 w-4" /> Explore Networks
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming meetings card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Schedule Call</CardTitle>
            <Video className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Provision instant video rooms or plan scheduled meetings.
            </p>
            <Link href="/create-meeting">
              <Button variant="outline" className="w-full gap-2">
                <CalendarPlus className="h-4 w-4" /> Create Meeting
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Calendar card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Calendar</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Sync availability across Google Calendar & Outlook.
            </p>
            <Link href="/calendar">
              <Button variant="secondary" className="w-full">
                View Calendar
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recordings card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Recordings</CardTitle>
            <Radio className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Access AI transcripts and recorded domain sessions.
            </p>
            <Link href="/recordings">
              <Button variant="ghost" className="w-full border border-dashed">
                Browse Archive
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Launch Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">Instant Live Room</h3>
            <p className="text-sm text-muted-foreground">
              Enter an encrypted session with camera/mic pre-join lobby and participant deck.
            </p>
          </div>
          <Link href="/room">
            <Button className="gap-2 shrink-0">
              Launch Live Room <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}