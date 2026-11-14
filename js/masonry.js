/**
 * Panoramix – masonry layout for the full menu (carte.html).
 * Each card spans as many 4px grid rows as its height needs, so cards of
 * different heights pack together while keeping their reading order.
 */
(function () {
  "use strict";

  const grid = document.querySelector(".menu__grid--full");
  if (!grid) return;

  const cards = Array.from(grid.children);

  function layout() {
    const style = getComputedStyle(grid);
    const singleColumn = style.gridTemplateColumns.split(" ").length < 2;

    // On one column the plain grid is already gap-free.
    grid.classList.toggle("is-masonry", !singleColumn);
    if (singleColumn) {
      cards.forEach((card) => { card.style.gridRowEnd = ""; });
      return;
    }

    const rowHeight = parseFloat(style.gridAutoRows);
    cards.forEach((card) => {
      const gap = parseFloat(getComputedStyle(card).marginBottom);
      const span = Math.ceil((card.getBoundingClientRect().height + gap) / rowHeight);
      card.style.gridRowEnd = "span " + span;
    });
  }

  // Card heights change with the viewport width and once web fonts load.
  const observer = new ResizeObserver(() => window.requestAnimationFrame(layout));
  cards.forEach((card) => observer.observe(card));
  if (document.fonts) document.fonts.ready.then(layout);
  layout();
})();
