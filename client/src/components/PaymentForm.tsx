import { useMemo, useState } from "react";
import type { FormEvent } from "react";

type Provider = "MTN" | "AIRTEL";
type Phase = "idle" | "loading" | "success" | "error";

interface ApiResult {
  success: boolean;
  message?: string;
  payment?: Record<string, unknown>;
  details?: unknown;
  code?: string;
}

interface FieldErrors {
  amount?: string;
  phone?: string;
  provider?: string;
}

const PROVIDERS: {
  id: Provider;
  label: string;
  hint: string;
  dot: string;
  activeRing: string;
}[] = [
  {
    id: "MTN",
    label: "MTN",
    hint: "Mobile Money",
    dot: "bg-yellow-400",
    activeRing: "ring-yellow-400/70 border-yellow-400/50 bg-yellow-400/10",
  },
  {
    id: "AIRTEL",
    label: "Airtel",
    hint: "Money",
    dot: "bg-red-500",
    activeRing: "ring-red-500/70 border-red-500/50 bg-red-500/10",
  },
];

const QUICK_AMOUNTS = [500, 1000, 5000, 10000];

export default function PaymentForm() {
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState<Provider | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const fullPhone = useMemo(
    () => (phone.length === 9 ? `242${phone}` : ""),
    [phone],
  );

  const validate = (): boolean => {
    const next: FieldErrors = {};
    const value = Number(amount);

    if (!amount.trim() || !Number.isFinite(value) || !Number.isInteger(value) || value <= 0) {
      next.amount = "Montant invalide : un nombre entier supérieur à 0 est attendu.";
    }
    if (!/^242\d{9}$/.test(fullPhone)) {
      next.phone = "Numéro invalide : 9 chiffres après +242 (ex. 06 123 45 67).";
    }
    if (!provider) {
      next.provider = "Choisis un opérateur (MTN ou Airtel).";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (phase === "loading") return;
    if (!validate()) return;

    setPhase("loading");
    setResult(null);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          phone: fullPhone,
          provider,
        }),
      });

      const data: ApiResult = await res.json().catch(() => ({
        success: false,
        message: "Réponse illisible du serveur.",
      }));

      setResult(data);
      setPhase(data.success ? "success" : "error");
    } catch {
      setResult({
        success: false,
        message: "Impossible de contacter le serveur. Vérifie ta connexion.",
      });
      setPhase("error");
    }
  };

  const reset = () => {
    setPhase("idle");
    setResult(null);
    setAmount("");
    setPhone("");
    setProvider(null);
    setErrors({});
  };

  const inputClass = (hasError?: string) =>
    `w-full rounded-xl border bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:ring-2 ${
      hasError
        ? "border-red-500/60 focus:border-red-400 focus:ring-red-500/30"
        : "border-slate-700 focus:border-emerald-400/60 focus:ring-emerald-400/25"
    }`;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur">
      {phase === "success" && result ? (
        <SuccessPanel result={result} amount={amount} phone={fullPhone} provider={provider} onReset={reset} />
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-semibold">Nouveau paiement</h2>
            <p className="text-sm text-slate-400">
              Montant, numéro +242 et opérateur, puis validation sur ton téléphone.
            </p>
          </div>

          {/* Montant */}
          <div>
            <label htmlFor="amount" className="mb-1.5 block text-sm font-medium text-slate-300">
              Montant (FCFA)
            </label>
            <div className="relative">
              <input
                id="amount"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                placeholder="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={phase === "loading"}
                className={`${inputClass(errors.amount)} pr-16 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`}
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-slate-500">
                FCFA
              </span>
            </div>
            {errors.amount && <p className="mt-1.5 text-xs text-red-400">{errors.amount}</p>}
            <div className="mt-2.5 flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAmount(String(value))}
                  disabled={phase === "loading"}
                  className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs font-medium text-slate-300 transition hover:border-emerald-400/50 hover:text-emerald-300 disabled:opacity-50"
                >
                  {value.toLocaleString("fr-FR")}
                </button>
              ))}
            </div>
          </div>

          {/* Numéro */}
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-300">
              Numéro de téléphone
            </label>
            <div
              className={`flex items-stretch overflow-hidden rounded-xl border bg-slate-950/60 transition focus-within:ring-2 ${
                errors.phone
                  ? "border-red-500/60 focus-within:ring-red-500/30"
                  : "border-slate-700 focus-within:border-emerald-400/60 focus-within:ring-emerald-400/25"
              }`}
            >
              <span className="flex select-none items-center border-r border-slate-700 bg-slate-800/60 px-3.5 text-sm font-medium text-slate-300">
                +242
              </span>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                maxLength={9}
                placeholder="06 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                disabled={phase === "loading"}
                className="w-full bg-transparent px-4 py-3 text-slate-100 placeholder-slate-500 outline-none"
              />
            </div>
            {errors.phone && <p className="mt-1.5 text-xs text-red-400">{errors.phone}</p>}
          </div>

          {/* Opérateur */}
          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-300">Opérateur</span>
            <div className="grid grid-cols-2 gap-3">
              {PROVIDERS.map((p) => {
                const active = provider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setProvider(p.id);
                      setErrors((prev) => ({ ...prev, provider: undefined }));
                    }}
                    disabled={phase === "loading"}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                      active
                        ? `ring-2 ${p.activeRing}`
                        : "border-slate-700 bg-slate-950/40 hover:border-slate-500"
                    }`}
                  >
                    <span className={`h-3 w-3 shrink-0 rounded-full ${p.dot}`} />
                    <span>
                      <span className="block text-sm font-semibold text-slate-100">{p.label}</span>
                      <span className="block text-xs text-slate-400">{p.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.provider && <p className="mt-1.5 text-xs text-red-400">{errors.provider}</p>}
          </div>

          {/* Erreur serveur */}
          {phase === "error" && result && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              <p className="font-medium">Paiement refusé</p>
              <p className="mt-1 text-red-300/90">{result.message}</p>
              {result.details != null && (
                <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-slate-950/60 p-2 text-xs text-red-300/80">
                  {typeof result.details === "string"
                    ? result.details
                    : JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={phase === "loading"}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {phase === "loading" ? (
              <>
                <Spinner />
                Traitement en cours…
              </>
            ) : (
              "Payer maintenant"
            )}
          </button>

          <p className="text-center text-xs text-slate-500">
            Tu recevras une demande de validation sur ton téléphone.
          </p>
        </form>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  );
}

function SuccessPanel({
  result,
  amount,
  phone,
  provider,
  onReset,
}: {
  result: ApiResult;
  amount: string;
  phone: string;
  provider: Provider | null;
  onReset: () => void;
}) {
  const payment = (result.payment ?? {}) as Record<string, unknown>;
  const rows: [string, unknown][] = [
    ["Référence", payment.reference ?? payment.ref ?? payment.id ?? payment.transaction_id],
    ["Statut", payment.status ?? payment.state],
    ["Message", payment.message ?? payment.status_message],
    ["Opérateur", provider],
    ["Montant", amount ? `${Number(amount).toLocaleString("fr-FR")} FCFA` : null],
    ["Numéro", phone ? `+${phone}` : null],
  ].filter(([, value]) => value != null && value !== "") as [string, unknown][];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l5 5 10-10.5" />
          </svg>
        </span>
        <div>
          <h2 className="text-lg font-semibold">Demande envoyée</h2>
          <p className="text-sm text-slate-400">{result.message}</p>
        </div>
      </div>

      {rows.length > 0 && (
        <dl className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950/40">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 px-4 py-3">
              <dt className="text-sm text-slate-400">{label}</dt>
              <dd className="text-right text-sm font-medium text-slate-200">
                {typeof value === "object" ? JSON.stringify(value) : String(value)}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {result.payment && (
        <details className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm">
          <summary className="cursor-pointer text-slate-400 select-none">Réponse brute OPENPAY</summary>
          <pre className="mt-2 max-h-48 overflow-auto text-xs text-slate-400">
            {JSON.stringify(result.payment, null, 2)}
          </pre>
        </details>
      )}

      <button
        type="button"
        onClick={onReset}
        className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-emerald-400/50 hover:text-emerald-300"
      >
        Nouveau paiement
      </button>
    </div>
  );
}
