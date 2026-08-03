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

interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string;
  status: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

function ProjectDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);

  const [error, setError] = useState("");
  const [taskError, setTaskError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!id) {
      setError("Invalid project ID.");
      setLoading(false);
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

    const fetchTasks = async () => {
      try {
        const response = await api.get(
          `/projects/${id}/tasks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Tasks response:", response.data);

        setTasks(response.data.data || []);
      } catch (error: any) {
        console.error("Tasks error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        setTaskError(
          error.response?.data?.message ||
            "Failed to load tasks."
        );
      } finally {
        setTasksLoading(false);
      }
    };

    fetchProject();
    fetchTasks();
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

  const formatDate = (date: string | null) => {
    if (!date) {
      return "No due date";
    }

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
      <main className="mx-auto max-w-6xl px-6 py-10">

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

        </div>

        {/* Tasks Section */}
        <div className="mt-8 rounded-3xl bg-white p-8 shadow-xl">

          {/* Tasks Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-bold uppercase tracking-widest text-sky-500">
                Project Tasks
              </p>

              <h3 className="mt-1 text-2xl font-extrabold text-slate-800">
                Tasks
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Manage all tasks belonging to this project.
              </p>

            </div>

            <button
              onClick={() =>
                navigate(`/projects/${project.id}/tasks/new`)
              }
              className="rounded-xl bg-sky-500 px-5 py-3 font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-600"
            >
              + New Task
            </button>

          </div>

          {/* Task Error */}
          {taskError && (
            <div className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
              {taskError}
            </div>
          )}

          {/* Task Loading */}
          {tasksLoading && (
            <div className="mt-10 text-center">

              <div className="text-5xl">
                🐧
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-500">
                Pengu is fetching your tasks...
              </p>

            </div>
          )}

          {/* Empty Tasks */}
          {!tasksLoading &&
            tasks.length === 0 &&
            !taskError && (
              <div className="mt-10 rounded-2xl border-2 border-dashed border-sky-100 bg-sky-50/50 p-12 text-center">

                <div className="text-6xl">
                  📋
                </div>

                <h4 className="mt-4 text-xl font-bold text-slate-700">
                  No tasks yet
                </h4>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Create your first task and start getting
                  things done.
                </p>

                <button
                  onClick={() =>
                    navigate(
                      `/projects/${project.id}/tasks/new`
                    )
                  }
                  className="mt-6 rounded-xl bg-sky-500 px-6 py-3 font-bold text-white transition hover:bg-sky-600"
                >
                  Create First Task 🐧
                </button>

              </div>
            )}

          {/* Tasks */}
          {!tasksLoading && tasks.length > 0 && (
            <div className="mt-8 space-y-4">

              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:shadow-md"
                >

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div className="min-w-0">

                      <h4 className="text-lg font-bold text-slate-800">
                        {task.title}
                      </h4>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {task.description ||
                          "No description provided."}
                      </p>

                    </div>

                    <span
                      className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusClasses(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>

                  </div>

                  <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-400">

                      <span>
                        📅 Due: {formatDate(task.due_date)}
                      </span>

                      <span>
                        Created: {formatDate(task.created_at)}
                      </span>

                    </div>

                    <button
                      onClick={() =>
                        navigate(`/tasks/${task.id}`)
                      }
                      className="w-fit text-sm font-bold text-sky-500 hover:text-sky-600"
                    >
                      View Task →
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

export default ProjectDetails;