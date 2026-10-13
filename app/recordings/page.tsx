import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Play, Radio, Download, Clock } from "lucide-react";

export default function RecordingsPage() {
  const recordings = [
    {
      id: "rec-1",
      title: "Design Review - Session 1",
      network: "Design Guild",
      date: "2 hours ago",
      duration: "45 min",
      hasTranscript: true,
    },
    {
      id: "rec-2",
      title: "CS Department Faculty Sync",
      network: "CS Department",
      date: "Yesterday",
      duration: "58 min",
      hasTranscript: true,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Recordings & Transcripts</h1>
        <p className="text-muted-foreground">
          Review past video captures, speaker attributions, and AI meeting summaries.
        </p>
      </header>

      <div className="grid gap-4">
        {recordings.map((rec) => (
          <Card key={rec.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Radio className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{rec.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {rec.network} • Recorded {rec.date}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {rec.duration}
                      </span>
                      {rec.hasTranscript && (
                        <span className="flex items-center gap-1 text-primary">
                          <FileText className="h-3.5 w-3.5" /> AI Transcript available
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <FileText className="h-4 w-4" /> Transcript
                  </Button>
                  <Button size="sm" className="gap-1.5">
                    <Play className="h-4 w-4" /> Watch Playback
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}