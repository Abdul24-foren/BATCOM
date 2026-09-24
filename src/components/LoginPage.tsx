import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";

export function LoginPage({
  onSwitch,
  onForgot,
}: {
  onSwitch: () => void;
  onForgot: () => void;
}) {
  const { signIn, configError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    const { error: authError } = await signIn(email.trim(), password);
    setIsSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-10 text-white">
      <div className="w-full max-w-md overflow-hidden border border-yellow-400/20 bg-[#0b0b0b] shadow-[0_0_50px_rgba(250,204,21,0.08)]">
        <div className="border-b border-white/10 p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-400">
            <ShieldCheck size={28} />
          </div>
          <p className="mt-4 font-mono text-[9px] tracking-[0.35em] text-yellow-400">BATCOM // AUTH</p>
          <h1 className="mt-3 text-2xl font-black">ACCESS NETWORK</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {configError && (
            <div className="border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-300">{configError}</div>
          )}

          {error && (
            <div className="border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-300">{error}</div>
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

          <label className="block">
            <span className="mb-2 flex items-center gap-2 font-mono text-[9px] tracking-[0.3em] text-gray-600">
              <Lock size={12} /> PASSWORD
            </span>
            <div className="flex items-center border border-white/10 bg-black">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none focus:border-yellow-400/50"
                placeholder="Enter password"
              />
              <button
                type="button"
                className="px-3 text-gray-500 hover:text-white"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={isSubmitting || !!configError}
            className="w-full bg-yellow-400 py-3 text-[10px] font-black tracking-[0.25em] text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "VERIFYING ACCESS..." : "ACCESS BATCOM"}
          </button>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <button type="button" onClick={onForgot} className="hover:text-yellow-400">Forgot password?</button>
            <button type="button" onClick={onSwitch} className="hover:text-yellow-400">Create account</button>
          </div>
        </form>
      </div>
    </div>
  );
}
