(function () {
  // Study progress (localStorage)
  function getDoneSet() {
    try {
      return new Set(JSON.parse(localStorage.getItem("fyzika_done") || "[]"));
    } catch {
      return new Set();
    }
  }
  function saveDoneSet(set) {
    localStorage.setItem("fyzika_done", JSON.stringify([...set]));
  }

  function syncDoneUI() {
    const done = getDoneSet();
    document.querySelectorAll("[data-ch-nav]").forEach((el) => {
      el.classList.toggle("is-done", done.has(el.getAttribute("data-ch-nav")));
    });
    document.querySelectorAll("[data-ch-card]").forEach((el) => {
      el.classList.toggle("is-done", done.has(el.getAttribute("data-ch-card")));
    });
    const doneBtn = document.getElementById("doneToggleBtn");
    if (doneBtn) {
      const id = doneBtn.getAttribute("data-ch-id");
      const isDone = done.has(id);
      doneBtn.classList.toggle("is-done", isDone);
      doneBtn.textContent = isDone ? "✓ Prostudováno" : "○ Označit jako prostudované";
    }
    const progressText = document.getElementById("progressText");
    const progressFill = document.getElementById("progressFill");
    if (progressText && progressFill) {
      const total = document.querySelectorAll("[data-ch-card]").length;
      const count = done.size;
      progressText.textContent = `${count} / ${total} kapitol prostudováno`;
      progressFill.style.width = total ? `${Math.round((count / total) * 100)}%` : "0%";
    }
  }

  syncDoneUI();
  const doneBtn = document.getElementById("doneToggleBtn");
  if (doneBtn) {
    doneBtn.addEventListener("click", () => {
      const id = doneBtn.getAttribute("data-ch-id");
      const done = getDoneSet();
      if (done.has(id)) done.delete(id);
      else done.add(id);
      saveDoneSet(done);
      syncDoneUI();
    });
  }

  // Reading progress bar
  const readBar = document.getElementById("readProgress");
  if (readBar) {
    window.addEventListener("scroll", () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      readBar.style.width = max > 0 ? `${Math.min(100, (window.scrollY / max) * 100)}%` : "0%";
    }, { passive: true });
  }

  // Topic search & year filter on index.html
  const searchInput = document.getElementById("topicSearch");
  const filterBtns = document.querySelectorAll("[data-year-filter]");
  let activeYear = "all";

  function applyIndexFilters() {
    const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
    document.querySelectorAll(".topic-group").forEach((group) => {
      const groupYear = group.getAttribute("data-year") || "all";
      const yearMatch = activeYear === "all" || groupYear === activeYear;
      let visible = 0;
      group.querySelectorAll(".bento-card").forEach((card) => {
        const textMatch = !q || card.textContent.toLowerCase().includes(q);
        const show = yearMatch && textMatch;
        card.style.display = show ? "" : "none";
        if (show) visible++;
      });
      group.style.display = visible > 0 ? "" : "none";
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyIndexFilters);
  }
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeYear = btn.getAttribute("data-year-filter");
      filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
      applyIndexFilters();
    });
  });

  // Solved examples toggle & filter
  document.querySelectorAll(".toggle-solution-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sol = btn.nextElementSibling;
      if (!sol) return;
      const hidden = sol.classList.toggle("hidden");
      btn.textContent = hidden ? "Zobrazit řešení krok za krokem" : "Skrýt řešení";
    });
  });

  const showAllBtn = document.getElementById("toggleAllSolutions") || document.getElementById("showAllSolutionsBtn");
  if (showAllBtn) {
    let allShown = showAllBtn.textContent.includes("Skrýt");
    showAllBtn.addEventListener("click", () => {
      allShown = !allShown;
      document.querySelectorAll(".example-solution").forEach((sol) => {
        sol.classList.toggle("hidden", !allShown);
      });
      document.querySelectorAll(".toggle-solution-btn").forEach((btn) => {
        btn.textContent = allShown ? "Skrýt řešení" : "Zobrazit řešení krok za krokem";
      });
      showAllBtn.textContent = allShown ? "Skrýt všechna řešení" : "Zobrazit všechna řešení";
    });
  }

  const exFilterBtns = document.querySelectorAll(".filter-btn[data-filter]");
  exFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.getAttribute("data-filter");
      exFilterBtns.forEach((b) => b.classList.toggle("active", b === btn));
      document.querySelectorAll(".example-card").forEach((card) => {
        card.style.display = (cat === "all" || card.getAttribute("data-category") === cat) ? "" : "none";
      });
    });
  });
})();
