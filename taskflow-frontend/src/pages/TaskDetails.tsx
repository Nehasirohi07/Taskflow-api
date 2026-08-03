import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

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

function TaskDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const taskId = id;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!taskId || !/^\d+$/.test(taskId)) {
      setError("Invalid task ID.");
      setLoading(false);
      return;
    }

    const fetchTask = async () => {
      try {
        const response = await api.get(
          `/tasks/${taskId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const taskData =
          response.data?.data || response.data;

        setTask(taskData);
      } catch (error: any) {
        console.error("Task details error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login");
          return;
        }

        setError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to load task."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId, navigate]);

  const goToProject = () => {
    if (task?.project_id) {
      navigate(`/projects/${task.project_id}`);
      return;
    }

    navigate("/dashboard");
  };

  const goToEditTask = () => {
    if (!taskId) {
      return;
    }

    navigate(`/tasks/${taskId}/edit`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const formatDate = (date: string | null) => {
    if (!date) {
      return "No date";
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return "No date";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClasses = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "in_progress":
        return "bg-sky-100 text-sky-700";

      case "completed":
        return "bg-green-100 text-green-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50">
        <div className="text-center">
          <div className="text-7xl">🐧</div>

          <p className="mt-4 font-semibold text-slate-600">
            Pengu is loading your task...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50 px-6">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">

          <div className="text-6xl">
            😔
          </div>

          <h2 className="mt-4 text-2xl font-bold text-slate-800">
            Something went wrong
          </h2>

          <p className="mt-3 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mt-6 rounded-xl bg-sky-500 px-6 py-3 font-bold text-white transition hover:bg-sky-600"
          >
            ← Dashboard
          </button>

        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50 px-6">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">

          <div className="text-6xl">
            📋
          </div>

          <h2 className="mt-4 text-2xl font-bold text-slate-800">
            Task not found
          </h2>

          <p className="mt-3 text-slate-500">
            We couldn't find this task.
          </p>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mt-6 rounded-xl bg-sky-500 px-6 py-3 font-bold text-white transition hover:bg-sky-600"
          >
            ← Dashboard
          </button>

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
      <main className="mx-auto max-w-5xl px-6 py-10">

        {/* Back */}
        <button
          type="button"
          onClick={goToProject}
          className="mb-6 cursor-pointer font-semibold text-sky-600 hover:text-sky-700"
        >
          ← Back to Project
        </button>

        {/* Task Card */}
        <div className="rounded-3xl bg-white p-8 shadow-xl">

          {/* Header */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-4xl">
                📋
              </div>

              <div>

                <p className="text-sm font-bold uppercase tracking-widest text-sky-500">
                  Task
                </p>

                <h2 className="mt-1 text-3xl font-extrabold text-slate-800">
                  {task.title}
                </h2>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  Task ID: {task.id}
                </p>

              </div>

            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-bold capitalize ${getStatusClasses(
                task.status
              )}`}
            >
              {task.status.replace("_", " ")}
            </span>

          </div>

          {/* Description */}
          <div className="mt-10">

            <h3 className="text-lg font-bold text-slate-800">
              Description
            </h3>

            <div className="mt-3 rounded-2xl bg-slate-50 p-5">

              <p className="leading-7 text-slate-600">
                {task.description ||
                  "No description provided for this task."}
              </p>

            </div>

          </div>

          {/* Information */}
          <div className="mt-8 grid gap-5 sm:grid-cols-3">

            <div className="rounded-2xl bg-sky-50 p-5">

              <p className="text-sm font-semibold text-slate-400">
                Due date
              </p>

              <p className="mt-2 font-bold text-slate-700">
                {formatDate(task.due_date)}
              </p>

            </div>

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-sm font-semibold text-slate-400">
                Created
              </p>

              <p className="mt-2 font-bold text-slate-700">
                {formatDate(task.created_at)}
              </p>

            </div>

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-sm font-semibold text-slate-400">
                Last updated
              </p>

              <p className="mt-2 font-bold text-slate-700">
                {formatDate(task.updated_at)}
              </p>

            </div>

          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-8 sm:flex-row">

            <button
              type="button"
              onClick={goToEditTask}
              className="w-full cursor-pointer rounded-xl bg-sky-500 px-6 py-3 font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-600 sm:w-auto"
            >
              ✏️ Edit Task
            </button>

            <button
              type="button"
              onClick={goToProject}
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-600 transition hover:bg-slate-50 sm:w-auto"
            >
              ← Back to Project
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default TaskDetails;