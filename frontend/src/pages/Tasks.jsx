import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getTasks, createTask, updateTask, deleteTask } from "../api";
import TaskForm from "../components/TaskForm";
import TaskCard from "../components/TaskCard";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";
import AuthPrompt from "../components/AuthPrompt";

function Tasks({ user, onAuthSuccess, onToast }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // Search, Filter, Sort
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const fetchTasksList = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getTasks();
      if (!res.unauthenticated) {
        setTasks(res.tasks || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load tasks from database.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTasksList();
    } else {
      setTasks([]);
      setError(null);
    }
  }, [user, fetchTasksList]);

  // Create or Update
  const handleSaveTask = async (taskData) => {
    try {
      setSaving(true);
      setError(null);

      if (editingTask) {
        const updated = await updateTask(editingTask._id, taskData);
        setTasks((prev) =>
          prev.map((t) => (t._id === editingTask._id ? updated : t))
        );
        setEditingTask(null);
        onToast?.("Task updated successfully.", "success");
      } else {
        const created = await createTask(taskData);
        setTasks((prev) => [created, ...prev]);
        onToast?.("Task added successfully.", "success");
      }
    } catch (err) {
      setError(err.message || "Failed to save task.");
      onToast?.(err.message || "Operation failed", "error");
    } finally {
      setSaving(false);
    }
  };

  // Toggle Completion
  const handleToggleComplete = async (task) => {
    try {
      setBusyId(task._id);
      const updated = await updateTask(task._id, {
        title: task.title,
        description: task.description,
        completed: !task.completed,
      });

      setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));
      onToast?.(
        `Task marked as ${updated.completed ? "completed" : "pending"}.`,
        "success"
      );
    } catch (err) {
      onToast?.(err.message || "Failed to update status", "error");
    } finally {
      setBusyId(null);
    }
  };

  // Delete
  const handleDeleteTask = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    try {
      setBusyId(id);
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      if (editingTask && editingTask._id === id) {
        setEditingTask(null);
      }
      onToast?.("Task deleted successfully.", "info");
    } catch (err) {
      onToast?.(err.message || "Failed to delete task", "error");
    } finally {
      setBusyId(null);
    }
  };

  // Filter & Sort
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (statusFilter === "completed" && !task.completed) return false;
        if (statusFilter === "pending" && task.completed) return false;

        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchTitle = task.title?.toLowerCase().includes(term);
          const matchDesc = task.description?.toLowerCase().includes(term);
          return matchTitle || matchDesc;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return sortBy === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [tasks, statusFilter, searchTerm, sortBy]);

  // If signed out, render a clean, friendly sign-in prompt instead of error banners
  if (!user) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Tasks</h1>
            <p className="page-subtitle">
              Sign in to view, create, and manage your personal tasks.
            </p>
          </div>
        </div>

        <AuthPrompt onAuthSuccess={onAuthSuccess} onToast={onToast} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">
            Manage your tasks, track pending work, and organize project milestones.
          </p>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={fetchTasksList} />

      {/* Task Creation Form */}
      <TaskForm
        initialData={editingTask}
        onSubmit={handleSaveTask}
        onCancel={() => setEditingTask(null)}
        saving={saving}
      />

      {/* Filter & Search Toolbar */}
      <div className="card" style={{ padding: "0.85rem 1.15rem", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem", alignItems: "center", justifyContent: "space-between" }}>
          {/* Search */}
          <div style={{ flex: "1 1 220px" }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "auto" }}
            >
              <option value="all">All ({tasks.length})</option>
              <option value="pending">
                Pending ({tasks.filter((t) => !t.completed).length})
              </option>
              <option value="completed">
                Completed ({tasks.filter((t) => t.completed).length})
              </option>
            </select>

            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: "auto" }}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
          <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
          </span>
          <button
            onClick={fetchTasksList}
            className="btn btn-sm btn-secondary"
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <Spinner label="Loading tasks..." />
        ) : filteredTasks.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-title">No tasks found</div>
            <div className="empty-state-desc">
              {searchTerm || statusFilter !== "all"
                ? "No tasks match your filter criteria."
                : "Your task list is empty. Add a new task above."}
            </div>
            {(searchTerm || statusFilter !== "all") && (
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onEdit={(t) => {
                setEditingTask(t);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onDelete={handleDeleteTask}
              busyId={busyId}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Tasks;
