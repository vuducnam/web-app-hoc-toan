// Grade 5 curriculum seed data — Toán 5 Kết Nối Tri Thức
// 2 volumes, 12 topics, ~25 skills
// [gen] skills use generatorKey, [pool] skills use poolKey
// Key convention: g5-{slug}

import type { SeedGrade } from "./types";

export const grade5: SeedGrade = {
  key: "g5",
  name: "Lớp 5",
  volumes: [
    // -------------------------------------------------------------------------
    // TẬP 1 — Topics 1-6
    // -------------------------------------------------------------------------
    {
      order: 1,
      name: "Tập 1",
      topics: [
        // Topic 1: Ôn tập và bổ sung (Bài 1-9)
        {
          order: 1,
          nameVi: "Ôn tập và bổ sung",
          lessons: [
            {
              order: 1,
              nameVi: "Ôn tập số tự nhiên và phân số",
              skills: [
                {
                  key: "g5-natural-numbers-review",
                  nameVi: "Ôn tập số tự nhiên và phép tính",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 60,
                  generatorKey: "natural-numbers-review",
                },
                {
                  key: "g5-fractions-review",
                  nameVi: "Ôn tập phân số và hỗn số",
                  answerFormat: "FRACTION",
                  timeEstimateSec: 60,
                  generatorKey: "fractions-review",
                },
              ],
            },
            {
              order: 2,
              nameVi: "Ôn tập hình học",
              skills: [
                {
                  key: "g5-geometry-review",
                  nameVi: "Ôn tập hình học phẳng cơ bản",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 60,
                  generatorKey: "geometry-review",
                },
              ],
            },
          ],
        },

        // Topic 2: Số thập phân (Bài 10-14)
        {
          order: 2,
          nameVi: "Số thập phân",
          lessons: [
            {
              order: 1,
              nameVi: "Khái niệm số thập phân",
              skills: [
                {
                  key: "g5-decimal-concept",
                  nameVi: "Đọc viết số thập phân",
                  answerFormat: "DECIMAL",
                  timeEstimateSec: 45,
                  generatorKey: "decimal-concept",
                },
              ],
            },
            {
              order: 2,
              nameVi: "So sánh số thập phân",
              skills: [
                {
                  key: "g5-decimal-compare",
                  nameVi: "So sánh hai số thập phân",
                  answerFormat: "MULTIPLE_CHOICE",
                  timeEstimateSec: 45,
                  generatorKey: "decimal-compare",
                },
              ],
            },
            {
              order: 3,
              nameVi: "Làm tròn số thập phân",
              skills: [
                {
                  key: "g5-decimal-rounding",
                  nameVi: "Làm tròn số thập phân đến hàng phần mười, phần trăm",
                  answerFormat: "DECIMAL",
                  timeEstimateSec: 45,
                  generatorKey: "decimal-rounding",
                },
              ],
            },
          ],
        },

        // Topic 3: Một số đơn vị đo diện tích (Bài 15-17)
        {
          order: 3,
          nameVi: "Một số đơn vị đo diện tích",
          lessons: [
            {
              order: 1,
              nameVi: "Ki-lô-mét vuông và héc-ta",
              skills: [
                {
                  key: "g5-area-unit-conversion",
                  nameVi: "Đổi đơn vị đo diện tích km², ha, m²",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 60,
                  generatorKey: "area-unit-conversion",
                },
              ],
            },
          ],
        },

        // Topic 4: Các phép tính với số thập phân (Bài 18-24)
        {
          order: 4,
          nameVi: "Các phép tính với số thập phân",
          lessons: [
            {
              order: 1,
              nameVi: "Cộng và trừ số thập phân",
              skills: [
                {
                  key: "g5-decimal-add",
                  nameVi: "Cộng hai số thập phân",
                  answerFormat: "DECIMAL",
                  timeEstimateSec: 60,
                  generatorKey: "decimal-add",
                },
                {
                  key: "g5-decimal-subtract",
                  nameVi: "Trừ hai số thập phân",
                  answerFormat: "DECIMAL",
                  timeEstimateSec: 60,
                  generatorKey: "decimal-subtract",
                },
              ],
            },
            {
              order: 2,
              nameVi: "Nhân số thập phân",
              skills: [
                {
                  key: "g5-decimal-multiply",
                  nameVi: "Nhân số thập phân với số tự nhiên và số thập phân",
                  answerFormat: "DECIMAL",
                  timeEstimateSec: 75,
                  generatorKey: "decimal-multiply",
                },
              ],
            },
            {
              order: 3,
              nameVi: "Chia số thập phân",
              skills: [
                {
                  key: "g5-decimal-divide",
                  nameVi: "Chia số thập phân cho số tự nhiên và số thập phân",
                  answerFormat: "DECIMAL",
                  timeEstimateSec: 90,
                  generatorKey: "decimal-divide",
                },
              ],
            },
            {
              order: 4,
              nameVi: "Nhân và chia số thập phân với 10, 100, 0.1, 0.01",
              skills: [
                {
                  key: "g5-decimal-powers-10",
                  nameVi: "Nhân chia số thập phân với 10, 100, 0.1, 0.01",
                  answerFormat: "DECIMAL",
                  timeEstimateSec: 30,
                  generatorKey: "decimal-powers-10",
                },
              ],
            },
          ],
        },

        // Topic 5: Một số hình phẳng, chu vi và diện tích (Bài 25-29)
        {
          order: 5,
          nameVi: "Một số hình phẳng, chu vi và diện tích",
          lessons: [
            {
              order: 1,
              nameVi: "Diện tích hình tam giác",
              skills: [
                {
                  key: "g5-triangle-area",
                  nameVi: "Tính diện tích hình tam giác",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 75,
                  generatorKey: "triangle-area",
                },
              ],
            },
            {
              order: 2,
              nameVi: "Diện tích hình thang",
              skills: [
                {
                  key: "g5-trapezoid-area",
                  nameVi: "Tính diện tích hình thang",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 75,
                  generatorKey: "trapezoid-area",
                },
              ],
            },
            {
              order: 3,
              nameVi: "Chu vi và diện tích hình tròn",
              skills: [
                {
                  key: "g5-circle-circumference-area",
                  nameVi: "Tính chu vi và diện tích hình tròn",
                  answerFormat: "DECIMAL",
                  timeEstimateSec: 90,
                  generatorKey: "circle-circumference-area",
                },
              ],
            },
          ],
        },

        // Topic 6: Ôn tập học kì 1
        {
          order: 6,
          nameVi: "Ôn tập học kì 1",
          lessons: [
            {
              order: 1,
              nameVi: "Ôn tập số thập phân và phép tính",
              skills: [
                {
                  key: "g5-semester1-review",
                  nameVi: "Ôn tập tổng hợp số thập phân học kì 1",
                  answerFormat: "DECIMAL",
                  timeEstimateSec: 90,
                  generatorKey: "semester1-review-decimals",
                },
              ],
            },
          ],
        },
      ],
    },

    // -------------------------------------------------------------------------
    // TẬP 2 — Topics 7-12
    // -------------------------------------------------------------------------
    {
      order: 2,
      name: "Tập 2",
      topics: [
        // Topic 7: Tỉ số và các bài toán liên quan (Bài 30-36)
        {
          order: 7,
          nameVi: "Tỉ số và các bài toán liên quan",
          lessons: [
            {
              order: 1,
              nameVi: "Tỉ số và tỉ số phần trăm",
              skills: [
                {
                  key: "g5-ratio-concept",
                  nameVi: "Khái niệm tỉ số và bài toán tỉ số",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 75,
                  generatorKey: "ratio-concept",
                },
                {
                  key: "g5-percent-of-whole",
                  nameVi: "Tính tỉ số phần trăm của một số",
                  answerFormat: "DECIMAL",
                  timeEstimateSec: 60,
                  generatorKey: "percent-of-whole",
                },
              ],
            },
            {
              order: 2,
              nameVi: "Bài toán liên quan đến tỉ số",
              skills: [
                {
                  key: "g5-ratio-word-problems",
                  nameVi: "Giải bài toán có liên quan đến tỉ số",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 90,
                  generatorKey: "ratio-word-problems",
                },
              ],
            },
          ],
        },

        // Topic 8: Thể tích (Bài 37-40)
        {
          order: 8,
          nameVi: "Thể tích",
          lessons: [
            {
              order: 1,
              nameVi: "Khái niệm thể tích — cm³ và m³",
              skills: [
                {
                  key: "g5-volume-units",
                  nameVi: "Đơn vị đo thể tích cm³, dm³, m³",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 45,
                  generatorKey: "volume-units",
                },
              ],
            },
            {
              order: 2,
              nameVi: "Thể tích hình hộp chữ nhật",
              skills: [
                {
                  key: "g5-rectangular-prism-volume",
                  nameVi: "Tính thể tích hình hộp chữ nhật",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 75,
                  generatorKey: "rectangular-prism-volume",
                },
              ],
            },
          ],
        },

        // Topic 9: Diện tích và thể tích hình khối (Bài 41-44)
        {
          order: 9,
          nameVi: "Diện tích và thể tích hình khối",
          lessons: [
            {
              order: 1,
              nameVi: "Diện tích toàn phần hình hộp chữ nhật",
              skills: [
                {
                  key: "g5-box-surface-area",
                  nameVi: "Tính diện tích toàn phần hình hộp chữ nhật",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 90,
                  generatorKey: "box-surface-area",
                },
              ],
            },
            {
              order: 2,
              nameVi: "Thể tích hình lăng trụ và hình trụ",
              skills: [
                {
                  key: "g5-cylinder-volume",
                  nameVi: "Tính thể tích hình trụ đơn giản",
                  answerFormat: "DECIMAL",
                  timeEstimateSec: 90,
                  generatorKey: "cylinder-volume",
                },
              ],
            },
          ],
        },

        // Topic 10: Số đo thời gian và vận tốc (Bài 45-48)
        {
          order: 10,
          nameVi: "Số đo thời gian và vận tốc",
          lessons: [
            {
              order: 1,
              nameVi: "Số đo thời gian",
              skills: [
                {
                  key: "g5-time-measurement",
                  nameVi: "Đổi đơn vị đo thời gian — giờ, phút, giây",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 60,
                  generatorKey: "time-measurement",
                },
              ],
            },
            {
              order: 2,
              nameVi: "Vận tốc, quãng đường, thời gian",
              skills: [
                {
                  key: "g5-speed-distance-time",
                  nameVi: "Tính vận tốc, quãng đường, thời gian",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 90,
                  generatorKey: "speed-distance-time",
                },
              ],
            },
          ],
        },

        // Topic 11: Thống kê (Bài 49-51)
        {
          order: 11,
          nameVi: "Thống kê",
          lessons: [
            {
              order: 1,
              nameVi: "Bảng số liệu và biểu đồ",
              skills: [
                {
                  key: "g5-data-tables-graphs",
                  nameVi: "Đọc và phân tích bảng số liệu, biểu đồ",
                  answerFormat: "MULTIPLE_CHOICE",
                  timeEstimateSec: 90,
                  poolKey: "data-tables-graphs",
                },
              ],
            },
          ],
        },

        // Topic 12: Ôn tập cuối năm (Bài 52-59)
        {
          order: 12,
          nameVi: "Ôn tập cuối năm",
          lessons: [
            {
              order: 1,
              nameVi: "Ôn tập toàn bộ chương trình",
              skills: [
                {
                  key: "g5-year-review-comprehensive",
                  nameVi: "Ôn tập tổng hợp cuối năm lớp 5",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 90,
                  generatorKey: "year-review-comprehensive",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
