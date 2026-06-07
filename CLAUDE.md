# CLAUDE.md — FinFlow (Thu và Chi)

## Tổng quan dự án

**FinFlow** là ứng dụng quản lý tài chính cá nhân chạy thuần trên trình duyệt (Single Page Application), không có backend hay server. Giao diện hiển thị tiếng Việt, dữ liệu lưu trong `localStorage` của trình duyệt.

- **Tên hiển thị:** Thu và Chi
- **Người dùng mặc định:** Hải TM
- **Chạy bằng cách:** Mở `index.html` trực tiếp trên trình duyệt (double-click hoặc dùng Live Server)
- **Không cần:** Node.js, npm, build tool, hay bất kỳ server nào

---

## Cấu trúc file

```
ChiTieu_Project/
├── index.html     — Toàn bộ HTML giao diện (SPA, ~30 KB)
├── app.js         — Toàn bộ logic JavaScript (~71 KB)
├── style.css      — Toàn bộ CSS (dark/light theme, ~35 KB)
└── CLAUDE.md      — File này
```

Dự án **không dùng module hệ thống** (không có import/export). Tất cả hàm và biến đều là global scope.

---

## Kiến trúc & luồng dữ liệu

### State toàn cục (`app.js:6`)
```js
let state = {
  transactions: [],   // Giao dịch thu/chi
  categories: [],     // Danh mục (mặc định + tự tạo)
  budgets: [],        // Hạn mức ngân sách theo danh mục
  savingsGoals: [],   // Mục tiêu tiết kiệm
  userProfile: { name: "Hải TM" }
};
```

### Vòng đời dữ liệu
```
Khởi động → loadFromStorage() → state được nạp từ localStorage (key: "finflow_state")
                ↓ (nếu chưa có dữ liệu)
           initializeDefaults() + loadMockData()  ← dữ liệu mẫu demo

Thay đổi state → saveToStorage() → JSON.stringify(state) → localStorage
```

### SPA Navigation (`app.js:275`)
- 5 tab: `dashboard`, `transactions`, `budgets`, `savings`, `settings`
- Chuyển tab gọi `handleTabChange(tabName)` → render lại nội dung tab tương ứng
- Không có URL routing, chỉ show/hide các `<section class="content-section">`

---

## Các module chức năng trong `app.js`

| Section | Dòng | Chức năng |
|---------|------|-----------|
| **1. Data Layer** | 51–203 | `saveToStorage`, `loadFromStorage`, `loadMockData` |
| **2. Utilities** | 206–269 | `formatCurrency`, `parseCurrencyString`, `formatDateVN`, `generateUniqueId` |
| **3. Navigation** | 273–397 | `initNavigation`, `handleTabChange`, dark/light theme toggle |
| **4. Dashboard** | 400–754 | KPI cards, biểu đồ xu hướng (bar), biểu đồ cơ cấu chi (donut) |
| **5. Transactions list** | 757–968 | Lọc, tìm kiếm, hiển thị timeline theo ngày |
| **6. Transaction CRUD** | 970–1141 | Modal thêm/sửa/xóa giao dịch, cảnh báo vượt ngân sách |
| **7. Budgets** | 1143–1328 | Ngân sách theo danh mục, progress bar, CRUD |
| **8. Savings Goals** | 1330–1619 | Mục tiêu tiết kiệm, gửi/rút tiền, confetti effect |
| **9. Settings** | 1621–1773 | Hồ sơ người dùng, quản lý danh mục (thêm/xóa custom) |
| **10. Backup/Restore** | 1775–1839 | Export JSON, Import JSON, Reset, Load demo |
| **11. Bootstrap** | 1843–1869 | `DOMContentLoaded`: load data → init nav → render dashboard |

---

## Cấu trúc dữ liệu chính

### Transaction
```js
{
  id: "tx_...",         // generateUniqueId("tx")
  amount: 650000,       // Số nguyên, đơn vị VNĐ
  type: "expense",      // "expense" | "income"
  category: "cat_food", // ID danh mục
  date: "2026-06-05",   // YYYY-MM-DD
  notes: "Ghi chú..."   // Có thể rỗng
}
```

### Category
```js
{
  id: "cat_food",       // Mặc định: "cat_xxx"; Tự tạo: generateUniqueId("cat")
  name: "Ăn uống",
  type: "expense",      // "expense" | "income"
  color: "#f43f5e",     // Hex color
  icon: "utensils",     // Tên icon Lucide
  isCustom: false       // true = người dùng tự tạo, có thể xóa
}
```

### Budget
```js
{
  category: "cat_food", // Khóa ngoại tới category.id
  limit: 3000000        // Hạn mức VNĐ/tháng
}
```

### SavingsGoal
```js
{
  id: "goal_...",
  name: "Tên mục tiêu",
  target: 28000000,     // Mục tiêu tổng
  current: 12000000,    // Số đã tích lũy
  deadline: "2026-12-01",
  color: "#6366f1",
  logs: [               // Lịch sử gửi/rút
    { amount, date, type: "deposit"|"withdraw", note }
  ]
}
```

