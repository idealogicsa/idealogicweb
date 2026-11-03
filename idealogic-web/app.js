/**
 * ============================================================================
 * IDEALOGIC — MOTOR INTERACTIVO & LIQUID GLASS (VERSIÓN PRODUCCIÓN PÚBLICA)
 * ============================================================================
 */

(function () {
  "use strict";

  const CONFIG = window.IDEALOGIC_CONFIG;

  // Utilidad para mostrar notificaciones Toast Liquid Glass
  function showToast(message) {
    const toast = document.getElementById("liquid-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3400);
  }

  /* ==========================================================================
     1. CANVAS INTERACTIVO DE CIRCUITOS LÓGICOS Y PULSOS DE DATOS
     ========================================================================== */
  const canvas = document.getElementById("circuit-canvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  let width = window.innerWidth || 1280;
  let height = window.innerHeight || 800;
  let mouse = { x: width * 0.5, y: height * 0.35, active: false };
  let turboBoost = 1;

  const nodes = [];
  const packets = [];

  function initCircuitNetwork() {
    if (!canvas || !ctx) return;
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    nodes.length = 0;
    packets.length = 0;

    const cols = Math.max(6, Math.floor(width / 150));
    const rows = Math.max(5, Math.floor(height / 140));
    const cellW = width / cols;
    const cellH = height / rows;

    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const jitterX = Math.sin(r * 3.1 + c * 1.7) * cellW * 0.22;
        const jitterY = Math.cos(c * 2.3 + r * 1.9) * cellH * 0.22;
        nodes.push({
          id: r * (cols + 1) + c,
          x: c * cellW + jitterX,
          y: r * cellH + jitterY,
          col: c,
          row: r,
          neighbors: [],
          isEmerald: (r + c) % 5 === 0
        });
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < Math.max(cellW, cellH) * 1.32 && a.neighbors.length < 3) {
          a.neighbors.push(b);
          b.neighbors.push(a);
        }
      }
    }

    for (let k = 0; k < 26; k++) {
      spawnDataPacket();
    }
  }

  function spawnDataPacket(originNode) {
    if (!nodes.length) return;
    const start = originNode || nodes[Math.floor(Math.random() * nodes.length)];
    if (!start || !start.neighbors.length) return;
    const target = start.neighbors[Math.floor(Math.random() * start.neighbors.length)];
    packets.push({
      from: start,
      to: target,
      progress: 0,
      speed: 0.008 + Math.random() * 0.014,
      color: Math.random() > 0.32 ? "#207ba2" : "#11b07b",
      size: 2 + Math.random() * 1.8
    });
  }

  function renderCircuitCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    const grad = ctx.createRadialGradient(mouse.x, mouse.y, 10, mouse.x, mouse.y, 320);
    grad.addColorStop(0, "rgba(32, 123, 162, 0.12)");
    grad.addColorStop(0.5, "rgba(17, 176, 123, 0.04)");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const distMouse = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      const proximityAlpha = distMouse < 260 ? (1 - distMouse / 260) * 0.28 : 0.045;

      for (let n = 0; n < a.neighbors.length; n++) {
        const b = a.neighbors[n];
        if (b.id < a.id) continue;
        ctx.strokeStyle = a.isEmerald
          ? `rgba(17, 176, 123, ${proximityAlpha})`
          : `rgba(32, 123, 162, ${proximityAlpha})`;

        const midX = (a.x + b.x) * 0.5;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(midX, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(a.x, a.y, distMouse < 180 ? 2.6 : 1.5, 0, Math.PI * 2);
      ctx.fillStyle = a.isEmerald
        ? `rgba(17, 176, 123, ${proximityAlpha * 2.2})`
        : `rgba(32, 123, 162, ${proximityAlpha * 2.2})`;
      ctx.fill();
    }

    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.progress += p.speed * turboBoost;

      const midX = (p.from.x + p.to.x) * 0.5;
      let px, py;
      if (p.progress < 0.5) {
        const t = p.progress * 2;
        px = p.from.x + (midX - p.from.x) * t;
        py = p.from.y;
      } else {
        const t = (p.progress - 0.5) * 2;
        px = midX + (p.to.x - midX) * t;
        py = p.from.y + (p.to.y - p.from.y) * t;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();

      if (p.progress >= 1) {
        const nextOrigin = p.to;
        packets.splice(i, 1);
        if (packets.length < 34) {
          spawnDataPacket(nextOrigin);
        }
      }
    }

    if (turboBoost > 1) {
      turboBoost = Math.max(1, turboBoost * 0.97);
    }

    requestAnimationFrame(renderCircuitCanvas);
  }

  window.addEventListener("resize", initCircuitNetwork);
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  initCircuitNetwork();
  renderCircuitCanvas();

  /* ==========================================================================
     2. SEGUIMIENTO DE REFRACCIÓN LIQUID GLASS EN TARJETAS Y TILT 3D
     ========================================================================== */
  function attachLiquidGlassTracking() {
    const cards = document.querySelectorAll(".liquid-glass");
    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mx", `${x}px`);
        card.style.setProperty("--my", `${y}px`);
      });
    });

    const holoCard = document.getElementById("holo-tilt-card");
    if (holoCard) {
      holoCard.addEventListener("mousemove", (e) => {
        const rect = holoCard.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        holoCard.style.transform = `rotateY(${relX * 7}deg) rotateX(${-relY * 7}deg)`;
      });
      holoCard.addEventListener("mouseleave", () => {
        holoCard.style.transform = "rotateY(0deg) rotateX(0deg)";
      });
    }
  }
  attachLiquidGlassTracking();

  /* ==========================================================================
     3. HERO HOLO-STAGE: CLUSTER 3D INTERACTIVO + VIDEO OFICIAL + PÓSTER
     ========================================================================== */
  const hudTabs = document.querySelectorAll(".hud-tab-btn");
  const viewCluster = document.getElementById("view-cluster");
  const viewVideo = document.getElementById("view-video");
  const viewPoster = document.getElementById("view-poster");
  const heroVideo = document.getElementById("hero-official-video");
  const holoNodeDesc = document.getElementById("holo-node-desc");
  const btnPulseBoost = document.getElementById("btn-pulse-boost");

  hudTabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      hudTabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const mode = btn.getAttribute("data-view");

      viewCluster.classList.toggle("hidden", mode !== "cluster");
      viewVideo.classList.toggle("active", mode === "video");
      viewPoster.classList.toggle("active", mode === "poster");

      if (mode === "video" && heroVideo) {
        heroVideo.play().catch(() => {});
        holoNodeDesc.textContent = "🎬 Reproduciendo spot oficial de idealogic (Sistemas & Bases de Datos).";
      } else {
        if (heroVideo) heroVideo.pause();
        if (mode === "poster") {
          holoNodeDesc.textContent = "💠 Afiche Oficial Idealogic — 3ro 'A' BTI 2026 (C.R.E.S.R. San Lorenzo).";
        } else {
          holoNodeDesc.textContent = "💡 Hacé clic en cualquier servidor/base de datos o ejecutá un pulso lógico.";
        }
      }
    });
  });

  document.querySelectorAll(".db-node-group").forEach((node) => {
    node.addEventListener("click", () => {
      const info = node.getAttribute("data-node-info");
      if (holoNodeDesc && info) {
        holoNodeDesc.innerHTML = `<strong style="color:var(--brand-emerald);">● NODO ACTIVO:</strong> ${info}`;
      }
      triggerClusterPulse();
    });
  });

  function triggerClusterPulse() {
    turboBoost = 4.2;
    for (let i = 0; i < 12; i++) spawnDataPacket();

    if (viewCluster) {
      viewCluster.classList.add("cluster-turbo");
      const lat = document.getElementById("telemetry-latency");
      const thr = document.getElementById("telemetry-throughput");
      if (lat) lat.textContent = (1.1 + Math.random() * 0.8).toFixed(1) + " ms";
      if (thr) thr.textContent = "100% TURBO";

      setTimeout(() => {
        viewCluster.classList.remove("cluster-turbo");
      }, 1800);
    }
  }

  if (btnPulseBoost) {
    btnPulseBoost.addEventListener("click", () => {
      triggerClusterPulse();
      showToast("⚡ Pulso lógico ejecutado: Bases de datos optimizadas al 100%");
    });
  }

  /* ==========================================================================
     4. CALCULADORA INTERACTIVA DE IMPACTO & ROI (MARKETING)
     ========================================================================== */
  const opsRange = document.getElementById("ops-range");
  const opsValDisplay = document.getElementById("ops-value-display");
  const roiHours = document.getElementById("roi-hours-saved");
  const roiErrors = document.getElementById("roi-errors-cut");
  const roiSpeed = document.getElementById("roi-speed-boost");

  if (opsRange) {
    opsRange.addEventListener("input", () => {
      const ops = parseInt(opsRange.value, 10);
      if (opsValDisplay) opsValDisplay.textContent = `${ops} / día`;

      const hoursSaved = Math.round(ops * 0.35);
      const speedMul = Math.min(45, Math.max(12, Math.round(ops / 5)));

      if (roiHours) roiHours.textContent = `${hoursSaved} hs`;
      if (roiErrors) roiErrors.textContent = "-98.8%";
      if (roiSpeed) roiSpeed.textContent = `${speedMul}x`;
    });
  }

  /* ==========================================================================
     5. LABORATORIO INTERACTIVO DE ARQUITECTURA DE BASES DE DATOS (SANDBOX)
     ========================================================================== */
  let currentScenarioKey = "comercio";
  const scenarioBtns = document.querySelectorAll(".scenario-btn");
  const erTablesGrid = document.getElementById("er-tables-grid");
  const scenarioBadge = document.getElementById("scenario-badge");
  const scenarioTitle = document.getElementById("scenario-title");
  const scenarioDesc = document.getElementById("scenario-desc");
  const sqlCodePreview = document.getElementById("sql-code-preview");
  const benchBefore = document.getElementById("bench-before");
  const benchAfter = document.getElementById("bench-after");
  const benchIntegrity = document.getElementById("bench-integrity");
  const erSelectionStatus = document.getElementById("er-selection-status");

  function renderDatabaseScenario(key) {
    const data = CONFIG.databaseScenarios[key];
    if (!data) return;
    currentScenarioKey = key;

    if (scenarioBadge) scenarioBadge.textContent = data.badge;
    if (scenarioTitle) scenarioTitle.textContent = data.title;
    if (scenarioDesc) scenarioDesc.textContent = data.description;
    if (sqlCodePreview) sqlCodePreview.textContent = data.sqlPreview;
    if (benchBefore) benchBefore.textContent = data.latencyBefore;
    if (benchAfter) benchAfter.textContent = data.latencyAfter;
    if (benchIntegrity) benchIntegrity.textContent = `${data.integrity} VERIFIED`;

    if (erTablesGrid) {
      erTablesGrid.innerHTML = "";
      data.tables.forEach((tbl, idx) => {
        const card = document.createElement("div");
        card.className = "er-table-node" + (idx === 0 ? " highlighted" : "");
        card.innerHTML = `
          <div class="er-table-head">
            <span style="color:${tbl.color};">🗄️ ${tbl.name}</span>
            <span style="font-size:0.66rem; color:var(--text-secondary);">${tbl.records}</span>
          </div>
          <ul class="er-table-fields">
            ${tbl.fields
              .map(
                (f) => `
              <li>
                <span>${f.key ? `<span class="pk-badge">${f.key}</span>` : ""}${f.name}</span>
                <span style="color:var(--text-muted);">${f.type}</span>
              </li>
            `
              )
              .join("")}
          </ul>
        `;
        card.addEventListener("click", () => {
          document.querySelectorAll(".er-table-node").forEach((el) => el.classList.remove("highlighted"));
          card.classList.add("highlighted");
          if (erSelectionStatus) {
            erSelectionStatus.innerHTML = `🔍 Inspeccionando tabla <strong>${tbl.name}</strong> (${tbl.type} • ${tbl.records}) — Índices activos.`;
          }
          triggerClusterPulse();
        });
        erTablesGrid.appendChild(card);
      });
    }
  }

  scenarioBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      scenarioBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const key = btn.getAttribute("data-scenario");
      renderDatabaseScenario(key);
    });
  });

  renderDatabaseScenario("comercio");

  const btnRunQuery = document.getElementById("btn-run-query");
  const sqlExecBadge = document.getElementById("sql-exec-badge");
  const benchBarFill = document.getElementById("bench-bar-fill");

  if (btnRunQuery) {
    btnRunQuery.addEventListener("click", () => {
      if (sqlExecBadge) {
        sqlExecBadge.textContent = "EXECUTING QUERY...";
        sqlExecBadge.style.color = "#38bdf8";
      }
      if (benchBarFill) benchBarFill.style.width = "18%";

      setTimeout(() => {
        const scenario = CONFIG.databaseScenarios[currentScenarioKey];
        const randomFast = (1.4 + Math.random() * 1.2).toFixed(1) + " ms";
        if (benchAfter) benchAfter.textContent = randomFast;
        if (benchBarFill) benchBarFill.style.width = "98%";
        if (sqlExecBadge) {
          sqlExecBadge.textContent = `OK • ${randomFast} (OPTIMIZADO)`;
          sqlExecBadge.style.color = "var(--brand-emerald)";
        }
        triggerClusterPulse();
        showToast(`⚡ Consulta ejecutada en ${randomFast} sobre el modelo ${scenario.badge}`);
      }, 320);
    });
  }

  const btnTestBackup = document.getElementById("btn-test-backup");
  if (btnTestBackup) {
    btnTestBackup.addEventListener("click", () => {
      if (benchIntegrity) benchIntegrity.textContent = "SNAPSHOT AES-256 OK ✓";
      showToast("🛡️ Backup encriptado verificado: Integridad del 100% garantizada.");
    });
  }

  /* ==========================================================================
     6. CONFIGURADOR / COTIZADOR DE PROYECTOS A MEDIDA + ENVÍO A INSTAGRAM DM
     ========================================================================== */
  const cfgSummaryList = document.getElementById("cfg-summary-list");
  const cfgCustomNote = document.getElementById("cfg-custom-note");

  function updateConfiguratorSummary() {
    if (!cfgSummaryList) return;
    const selectedChips = document.querySelectorAll("#cotizador .config-chip.selected");
    cfgSummaryList.innerHTML = "";

    selectedChips.forEach((chip) => {
      const val = chip.getAttribute("data-val");
      const li = document.createElement("li");
      li.innerHTML = `<span style="color:var(--brand-emerald);">✔</span> <span>${val}</span>`;
      cfgSummaryList.appendChild(li);
    });

    if (cfgCustomNote && cfgCustomNote.value.trim()) {
      const li = document.createElement("li");
      li.innerHTML = `<span style="color:var(--brand-cyan);">💡</span> <span><strong>Mi Idea:</strong> ${cfgCustomNote.value.trim()}</span>`;
      cfgSummaryList.appendChild(li);
    }
  }

  document.querySelectorAll("#cotizador .config-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      chip.classList.toggle("selected");
      if (document.querySelectorAll("#cotizador .config-chip.selected").length === 0) {
        chip.classList.add("selected");
      }
      updateConfiguratorSummary();
    });
  });

  if (cfgCustomNote) {
    cfgCustomNote.addEventListener("input", updateConfiguratorSummary);
  }

  document.querySelectorAll("[data-select-service]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetService = btn.getAttribute("data-select-service");
      const serviceChips = document.querySelectorAll("#cfg-group-service .config-chip");
      serviceChips.forEach((ch) => {
        if (ch.getAttribute("data-val") === targetService) {
          ch.classList.add("selected");
        }
      });
      updateConfiguratorSummary();
    });
  });

  function buildProposalMessage() {
    const selected = Array.from(document.querySelectorAll("#cotizador .config-chip.selected")).map((c) =>
      c.getAttribute("data-val")
    );
    const note = cfgCustomNote && cfgCustomNote.value.trim() ? `\n💡 Detalle de mi idea: ${cfgCustomNote.value.trim()}` : "";
    return (
      `¡Hola equipo de idealogic! 👋 Estuve en su página web e hice mi configuración a medida:\n\n` +
      `✅ Soluciones que me interesan:\n- ${selected.join("\n- ")}${note}\n\n` +
      `Me gustaría recibir asesoramiento para impulsar mi negocio.`
    );
  }

  const btnSendProposal = document.getElementById("btn-send-proposal");
  const btnCopyProposal = document.getElementById("btn-copy-proposal");

  if (btnSendProposal) {
    btnSendProposal.addEventListener("click", () => {
      const text = buildProposalMessage();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(() => {});
      }

      if (CONFIG.brand.whatsappNumber && CONFIG.brand.whatsappNumber.replace(/\D/g, "").length >= 8) {
        const cleanWp = CONFIG.brand.whatsappNumber.replace(/\D/g, "");
        const wpUrl = `https://wa.me/${cleanWp}?text=${encodeURIComponent(text)}`;
        window.open(wpUrl, "_blank", "noopener");
      } else {
        showToast("📋 ¡Tu propuesta se copió! Pegala en el DM de Instagram @idealogicsa");
        setTimeout(() => {
          window.open(CONFIG.brand.instagramUrl, "_blank", "noopener");
        }, 900);
      }
    });
  }

  if (btnCopyProposal) {
    btnCopyProposal.addEventListener("click", () => {
      const text = buildProposalMessage();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
      }
      showToast("📋 Resumen copiado al portapapeles listo para enviar a @idealogicsa");
    });
  }

  updateConfiguratorSummary();

  /* ==========================================================================
     7. FAQ ACORDEÓN, ESCÁNER DE SALUD DIGITAL, PROCESO & MENÚ MÓVIL
     ========================================================================== */
  document.querySelectorAll(".faq-item").forEach((item) => {
    item.addEventListener("click", () => {
      item.classList.toggle("open");
    });
  });

  const symptomCards = document.querySelectorAll(".symptom-toggle-card");
  const healthRing = document.getElementById("health-ring-circle");
  const healthNum = document.getElementById("health-score-num");
  const healthStatus = document.getElementById("health-score-status");
  const healthFix = document.getElementById("health-fix-recommendation");

  function updateDiagnosticScanner() {
    if (!healthRing || !healthNum) return;
    let totalPenalty = 0;
    const fixes = [];

    symptomCards.forEach((card) => {
      if (card.classList.contains("active")) {
        totalPenalty += parseInt(card.getAttribute("data-penalty") || "15", 10);
        const fixText = card.getAttribute("data-fix");
        if (fixText) fixes.push(fixText);
      }
    });

    const score = Math.max(12, 100 - totalPenalty);
    const circumference = 440;
    const offset = circumference - (score / 100) * circumference;
    healthRing.style.strokeDashoffset = `${offset}`;
    healthNum.textContent = `${score}%`;

    if (score >= 85) {
      healthRing.style.stroke = "var(--brand-emerald)";
      healthStatus.textContent = "ÓPTIMO";
      healthStatus.style.color = "var(--brand-emerald)";
    } else if (score >= 55) {
      healthRing.style.stroke = "#38bdf8";
      healthStatus.textContent = "MEJORABLE";
      healthStatus.style.color = "#38bdf8";
    } else {
      healthRing.style.stroke = "#fb7185";
      healthStatus.textContent = "RIESGO ALTO";
      healthStatus.style.color = "#fb7185";
    }

    if (healthFix) {
      healthFix.textContent = fixes.length
        ? fixes.slice(0, 2).join(" + ")
        : "¡Excelente! Con el mantenimiento preventivo de Idealogic mantenés tu sistema al 100%.";
    }
  }

  symptomCards.forEach((card) => {
    card.addEventListener("click", () => {
      card.classList.toggle("active");
      updateDiagnosticScanner();
    });
  });
  updateDiagnosticScanner();

  const processSteps = document.querySelectorAll(".process-step-card");
  processSteps.forEach((step) => {
    step.addEventListener("click", () => {
      processSteps.forEach((s) => s.classList.remove("active-step"));
      step.classList.add("active-step");
      triggerClusterPulse();
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
        }
      });
    },
    { threshold: 0.1 }
  );

  document
    .querySelectorAll(
      "section .section-header, .pillar-card, .comparison-wrapper, .db-sandbox-shell, .config-steps-card, .showcase-media-card, .faq-item"
    )
    .forEach((el) => {
      el.classList.add("reveal-item");
      revealObserver.observe(el);
    });

  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const navLinks = document.getElementById("nav-links");
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("mobile-open");
    });
  }
})();
