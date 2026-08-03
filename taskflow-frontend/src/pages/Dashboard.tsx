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

interface Project {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [error, setError] = useState("");
  const [projectError, setProjectError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return;
    }

    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard");

        console.log("Dashboard response:", response.data);

        setDashboard(response.data?.data || null);
      } catch (error: any) {
        console.error("Dashboard error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }

        setError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await api.get("/projects");

        console.log("Projects response:", response.data);

        const projectData = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        console.log("Projects received:", projectData);

        projectData.forEach((project: Project) => {
          console.log(
            `Project "${project.title}" -> ID:`,
            project.id,
            "Type:",
            typeof project.id
          );
        });

        setProjects(projectData);
      } catch (error: any) {
        console.error("Projects error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }

        setProjectError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to load projects."
        );
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchDashboard();
    fetchProjects();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  /*
   * IMPORTANT:
   * Always convert project ID to a number before navigation.
   * This prevents problems if backend sends ID as string.
   */
  const handleViewProject = (projectId: number | string) => {
    console.log("=================================");
    console.log("VIEW PROJECT CLICKED");
    console.log("Original Project ID:", projectId);
    console.log("Original ID type:", typeof projectId);

    const normalizedId = Number(projectId);

    console.log("Normalized Project ID:", normalizedId);
    console.log("Normalized ID type:", typeof normalizedId);

    if (
      !Number.isInteger(normalizedId) ||
      normalizedId <= 0
    ) {
      console.error(
        "Invalid project ID:",
        projectId
      );

      setProjectError(
        "This project has an invalid ID. Please refresh the dashboard."
      );

      return;
    }

    const projectUrl = `/projects/${normalizedId}`;

    console.log("Navigating to:", projectUrl);
    console.log("=================================");

    navigate(projectUrl);
  };

  const handleCreateProject = () => {
    navigate("/projects/new");
  };

  const getStatusClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-sky-100 text-sky-600";

      case "completed":
        return "bg-green-100 text-green-600";

      case "archived":
        return "bg-slate-100 text-slate-500";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const formatDate = (date: string) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50">
        <div className="text-center">
          <div className="text-7xl">
            🐧
          </div>

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
            type="button"
            onClick={handleLogout}
            className="cursor-pointer rounded-xl bg-sky-50 px-4 py-2 text-sm font-bold text-sky-600 transition hover:bg-sky-100"
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

        {/* Dashboard Error */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-400">
              Projects
            </p>

            <p className="mt-3 text-3xl font-extrabold text-slate-800">
              {dashboard?.total_projects ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-400">
              Total Tasks
            </p>

            <p className="mt-3 text-3xl font-extrabold text-slate-800">
              {dashboard?.total_tasks ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-400">
              Active
            </p>

            <p className="mt-3 text-3xl font-extrabold text-sky-500">
              {dashboard?.active_tasks ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-400">
              Completed
            </p>

            <p className="mt-3 text-3xl font-extrabold text-green-500">
              {dashboard?.completed_tasks ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-400">
              Archived
            </p>

            <p className="mt-3 text-3xl font-extrabold text-slate-500">
              {dashboard?.archived_tasks ?? 0}
            </p>
          </div>

        </div>

        {/* Projects */}
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

            <button
              type="button"
              onClick={handleCreateProject}
              className="cursor-pointer rounded-xl bg-sky-500 px-5 py-3 font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-600"
            >
              + New Project
            </button>

          </div>

          {/* Project Error */}
          {projectError && (
            <div className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
              {projectError}
            </div>
          )}

          {/* Loading */}
          {projectsLoading && (
            <div className="mt-10 text-center">

              <div className="text-5xl">
                🐧
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-500">
                Pengu is fetching your projects...
              </p>

            </div>
          )}

          {/* Empty State */}
          {!projectsLoading &&
            projects.length === 0 &&
            !projectError && (
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
                  type="button"
                  onClick={handleCreateProject}
                  className="mt-6 cursor-pointer rounded-xl bg-sky-500 px-6 py-3 font-bold text-white transition hover:bg-sky-600"
                >
                  Create your first project 🐧
                </button>

              </div>
            )}

          {/* Project Cards */}
          {!projectsLoading &&
            projects.length > 0 && (
              <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                {projects.map((project) => (

                  <div
                    key={project.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-6 transition hover:-translate-y-1 hover:shadow-lg"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <h4 className="text-lg font-bold text-slate-800">
                        {project.title}
                      </h4>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusClasses(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>

                    </div>

                    <p className="mt-4 min-h-[48px] text-sm leading-6 text-slate-500">
                      {project.description ||
                        "No description provided."}
                    </p>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">

                      <span className="text-xs font-medium text-slate-400">
                        Created {formatDate(project.created_at)}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleViewProject(project.id)
                        }
                        className="cursor-pointer text-sm font-bold text-sky-500 hover:text-sky-600"
                      >
                        View →
                      </button>

                    </div>

                  </div>

                ))}

              </div>
            )}

        </div>

      </main>

    </div>
  );
}

export default Dashboard;