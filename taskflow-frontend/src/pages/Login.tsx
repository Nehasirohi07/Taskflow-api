import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/login", {
        email: email.trim(),
        password,
      });

      console.log("Login response:", response.data);

      const token = response.data.data?.token;
      const user = response.data.data?.user;

      if (!token) {
        setError("Login successful, but token was not received.");
        return;
      }

      localStorage.setItem("token", token);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-2">

          {/* LEFT — PENGU */}
          <div className="relative flex min-h-[550px] items-center justify-center overflow-hidden bg-sky-100 px-8 py-12">

            <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-white/50" />
            <div className="absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-sky-200/60" />

            {/* Snowflakes */}
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
                Your cute little companion for
                managing projects, tasks and teamwork.
              </p>

              {/* Quote */}
              <div className="mx-auto mt-8 max-w-sm rounded-2xl bg-white/80 px-6 py-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-600">
                  "Stay organized. Stay productive." 🐧
                </p>
              </div>

            </div>
          </div>

          {/* RIGHT — LOGIN */}
          <div className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16">

            <div className="w-full max-w-md">

              {/* Heading */}
              <div className="mb-8">
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
                  Welcome back
                </p>

                <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                  Let's get things done.
                </h2>

                <p className="mt-3 text-slate-500">
                  Sign in to continue to your TaskFlow workspace.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5">

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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-sm font-semibold text-sky-500 hover:text-sky-600"
                    >
                      Forgot password?
                    </button>

                  </div>

                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2">

                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 accent-sky-500"
                  />

                  <label
                    htmlFor="remember"
                    className="text-sm text-slate-500"
                  >
                    Remember me
                  </label>

                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                {/* Login button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-sky-500 px-5 py-3.5 font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-600 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in 🐧"}
                </button>

              </form>

              {/* Divider */}
              <div className="my-7 flex items-center gap-4">

                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-xs font-medium uppercase text-slate-400">
                  or
                </span>

                <div className="h-px flex-1 bg-slate-200" />

              </div>

              {/* Register */}
              <p className="text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-bold text-sky-500 hover:text-sky-600"
                >
                  Create one
                </Link>
              </p>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;