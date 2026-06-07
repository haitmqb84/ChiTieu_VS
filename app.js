/* ==========================================================================
   FinFlow JavaScript Logic - SPA Router, Data Store, and Visualization
   ========================================================================== */

// --- ĐỐI TƯỢNG QUẢN LÝ TRẠNG THÁI ỨNG DỤNG (APPLICATION STATE) ---
let state = {
  transactions: [],
  categories: [],
  budgets: [],
  savingsGoals: [],
  userProfile: {
    name: "Hải TM"
  }
};

// --- DANH MỤC MẶC ĐỊNH (DEFAULT CATEGORIES) ---
const DEFAULT_CATEGORIES = [
  // Danh mục Chi tiêu (Expense)
  { id: "cat_food", name: "Ăn uống", type: "expense", color: "#f43f5e", icon: "utensils", isCustom: false },
  { id: "cat_shopping", name: "Mua sắm", type: "expense", color: "#3b82f6", icon: "shopping-bag", isCustom: false },
  { id: "cat_housing", name: "Nhà cửa", type: "expense", color: "#10b981", icon: "home", isCustom: false },
  { id: "cat_transport", name: "Di chuyển", type: "expense", color: "#f59e0b", icon: "car", isCustom: false },
  { id: "cat_utilities", name: "Điện nước / Dịch vụ", type: "expense", color: "#06b6d4", icon: "zap", isCustom: false },
  { id: "cat_health", name: "Sức khoẻ", type: "expense", color: "#ec4899", icon: "activity", isCustom: false },
  { id: "cat_education", name: "Giáo dục", type: "expense", color: "#8b5cf6", icon: "graduation-cap", isCustom: false },
  { id: "cat_entertainment", name: "Giải trí", type: "expense", color: "#a855f7", icon: "gamepad-2", isCustom: false },
  { id: "cat_travel", name: "Du lịch", type: "expense", color: "#14b8a6", icon: "plane", isCustom: false },
  { id: "cat_gift_exp", name: "Quà tặng & Cho đi", type: "expense", color: "#ef4444", icon: "gift", isCustom: false },
  { id: "cat_tuition", name: "Tiền học cho con", type: "expense", color: "#f97316", icon: "graduation-cap", isCustom: false },
  
  // Danh mục Thu nhập (Income)
  { id: "cat_salary", name: "Lương cố định", type: "income", color: "#10b981", icon: "briefcase", isCustom: false },
  { id: "cat_freelance", name: "Việc làm ngoài", type: "income", color: "#6366f1", icon: "trending-up", isCustom: false },
  { id: "cat_investment", name: "Đầu tư sinh lời", type: "income", color: "#f59e0b", icon: "trending-up", isCustom: false },
  { id: "cat_gift_inc", name: "Quà biếu / Thưởng", type: "income", color: "#ec4899", icon: "gift", isCustom: false },
  { id: "cat_other_inc", name: "Thu nhập khác", type: "income", color: "#64748b", icon: "tag", isCustom: false }
];

// Các mã màu gợi ý khi tạo danh mục mới
const PRESET_COLORS = [
  "#6366f1", "#10b981", "#f43f5e", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", 
  "#14b8a6", "#f97316", "#84cc16", "#06b6d4", "#a855f7", "#64748b", "#475569", "#0f172a"
];

let selectedCategoryColor = PRESET_COLORS[0];

// --- KHỞI TẠO ĐỐI TƯỢNG BIỂU ĐỒ (CHART INSTANCES) ---
let trendChartInstance = null;
let categoryChartInstance = null;

// ==========================================================================
// 1. QUẢN LÝ DỮ LIỆU (LOCAL STORAGE & MOCK DATA)
// ==========================================================================

// Lưu dữ liệu vào LocalStorage
function saveToStorage() {
  localStorage.setItem("finflow_state", JSON.stringify(state));
}

// Tải dữ liệu từ LocalStorage
function loadFromStorage() {
  const localData = localStorage.getItem("finflow_state");
  if (localData) {
    try {
      state = JSON.parse(localData);
      
      // Đảm bảo không mất danh mục mặc định nếu bị lỗi
      if (!state.categories || state.categories.length === 0) {
        state.categories = [...DEFAULT_CATEGORIES];
      }
      
      // Khắc phục các mục thiếu hoặc lỗi cấu trúc
      if (!state.transactions) state.transactions = [];
      if (!state.budgets) state.budgets = [];
      if (!state.savingsGoals) state.savingsGoals = [];
      if (!state.userProfile) state.userProfile = { name: "Hải TM" };
      
    } catch (e) {
      console.error("Lỗi khi giải mã dữ liệu LocalStorage. Khởi động lại.", e);
      initializeDefaults();
    }
  } else {
    initializeDefaults();
    loadMockData(); // Tải trước một ít dữ liệu mẫu để giao diện trực quan ngay từ đầu
  }
}

// Khởi tạo các danh mục mặc định
function initializeDefaults() {
  state.categories = [...DEFAULT_CATEGORIES];
  state.transactions = [];
  state.budgets = [];
  state.savingsGoals = [];
  state.userProfile = { name: "Hải TM" };
  saveToStorage();
}

// Tải dữ liệu mẫu (Mock Data)
function loadMockData() {
  const today = new Date();
  const formatOffsetDate = (offsetDays) => {
    const d = new Date();
    d.setDate(today.getDate() - offsetDays);
    return d.toISOString().split("T")[0];
  };

  const currentYearMonth = today.toISOString().substring(0, 7); // YYYY-MM
  const prevMonthDate = new Date();
  prevMonthDate.setMonth(today.getMonth() - 1);
  const prevYearMonth = prevMonthDate.toISOString().substring(0, 7);

  // Tạo các giao dịch mẫu
  state.transactions = [
    // Tháng hiện tại
    { id: "tx_mock_1", amount: 18000000, type: "income", category: "cat_salary", date: formatOffsetDate(2), notes: "Lương tháng này" },
    { id: "tx_mock_2", amount: 1500000, type: "income", category: "cat_freelance", date: formatOffsetDate(1), notes: "Dự án website freelance" },
    { id: "tx_mock_3", amount: 650000, type: "expense", category: "cat_food", date: formatOffsetDate(0), notes: "Ăn lẩu cuối tuần với bạn bè" },
    { id: "tx_mock_4", amount: 350000, type: "expense", category: "cat_transport", date: formatOffsetDate(1), notes: "Đổ xăng xe máy & đặt grab" },
    { id: "tx_mock_5", amount: 1200000, type: "expense", category: "cat_shopping", date: formatOffsetDate(3), notes: "Mua giày thể thao mới" },
    { id: "tx_mock_6", amount: 800000, type: "expense", category: "cat_utilities", date: formatOffsetDate(4), notes: "Thanh toán hoá đơn điện" },
    { id: "tx_mock_7", amount: 450000, type: "expense", category: "cat_health", date: formatOffsetDate(5), notes: "Mua thuốc bổ và vitamin" },
    { id: "tx_mock_8", amount: 150000, type: "expense", category: "cat_food", date: formatOffsetDate(5), notes: "Cà phê sáng làm việc" },
    
    // Tháng trước
    { id: "tx_mock_9", amount: 18000000, type: "income", category: "cat_salary", date: `${prevYearMonth}-05`, notes: "Lương tháng trước" },
    { id: "tx_mock_10", amount: 2000000, type: "income", category: "cat_investment", date: `${prevYearMonth}-15`, notes: "Nhận cổ tức chứng khoán" },
    { id: "tx_mock_11", amount: 3200000, type: "expense", category: "cat_housing", date: `${prevYearMonth}-10`, notes: "Tiền thuê nhà và phí dịch vụ" },
    { id: "tx_mock_12", amount: 1500000, type: "expense", category: "cat_food", date: `${prevYearMonth}-12`, notes: "Tiền chợ & ăn uống tháng" },
    { id: "tx_mock_13", amount: 950000, type: "expense", category: "cat_shopping", date: `${prevYearMonth}-18`, notes: "Mua quần áo đông" },
    { id: "tx_mock_14", amount: 1200000, type: "expense", category: "cat_entertainment", date: `${prevYearMonth}-20`, notes: "Đi xem phim & concert âm nhạc" },
    { id: "tx_mock_15", amount: 600000, type: "expense", category: "cat_travel", date: `${prevYearMonth}-25`, notes: "Khám phá ngoại thành cuối tuần" },

    // Các tháng cũ hơn để có dữ liệu vẽ biểu đồ xu hướng
    { id: "tx_mock_16", amount: 17500000, type: "income", category: "cat_salary", date: getYearMonthOffset(-2) + "-05", notes: "Lương" },
    { id: "tx_mock_17", amount: 6800000, type: "expense", category: "cat_food", date: getYearMonthOffset(-2) + "-10", notes: "Chi tiêu ăn uống & gia đình" },
    
    { id: "tx_mock_18", amount: 17500000, type: "income", category: "cat_salary", date: getYearMonthOffset(-3) + "-05", notes: "Lương" },
    { id: "tx_mock_19", amount: 5500000, type: "expense", category: "cat_shopping", date: getYearMonthOffset(-3) + "-15", notes: "Mua điện thoại mới" },

    { id: "tx_mock_20", amount: 17500000, type: "income", category: "cat_salary", date: getYearMonthOffset(-4) + "-05", notes: "Lương" },
    { id: "tx_mock_21", amount: 4800000, type: "expense", category: "cat_food", date: getYearMonthOffset(-4) + "-20", notes: "Chi tiêu sinh hoạt chung" },
    
    { id: "tx_mock_22", amount: 17500000, type: "income", category: "cat_salary", date: getYearMonthOffset(-5) + "-05", notes: "Lương" },
    { id: "tx_mock_23", amount: 7200000, type: "expense", category: "cat_travel", date: getYearMonthOffset(-5) + "-18", notes: "Đi du lịch Phú Quốc" }
  ];

  // Thiết lập Ngân sách mẫu
  state.budgets = [
    { category: "cat_food", limit: 3000000 },
    { category: "cat_shopping", limit: 2000000 },
    { category: "cat_transport", limit: 800000 },
    { category: "cat_utilities", limit: 1200000 }
  ];

  // Mục tiêu tiết kiệm mẫu
  state.savingsGoals = [
    {
      id: "goal_mock_1",
      name: "Đổi Macbook Air M3",
      target: 28000000,
      current: 12000000,
      deadline: formatOffsetDate(-180), // 6 tháng tới
      color: "#6366f1",
      logs: [
        { amount: 5000000, date: formatOffsetDate(30), type: "deposit", note: "Tiết kiệm thưởng dự án" },
        { amount: 7000000, date: formatOffsetDate(10), type: "deposit", note: "Trích từ lương tháng 5" }
      ]
    },
    {
      id: "goal_mock_2",
      name: "Quỹ Khẩn Cấp 3 Tháng",
      target: 15000000,
      current: 15000000, // Đã hoàn thành
      deadline: formatOffsetDate(-10),
      color: "#10b981",
      logs: [
        { amount: 10000000, date: formatOffsetDate(45), type: "deposit", note: "Tài khoản tiết kiệm cũ chuyển qua" },
        { amount: 5000000, date: formatOffsetDate(15), type: "deposit", note: "Hoàn thành mục tiêu quỹ khẩn cấp!" }
      ]
    },
    {
      id: "goal_mock_3",
      name: "Du Lịch Nhật Bản",
      target: 40000000,
      current: 8500000,
      deadline: formatOffsetDate(-300), // 10 tháng tới
      color: "#f43f5e",
      logs: [
        { amount: 8500000, date: formatOffsetDate(5), type: "deposit", note: "Bắt đầu bỏ lợn" }
      ]
    }
  ];

  state.userProfile.name = "Hải TM";
  saveToStorage();
}

