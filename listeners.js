const taskEvents = require("./events");

// In-memory event log buffer for Practical 10 Activity & Events
const recentEvents = [];
const MAX_EVENTS = 50;

const addEvent = (event) => {
  recentEvents.unshift(event);
  if (recentEvents.length > MAX_EVENTS) {
    recentEvents.pop();
  }
};

// Register listeners once
taskEvents.on("task-created", (payload) => {
  const { task, apiTimestamp } = payload;
  const start = new Date().toISOString();
  const startTime = Date.now();
  const eventId = `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  const eventRecord = {
    id: eventId,
    type: "task-created",
    taskId: task._id ? String(task._id) : undefined,
    taskTitle: task.title,
    userId: task.user ? String(task.user) : undefined,
    apiTimestamp,
    notificationStart: start,
    notificationCompletion: null,
    status: "processing",
    durationMs: null,
  };

  addEvent(eventRecord);

  // Practical 10: Asynchronous notification simulation with 2-second delay
  setTimeout(() => {
    const end = new Date().toISOString();
    const durationMs = Date.now() - startTime;
    eventRecord.notificationCompletion = end;
    eventRecord.status = "completed";
    eventRecord.durationMs = durationMs;

    console.log(`\n--- Notification Processing ---`);
    console.log(`Task Created: ${task.title}`);
    console.log(`User ID: ${task.user}`);
    console.log(`API Response Timestamp: ${apiTimestamp}`);
    console.log(`Notification Start Timestamp: ${start}`);
    console.log(`Notification Completion Timestamp: ${end}`);
    console.log(`-------------------------------\n`);
  }, 2000);
});

taskEvents.on("task-deleted", (payload) => {
  const { task, apiTimestamp } = payload;
  const start = new Date().toISOString();
  const eventId = `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  const eventRecord = {
    id: eventId,
    type: "task-deleted",
    taskId: task._id ? String(task._id) : undefined,
    taskTitle: task.title || `Task #${task._id}`,
    userId: task.user ? String(task.user) : undefined,
    apiTimestamp,
    notificationStart: start,
    notificationCompletion: start,
    status: "completed",
    durationMs: 0,
  };

  addEvent(eventRecord);

  console.log(`\n--- Notification Processing ---`);
  console.log(`Task Deleted Notification - Task ID: ${task._id}`);
  console.log(`User ID: ${task.user}`);
  console.log(`API Response Timestamp: ${apiTimestamp}`);
  console.log(`-------------------------------\n`);
});

taskEvents.on("error", (err) => {
  console.error("[TaskEvents Error]:", err);
});

const getEvents = (userId) => {
  if (!userId) return [...recentEvents];
  return recentEvents.filter((e) => !e.userId || e.userId === String(userId));
};

module.exports = {
  getEvents,
};
