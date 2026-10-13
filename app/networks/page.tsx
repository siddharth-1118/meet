import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Network, Plus, Users, Shield, ArrowUpRight } from "lucide-react";

export default function NetworksPage() {
  const networks = [
    {
      name: "Design Guild",
      slug: "design-guild",
      description: "Product design system discussions, design critiques, and UX sprints.",
      members: 12,
      meetings: 4,
    },
    {
      name: "CS Department",
      slug: "cs-department",
      description: "Faculty, student cohorts, and academic office hour scheduling.",
      members: 45,
      meetings: 12,
    },
    {
      name: "Startup Team",
      slug: "startup-team",
      description: "Core engineering, growth syncs, and investor updates.",
      members: 8,
      meetings: 3,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Networks</h1>
          <p className="text-muted-foreground">
            Isolated spaces governed by domain policies, custom branding, and membership rings.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Create Network
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Create Network Quick Form */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" /> Quick Register
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Network name (e.g. Engineering)" />
            <Input placeholder="Slug (e.g. engineering)" />
            <Input placeholder="Domain description" />
            <Button className="w-full mt-2">Provision Network</Button>
          </CardContent>
        </Card>

        {/* Existing Networks */}
        {networks.map((net) => (
          <Card key={net.slug} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{net.name}</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-primary font-mono mb-2">/{net.slug}</p>
              <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                {net.description}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {net.members} members
                </span>
                <span>{net.meetings} meetings / mo</span>
              </div>
              <Button variant="outline" className="w-full gap-2">
                Manage Network <ArrowUpRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}