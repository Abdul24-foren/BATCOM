import { useState } from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";

export function ForgotPasswordPage({
  onSwitch,
}: {
  onSwitch: () => void;
}) {
  const { resetPassword, configError } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Enter your BATCOM email address.");
      return;
    }

    setIsSubmitting(true);
    const { error: authError } = await resetPassword(email.trim());
    setIsSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setSuccess("Reset link sent. Check your email for the BATCOM password update instructions.");
    setEmail("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-10 text-white">
      <div className="w-full max-w-md overflow-hidden border border-yellow-400/20 bg-[#0b0b0b] shadow-[0_0_50px_rgba(250,204,21,0.08)]">
        <div className="border-b border-white/10 p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-400">
            <ShieldCheck size={28} />
          </div>
          <p className="mt-4 font-mono text-[9px] tracking-[0.35em] text-yellow-400">BATCOM // RECOVERY</p>
          <h1 className="mt-3 text-2xl font-black">RESET PASSWORD</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {configError && (
            <div className="border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-300">{configError}</div>
          )}

          {error && (
            <div className="border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-300">{error}</div>
          )}

          {success && (
            <div className="border border-green-400/20 bg-green-400/5 p-3 text-xs text-green-300">{success}</div>
          )}

          <label className="block">
            <span className="mb-2 flex items-center gap-2 font-mono text-[9px] tracking-[0.3em] text-gray-600">
              <Mail size={12} /> EMAIL
            </span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none focus:border-yellow-400/50"
              placeholder="commander@batcom.local"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting || !!configError}
            className="w-full bg-yellow-400 py-3 text-[10px] font-black tracking-[0.25em] text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "SENDING RESET LINK..." : "SEND RESET LINK"}
          </button>

          <div className="text-center text-xs text-gray-500">
            <button type="button" onClick={onSwitch} className="hover:text-yellow-400">Back to access</button>
          </div>
        </form>
      </div>
    </div>
  );
}
