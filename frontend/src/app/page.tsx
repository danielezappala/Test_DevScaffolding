import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

interface VersionInfo {
  version: string;
  commit: string;
  build_date: string;
}

async function getVersionInfo(): Promise<VersionInfo> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://backend:8000";

  try {
    const res = await fetch(`${apiUrl}/api/v1/version`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });

    if (!res.ok) {
      throw new Error("Failed to fetch version info");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching version info:", error);
    return {
      version: "unknown",
      commit: "unknown",
      build_date: "unknown",
    };
  }
}

function formatBuildDate(value: string): string {
  if (!value || value === "unknown") return "n/d";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "n/d";
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

export default async function Home() {
  const versionInfo = await getVersionInfo();

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 lg:py-24">
        <section className="grid items-start gap-12 lg:grid-cols-[1fr,0.9fr]">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 text-sm font-semibold text-primary-foreground ring-1 ring-primary/30">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Enoteca digitale · Etna
            </span>

            <div className="space-y-4">
              <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
                Monitor Etna wines &amp; operations with una UI moderna e bidimensionale.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Palette calda, superfici piatte, tipografia pulita. Controlla versione, stock e
                movimenti senza fronzoli.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/test-devscaffolding/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/15 px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:border-primary hover:bg-primary/20"
                >
                  Vai alla dashboard
                </a>
                <a
                  href="/test-devscaffolding/api/v1/docs"
                  className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:border-accent hover:bg-accent/20"
                >
                  Apri API docs
                </a>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-primary/25 bg-card px-4 py-3">
                <p className="text-sm text-muted-foreground">Backend status</p>
                <p className="text-lg font-semibold text-primary-foreground">Live &amp; ready</p>
                <p className="text-sm text-muted-foreground">
                  Version API in tempo reale dalla tua pipeline.
                </p>
              </div>
              <div className="rounded-xl border border-accent/30 bg-card px-4 py-3">
                <p className="text-sm text-muted-foreground">UI topic</p>
                <p className="text-lg font-semibold text-foreground">Vini dell&apos;Etna</p>
                <p className="text-sm text-muted-foreground">
                  Palette vino+ambra interpretata in stile piatto e moderno.
                </p>
              </div>
            </div>
          </div>

          <Card className="border border-primary/30 bg-card shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-display">System Information</CardTitle>
                <span className="rounded-full border border-accent/30 bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                  live API
                </span>
              </div>
              <CardDescription>Backend API version details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-secondary px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Base Path</p>
                <p className="text-sm font-semibold text-foreground">/test-devscaffolding</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-muted-foreground">Version:</span>
                  <span className="font-semibold text-foreground">{versionInfo.version}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-muted-foreground">Commit:</span>
                  <span className="font-mono text-xs text-foreground">{versionInfo.commit}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-muted-foreground">Build Date:</span>
                  <span className="text-xs text-foreground">
                    {formatBuildDate(versionInfo.build_date)}
                  </span>
                </div>
              </div>

              <div className="grid gap-2 rounded-lg border border-accent/20 bg-accent/10 px-4 py-3 text-sm">
                <span className="font-semibold text-foreground">Next steps</span>
                <p className="text-muted-foreground">
                  Aggiungi tabella inventario, movimenti e schede fornitore con la stessa palette.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-primary-foreground" />
            Monorepo Project Generator
          </div>
          <span>·</span>
          <span>Subpath: /test-devscaffolding</span>
          <span>·</span>
          <span>Design cue: enoetnawinehouse.it</span>
        </div>
      </div>
    </main>
  );
}
