(function () {
  "use strict";

  const demo = window.MemoryLoopDemo;
  if (!demo) return;

  const page = document.body.dataset.page;
  const labels = demo.getLabels();
  let activeTaskId = null;
  let currentQuestion = null;
  let lastResult = null;
  let reminderNotice = "";
  let toastTimer = 0;

  function node(tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
  }

  function clear(element) {
    if (element) element.replaceChildren();
  }

  function appendOption(select, key, label) {
    const option = node("option", "", label);
    option.value = key;
    select.append(option);
  }

  function showToast(message) {
    const toast = document.querySelector("[data-toast]");
    if (!toast) return;
    toast.textContent = message;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toast.textContent = ""; }, 3200);
  }

  function showStorageNotice() {
    if (demo.getStorageStatus()) return;
    const notice = node("p", "field-note", "Browser storage is unavailable; changes will last only until this page is closed.");
    const main = document.querySelector("main");
    if (main && !main.querySelector("[data-storage-warning]")) {
      notice.dataset.storageWarning = "true";
      main.prepend(notice);
    }
  }

  function getSelectedTaskId() {
    const state = demo.getState();
    return state.tasks.some((task) => task.id === state.selectedTaskId)
      ? state.selectedTaskId
      : state.tasks[0].id;
  }

  function renderPatient() {
    const select = document.querySelector("[data-patient-task]");
    if (!select) return;
    const tasks = demo.getTasks();
    const selectedId = getSelectedTaskId();
    if (selectedId !== activeTaskId) {
      activeTaskId = selectedId;
      currentQuestion = null;
      lastResult = null;
    }
    clear(select);
    for (const task of tasks) {
      const details = demo.getTaskDetails(task);
      appendOption(select, task.id, `${details.title} · ${details.date}`);
    }
    select.value = activeTaskId;

    const task = demo.getTask(activeTaskId);
    const details = demo.getTaskDetails(task);
    const summary = document.querySelector("[data-task-summary]");
    clear(summary);
    const entries = [
      ["Destination", details.destination, false],
      ["Date", details.date, false],
      ["Time", details.time, false],
      ["Bring", details.items.join(", "), true]
    ];
    for (const [title, value, wide] of entries) {
      const item = node("div", `summary-item${wide ? " summary-wide" : ""}`);
      item.append(node("strong", "", title), node("span", "", value));
      summary.append(item);
    }

    if (!currentQuestion) currentQuestion = demo.getNextQuestion(activeTaskId);
    const category = document.querySelector("[data-question-category]");
    const prompt = document.querySelector("[data-question-prompt]");
    const reason = document.querySelector("[data-selection-reason]");
    if (currentQuestion) {
      category.textContent = currentQuestion.categoryLabel;
      prompt.textContent = currentQuestion.prompt;
      reason.textContent = currentQuestion.reason;
    }
    renderAnswerResult();
    renderReminderStages();
    showStorageNotice();
  }

  function renderAnswerResult() {
    const box = document.querySelector("[data-answer-result]");
    const nextButton = document.querySelector("[data-next-question]");
    if (!box || !nextButton) return;
    if (!lastResult) {
      box.hidden = true;
      clear(box);
      nextButton.hidden = true;
      return;
    }
    box.hidden = false;
    box.dataset.status = lastResult.status;
    clear(box);
    const statusLabels = {
      correct: "Configured concepts matched",
      partial: "Some concepts matched",
      incorrect: "Try again together",
      review: "Let’s make the answer clearer"
    };
    box.append(node("h3", "", statusLabels[lastResult.status]), node("p", "", lastResult.feedback));
    const coverage = node("p", "small-note", `Concept coverage: ${lastResult.matchedCount} of ${lastResult.requiredCount} configured.`);
    box.append(coverage);
    nextButton.hidden = !lastResult.nextQuestion;
  }

  function renderReminderStages() {
    const container = document.querySelector("[data-reminder-stages]");
    if (!container) return;
    clear(container);
    const events = demo.getReminderEvents(activeTaskId);
    const stateByStage = new Map();
    for (const event of events) stateByStage.set(event.stage, event);
    for (const stage of labels.reminderStages) {
      const event = stateByStage.get(stage.key);
      const row = node("div", "stage-row");
      row.append(node("strong", "", stage.label));
      row.append(node("span", "", event ? (event.source === "sample" ? "Example event" : "Simulated now") : "Not triggered"));
      row.append(node("small", "", stage.offset));
      container.append(row);
    }
    const acknowledgement = stateByStage.get("ACKNOWLEDGED");
    if (acknowledgement) {
      const row = node("div", "stage-row");
      row.append(node("strong", "", "Acknowledgement"));
      row.append(node("span", "", acknowledgement.source === "sample" ? "Example event" : "Simulated now"));
      row.append(node("small", "", "Patient response"));
      container.append(row);
    }
    const simulate = document.querySelector("[data-simulate-reminder]");
    const next = demo.getNextReminderStage(activeTaskId);
    simulate.disabled = !next;
    simulate.textContent = next ? `Simulate: ${next.label}` : "All sample stages explored";
    const notice = document.querySelector("[data-reminder-notice]");
    notice.textContent = reminderNotice || "No simulated reminder has been triggered on this task yet.";
  }

  function renderCaregiver() {
    const scenarioSelect = document.querySelector("[data-scenario-select]");
    if (scenarioSelect && !scenarioSelect.options.length) {
      for (const item of labels.scenarios) appendOption(scenarioSelect, item.key, item.label);
    }
    const slotSelect = document.querySelector("[data-slot-select]");
    if (slotSelect && !slotSelect.options.length) {
      for (const item of labels.slots) appendOption(slotSelect, item.key, item.label);
    }
    const questionSelect = document.querySelector("[data-question-select]");
    if (questionSelect && !questionSelect.options.length) {
      for (const item of labels.questions) appendOption(questionSelect, item.key, item.label);
    }
    const itemOptions = document.querySelector("[data-item-options]");
    if (itemOptions && !itemOptions.childElementCount) {
      for (const item of labels.items) {
        const id = `demo-item-${item.key}`;
        const wrapper = node("div", "checkbox-choice");
        const checkbox = node("input");
        checkbox.type = "checkbox";
        checkbox.name = "itemKeys";
        checkbox.value = item.key;
        checkbox.id = id;
        const label = node("label", "", item.label);
        label.htmlFor = id;
        wrapper.append(checkbox, label);
        itemOptions.append(wrapper);
      }
    }

    const taskList = document.querySelector("[data-caregiver-tasks]");
    if (taskList) {
      clear(taskList);
      for (const task of [...demo.getTasks()].reverse()) {
        const details = demo.getTaskDetails(task);
        const row = node("article", "task-row");
        row.append(node("h3", "", details.title));
        row.append(node("p", "", `${details.destination} · ${details.date} at ${details.time}`));
        row.append(node("p", "task-meta", `Bring: ${details.items.join(", ")} · Initial question: ${labels.questions.find((item) => item.key === task.questionKey).category}`));
        const button = node("button", "button button-small button-outline", "Practice this task");
        button.type = "button";
        button.dataset.openTask = task.id;
        row.append(button);
        taskList.append(row);
      }
    }

    const interactions = document.querySelector("[data-caregiver-interactions]");
    if (interactions) {
      clear(interactions);
      const rows = [...demo.getInteractions()].reverse().slice(0, 12);
      for (const event of rows) {
        const task = demo.getTask(event.taskId);
        if (!task) continue;
        const row = node("div", "interaction-row");
        row.append(node("strong", "", `${labels.questions.find((item) => item.key === event.questionKey).category} · ${event.status.toUpperCase()}`));
        row.append(node("span", "", `${demo.getTaskDetails(task).title} · ${event.matchedCount}/${event.requiredCount} concepts · ${event.source === "sample" ? "illustrative sample" : "this-browser demo"}`));
        interactions.append(row);
      }
    }

    const reminderHistory = document.querySelector("[data-caregiver-reminders]");
    if (reminderHistory) {
      clear(reminderHistory);
      const events = [...demo.getReminderEvents()].reverse().slice(0, 12);
      for (const event of events) {
        const task = demo.getTask(event.taskId);
        if (!task) continue;
        const row = node("div", "history-row");
        row.append(node("strong", "", labels.stageLabels[event.stage]));
        row.append(node("span", "", `${demo.getTaskDetails(task).title} · ${event.source === "sample" ? "illustrative example" : "simulated in this browser"}`));
        reminderHistory.append(row);
      }
    }
    showStorageNotice();
  }

  function renderClinician() {
    const stats = demo.getStats();
    const total = document.querySelector("[data-clinician-total]");
    if (!total) return;
    total.textContent = String(stats.total);
    document.querySelector("[data-clinician-complete]").textContent = `${stats.completePercent}%`;
    const practiced = Object.values(stats.categories).filter((category) => category.count > 0).length;
    document.querySelector("[data-clinician-categories]").textContent = String(practiced);

    const chart = document.querySelector("[data-category-chart]");
    clear(chart);
    for (const category of Object.values(stats.categories)) {
      const row = node("div", "category-row");
      row.append(node("strong", "", category.label));
      const track = node("div", "bar-track");
      track.setAttribute("role", "img");
      const percent = category.count ? Math.round(category.complete / category.count * 100) : 0;
      track.setAttribute("aria-label", category.count ? `${category.label}: ${percent}% complete configured answers from ${category.count} demo responses` : `${category.label}: no demo responses`);
      const fill = node("div", "bar-fill");
      fill.style.width = `${percent}%`;
      track.append(fill);
      row.append(track, node("span", "", category.count ? `${percent}%` : "—"));
      chart.append(row);
    }

    const table = document.querySelector("[data-clinician-interactions]");
    clear(table);
    const interactions = [...demo.getInteractions()].reverse();
    for (const event of interactions) {
      const task = demo.getTask(event.taskId);
      if (!task) continue;
      const details = demo.getTaskDetails(task);
      const row = node("tr");
      const values = [
        event.source === "sample" ? `Example ${event.step}` : `Demo ${event.step}`,
        details.title,
        labels.questions.find((item) => item.key === event.questionKey).category,
        event.status.toUpperCase(),
        `${event.matchedCount}/${event.requiredCount}`
      ];
      for (const value of values) row.append(node("td", "", value));
      table.append(row);
    }

    const taskId = getSelectedTaskId();
    const next = demo.getNextQuestion(taskId);
    const policy = document.querySelector("[data-policy-explanation]");
    policy.textContent = next
      ? `${next.prompt} ${next.reason}`
      : "Create a sample task in the caregiver view to explore question selection.";
    const evidence = document.querySelector("[data-policy-evidence]");
    clear(evidence);
    for (const category of Object.values(stats.categories)) {
      const value = category.count ? `${Math.round(category.coverage * 100)}% average concept coverage across ${category.count} demo response(s)` : "No response history yet";
      evidence.append(node("li", "", `${category.label}: ${value}`));
    }
    showStorageNotice();
  }

  function renderAll() {
    if (page === "patient") renderPatient();
    if (page === "caregiver") renderCaregiver();
    if (page === "clinician") renderClinician();
  }

  function initialize() {
    demo.load();
    renderAll();
    demo.subscribe(renderAll);
    window.addEventListener("storage", (event) => {
      if (event.key === "memoryloop.portfolio-demo.v1") demo.refreshFromStorage();
    });

    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      const reset = target.closest("[data-reset-demo]");
      if (reset) {
        activeTaskId = null;
        currentQuestion = null;
        lastResult = null;
        reminderNotice = "";
        const answer = document.querySelector("#answer-input");
        if (answer) answer.value = "";
        demo.reset();
        showToast("Synthetic demo state reset in this browser.");
        return;
      }
      const openTask = target.closest("[data-open-task]");
      if (openTask) {
        demo.selectTask(openTask.dataset.openTask);
        window.location.href = "patient.html";
        return;
      }
      const nextQuestion = target.closest("[data-next-question]");
      if (nextQuestion && lastResult && lastResult.nextQuestion) {
        currentQuestion = lastResult.nextQuestion;
        lastResult = null;
        renderPatient();
        return;
      }
      if (target.closest("[data-simulate-reminder]")) {
        const stage = demo.getNextReminderStage(activeTaskId);
        if (!stage) return;
        demo.recordReminder(activeTaskId, stage.key);
        reminderNotice = `${stage.label} displayed now in this simulation for ${demo.getTaskDetails(demo.getTask(activeTaskId)).title}. No notification was scheduled or delivered.`;
        renderReminderStages();
        return;
      }
      if (target.closest("[data-acknowledge-task]")) {
        demo.recordReminder(activeTaskId, "ACKNOWLEDGED");
        reminderNotice = "Sample task acknowledgement recorded only in the synthetic browser demo.";
        renderReminderStages();
        return;
      }
      if (target.closest("[data-speak-question]")) {
        if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
          reminderNotice = "Text-to-speech is not available in this browser.";
          showToast(reminderNotice);
          return;
        }
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(currentQuestion.prompt));
      }
    });

    document.addEventListener("change", (event) => {
      if (event.target.matches("[data-patient-task]")) {
        activeTaskId = event.target.value;
        demo.selectTask(activeTaskId);
        currentQuestion = demo.getNextQuestion(activeTaskId);
        lastResult = null;
        const answer = document.querySelector("#answer-input");
        if (answer) answer.value = "";
        renderPatient();
      }
    });

    document.addEventListener("submit", (event) => {
      if (event.target.matches("[data-task-form]")) {
        event.preventDefault();
        const message = document.querySelector("[data-task-message]");
        const itemKeys = [...event.target.querySelectorAll('input[name="itemKeys"]:checked')].map((input) => input.value);
        try {
          const task = demo.createTask({
            scenarioKey: document.querySelector("[data-scenario-select]").value,
            slotKey: document.querySelector("[data-slot-select]").value,
            questionKey: document.querySelector("[data-question-select]").value,
            itemKeys
          });
          event.target.reset();
          message.textContent = `${demo.getTaskDetails(task).title} added to this browser's synthetic demo. Open it in the patient view to practice.`;
          showToast("Sample task created.");
        } catch (error) {
          message.textContent = error.message;
        }
      } else if (event.target.matches("[data-answer-form]")) {
        event.preventDefault();
        const input = document.querySelector("#answer-input");
        lastResult = demo.evaluate(activeTaskId, currentQuestion.questionKey, input.value);
        lastResult.nextQuestion = demo.getNextQuestion(activeTaskId);
        demo.submitAnswer(activeTaskId, currentQuestion.questionKey, input.value);
        input.value = "";
        document.querySelector("[data-answer-result]").focus();
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
}());
