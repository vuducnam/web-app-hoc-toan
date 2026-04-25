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
              knowledgeNoteRemember:
                "Số tự nhiên đến 100 000 gồm năm chữ số trở xuống.\n\n" +
                "**Cách đọc:** đọc từ trái sang phải, theo các hàng:\n\n" +
                "- Hàng chục nghìn — hàng nghìn — hàng trăm — hàng chục — hàng đơn vị.\n\n" +
                "**Ví dụ:** $35\\,720$ đọc là *“ba mươi lăm nghìn bảy trăm hai mươi”*.",
              knowledgeNoteCaution:
                "- Khi đọc số có chữ số $0$ ở giữa, phải đọc *“không trăm”* hoặc *“không chục”* nếu cần (vd: $30\\,205$ → *“ba mươi nghìn hai trăm linh năm”*).\n" +
                "- Đừng quên dấu cách giữa hàng nghìn và hàng trăm khi viết.",
              knowledgeNoteExtension:
                "Lên lớp 5 em sẽ học số đến hàng triệu, hàng tỉ — quy tắc đọc tương tự nhưng có thêm các lớp nghìn và lớp triệu. " +
                "Trong đời sống, các số như dân số thành phố hay số tiền em thường gặp ở hàng nghìn này.",
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
              knowledgeNoteRemember:
                "**Đặt tính rồi tính** theo cột dọc, các chữ số cùng hàng thẳng cột với nhau.\n\n" +
                "- **Cộng có nhớ:** khi tổng hai chữ số $\\geq 10$, viết hàng đơn vị, *nhớ* $1$ sang hàng kế tiếp.\n" +
                "- **Trừ có nhớ:** khi chữ số bị trừ nhỏ hơn chữ số trừ, *mượn* $1$ từ hàng cao hơn (giá trị $10$).\n\n" +
                "**Ví dụ:** $45\\,678 + 27\\,894 = 73\\,572$.",
              knowledgeNoteCaution:
                "- Quên cộng *“nhớ 1”* sang hàng tiếp theo là lỗi rất phổ biến — kiểm tra lại từng cột.\n" +
                "- Khi trừ, sau khi mượn $1$ thì hàng vừa cho mượn giảm đi $1$ — đừng quên!",
              knowledgeNoteExtension:
                "Phép cộng và trừ có nhớ là nền tảng cho phép cộng số thập phân (lớp 5) và phép cộng phân số. " +
                "Hãy tập tính nhanh nhẩm với các số tròn nghìn để tăng tốc độ.",
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
              knowledgeNoteRemember:
                "- Số **chẵn** là số chia hết cho $2$: tận cùng là $0, 2, 4, 6, 8$.\n" +
                "- Số **lẻ** là số *không* chia hết cho $2$: tận cùng là $1, 3, 5, 7, 9$.\n\n" +
                "**Ví dụ:** $48$ chẵn, $137$ lẻ.",
              knowledgeNoteCaution:
                "- Chỉ cần nhìn **chữ số tận cùng** để biết một số chẵn hay lẻ — *không cần chia thử*.\n" +
                "- Số $0$ là số **chẵn**.",
              knowledgeNoteExtension:
                "Tổng của hai số chẵn (hoặc hai số lẻ) là một số chẵn. " +
                "Tổng một số chẵn và một số lẻ là một số lẻ. Em thử với các ví dụ để kiểm chứng nhé!",
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
                  generatorKey: "angle-classify",
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
              knowledgeNoteRemember:
                "Số có 6 chữ số có giá trị từ $100\\,000$ đến $999\\,999$.\n\n" +
                "Các hàng từ phải sang trái: **đơn vị – chục – trăm – nghìn – chục nghìn – trăm nghìn**.\n\n" +
                "**Ví dụ:** $234\\,567$ đọc là *“hai trăm ba mươi tư nghìn năm trăm sáu mươi bảy”*.",
              knowledgeNoteCaution:
                "- Khi viết, để **dấu cách (hoặc dấu chấm)** giữa hàng trăm và hàng nghìn cho dễ đọc.\n" +
                "- Cẩn thận với chữ số $0$ ở giữa số (vd $200\\,015$): khi đọc phải đọc đúng các hàng có chữ số $0$.",
              knowledgeNoteExtension:
                "Trong dân số, dân số một huyện thường ở mức 6 chữ số. Em hãy tìm hiểu dân số quê em rồi viết số đó ra giấy nhé.",
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
              knowledgeNoteRemember:
                "**Giá trị** của một chữ số $=$ chữ số đó $\\times$ giá trị của hàng nó đứng.\n\n" +
                "- Hàng đơn vị: $\\times 1$\n" +
                "- Hàng chục: $\\times 10$\n" +
                "- Hàng trăm: $\\times 100$\n" +
                "- Hàng nghìn: $\\times 1\\,000$\n" +
                "- Hàng chục nghìn: $\\times 10\\,000$\n" +
                "- Hàng trăm nghìn: $\\times 100\\,000$\n\n" +
                "**Ví dụ:** Trong số $352\\,489$, chữ số $5$ ở hàng chục nghìn → giá trị là $5 \\times 10\\,000 = 50\\,000$.",
              knowledgeNoteCaution:
                "- Đừng nhầm **chữ số** với **giá trị của chữ số**: chữ số luôn là $0\\text{–}9$, còn giá trị thì có thể đến hàng trăm nghìn.\n" +
                "- Đếm hàng từ phải sang trái — không từ trái sang.",
              knowledgeNoteExtension:
                "Hệ thập phân (cơ số $10$) là cách viết số em đang dùng. Lên cấp 2, em sẽ học hệ nhị phân (cơ số $2$) trong tin học.",
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
              knowledgeNoteRemember:
                "**Quy tắc làm tròn:** xét chữ số ngay bên *phải* hàng cần làm tròn.\n\n" +
                "- Nếu chữ số đó **$\\geq 5$**: làm tròn lên (hàng cần làm tròn tăng $1$).\n" +
                "- Nếu chữ số đó **$< 5$**: làm tròn xuống (hàng cần làm tròn giữ nguyên).\n" +
                "- Tất cả chữ số bên phải hàng cần làm tròn đều thay bằng $0$.\n\n" +
                "**Ví dụ:** Làm tròn $4\\,567$ đến hàng trăm: chữ số hàng chục là $6 \\geq 5$ → $4\\,600$.",
              knowledgeNoteCaution:
                "- *Làm tròn đến hàng chục* có nghĩa là kết quả tận cùng bằng $0$, không phải “lấy 1 chữ số”.\n" +
                "- Khi chữ số bên phải đúng bằng $5$ (vd $45$ làm tròn hàng chục), quy tắc tiểu học: vẫn làm tròn lên ($45 \\to 50$).",
              knowledgeNoteExtension:
                "Trong cuộc sống, các siêu thị thường niêm yết giá tròn nghìn, ngân hàng làm tròn lãi suất đến phần trăm. " +
                "Lên lớp 5 em sẽ học làm tròn số thập phân.",
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
                  generatorKey: "parallel-perpendicular",
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
                  generatorKey: "parallelogram-rhombus",
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
                  generatorKey: "probability-intro",
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
