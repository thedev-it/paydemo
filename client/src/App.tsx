import HealthStatus from "./components/HealthStatus";
import PaymentForm from "./components/PaymentForm";

export default function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Décor */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-sky-500/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-10">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PayDemo</h1>
            <p className="text-sm text-slate-400">
              Paiement mobile money — MTN &amp; Airtel
            </p>
          </div>
          <HealthStatus />
        </header>

        <PaymentForm />

        <footer className="mt-8 text-center text-xs text-slate-500">
          Propulsé par OPENPAY · démo de paiement
        </footer>
      </div>
    </div>
  );
}
