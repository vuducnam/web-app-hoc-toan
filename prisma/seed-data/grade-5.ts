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
              knowledgeNoteRemember:
                "### Số tự nhiên và phân số\n\n" +
                "**Số tự nhiên:** $0, 1, 2, 3, \\ldots$ — đọc theo từng hàng từ trái sang phải.\n\n" +
                "**Phân số** $\\dfrac{a}{b}$ ($b \\neq 0$): $a$ là tử số, $b$ là mẫu số.\n\n" +
                "Quy đồng mẫu số để cộng, trừ phân số khác mẫu:\n" +
                "$$\\frac{1}{3} + \\frac{1}{4} = \\frac{4}{12} + \\frac{3}{12} = \\frac{7}{12}$$\n\n" +
                "**Ví dụ rút gọn:** $\\dfrac{12}{18} = \\dfrac{2}{3}$ (chia tử và mẫu cho $6$).",
              knowledgeNoteCaution:
                "- Khi cộng/trừ phân số, **bắt buộc** phải đồng mẫu số trước — không được cộng tử với tử và mẫu với mẫu.\n" +
                "- Rút gọn phân số: chia cả tử và mẫu cho **ước chung lớn nhất** (ƯCLN), không chia cho số tùy ý.",
              knowledgeNoteExtension:
                "Phân số là nền tảng để em học số thập phân và tỉ số phần trăm trong lớp 5. " +
                "Mọi phân số đều có thể viết dưới dạng số thập phân: $\\dfrac{3}{4} = 0{,}75$.",
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
              knowledgeNoteRemember:
                "### Các hình phẳng đã học\n\n" +
                "| Hình | Chu vi | Diện tích |\n" +
                "|------|--------|-----------|\n" +
                "| Hình vuông (cạnh $a$) | $C = 4a$ | $S = a^2$ |\n" +
                "| Hình chữ nhật ($a, b$) | $C = 2(a+b)$ | $S = a \\times b$ |\n\n" +
                "**Ví dụ:** Hình chữ nhật dài $8\\,\\text{cm}$, rộng $5\\,\\text{cm}$.\n" +
                "Diện tích: $S = 8 \\times 5 = 40\\,\\text{cm}^2$.",
              knowledgeNoteCaution:
                "- Chu vi và diện tích **phải cùng đơn vị** — đổi về đơn vị chung trước khi tính.\n" +
                "- Đơn vị diện tích là đơn vị độ dài **bình phương**: $\\text{cm}^2$, $\\text{m}^2$, $\\text{km}^2$.",
              knowledgeNoteExtension:
                "Lớp 5 em sẽ học thêm diện tích hình tam giác, hình thang và hình tròn — tất cả đều dựa trên nền tảng diện tích hình chữ nhật. " +
                "Trong thực tế, em áp dụng để tính diện tích căn phòng, mảnh vườn.",
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
              knowledgeNoteRemember:
                "### Số thập phân\n\n" +
                "Số thập phân gồm **phần nguyên** và **phần thập phân**, cách nhau bằng dấu **phẩy** (,).\n\n" +
                "$$3{,}725 = 3 + \\frac{7}{10} + \\frac{2}{100} + \\frac{5}{1000}$$\n\n" +
                "Bảng hàng:\n" +
                "- Trái dấu phẩy: đơn vị, chục, trăm, …\n" +
                "- Phải dấu phẩy: **phần mười, phần trăm, phần nghìn, …**\n\n" +
                "**Đọc:** $3{,}725$ → *'ba phẩy bảy trăm hai mươi lăm'*.",
              knowledgeNoteCaution:
                "- Việt Nam dùng dấu **phẩy** (,) làm dấu thập phân, *không* dùng dấu chấm (.).\n" +
                "- Các số $0$ tận cùng bên phải phần thập phân **không đổi giá trị**: $2{,}30 = 2{,}3$.",
              knowledgeNoteExtension:
                "Số thập phân là dạng viết khác của phân số thập phân: $0{,}01 = \\dfrac{1}{100}$. " +
                "Trong đo lường và tài chính, em gặp số thập phân hằng ngày (giá tiền, cân nặng, nhiệt độ).",
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
              knowledgeNoteRemember:
                "### So sánh hai số thập phân\n\n" +
                "**Quy tắc:**\n" +
                "1. So sánh phần nguyên trước — số nào phần nguyên lớn hơn thì lớn hơn.\n" +
                "2. Nếu phần nguyên bằng nhau, so sánh lần lượt từng chữ số phần thập phân từ trái sang phải.\n\n" +
                "**Ví dụ:** So sánh $4{,}73$ và $4{,}8$:\n" +
                "- Phần nguyên bằng nhau ($4 = 4$).\n" +
                "- Phần mười: $7 < 8$ → $4{,}73 < 4{,}8$.",
              knowledgeNoteCaution:
                "- Số chữ số sau dấu phẩy *nhiều hơn* không có nghĩa là số lớn hơn: $0{,}9 > 0{,}89$.\n" +
                "- Thêm $0$ vào bên phải phần thập phân để dễ so sánh: $4{,}73$ và $4{,}80$.",
              knowledgeNoteExtension:
                "So sánh số thập phân giúp em sắp xếp kết quả đo (chiều cao, điểm số) từ nhỏ đến lớn. " +
                "Lên lớp 6, em mở rộng sang so sánh số âm trên trục số.",
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
              knowledgeNoteRemember:
                "### Làm tròn số thập phân\n\n" +
                "**Quy tắc làm tròn đến hàng phần mười:**\n" +
                "- Nhìn chữ số hàng **phần trăm**.\n" +
                "- Nếu ≥ 5 → tăng hàng phần mười lên 1.\n" +
                "- Nếu < 5 → giữ nguyên hàng phần mười, bỏ các chữ số sau.\n\n" +
                "**Ví dụ:**\n" +
                "- $3{,}76 \\approx 3{,}8$ (vì $6 \\geq 5$)\n" +
                "- $3{,}74 \\approx 3{,}7$ (vì $4 < 5$)",
              knowledgeNoteCaution:
                "- Làm tròn đến hàng **phần trăm** thì nhìn chữ số hàng **phần nghìn** — đừng nhầm hàng.\n" +
                "- Sau khi làm tròn, không viết thêm các chữ số $0$ dư.",
              knowledgeNoteExtension:
                "Làm tròn được dùng rất nhiều trong ước tính: giá tiền, đo chiều dài, tính toán nhanh. " +
                "Trong khoa học, số liệu đo đạc luôn được làm tròn đến độ chính xác cần thiết.",
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
              knowledgeNoteRemember:
                "### Đơn vị đo diện tích lớn\n\n" +
                "$$1\\,\\text{km}^2 = 1\\,000\\,000\\,\\text{m}^2$$\n" +
                "$$1\\,\\text{ha} = 10\\,000\\,\\text{m}^2$$\n" +
                "$$1\\,\\text{km}^2 = 100\\,\\text{ha}$$\n\n" +
                "**Ví dụ đổi đơn vị:**\n" +
                "- $3{,}5\\,\\text{km}^2 = 350\\,\\text{ha}$\n" +
                "- $25\\,000\\,\\text{m}^2 = 2{,}5\\,\\text{ha}$",
              knowledgeNoteCaution:
                "- Héc-ta (ha) thường dùng để đo **diện tích đất nông nghiệp và rừng**, không dùng cho phòng hay căn nhà.\n" +
                "- Đổi $\\text{km}^2 \\leftrightarrow \\text{m}^2$: nhân hoặc chia $1\\,000\\,000$ (6 chữ số 0).",
              knowledgeNoteExtension:
                "Héc-ta và km² xuất hiện trên bản đồ, báo chí khi nói về diện tích tỉnh, thành, vườn quốc gia. " +
                "Lên lớp 6 em học hệ đơn vị SI đầy đủ, trong đó $1\\,\\text{m}^2$ là đơn vị cơ bản của diện tích.",
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
              knowledgeNoteRemember:
                "### Cộng và trừ số thập phân\n\n" +
                "**Đặt tính:** thẳng hàng theo dấu **phẩy**, phần thập phân thẳng cột với nhau.\n\n" +
                "$$\\begin{array}{r} 12{,}45 \\\\ +\\;\\; 3{,}80 \\\\ \\hline 16{,}25 \\end{array}$$\n\n" +
                "**Các bước:**\n" +
                "1. Viết các số thẳng dấu phẩy.\n" +
                "2. Thêm $0$ vào phần thập phân ngắn hơn nếu cần.\n" +
                "3. Tính từ phải sang trái như số tự nhiên.\n" +
                "4. Đặt dấu phẩy vào kết quả thẳng cột.",
              knowledgeNoteCaution:
                "- **Lỗi phổ biến nhất:** không căn thẳng dấu phẩy, dẫn đến sai vị trí hàng.\n" +
                "- Nhớ mang *nhớ* và *mượn* khi tính — quy tắc giống số tự nhiên.",
              knowledgeNoteExtension:
                "Khi mua sắm hoặc tính tiền thối, em đang thực hiện cộng/trừ số thập phân hằng ngày. " +
                "Phép cộng số thập phân chính xác là nền tảng của tài chính cá nhân.",
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
                {
                  key: "g5-word-decimals",
                  nameVi: "Bài toán cộng trừ số thập phân",
                  answerFormat: "DECIMAL",
                  timeEstimateSec: 90,
                  generatorKey: "word-decimals",
                },
              ],
            },
            {
              order: 2,
              nameVi: "Nhân số thập phân",
              knowledgeNoteRemember:
                "### Nhân số thập phân\n\n" +
                "**Quy tắc:**\n" +
                "1. Nhân như số tự nhiên (bỏ dấu phẩy).\n" +
                "2. Đếm tổng số chữ số phần thập phân của **cả hai thừa số**.\n" +
                "3. Đặt dấu phẩy từ phải sang trái kết quả đúng số chữ số đó.\n\n" +
                "**Ví dụ:** $2{,}3 \\times 1{,}4$\n" +
                "- $23 \\times 14 = 322$\n" +
                "- Tổng chữ số TP: $1 + 1 = 2$ → kết quả $3{,}22$",
              knowledgeNoteCaution:
                "- Đếm chữ số **thập phân** (sau dấu phẩy), *không* đếm tổng chữ số của số.\n" +
                "- Nếu kết quả có $0$ ở đầu, thêm $0$ vào phần nguyên: $0{,}06$ (không viết ${,}06$).",
              knowledgeNoteExtension:
                "Nhân số thập phân là cơ sở tính diện tích đất (mét × mét), tốc độ × thời gian = quãng đường. " +
                "Lên lớp 6, em học nhân đa thức — kỹ năng đếm số thập phân giúp hiểu bậc tự do.",
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
              knowledgeNoteRemember:
                "### Chia số thập phân\n\n" +
                "**Chia số thập phân cho số tự nhiên:**\n" +
                "- Chia như số tự nhiên, đặt dấu phẩy ở kết quả **thẳng hàng** với dấu phẩy số bị chia.\n\n" +
                "**Chia số thập phân cho số thập phân:**\n" +
                "- Nhân cả số bị chia và số chia với $10$, $100$, … để số chia thành số tự nhiên.\n" +
                "- Sau đó chia như bình thường.\n\n" +
                "**Ví dụ:** $4{,}5 \\div 1{,}5 = 45 \\div 15 = 3$",
              knowledgeNoteCaution:
                "- Khi biến số chia thành số tự nhiên, **phải nhân cả hai** số (bị chia và chia) với cùng một lũy thừa của $10$.\n" +
                "- Dấu phẩy trong thương phải đặt đúng vị trí — kiểm tra lại bằng phép nhân ngược.",
              knowledgeNoteExtension:
                "Chia số thập phân áp dụng khi tính giá mỗi đơn vị (đơn giá), tốc độ trung bình. " +
                "Trong lớp 6 em sẽ học chia đa thức — cùng nguyên lý biến đổi để dễ tính.",
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
              knowledgeNoteRemember:
                "### Nhân/chia với lũy thừa của 10\n\n" +
                "**Nhân với 10, 100, 1000:** dịch dấu phẩy sang **phải** đúng số chữ số $0$.\n" +
                "**Chia với 10, 100, 1000:** dịch dấu phẩy sang **trái** đúng số chữ số $0$.\n\n" +
                "$$5{,}73 \\times 100 = 573 \\qquad 5{,}73 \\div 100 = 0{,}0573$$\n\n" +
                "**Nhân với $0{,}1 = \\dfrac{1}{10}$:** bằng chia cho $10$ → dịch phẩy trái 1.\n" +
                "**Nhân với $0{,}01$:** dịch phẩy trái 2.",
              knowledgeNoteCaution:
                "- Nhân với $0{,}1$ **làm số nhỏ hơn** (giống chia 10) — đừng nhầm với nhân làm số lớn hơn.\n" +
                "- Thêm $0$ vào đầu phần nguyên nếu dịch phẩy sang trái làm mất chữ số: $5 \\div 100 = 0{,}05$.",
              knowledgeNoteExtension:
                "Quy tắc này giúp tính nhẩm rất nhanh trong thực tế: $12{,}5 \\times 1000 = 12500$ mà không cần giấy. " +
                "Đây cũng là nền tảng của ký hiệu khoa học ($\\times 10^n$) em sẽ học ở lớp 7.",
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
              knowledgeNoteRemember:
                "### Diện tích hình tam giác\n\n" +
                "$$S = \\frac{a \\times h}{2}$$\n\n" +
                "Trong đó:\n" +
                "- $a$ là độ dài **đáy**\n" +
                "- $h$ là **chiều cao** vuông góc với đáy $a$\n\n" +
                "**Ví dụ:** Tam giác có đáy $6\\,\\text{cm}$, chiều cao $4\\,\\text{cm}$.\n" +
                "$$S = \\frac{6 \\times 4}{2} = 12\\,\\text{cm}^2$$",
              knowledgeNoteCaution:
                "- Chiều cao $h$ **phải vuông góc với đáy** $a$ — không phải cạnh bên nào cũng là chiều cao.\n" +
                "- **Đừng quên chia 2** — đây là lỗi phổ biến nhất khi tính diện tích tam giác.",
              knowledgeNoteExtension:
                "Công thức này áp dụng tính diện tích mái nhà hình tam giác, ô đất hình tam giác. " +
                "Lên lớp 6 em sẽ học công thức Heron tính diện tích tam giác chỉ cần biết 3 cạnh.",
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
              knowledgeNoteRemember:
                "### Diện tích hình thang\n\n" +
                "$$S = \\frac{(a + b) \\times h}{2}$$\n\n" +
                "Trong đó:\n" +
                "- $a$, $b$ là độ dài hai **đáy** (song song nhau)\n" +
                "- $h$ là **chiều cao** (khoảng cách vuông góc giữa hai đáy)\n\n" +
                "**Ví dụ:** Đáy lớn $8\\,\\text{cm}$, đáy nhỏ $4\\,\\text{cm}$, chiều cao $5\\,\\text{cm}$.\n" +
                "$$S = \\frac{(8 + 4) \\times 5}{2} = \\frac{60}{2} = 30\\,\\text{cm}^2$$",
              knowledgeNoteCaution:
                "- Hình thang có **hai đáy** ($a$ và $b$) — phải cộng cả hai trước rồi mới nhân với $h$.\n" +
                "- Chiều cao $h$ là khoảng cách **vuông góc** giữa hai đáy, không phải cạnh bên xiên.",
              knowledgeNoteExtension:
                "Hình thang xuất hiện trong kiến trúc (mặt cắt cửa vòm, bậc thang). " +
                "Khi $a = 0$, công thức hình thang trở thành công thức diện tích tam giác — em có thể tự kiểm chứng!",
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
              knowledgeNoteRemember:
                "### Hình tròn\n\n" +
                "Ký hiệu: $r$ = bán kính, $d = 2r$ = đường kính, $\\pi \\approx 3{,}14$.\n\n" +
                "$$C = 2 \\times \\pi \\times r = \\pi \\times d$$\n" +
                "$$S = \\pi \\times r^2$$\n\n" +
                "**Ví dụ:** Hình tròn bán kính $5\\,\\text{cm}$:\n" +
                "- Chu vi: $C = 2 \\times 3{,}14 \\times 5 = 31{,}4\\,\\text{cm}$\n" +
                "- Diện tích: $S = 3{,}14 \\times 5^2 = 3{,}14 \\times 25 = 78{,}5\\,\\text{cm}^2$",
              knowledgeNoteCaution:
                "- $\\pi$ (pi) dùng giá trị gần đúng $3{,}14$ ở lớp 5 — kết quả sẽ có sai số nhỏ so với giá trị thật.\n" +
                "- Diện tích dùng **bán kính** ($r$), *không* dùng đường kính: $S = \\pi r^2$, không phải $\\pi d^2$.",
              knowledgeNoteExtension:
                "Số $\\pi$ là số vô tỉ (không viết được dưới dạng phân số), xấp xỉ $3{,}14159...$. " +
                "Ứng dụng: tính diện tích mặt hồ tròn, chu vi bánh xe, đường ống nước.",
              skills: [
                {
                  key: "g5-circle-circumference-area",
                  nameVi: "Tính chu vi và diện tích hình tròn",
                  answerFormat: "DECIMAL",
                  timeEstimateSec: 90,
                  generatorKey: "circle-circumference-area",
                },
                {
                  key: "g5-word-circle-triangle-area",
                  nameVi: "Bài toán diện tích tam giác, hình thang, hình tròn",
                  answerFormat: "DECIMAL",
                  timeEstimateSec: 90,
                  generatorKey: "word-circle-triangle-area",
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
              knowledgeNoteRemember:
                "### Tổng kết học kì 1\n\n" +
                "**Số thập phân:** đọc, viết, so sánh, làm tròn.\n\n" +
                "**Bốn phép tính:**\n" +
                "- Cộng/trừ: căn phẩy thẳng hàng.\n" +
                "- Nhân: đếm tổng chữ số TP, đặt phẩy từ phải.\n" +
                "- Chia: biến số chia thành số tự nhiên.\n" +
                "- $\\times / \\div$ với $10, 100$: dịch dấu phẩy.\n\n" +
                "**Hình phẳng:** $S_{\\triangle} = \\dfrac{ah}{2}$; $S_{\\text{thang}} = \\dfrac{(a+b)h}{2}$; $S_{\\bigcirc} = \\pi r^2$.\n\n" +
                "**Đơn vị diện tích:** $1\\,\\text{km}^2 = 100\\,\\text{ha} = 10^6\\,\\text{m}^2$.",
              knowledgeNoteCaution:
                "- Kiểm tra đơn vị sau mỗi bài — diện tích là $\\text{m}^2$, thể tích là $\\text{m}^3$, độ dài là $\\text{m}$.\n" +
                "- Làm bài ôn tập theo từng chủ đề, không học dàn trải một lúc.",
              knowledgeNoteExtension:
                "Học kì 2 sẽ mở rộng sang tỉ số phần trăm, thể tích, vận tốc và thống kê — " +
                "tất cả đều dùng kỹ năng số thập phân vừa ôn tập. Nắm vững học kì 1 là chìa khóa thành công!",
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
              knowledgeNoteRemember:
                "### Tỉ số và tỉ số phần trăm\n\n" +
                "**Tỉ số** của $a$ và $b$: $a : b = \\dfrac{a}{b}$ ($b \\neq 0$).\n\n" +
                "**Tỉ số phần trăm** — so sánh với đơn vị $100$:\n" +
                "$$a\\% = \\frac{a}{100}$$\n\n" +
                "**Tìm tỉ số % của $m$ so với $n$:**\n" +
                "$$\\frac{m}{n} \\times 100\\%$$\n\n" +
                "**Ví dụ:** $30$ HS giỏi trong tổng số $40$ HS:\n" +
                "$$\\frac{30}{40} \\times 100\\% = 75\\%$$",
              knowledgeNoteCaution:
                "- $100\\% = 1$ (toàn bộ), $50\\% = \\dfrac{1}{2}$, $25\\% = \\dfrac{1}{4}$ — ghi nhớ các mốc này.\n" +
                "- Tỉ số phần trăm **không có đơn vị** — đừng viết $75\\%\\,\\text{học sinh}$.",
              knowledgeNoteExtension:
                "Phần trăm dùng ở khắp nơi: thuế VAT (10%), lãi suất ngân hàng, xếp loại học sinh. " +
                "Lên lớp 7, em học tỉ lệ thức và bài toán phần trăm phức tạp hơn.",
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
              knowledgeNoteRemember:
                "### Bài toán tỉ số\n\n" +
                "**Dạng 1 — Tìm giá trị phần trăm:**\n" +
                "$$\\text{Giá trị} = \\frac{a\\%}{100} \\times \\text{Tổng}$$\n\n" +
                "**Dạng 2 — Tìm tổng khi biết một phần:**\n" +
                "$$\\text{Tổng} = \\frac{\\text{Phần}}{a\\%} \\times 100$$\n\n" +
                "**Ví dụ:** Một lớp có $35$ HS, $40\\%$ là HS giỏi. Số HS giỏi:\n" +
                "$$\\frac{40}{100} \\times 35 = 14\\,\\text{học sinh}$$",
              knowledgeNoteCaution:
                "- Xác định rõ **tổng thể** (mẫu) và **phần** (tử) trước khi tính.\n" +
                "- Bài toán **tìm tổng**: $\\text{Tổng} = \\text{Phần} \\div \\text{Tỉ lệ}$ (đổi \\% sang dạng thập phân).",
              knowledgeNoteExtension:
                "Bài toán tỉ số là công cụ phân tích dữ liệu: tỉ lệ nữ/nam trong lớp, phần trăm hoàn thành kế hoạch. " +
                "Đây là bước đệm để học xác suất thống kê ở cấp THCS.",
              skills: [
                {
                  key: "g5-ratio-word-problems",
                  nameVi: "Giải bài toán có liên quan đến tỉ số",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 90,
                  generatorKey: "ratio-word-problems",
                },
                {
                  key: "g5-word-percent",
                  nameVi: "Bài toán tỉ số phần trăm",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 90,
                  generatorKey: "word-percent",
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
              knowledgeNoteRemember:
                "### Đơn vị đo thể tích\n\n" +
                "Thể tích đo lượng **không gian** mà một vật chiếm.\n\n" +
                "$$1\\,\\text{m}^3 = 1\\,000\\,\\text{dm}^3 = 1\\,000\\,000\\,\\text{cm}^3$$\n\n" +
                "Liên hệ với dung tích:\n" +
                "$$1\\,\\text{dm}^3 = 1\\,\\ell \\text{ (lít)}$$\n\n" +
                "**Ví dụ:** Chiếc hộp $10\\,\\text{cm} \\times 5\\,\\text{cm} \\times 4\\,\\text{cm}$:\n" +
                "$$V = 10 \\times 5 \\times 4 = 200\\,\\text{cm}^3$$",
              knowledgeNoteCaution:
                "- Đơn vị thể tích là đơn vị độ dài **lập phương** (cm³), *không* phải cm² hay cm.\n" +
                "- $1\\,\\text{m}^3 = 1\\,000\\,\\text{dm}^3$ (nhân/chia $1000$, *không* phải $100$).",
              knowledgeNoteExtension:
                "Thể tích và dung tích liên hệ chặt chẽ: chai nước $500\\,\\text{ml} = 500\\,\\text{cm}^3 = 0{,}5\\,\\ell$. " +
                "Lên lớp 6 em học thể tích hình lăng trụ và hình chóp.",
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
              knowledgeNoteRemember:
                "### Thể tích hình hộp chữ nhật\n\n" +
                "$$V = a \\times b \\times c$$\n\n" +
                "Trong đó $a$, $b$, $c$ là chiều dài, chiều rộng, chiều cao.\n\n" +
                "**Ví dụ:** Hộp dài $8\\,\\text{cm}$, rộng $5\\,\\text{cm}$, cao $3\\,\\text{cm}$:\n" +
                "$$V = 8 \\times 5 \\times 3 = 120\\,\\text{cm}^3$$\n\n" +
                "Hình lập phương (cạnh $a$): $V = a^3$.",
              knowledgeNoteCaution:
                "- Ba kích thước $a, b, c$ phải cùng đơn vị trước khi nhân.\n" +
                "- Thể tích là **tích ba số**, không phải tổng ba cạnh.",
              knowledgeNoteExtension:
                "Bể nuôi cá, thùng chứa nước, phòng học đều là các hình hộp chữ nhật — em có thể tính thể tích ngay hôm nay. " +
                "Thể tích hộp chữ nhật là trường hợp đặc biệt của lăng trụ đứng (lớp 6).",
              skills: [
                {
                  key: "g5-rectangular-prism-volume",
                  nameVi: "Tính thể tích hình hộp chữ nhật",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 75,
                  generatorKey: "rectangular-prism-volume",
                },
                {
                  key: "g5-word-3d-volume",
                  nameVi: "Bài toán thể tích hình hộp và hình lập phương",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 90,
                  generatorKey: "word-3d-volume",
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
              knowledgeNoteRemember:
                "### Diện tích toàn phần hình hộp chữ nhật\n\n" +
                "Hộp chữ nhật có 6 mặt, gồm 3 cặp mặt đối diện bằng nhau:\n\n" +
                "$$S_{\\text{tp}} = 2 \\times (a \\times b + b \\times c + a \\times c)$$\n\n" +
                "Trong đó $a$ = dài, $b$ = rộng, $c$ = cao.\n\n" +
                "**Ví dụ:** Hộp $6 \\times 4 \\times 3\\,\\text{cm}$:\n" +
                "$$S_{\\text{tp}} = 2(6 \\times 4 + 4 \\times 3 + 6 \\times 3) = 2(24 + 12 + 18) = 108\\,\\text{cm}^2$$",
              knowledgeNoteCaution:
                "- Có **6 mặt** = 3 cặp — nhân $2$ ở ngoài cùng, không nhân từng cặp riêng.\n" +
                "- Kết quả là đơn vị **diện tích** (cm²), *không* phải thể tích (cm³).",
              knowledgeNoteExtension:
                "Diện tích toàn phần dùng để tính lượng vật liệu sơn, giấy gói hộp quà. " +
                "Hình lập phương (cạnh $a$): $S_{\\text{tp}} = 6a^2$ — trường hợp đặc biệt khi $a = b = c$.",
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
              knowledgeNoteRemember:
                "### Thể tích hình trụ\n\n" +
                "Hình trụ có đáy là hình tròn bán kính $r$ và chiều cao $h$:\n\n" +
                "$$V = \\pi \\times r^2 \\times h$$\n\n" +
                "Với $\\pi \\approx 3{,}14$.\n\n" +
                "**Ví dụ:** Hình trụ bán kính $3\\,\\text{cm}$, cao $10\\,\\text{cm}$:\n" +
                "$$V = 3{,}14 \\times 3^2 \\times 10 = 3{,}14 \\times 9 \\times 10 = 282{,}6\\,\\text{cm}^3$$",
              knowledgeNoteCaution:
                "- Công thức dùng **bán kính** $r$, không phải đường kính $d$. Nếu đề cho $d$, tính $r = d \\div 2$ trước.\n" +
                "- Tính $r^2$ trước, sau đó nhân với $\\pi$ và $h$ — đừng tính sai thứ tự.",
              knowledgeNoteExtension:
                "Hình trụ xuất hiện trong đời sống: lon nước, ống nước, cột trụ nhà. " +
                "Tính thể tích bể chứa nước hình trụ giúp biết cần bơm bao nhiêu nước.",
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
              knowledgeNoteRemember:
                "### Đơn vị đo thời gian\n\n" +
                "$$1\\,\\text{giờ} = 60\\,\\text{phút} \\qquad 1\\,\\text{phút} = 60\\,\\text{giây}$$\n" +
                "$$1\\,\\text{giờ} = 3600\\,\\text{giây}$$\n\n" +
                "**Đổi đơn vị:**\n" +
                "- Giờ → phút: nhân $60$\n" +
                "- Phút → giờ: chia $60$\n\n" +
                "**Ví dụ:** $2\\,\\text{giờ}\\,45\\,\\text{phút} = 165\\,\\text{phút}$\n" +
                "($2 \\times 60 + 45 = 165$)",
              knowledgeNoteCaution:
                "- Thời gian **không** dùng hệ thập phân — $1{,}5\\,\\text{giờ} = 1$ giờ $30$ phút (*không* phải 1 giờ 50 phút).\n" +
                "- Khi trừ thời gian có nhớ: mượn $1$ giờ $= 60$ phút (không phải $10$ phút).",
              knowledgeNoteExtension:
                "Đổi đơn vị thời gian dùng khi tính vận tốc: $72\\,\\text{km/h} = \\dfrac{72}{3600}\\,\\text{km/s} = 20\\,\\text{m/s}$. " +
                "Trong lập trình, thời gian thường tính bằng mili-giây (ms) — $1000\\,\\text{ms} = 1\\,\\text{s}$.",
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
              knowledgeNoteRemember:
                "### Vận tốc — Quãng đường — Thời gian\n\n" +
                "$$v = \\frac{s}{t} \\qquad s = v \\times t \\qquad t = \\frac{s}{v}$$\n\n" +
                "Trong đó:\n" +
                "- $v$ = vận tốc (km/h hoặc m/s)\n" +
                "- $s$ = quãng đường (km hoặc m)\n" +
                "- $t$ = thời gian (h hoặc s)\n\n" +
                "**Ví dụ:** Xe đi $120\\,\\text{km}$ trong $2\\,\\text{h}$:\n" +
                "$$v = \\frac{120}{2} = 60\\,\\text{km/h}$$",
              knowledgeNoteCaution:
                "- $v$, $s$, $t$ phải **cùng hệ đơn vị**: nếu $v$ tính bằng km/h thì $t$ phải là giờ, $s$ là km.\n" +
                "- Đổi phút sang giờ trước khi tính: $30\\,\\text{phút} = 0{,}5\\,\\text{h}$.",
              knowledgeNoteExtension:
                "Ba công thức $v$, $s$, $t$ tạo thành **tam giác ma thuật** — che cái cần tìm, phần còn lại cho biết phép tính. " +
                "Vật lý lớp 6 dùng chính ba công thức này với đơn vị SI (m/s, m, s).",
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
              knowledgeNoteRemember:
                "### Bảng số liệu và biểu đồ\n\n" +
                "**Bảng số liệu:** sắp xếp dữ liệu theo hàng/cột để dễ đọc và so sánh.\n\n" +
                "**Các dạng biểu đồ thông dụng:**\n" +
                "- **Biểu đồ cột:** so sánh số lượng giữa các nhóm.\n" +
                "- **Biểu đồ đường:** thể hiện xu hướng thay đổi theo thời gian.\n" +
                "- **Biểu đồ tròn:** thể hiện tỉ lệ phần trăm từng phần.\n\n" +
                "**Đọc biểu đồ:** xác định trục, đơn vị, sau đó đọc giá trị từng cột/điểm.",
              knowledgeNoteCaution:
                "- Luôn đọc **tên trục** và **đơn vị** trước khi đọc số liệu — trục $y$ có thể không bắt đầu từ $0$.\n" +
                "- Biểu đồ tròn: tổng các phần phải bằng $100\\%$ — kiểm tra nếu thấy nghi ngờ.",
              knowledgeNoteExtension:
                "Biểu đồ và bảng số liệu là ngôn ngữ của khoa học dữ liệu hiện đại. " +
                "Lên lớp 6 em học số trung bình cộng, số liệu ghép nhóm — đây là bước vào thống kê thật sự.",
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
              knowledgeNoteRemember:
                "### Tổng kết lớp 5\n\n" +
                "**Số và phép tính:**\n" +
                "- Số thập phân: đọc, viết, so sánh, làm tròn, bốn phép tính.\n" +
                "- Tỉ số phần trăm: $a\\% = \\dfrac{a}{100}$, tính phần trăm, tìm tổng.\n\n" +
                "**Hình học:**\n" +
                "- $S_{\\triangle} = \\dfrac{ah}{2}$; $S_{\\text{thang}} = \\dfrac{(a+b)h}{2}$; $S_{\\bigcirc} = \\pi r^2$\n" +
                "- $V_{\\text{hộp}} = abc$; $V_{\\text{trụ}} = \\pi r^2 h$; $S_{\\text{tp}} = 2(ab+bc+ca)$\n\n" +
                "**Đại lượng:** $v = s/t$; đổi đơn vị thời gian, diện tích, thể tích.\n\n" +
                "**Thống kê:** đọc bảng, biểu đồ cột, đường, tròn.",
              knowledgeNoteCaution:
                "- Ôn tập theo **từng chủ đề** — không học dàn trải cùng một lúc.\n" +
                "- Xem lại các bài kiểm tra đã làm, chú ý **lỗi sai thường gặp** của bản thân.",
              knowledgeNoteExtension:
                "Chúc mừng em đã hoàn thành chương trình Toán lớp 5! " +
                "Lên lớp 6, em sẽ học số nguyên âm, tỉ lệ thức, hình học không gian và đại số cơ bản — " +
                "tất cả đều xây dựng trên nền tảng vững chắc em vừa tích lũy.",
              skills: [
                {
                  key: "g5-year-review-comprehensive",
                  nameVi: "Ôn tập tổng hợp cuối năm lớp 5",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 90,
                  generatorKey: "year-review-comprehensive",
                },
                {
                  key: "g5-word-year-review",
                  nameVi: "Bài toán tổng hợp cuối năm",
                  answerFormat: "NUMERIC",
                  timeEstimateSec: 90,
                  generatorKey: "word-year-review",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
