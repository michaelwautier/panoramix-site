/**
 * Panoramix – opening status and today's highlight.
 * Times are computed in La Réunion's time zone, whatever the visitor's device.
 */
(function () {
  "use strict";

  const TIME_ZONE = "Indian/Reunion";

  // Day index follows Date#getDay(): 0 = Sunday … 6 = Saturday.
  // Each slot is [openHour, closeHour] in 24h format.
  const OPENING_HOURS = {
    0: [[11, 14], [17, 22]],
    1: [],
    2: [],
    3: [[17, 22]],
    4: [[17, 22]],
    5: [[11, 14], [17, 22]],
    6: [[11, 14], [17, 22]],
  };

  const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function getLocalTime(date) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: TIME_ZONE,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(date);

    const pick = (type) => (parts.find((part) => part.type === type) || {}).value;
    return {
      day: WEEKDAY_INDEX[pick("weekday")],
      minutes: parseInt(pick("hour"), 10) * 60 + parseInt(pick("minute"), 10),
    };
  }

  // Show "opening soon" this many minutes before a service starts.
  const SOON_THRESHOLD_MINUTES = 60;

  function formatHour(hour) {
    return `${hour}h`;
  }

  /**
   * Returns { state: "open" | "soon" | "closed", label }.
   */
  function getStatus(day, minutes) {
    const slots = OPENING_HOURS[day] || [];

    if (slots.some(([open, close]) => minutes >= open * 60 && minutes < close * 60)) {
      return { state: "open", label: "Ouvert en ce moment" };
    }

    const nextSlot = slots.find(([open]) => {
      const minutesBefore = open * 60 - minutes;
      return minutesBefore > 0 && minutesBefore <= SOON_THRESHOLD_MINUTES;
    });
    if (nextSlot) {
      return { state: "soon", label: `Ouvre bientôt · ${formatHour(nextSlot[0])}` };
    }

    return { state: "closed", label: "Fermé en ce moment" };
  }

  function render() {
    let now;
    try {
      now = getLocalTime(new Date());
    } catch (error) {
      return; // Very old browser without time zone support: keep the static fallback.
    }

    const { state, label } = getStatus(now.day, now.minutes);
    const stateClass = `is-${state}`;
    const stateClasses = ["is-open", "is-soon", "is-closed"];

    document.querySelectorAll("[data-open-status]").forEach((element) => {
      element.classList.remove(...stateClasses);
      element.classList.add(stateClass);
      const text = element.querySelector(".status__label");
      if (text) text.textContent = label;
    });

    document.querySelectorAll("[data-open-badge]").forEach((element) => {
      element.classList.remove(...stateClasses);
      element.classList.add(stateClass);
      element.textContent = label;
    });

    document.querySelectorAll(".hours__list li").forEach((row) => {
      row.classList.toggle("is-today", Number(row.dataset.day) === now.day);
    });
  }

  render();
  // Refresh every minute so an open tab stays accurate.
  setInterval(render, 60 * 1000);
})();
