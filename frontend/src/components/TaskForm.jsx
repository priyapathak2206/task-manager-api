import React, { useState, useEffect } from "react";
import { generateAiDescription } from "../api";

function TaskForm({ initialData = null, onSubmit, onCancel, saving = false }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [completed, setCompleted] = useState(false);

  // AI Generation States
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiNotice, setAiNotice] = useState(null); // { type: 'success'|'warning'|'error', message }
  const [rateLimitTimer, setRateLimitTimer] = useState(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setCompleted(Boolean(initialData.completed));
    } else {
      setTitle("");
      setDescription("");
      setCompleted(false);
    }
    setAiNotice(null);
  }, [initialData]);

  // Rate-limit countdown handler
  useEffect(() => {
    if (rateLimitTimer === null || rateLimitTimer <= 0) return;
    const interval = setInterval(() => {
      setRateLimitTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setAiNotice(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimitTimer]);

  const handleGenerateAi = async () => {
    if (!title.trim()) {
      setAiNotice({
        type: "warning",
        message: "Enter a task title first to get an AI suggestion.",
      });
      return;
    }

    try {
      setGeneratingAi(true);
      setAiNotice(null);

      const res = await generateAiDescription(title.trim());

      if (res?.description) {
        setDescription(res.description);
        setAiNotice({
          type: "success",
          message: "AI suggestion applied — review and edit as needed.",
        });
      }
    } catch (err) {
      if (err.status === 429) {
        const match = err.message.match(/(\d+)\s*second/i);
        const seconds = match ? parseInt(match[1], 10) : 60;
        setRateLimitTimer(seconds);
        setAiNotice({
          type: "warning",
          message: `Rate limit active. Please wait ${seconds}s before requesting another suggestion.`,
        });
      } else {
        setAiNotice({
          type: "error",
          message: err.message || "Could not generate description. You can write one manually.",
        });
      }
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      completed,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: "1.5rem" }}>
      <div className="card-title">
        <span>{initialData ? "Edit Task" : "New Task"}</span>
        <button
          type="button"
          className="btn btn-sm btn-ai"
          onClick={handleGenerateAi}
          disabled={generatingAi || saving || rateLimitTimer !== null}
          title="Generate an AI draft from the title"
        >
          {generatingAi ? "Generating..." : "✨ AI Suggest"}
        </button>
      </div>

      {aiNotice && (
        <div
          className={`alert ${
            aiNotice.type === "success"
              ? "alert-success"
              : aiNotice.type === "warning"
              ? "alert-warning"
              : "alert-error"
          }`}
          style={{ padding: "0.55rem 0.85rem", fontSize: "0.8rem", marginBottom: "0.85rem" }}
        >
          <span>{aiNotice.type === "success" ? "✓" : "!"}</span>
          <div style={{ flex: 1 }}>
            {aiNotice.message}
            {rateLimitTimer !== null && ` (${rateLimitTimer}s)`}
          </div>
        </div>
      )}

      {/* Title */}
      <div className="form-group">
        <label className="form-label" htmlFor="task-title">
          Title
        </label>
        <input
          id="task-title"
          type="text"
          className="form-input"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={saving}
          required
        />
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label" htmlFor="task-desc">
          Description (Optional)
        </label>
        <textarea
          id="task-desc"
          className="form-textarea"
          rows={2}
          placeholder="Add context, notes, or AI-generated guidance..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={saving}
        />
      </div>

      {/* Status & Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginTop: "0.5rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
            disabled={saving}
            style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }}
          />
          Mark as completed
        </label>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {initialData && onCancel && (
            <button type="button" className="btn btn-sm btn-secondary" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-sm btn-primary" disabled={saving}>
            {saving ? "Saving..." : initialData ? "Save Changes" : "+ Add Task"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default TaskForm;
