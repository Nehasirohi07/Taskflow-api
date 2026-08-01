import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface DashboardData {
  total_projects: number;
  total_tasks: number;
  completed_tasks: number;
  active_tasks: number;
  archived_tasks: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Dashboard response:", response.data);

        setDashboard(response.data.data);
      } catch (error: any) {
        console.error("Dashboard error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login");
          return;
        }

        setError(
          error.response?.data?.message ||
            "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50">
        <div className="text-center">
          <div className="text-7xl">🐧</div>

          <p className="mt-4 font-semibold text-slate-600">
            Pengu is preparing your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50">

      {/* Navbar */}
      <header className="border-b border-sky-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div className="flex items-center gap-3">

            <span className="text-4xl">
              🐧
            </span>

            <div>
              <h1 className="text-xl font-extrabold text-slate-800">
                TaskFlow{" "}
                <span className="text-sky-500">
                  Pengu
                </span>
              </h1>

              <p className="text-xs text-slate-400">
                Your productivity companion
              </p>
            </div>

          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-sky-50 px-4 py-2 text-sm font-bold text-sky-600 transition hover:bg-sky-100"
          >
            Logout
          </button>

        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Welcome */}
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-sky-500">
                Dashboard
              </p>

              <h2 className="text-3xl font-extrabold text-slate-800">
                Welcome back
                {user?.name ? `, ${user.name}` : ""}! 🐧
              </h2>

              <p className="mt-2 text-slate-500">
                Let's see what we need to get done today.
              </p>

            </div>

            <div className="text-7xl">
              🐧
            </div>

          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

          {/* Projects */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-400">
              Projects
            </p>

            <p className="mt-3 text-3xl font-extrabold text-slate-800">
              {dashboard?.total_projects ?? 0}
            </p>
          </div>

          {/* Total Tasks */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-400">
              Total Tasks
            </p>

            <p className="mt-3 text-3xl font-extrabold text-slate-800">
              {dashboard?.total_tasks ?? 0}
            </p>
          </div>

          {/* Active */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-400">
              Active
            </p>

            <p className="mt-3 text-3xl font-extrabold text-sky-500">
              {dashboard?.active_tasks ?? 0}
            </p>
          </div>

          {/* Completed */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-400">
              Completed
            </p>

            <p className="mt-3 text-3xl font-extrabold text-green-500">
              {dashboard?.completed_tasks ?? 0}
            </p>
          </div>

          {/* Archived */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-400">
              Archived
            </p>

            <p className="mt-3 text-3xl font-extrabold text-slate-500">
              {dashboard?.archived_tasks ?? 0}
            </p>
          </div>

        </div>

        {/* Projects Section */}
        <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                Your Projects
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Manage your projects and tasks from here.
              </p>
            </div>

            {/* New Project */}
            <button
              onClick={() => navigate("/projects/new")}
              className="rounded-xl bg-sky-500 px-5 py-3 font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-600 active:scale-[0.98]"
            >
              + New Project
            </button>

          </div>

          {/* Empty State */}
          {dashboard?.total_projects === 0 && (
            <div className="mt-10 rounded-2xl border-2 border-dashed border-sky-100 bg-sky-50/50 p-12 text-center">

              <div className="text-6xl">
                🐧
              </div>

              <h4 className="mt-4 text-xl font-bold text-slate-700">
                No projects yet
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Create your first project and let Pengu help you
                stay organized.
              </p>

              <button
                onClick={() => navigate("/projects/new")}
                className="mt-6 rounded-xl bg-sky-500 px-6 py-3 font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-600 active:scale-[0.98]"
              >
                Create your first project 🐧
              </button>

            </div>
          )}

          {/* Projects exist */}
          {dashboard && dashboard.total_projects > 0 && (
            <div className="mt-8 rounded-2xl bg-sky-50 p-6">

              <div className="flex items-center gap-4">

                <div className="text-5xl">
                  📁
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-700">
                    You have {dashboard.total_projects} project
                    {dashboard.total_projects !== 1 ? "s" : ""}
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    Your projects will appear here.
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default Dashboard;