// Hàm hỗ trợ tính chuỗi năm-tháng có độ lệch
function getYearMonthOffset(offsetMonths) {
  const d = new Date();
  d.setMonth(d.getMonth() + offsetMonths);
  return d.toISOString().substring(0, 7);
}

// ==========================================================================
// 2. CÁC HÀM TIỆN ÍCH ĐỊNH DẠNG & TÍNH TOÁN (UTILITIES)
// ==========================================================================

// Định dạng tiền VNĐ (Ví dụ: 1.500.000 ₫)
function formatCurrency(number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(number);
}

// Chuyển đổi chuỗi nhập từ ô input có dấu chấm phân cách hàng nghìn thành số nguyên
function parseCurrencyString(str) {
  if (!str) return 0;
  // Loại bỏ các ký tự không phải số
  const cleanStr = str.toString().replace(/[^0-9]/g, "");
  const num = parseInt(cleanStr, 10);
  return isNaN(num) ? 0 : num;
}

// Áp dụng định dạng gõ phím trực tiếp trên ô input tiền tệ
function setupCurrencyInputAutoFormat(inputElement) {
  inputElement.addEventListener("input", function(e) {
    const rawVal = parseCurrencyString(e.target.value);
    if (rawVal === 0) {
      e.target.value = "";
    } else {
      // Định dạng số thành chuỗi phân cách hàng nghìn bằng dấu chấm
      e.target.value = new Intl.NumberFormat("vi-VN").format(rawVal);
    }
  });
}

// Lấy thông tin danh mục theo ID
function getCategoryById(catId) {
  const cat = state.categories.find(c => c.id === catId);
  if (cat) return cat;
  // Trả về một danh mục mặc định nếu không tìm thấy
  return { id: "unknown", name: "Chưa phân loại", type: "expense", color: "#64748b", icon: "tag" };
}

// Định dạng ngày hiển thị (VN format)
function formatDateVN(dateString) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Trả về ngày hôm nay ở định dạng YYYY-MM-DD phù hợp cho form input date
function getTodayDateString() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

// Tạo chuỗi định danh duy nhất (UUID-like)
function generateUniqueId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ==========================================================================
// 3. ĐIỀU HƯỚNG SPA & TƯƠNG TÁC GIAO DIỆN CHÍNH
// ==========================================================================

function initNavigation() {
  const menuButtons = document.querySelectorAll(".menu-item");
  const sections = document.querySelectorAll(".content-section");
  const pageTitle = document.getElementById("pageTitle");
  
  menuButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      
      // Cập nhật trạng thái active ở sidebar
      menuButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      // Chuyển đổi hiển thị section nội dung
      sections.forEach(sec => {
        sec.classList.remove("active");
        if (sec.id === `sec${targetTab.charAt(0).toUpperCase() + targetTab.slice(1)}`) {
          sec.classList.add("active");
        }
      });
      
      // Đổi tên trang trên Header
      pageTitle.innerText = btn.querySelector("span").innerText;
      
      // Tải và vẽ lại các thành phần đặc thù của tab
      handleTabChange(targetTab);
      
      // Tự động đóng sidebar trên di động sau khi chuyển màn
      const sidebar = document.getElementById("appSidebar");
      sidebar.classList.remove("mobile-active");
    });
  });

  // Nút mở menu trên Mobile
  const mobileToggle = document.getElementById("mobileToggleBtn");
  const sidebar = document.getElementById("appSidebar");
  
  mobileToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.toggle("mobile-active");
  });

  // Click ra ngoài để đóng menu mobile
  document.addEventListener("click", (e) => {
    if (sidebar.classList.contains("mobile-active") && !sidebar.contains(e.target) && e.target !== mobileToggle) {
      sidebar.classList.remove("mobile-active");
    }
  });

  // Cấu hình Nút Quick Add Giao dịch nhanh trên Header
  document.getElementById("btnQuickAdd").addEventListener("click", () => {
    openTransactionModal();
  });
  
  // Nút Xem tất cả giao dịch ở Dashboard
  document.getElementById("btnViewAllTransactions").addEventListener("click", () => {
    document.getElementById("btnTabTransactions").click();
  });

  // Nút thiết lập ngân sách ở Dashboard
  document.getElementById("btnManageBudgets").addEventListener("click", () => {
    document.getElementById("btnTabBudgets").click();
  });

  // Xử lý bật tắt Light/Dark mode
  const themeBtnDark = document.getElementById("themeBtnDark");
  const themeBtnLight = document.getElementById("themeBtnLight");
  const htmlNode = document.documentElement;

  // Lấy cấu hình theme cũ từ localStorage
  const savedTheme = localStorage.getItem("finflow_theme") || "dark";
  htmlNode.setAttribute("data-theme", savedTheme);
  updateThemeButtons(savedTheme);

  themeBtnDark.addEventListener("click", () => {
    htmlNode.setAttribute("data-theme", "dark");
    localStorage.setItem("finflow_theme", "dark");
    updateThemeButtons("dark");
    updateChartsTheme();
  });

  themeBtnLight.addEventListener("click", () => {
    htmlNode.setAttribute("data-theme", "light");
    localStorage.setItem("finflow_theme", "light");
    updateThemeButtons("light");
    updateChartsTheme();
  });
}

function updateThemeButtons(theme) {
  const themeBtnDark = document.getElementById("themeBtnDark");
  const themeBtnLight = document.getElementById("themeBtnLight");
  if (theme === "dark") {
    themeBtnDark.classList.add("active");
    themeBtnLight.classList.remove("active");
  } else {
    themeBtnDark.classList.remove("active");
    themeBtnLight.classList.add("active");
  }
}

// Điều phối dữ liệu khi chuyển tab
function handleTabChange(tabName) {
  if (tabName === "dashboard") {
    renderDashboard();
  } else if (tabName === "transactions") {
    renderTransactionsTab();
  } else if (tabName === "budgets") {
    renderBudgetsTab();
  } else if (tabName === "savings") {
    renderSavingsTab();
  } else if (tabName === "settings") {
    renderSettingsTab();
  }
}

// Cập nhật giao diện biểu đồ khi chuyển theme sáng/tối
function updateChartsTheme() {
  if (trendChartInstance || categoryChartInstance) {
    // Redraw charts
    renderDashboardCharts();
  }
}

