import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      console.log("Register response:", response.data);

      setSuccess("Account created successfully! 🐧");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error: any) {
      console.error("Register error:", error);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-2">

          {/* LEFT */}
          <div className="relative flex min-h-[600px] items-center justify-center overflow-hidden bg-sky-100 px-8 py-12">

            <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-white/50" />

            <div className="absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-sky-200/60" />

            <span className="absolute left-12 top-16 text-2xl opacity-50">
              ❄️
            </span>

            <span className="absolute right-16 top-28 text-xl opacity-40">
              ❄️
            </span>

            <span className="absolute bottom-24 left-20 text-xl opacity-40">
              ❄️
            </span>

            <span className="absolute bottom-16 right-24 text-2xl opacity-50">
              ❄️
            </span>

            <div className="relative z-10 max-w-md text-center">

              {/* Penguin */}
              <div className="mb-6 text-9xl drop-shadow-md">
                🐧
              </div>

              {/* Brand */}
              <h1 className="text-4xl font-extrabold text-slate-800 sm:text-5xl">
                TaskFlow{" "}
                <span className="text-sky-500">
                  Pengu
                </span>
              </h1>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                Create your account and let Pengu
                help you organize your work. ❄️
              </p>

              <div className="mx-auto mt-8 max-w-sm rounded-2xl bg-white/80 px-6 py-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-600">
                  "Let's build something great together." 🐧
                </p>
              </div>

            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16">

            <div className="w-full max-w-md">

              {/* Heading */}
              <div className="mb-8">
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
                  Get started
                </p>

                <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                  Create your account.
                </h2>

                <p className="mt-3 text-slate-500">
                  Join your TaskFlow workspace today.
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleRegister}
                className="space-y-4"
              >

                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Confirm password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
                    {success}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-sky-500 px-5 py-3.5 font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-600 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Creating account..."
                    : "Create Account 🐧"}
                </button>

              </form>

              {/* Login */}
              <p className="mt-7 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-sky-500 hover:text-sky-600"
                >
                  Sign in
                </Link>
              </p>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;