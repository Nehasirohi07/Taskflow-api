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

function EditTask() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [task, setTask] = useState<Task | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * Fetch task
   */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!id || !/^\d+$/.test(id)) {
      setError("Invalid task ID.");
      setLoading(false);
      return;
    }

    const fetchTask = async () => {
      try {
        console.log("Fetching task:", `/tasks/${id}`);

        const response = await api.get(`/tasks/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Task response:", response.data);

        const taskData =
          response.data?.data || response.data;

        setTask(taskData);

        setTitle(taskData.title || "");
        setDescription(taskData.description || "");
        setStatus(taskData.status || "pending");

        if (taskData.due_date) {
          setDueDate(
            new Date(taskData.due_date)
              .toISOString()
              .split("T")[0]
          );
        } else {
          setDueDate("");
        }
      } catch (error: any) {
        console.error("Fetch task error:", error);
        console.error(
          "Backend response:",
          error.response?.data
        );

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
  }, [id, navigate]);

  /*
   * Logout
   */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  /*
   * Back to project
   */
  const handleCancel = () => {
    if (task?.project_id) {
      navigate(`/projects/${task.project_id}`);
    } else {
      navigate("/dashboard");
    }
  };

  /*
   * Update task
   */
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!id) {
      setError("Task ID is missing.");
      return;
    }

    if (title.trim().length < 3) {
      setError(
        "Task title must be at least 3 characters."
      );
      return;
    }

    try {
      setSaving(true);

      console.log("Updating task:", id);

      const response = await api.put(
        `/tasks/${id}`,
        {
          title: title.trim(),
          description: description.trim(),
          status,
          due_date: dueDate || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Task updated:",
        response.data
      );

      setSuccess(
        "Task updated successfully! 🐧"
      );

      /*
       * Go back to project after successful update
       */
      setTimeout(() => {
        if (task?.project_id) {
          navigate(`/projects/${task.project_id}`);
        } else {
          navigate("/dashboard");
        }
      }, 800);
    } catch (error: any) {
      console.error(
        "Update task error:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update task."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Loading screen
   */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50">
        <div className="text-center">

          <div className="text-7xl">
            🐧
          </div>

          <p className="mt-4 font-semibold text-slate-600">
            Pengu is loading your task...
          </p>

        </div>
      </div>
    );
  }

  /*
   * Error screen
   */
  if (error && !task) {
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
            className="rounded-xl bg-sky-50 px-4 py-2 text-sm font-bold text-sky-600 transition hover:bg-sky-100"
          >
            Logout
          </button>

        </div>

      </header>

      {/* Main */}
      <main className="mx-auto max-w-3xl px-6 py-10">

        {/* Back */}
        <button
          type="button"
          onClick={handleCancel}
          className="mb-6 font-semibold text-sky-600 transition hover:text-sky-700"
        >
          ← Back to Project
        </button>

        {/* Card */}
        <div className="rounded-3xl bg-white p-8 shadow-xl">

          {/* Header */}
          <div className="mb-8 flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-4xl">
              ✏️
            </div>

            <div>

              <p className="text-sm font-bold uppercase tracking-widest text-sky-500">
                Task Management
              </p>

              <h2 className="mt-1 text-3xl font-extrabold text-slate-800">
                Edit Task
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update your task details.
              </p>

            </div>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-6 rounded-2xl bg-green-50 px-5 py-4 text-sm font-semibold text-green-600">
              {success}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Title */}
            <div>

              <label
                htmlFor="title"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Task Title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Enter task title"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                required
              />

            </div>

            {/* Description */}
            <div>

              <label
                htmlFor="description"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Enter task description"
                rows={5}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />

            </div>

            {/* Status */}
            <div>

              <label
                htmlFor="status"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              >

                <option value="pending">
                  Pending
                </option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="completed">
                  Completed
                </option>

              </select>

            </div>

            {/* Due Date */}
            <div>

              <label
                htmlFor="dueDate"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Due Date
              </label>

              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                Leave empty if the task has no deadline.
              </p>

            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">

              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="w-full rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-sky-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {saving
                  ? "Updating..."
                  : "Update Task 🐧"}
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}

export default EditTask;