// ==========================================================================
// 4. LOGIC DASHBOARD (TỔNG QUAN)
// ==========================================================================

function renderDashboard() {
  const transactions = state.transactions;
  const now = new Date();
  const currentMonthStr = now.toISOString().substring(0, 7); // YYYY-MM
  
  // Tính tổng tài sản (Tổng thu nhập - Tổng chi tiêu của toàn bộ lịch sử)
  let totalAllIncome = 0;
  let totalAllExpense = 0;
  
  transactions.forEach(t => {
    if (t.type === "income") totalAllIncome += t.amount;
    else if (t.type === "expense") totalAllExpense += t.amount;
  });
  
  // Tính cả tiền gửi thêm / rút đi trong mục tiêu tiết kiệm
  let savingsTiedAmount = 0;
  state.savingsGoals.forEach(goal => {
    goal.logs.forEach(log => {
      if (log.type === "deposit") savingsTiedAmount += log.amount;
      else if (log.type === "withdraw") savingsTiedAmount -= log.amount;
    });
  });
  
  // Số dư tài sản = Tổng thu nhập - Tổng chi tiêu - Tiền đang bị giam ở Heo đất tích lũy (Coi heo đất là một tài sản riêng biệt hoặc gộp chung tùy cách quản lý, ở đây ta trừ đi số tiền trong heo đất để hiển thị tiền mặt ví khả dụng, hoặc giữ nguyên. Hãy coi Số dư tài sản khả dụng là = Thu nhập - Chi tiêu - Số tiết kiệm)
  const currentBalance = totalAllIncome - totalAllExpense - savingsTiedAmount;
  
  document.getElementById("valCurrentBalance").innerText = formatCurrency(currentBalance);
  
  // Thu nhập & Chi tiêu tháng hiện tại
  let currentMonthIncome = 0;
  let currentMonthExpense = 0;
  
  transactions.forEach(t => {
    if (t.date.startsWith(currentMonthStr)) {
      if (t.type === "income") currentMonthIncome += t.amount;
      else if (t.type === "expense") currentMonthExpense += t.amount;
    }
  });

  document.getElementById("valTotalIncome").innerText = formatCurrency(currentMonthIncome);
  document.getElementById("valTotalExpense").innerText = formatCurrency(currentMonthExpense);

  // Tính phần trăm tăng trưởng so với tháng trước
  const prevMonthDate = new Date();
  prevMonthDate.setMonth(now.getMonth() - 1);
  const prevMonthStr = prevMonthDate.toISOString().substring(0, 7);

  let prevMonthIncome = 0;
  let prevMonthExpense = 0;

  transactions.forEach(t => {
    if (t.date.startsWith(prevMonthStr)) {
      if (t.type === "income") prevMonthIncome += t.amount;
      else if (t.type === "expense") prevMonthExpense += t.amount;
    }
  });

  updateKPITrend("trendIncome", currentMonthIncome, prevMonthIncome, true);
  updateKPITrend("trendExpense", currentMonthExpense, prevMonthExpense, false);

  // Hiển thị danh sách Giao dịch gần đây (tối đa 5 giao dịch)
  renderRecentTransactionsTable();

  // Hiển thị danh sách Ngân sách rút gọn ở Dashboard
  renderDashboardBudgets();

  // Vẽ biểu đồ
  renderDashboardCharts();
}

// Cập nhật xu hướng phần trăm cho thẻ KPI
function updateKPITrend(elementId, currentVal, prevVal, isIncome) {
  const trendEl = document.getElementById(elementId);
  
  if (prevVal === 0) {
    trendEl.className = "kpi-trend neutral";
    trendEl.innerHTML = `<i data-lucide="minus"></i> <span>Chưa có mốc tháng trước</span>`;
    lucide.createIcons();
    return;
  }

  const percentChange = ((currentVal - prevVal) / prevVal) * 100;
  const absPercent = Math.abs(percentChange).toFixed(1);

  if (percentChange > 0) {
    // Nếu là thu nhập tăng -> Tốt (xanh). Nếu chi tiêu tăng -> Cảnh báo (đỏ)
    trendEl.className = isIncome ? "kpi-trend up" : "kpi-trend down";
    trendEl.innerHTML = `<i data-lucide="arrow-up-right"></i> <span>Tăng ${absPercent}% so tháng trước</span>`;
  } else if (percentChange < 0) {
    // Thu nhập giảm -> Xấu (đỏ). Chi tiêu giảm -> Tốt (xanh)
    trendEl.className = isIncome ? "kpi-trend down" : "kpi-trend up";
    trendEl.innerHTML = `<i data-lucide="arrow-down-right"></i> <span>Giảm ${absPercent}% so tháng trước</span>`;
  } else {
    trendEl.className = "kpi-trend neutral";
    trendEl.innerHTML = `<i data-lucide="minus"></i> <span>Bằng với tháng trước</span>`;
  }
  
  lucide.createIcons();
}

function renderRecentTransactionsTable() {
  const listContainer = document.getElementById("recentTransactionsList");
  // Lấy 5 giao dịch mới nhất (sắp xếp giảm dần theo ngày)
  const recent = [...state.transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  if (recent.length === 0) {
    listContainer.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-dimmed);">Chưa có giao dịch ghi nhận. Bấm "Thêm giao dịch" để bắt đầu!</td></tr>`;
    return;
  }

  listContainer.innerHTML = recent.map(tx => {
    const cat = getCategoryById(tx.category);
    const sign = tx.type === "income" ? "+" : "-";
    const amountClass = tx.type === "income" ? "amount-plus" : "amount-minus";
    
    return `
      <tr>
        <td>
          <div class="tx-info-col">
            <div class="category-icon-bg" style="background-color: ${cat.color}">
              <i data-lucide="${cat.icon || 'tag'}"></i>
            </div>
            <div class="tx-name" title="${tx.notes || cat.name}">${tx.notes || cat.name}</div>
          </div>
        </td>
        <td><span class="tx-cat-label">${cat.name}</span></td>
        <td>${formatDateVN(tx.date)}</td>
        <td><span class="tx-amount-col ${amountClass}">${sign}${formatCurrency(tx.amount)}</span></td>
      </tr>
    `;
  }).join("");

  lucide.createIcons();
}

function renderDashboardBudgets() {
  const container = document.getElementById("dashboardBudgetList");
  
  if (state.budgets.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: var(--text-dimmed); font-size: 0.85rem; padding: 20px 0;">Không có giới hạn chi tiêu được thiết lập.</p>`;
    return;
  }

  const now = new Date();
  const currentMonthStr = now.toISOString().substring(0, 7);

  // Lấy tối đa 3 ngân sách để render rút gọn
  const miniList = state.budgets.slice(0, 3);

  container.innerHTML = miniList.map(budget => {
    const cat = getCategoryById(budget.category);
    
    // Tính tổng chi tiêu của danh mục này trong tháng hiện tại
    let totalSpent = 0;
    state.transactions.forEach(tx => {
      if (tx.type === "expense" && tx.category === budget.category && tx.date.startsWith(currentMonthStr)) {
        totalSpent += tx.amount;
      }
    });

    const percent = Math.min((totalSpent / budget.limit) * 100, 100);
    let barColor = "var(--success)";
    if (percent >= 100) barColor = "var(--danger)";
    else if (percent >= 80) barColor = "var(--warning)";

    return `
      <div class="mini-budget-item">
        <div class="mini-budget-header">
          <span class="mini-budget-name">${cat.name}</span>
          <span class="mini-budget-values">${formatCurrency(totalSpent)} / ${formatCurrency(budget.limit)}</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${percent}%; background-color: ${barColor};"></div>
        </div>
      </div>
    `;
  }).join("");
}

