import { useEffect, useState } from "react";

type Status = "checking" | "online" | "offline";

const LABELS: Record<Status, string> = {
  checking: "Connexion…",
  online: "Serveur en ligne",
  offline: "Serveur hors ligne",
};

const DOT_COLORS: Record<Status, string> = {
  checking: "bg-amber-400",
  online: "bg-emerald-400",
  offline: "bg-red-500",
};

const PILL_COLORS: Record<Status, string> = {
  checking: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  online: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  offline: "border-red-400/30 bg-red-400/10 text-red-200",
};

export default function HealthStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;

    const ping = async () => {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        if (!cancelled) setStatus(data?.success ? "online" : "offline");
      } catch {
        if (!cancelled) setStatus("offline");
      }
    };

    ping();
    const id = setInterval(ping, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <span
      title="État du backend (vérifié toutes les 30 s)"
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${PILL_COLORS[status]}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${DOT_COLORS[status]} ${
          status === "checking" ? "animate-pulse-dot" : ""
        }`}
      />
      {LABELS[status]}
    </span>
  );
}
