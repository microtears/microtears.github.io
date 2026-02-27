const DEFAULT_LABELS = {
  together_since: "Together Since",
  days_unit: "Days",
  hours_unit: "Hours",
  minutes_unit: "Minutes",
  days_left_unit: "Days Left",
  memories_title: "Our Memories",
  memories_action: "See All",
  timeline_title: "Timeline",
};

const errorEl = document.getElementById("sweet-error");

const setText = (id, value) => {
  const el = document.getElementById(id);
  if (!el || value === undefined || value === null) {
    return;
  }
  el.textContent = value;
};

const setBackgroundImage = (id, url, alt) => {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }
  if (url) {
    el.style.backgroundImage = `url('${url}')`;
  }
  if (alt) {
    el.dataset.alt = alt;
  }
};

const parseLocalDate = (value) => {
  if (!value) {
    return null;
  }
  const normalized = value.includes("T") ? value : `${value}T00:00:00`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};

const formatNumber = (value) => {
  if (!Number.isFinite(value)) {
    return "--";
  }
  return value.toLocaleString("en-US");
};

const setSectionVisible = (id, isVisible) => {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }
  if (isVisible) {
    el.classList.remove("hidden");
  } else {
    el.classList.add("hidden");
  }
};

const renderMemories = (memories) => {
  const list = document.getElementById("memories-list");
  if (!list) {
    return;
  }
  list.innerHTML = "";

  (memories || []).forEach((item) => {
    const card = document.createElement("div");
    card.className = "snap-center shrink-0 w-36 flex flex-col gap-2";

    const frame = document.createElement("div");
    frame.className = "w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg relative group";

    const overlay = document.createElement("div");
    overlay.className = "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 z-10";

    const image = document.createElement("div");
    image.className = "w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110";
    if (item?.image_url) {
      image.style.backgroundImage = `url('${item.image_url}')`;
    }
    image.dataset.alt = item?.alt || item?.title || "";

    const favorite = document.createElement("span");
    favorite.className = "material-symbols-outlined absolute top-2 right-2 text-white z-20 text-sm drop-shadow-md";
    favorite.textContent = item?.is_favorite ? "favorite" : "favorite_border";

    frame.append(overlay, image, favorite);

    const title = document.createElement("p");
    title.className = "text-center text-sm font-medium text-slate-700 dark:text-slate-200";
    title.textContent = item?.title || "";

    card.append(frame, title);
    list.append(card);
  });
};

const renderTimeline = (timeline) => {
  const list = document.getElementById("timeline-list");
  if (!list) {
    return;
  }
  list.innerHTML = "";

  (timeline || []).forEach((item) => {
    const row = document.createElement("div");
    row.className = "flex items-center gap-4 p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm";

    const iconWrap = document.createElement("div");
    const iconBg = item?.icon_bg_class || "bg-primary/20";
    const iconText = item?.icon_text_class || "text-primary";
    iconWrap.className = `flex items-center justify-center w-10 h-10 rounded-full ${iconBg} ${iconText} shrink-0`;

    const icon = document.createElement("span");
    icon.className = "material-symbols-outlined text-xl";
    icon.textContent = item?.icon || "favorite";
    iconWrap.append(icon);

    const content = document.createElement("div");
    content.className = "flex-1";

    const title = document.createElement("h4");
    title.className = "text-sm font-bold text-slate-800 dark:text-white";
    title.textContent = item?.title || "";

    const date = document.createElement("p");
    date.className = "text-xs text-slate-500 dark:text-slate-400";
    date.textContent = item?.date || "";

    content.append(title, date);

    if (item?.description) {
      const desc = document.createElement("p");
      desc.className = "text-xs text-slate-500 dark:text-slate-400 mt-1";
      desc.textContent = item.description;
      content.append(desc);
    }

    row.append(iconWrap, content);

    if (item?.image_url) {
      const image = document.createElement("div");
      image.className = "w-16 h-12 rounded-lg bg-cover bg-center";
      image.style.backgroundImage = `url('${item.image_url}')`;
      if (item?.alt) {
        image.dataset.alt = item.alt;
      }
      if (item?.location) {
        image.dataset.location = item.location;
      }
      row.append(image);
    }

    list.append(row);
  });
};

const renderPage = (data) => {
  if (!data) {
    return;
  }

  const labels = { ...DEFAULT_LABELS, ...(data.labels || {}) };

  if (data.page_title) {
    document.title = data.page_title;
  }

  setText("header-title", data.header_title);
  setText("memories-title", labels.memories_title);
  setText("memories-action", labels.memories_action);
  setText("timeline-title", labels.timeline_title);
  setText("days-unit", labels.days_unit);
  setText("next-anniversary-label", data.next_anniversary?.label || "");
  setText("next-anniversary-title", data.next_anniversary?.title || "");
  setText("next-anniversary-unit", labels.days_left_unit);

  if (!labels.memories_action) {
    const action = document.getElementById("memories-action");
    if (action) {
      action.classList.add("hidden");
    }
  }

  const togetherSinceDisplay = data.together_since_display || data.together_since || "";
  if (togetherSinceDisplay) {
    setText("together-since", `${labels.together_since} ${togetherSinceDisplay}`.trim());
  }

  setBackgroundImage("partner-one", data.partner_one_img, data.partner_one_alt);
  setBackgroundImage("partner-two", data.partner_two_img, data.partner_two_alt);

  const sinceDate = parseLocalDate(data.together_since);
  if (sinceDate) {
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - sinceDate.getTime());
    const minutesTotal = Math.floor(diffMs / 60000);
    const hoursTotal = Math.floor(diffMs / 3600000);
    const daysTotal = Math.floor(diffMs / 86400000);

    setText("days-count", formatNumber(daysTotal));
    const detail = `${formatNumber(hoursTotal)} ${labels.hours_unit} • ${formatNumber(minutesTotal)} ${labels.minutes_unit}`;
    setText("detail-stats", detail);
  }

  const targetDate = parseLocalDate(data.next_anniversary?.target_date);
  if (targetDate) {
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(diffMs / 86400000));
    setText("next-anniversary-days", formatNumber(daysLeft));
  }

  const memories = Array.isArray(data.memories) ? data.memories : [];
  const timeline = Array.isArray(data.timeline) ? data.timeline : [];

  renderMemories(memories);
  renderTimeline(timeline);
  setSectionVisible("memories-section", memories.length > 0);
  setSectionVisible("timeline-section", timeline.length > 0);
};

fetch("./data.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load data");
    }
    return response.json();
  })
  .then((data) => {
    renderPage(data);
  })
  .catch(() => {
    if (errorEl) {
      errorEl.textContent = "Failed to load data. Please refresh.";
      errorEl.classList.remove("hidden");
    }
  });
