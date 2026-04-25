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
                "**Ví dụ:** $35\\,720$ đọc là *\"ba mươi lăm nghìn bảy trăm hai mươi\"*.",
              knowledgeNoteCaution:
                "- Khi đọc số có chữ số $0$ ở giữa, phải đọc *\"không trăm\"* hoặc *\"không chục\"* nếu cần (vd: $30\\,205$ → *\"ba mươi nghìn hai trăm linh năm\"*).\n" +
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
                "- Quên cộng *\"nhớ 1\"* sang hàng tiếp theo là lỗi rất phổ biến — kiểm tra lại từng cột.\n" +
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
              knowledgeNoteRemember:
                "**Góc** được tạo bởi hai tia chung một gốc. Đơn vị đo góc là **độ** (ký hiệu $°$).\n\n" +
                "**Các loại góc:**\n" +
                "- Góc nhọn: $0° < $ góc $< 90°$\n" +
                "- Góc vuông: $= 90°$\n" +
                "- Góc tù: $90° < $ góc $< 180°$\n" +
                "- Góc bẹt: $= 180°$\n\n" +
                "**Cách đo:** đặt tâm thước trùng đỉnh góc, vạch $0°$ trùng một cạnh góc, đọc số chỉ cạnh kia.\n\n" +
                "**Ví dụ:** Đặt thước, cạnh OA trùng $0°$, cạnh OB chỉ $65°$ → góc AOB $= 65°$ (góc nhọn).",
              knowledgeNoteCaution:
                "- Phải đặt **tâm thước** (điểm chính giữa) trùng **đỉnh** của góc — nếu lệch sẽ đọc sai số đo.\n" +
                "- Thước đo góc có hai dãy số ($0°$ đến $180°$ theo hai hướng) — nhớ chọn đúng dãy phù hợp với hướng mở của góc.",
              knowledgeNoteExtension:
                "Góc vuông $90°$ xuất hiện ở khắp nơi: góc tường nhà, góc ô gạch hoa, góc quyển sách. " +
                "Lên lớp 6 em sẽ học thêm về tổng các góc trong tam giác và các đa giác khác.",
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
                "**Ví dụ:** $234\\,567$ đọc là *\"hai trăm ba mươi tư nghìn năm trăm sáu mươi bảy\"*.",
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
                "- *Làm tròn đến hàng chục* có nghĩa là kết quả tận cùng bằng $0$, không phải \"lấy 1 chữ số\".\n" +
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
              knowledgeNoteRemember:
                "**Bảng đơn vị đo độ dài** (từ lớn đến nhỏ):\n\n" +
                "$$1\\text{ km} = 1\\,000\\text{ m}$$\n" +
                "$$1\\text{ m} = 100\\text{ cm}$$\n" +
                "$$1\\text{ cm} = 10\\text{ mm}$$\n\n" +
                "**Đổi đơn vị:**\n" +
                "- Đổi từ đơn vị **lớn → nhỏ**: nhân với $10$, $100$, $1\\,000$.\n" +
                "- Đổi từ đơn vị **nhỏ → lớn**: chia với $10$, $100$, $1\\,000$.\n\n" +
                "**Ví dụ:** $3\\text{ km} = 3 \\times 1\\,000 = 3\\,000\\text{ m}$.",
              knowledgeNoteCaution:
                "- Phân biệt hướng đổi: km → m thì *nhân*, m → km thì *chia* — không được nhầm chiều.\n" +
                "- $1\\text{ m} = 100\\text{ cm}$ (không phải $10\\text{ cm}$) — đây là lỗi phổ biến nhất.",
              knowledgeNoteExtension:
                "Trong đời sống, quãng đường đi học đo bằng km, chiều cao của em đo bằng cm, bề dày tờ giấy đo bằng mm. " +
                "Lên lớp 5 em sẽ ôn lại bảng đơn vị và học cách đổi đơn vị trong các bài toán phức hợp.",
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
              knowledgeNoteRemember:
                "**Bảng đơn vị đo khối lượng:**\n\n" +
                "$$1\\text{ tấn} = 10\\text{ tạ}$$\n" +
                "$$1\\text{ tạ} = 100\\text{ kg}$$\n" +
                "$$1\\text{ kg} = 1\\,000\\text{ g}$$\n\n" +
                "**Đổi đơn vị:**\n" +
                "- Lớn → nhỏ: nhân với $10$, $100$, hoặc $1\\,000$.\n" +
                "- Nhỏ → lớn: chia với $10$, $100$, hoặc $1\\,000$.\n\n" +
                "**Ví dụ:** $2\\text{ tạ} = 2 \\times 100 = 200\\text{ kg}$.",
              knowledgeNoteCaution:
                "- $1\\text{ tạ} = 100\\text{ kg}$ (không phải $10\\text{ kg}$) — nhiều em hay nhầm.\n" +
                "- Phân biệt **tấn** và **tạ**: tấn lớn hơn ($1\\text{ tấn} = 10\\text{ tạ}$).",
              knowledgeNoteExtension:
                "Ngoài chợ, rau củ thường cân bằng kg, gạo bán theo tạ, còn xe tải chở hàng tính bằng tấn. " +
                "Hiểu đơn vị giúp em ước lượng và so sánh nhanh trong cuộc sống hằng ngày.",
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
              knowledgeNoteRemember:
                "**Đơn vị đo dung tích** phổ biến ở lớp 4:\n\n" +
                "$$1\\text{ l} = 1\\,000\\text{ ml}$$\n\n" +
                "**Đổi đơn vị:**\n" +
                "- $\\text{l} \\to \\text{ml}$: nhân $1\\,000$.\n" +
                "- $\\text{ml} \\to \\text{l}$: chia $1\\,000$.\n\n" +
                "**Ví dụ:** $3\\text{ l} = 3 \\times 1\\,000 = 3\\,000\\text{ ml}$.\n\n" +
                "Ngoài ra em có thể gặp **dl** (đề-xi-lít): $1\\text{ l} = 10\\text{ dl}$.",
              knowledgeNoteCaution:
                "- $1\\text{ l} = 1\\,000\\text{ ml}$ (không phải $100\\text{ ml}$).\n" +
                "- Khi đổi nhiều đơn vị khác nhau trong một bài, ghi rõ tên đơn vị bên cạnh con số để không bị lẫn.",
              knowledgeNoteExtension:
                "Chai nước uống thường là $500\\text{ ml}$ (nửa lít) hay $1\\text{ l}$. " +
                "Khi đi siêu thị, em có thể đọc nhãn chai để luyện đổi đơn vị ngay trong cuộc sống.",
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
              knowledgeNoteRemember:
                "**Đặt tính cộng** các số có 5 chữ số trở lên:\n\n" +
                "1. Viết hai số thẳng cột (hàng đơn vị thẳng hàng đơn vị, hàng chục thẳng hàng chục, ...).\n" +
                "2. Cộng từ phải sang trái (từ hàng đơn vị).\n" +
                "3. Mỗi khi tổng $\\geq 10$: viết hàng đơn vị của tổng, *nhớ* $1$ sang cột bên trái.\n\n" +
                "**Ví dụ:**\n" +
                "$$67\\,358 + 24\\,975 = 92\\,333$$",
              knowledgeNoteCaution:
                "- Căn **phải** khi đặt tính — số nào ngắn hơn thì cột bên trái để trống (không điền số).\n" +
                "- Nhớ cộng cả *\"nhớ 1\"* ở mỗi bước, đặc biệt khi nhiều cột liên tiếp đều có nhớ.",
              knowledgeNoteExtension:
                "Phép cộng số lớn là nền tảng cho các bài toán tổng hợp: tính tổng chi phí xây nhà, tổng sản lượng thu hoạch, ... " +
                "Lên lớp 5 em sẽ cộng số thập phân — cũng đặt tính tương tự nhưng cần căn dấu phẩy.",
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
              knowledgeNoteRemember:
                "**Đặt tính trừ** các số có 5 chữ số trở lên:\n\n" +
                "1. Viết số bị trừ trên, số trừ dưới, thẳng cột.\n" +
                "2. Trừ từ phải sang trái.\n" +
                "3. Khi chữ số bị trừ **nhỏ hơn** chữ số trừ: *mượn* $1$ từ hàng bên trái (tương đương $10$ ở hàng hiện tại), hàng bên trái giảm $1$.\n\n" +
                "**Ví dụ:**\n" +
                "$$84\\,200 - 36\\,547 = 47\\,653$$",
              knowledgeNoteCaution:
                "- Sau khi mượn $1$ ở hàng trên, hàng đó giảm $1$ — nhiều em quên bước này dẫn đến kết quả sai.\n" +
                "- Khi hàng trên là $0$ mà phải mượn: phải mượn tiếp từ hàng cao hơn, rồi $0$ trở thành $10 - 1 = 9$.",
              knowledgeNoteExtension:
                "Phép trừ số lớn dùng nhiều trong thực tế: tính tiền thối, tính quãng đường còn lại, ... " +
                "Lên lớp 5 em sẽ trừ số thập phân với cùng quy tắc mượn, nhưng thêm phần căn dấu phẩy.",
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
              knowledgeNoteRemember:
                "**Hai đường thẳng vuông góc:** cắt nhau tạo thành góc vuông $90°$.\n\n" +
                "**Hai đường thẳng song song:** không cắt nhau dù kéo dài mãi; khoảng cách giữa hai đường luôn bằng nhau.\n\n" +
                "**Nhận biết:**\n" +
                "- Dùng ê-ke để kiểm tra góc vuông → vuông góc.\n" +
                "- Hai đường thẳng không cắt nhau và cùng phương → song song.\n\n" +
                "**Ví dụ:** Hai cạnh của tờ giấy hình chữ nhật vuông góc với nhau; hai cạnh dài đối diện là song song.",
              knowledgeNoteCaution:
                "- Hai đường thẳng **song song** không có điểm chung — không được vẽ chúng cắt nhau dù ở đầu hay cuối.\n" +
                "- Hai đường thẳng **vuông góc** chắc chắn cắt nhau; nhưng không phải mọi đường thẳng cắt nhau đều vuông góc.",
              knowledgeNoteExtension:
                "Trên bản đồ đường phố, nhiều con đường song song và vuông góc nhau tạo thành ô cờ. " +
                "Lên lớp 6, em sẽ học về cặp góc so le trong và đồng vị khi đường thẳng cắt hai đường song song.",
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
              knowledgeNoteRemember:
                "**Hình bình hành:** tứ giác có hai cặp cạnh đối diện song song và bằng nhau.\n\n" +
                "**Hình thoi:** tứ giác có bốn cạnh bằng nhau (là hình bình hành đặc biệt).\n\n" +
                "**Tính chất chung của hình bình hành:**\n" +
                "- Hai cặp cạnh đối song song và bằng nhau.\n" +
                "- Hai đường chéo cắt nhau tại trung điểm của mỗi đường.\n\n" +
                "**Ví dụ:** Mặt viên gạch bông (hình thoi) có 4 cạnh bằng nhau.",
              knowledgeNoteCaution:
                "- Hình vuông cũng là hình thoi (4 cạnh bằng nhau và 4 góc vuông) — nhưng hình thoi thường không có góc vuông.\n" +
                "- Hình bình hành và hình thoi **không** phải hình chữ nhật trừ khi có góc vuông.",
              knowledgeNoteExtension:
                "Viên gạch lát đường ở nhiều nơi có dạng hình thoi (hình hoa), bàn cờ ca-rô là hình vuông (hình thoi đặc biệt). " +
                "Lên lớp 5 em sẽ tính diện tích hình bình hành và hình thoi.",
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
              knowledgeNoteRemember:
                "**Nội dung ôn tập học kì 1 gồm:**\n\n" +
                "- Đọc, viết số tự nhiên đến 6 chữ số; giá trị chữ số theo hàng.\n" +
                "- Làm tròn số đến hàng chục, trăm, nghìn.\n" +
                "- Cộng, trừ có nhớ với số có nhiều chữ số.\n" +
                "- Đo góc bằng thước; nhận biết góc nhọn, góc vuông, góc tù.\n" +
                "- Đổi đơn vị đo độ dài, khối lượng, dung tích.\n" +
                "- Nhận biết đường thẳng vuông góc, song song; hình bình hành, hình thoi.\n\n" +
                "**Lưu ý khi ôn:** luyện từng dạng bài riêng trước, rồi làm đề tổng hợp.",
              knowledgeNoteCaution:
                "- Khi đổi đơn vị đo lường, viết rõ đơn vị sau kết quả để không bị mất điểm.\n" +
                "- Bài cộng, trừ nhiều chữ số: kiểm tra lại bằng phép ngược (cộng kiểm tra trừ và ngược lại).",
              knowledgeNoteExtension:
                "Ôn tập học kì là cơ hội để em phát hiện lỗ hổng và củng cố trước khi bước vào học kì 2 với phép nhân, chia lớn và phân số.",
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
              knowledgeNoteRemember:
                "**Đặt tính nhân** số có nhiều chữ số với số có 1 chữ số:\n\n" +
                "1. Viết số có nhiều chữ số lên trên, số có 1 chữ số xuống dưới bên phải.\n" +
                "2. Nhân từ phải sang trái: lấy số dưới nhân lần lượt từng chữ số của số trên.\n" +
                "3. Khi tích $\\geq 10$: viết hàng đơn vị, *nhớ* hàng chục sang cột kế tiếp.\n\n" +
                "**Ví dụ:**\n" +
                "$$12\\,345 \\times 3 = 37\\,035$$",
              knowledgeNoteCaution:
                "- Nhớ cộng thêm số *\"nhớ\"* vào tích của hàng kế tiếp — quên bước này là nguyên nhân sai phổ biến nhất.\n" +
                "- Nhân xong, đếm số chữ số để kiểm tra kết quả có hợp lý không.",
              knowledgeNoteExtension:
                "Phép nhân số có nhiều chữ số với số có 1 chữ số là bước đệm để em học nhân với số có 2 chữ số (bài tiếp theo) và nhân số thập phân ở lớp 5.",
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
              knowledgeNoteRemember:
                "**Đặt tính chia** (phép chia có dư hoặc hết):\n\n" +
                "1. Lấy từng chữ số của số bị chia từ trái sang phải; xác định nhóm đầu tiên chia được.\n" +
                "2. Tìm thương của từng bước: thương $\\times$ số chia ≤ số đang xét, phần dư < số chia.\n" +
                "3. Hạ chữ số tiếp theo, tiếp tục cho đến hết.\n\n" +
                "**Ví dụ:** $7\\,248 \\div 3$:\n" +
                "- $7 \\div 3 = 2$ dư $1$ → hạ $2$: $12 \\div 3 = 4$ dư $0$ → hạ $4$: $04 \\div 3 = 1$ dư $1$ → hạ $8$: $18 \\div 3 = 6$.\n" +
                "- Kết quả: $2\\,416$.",
              knowledgeNoteCaution:
                "- Nếu chữ số hàng đầu nhỏ hơn số chia thì phải *gộp thêm* chữ số tiếp theo mới chia được — thương lúc này bắt đầu bằng $0$.\n" +
                "- Phần dư cuối cùng phải **nhỏ hơn** số chia; nếu không thì thương sai (chưa đủ lần).",
              knowledgeNoteExtension:
                "Phép chia là phép tính ngược của phép nhân — em có thể kiểm tra kết quả bằng cách lấy thương nhân số chia rồi cộng phần dư, phải bằng số bị chia.",
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
              knowledgeNoteRemember:
                "**Nhân với $10$, $100$, $1\\,000$:** thêm $1$, $2$, $3$ chữ số $0$ vào bên phải số.\n\n" +
                "$$45 \\times 10 = 450 \\qquad 45 \\times 100 = 4\\,500 \\qquad 45 \\times 1\\,000 = 45\\,000$$\n\n" +
                "**Chia cho $10$, $100$, $1\\,000$:** bỏ $1$, $2$, $3$ chữ số $0$ ở cuối (nếu tận cùng là $0$).\n\n" +
                "$$4\\,500 \\div 100 = 45 \\qquad 7\\,000 \\div 1\\,000 = 7$$",
              knowledgeNoteCaution:
                "- Quy tắc *bỏ số $0$* chỉ đúng khi số bị chia **tận cùng bằng $0$** và đủ số $0$ để bỏ.\n" +
                "- Không áp dụng nhẩm khi số chia không phải lũy thừa của $10$ — phải đặt tính đầy đủ.",
              knowledgeNoteExtension:
                "Nhân chia với $10$, $100$, $1\\,000$ là nền tảng cho đổi đơn vị đo lường (km↔m, kg↔g) và tính toán nhanh với số tròn trong đời sống.",
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
              knowledgeNoteRemember:
                "**Đặt tính nhân** số có nhiều chữ số với số có 2 chữ số:\n\n" +
                "1. Nhân số trên với **chữ số hàng đơn vị** của số dưới → tích riêng thứ nhất.\n" +
                "2. Nhân số trên với **chữ số hàng chục** của số dưới → tích riêng thứ hai (dịch trái 1 cột, tức thêm $0$ ở cuối).\n" +
                "3. Cộng hai tích riêng lại.\n\n" +
                "**Ví dụ:** $234 \\times 15$:\n" +
                "- $234 \\times 5 = 1\\,170$ (tích riêng 1)\n" +
                "- $234 \\times 10 = 2\\,340$ (tích riêng 2)\n" +
                "- $1\\,170 + 2\\,340 = 3\\,510$",
              knowledgeNoteCaution:
                "- Tích riêng thứ hai phải **dịch sang trái 1 cột** (hoặc viết thêm $0$ ở cuối) — không được viết thẳng cột với tích riêng thứ nhất.\n" +
                "- Sau khi có hai tích riêng, nhớ cộng đúng vị trí từng cột.",
              knowledgeNoteExtension:
                "Nhân với số có 2 chữ số dùng nhiều trong tính diện tích, tính tiền hàng hoá, ... " +
                "Lên lớp 5 em sẽ nhân số thập phân — cũng dùng cách đặt tính tương tự, chỉ thêm bước đặt dấu phẩy.",
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
              knowledgeNoteRemember:
                "**Đặt tính chia** cho số có 2 chữ số:\n\n" +
                "1. Lấy nhóm chữ số đầu tiên của số bị chia (đủ chia được số chia).\n" +
                "2. Ước lượng thương: thử $\\times$ số chia, so sánh với phần đang xét.\n" +
                "3. Hạ chữ số tiếp theo, tiếp tục ước lượng và tính.\n\n" +
                "**Ví dụ:** $2\\,340 \\div 15 = 156$:\n" +
                "- Lấy $23 \\div 15 \\approx 1$; $1 \\times 15 = 15$; $23 - 15 = 8$. Hạ $4$: $84 \\div 15 \\approx 5$; $5 \\times 15 = 75$; $84 - 75 = 9$. Hạ $0$: $90 \\div 15 = 6$.",
              knowledgeNoteCaution:
                "- Ước lượng thương bằng cách làm tròn số chia: ví dụ chia cho $23$ thì ước lượng như chia cho $20$.\n" +
                "- Nếu ước lượng sai (tích lớn hơn số đang xét hoặc phần dư ≥ số chia), phải điều chỉnh thương lên/xuống $1$.",
              knowledgeNoteExtension:
                "Chia cho số có 2 chữ số là phép tính khó nhất trong chương trình lớp 4 — luyện nhiều để thành thạo ước lượng. " +
                "Lên lớp 5 em sẽ chia số thập phân, cũng dùng kỹ năng ước lượng này.",
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
              knowledgeNoteRemember:
                "**Thu thập dữ liệu** là ghi chép thông tin từ quan sát hoặc điều tra.\n\n" +
                "**Phân loại dữ liệu:** sắp xếp thông tin vào các nhóm có đặc điểm chung.\n\n" +
                "**Các bước thực hiện:**\n" +
                "1. Xác định câu hỏi điều tra (vd: *màu sắc yêu thích của các bạn trong lớp*).\n" +
                "2. Thu thập bằng phiếu hỏi hoặc quan sát.\n" +
                "3. Tổng hợp vào bảng thống kê (tên nhóm — số lượng).\n\n" +
                "**Ví dụ:** Điều tra 30 bạn về màu yêu thích → lập bảng: Đỏ: 8, Xanh: 12, Vàng: 10.",
              knowledgeNoteCaution:
                "- Mỗi đối tượng chỉ được đếm **một lần** trong một nhóm — không được đếm trùng hay bỏ sót.\n" +
                "- Kiểm tra tổng các nhóm bằng tổng số đối tượng điều tra để phát hiện sai sót.",
              knowledgeNoteExtension:
                "Thống kê được dùng khắp nơi: thời tiết, điểm thi, lượng mưa hằng tháng... " +
                "Lên lớp 5 em sẽ học vẽ biểu đồ cột và biểu đồ hình quạt để trình bày dữ liệu đẹp hơn.",
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
              knowledgeNoteRemember:
                "**Xác suất thực nghiệm** là tỉ lệ số lần một sự kiện xảy ra trên tổng số lần thử.\n\n" +
                "$$\\text{Xác suất thực nghiệm} = \\frac{\\text{Số lần sự kiện xảy ra}}{\\text{Tổng số lần thử}}$$\n\n" +
                "**Các mức khả năng xảy ra:**\n" +
                "- *Chắc chắn xảy ra*: luôn luôn đúng (vd: tung đồng xu luôn ra mặt sấp hoặc ngửa).\n" +
                "- *Có thể xảy ra*: đôi khi đúng (vd: tung đồng xu ra mặt ngửa).\n" +
                "- *Không thể xảy ra*: không bao giờ đúng (vd: tung đồng xu ra mặt thứ ba).\n\n" +
                "**Ví dụ:** Tung đồng xu 10 lần, ra ngửa 6 lần → xác suất thực nghiệm $= \\frac{6}{10} = \\frac{3}{5}$.",
              knowledgeNoteCaution:
                "- Xác suất thực nghiệm *có thể khác* xác suất lý thuyết — càng thử nhiều lần, hai giá trị càng gần nhau.\n" +
                "- Không nhầm *\"có thể xảy ra\"* với *\"chắc chắn xảy ra\"*: mặt ngửa của đồng xu chỉ là *có thể*, không phải *chắc chắn*.",
              knowledgeNoteExtension:
                "Xác suất xuất hiện trong nhiều trò chơi và dự báo thời tiết. " +
                "Lên lớp 7–8 em sẽ học cách tính xác suất lý thuyết và so sánh với thực nghiệm một cách chặt chẽ hơn.",
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
              knowledgeNoteRemember:
                "**Phân số** $\\dfrac{a}{b}$ ($b \\neq 0$) có:\n" +
                "- **Tử số** $a$: số ở trên gạch ngang.\n" +
                "- **Mẫu số** $b$: số ở dưới gạch ngang — cho biết chia thành bao nhiêu phần bằng nhau.\n\n" +
                "**Liên hệ phép chia:**\n" +
                "$$a \\div b = \\frac{a}{b} \\quad (b \\neq 0)$$\n\n" +
                "**Ví dụ:** Chia $3$ cái bánh cho $4$ bạn, mỗi bạn được $3 \\div 4 = \\dfrac{3}{4}$ cái bánh.",
              knowledgeNoteCaution:
                "- Mẫu số **không được bằng $0$** — chia cho $0$ không có nghĩa.\n" +
                "- Phân số $\\dfrac{a}{a} = 1$ và $\\dfrac{0}{a} = 0$ (với $a \\neq 0$) — nhớ hai trường hợp đặc biệt này.",
              knowledgeNoteExtension:
                "Phân số là cách ghi kết quả của mọi phép chia, kể cả khi không chia hết. " +
                "Lên lớp 5 em sẽ học phân số thập phân và số thập phân — thực ra đó cũng là phân số có mẫu $10$, $100$, $1\\,000$.",
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
              knowledgeNoteRemember:
                "**Rút gọn phân số** là chia cả tử và mẫu cho cùng một số tự nhiên lớn hơn $1$.\n\n" +
                "**Phân số tối giản:** không thể rút gọn thêm được nữa (tử và mẫu chỉ có ước chung là $1$).\n\n" +
                "**Cách rút gọn nhanh:**\n" +
                "1. Tìm **ước chung lớn nhất** (ƯCLN) của tử và mẫu.\n" +
                "2. Chia cả tử và mẫu cho ƯCLN đó.\n\n" +
                "**Ví dụ:** Rút gọn $\\dfrac{12}{18}$: ƯCLN$(12, 18) = 6$ → $\\dfrac{12 \\div 6}{18 \\div 6} = \\dfrac{2}{3}$.",
              knowledgeNoteCaution:
                "- Phải chia **cả tử lẫn mẫu** cho cùng một số — không được chia chỉ tử hoặc chỉ mẫu.\n" +
                "- Rút gọn nhiều bước cũng được, nhưng nên rút gọn một lần bằng ƯCLN để nhanh hơn.",
              knowledgeNoteExtension:
                "Rút gọn phân số giúp tính toán nhanh hơn và đơn giản hơn khi cộng, trừ, nhân, chia phân số. " +
                "Lên lớp 5 em sẽ dùng kỹ năng này thường xuyên trong các bài phân số thập phân.",
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
              knowledgeNoteRemember:
                "**Quy đồng mẫu số** là đổi các phân số về cùng mẫu số mà không thay đổi giá trị.\n\n" +
                "**Cách thực hiện:**\n" +
                "1. Tìm **bội chung nhỏ nhất** (BCNN) của các mẫu số — đó là mẫu chung.\n" +
                "2. Nhân tử và mẫu của mỗi phân số với cùng thừa số để mẫu bằng BCNN.\n\n" +
                "**Ví dụ:** Quy đồng $\\dfrac{1}{4}$ và $\\dfrac{2}{6}$:\n" +
                "- BCNN$(4, 6) = 12$.\n" +
                "- $\\dfrac{1}{4} = \\dfrac{1 \\times 3}{4 \\times 3} = \\dfrac{3}{12}$; $\\dfrac{2}{6} = \\dfrac{2 \\times 2}{6 \\times 2} = \\dfrac{4}{12}$.",
              knowledgeNoteCaution:
                "- Phải nhân **cả tử lẫn mẫu** với cùng số — không được chỉ nhân mẫu.\n" +
                "- Nếu hai mẫu số đã là bội của nhau (vd $4$ và $8$), mẫu chung chính là số lớn hơn — không cần nhân thêm.",
              knowledgeNoteExtension:
                "Quy đồng mẫu số là bước chuẩn bị bắt buộc để cộng và trừ hai phân số khác mẫu. " +
                "Kỹ năng tìm BCNN sẽ được dùng lại nhiều lần trong chương trình lớp 5 và lớp 6.",
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
              knowledgeNoteRemember:
                "**So sánh phân số cùng mẫu:** so sánh tử số — tử lớn hơn thì phân số lớn hơn.\n\n" +
                "$$\\frac{3}{7} < \\frac{5}{7} \\text{ vì } 3 < 5$$\n\n" +
                "**So sánh phân số khác mẫu:** quy đồng mẫu số trước, rồi so sánh tử.\n\n" +
                "**Ví dụ:** So sánh $\\dfrac{2}{3}$ và $\\dfrac{3}{5}$:\n" +
                "- Quy đồng: $\\dfrac{10}{15}$ và $\\dfrac{9}{15}$.\n" +
                "- $10 > 9$ → $\\dfrac{2}{3} > \\dfrac{3}{5}$.",
              knowledgeNoteCaution:
                "- Không thể so sánh thẳng tử số khi mẫu số khác nhau — phải quy đồng trước.\n" +
                "- Phân số **lớn hơn $1$** khi tử $>$ mẫu; **bằng $1$** khi tử $=$ mẫu; **nhỏ hơn $1$** khi tử $<$ mẫu.",
              knowledgeNoteExtension:
                "So sánh phân số giúp em chọn phần lớn hơn khi chia bánh, so sánh tốc độ tăng trưởng, ... " +
                "Lên lớp 6 em sẽ so sánh số hữu tỉ — mở rộng từ phân số sang cả số âm.",
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
              knowledgeNoteRemember:
                "**Cộng hai phân số cùng mẫu:** cộng tử số, giữ nguyên mẫu số.\n\n" +
                "$$\\frac{a}{c} + \\frac{b}{c} = \\frac{a + b}{c}$$\n\n" +
                "**Cộng hai phân số khác mẫu:**\n" +
                "1. Quy đồng mẫu số.\n" +
                "2. Cộng tử số, giữ mẫu chung.\n" +
                "3. Rút gọn kết quả nếu có thể.\n\n" +
                "**Ví dụ:** $\\dfrac{1}{4} + \\dfrac{1}{6}$: quy đồng → $\\dfrac{3}{12} + \\dfrac{2}{12} = \\dfrac{5}{12}$.",
              knowledgeNoteCaution:
                "- **Không** cộng cả tử lẫn mẫu riêng: $\\dfrac{1}{3} + \\dfrac{1}{4} \\neq \\dfrac{2}{7}$ — lỗi rất phổ biến!\n" +
                "- Sau khi cộng, nhớ rút gọn kết quả về dạng tối giản.",
              knowledgeNoteExtension:
                "Cộng phân số dùng nhiều trong tính diện tích đất chia theo phần, bài toán hỗn số lớp 5. " +
                "Lên lớp 5 em sẽ cộng hỗn số (số tự nhiên + phân số) — cùng nguyên tắc nhưng có thêm phần nguyên.",
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
              knowledgeNoteRemember:
                "**Trừ hai phân số cùng mẫu:** trừ tử số, giữ nguyên mẫu số.\n\n" +
                "$$\\frac{a}{c} - \\frac{b}{c} = \\frac{a - b}{c}$$\n\n" +
                "**Trừ hai phân số khác mẫu:**\n" +
                "1. Quy đồng mẫu số.\n" +
                "2. Trừ tử số, giữ mẫu chung.\n" +
                "3. Rút gọn kết quả nếu có thể.\n\n" +
                "**Ví dụ:** $\\dfrac{3}{4} - \\dfrac{1}{6}$: quy đồng → $\\dfrac{9}{12} - \\dfrac{2}{12} = \\dfrac{7}{12}$.",
              knowledgeNoteCaution:
                "- Khi trừ phân số khác mẫu, phải quy đồng **trước** khi trừ — không được trừ thẳng tử với tử và mẫu với mẫu.\n" +
                "- Kết quả không âm khi phân số bị trừ lớn hơn hoặc bằng phân số trừ; nếu kết quả âm thì kiểm tra lại.",
              knowledgeNoteExtension:
                "Trừ phân số ứng dụng trong bài toán tìm phần còn lại: nếu ăn $\\frac{1}{3}$ cái bánh, còn lại $1 - \\frac{1}{3} = \\frac{2}{3}$ cái. " +
                "Lên lớp 5 em sẽ trừ hỗn số với phần tử có thể nhỏ hơn — cần đổi hỗn số trước khi trừ.",
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
              knowledgeNoteRemember:
                "**Nhân hai phân số:** nhân tử với tử, nhân mẫu với mẫu.\n\n" +
                "$$\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}$$\n\n" +
                "**Cách rút gọn chéo trước khi nhân** (để đơn giản hơn):\n" +
                "Rút gọn tử của phân số này với mẫu của phân số kia nếu có ước chung.\n\n" +
                "**Ví dụ:** $\\dfrac{2}{3} \\times \\dfrac{9}{4}$: rút gọn $2$ với $4$ (÷2), và $9$ với $3$ (÷3):\n" +
                "$$\\dfrac{1}{1} \\times \\dfrac{3}{2} = \\dfrac{3}{2}$$",
              knowledgeNoteCaution:
                "- Nhân phân số **không** cần quy đồng mẫu — chỉ nhân thẳng tử với tử, mẫu với mẫu.\n" +
                "- Nên rút gọn chéo trước khi nhân để tránh tử số và mẫu số quá lớn.",
              knowledgeNoteExtension:
                "Nhân phân số được dùng để tính phần của một phần: $\\frac{1}{2}$ của $\\frac{3}{4}$ chiếc bánh $= \\frac{3}{8}$ chiếc. " +
                "Lên lớp 5 em sẽ nhân phân số với số tự nhiên và hỗn số.",
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
              knowledgeNoteRemember:
                "**Chia phân số:** nhân phân số bị chia với phân số **nghịch đảo** của phân số chia.\n\n" +
                "$$\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c} = \\frac{a \\times d}{b \\times c}$$\n\n" +
                "**Phân số nghịch đảo** của $\\dfrac{c}{d}$ là $\\dfrac{d}{c}$ (đổi chỗ tử và mẫu).\n\n" +
                "**Ví dụ:** $\\dfrac{3}{4} \\div \\dfrac{2}{5} = \\dfrac{3}{4} \\times \\dfrac{5}{2} = \\dfrac{15}{8}$.",
              knowledgeNoteCaution:
                "- Chỉ **đảo ngược phân số chia** (phân số đứng sau dấu ÷), không đảo phân số bị chia.\n" +
                "- Sau khi đổi dấu ÷ thành × và đảo phân số chia, thực hiện phép nhân bình thường.",
              knowledgeNoteExtension:
                "Chia phân số xuất hiện trong bài toán: *$\\frac{3}{4}$ lít nước chia đều vào các chai $\\frac{1}{8}$ lít — được bao nhiêu chai?* " +
                "Lên lớp 6 em sẽ chia số hữu tỉ — cùng quy tắc nhân nghịch đảo.",
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
              knowledgeNoteRemember:
                "**Nội dung ôn tập số học cuối năm:**\n\n" +
                "- Đọc, viết, so sánh số đến 6 chữ số; làm tròn số.\n" +
                "- Phép cộng, trừ số có nhiều chữ số (có nhớ).\n" +
                "- Phép nhân số có nhiều chữ số với số có 1 và 2 chữ số.\n" +
                "- Phép chia số có nhiều chữ số cho số có 1 và 2 chữ số.\n" +
                "- Nhân, chia với $10$, $100$, $1\\,000$.\n" +
                "- Đổi đơn vị đo độ dài, khối lượng, dung tích.\n\n" +
                "**Gợi ý ôn:** luyện từng dạng rồi làm đề tổng hợp theo thứ tự từ dễ đến khó.",
              knowledgeNoteCaution:
                "- Khi làm bài tổng hợp, xác định **dạng bài** trước để chọn đúng phương pháp.\n" +
                "- Kiểm tra đơn vị trong kết quả — quên ghi đơn vị thường mất điểm trong các bài kiểm tra.",
              knowledgeNoteExtension:
                "Ôn tập cuối năm giúp em tự nhìn lại toàn bộ kiến thức đã học. " +
                "Những gì em chắc chắn nhất sẽ là nền tảng vững cho lớp 5 — đặc biệt là phép nhân, chia và phân số.",
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
              knowledgeNoteRemember:
                "**Nội dung ôn tập phân số cuối năm:**\n\n" +
                "- Khái niệm phân số, tử số, mẫu số; phân số và phép chia.\n" +
                "- Rút gọn phân số về dạng tối giản.\n" +
                "- Quy đồng mẫu số để so sánh và tính toán.\n" +
                "- Cộng, trừ phân số cùng mẫu và khác mẫu.\n" +
                "- Nhân hai phân số (tử nhân tử, mẫu nhân mẫu).\n" +
                "- Chia phân số (nhân với nghịch đảo của phân số chia).\n\n" +
                "**Gợi ý ôn:** rút gọn trước khi tính để tránh số lớn.",
              knowledgeNoteCaution:
                "- Cộng/trừ phân số khác mẫu: **bắt buộc quy đồng trước** — không được bỏ bước này.\n" +
                "- Nhân và chia phân số: **không** quy đồng — áp dụng đúng quy tắc từng phép.",
              knowledgeNoteExtension:
                "Phân số là mảng kiến thức quan trọng nhất của lớp 4 — em sẽ dùng lại liên tục ở lớp 5 (phân số thập phân, tỉ số, tỉ lệ) và lớp 6 (số hữu tỉ).",
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
