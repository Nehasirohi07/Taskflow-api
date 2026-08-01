import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CreateProject() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!title.trim()) {
      setError("Project title is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/projects",
        {
          title: title.trim(),
          description: description.trim(),
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Project created:", response.data);

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Create project error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to create project."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 px-4 py-8">

      {/* Header */}
      <div className="mx-auto max-w-3xl">

        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 font-semibold text-sky-600 hover:text-sky-700"
        >
          ← Back to Dashboard
        </button>

        {/* Card */}
        <div className="rounded-3xl bg-white p-8 shadow-xl">

          <div className="mb-8 flex items-center gap-4">

            <div className="text-6xl">
              🐧
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-sky-500">
                TaskFlow Pengu
              </p>

              <h1 className="text-3xl font-extrabold text-slate-800">
                Create New Project
              </h1>

              <p className="mt-1 text-slate-500">
                Give your project a name and start organizing your work.
              </p>
            </div>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
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
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Project title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Website Development"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </div>

            {/* Description */}
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
                placeholder="Describe what this project is about..."
                rows={5}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Project status
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

            {/* Buttons */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row">

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3.5 font-bold text-slate-600 transition hover:bg-slate-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-sky-500 px-5 py-3.5 font-bold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
              >
                {loading
                  ? "Creating project..."
                  : "Create Project 🐧"}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default CreateProject;