const form = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const submitButton = document.getElementById("task-submit");
const cancelButton = document.getElementById("cancel-edit");
const taskList = document.getElementById("task-list");
const statusMessage = document.getElementById("status-message");
const refreshButton = document.getElementById("refresh-tasks");

let config;
let editingTaskId = null;

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

async function loadConfig() {
  const response = await fetch("./config.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load config.json. Check that it exists in the repository root.");
  config = await response.json();
  if (!config.supabaseUrl || !config.supabasePublishableKey || config.tableName !== "tasks") {
    throw new Error("Supabase configuration is incomplete. Check config.json.");
  }
}

function apiUrl(query = "") {
  const base = config.supabaseUrl.replace(/\/$/, "");
  return `${base}/rest/v1/${config.tableName}${query}`;
}

function apiHeaders(extra = {}) {
  return {
    apikey: config.supabasePublishableKey,
    Authorization: `Bearer ${config.supabasePublishableKey}`,
    "Content-Type": "application/json",
    ...extra
  };
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: apiHeaders(options.headers || {})
  });
  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body.message || body.details || body.hint || JSON.stringify(body);
    } catch {
      detail = await response.text();
    }
    throw new Error(detail || `Request failed (${response.status})`);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function createButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `button secondary ${className}`;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function renderTasks(tasks) {
  taskList.replaceChildren();
  if (!tasks.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No tasks yet. Add your first task above.";
    taskList.append(empty);
    return;
  }

  for (const task of tasks) {
    const item = document.createElement("article");
    item.className = "task-item";
    item.dataset.id = task.id;

    const content = document.createElement("div");
    content.className = "task-content";

    const title = document.createElement("h3");
    title.className = "task-title";
    title.textContent = task.title;

    const description = document.createElement("p");
    description.className = "task-description";
    description.textContent = task.description || "";

    const status = document.createElement("span");
    status.className = `task-status${task.completed ? " completed" : ""}`;
    status.textContent = task.completed ? "Completed" : "Incomplete";

    content.append(title, description, status);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    actions.append(
      createButton("Edit", "edit-task", () => startEditing(task)),
      createButton(task.completed ? "Mark incomplete" : "Complete", "toggle-task", () => toggleTask(task)),
      createButton("Delete", "delete-task", () => deleteTask(task.id))
    );

    item.append(content, actions);
    taskList.append(item);
  }
}

async function loadTasks() {
  showStatus("Loading tasks…");
  try {
    const tasks = await apiRequest(apiUrl("?select=*&order=id.desc"));
    renderTasks(tasks || []);
    showStatus(`${(tasks || []).length} task(s) loaded.`);
  } catch (error) {
    showStatus(`Could not load tasks: ${error.message}`, true);
  }
}

function resetForm() {
  editingTaskId = null;
  form.reset();
  submitButton.textContent = "Add task";
  cancelButton.hidden = true;
  document.getElementById("form-heading").textContent = "Add a task";
}

function startEditing(task) {
  editingTaskId = task.id;
  titleInput.value = task.title;
  descriptionInput.value = task.description || "";
  submitButton.textContent = "Save changes";
  cancelButton.hidden = false;
  document.getElementById("form-heading").textContent = "Edit task";
  titleInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  if (!title) {
    showStatus("Please enter a task title.", true);
    titleInput.focus();
    return;
  }

  submitButton.disabled = true;
  try {
    if (editingTaskId === null) {
      await apiRequest(apiUrl(), {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ title, description, completed: false })
      });
      showStatus("Task added successfully.");
    } else {
      await apiRequest(apiUrl(`?id=eq.${encodeURIComponent(editingTaskId)}`), {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ title, description })
      });
      showStatus("Task updated successfully.");
    }
    resetForm();
    await loadTasks();
  } catch (error) {
    showStatus(`Could not save task: ${error.message}`, true);
  } finally {
    submitButton.disabled = false;
  }
});

async function toggleTask(task) {
  try {
    await apiRequest(apiUrl(`?id=eq.${encodeURIComponent(task.id)}`), {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ completed: !task.completed })
    });
    await loadTasks();
  } catch (error) {
    showStatus(`Could not update task: ${error.message}`, true);
  }
}

async function deleteTask(id) {
  if (!window.confirm("Delete this task?")) return;
  try {
    await apiRequest(apiUrl(`?id=eq.${encodeURIComponent(id)}`), { method: "DELETE" });
    if (String(editingTaskId) === String(id)) resetForm();
    showStatus("Task deleted.");
    await loadTasks();
  } catch (error) {
    showStatus(`Could not delete task: ${error.message}`, true);
  }
}

cancelButton.addEventListener("click", resetForm);
refreshButton.addEventListener("click", loadTasks);

(async function init() {
  try {
    await loadConfig();
    await loadTasks();
  } catch (error) {
    showStatus(error.message, true);
  }
})();