// Vẽ biểu đồ xu hướng và cơ cấu
function renderDashboardCharts() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const textColor = isDark ? "#94a3b8" : "#475569";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
  
  const period = parseInt(document.getElementById("chartPeriodSelect").value, 10);
  
  // Hủy biểu đồ cũ nếu đã tồn tại tránh lỗi đè canvas
  if (trendChartInstance) trendChartInstance.destroy();
  if (categoryChartInstance) categoryChartInstance.destroy();

  // --- 1. CHUẨN BỊ DỮ LIỆU BIỂU ĐỒ XU HƯỚNG THU CHỈ (BAR CHART) ---
  const monthsLabels = [];
  const incomeData = [];
  const expenseData = [];

  const now = new Date();
  
  for (let i = period - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(now.getMonth() - i);
    const monthKey = d.toISOString().substring(0, 7); // YYYY-MM
    const displayLabel = `Tháng ${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`;
    monthsLabels.push(displayLabel);
    
    // Tính tổng thu, chi trong tháng
    let inc = 0;
    let exp = 0;
    state.transactions.forEach(t => {
      if (t.date.startsWith(monthKey)) {
        if (t.type === "income") inc += t.amount;
        else if (t.type === "expense") exp += t.amount;
      }
    });
    
    incomeData.push(inc);
    expenseData.push(exp);
  }

  const ctxTrend = document.getElementById("trendChart").getContext("2d");
  trendChartInstance = new Chart(ctxTrend, {
    type: "bar",
    data: {
      labels: monthsLabels,
      datasets: [
        {
          label: "Thu nhập",
          data: incomeData,
          backgroundColor: isDark ? "rgba(16, 185, 129, 0.85)" : "#059669",
          borderRadius: 6,
          borderWidth: 0,
        },
        {
          label: "Chi tiêu",
          data: expenseData,
          backgroundColor: isDark ? "rgba(244, 63, 94, 0.85)" : "#e11d48",
          borderRadius: 6,
          borderWidth: 0,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor, font: { family: "Plus Jakarta Sans", weight: 600 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ` ${context.dataset.label}: ${formatCurrency(context.raw)}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor, font: { family: "Plus Jakarta Sans" } },
          grid: { display: false }
        },
        y: {
          ticks: {
            color: textColor,
            font: { family: "Plus Jakarta Sans" },
            callback: function(value) {
              if (value >= 1000000) return (value / 1000000) + "M";
              if (value >= 1000) return (value / 1000) + "k";
              return value;
            }
          },
          grid: { color: gridColor }
        }
      }
    }
  });

  // --- 2. CHUẨN BỊ DỮ LIỆU BIỂU ĐỒ CƠ CẤU CHI TIÊU (DONUT CHART) ---
  const currentMonthStr = now.toISOString().substring(0, 7);
  const expenseByCategory = {};
  
  state.transactions.forEach(t => {
    // Chỉ tính chi tiêu của tháng hiện tại
    if (t.type === "expense" && t.date.startsWith(currentMonthStr)) {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    }
  });

  const categoryIds = Object.keys(expenseByCategory);
  const hasExpenseData = categoryIds.length > 0;
  const noDataEl = document.getElementById("noChartData");

  if (!hasExpenseData) {
    noDataEl.classList.remove("hidden");
    return;
  } else {
    noDataEl.classList.add("hidden");
  }

  const chartLabels = [];
  const chartValues = [];
  const chartColors = [];

  categoryIds.forEach(catId => {
    const cat = getCategoryById(catId);
    chartLabels.push(cat.name);
    chartValues.push(expenseByCategory[catId]);
    chartColors.push(cat.color);
  });

  const ctxCategory = document.getElementById("categoryChart").getContext("2d");
  categoryChartInstance = new Chart(ctxCategory, {
    type: "doughnut",
    data: {
      labels: chartLabels,
      datasets: [{
        data: chartValues,
        backgroundColor: chartColors,
        borderWidth: isDark ? 2 : 1,
        borderColor: isDark ? "#0f172a" : "#fff",
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: textColor, font: { family: "Plus Jakarta Sans", size: 11, weight: 600 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.raw;
              const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
              const pct = ((val / total) * 100).toFixed(1);
              return ` ${context.label}: ${formatCurrency(val)} (${pct}%)`;
            }
          }
        }
      },
      cutout: "70%"
    }
  });
}

// Thiết lập chọn kỳ hạn ở dashboard để vẽ lại biểu đồ
document.getElementById("chartPeriodSelect").addEventListener("change", () => {
  renderDashboardCharts();
});

// ==========================================================================
// 5. QUẢN LÝ GIAO DỊCH (TAB TRANSACTIONS)
// ==========================================================================

function renderTransactionsTab() {
  // 1. Tải danh mục vào dropdown bộ lọc
  const filterCatDropdown = document.getElementById("filterCategory");
  const previousVal = filterCatDropdown.value;
  
  filterCatDropdown.innerHTML = `<option value="all">Tất cả danh mục</option>`;
  state.categories.forEach(cat => {
    filterCatDropdown.innerHTML += `<option value="${cat.id}">${cat.name} (${cat.type === 'income' ? 'Thu' : 'Chi'})</option>`;
  });
  
  // Giữ lại bộ lọc cũ nếu có
  if ([...filterCatDropdown.options].some(o => o.value === previousVal)) {
    filterCatDropdown.value = previousVal;
  }

  // 2. Thực hiện lọc danh sách giao dịch
  filterTransactions();
}

function filterTransactions() {
  const searchQuery = document.getElementById("filterSearch").value.toLowerCase().trim();
  const typeFilter = document.getElementById("filterType").value;
  const catFilter = document.getElementById("filterCategory").value;
  const dateRangeFilter = document.getElementById("filterDateRange").value;
  
  let filtered = [...state.transactions];

  // A. Lọc theo từ khoá ghi chú hoặc tên danh mục
  if (searchQuery) {
    filtered = filtered.filter(t => {
      const cat = getCategoryById(t.category);
      return (t.notes && t.notes.toLowerCase().includes(searchQuery)) || 
             cat.name.toLowerCase().includes(searchQuery);
    });
  }

  // B. Lọc theo loại (Thu/Chi)
  if (typeFilter !== "all") {
    filtered = filtered.filter(t => t.type === typeFilter);
  }

  // C. Lọc theo danh mục
  if (catFilter !== "all") {
    filtered = filtered.filter(t => t.category === catFilter);
  }

  // D. Lọc theo thời gian
  const now = new Date();
  if (dateRangeFilter === "thisMonth") {
    const monthKey = now.toISOString().substring(0, 7); // YYYY-MM
    filtered = filtered.filter(t => t.date.startsWith(monthKey));
  } else if (dateRangeFilter === "lastMonth") {
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(now.getMonth() - 1);
    const monthKey = lastMonthDate.toISOString().substring(0, 7);
    filtered = filtered.filter(t => t.date.startsWith(monthKey));
  } else if (dateRangeFilter === "last90") {
    const limitDate = new Date();
    limitDate.setDate(now.getDate() - 90);
    const limitDateStr = limitDate.toISOString().split("T")[0];
    filtered = filtered.filter(t => t.date >= limitDateStr);
  } else if (dateRangeFilter === "custom") {
    const startDate = document.getElementById("filterStartDate").value;
    const endDate = document.getElementById("filterEndDate").value;
    if (startDate) {
      filtered = filtered.filter(t => t.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(t => t.date <= endDate);
    }
  }

  // Sắp xếp các giao dịch: ngày mới nhất lên đầu
  filtered.sort((a, b) => b.date.localeCompare(a.date));

  // Lưu lại để dùng cho xuất file
  currentFilteredList = filtered;

  // Hiển thị giao diện danh sách
  displayTransactionsList(filtered);
}

function displayTransactionsList(list) {
  const container = document.getElementById("transactionTimeline");
  const noDataState = document.getElementById("noTransactionsState");
  
  // Tính tổng thu, chi của danh sách đã lọc
  let totalIncome = 0;
  let totalExpense = 0;
  
  list.forEach(t => {
    if (t.type === "income") totalIncome += t.amount;
    else if (t.type === "expense") totalExpense += t.amount;
  });

  document.getElementById("listSummaryIncome").innerText = `Thu: +${formatCurrency(totalIncome)}`;
  document.getElementById("listSummaryExpense").innerText = `Chi: -${formatCurrency(totalExpense)}`;

  if (list.length === 0) {
    container.innerHTML = "";
    noDataState.classList.remove("hidden");
    return;
  }

  noDataState.classList.add("hidden");

  // Gom nhóm giao dịch theo Ngày giao dịch
  const grouped = {};
  list.forEach(tx => {
    if (!grouped[tx.date]) grouped[tx.date] = [];
    grouped[tx.date].push(tx);
  });

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  container.innerHTML = sortedDates.map(dateStr => {
    const dateTxs = grouped[dateStr];
    
    // Tính tổng số tiền thu/chi của ngày đó để hiển thị trên header ngày
    let dayNet = 0;
    dateTxs.forEach(t => {
      if (t.type === "income") dayNet += t.amount;
      else dayNet -= t.amount;
    });

    const dayNetClass = dayNet >= 0 ? "amount-plus" : "amount-minus";
    const dayNetSign = dayNet >= 0 ? "+" : "-";
    const dayNetText = `${dayNetSign}${formatCurrency(Math.abs(dayNet))}`;

    const itemsHTML = dateTxs.map(tx => {
      const cat = getCategoryById(tx.category);
      const amountSign = tx.type === "income" ? "+" : "-";
      const amountClass = tx.type === "income" ? "amount-plus" : "amount-minus";

      return `
        <div class="timeline-item" data-id="${tx.id}">
          <div class="timeline-left">
            <div class="category-icon-bg" style="background-color: ${cat.color}">
              <i data-lucide="${cat.icon || 'tag'}"></i>
            </div>
            <div class="timeline-details">
              <div class="timeline-title" title="${tx.notes || cat.name}">${tx.notes || cat.name}</div>
              <div class="timeline-sub">
                <span>${cat.name}</span>
              </div>
            </div>
          </div>
          <div class="timeline-right">
            <div class="timeline-amount ${amountClass}">
              ${amountSign}${formatCurrency(tx.amount)}
            </div>
            <div class="timeline-actions">
              <button class="btn-icon-sm btn-edit-tx" title="Sửa giao dịch" onclick="openTransactionModal('${tx.id}')">
                <i data-lucide="edit-3"></i>
              </button>
              <button class="btn-icon-sm btn-delete-tx" title="Xoá giao dịch" onclick="deleteTransaction('${tx.id}')">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    return `
      <div class="timeline-group">
        <div class="timeline-date-header">
          <span>${formatDateVN(dateStr)}</span>
          <span class="${dayNetClass}">${dayNetText}</span>
        </div>
        ${itemsHTML}
      </div>
    `;
  }).join("");

  lucide.createIcons();
}

// Bắt các sự kiện thay đổi bộ lọc để tự động lọc lại
document.getElementById("filterSearch").addEventListener("input", filterTransactions);
document.getElementById("filterType").addEventListener("change", filterTransactions);
document.getElementById("filterCategory").addEventListener("change", filterTransactions);

document.getElementById("filterDateRange").addEventListener("change", (e) => {
  const customDatesWrapper = document.getElementById("filterCustomDatesContainer");
  if (e.target.value === "custom") {
    customDatesWrapper.classList.remove("hidden");
  } else {
    customDatesWrapper.classList.add("hidden");
    filterTransactions();
  }
});

document.getElementById("filterStartDate").addEventListener("change", filterTransactions);
document.getElementById("filterEndDate").addEventListener("change", filterTransactions);

// Đặt lại lọc
document.getElementById("btnClearFilters").addEventListener("click", () => {
  document.getElementById("filterSearch").value = "";
  document.getElementById("filterType").value = "all";
  document.getElementById("filterCategory").value = "all";
  document.getElementById("filterDateRange").value = "thisMonth";
  document.getElementById("filterCustomDatesContainer").classList.add("hidden");
  document.getElementById("filterStartDate").value = "";
  document.getElementById("filterEndDate").value = "";
  filterTransactions();
});

// Nút xem tất cả tại màn trống
document.getElementById("btnResetFiltersAndAdd").addEventListener("click", () => {
  document.getElementById("btnClearFilters").click();
});

// ==========================================================================
// 6. THÊM / SỬA / XÓA GIAO DỊCH (TRANSACTION CRUD LOGIC)
// ==========================================================================

// Biến lưu danh sách giao dịch đã lọc (để dùng cho xuất file)
let currentFilteredList = [];

// ==========================================================================
// 6a. XUẤT FILE CSV / EXCEL THEO BỘ LỌC
// ==========================================================================

function buildExportRows(list) {
  return list.map(tx => {
    const cat = getCategoryById(tx.category);
    return {
      "Ngày":        formatDateVN(tx.date),
      "Loại":        tx.type === "income" ? "Thu nhập" : "Chi tiêu",
      "Danh mục":    cat.name,
      "Số tiền (₫)": tx.amount,
      "Ghi chú":     tx.notes || ""
    };
  });
}

document.getElementById("btnExportCSV").addEventListener("click", () => {
  if (currentFilteredList.length === 0) {
    alert("Không có giao dịch nào để xuất.");
    return;
  }

  const rows = buildExportRows(currentFilteredList);
  const headers = Object.keys(rows[0]);

  const csvLines = [
    headers.join(","),
    ...rows.map(row =>
      headers.map(h => {
        const val = String(row[h]).replace(/"/g, '""');
        return `"${val}"`;
      }).join(",")
    )
  ];

  // Thêm BOM để Excel mở đúng tiếng Việt
  const blob = new Blob(["﻿" + csvLines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `GiaoDich_FinFlow_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

document.getElementById("btnExportExcel").addEventListener("click", () => {
  if (currentFilteredList.length === 0) {
    alert("Không có giao dịch nào để xuất.");
    return;
  }

  const rows = buildExportRows(currentFilteredList);
  const headers = Object.keys(rows[0]);

  // Tạo bảng HTML — Excel đọc được định dạng này trực tiếp
  const tableRows = [
    `<tr>${headers.map(h => `<th style="background:#4f46e5;color:#fff;font-weight:bold;padding:8px;">${h}</th>`).join("")}</tr>`,
    ...rows.map((row, i) => {
      const bg = i % 2 === 0 ? "#f8fafc" : "#ffffff";
      const isIncome = row["Loại"] === "Thu nhập";
      const amountColor = isIncome ? "#059669" : "#e11d48";
      return `<tr>${headers.map(h => {
        const isAmount = h === "Số tiền (₫)";
        const style = `background:${bg};padding:6px 10px;${isAmount ? `color:${amountColor};font-weight:bold;` : ""}`;
        const val = isAmount
          ? new Intl.NumberFormat("vi-VN").format(row[h])
          : row[h];
        return `<td style="${style}">${val}</td>`;
      }).join("")}</tr>`;
    })
  ];

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
    <x:Name>Giao Dịch</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
    </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
    <body><table border="1" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;">
    ${tableRows.join("")}</table></body></html>`;

  const blob = new Blob(["﻿" + html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `GiaoDich_FinFlow_${dateStr}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// Biến lưu trữ ID giao dịch đang chỉnh sửa (nếu có)
let editingTransactionId = null;

function openTransactionModal(txId = null) {
  const modal = document.getElementById("modalTransaction");
  const form = document.getElementById("formTransaction");
  const modalTitle = document.getElementById("modalTransactionTitle");
  
  form.reset();
  editingTransactionId = txId;
  
  // Tải danh mục vào form (chỉ tải danh mục tương ứng loại Thu/Chi đang chọn)
  updateTransactionCategorySelect();

  if (txId) {
    // Chế độ chỉnh sửa
    const tx = state.transactions.find(t => t.id === txId);
    if (!tx) return;

    modalTitle.innerText = "Chỉnh sửa giao dịch";
    
    // Đánh dấu nút Radio loại giao dịch
    if (tx.type === "income") {
      document.getElementById("txTypeIncome").checked = true;
    } else {
      document.getElementById("txTypeExpense").checked = true;
    }

    // Tải lại danh mục phù hợp loại vừa chọn
    updateTransactionCategorySelect();
    
    document.getElementById("txAmount").value = new Intl.NumberFormat("vi-VN").format(tx.amount);
    document.getElementById("txDate").value = tx.date;
    document.getElementById("txCategory").value = tx.category;
    document.getElementById("txNotes").value = tx.notes || "";
    document.getElementById("txId").value = tx.id;
  } else {
    // Chế độ thêm mới
    modalTitle.innerText = "Thêm giao dịch mới";
    document.getElementById("txTypeExpense").checked = true;
    updateTransactionCategorySelect();
    document.getElementById("txDate").value = getTodayDateString();
    document.getElementById("txId").value = "";
  }

  modal.classList.add("active");
}

function closeTransactionModal() {
  const modal = document.getElementById("modalTransaction");
  modal.classList.remove("active");
  editingTransactionId = null;
}

// Bắt sự kiện chuyển đổi loại Thu/Chi trong form giao dịch để lọc danh mục thích hợp
document.getElementById("txTypeExpense").addEventListener("change", updateTransactionCategorySelect);
document.getElementById("txTypeIncome").addEventListener("change", updateTransactionCategorySelect);

function updateTransactionCategorySelect() {
  const isExpense = document.getElementById("txTypeExpense").checked;
  const targetType = isExpense ? "expense" : "income";
  const catSelect = document.getElementById("txCategory");
  
  const filteredCats = state.categories.filter(c => c.type === targetType);
  
  catSelect.innerHTML = filteredCats.map(cat => {
    return `<option value="${cat.id}">${cat.name}</option>`;
  }).join("");
}

// Submit Form giao dịch
document.getElementById("formTransaction").addEventListener("submit", (e) => {
  e.preventDefault();
  
  const type = document.querySelector('input[name="txType"]:checked').value;
  const amount = parseCurrencyString(document.getElementById("txAmount").value);
  const date = document.getElementById("txDate").value;
  const category = document.getElementById("txCategory").value;
  const notes = document.getElementById("txNotes").value.trim();
  const txId = document.getElementById("txId").value;

  if (amount <= 0) {
    alert("Vui lòng nhập số tiền lớn hơn 0");
    return;
  }

  if (!category) {
    alert("Vui lòng lựa chọn một danh mục!");
    return;
  }

  if (txId) {
    // Cập nhật giao dịch cũ
    const idx = state.transactions.findIndex(t => t.id === txId);
    if (idx !== -1) {
      state.transactions[idx] = { id: txId, amount, type, category, date, notes };
    }
  } else {
    // Thêm giao dịch mới
    const newTx = {
      id: generateUniqueId("tx"),
      amount,
      type,
      category,
      date,
      notes
    };
    state.transactions.push(newTx);
    
    // Tự động kiểm tra xem chi tiêu này có làm vượt hạn mức ngân sách hay không
    if (type === "expense") {
      checkBudgetAlertOnAdd(category, amount);
    }
  }

  saveToStorage();
  closeTransactionModal();
  
  // Tải lại nội dung trang hiện tại
  const activeTabBtn = document.querySelector(".menu-item.active");
  const activeTab = activeTabBtn ? activeTabBtn.getAttribute("data-tab") : "dashboard";
  handleTabChange(activeTab);
  
  // Nếu đang ở màn khác, tự cập nhật lại số dư ở header
  renderDashboard();
});

// Kiểm tra nhanh ngân sách khi người dùng tạo giao dịch chi tiêu mới
function checkBudgetAlertOnAdd(catId, addedAmount) {
  const budget = state.budgets.find(b => b.category === catId);
  if (!budget) return;

  const now = new Date();
  const currentMonthStr = now.toISOString().substring(0, 7);
  
  // Tính tổng chi tiêu danh mục trong tháng hiện tại (không tính tiền vừa thêm để so sánh)
  let totalSpent = 0;
  state.transactions.forEach(t => {
    if (t.type === "expense" && t.category === catId && t.date.startsWith(currentMonthStr)) {
      totalSpent += t.amount;
    }
  });

  const cat = getCategoryById(catId);
  const percentAfter = (totalSpent / budget.limit) * 100;

  if (totalSpent > budget.limit) {
    alert(`⚠️ Cảnh báo: Bạn đã vượt quá hạn mức ngân sách danh mục "${cat.name}" của tháng này!\nĐã chi: ${formatCurrency(totalSpent)} / Hạn mức: ${formatCurrency(budget.limit)}`);
  } else if (percentAfter >= 80) {
    alert(`⚠️ Lưu ý: Bạn đã sử dụng ${percentAfter.toFixed(0)}% ngân sách danh mục "${cat.name}" của tháng này.\nĐã chi: ${formatCurrency(totalSpent)} / Hạn mức: ${formatCurrency(budget.limit)}`);
  }
}

// Xóa giao dịch
function deleteTransaction(txId) {
  if (confirm("Bạn có chắc chắn muốn xoá giao dịch này không?")) {
    state.transactions = state.transactions.filter(t => t.id !== txId);
    saveToStorage();
    
    // Refresh tab hiện tại
    const activeTab = document.querySelector(".menu-item.active").getAttribute("data-tab");
    handleTabChange(activeTab);
  }
}

// Liên kết các nút huỷ bỏ modal
document.getElementById("btnCancelTransaction").addEventListener("click", closeTransactionModal);
document.getElementById("btnCloseTransactionModal").addEventListener("click", closeTransactionModal);

// ==========================================================================
// 7. QUẢN LÝ NGÂN SÁCH (TAB BUDGETS)
// ==========================================================================

function renderBudgetsTab() {
  const container = document.getElementById("budgetsGrid");
  const noBudgetsState = document.getElementById("noBudgetsState");

  if (state.budgets.length === 0) {
    container.innerHTML = "";
    noBudgetsState.classList.remove("hidden");
    return;
  }

  noBudgetsState.classList.add("hidden");

  const now = new Date();
  const currentMonthStr = now.toISOString().substring(0, 7);

  container.innerHTML = state.budgets.map(budget => {
    const cat = getCategoryById(budget.category);
    
    // Tính số tiền đã chi tiêu tháng này
    let spent = 0;
    state.transactions.forEach(tx => {
      if (tx.type === "expense" && tx.category === budget.category && tx.date.startsWith(currentMonthStr)) {
        spent += tx.amount;
      }
    });

    const percent = Math.min((spent / budget.limit) * 100, 100);
    const percentText = ((spent / budget.limit) * 100).toFixed(0);

    let statusText = "An toàn";
    let statusClass = "status-success";
    let barColor = "var(--success)";

    if (spent > budget.limit) {
      statusText = "Vượt hạn mức";
      statusClass = "status-danger";
      barColor = "var(--danger)";
    } else if (percent >= 80) {
      statusText = "Sắp chạm hạn mức";
      statusClass = "status-warning";
      barColor = "var(--warning)";
    }

    return `
      <div class="card budget-card">
        <div class="budget-card-header">
          <div class="budget-info">
            <div class="category-icon-bg" style="background-color: ${cat.color}">
              <i data-lucide="${cat.icon || 'tag'}"></i>
            </div>
            <div>
              <div class="budget-title">${cat.name}</div>
              <div class="budget-count">Tháng này</div>
            </div>
          </div>
          <div class="budget-actions">
            <button class="btn-icon-sm" title="Sửa hạn mức" onclick="openBudgetModal('${budget.category}')">
              <i data-lucide="edit-2"></i>
            </button>
            <button class="btn-icon-sm" title="Xoá ngân sách" onclick="deleteBudget('${budget.category}')">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>

        <div class="budget-meta">
          <span class="budget-spending">${formatCurrency(spent)}</span>
          <span class="budget-limit">trên hạn mức ${formatCurrency(budget.limit)}</span>
        </div>

        <div class="progress-container">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${percent}%; background-color: ${barColor};"></div>
          </div>
          <div class="progress-label-row">
            <span class="${statusClass} budget-status-text">${statusText}</span>
            <span class="progress-percentage ${statusClass}">${percentText}%</span>
          </div>
        </div>
      </div>
    `;
  }).join("");

  lucide.createIcons();
}

// Mở modal Ngân sách
function openBudgetModal(catId = null) {
  const modal = document.getElementById("modalBudget");
  const form = document.getElementById("formBudget");
  const selectWrapper = document.getElementById("budgetCategorySelectWrapper");
  const staticWrapper = document.getElementById("budgetCategoryStaticWrapper");
  const selectEl = document.getElementById("budgetCategorySelect");
  
  form.reset();

  // Tạo danh sách các danh mục chi tiêu chưa có ngân sách thiết lập
  const usedCatIds = state.budgets.map(b => b.category);
  const expenseCats = state.categories.filter(c => c.type === "expense");
  
  if (catId) {
    // Chế độ chỉnh sửa ngân sách có sẵn
    const budget = state.budgets.find(b => b.category === catId);
    if (!budget) return;

    selectWrapper.classList.add("hidden");
    staticWrapper.classList.remove("hidden");
    
    const cat = getCategoryById(catId);
    document.getElementById("budgetCategoryStaticName").innerText = cat.name;
    document.getElementById("budgetCategory").value = catId;
    document.getElementById("budgetLimit").value = new Intl.NumberFormat("vi-VN").format(budget.limit);
    document.getElementById("modalBudgetTitle").innerText = "Chỉnh sửa ngân sách";
  } else {
    // Chế độ thêm ngân sách mới
    const availableCats = expenseCats.filter(c => !usedCatIds.includes(c.id));
    
    if (availableCats.length === 0) {
      alert("Tất cả danh mục chi tiêu đều đã được thiết lập ngân sách. Bạn chỉ có thể sửa hạn mức của chúng!");
      return;
    }

    selectWrapper.classList.remove("hidden");
    staticWrapper.classList.add("hidden");
    
    selectEl.innerHTML = availableCats.map(cat => {
      return `<option value="${cat.id}">${cat.name}</option>`;
    }).join("");

    document.getElementById("budgetCategory").value = "";
    document.getElementById("modalBudgetTitle").innerText = "Thiết lập ngân sách mới";
  }

  modal.classList.add("active");
}

function closeBudgetModal() {
  document.getElementById("modalBudget").classList.remove("active");
}

// Xóa ngân sách
function deleteBudget(catId) {
  if (confirm("Bạn có chắc chắn muốn xoá ngân sách của danh mục này không?")) {
    state.budgets = state.budgets.filter(b => b.category !== catId);
    saveToStorage();
    renderBudgetsTab();
  }
}

// Submit Form ngân sách
document.getElementById("formBudget").addEventListener("submit", (e) => {
  e.preventDefault();
  
  let catId = document.getElementById("budgetCategory").value;
  if (!catId) {
    catId = document.getElementById("budgetCategorySelect").value;
  }
  
  const limit = parseCurrencyString(document.getElementById("budgetLimit").value);

  if (limit <= 0) {
    alert("Vui lòng nhập hạn mức lớn hơn 0");
    return;
  }

  const existingIdx = state.budgets.findIndex(b => b.category === catId);
  if (existingIdx !== -1) {
    state.budgets[existingIdx].limit = limit;
  } else {
    state.budgets.push({ category: catId, limit });
  }

  saveToStorage();
  closeBudgetModal();
  renderBudgetsTab();
});

// Liên kết các nút điều khiển modal ngân sách
document.getElementById("btnCreateBudget").addEventListener("click", () => openBudgetModal());
document.getElementById("btnNoBudgetsCreate").addEventListener("click", () => openBudgetModal());
document.getElementById("btnCancelBudget").addEventListener("click", closeBudgetModal);
document.getElementById("btnCloseBudgetModal").addEventListener("click", closeBudgetModal);


// ==========================================================================
// 8. QUẢN LÝ MỤC TIÊU TIẾT KIỆM (TAB SAVINGS GOALS)
// ==========================================================================

function renderSavingsTab() {
  const container = document.getElementById("savingsGrid");
  const noSavingsState = document.getElementById("noSavingsState");

  if (state.savingsGoals.length === 0) {
    container.innerHTML = "";
    noSavingsState.classList.remove("hidden");
    return;
  }

  noSavingsState.classList.add("hidden");

  container.innerHTML = state.savingsGoals.map(goal => {
    const percent = Math.min((goal.current / goal.target) * 100, 100);
    const isCompleted = goal.current >= goal.target;
    
    let badgeHTML = `
      <div class="savings-badge">
        <i data-lucide="clock"></i>
        <span>Đang tích luỹ</span>
      </div>
    `;
    if (isCompleted) {
      badgeHTML = `
        <div class="savings-badge completed">
          <i data-lucide="check-circle2"></i>
          <span>Hoàn thành!</span>
        </div>
      `;
    }

    return `
      <div class="card savings-card" style="border-top: 4px solid ${goal.color || 'var(--primary)'}">
        <div class="savings-card-header">
          <div class="savings-info">
            <span class="savings-title">${goal.name}</span>
            <span class="savings-target">Mục tiêu: <strong>${formatCurrency(goal.target)}</strong></span>
          </div>
          ${badgeHTML}
        </div>

        <div class="savings-progress-wrapper">
          <span class="savings-current-amount">${formatCurrency(goal.current)}</span>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${percent}%; background-color: ${goal.color || 'var(--primary)'}"></div>
          </div>
          <div class="progress-label-row">
            <span class="savings-deadline-info">
              <i data-lucide="calendar"></i>
              <span>Hạn: ${goal.deadline ? formatDateVN(goal.deadline) : "Không giới hạn"}</span>
            </span>
            <span class="progress-percentage" style="color: ${goal.color || 'var(--primary)'}">${percent.toFixed(0)}%</span>
          </div>
        </div>

        <div class="savings-footer-actions">
          <button class="btn-primary-sm" onclick="openLogSavingsModal('${goal.id}', 'deposit')">
            <i data-lucide="plus"></i> Gửi thêm
          </button>
          <button class="btn-outline-secondary" onclick="openLogSavingsModal('${goal.id}', 'withdraw')">
            <i data-lucide="minus"></i> Rút tiền
          </button>
          <button class="btn-icon-sm" title="Sửa mục tiêu" onclick="openSavingsGoalModal('${goal.id}')">
            <i data-lucide="edit"></i>
          </button>
          <button class="btn-icon-sm" title="Xoá mục tiêu" onclick="deleteSavingsGoal('${goal.id}')">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
    `;
  }).join("");

  lucide.createIcons();
}

// Mở modal Mục tiêu tiết kiệm
function openSavingsGoalModal(goalId = null) {
  const modal = document.getElementById("modalSavingsGoal");
  const form = document.getElementById("formSavingsGoal");
  form.reset();

  if (goalId) {
    // Chỉnh sửa mục tiêu
    const goal = state.savingsGoals.find(g => g.id === goalId);
    if (!goal) return;

    document.getElementById("modalSavingsGoalTitle").innerText = "Chỉnh sửa mục tiêu tiết kiệm";
    document.getElementById("goalId").value = goal.id;
    document.getElementById("goalName").value = goal.name;
    document.getElementById("goalTarget").value = new Intl.NumberFormat("vi-VN").format(goal.target);
    document.getElementById("goalCurrent").value = new Intl.NumberFormat("vi-VN").format(goal.current);
    document.getElementById("goalCurrent").disabled = true; // Không cho phép sửa trực tiếp số tích luỹ từ form này, phải dùng gửi/rút
    document.getElementById("goalDeadline").value = goal.deadline || "";
    document.getElementById("goalColor").value = goal.color || "#6366f1";
  } else {
    // Thêm mới mục tiêu
    document.getElementById("modalSavingsGoalTitle").innerText = "Tạo mục tiêu tiết kiệm mới";
    document.getElementById("goalId").value = "";
    document.getElementById("goalCurrent").value = "0";
    document.getElementById("goalCurrent").disabled = false;
    document.getElementById("goalColor").value = "#6366f1";
  }

  modal.classList.add("active");
}

function closeSavingsGoalModal() {
  document.getElementById("modalSavingsGoal").classList.remove("active");
}

// Submit Form mục tiêu
document.getElementById("formSavingsGoal").addEventListener("submit", (e) => {
  e.preventDefault();

  const goalId = document.getElementById("goalId").value;
  const name = document.getElementById("goalName").value.trim();
  const target = parseCurrencyString(document.getElementById("goalTarget").value);
  const current = parseCurrencyString(document.getElementById("goalCurrent").value);
  const deadline = document.getElementById("goalDeadline").value;
  const color = document.getElementById("goalColor").value;

  if (target <= 0) {
    alert("Vui lòng nhập mục tiêu lớn hơn 0");
    return;
  }

  if (goalId) {
    // Cập nhật mục tiêu sẵn có
    const idx = state.savingsGoals.findIndex(g => g.id === goalId);
    if (idx !== -1) {
      state.savingsGoals[idx].name = name;
      state.savingsGoals[idx].target = target;
      state.savingsGoals[idx].deadline = deadline;
      state.savingsGoals[idx].color = color;
    }
  } else {
    // Thêm mục tiêu mới
    const newGoal = {
      id: generateUniqueId("goal"),
      name,
      target,
      current: current || 0,
      deadline,
      color,
      logs: current > 0 ? [{ amount: current, date: getTodayDateString(), type: "deposit", note: "Tiền tích lũy ban đầu" }] : []
    };
    state.savingsGoals.push(newGoal);
  }

  saveToStorage();
  closeSavingsGoalModal();
  renderSavingsTab();
});

// Xóa mục tiêu tiết kiệm
function deleteSavingsGoal(goalId) {
  if (confirm("Bạn có chắc chắn muốn xoá mục tiêu tiết kiệm này không? Dữ liệu tích lũy của mục tiêu này cũng sẽ bị xoá.")) {
    state.savingsGoals = state.savingsGoals.filter(g => g.id !== goalId);
    saveToStorage();
    renderSavingsTab();
  }
}

// Mở modal Nạp/Rút quỹ tiết kiệm
function openLogSavingsModal(goalId, logType = "deposit") {
  const goal = state.savingsGoals.find(g => g.id === goalId);
  if (!goal) return;

  const modal = document.getElementById("modalLogSavings");
  const form = document.getElementById("formLogSavings");
  form.reset();

  document.getElementById("logSavingsGoalId").value = goalId;
  document.getElementById("logSavingsType").value = logType;

  // Cập nhật thông tin mục tiêu lên thẻ tóm tắt trong modal
  document.getElementById("logSavingsGoalName").innerText = goal.name;
  document.getElementById("logSavingsGoalTarget").innerText = formatCurrency(goal.target);
  document.getElementById("logSavingsGoalCurrent").innerText = formatCurrency(goal.current);

  const titleEl = document.getElementById("modalLogSavingsTitle");
  const labelEl = document.getElementById("logSavingsAmountLabel");

  if (logType === "deposit") {
    titleEl.innerText = "Gửi thêm tiền tích luỹ";
    labelEl.innerText = "Số tiền muốn gửi thêm (đ) *";
  } else {
    titleEl.innerText = "Rút tiền tích luỹ";
    labelEl.innerText = "Số tiền muốn rút ra (đ) *";
  }

  modal.classList.add("active");
}

function closeLogSavingsModal() {
  document.getElementById("modalLogSavings").classList.remove("active");
}

// Submit nạp/rút tiết kiệm
document.getElementById("formLogSavings").addEventListener("submit", (e) => {
  e.preventDefault();

  const goalId = document.getElementById("logSavingsGoalId").value;
  const logType = document.getElementById("logSavingsType").value;
  const amount = parseCurrencyString(document.getElementById("logSavingsAmount").value);
  const note = document.getElementById("logSavingsNote").value.trim();

  if (amount <= 0) {
    alert("Vui lòng nhập số tiền hợp lệ");
    return;
  }

  const goalIdx = state.savingsGoals.findIndex(g => g.id === goalId);
  if (goalIdx === -1) return;

  const goal = state.savingsGoals[goalIdx];

  if (logType === "withdraw" && amount > goal.current) {
    alert("Số tiền rút vượt quá số tiền tích luỹ hiện tại!");
    return;
  }

  // Cập nhật số tiền tích lũy hiện có
  const oldCurrent = goal.current;
  if (logType === "deposit") {
    goal.current += amount;
  } else {
    goal.current -= amount;
  }

  // Ghi nhật ký logs
  goal.logs.push({
    amount,
    date: getTodayDateString(),
    type: logType,
    note: note || (logType === "deposit" ? "Gửi tích luỹ" : "Rút tiết kiệm")
  });

  saveToStorage();
  closeLogSavingsModal();
  renderSavingsTab();

  // Hiệu ứng pháo hoa Confetti khi tích lũy đạt 100% mục tiêu
  if (logType === "deposit" && oldCurrent < goal.target && goal.current >= goal.target) {
    triggerConfettiEffect();
  }
});

// Hiệu ứng pháo hoa khi hoàn thành mục tiêu
function triggerConfettiEffect() {
  if (typeof confetti === "function") {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  } else {
    alert("Chúc mừng! Bạn đã hoàn thành xuất sắc mục tiêu tài chính của mình! 🎉");
  }
}

// Đóng các modal tiết kiệm
document.getElementById("btnCreateSavingsGoal").addEventListener("click", () => openSavingsGoalModal());
document.getElementById("btnNoSavingsCreate").addEventListener("click", () => openSavingsGoalModal());
document.getElementById("btnCancelSavingsGoal").addEventListener("click", closeSavingsGoalModal);
document.getElementById("btnCloseSavingsGoalModal").addEventListener("click", closeSavingsGoalModal);
document.getElementById("btnCancelLogSavings").addEventListener("click", closeLogSavingsModal);
document.getElementById("btnCloseLogSavingsModal").addEventListener("click", closeLogSavingsModal);


// ==========================================================================
// 9. QUẢN LÝ CÀI ĐẶT & DANH MỤC (TAB SETTINGS)
// ==========================================================================

let activeCatTypeTab = "expense"; // 'expense' or 'income'

function renderSettingsTab() {
  // Tải thông tin user profile
  document.getElementById("settingsUserName").value = state.userProfile.name;
  
  // Render lưới chọn màu sắc khi tạo danh mục
  renderColorPickerGrid();

  // Render danh sách danh mục
  renderCategoriesSettingsList();
}

function renderColorPickerGrid() {
  const container = document.getElementById("colorPickerGrid");
  container.innerHTML = PRESET_COLORS.map(color => {
    const isSelected = color === selectedCategoryColor;
    return `
      <button type="button" class="color-picker-btn ${isSelected ? 'selected' : ''}" 
              style="background-color: ${color}" 
              onclick="selectNewCategoryColor('${color}')"></button>
    `;
  }).join("");
}

window.selectNewCategoryColor = function(color) {
  selectedCategoryColor = color;
  renderColorPickerGrid();
};

function renderCategoriesSettingsList() {
  const container = document.getElementById("categoryItemsList");
  const filtered = state.categories.filter(c => c.type === activeCatTypeTab);

  container.innerHTML = filtered.map(cat => {
    let actionHTML = `<span style="font-size: 0.75rem; color: var(--text-dimmed);">Mặc định</span>`;
    if (cat.isCustom) {
      actionHTML = `
        <button class="btn-icon-sm" title="Xoá danh mục" onclick="deleteCustomCategory('${cat.id}')">
          <i data-lucide="trash-2"></i>
        </button>
      `;
    }

    return `
      <div class="category-item">
        <div class="cat-info">
          <div class="cat-icon-pill" style="background-color: ${cat.color}">
            <i data-lucide="${cat.icon || 'tag'}"></i>
          </div>
          <span class="cat-name-label">${cat.name}</span>
        </div>
        <div>
          ${actionHTML}
        </div>
      </div>
    `;
  }).join("");

  lucide.createIcons();
}

// Bật tắt danh sách tab Chi tiêu / Thu nhập trong phần quản lý danh mục
document.getElementById("btnCatTabExpense").addEventListener("click", () => {
  activeCatTypeTab = "expense";
  document.getElementById("btnCatTabExpense").classList.add("active");
  document.getElementById("btnCatTabIncome").classList.remove("active");
  renderCategoriesSettingsList();
});

document.getElementById("btnCatTabIncome").addEventListener("click", () => {
  activeCatTypeTab = "income";
  document.getElementById("btnCatTabExpense").classList.remove("active");
  document.getElementById("btnCatTabIncome").classList.add("active");
  renderCategoriesSettingsList();
});

// Form lưu thông tin người dùng
document.getElementById("formUserProfile").addEventListener("submit", (e) => {
  e.preventDefault();
  const newName = document.getElementById("settingsUserName").value.trim();
  if (newName) {
    state.userProfile.name = newName;
    saveToStorage();
    
    // Cập nhật hiển thị tên ở góc dưới sidebar
    document.querySelector(".user-name").innerText = newName;
    document.getElementById("userAvatar").innerText = newName.charAt(0).toUpperCase();
    
    alert("Lưu thông tin tài khoản thành công!");
  }
});

// Form tạo danh mục mới
document.getElementById("formAddCategory").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("newCatName").value.trim();
  const type = document.getElementById("newCatType").value;
  const icon = document.getElementById("newCatIcon").value;
  const color = selectedCategoryColor;

  if (!name) return;

  // Kiểm tra tên danh mục trùng
  const duplicate = state.categories.find(c => c.name.toLowerCase() === name.toLowerCase() && c.type === type);
  if (duplicate) {
    alert("Danh mục này đã tồn tại!");
    return;
  }

  const newCat = {
    id: generateUniqueId("cat"),
    name,
    type,
    color,
    icon,
    isCustom: true
  };

  state.categories.push(newCat);
  saveToStorage();
  
  // Reset form
  document.getElementById("newCatName").value = "";
  
  // Reload danh sách
  renderCategoriesSettingsList();
  alert("Thêm danh mục mới thành công!");
});

// Xóa danh mục tự tạo
window.deleteCustomCategory = function(catId) {
  // Kiểm tra xem danh mục có đang được giao dịch nào sử dụng hay không
  const isUsedInTx = state.transactions.some(t => t.category === catId);
  const isUsedInBudget = state.budgets.some(b => b.category === catId);

  if (isUsedInTx || isUsedInBudget) {
    alert("Không thể xoá danh mục này vì đang có giao dịch hoặc ngân sách sử dụng danh mục này. Hãy đổi danh mục của các giao dịch trước.");
    return;
  }

  if (confirm("Bạn có chắc chắn muốn xoá danh mục tự tạo này không?")) {
    state.categories = state.categories.filter(c => c.id !== catId);
    saveToStorage();
    renderCategoriesSettingsList();
  }
};

// ==========================================================================
// 10. SAO LƯU & PHỤC HỒI DỮ LIỆU (BACKUP & RESTORE DATA)
// ==========================================================================

// Xuất file backup (.json)
document.getElementById("btnExportData").addEventListener("click", () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement("a");
  
  const todayStr = new Date().toISOString().split("T")[0];
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `FinFlow_Backup_${todayStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
});

// Nhập file backup (.json)
document.getElementById("importFile").addEventListener("change", (e) => {
  const fileReader = new FileReader();
  const file = e.target.files[0];
  
  if (!file) return;

  fileReader.onload = function(event) {
    try {
      const parsedData = JSON.parse(event.target.result);
      
      // Kiểm thử sơ bộ xem có đúng cấu trúc dữ liệu không
      if (parsedData.categories && parsedData.transactions) {
        if (confirm("Tải dữ liệu sao lưu mới sẽ ghi đè lên dữ liệu hiện tại của bạn. Bạn vẫn muốn tiếp tục chứ?")) {
          state = parsedData;
          saveToStorage();
          
          // Reset UI
          document.location.reload();
        }
      } else {
        alert("File không hợp lệ hoặc sai cấu trúc dữ liệu của FinFlow!");
      }
    } catch (err) {
      alert("Đã xảy ra lỗi khi đọc file. Hãy kiểm tra định dạng file!");
    }
  };

  fileReader.readAsText(file);
});

// Nút nạp dữ liệu trải nghiệm (Demo)
document.getElementById("btnLoadDemoData").addEventListener("click", () => {
  if (confirm("Thao tác này sẽ đặt lại và nạp dữ liệu mẫu chạy thử. Bạn có muốn thực hiện không?")) {
    localStorage.removeItem("finflow_state");
    loadFromStorage();
    document.location.reload();
  }
});

// Xóa sạch dữ liệu (Reset)
document.getElementById("btnClearData").addEventListener("click", () => {
  if (confirm("CẢNH BÁO: Hành động này sẽ xoá TOÀN BỘ lịch sử giao dịch, danh mục, ngân sách và mục tiêu của bạn về trạng thái ban đầu. Việc này không thể phục hồi! Bạn có chắc chắn muốn thực hiện?")) {
    localStorage.removeItem("finflow_state");
    initializeDefaults();
    document.location.reload();
  }
});


// ==========================================================================
// 11. KHỞI CHẠY ỨNG DỤNG (BOOTSTRAP)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Tải dữ liệu từ bộ nhớ
  loadFromStorage();
  
  // 2. Khởi tạo SPA router điều hướng
  initNavigation();
  
  // 3. Tự động định dạng gõ phím số tiền
  setupCurrencyInputAutoFormat(document.getElementById("txAmount"));
  setupCurrencyInputAutoFormat(document.getElementById("budgetLimit"));
  setupCurrencyInputAutoFormat(document.getElementById("goalTarget"));
  setupCurrencyInputAutoFormat(document.getElementById("goalCurrent"));
  setupCurrencyInputAutoFormat(document.getElementById("logSavingsAmount"));

  // 4. Đồng bộ thông tin Sidebar profile ban đầu
  document.querySelector(".user-name").innerText = state.userProfile.name;
  document.getElementById("userAvatar").innerText = state.userProfile.name.charAt(0).toUpperCase();

  // 5. Render nội dung trang Dashboard đầu tiên
  renderDashboard();
  
  // Khởi tạo toàn bộ icons của Lucide ban đầu
  lucide.createIcons();
});
