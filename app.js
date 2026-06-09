document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // [설정] 클라이언트 사이드 비밀번호 게이트
  // *주의: 이 게이트는 클라이언트 사이드에서 작동하므로 완전한 보안이 아니며,
  // 외부인의 단순 접근을 차단하기 위한 용도입니다. 비밀번호는 평문으로 저장됩니다.
  // ==========================================
  const GATE_CONFIG = {
    PASSWORD: "4342",
    SESSION_KEY: "spoany_proposal_auth"
  };

  function initPasswordGate() {
    const savedAuth = sessionStorage.getItem(GATE_CONFIG.SESSION_KEY);
    const gateEl = document.getElementById('password-gate');
    const passwordInput = document.getElementById('gate-password-input');
    const errorMsg = document.getElementById('gate-error-msg');
    
    if (savedAuth === 'true') {
      document.body.classList.add('authorized');
      if (gateEl) gateEl.remove();
      return;
    }
    
    document.body.classList.remove('authorized');
    
    if (passwordInput) {
      // Focus the input window
      setTimeout(() => passwordInput.focus(), 100);
      
      passwordInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val.length === 4) {
          verifyPassword(val);
        }
      });
      
      passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          verifyPassword(passwordInput.value);
        }
      });
    }
    
    function verifyPassword(inputVal) {
      if (inputVal === GATE_CONFIG.PASSWORD) {
        sessionStorage.setItem(GATE_CONFIG.SESSION_KEY, 'true');
        document.body.classList.add('authorized');
        
        if (gateEl) {
          gateEl.style.opacity = '0';
          gateEl.style.transition = 'opacity 0.3s ease';
          setTimeout(() => gateEl.remove(), 300);
        }
        
        // Vercel Analytics Custom Event Tracking
        trackUnlockEvent();
      } else {
        if (passwordInput) {
          passwordInput.value = '';
          passwordInput.classList.add('shake');
          setTimeout(() => passwordInput.classList.remove('shake'), 400);
          passwordInput.focus();
        }
        if (errorMsg) {
          errorMsg.textContent = '비밀번호가 올바르지 않습니다. 다시 입력해주세요.';
          errorMsg.style.display = 'block';
        }
      }
    }
  }

  function trackUnlockEvent() {
    try {
      window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      const eventData = utmSource ? { source: utmSource } : undefined;
      
      window.va('event', { name: 'proposal_unlocked', data: eventData });
      console.log('[Vercel Web Analytics] event proposal_unlocked tracked.', eventData);
    } catch (err) {
      console.error('[Vercel Web Analytics] Failed to track event:', err);
    }
  }

  // Initialize Password Gate
  initPasswordGate();

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  let currentSlide = 1;
  const totalSlides = 7;
  let activeMode = 'pitch'; // 'pitch' or 'dashboard'
  
  // Slide 4: Treadmill state (8 items)
  const treadmillState = [
    { id: 1, name: '트레드밀 1', occupied: true },
    { id: 2, name: '트레드밀 2', occupied: false },
    { id: 3, name: '트레드밀 3', occupied: true },
    { id: 4, name: '트레드밀 4', occupied: false },
    { id: 5, name: '트레드밀 5', occupied: false },
    { id: 6, name: '트레드밀 6', occupied: true },
    { id: 7, name: '트레드밀 7', occupied: false },
    { id: 8, name: '트레드밀 8', occupied: true }
  ];

  // Slide 5: Heatmap variables
  const slideHeatmapCanvas = document.getElementById('slide-heatmap-canvas');
  const slideCtx = slideHeatmapCanvas.getContext('2d');
  let isDrawingHeatmap = false;
  const gridRows = 6;
  const gridCols = 10;
  const gridCells = Array(gridRows).fill().map(() => Array(gridCols).fill(0));

  // Pre-populate some cells with mock data for initial layout visualization
  gridCells[1][1] = 1; // Near dumbbell rack 1
  gridCells[1][7] = 1; // Near dumbbell rack 2
  gridCells[3][3] = 1; // Near bench 2
  gridCells[4][8] = 1; // Near bench 4

  // ==========================================
  // DOM ELEMENTS
  // ==========================================
  const pitchContainer = document.getElementById('pitch-container');
  const dashboardContainer = document.getElementById('dashboard-container');
  const slideIndicator = document.getElementById('slide-indicator');
  const navControls = document.getElementById('slide-nav-controls');
  
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnModePitch = document.getElementById('btn-mode-pitch');
  const btnModeDashboard = document.getElementById('btn-mode-dashboard');
  
  const btnStartPitch = document.getElementById('btn-start-pitch');
  const btnJumpDb = document.getElementById('btn-jump-db');
  const btnConclusionDemo = document.getElementById('btn-conclusion-demo');

  // ==========================================
  // SLIDE NAVIGATION LOGIC
  // ==========================================
  function updateSlideView() {
    // Update slides visibility
    for (let i = 1; i <= totalSlides; i++) {
      const slide = document.getElementById(`slide-${i}`);
      if (i === currentSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    }
    
    // Update header indicator
    slideIndicator.textContent = `${currentSlide} / ${totalSlides}`;
    
    // Button state
    btnPrev.disabled = currentSlide === 1;
    btnNext.disabled = currentSlide === totalSlides;
  }

  function nextSlide() {
    if (currentSlide < totalSlides) {
      currentSlide++;
      updateSlideView();
    }
  }

  function prevSlide() {
    if (currentSlide > 1) {
      currentSlide--;
      updateSlideView();
    }
  }

  btnNext.addEventListener('click', nextSlide);
  btnPrev.addEventListener('click', prevSlide);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (activeMode === 'pitch') {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    }
  });

  // Slide 1 actions
  btnStartPitch.addEventListener('click', nextSlide);
  btnJumpDb.addEventListener('click', () => switchMode('dashboard'));
  btnConclusionDemo.addEventListener('click', () => switchMode('dashboard'));

  // ==========================================
  // MODE TOGGLE (PITCH VS DASHBOARD)
  // ==========================================
  function switchMode(mode) {
    activeMode = mode;
    if (mode === 'pitch') {
      btnModePitch.classList.add('active');
      btnModeDashboard.classList.remove('active');
      pitchContainer.style.display = 'flex';
      dashboardContainer.classList.remove('active');
      navControls.style.display = 'flex';
      updateSlideView();
    } else {
      btnModePitch.classList.remove('active');
      btnModeDashboard.classList.add('active');
      pitchContainer.style.display = 'none';
      dashboardContainer.classList.add('active');
      navControls.style.display = 'none';
      
      // Start or resize dashboard elements
      initDashboardStreams();
      syncDashboardMetrics();
    }
  }

  btnModePitch.addEventListener('click', () => switchMode('pitch'));
  btnModeDashboard.addEventListener('click', () => switchMode('dashboard'));

  // ==========================================
  // SLIDE 2: TIME CONGESTION SLIDER
  // ==========================================
  const congestionSlider = document.getElementById('congestion-slider');
  const sliderTimeText = document.getElementById('slider-time-text');
  
  const cardioWaitVal = document.getElementById('cardio-wait-val');
  const freeDensityVal = document.getElementById('free-density-val');
  const memberChurnVal = document.getElementById('member-churn-val');
  
  const cardioWaitCard = document.getElementById('cardio-wait-card');
  const freeDensityCard = document.getElementById('free-density-card');
  const memberChurnCard = document.getElementById('member-churn-card');

  function updateCongestionMetrics(hour) {
    let timeLabel = '';
    let waitTime = 0;
    let density = 0;
    let churn = '낮음';
    
    // Label calculation
    const formattedHour = hour < 10 ? `0${hour}` : hour;
    
    if (hour >= 6 && hour < 9) {
      timeLabel = `오전 ${formattedHour}:00 (보통)`;
      waitTime = 5;
      density = 45;
      churn = '보통';
    } else if (hour >= 9 && hour < 12) {
      timeLabel = `오전 ${formattedHour}:00 (여유)`;
      waitTime = 2;
      density = 25;
      churn = '낮음';
    } else if (hour >= 12 && hour < 14) {
      timeLabel = `오후 ${formattedHour}:00 (보통)`;
      waitTime = 8;
      density = 50;
      churn = '보통';
    } else if (hour >= 14 && hour < 18) {
      timeLabel = `오후 ${formattedHour}:00 (여유)`;
      waitTime = 3;
      density = 30;
      churn = '낮음';
    } else if (hour >= 18 && hour < 21) {
      // Peak hours
      timeLabel = `오후 ${formattedHour}:00 (혼잡 피크)`;
      waitTime = 25 + (hour - 18) * 5;
      density = 85 + (hour - 18) * 4;
      churn = '매우 높음';
    } else {
      timeLabel = `오후 ${formattedHour}:00 (여유)`;
      waitTime = 4;
      density = 20;
      churn = '낮음';
    }
    
    sliderTimeText.textContent = timeLabel;
    cardioWaitVal.textContent = `${waitTime}분`;
    freeDensityVal.textContent = `${density}%`;
    memberChurnVal.textContent = churn;
    
    // Alert styling
    if (density >= 70) {
      freeDensityVal.className = 'metric-value red';
      freeDensityCard.classList.add('alert-active');
    } else {
      freeDensityVal.className = 'metric-value';
      freeDensityCard.classList.remove('alert-active');
    }

    if (waitTime >= 15) {
      cardioWaitVal.className = 'metric-value red';
      cardioWaitCard.classList.add('alert-active');
    } else {
      cardioWaitVal.className = 'metric-value';
      cardioWaitCard.classList.remove('alert-active');
    }

    if (churn === '매우 높음' || churn === '높음') {
      memberChurnVal.className = 'metric-value red';
      memberChurnCard.classList.add('alert-active');
    } else {
      memberChurnVal.className = 'metric-value';
      memberChurnCard.classList.remove('alert-active');
    }
  }

  congestionSlider.addEventListener('input', (e) => {
    updateCongestionMetrics(parseInt(e.target.value));
  });
  
  // Init Slide 2 metrics
  updateCongestionMetrics(18);

  // ==========================================
  // SLIDE 3: SVG FLOW DIAGRAM ARCHITECTURE
  // ==========================================
  const nodeItems = document.querySelectorAll('.node-item');
  
  function triggerDiagramFlow(nodeName) {
    // Hide all flow paths
    document.getElementById('flow-cctv-jetson').style.display = 'none';
    document.getElementById('flow-jetson-android').style.display = 'none';
    document.getElementById('flow-android-tv').style.display = 'none';
    
    // Reset SVG node glow styling
    document.querySelectorAll('.svg-node').forEach(node => {
      node.querySelector('rect').setAttribute('stroke', 'var(--border-color)');
      node.querySelector('rect').setAttribute('filter', 'none');
    });

    if (nodeName === 'cctv') {
      // Glow CCTV
      document.getElementById('svg-node-cctv').querySelector('rect').setAttribute('stroke', 'var(--neon-red)');
      document.getElementById('svg-node-cctv').querySelector('rect').setAttribute('filter', 'url(#glow-brand)');
    } else if (nodeName === 'jetson') {
      // CCTV to Jetson flow
      document.getElementById('flow-cctv-jetson').style.display = 'block';
      document.getElementById('svg-node-jetson').querySelector('rect').setAttribute('stroke', 'var(--spoany-orange)');
      document.getElementById('svg-node-jetson').querySelector('rect').setAttribute('filter', 'url(#glow-brand)');
    } else if (nodeName === 'android') {
      // Jetson to Android flow
      document.getElementById('flow-cctv-jetson').style.display = 'block';
      document.getElementById('flow-jetson-android').style.display = 'block';
      document.getElementById('svg-node-android').querySelector('rect').setAttribute('stroke', 'var(--neon-cyan)');
      document.getElementById('svg-node-android').querySelector('rect').setAttribute('filter', 'url(#glow-cyan)');
    } else if (nodeName === 'tv') {
      // Full flow
      document.getElementById('flow-cctv-jetson').style.display = 'block';
      document.getElementById('flow-jetson-android').style.display = 'block';
      document.getElementById('flow-android-tv').style.display = 'block';
      document.getElementById('svg-node-tv').setAttribute('filter', 'url(#glow-cyan)');
    }
  }

  nodeItems.forEach(item => {
    item.addEventListener('click', () => {
      nodeItems.forEach(n => n.classList.remove('selected'));
      item.classList.add('selected');
      const nodeName = item.getAttribute('data-node');
      triggerDiagramFlow(nodeName);
    });
  });

  // Bind click directly to SVG nodes as well
  document.getElementById('svg-node-cctv').addEventListener('click', () => document.querySelector('[data-node="cctv"]').click());
  document.getElementById('svg-node-jetson').addEventListener('click', () => document.querySelector('[data-node="jetson"]').click());
  document.getElementById('svg-node-android').addEventListener('click', () => document.querySelector('[data-node="android"]').click());
  document.getElementById('svg-node-tv').addEventListener('click', () => document.querySelector('[data-node="tv"]').click());

  // Init Slide 3 diagram state
  triggerDiagramFlow('cctv');

  // ==========================================
  // SLIDE 4: CARDIO ZONE TREADMILL ROI GRID
  // ==========================================
  const slideTreadmillGrid = document.getElementById('slide-treadmill-grid');
  const treadmillUsageTag = document.getElementById('treadmill-usage-tag');
  const treadmillWaitingCount = document.getElementById('treadmill-waiting-count');
  const treadmillWaitingTime = document.getElementById('treadmill-waiting-time');

  function renderTreadmills() {
    slideTreadmillGrid.innerHTML = '';
    
    treadmillState.forEach(tm => {
      const slot = document.createElement('div');
      slot.className = `treadmill-slot ${tm.occupied ? 'occupied' : 'free'}`;
      slot.innerHTML = `
        <span class="treadmill-icon">🏃</span>
        <span class="treadmill-id">ID-0${tm.id}</span>
        <span class="treadmill-status">${tm.occupied ? '사용 중' : '가용'}</span>
      `;
      
      slot.addEventListener('click', () => {
        tm.occupied = !tm.occupied;
        renderTreadmills();
        calculateCardioMetrics();
        syncDashboardMetrics();
      });
      
      slideTreadmillGrid.appendChild(slot);
    });
  }

  function calculateCardioMetrics() {
    const occupiedCount = treadmillState.filter(tm => tm.occupied).length;
    const ratio = Math.round((occupiedCount / treadmillState.length) * 100);
    treadmillUsageTag.textContent = `점유율: ${ratio}%`;
    
    let waitCount = 0;
    let waitTime = 0;
    
    if (ratio === 100) {
      waitCount = 3;
      waitTime = 18;
    } else if (ratio >= 85) {
      waitCount = 2;
      waitTime = 10;
    } else if (ratio >= 75) {
      waitCount = 1;
      waitTime = 5;
    } else {
      waitCount = 0;
      waitTime = 0;
    }
    
    treadmillWaitingCount.textContent = `${waitCount}명`;
    treadmillWaitingTime.textContent = `${waitTime}분`;
  }

  // Render Slide 4 initially
  renderTreadmills();
  calculateCardioMetrics();

  // ==========================================
  // SLIDE 5: FREE WEIGHT GRID HEATMAP
  // ==========================================
  const slideDensityBadge = document.getElementById('slide-density-badge');
  const slideDensityGuide = document.getElementById('slide-density-guide');
  const btnClearHeatmap = document.getElementById('btn-clear-heatmap');

  function initHeatmapCanvas() {
    // Clear canvas
    slideCtx.fillStyle = '#04060c';
    slideCtx.fillRect(0, 0, slideHeatmapCanvas.width, slideHeatmapCanvas.height);
    
    // Draw Blueprint: Dumbbell Racks
    slideCtx.fillStyle = 'rgba(255, 60, 66, 0.15)';
    slideCtx.fillRect(20, 10, 110, 10);
    slideCtx.fillRect(190, 10, 110, 10);
    slideCtx.strokeStyle = 'rgba(255, 60, 66, 0.3)';
    slideCtx.lineWidth = 1;
    slideCtx.strokeRect(20, 10, 110, 10);
    slideCtx.strokeRect(190, 10, 110, 10);
    
    slideCtx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    slideCtx.font = '7px Outfit';
    slideCtx.fillText('덤벨 랙 A (RACK A)', 45, 28);
    slideCtx.fillText('덤벨 랙 B (RACK B)', 215, 28);

    // Draw Blueprint: Benches
    slideCtx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    slideCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    const benches = [
      { x: 45, y: 55 }, { x: 105, y: 55 },
      { x: 205, y: 55 }, { x: 265, y: 55 }
    ];
    benches.forEach(bench => {
      slideCtx.fillRect(bench.x, bench.y, 14, 30);
      slideCtx.strokeRect(bench.x, bench.y, 14, 30);
      slideCtx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      slideCtx.fillText('BENCH', bench.x - 3, bench.y + 40);
      slideCtx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    });

    // Draw Blueprint: Power Racks
    slideCtx.fillStyle = 'rgba(0, 240, 255, 0.04)';
    slideCtx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
    slideCtx.fillRect(15, 115, 30, 30);
    slideCtx.strokeRect(15, 115, 30, 30);
    slideCtx.fillRect(275, 115, 30, 30);
    slideCtx.strokeRect(275, 115, 30, 30);
    
    slideCtx.fillStyle = 'rgba(0, 240, 255, 0.25)';
    slideCtx.fillText('POWER RACK 1', 10, 155);
    slideCtx.fillText('POWER RACK 2', 270, 155);

    // Draw Grid Lines
    slideCtx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    const cellW = slideHeatmapCanvas.width / gridCols;
    const cellH = slideHeatmapCanvas.height / gridRows;
    
    for (let i = 0; i <= gridCols; i++) {
      slideCtx.beginPath();
      slideCtx.moveTo(i * cellW, 0);
      slideCtx.lineTo(i * cellW, slideHeatmapCanvas.height);
      slideCtx.stroke();
    }
    for (let j = 0; j <= gridRows; j++) {
      slideCtx.beginPath();
      slideCtx.moveTo(0, j * cellH);
      slideCtx.lineTo(slideHeatmapCanvas.width, j * cellH);
      slideCtx.stroke();
    }

    // Redraw all active heat spots in gridCells
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        if (gridCells[r][c] === 1) {
          const px = c * cellW + cellW/2;
          const py = r * cellH + cellH/2;
          
          const radius = 25;
          const gradient = slideCtx.createRadialGradient(px, py, 2, px, py, radius);
          gradient.addColorStop(0, 'rgba(255, 42, 109, 0.7)');   // Red core
          gradient.addColorStop(0.3, 'rgba(255, 60, 66, 0.4)'); // Brand Red
          gradient.addColorStop(0.7, 'rgba(255, 230, 0, 0.15)'); // Yellow
          gradient.addColorStop(1, 'rgba(255, 230, 0, 0)');     // Transparent
          
          slideCtx.fillStyle = gradient;
          slideCtx.beginPath();
          slideCtx.arc(px, py, radius, 0, Math.PI * 2);
          slideCtx.fill();
        }
      }
    }
  }

  function drawHeatSpot(x, y) {
    const cellW = slideHeatmapCanvas.width / gridCols;
    const cellH = slideHeatmapCanvas.height / gridRows;
    const colIdx = Math.floor(x / cellW);
    const rowIdx = Math.floor(y / cellH);
    
    if (colIdx >= 0 && colIdx < gridCols && rowIdx >= 0 && rowIdx < gridRows) {
      gridCells[rowIdx][colIdx] = 1;
    }
    
    initHeatmapCanvas();
    updateDensityMetrics();
    syncDashboardMetrics();
  }

  function updateDensityMetrics() {
    let activeCells = 0;
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        if (gridCells[r][c] === 1) activeCells++;
      }
    }
    
    const densityPercent = Math.round((activeCells / (gridRows * gridCols)) * 100);
    
    if (densityPercent >= 70) {
      slideDensityBadge.textContent = `혼잡 (${densityPercent}%)`;
      slideDensityBadge.className = 'density-badge busy';
      slideDensityGuide.innerHTML = `"현재 덤벨 존 과밀 상태입니다. 유산소 및 머신 존 우회 이용을 권장합니다."`;
    } else if (densityPercent >= 30) {
      slideDensityBadge.textContent = `보통 (${densityPercent}%)`;
      slideDensityBadge.className = 'density-badge normal';
      slideDensityGuide.innerHTML = `"보통 수준의 밀도입니다. 세트 사이 쉬는 시간을 이용해 배려해 주세요."`;
    } else {
      slideDensityBadge.textContent = `여유 (${densityPercent}%)`;
      slideDensityBadge.className = 'density-badge smooth';
      slideDensityGuide.innerHTML = `"프리웨이트 존 이용이 매우 원활합니다. 즐거운 득근 시간 되세요!"`;
    }
  }

  slideHeatmapCanvas.addEventListener('mousedown', (e) => {
    isDrawingHeatmap = true;
    const rect = slideHeatmapCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    drawHeatSpot(x, y);
  });

  slideHeatmapCanvas.addEventListener('mousemove', (e) => {
    if (!isDrawingHeatmap) return;
    const rect = slideHeatmapCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    drawHeatSpot(x, y);
  });

  window.addEventListener('mouseup', () => {
    isDrawingHeatmap = false;
  });

  btnClearHeatmap.addEventListener('click', () => {
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        gridCells[r][c] = 0;
      }
    }
    initHeatmapCanvas();
    updateDensityMetrics();
    syncDashboardMetrics();
  });

  // Init Slide 5 Canvas and Metrics
  initHeatmapCanvas();
  updateDensityMetrics();

  // ==========================================
  // SLIDE 6: ROADMAP INTERACTIVE CHECKLIST
  // ==========================================
  const roadmapPhases = document.querySelectorAll('.roadmap-phase');
  const roadmapProgressText = document.getElementById('roadmap-progress-text');
  const roadmapProgressFill = document.getElementById('roadmap-progress-fill');

  roadmapPhases.forEach(phase => {
    phase.addEventListener('click', (e) => {
      // Only expand if clicked on headers
      if (e.target.tagName !== 'INPUT') {
        roadmapPhases.forEach(p => p.classList.remove('active'));
        phase.classList.add('active');
      }
    });
  });

  // Calculate Roadmap Progress
  const roadmapTasks = [
    document.getElementById('task-poc-3'),
    document.getElementById('task-poc-4'),
    document.getElementById('task-main-1'),
    document.getElementById('task-main-2'),
    document.getElementById('task-main-3'),
    document.getElementById('task-main-4')
  ];

  function updateRoadmapProgress() {
    // 2 tasks are pre-checked (completed) by default in design (CCTV integration, Orin packing)
    let completed = 2;
    const total = 8;
    
    roadmapTasks.forEach(task => {
      if (task && task.checked) completed++;
    });
    
    const percentage = Math.round((completed / total) * 100);
    roadmapProgressText.textContent = `${percentage}%`;
    roadmapProgressFill.style.width = `${percentage}%`;
  }

  roadmapTasks.forEach(task => {
    if (task) {
      task.addEventListener('change', updateRoadmapProgress);
    }
  });

  // ==========================================
  // LIVE DASHBOARD RENDERING & SIMULATION
  // ==========================================
  let streamIntervalId = null;
  const eventLogBox = document.getElementById('event-log-box');
  
  // Dashboard CCTV feeds
  const cctvCardio = document.getElementById('cctv-cardio-canvas');
  const cctvFree = document.getElementById('cctv-free-canvas');
  const cctvGx = document.getElementById('cctv-gx-canvas');
  
  const ctxCardio = cctvCardio.getContext('2d');
  const ctxFree = cctvFree.getContext('2d');
  const ctxGx = cctvGx.getContext('2d');

  function initDashboardStreams() {
    if (streamIntervalId) clearInterval(streamIntervalId);
    
    // Set internal resolution of CCTV canvas to match display aspect ratio
    [cctvCardio, cctvFree, cctvGx].forEach(canvas => {
      canvas.width = 320;
      canvas.height = 180;
    });

    streamIntervalId = setInterval(drawTelemetryStreams, 60); // ~16 FPS
  }

  // Generate simulated moving coordinates for AI detection boxes
  const movingObjects = [
    { x: 30, y: 70, dx: 0.5, dy: 0.2, label: 'ID-03', color: 'var(--neon-red)' },
    { x: 120, y: 80, dx: -0.4, dy: 0.3, label: 'ID-06', color: 'var(--neon-red)' },
    { x: 220, y: 65, dx: 0.6, dy: -0.1, label: 'ID-01', color: 'var(--neon-green)' },
    { x: 270, y: 90, dx: -0.3, dy: -0.4, label: 'ID-08', color: 'var(--neon-green)' }
  ];

  const heatBlobs = [
    { x: 80, y: 70, size: 20, pulseDir: 1 },
    { x: 180, y: 110, size: 28, pulseDir: -1 },
    { x: 230, y: 60, size: 15, pulseDir: 1 }
  ];

  let gxPeopleCount = 18;
  let frameCount = 0;

  function drawTelemetryStreams() {
    frameCount++;

    // 1. CAM-01: Cardio Zone Sim
    ctxCardio.fillStyle = '#060913';
    ctxCardio.fillRect(0, 0, 320, 180);
    
    // Draw Static Treadmill outlines
    ctxCardio.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctxCardio.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
      const tx = 25 + i * 35;
      ctxCardio.strokeRect(tx, 50, 25, 60);
      ctxCardio.strokeRect(tx + 5, 110, 15, 15);
      
      // Bounding box for occupied treadmills in Slide 4 state
      if (treadmillState[i] && treadmillState[i].occupied) {
        ctxCardio.strokeStyle = '#FF2A6D';
        ctxCardio.strokeRect(tx - 2, 45, 29, 85);
        ctxCardio.fillStyle = '#FF2A6D';
        ctxCardio.font = '7px monospace';
        ctxCardio.fillText(`OCCUPIED`, tx - 2, 41);
        ctxCardio.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      } else {
        ctxCardio.strokeStyle = '#39FF14';
        ctxCardio.strokeRect(tx - 2, 45, 29, 85);
        ctxCardio.fillStyle = '#39FF14';
        ctxCardio.font = '7px monospace';
        ctxCardio.fillText(`FREE`, tx - 2, 41);
        ctxCardio.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      }
    }
    
    // Draw scanline/noise effect overlay
    drawCctvStaticOverlay(ctxCardio);

    // 2. CAM-02: Free Weight Heatmap Sim
    ctxFree.fillStyle = '#060913';
    ctxFree.fillRect(0, 0, 320, 180);
    
    // Draw rack outline
    ctxFree.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctxFree.strokeRect(40, 40, 100, 30);
    ctxFree.strokeRect(180, 40, 100, 30);
    
    // Pulse and draw dynamic heatmap blobs
    heatBlobs.forEach(blob => {
      blob.size += blob.pulseDir * 0.15;
      if (blob.size > 35 || blob.size < 12) blob.pulseDir *= -1;
      
      const grad = ctxFree.createRadialGradient(blob.x, blob.y, 2, blob.x, blob.y, blob.size);
      grad.addColorStop(0, 'rgba(255, 60, 66, 0.6)');
      grad.addColorStop(0.5, 'rgba(255, 230, 0, 0.3)');
      grad.addColorStop(1, 'rgba(255, 230, 0, 0)');
      
      ctxFree.fillStyle = grad;
      ctxFree.beginPath();
      ctxFree.arc(blob.x, blob.y, blob.size, 0, Math.PI * 2);
      ctxFree.fill();
    });
    
    // Add real-time clicks on slide 5 heatmap to the dashboard
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        if (gridCells[r][c] === 1) {
          const cellW = 320 / gridCols;
          const cellH = 180 / gridRows;
          const px = c * cellW + cellW/2;
          const py = r * cellH + cellH/2;
          
          const clickGrad = ctxFree.createRadialGradient(px, py, 2, px, py, 20);
          clickGrad.addColorStop(0, 'rgba(255, 42, 109, 0.6)');
          clickGrad.addColorStop(1, 'rgba(255, 42, 109, 0)');
          ctxFree.fillStyle = clickGrad;
          ctxFree.beginPath();
          ctxFree.arc(px, py, 20, 0, Math.PI * 2);
          ctxFree.fill();
        }
      }
    }
    
    drawCctvStaticOverlay(ctxFree);

    // 3. CAM-03: GX Entrance Counter Sim
    ctxGx.fillStyle = '#060913';
    ctxGx.fillRect(0, 0, 320, 180);
    
    // Draw entry line
    ctxGx.strokeStyle = 'var(--spoany-orange)';
    ctxGx.lineWidth = 2;
    ctxGx.beginPath();
    ctxGx.moveTo(160, 20);
    ctxGx.lineTo(160, 160);
    ctxGx.stroke();
    
    ctxGx.fillStyle = 'var(--spoany-orange)';
    ctxGx.font = '8px Outfit';
    ctxGx.fillText('AI COUNTING LINE', 165, 30);
    
    // Update and draw a pedestrian silhouette crossing the line
    movingObjects.forEach(obj => {
      obj.x += obj.dx;
      obj.y += obj.dy;
      
      // Boundary wraps
      if (obj.x > 320 || obj.x < 0) {
        obj.dx *= -1;
        // Count events occasionally when crossing
        if (Math.abs(obj.x - 160) < 5) {
          triggerCountingEvent();
        }
      }
      if (obj.y > 140 || obj.y < 40) obj.dy *= -1;
      
      // Draw detection box
      ctxGx.strokeStyle = obj.color;
      ctxGx.lineWidth = 1;
      ctxGx.strokeRect(obj.x - 10, obj.y - 25, 20, 50);
      
      // Draw skeletal tracking stick-man mockup inside
      ctxGx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctxGx.beginPath();
      ctxGx.arc(obj.x, obj.y - 15, 4, 0, Math.PI*2); // Head
      ctxGx.moveTo(obj.x, obj.y - 11);
      ctxGx.lineTo(obj.x, obj.y + 10); // Body
      ctxGx.moveTo(obj.x - 8, obj.y - 5);
      ctxGx.lineTo(obj.x + 8, obj.y - 5); // Arms
      ctxGx.moveTo(obj.x, obj.y + 10);
      ctxGx.lineTo(obj.x - 6, obj.y + 23); // Leg L
      ctxGx.moveTo(obj.x, obj.y + 10);
      ctxGx.lineTo(obj.x + 6, obj.y + 23); // Leg R
      ctxGx.stroke();
      
      // Text label
      ctxGx.fillStyle = obj.color;
      ctxGx.font = '8px monospace';
      ctxGx.fillText(obj.label, obj.x - 10, obj.y - 28);
    });

    drawCctvStaticOverlay(ctxGx);
    
    // Fluctuate telemetry system load gauges
    if (frameCount % 10 === 0) {
      fluctuateSystemHardware();
    }
  }

  function drawCctvStaticOverlay(ctx) {
    // Top camera status text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.font = '6px monospace';
    
    // Add tiny horizontal noise lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 0.5;
    for (let l = 0; l < 180; l += 8) {
      ctx.beginPath();
      ctx.moveTo(0, l + Math.sin(frameCount * 0.05) * 5);
      ctx.lineTo(320, l + Math.sin(frameCount * 0.05) * 5);
      ctx.stroke();
    }
  }

  function triggerCountingEvent() {
    const isEnter = Math.random() > 0.4;
    if (isEnter) {
      gxPeopleCount++;
      logSystemEvent(`CAM-03: 입실 감지 (현재 GX 참가 인원: ${gxPeopleCount}명)`);
    } else {
      if (gxPeopleCount > 0) gxPeopleCount--;
      logSystemEvent(`CAM-03: 퇴실 감지 (현재 GX 참가 인원: ${gxPeopleCount}명)`);
    }
    
    document.getElementById('cctv-gx-count').textContent = `입실: ${gxPeopleCount}`;
  }

  function logSystemEvent(msg) {
    const time = new Date();
    const hh = String(time.getHours()).padStart(2, '0');
    const mm = String(time.getMinutes()).padStart(2, '0');
    const ss = String(time.getSeconds()).padStart(2, '0');
    
    const logItem = document.createElement('div');
    logItem.className = 'log-entry';
    logItem.innerHTML = `<span class="log-time">[${hh}:${mm}:${ss}]</span> <span class="log-msg">${msg}</span>`;
    
    eventLogBox.appendChild(logItem);
    eventLogBox.scrollTop = eventLogBox.scrollHeight;
  }

  // Telemetry load simulator variables
  let cpu = 34;
  let gpu = 78;
  let latency = 4.2;

  function fluctuateSystemHardware() {
    cpu = Math.min(95, Math.max(15, cpu + (Math.random() - 0.5) * 6));
    gpu = Math.min(98, Math.max(40, gpu + (Math.random() - 0.5) * 4));
    latency = Math.min(10, Math.max(2, latency + (Math.random() - 0.5) * 0.8));
    
    document.getElementById('sys-val-cpu').textContent = `${Math.round(cpu)}%`;
    document.getElementById('sys-bar-cpu').style.width = `${cpu}%`;
    
    document.getElementById('sys-val-gpu').textContent = `${Math.round(gpu)}%`;
    document.getElementById('sys-bar-gpu').style.width = `${gpu}%`;
    
    document.getElementById('sys-val-latency').textContent = `${latency.toFixed(1)} ms`;
    document.getElementById('sys-bar-latency').style.width = `${latency * 10}%`; // Normalized to max 10ms
  }

  function syncDashboardMetrics() {
    // 1. Treadmill occupancy sync
    const occupiedCount = treadmillState.filter(tm => tm.occupied).length;
    document.getElementById('db-cardio-occupancy').textContent = `${occupiedCount} / 8`;
    document.getElementById('cctv-cardio-count').textContent = `점유: ${occupiedCount}`;
    
    // 2. Free weight heatmap density sync
    let activeCells = 0;
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        if (gridCells[r][c] === 1) activeCells++;
      }
    }
    const densityPercent = Math.round((activeCells / (gridRows * gridCols)) * 100);
    const densityLabel = densityPercent >= 70 ? '혼잡' : (densityPercent >= 30 ? '보통' : '여유');
    document.getElementById('db-free-density').textContent = `${densityLabel} (${densityPercent}%)`;
    document.getElementById('cctv-free-count').textContent = `밀도: ${densityPercent}%`;
    
    // Update overall occupancy indicator
    const overallRatio = Math.round((densityPercent + (occupiedCount / 8) * 100) / 2);
    document.getElementById('db-overall-ratio').textContent = `${overallRatio}%`;
  }

  // Periodic random dashboard notifications
  setInterval(() => {
    if (activeMode !== 'dashboard') return;
    
    const randomMsgs = [
      "CAM-01: 기구 ROI 바운딩 데이터 전송 완료.",
      "Jetson Orin: YOLOv8 인퍼런스 지연 16.4ms - 정상 범주 유지 중.",
      "CAM-02: 군중 밀도 히트맵 클러스터 분포 업데이트.",
      "스포애니 DB API: 실시간 로컬 패킷 동기화 주기 정상 수신.",
      "안드로이드 허브: TV 렌더 프레임 동기화 대역폭 확인 (12.4 Mbps)"
    ];
    
    const randomMsg = randomMsgs[Math.floor(Math.random() * randomMsgs.length)];
    logSystemEvent(randomMsg);
  }, 4500);

});
