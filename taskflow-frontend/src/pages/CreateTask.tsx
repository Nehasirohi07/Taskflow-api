import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function CreateTask() {
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const goToProject = () => {
    if (!projectId) {
      navigate("/dashboard");
      return;
    }

    navigate(`/projects/${projectId}`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!projectId) {
      setError("Project ID is missing.");
      return;
    }

    if (!/^\d+$/.test(projectId)) {
      setError("Invalid project ID.");
      return;
    }

    if (title.trim().length < 3) {
      setError("Task title must be at least 3 characters.");
      return;
    }

    try {
      setLoading(true);

      const projectID = Number(projectId);

      const response = await api.post(
        `/projects/${projectID}/tasks`,
        {
          project_id: projectID,
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

      console.log("Task created:", response.data);

      navigate(`/projects/${projectID}`);
    } catch (error: any) {
      console.error("Create task error:", error);
      console.error("Backend response:", error.response?.data);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create task."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 px-4 py-8">

      <div className="mx-auto max-w-3xl">

        <button
          type="button"
          onClick={goToProject}
          className="mb-6 cursor-pointer font-semibold text-sky-600 hover:text-sky-700"
        >
          ← Back to Project
        </button>

        <div className="rounded-3xl bg-white p-8 shadow-xl">

          <div className="mb-8 flex items-center gap-4">

            <div className="text-6xl">
              📋
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-sky-500">
                TaskFlow Pengu
              </p>

              <h1 className="text-3xl font-extrabold text-slate-800">
                Create New Task
              </h1>

              <p className="mt-1 text-slate-500">
                Add a task to your project and keep your work organized.
              </p>
            </div>

          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Task title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Design login page"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what needs to be done..."
                rows={5}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Task status
              </label>

              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              >
                <option value="active">
                  Active
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="archived">
                  Archived
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="dueDate"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Due date
              </label>

              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                You can leave this empty if the task has no deadline.
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">

              <button
                type="button"
                onClick={goToProject}
                disabled={loading}
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-3.5 font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !projectId}
                className="w-full cursor-pointer rounded-xl bg-sky-500 px-5 py-3.5 font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
              >
                {loading
                  ? "Creating task..."
                  : "Create Task 🐧"}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default CreateTask;