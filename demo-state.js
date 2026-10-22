(function (root) {
  "use strict";

  const STORAGE_KEY = "memoryloop.portfolio-demo.v1";
  const VERSION = 1;
  const MAX_TASKS = 20;
  const MAX_INTERACTIONS = 100;
  const MAX_REMINDER_EVENTS = 200;

  const SCENARIOS = Object.freeze({
    garden: Object.freeze({ title: "Community garden visit", destination: "Riverside Community Garden" }),
    library: Object.freeze({ title: "Library story hour", destination: "Oakwood Library" }),
    art: Object.freeze({ title: "Harbor art workshop", destination: "Harbor Arts Studio" })
  });
  const ITEMS = Object.freeze({
    keys: Object.freeze({ label: "House keys", aliases: ["key", "keys", "house keys"] }),
    water: Object.freeze({ label: "Water bottle", aliases: ["water", "water bottle", "bottle"] }),
    glasses: Object.freeze({ label: "Reading glasses", aliases: ["reading glasses", "glasses", "spectacles", "eyeglasses"] }),
    card: Object.freeze({ label: "Library card", aliases: ["library card", "membership card", "card"] }),
    sketchbook: Object.freeze({ label: "Sketchbook", aliases: ["sketchbook", "drawing book", "art book"] }),
    umbrella: Object.freeze({ label: "Umbrella", aliases: ["umbrella", "rain cover"] })
  });
  const SLOTS = Object.freeze({
    "today-afternoon": Object.freeze({ label: "Today · 4:00 PM", time: "4:00 PM", hour: 16, dayOffset: 0 }),
    "tomorrow-morning": Object.freeze({ label: "Tomorrow · 10:00 AM", time: "10:00 AM", hour: 10, dayOffset: 1 }),
    "tomorrow-afternoon": Object.freeze({ label: "Tomorrow · 2:00 PM", time: "2:00 PM", hour: 14, dayOffset: 1 })
  });
  const QUESTIONS = Object.freeze({
    destination: Object.freeze({ category: "DESTINATION_RECALL", label: "Where are you going?", hint: "Destination" }),
    objects: Object.freeze({ category: "OBJECT_RECALL", label: "What should you bring?", hint: "Items to remember" }),
    time: Object.freeze({ category: "TIME_RECALL", label: "What time is the event?", hint: "Event time" })
  });
  const REMINDER_STAGES = Object.freeze([
    Object.freeze({ key: "REHEARSAL_2H", label: "Practice rehearsal", offset: "2 hours before" }),
    Object.freeze({ key: "FOLLOW_UP_15M", label: "Follow-up question", offset: "15 minutes before" }),
    Object.freeze({ key: "FINAL_1M", label: "Final reminder", offset: "1 minute before" }),
    Object.freeze({ key: "POST_EVENT_2H", label: "After-event recall", offset: "2 hours after" })
  ]);
  const STAGE_LABELS = Object.freeze({
    REHEARSAL_2H: "Practice rehearsal",
    FOLLOW_UP_15M: "Follow-up question",
    FINAL_1M: "Final reminder",
    POST_EVENT_2H: "After-event recall",
    ACKNOWLEDGED: "Patient acknowledgement"
  });

  let memoryState = null;
  let storageAvailable = true;
  const listeners = new Set();

  function isKey(value, lookup) {
    return typeof value === "string" && Object.prototype.hasOwnProperty.call(lookup, value);
  }

  function makeSeed() {
    return {
      version: VERSION,
      nextTask: 1,
      nextStep: 4,
      selectedTaskId: "task-seed-01",
      tasks: [{
        id: "task-seed-01",
        scenarioKey: "garden",
        slotKey: "tomorrow-morning",
        itemKeys: ["keys", "water"],
        questionKey: "objects",
        questionKeys: ["objects", "destination", "time"]
      }],
      interactions: [
        { id: "answer-seed-01", taskId: "task-seed-01", questionKey: "destination", status: "correct", coverage: 1, matchedCount: 1, requiredCount: 1, step: 1, source: "sample" },
        { id: "answer-seed-02", taskId: "task-seed-01", questionKey: "objects", status: "partial", coverage: 0.5, matchedCount: 1, requiredCount: 2, step: 2, source: "sample" },
        { id: "answer-seed-03", taskId: "task-seed-01", questionKey: "time", status: "incorrect", coverage: 0, matchedCount: 0, requiredCount: 1, step: 3, source: "sample" }
      ],
      reminderEvents: [
        { id: "reminder-seed-01", taskId: "task-seed-01", stage: "REHEARSAL_2H", step: 1, source: "sample", status: "example" },
        { id: "reminder-seed-02", taskId: "task-seed-01", stage: "ACKNOWLEDGED", step: 2, source: "sample", status: "example" }
      ]
    };
  }

  function sanitizeState(value) {
    const seed = makeSeed();
    if (!value || value.version !== VERSION || !Array.isArray(value.tasks) ||
        !Array.isArray(value.interactions) || !Array.isArray(value.reminderEvents)) {
      return seed;
    }
    const tasks = [];
    const validIds = new Set();
    for (const candidate of value.tasks.slice(0, MAX_TASKS)) {
      if (!candidate || !/^task-(?:seed-\d{2}|demo-\d{4})$/.test(candidate.id) ||
          !isKey(candidate.scenarioKey, SCENARIOS) || !isKey(candidate.slotKey, SLOTS) ||
          !isKey(candidate.questionKey, QUESTIONS) || !Array.isArray(candidate.itemKeys)) continue;
      const itemKeys = [...new Set(candidate.itemKeys.filter((key) => isKey(key, ITEMS)))].slice(0, 6);
      if (!itemKeys.length) continue;
      const questionKeys = [...new Set(
        (Array.isArray(candidate.questionKeys) ? candidate.questionKeys : [candidate.questionKey])
          .filter((key) => isKey(key, QUESTIONS))
      )];
      if (!questionKeys.includes(candidate.questionKey)) questionKeys.unshift(candidate.questionKey);
      const task = {
        id: candidate.id,
        scenarioKey: candidate.scenarioKey,
        slotKey: candidate.slotKey,
        itemKeys,
        questionKey: candidate.questionKey,
        questionKeys: questionKeys.slice(0, 3)
      };
      tasks.push(task);
      validIds.add(task.id);
    }
    if (!tasks.length) return seed;

    const interactions = value.interactions.slice(-MAX_INTERACTIONS).filter((candidate) =>
      candidate && /^answer-(?:seed-\d{2}|demo-\d{4})$/.test(candidate.id) &&
      validIds.has(candidate.taskId) && isKey(candidate.questionKey, QUESTIONS) &&
      ["correct", "partial", "incorrect", "review"].includes(candidate.status) &&
      Number.isFinite(candidate.coverage) && candidate.coverage >= 0 && candidate.coverage <= 1 &&
      Number.isInteger(candidate.matchedCount) && candidate.matchedCount >= 0 &&
      Number.isInteger(candidate.requiredCount) && candidate.requiredCount > 0 &&
      Number.isInteger(candidate.step) && ["sample", "visitor"].includes(candidate.source)
    ).map((candidate) => ({
      id: candidate.id,
      taskId: candidate.taskId,
      questionKey: candidate.questionKey,
      status: candidate.status,
      coverage: candidate.coverage,
      matchedCount: Math.min(candidate.matchedCount, 6),
      requiredCount: Math.min(candidate.requiredCount, 6),
      step: candidate.step,
      source: candidate.source
    }));
    const reminderEvents = value.reminderEvents.slice(-MAX_REMINDER_EVENTS).filter((candidate) =>
      candidate && /^reminder-(?:seed-\d{2}|demo-\d{4})$/.test(candidate.id) &&
      validIds.has(candidate.taskId) && isKey(candidate.stage, STAGE_LABELS) &&
      Number.isInteger(candidate.step) && ["sample", "visitor"].includes(candidate.source) &&
      ["example", "simulated"].includes(candidate.status)
    ).map((candidate) => ({
      id: candidate.id,
      taskId: candidate.taskId,
      stage: candidate.stage,
      step: candidate.step,
      source: candidate.source,
      status: candidate.status
    }));
    const selectedTaskId = validIds.has(value.selectedTaskId) ? value.selectedTaskId : tasks[0].id;
    return {
      version: VERSION,
      nextTask: Number.isInteger(value.nextTask) ? Math.max(1, Math.min(value.nextTask, 9999)) : 1,
      nextStep: Number.isInteger(value.nextStep) ? Math.max(1, Math.min(value.nextStep, 999999)) : 1,
      selectedTaskId,
      tasks,
      interactions,
      reminderEvents
    };
  }

  function save() {
    if (!memoryState) return;
    if (storageAvailable && root.localStorage) {
      try {
        root.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
      } catch (error) {
        storageAvailable = false;
      }
    }
    for (const listener of listeners) listener(getState());
  }

  function load() {
    if (memoryState) return getState();
    if (root.localStorage) {
      try {
        const raw = root.localStorage.getItem(STORAGE_KEY);
        memoryState = raw ? sanitizeState(JSON.parse(raw)) : makeSeed();
        storageAvailable = true;
        if (!raw) root.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
      } catch (error) {
        storageAvailable = false;
        memoryState = makeSeed();
      }
    } else {
      storageAvailable = false;
      memoryState = makeSeed();
    }
    return getState();
  }

  function getState() {
    if (!memoryState) load();
    return JSON.parse(JSON.stringify(memoryState));
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function refreshFromStorage() {
    if (!root.localStorage) return;
    try {
      const raw = root.localStorage.getItem(STORAGE_KEY);
      if (raw) memoryState = sanitizeState(JSON.parse(raw));
      for (const listener of listeners) listener(getState());
    } catch (error) {
      storageAvailable = false;
    }
  }

  function reset() {
    memoryState = makeSeed();
    save();
    return getState();
  }

  function getTasks() {
    return getState().tasks;
  }

  function getTask(taskId) {
    return getTasks().find((task) => task.id === taskId) || null;
  }

  function selectTask(taskId) {
    if (!getTask(taskId)) throw new Error("Choose an available sample task.");
    memoryState.selectedTaskId = taskId;
    save();
  }

  function getTaskDetails(task) {
    if (!task) return null;
    const scenario = SCENARIOS[task.scenarioKey];
    const slot = SLOTS[task.slotKey];
    const base = new Date();
    base.setHours(12, 0, 0, 0);
    base.setDate(base.getDate() + slot.dayOffset);
    return {
      title: scenario.title,
      destination: scenario.destination,
      time: slot.time,
      date: base.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }),
      items: task.itemKeys.map((key) => ITEMS[key].label)
    };
  }

  function createTask(input) {
    const state = getState();
    if (state.tasks.length >= MAX_TASKS) throw new Error("The demo task limit has been reached. Reset the demo to start again.");
    if (!input || !isKey(input.scenarioKey, SCENARIOS) || !isKey(input.slotKey, SLOTS) ||
        !isKey(input.questionKey, QUESTIONS) || !Array.isArray(input.itemKeys)) {
      throw new Error("Choose a listed sample event, time, item, and question.");
    }
    const itemKeys = [...new Set(input.itemKeys.filter((key) => isKey(key, ITEMS)))].slice(0, 6);
    if (!itemKeys.length) throw new Error("Choose at least one sample item to remember.");
    const id = `task-demo-${String(state.nextTask).padStart(4, "0")}`;
    memoryState.tasks.push({
      id,
      scenarioKey: input.scenarioKey,
      slotKey: input.slotKey,
      itemKeys,
      questionKey: input.questionKey,
      questionKeys: [input.questionKey, ...Object.keys(QUESTIONS).filter((key) => key !== input.questionKey)]
    });
    memoryState.nextTask += 1;
    memoryState.selectedTaskId = id;
    save();
    return getTask(id);
  }

  function requiredConcepts(task, questionKey) {
    if (!task || !isKey(questionKey, QUESTIONS)) return [];
    if (questionKey === "destination") return [SCENARIOS[task.scenarioKey].destination];
    if (questionKey === "time") return [SLOTS[task.slotKey].time];
    return task.itemKeys.map((key) => ITEMS[key].label);
  }

  function questionFor(taskId, questionKey, reason) {
    const task = getTask(taskId);
    if (!task || !task.questionKeys.includes(questionKey)) return null;
    const definition = QUESTIONS[questionKey];
    const concepts = requiredConcepts(task, questionKey);
    const prompt = questionKey === "destination"
      ? `Where are you going for the ${SCENARIOS[task.scenarioKey].title.toLowerCase()}?`
      : questionKey === "time"
        ? `What time is the ${SCENARIOS[task.scenarioKey].title.toLowerCase()}?`
        : `What should you remember to bring to the ${SCENARIOS[task.scenarioKey].title.toLowerCase()}?`;
    return { taskId, questionKey, category: definition.category, categoryLabel: definition.hint, prompt, concepts, reason };
  }

  function getInitialQuestion(taskId) {
    const task = getTask(taskId);
    return task ? questionFor(taskId, task.questionKey, "Caregiver-selected sample question.") : null;
  }

  function getNextQuestion(taskId) {
    const task = getTask(taskId);
    if (!task) return null;
    const history = getState().interactions.filter((row) =>
      row.taskId === taskId && task.questionKeys.includes(row.questionKey)
    );
    if (!history.length) return getInitialQuestion(taskId);
    const candidates = task.questionKeys.map((questionKey, order) => {
      const rows = history.filter((row) => row.questionKey === questionKey).slice(-5);
      const coverage = rows.length ? rows.reduce((sum, row) => sum + row.coverage, 0) / rows.length : 1;
      const latest = rows.slice(-3);
      const incomplete = latest.filter((row) => row.status !== "correct").length;
      const need = (1 - coverage) + incomplete * 0.3;
      return { questionKey, order, need, coverage, incomplete, observations: rows.length };
    });
    candidates.sort((a, b) => b.need - a.need || a.order - b.order);
    const chosen = candidates[0];
    const definition = QUESTIONS[chosen.questionKey];
    const reason = chosen.observations
      ? `${definition.hint} is prioritized: recent demo coverage is ${Math.round(chosen.coverage * 100)}%, with ${chosen.incomplete} incomplete/review result(s) in the last three.`
      : `No result exists yet for ${definition.hint.toLowerCase()}; the deterministic demo uses the caregiver-selected question.`;
    return questionFor(taskId, chosen.questionKey, reason);
  }

  function normalize(value) {
    return String(value || "").normalize("NFC").toLocaleLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
  }

  function wordPhraseMatch(answer, phrase) {
    const normalizedAnswer = ` ${normalize(answer)} `;
    const normalizedPhrase = normalize(phrase);
    return Boolean(normalizedPhrase) && normalizedAnswer.includes(` ${normalizedPhrase} `);
  }

  function evaluate(taskId, questionKey, answerText) {
    const task = getTask(taskId);
    if (!task || !task.questionKeys.includes(questionKey)) throw new Error("Choose an available sample task question.");
    const answer = normalize(answerText);
    const concepts = requiredConcepts(task, questionKey);
    const matches = [];
    const missing = [];
    for (let index = 0; index < concepts.length; index += 1) {
      const aliases = questionKey === "objects"
        ? ITEMS[task.itemKeys[index]].aliases
        : [concepts[index]];
      if (aliases.some((alias) => wordPhraseMatch(answer, alias))) matches.push(index);
      else missing.push(index);
    }
    const uncertain = /\b(?:maybe|perhaps|unsure|either|or|not|no|never|without|forget|forgot|might)\b/.test(answer);
    let status;
    let feedback;
    if (!answer) {
      status = "incorrect";
      feedback = "No answer was entered. You can try again with the sample question.";
    } else if (uncertain) {
      status = "review";
      feedback = "The answer sounds uncertain or gives alternatives. This demo asks for a clearer answer instead of marking it correct.";
    } else if (missing.length && matches.length) {
      status = "partial";
      feedback = `You recalled ${matches.length} of ${concepts.length} configured concept(s). Review the remaining item(s) together.`;
    } else if (missing.length) {
      status = "incorrect";
      feedback = "The configured sample answer was not matched. This is practice feedback, not a judgment.";
    } else {
      status = "correct";
      feedback = `All ${concepts.length} configured concept(s) matched in this demo.`;
    }
    return {
      status,
      coverage: concepts.length ? matches.length / concepts.length : 0,
      matchedCount: matches.length,
      requiredCount: concepts.length,
      feedback
    };
  }

  function submitAnswer(taskId, questionKey, answerText) {
    const evaluation = evaluate(taskId, questionKey, answerText);
    const state = getState();
    const id = `answer-demo-${String(state.nextStep).padStart(4, "0")}`;
    memoryState.interactions.push({
      id,
      taskId,
      questionKey,
      status: evaluation.status,
      coverage: evaluation.coverage,
      matchedCount: evaluation.matchedCount,
      requiredCount: evaluation.requiredCount,
      step: memoryState.nextStep,
      source: "visitor"
    });
    memoryState.nextStep += 1;
    if (memoryState.interactions.length > MAX_INTERACTIONS) memoryState.interactions.shift();
    save();
    return { ...evaluation, id, nextQuestion: getNextQuestion(taskId) };
  }

  function getInteractions() {
    return getState().interactions;
  }

  function getReminderEvents(taskId) {
    return getState().reminderEvents.filter((event) => !taskId || event.taskId === taskId);
  }

  function recordReminder(taskId, stage) {
    const state = getState();
    if (!getTask(taskId) || !isKey(stage, STAGE_LABELS)) throw new Error("Choose a valid sample reminder stage.");
    const id = `reminder-demo-${String(state.nextStep).padStart(4, "0")}`;
    memoryState.reminderEvents.push({
      id,
      taskId,
      stage,
      step: memoryState.nextStep,
      source: "visitor",
      status: "simulated"
    });
    memoryState.nextStep += 1;
    if (memoryState.reminderEvents.length > MAX_REMINDER_EVENTS) memoryState.reminderEvents.shift();
    save();
    return { id, stage, label: STAGE_LABELS[stage], status: "simulated" };
  }

  function getNextReminderStage(taskId) {
    const done = new Set(getReminderEvents(taskId).map((event) => event.stage));
    return REMINDER_STAGES.find((stage) => !done.has(stage.key)) || null;
  }

  function getStats() {
    const state = getState();
    const categories = {};
    for (const [key, definition] of Object.entries(QUESTIONS)) {
      const rows = state.interactions.filter((row) => {
        const task = state.tasks.find((candidate) => candidate.id === row.taskId);
        return task && task.questionKeys.includes(key) && row.questionKey === key;
      });
      categories[key] = {
        label: definition.hint,
        count: rows.length,
        complete: rows.filter((row) => row.status === "correct").length,
        coverage: rows.length ? rows.reduce((sum, row) => sum + row.coverage, 0) / rows.length : null
      };
    }
    return {
      total: state.interactions.length,
      complete: state.interactions.filter((row) => row.status === "correct").length,
      completePercent: state.interactions.length
        ? Math.round(state.interactions.filter((row) => row.status === "correct").length / state.interactions.length * 100)
        : 0,
      categories
    };
  }

  function getStorageStatus() {
    return storageAvailable;
  }

  function getLabels() {
    return {
      scenarios: Object.entries(SCENARIOS).map(([key, value]) => ({ key, label: value.title })),
      items: Object.entries(ITEMS).map(([key, value]) => ({ key, label: value.label })),
      slots: Object.entries(SLOTS).map(([key, value]) => ({ key, label: value.label })),
      questions: Object.entries(QUESTIONS).map(([key, value]) => ({ key, label: value.label, category: value.category })),
      reminderStages: REMINDER_STAGES.map((stage) => ({ ...stage })),
      stageLabels: { ...STAGE_LABELS }
    };
  }

  const api = Object.freeze({
    load, reset, subscribe, refreshFromStorage, getState, getTasks, getTask, selectTask, getTaskDetails,
    createTask, getInitialQuestion, getNextQuestion, evaluate, submitAnswer,
    getInteractions, getReminderEvents, recordReminder, getNextReminderStage,
    getStats, getStorageStatus, getLabels
  });
  root.MemoryLoopDemo = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
}(typeof globalThis !== "undefined" ? globalThis : window));
