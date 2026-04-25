// Grade 4 curriculum seed data — Toán 4 Kết Nối Tri Thức
// 2 volumes, 13 topics, ~35 skills
// [gen] skills use generatorKey, [pool] skills use poolKey
// Key convention: g4-{slug}

import type { SeedGrade } from "./types";

export const grade4: SeedGrade = {
  key: "g4",
  name: "Lớp 4",
  volumes: [
    // -------------------------------------------------------------------------
    // TẬP 1 — Topics 1-7
    // -------------------------------------------------------------------------
    {
      order: 1,
      name: "Tập 1",
      topics: [
        // Topic 1: Ôn tập và bổ sung (Bài 1-6)
        {
          order: 1,
          nameVi: "Ôn tập và bổ sung",
          lessons: [
            {
              order: 1,
              nameVi: "Số tự nhiên đến 100 000",
              skills: [
                {
                  key: "g4-numbers-to-100k",
                  nameVi: "Đọc, viết số đến 100 000",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 45,
                  generatorKey: "numbers-to-100k",
                },
              ],
            },
            {
              order: 2,
              nameVi: "Cộng và trừ trong phạm vi 100 000",
              skills: [
                {
                  key: "g4-add-sub-100k-carry",
                  nameVi: "Cộng trừ có nhớ trong phạm vi 100 000",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 60,
                  generatorKey: "add-sub-100k-carry",
                },
              ],
            },
            {
              order: 3,
              nameVi: "Số chẵn, số lẻ",
              skills: [
                {
                  key: "g4-even-odd",
                  nameVi: "Nhận biết số chẵn, số lẻ",
                  answerFormat: "MULTIPLE_CHOICE",
                  timeEstimateSec: 30,
                  generatorKey: "even-odd",
                },
              ],
            },
          ],
        },

        // Topic 2: Góc và đơn vị đo góc (Bài 7-9)
        {
          order: 2,
          nameVi: "Góc và đơn vị đo góc",
          lessons: [
            {
              order: 1,
              nameVi: "Đo góc bằng thước đo góc",
              skills: [
                {
                  key: "g4-angle-measure",
                  nameVi: "Đo và đọc số đo góc",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 60,
                  poolKey: "angle-measure",
                },
                {
                  key: "g4-angle-classify",
                  nameVi: "Phân loại góc nhọn, góc vuông, góc tù",
                  answerFormat: "MULTIPLE_CHOICE",
                  timeEstimateSec: 45,
                  poolKey: "angle-classify",
                },
              ],
            },
          ],
        },

        // Topic 3: Số có nhiều chữ số (Bài 10-14)
        {
          order: 3,
          nameVi: "Số có nhiều chữ số",
          lessons: [
            {
              order: 1,
              nameVi: "Đọc, viết số có nhiều chữ số (đến 6 chữ số)",
              skills: [
                {
                  key: "g4-6-digit-numbers",
                  nameVi: "Đọc viết số có 6 chữ số",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 45,
                  generatorKey: "6-digit-numbers",
                },
              ],
            },
            {
              order: 2,
              nameVi: "Hàng và lớp — giá trị chữ số",
              skills: [
                {
                  key: "g4-place-value-6digit",
                  nameVi: "Xác định giá trị chữ số theo hàng",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 45,
                  generatorKey: "place-value-6digit",
                },
              ],
            },
            {
              order: 3,
              nameVi: "Làm tròn số",
              skills: [
                {
                  key: "g4-rounding",
                  nameVi: "Làm tròn số đến hàng chục, trăm, nghìn",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 45,
                  generatorKey: "rounding",
                },
              ],
            },
          ],
        },

        // Topic 4: Một số đơn vị đo đại lượng (Bài 15-21)
        {
          order: 4,
          nameVi: "Một số đơn vị đo đại lượng",
          lessons: [
            {
              order: 1,
              nameVi: "Đơn vị đo độ dài — km, m, cm, mm",
              skills: [
                {
                  key: "g4-length-conversion",
                  nameVi: "Đổi đơn vị đo độ dài",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 60,
                  generatorKey: "length-conversion",
                },
              ],
            },
            {
              order: 2,
              nameVi: "Đơn vị đo khối lượng — kg, g, tạ, tấn",
              skills: [
                {
                  key: "g4-mass-conversion",
                  nameVi: "Đổi đơn vị đo khối lượng",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 60,
                  generatorKey: "mass-conversion",
                },
              ],
            },
            {
              order: 3,
              nameVi: "Đơn vị đo dung tích — lít, ml",
              skills: [
                {
                  key: "g4-capacity-conversion",
                  nameVi: "Đổi đơn vị đo dung tích",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 60,
                  generatorKey: "capacity-conversion",
                },
              ],
            },
          ],
        },

        // Topic 5: Phép cộng và phép trừ (Bài 22-26)
        {
          order: 5,
          nameVi: "Phép cộng và phép trừ",
          lessons: [
            {
              order: 1,
              nameVi: "Cộng số có 5 chữ số trở lên",
              skills: [
                {
                  key: "g4-add-large-numbers",
                  nameVi: "Cộng số có 5 chữ số trở lên",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 60,
                  generatorKey: "add-large-numbers",
                },
              ],
            },
            {
              order: 2,
              nameVi: "Trừ số có 5 chữ số trở lên",
              skills: [
                {
                  key: "g4-sub-large-numbers",
                  nameVi: "Trừ số có 5 chữ số trở lên",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 60,
                  generatorKey: "sub-large-numbers",
                },
              ],
            },
          ],
        },

        // Topic 6: Đường thẳng vuông góc, song song (Bài 27-32)
        {
          order: 6,
          nameVi: "Đường thẳng vuông góc, song song",
          lessons: [
            {
              order: 1,
              nameVi: "Đường thẳng vuông góc và song song",
              skills: [
                {
                  key: "g4-parallel-perpendicular",
                  nameVi: "Nhận biết đường thẳng vuông góc và song song",
                  answerFormat: "MULTIPLE_CHOICE",
                  timeEstimateSec: 45,
                  poolKey: "parallel-perpendicular",
                },
              ],
            },
            {
              order: 2,
              nameVi: "Hình bình hành và hình thoi",
              skills: [
                {
                  key: "g4-parallelogram-rhombus",
                  nameVi: "Nhận biết và vẽ hình bình hành, hình thoi",
                  answerFormat: "MULTIPLE_CHOICE",
                  timeEstimateSec: 60,
                  poolKey: "parallelogram-rhombus",
                },
              ],
            },
          ],
        },

        // Topic 7: Ôn tập học kì 1 (Bài 33-37)
        {
          order: 7,
          nameVi: "Ôn tập học kì 1",
          lessons: [
            {
              order: 1,
              nameVi: "Ôn tập số học và phép tính học kì 1",
              skills: [
                {
                  key: "g4-semester1-review-arithmetic",
                  nameVi: "Ôn tập tổng hợp số học học kì 1",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 90,
                  generatorKey: "semester1-review-arithmetic",
                },
              ],
            },
          ],
        },
      ],
    },

    // -------------------------------------------------------------------------
    // TẬP 2 — Topics 8-13
    // -------------------------------------------------------------------------
    {
      order: 2,
      name: "Tập 2",
      topics: [
        // Topic 8: Phép nhân và phép chia (Bài 38-50)
        {
          order: 8,
          nameVi: "Phép nhân và phép chia",
          lessons: [
            {
              order: 1,
              nameVi: "Nhân với số có 1 chữ số",
              skills: [
                {
                  key: "g4-multiply-1-digit",
                  nameVi: "Nhân số có nhiều chữ số với số có 1 chữ số",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 60,
                  generatorKey: "multiply-1-digit",
                },
              ],
            },
            {
              order: 2,
              nameVi: "Chia cho số có 1 chữ số",
              skills: [
                {
                  key: "g4-divide-1-digit",
                  nameVi: "Chia số có nhiều chữ số cho số có 1 chữ số",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 60,
                  generatorKey: "divide-1-digit",
                },
              ],
            },
            {
              order: 3,
              nameVi: "Nhân và chia với 10, 100, 1000",
              skills: [
                {
                  key: "g4-multiply-divide-powers-10",
                  nameVi: "Nhân chia với 10, 100, 1000",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 30,
                  generatorKey: "multiply-divide-powers-10",
                },
              ],
            },
            {
              order: 4,
              nameVi: "Nhân với số có 2 chữ số",
              skills: [
                {
                  key: "g4-multiply-2-digit",
                  nameVi: "Nhân số có nhiều chữ số với số có 2 chữ số",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 75,
                  generatorKey: "multiply-2-digit",
                },
              ],
            },
            {
              order: 5,
              nameVi: "Chia cho số có 2 chữ số",
              skills: [
                {
                  key: "g4-divide-2-digit",
                  nameVi: "Chia số có nhiều chữ số cho số có 2 chữ số",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 90,
                  generatorKey: "divide-2-digit",
                },
              ],
            },
          ],
        },

        // Topic 9: Làm quen với thống kê, xác suất (Bài 51-52)
        {
          order: 9,
          nameVi: "Làm quen với yếu tố thống kê, xác suất",
          lessons: [
            {
              order: 1,
              nameVi: "Thu thập và phân loại dữ liệu",
              skills: [
                {
                  key: "g4-data-collection",
                  nameVi: "Thu thập và phân loại dữ liệu đơn giản",
                  answerFormat: "MULTIPLE_CHOICE",
                  timeEstimateSec: 60,
                  poolKey: "data-collection",
                },
              ],
            },
            {
              order: 2,
              nameVi: "Xác suất thực nghiệm đơn giản",
              skills: [
                {
                  key: "g4-probability-intro",
                  nameVi: "Nhận biết khả năng xảy ra của sự kiện",
                  answerFormat: "MULTIPLE_CHOICE",
                  timeEstimateSec: 60,
                  poolKey: "probability-intro",
                },
              ],
            },
          ],
        },

        // Topic 10: Phân số (Bài 53-58)
        {
          order: 10,
          nameVi: "Phân số",
          lessons: [
            {
              order: 1,
              nameVi: "Phân số và phép chia",
              skills: [
                {
                  key: "g4-fraction-concept",
                  nameVi: "Khái niệm phân số và liên hệ phép chia",
                  answerFormat: "FRACTION",
                  timeEstimateSec: 45,
                  generatorKey: "fraction-concept",
                },
              ],
            },
            {
              order: 2,
              nameVi: "Rút gọn phân số",
              skills: [
                {
                  key: "g4-simplify-fraction",
                  nameVi: "Rút gọn phân số",
                  answerFormat: "FRACTION",
                  timeEstimateSec: 60,
                  generatorKey: "simplify-fraction",
                },
              ],
            },
            {
              order: 3,
              nameVi: "Quy đồng mẫu số",
              skills: [
                {
                  key: "g4-fraction-common-denominator",
                  nameVi: "Quy đồng mẫu số hai phân số",
                  answerFormat: "FRACTION",
                  timeEstimateSec: 75,
                  generatorKey: "fraction-common-denominator",
                },
              ],
            },
            {
              order: 4,
              nameVi: "So sánh phân số",
              skills: [
                {
                  key: "g4-fraction-compare",
                  nameVi: "So sánh hai phân số",
                  answerFormat: "MULTIPLE_CHOICE",
                  timeEstimateSec: 60,
                  generatorKey: "fraction-compare",
                },
              ],
            },
          ],
        },

        // Topic 11: Phép cộng, trừ phân số (Bài 59-62)
        {
          order: 11,
          nameVi: "Phép cộng, trừ phân số",
          lessons: [
            {
              order: 1,
              nameVi: "Cộng hai phân số",
              skills: [
                {
                  key: "g4-fraction-add",
                  nameVi: "Cộng hai phân số cùng và khác mẫu",
                  answerFormat: "FRACTION",
                  timeEstimateSec: 75,
                  generatorKey: "fraction-add",
                },
              ],
            },
            {
              order: 2,
              nameVi: "Trừ hai phân số",
              skills: [
                {
                  key: "g4-fraction-subtract",
                  nameVi: "Trừ hai phân số cùng và khác mẫu",
                  answerFormat: "FRACTION",
                  timeEstimateSec: 75,
                  generatorKey: "fraction-subtract",
                },
              ],
            },
          ],
        },

        // Topic 12: Phép nhân, chia phân số (Bài 63-66)
        {
          order: 12,
          nameVi: "Phép nhân, chia phân số",
          lessons: [
            {
              order: 1,
              nameVi: "Nhân hai phân số",
              skills: [
                {
                  key: "g4-fraction-multiply",
                  nameVi: "Nhân hai phân số",
                  answerFormat: "FRACTION",
                  timeEstimateSec: 60,
                  generatorKey: "fraction-multiply",
                },
              ],
            },
            {
              order: 2,
              nameVi: "Chia hai phân số",
              skills: [
                {
                  key: "g4-fraction-divide",
                  nameVi: "Chia hai phân số",
                  answerFormat: "FRACTION",
                  timeEstimateSec: 60,
                  generatorKey: "fraction-divide",
                },
              ],
            },
          ],
        },

        // Topic 13: Ôn tập cuối năm (Bài 67-73)
        {
          order: 13,
          nameVi: "Ôn tập cuối năm",
          lessons: [
            {
              order: 1,
              nameVi: "Ôn tập số học cuối năm",
              skills: [
                {
                  key: "g4-year-review-arithmetic",
                  nameVi: "Ôn tập tổng hợp phép tính cuối năm",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 90,
                  generatorKey: "year-review-arithmetic",
                },
              ],
            },
            {
              order: 2,
              nameVi: "Ôn tập phân số cuối năm",
              skills: [
                {
                  key: "g4-year-review-fractions",
                  nameVi: "Ôn tập tổng hợp phân số cuối năm",
                  answerFormat: "FRACTION",
                  timeEstimateSec: 90,
                  generatorKey: "year-review-fractions",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