---

## CSS & Design System (`style.css`)

### Theme
- **Dark** (mặc định): nền `#0f172a–#020617`, text `#f8fafc`
- **Light**: nền `#f1f5f9–#e2e8f0`, text `#0f172a`
- Chuyển theme bằng `data-theme="dark|light"` trên `<html>`
- Theme được lưu vào `localStorage` key: `"finflow_theme"`

### CSS Variables quan trọng
```css
--primary: #6366f1       /* Màu chủ đạo (Indigo) */
--success: #10b981       /* Thu nhập, an toàn (Emerald) */
--danger:  #f43f5e       /* Chi tiêu, nguy hiểm (Rose) */
--warning: #f59e0b       /* Cảnh báo gần hạn (Amber) */
--panel-bg               /* Nền card/sidebar (glassmorphism) */
--sidebar-width: 280px   /* 0px trên mobile (<1024px) */
```

### Glassmorphism pattern
Mọi card/panel đều dùng:
```css
background: var(--panel-bg);
backdrop-filter: blur(16px);
border: 1px solid var(--panel-border);
border-radius: var(--radius-lg);  /* 20px */
```

### Responsive breakpoints
- `≤1024px`: Sidebar ẩn, hiện hamburger, grid về 1 cột
- `≤640px`: Ẩn search bar, ẩn text nút Thêm, form 1 cột

---

## Thư viện bên ngoài (CDN, không cần cài)

| Thư viện | Mục đích |
|----------|---------|
| `lucide@latest` | Icon toàn bộ UI — gọi `lucide.createIcons()` sau khi inject HTML |
| `chart.js` | Biểu đồ bar (xu hướng) và doughnut (cơ cấu chi) |
| `canvas-confetti@1.6.0` | Hiệu ứng pháo hoa khi hoàn thành mục tiêu tiết kiệm |
| `Plus Jakarta Sans` | Font chữ (Google Fonts) |

**Lưu ý quan trọng:** Sau mỗi lần `innerHTML` được cập nhật có chứa icon Lucide, **bắt buộc** phải gọi lại `lucide.createIcons()` để icon hiển thị.

---

## Quy ước khi phát triển thêm

### Thêm tab mới
1. Thêm nút `<button class="menu-item" data-tab="ten-tab">` vào sidebar trong `index.html`
2. Thêm `<section id="secTenTab" class="content-section">` vào `index.html`
3. Thêm `else if (tabName === "ten-tab") { renderTenTab(); }` vào `handleTabChange()` trong `app.js`

### Thêm trường dữ liệu mới vào state
- Luôn khởi tạo trong `initializeDefaults()` để tránh lỗi khi load từ localStorage cũ
- Thêm guard check vào `loadFromStorage()` (kiểu `if (!state.field) state.field = []`)

### Định dạng tiền tệ
- **Hiển thị:** `formatCurrency(number)` → `"1.500.000 ₫"`
- **Nhập liệu:** `setupCurrencyInputAutoFormat(inputElement)` → tự định dạng dấu chấm khi gõ
- **Parse:** `parseCurrencyString(str)` → số nguyên

### Tạo Modal mới
Dùng cấu trúc HTML:
```html
<div class="modal-backdrop" id="modalTen">
  <div class="modal-card">
    <div class="modal-header">...</div>
    <div class="modal-body">...</div>
    <div class="modal-footer">...</div>
  </div>
</div>
```
Mở: `modal.classList.add("active")` — Đóng: `modal.classList.remove("active")`

---

## Các hàm tiện ích cần nhớ

```js
formatCurrency(number)              // VNĐ format: "1.500.000 ₫"
parseCurrencyString(str)            // "1.500.000" → 1500000
formatDateVN(dateString)            // "2026-06-05" → "05/06/2026"
getTodayDateString()                // → "2026-06-05" (YYYY-MM-DD cho input date)
generateUniqueId("prefix")          // → "prefix_1749123456789_abc123xyz"
getCategoryById(catId)              // → category object (trả về fallback nếu không tìm thấy)
saveToStorage()                     // Lưu state vào localStorage ngay lập tức
```

---

## Điểm cần chú ý khi sửa code

- **Không có bundler** — tất cả thay đổi có hiệu lực ngay sau khi tải lại trang
- **Chart.js instances** (`trendChartInstance`, `categoryChartInstance`) phải `.destroy()` trước khi vẽ lại để tránh lỗi canvas đè nhau
- **Số dư hiển thị** ở Dashboard = Tổng thu - Tổng chi - Tổng tiền gửi vào heo đất (savings goals)
- **Ngân sách** chỉ áp dụng cho danh mục `type: "expense"`, tính theo tháng hiện tại
- **Danh mục mặc định** (`isCustom: false`) không thể xóa; chỉ danh mục tự tạo (`isCustom: true`) mới xóa được
- **Xóa danh mục** sẽ bị chặn nếu danh mục đó đang được dùng trong transaction hoặc budget
