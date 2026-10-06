const taskEvents = require("./events");

// Register listeners once
taskEvents.on("task-created", (payload) => {
  const { task, apiTimestamp } = payload;
  const start = new Date().toISOString();
  
  setTimeout(() => {
    const end = new Date().toISOString();
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
  console.log(`\n--- Notification Processing ---`);
  console.log(`Task Deleted Notification - Task ID: ${task._id}`);
  console.log(`User ID: ${task.user}`);
  console.log(`API Response Timestamp: ${apiTimestamp}`);
  console.log(`-------------------------------\n`);
});

taskEvents.on("error", (err) => {
  console.error("[TaskEvents Error]:", err);
});
