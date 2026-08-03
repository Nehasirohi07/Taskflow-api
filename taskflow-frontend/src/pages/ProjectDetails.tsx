import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

interface Project {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

function ProjectDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Project details:", response.data);

        setProject(response.data.data);
      } catch (error: any) {
        console.error("Project details error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        setError(
          error.response?.data?.message ||
            "Failed to load project."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

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
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50">
        <div className="text-center">
          <div className="text-7xl">🐧</div>

          <p className="mt-4 font-semibold text-slate-600">
            Pengu is loading your project...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50 px-6">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">

          <div className="text-6xl">😔</div>

          <h2 className="mt-4 text-2xl font-bold text-slate-800">
            Something went wrong
          </h2>

          <p className="mt-3 text-slate-500">
            {error}
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 rounded-xl bg-sky-500 px-6 py-3 font-bold text-white transition hover:bg-sky-600"
          >
            ← Back to Dashboard
          </button>

        </div>
      </div>
    );
  }

  if (!project) {
    return null;
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
            onClick={() => navigate("/dashboard")}
            className="rounded-xl bg-sky-50 px-4 py-2 text-sm font-bold text-sky-600 transition hover:bg-sky-100"
          >
            Dashboard
          </button>

        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-6 py-10">

        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 font-semibold text-sky-600 hover:text-sky-700"
        >
          ← Back to Projects
        </button>

        {/* Project Card */}
        <div className="rounded-3xl bg-white p-8 shadow-xl">

          {/* Header */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-4xl">
                📁
              </div>

              <div>

                <p className="text-sm font-bold uppercase tracking-widest text-sky-500">
                  Project
                </p>

                <h2 className="mt-1 text-3xl font-extrabold text-slate-800">
                  {project.title}
                </h2>

              </div>

            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-bold capitalize ${getStatusClasses(
                project.status
              )}`}
            >
              {project.status}
            </span>

          </div>

          {/* Description */}
          <div className="mt-10">

            <h3 className="text-lg font-bold text-slate-800">
              Description
            </h3>

            <div className="mt-3 rounded-2xl bg-slate-50 p-5">

              <p className="leading-7 text-slate-600">
                {project.description ||
                  "No description provided for this project."}
              </p>

            </div>

          </div>

          {/* Information */}
          <div className="mt-8 grid gap-5 sm:grid-cols-2">

            <div className="rounded-2xl bg-sky-50 p-5">
              <p className="text-sm font-semibold text-slate-400">
                Created
              </p>

              <p className="mt-2 font-bold text-slate-700">
                {formatDate(project.created_at)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-400">
                Last updated
              </p>

              <p className="mt-2 font-bold text-slate-700">
                {formatDate(project.updated_at)}
              </p>
            </div>

          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-8 sm:flex-row">

            <button
              onClick={() =>
                navigate(`/projects/${project.id}/edit`)
              }
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-600 transition hover:bg-slate-50"
            >
              ✏️ Edit Project
            </button>

            <button
              onClick={() => {
                console.log("Tasks will be added next");
              }}
              className="rounded-xl bg-sky-500 px-6 py-3 font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-600"
            >
              📋 View Tasks
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default ProjectDetails;