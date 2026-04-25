# UX Decisions & Gap Analysis

Tài liệu này tóm tắt các quyết định UX/UI đã implement trong scaffold và những gap còn lại.

## Triết lý UX

### 3 nguyên tắc cốt lõi (student side)

1. **Celebration asymmetric** — làm đúng có confetti nhỏ, thăng hạng có confetti to + banner + animation `bounce-in`; làm sai có shake nhẹ + Mascot buồn, **KHÔNG** có negative reinforcement kiểu "Sai rồi!"
2. **Encouraging copy random** — "Tuyệt vời!" / "Siêu sao!" / "Giỏi quá!" pool 6 câu khen; "Chưa đúng — thử lại nhé" pool 4 câu động viên. Không bao giờ HS đọc 1 câu 2 lần liên tiếp.
3. **Mascot là nhân vật chính** — Mimi (mèo vàng) có 6 emotion states: `idle`, `happy`, `excited`, `thinking`, `sad`, `cheering`. Xuất hiện ở header, dashboard greeting, practice side panel, feedback card, summary screen. SVG inline → không cần asset.

### 2 nguyên tắc cốt lõi (parent side)

1. **Khác hẳn student visually** — không mascot, không chunky button, không màu rực. Flat, nghiêm túc, data-first.
2. **Actionable over descriptive** — không chỉ show số, mà luôn kèm nhận định: "Đánh giá: Tốt (72/100). Nên tập trung vào kỹ năng ở mục Điểm yếu". Composite rating 0-100 từ 4 yếu tố (accuracy 40%, streak 20%, consistency 20%, mastery 20%).

## Design tokens mới

| Token | Giá trị | Mục đích |
|-------|---------|----------|
| `brand-500` | `#0cbbab` (teal) | Chính — tươi, không corporate |
| `sun-500` | `#f0b429` (vàng) | CTA, XP, streak |
| `coral-500` | `#ff3366` (hồng) | Celebration, energy |
| `tier-bronze/silver/gold` | cam/xám/vàng | Hệ thống huy chương mastery |
| Font display | Fredoka | HS-facing, chunky, vui |
| Font body | Nunito | Đọc thoải mái |
| Shadow | `chunky` (0 5px 0 0) | Game-style, tactile |
| Button active | `translate-y-[3px]` | Cảm giác "bấm xuống" vật lý |
