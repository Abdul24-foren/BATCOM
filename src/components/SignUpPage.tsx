import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";

export function SignUpPage({ onSwitch }: { onSwitch: () => void }) {
  const { signUp, configError } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!displayName.trim()) {
      setError("Add a display name.");
      return;
    }

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Complete every sign-up field.");
      return;
    }

    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const { error: authError, needsConfirmation } = await signUp(email.trim(), password, displayName.trim());
    setIsSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (needsConfirmation) {
      setSuccess("ACCOUNT CREATED. Check your email to confirm your BATCOM account.");
      setDisplayName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      return;
    }

    setSuccess("Account created. You can now access BATCOM.");
    setDisplayName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-10 text-white">
      <div className="w-full max-w-md overflow-hidden border border-yellow-400/20 bg-[#0b0b0b] shadow-[0_0_50px_rgba(250,204,21,0.08)]">
        <div className="border-b border-white/10 p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-400">
            <ShieldCheck size={28} />
          </div>
          <p className="mt-4 font-mono text-[9px] tracking-[0.35em] text-yellow-400">BATCOM // CREATE ACCOUNT</p>
          <h1 className="mt-3 text-2xl font-black">REGISTER OPERATIVE</h1>
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
              <User size={12} /> DISPLAY NAME
            </span>
            <input
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none focus:border-yellow-400/50"
              placeholder="Commander Wayne"
            />
          </label>

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
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none focus:border-yellow-400/50"
                placeholder="Create a password"
              />
              <button type="button" className="px-3 text-gray-500 hover:text-white" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 font-mono text-[9px] tracking-[0.3em] text-gray-600">
              <Lock size={12} /> CONFIRM PASSWORD
            </span>
            <div className="flex items-center border border-white/10 bg-black">
              <input
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none focus:border-yellow-400/50"
                placeholder="Re-enter password"
              />
              <button type="button" className="px-3 text-gray-500 hover:text-white" onClick={() => setShowConfirmPassword((current) => !current)} aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}>
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={isSubmitting || !!configError}
            className="w-full bg-yellow-400 py-3 text-[10px] font-black tracking-[0.25em] text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "REGISTERING..." : "CREATE BATCOM ACCOUNT"}
          </button>

          <div className="text-center text-xs text-gray-500">
            <button type="button" onClick={onSwitch} className="hover:text-yellow-400">Already have access? Sign in</button>
          </div>
        </form>
      </div>
    </div>
  );
}
