# Shopee AI Support - HCAI Design Day 18

Dự án này là bài tập thực hành thiết kế trải nghiệm trí tuệ nhân tạo lấy con người làm trung tâm (**Human-Centered AI Design**) thuộc chương trình **VinUni AI20k - Batch 02 (Day 18 - Track 1)**.

Nhóm chúng tôi lựa chọn lát cắt trải nghiệm: **AI xử lý một yêu cầu đổi trả hoặc hoàn tiền (Return & Refund)** trên ứng dụng Shopee.

---

## 1. Giới thiệu dự án & Hướng dẫn chạy thử Prototype

Để giúp người chấm bài (grader) dễ dàng kiểm tra toàn bộ luồng trải nghiệm mà không cần kết nối API thật, chúng tôi đã xây dựng giao diện dưới dạng **HCAI Dashboard 3 cột**:
*   **Cột Trái (Bảng điều khiển):** Cho phép reset trạng thái và chuyển đổi qua lại giữa 5 kịch bản thiết kế bắt buộc.
*   **Cột Giữa (Khung điện thoại di động):** Chạy giả lập ứng dụng chat Shopee AI Support thực tế để người dùng tương tác.
*   **Cột Phải (Chú thích thiết kế):** Tự động đồng bộ và hiển thị phân tích HCAI (AI biết gì, giới hạn gì, cơ chế feedback ra sao) tương ứng với từng bước tương tác đang diễn ra ở cột giữa.

### Hướng dẫn chạy thử:
1.  Mở tệp [index.html](file:///c:/Users/LocND/Desktop/api/Day18-Track1/shopee_ai_agent_prototype/index.html) trực tiếp bằng bất kỳ trình duyệt web nào (Chrome, Safari, Edge, Firefox).
2.  Bấm vào các kịch bản từ 1 đến 5 trên **Bảng điều khiển** (Cột trái) để kiểm tra các luồng thiết kế.
3.  Tương tác với khung chat ở cột giữa và đọc các chú thích HCAI tương ứng ở cột phải.

---

## 2. Đặc tả thiết kế 4 giai đoạn trải nghiệm (HCAI)

### Giai đoạn A – Onboarding (Thiết lập kỳ vọng)
Để tránh tình trạng người dùng kỳ vọng quá mức (Overtrust) hoặc không tin tưởng AI (Undertrust), màn hình Onboarding hiển thị rõ ràng trước khi chat:
*   **AI có thể làm gì:** Quét hình ảnh bằng chứng lỗi sản phẩm, tự động lập đơn nháp và đề xuất số tiền hoàn lại.
*   **Giới hạn của AI:** AI chỉ xử lý tự động với các đơn hàng dưới **5.000.000đ**; AI không thể tự động can thiệp vào tài khoản ngân hàng cá nhân của người dùng.
*   **Quyền truy cập dữ liệu:** AI cần đọc thông tin đơn hàng hiện tại (#SPX123456) và yêu cầu quyền sử dụng camera.
*   **Quyền kiểm soát của con người:** Khẳng định kết quả do AI đề xuất chỉ ở dạng **Bản nháp**. Người dùng có toàn quyền sửa đổi hoặc bỏ qua AI để kết nối với nhân viên tư vấn là người thật.

---

### Giai đoạn B – Trong khi AI hỗ trợ (While AI assists/acts)
*   **Ngữ cảnh sử dụng:** AI chủ động nhận diện đơn hàng người dùng đang xem để tránh bắt nhập liệu thủ công.
*   **Trạng thái hoạt động:** Khi người dùng gửi ảnh bằng chứng, màn hình quét (**Scanning Overlay**) xuất hiện kèm thanh tiến trình từ 0% đến 100% để hiển thị hệ thống đang hoạt động tích cực.
*   **Bằng chứng thị giác (Visual Evidence):** Khung bounding box màu xanh định vị sản phẩm lỗi/tag kích thước ngay trên ảnh quét để người dùng hiểu AI đang phân tích vùng dữ liệu nào.

---

### Giai đoạn C – Sau khi ra kết quả (After action/output)
*   **Phân biệt dữ liệu:** Mẫu đơn đề xuất của AI phân biệt rõ:
    *   *Dữ liệu cứng hệ thống:* Tên sản phẩm không thể chỉnh sửa.
    *   *Dữ liệu do AI suy diễn (Inferred data):* Lý do lỗi và số tiền hoàn trả được tô viền xanh lá cây nổi bật (**inferred-val**) kèm ghi chú "AI tự điền".
*   **Cách kiểm tra và sửa đổi:** Người dùng được quyền bấm vào ô nhập liệu để ghi đè số tiền/lý do hoặc bấm nút sửa đổi thông tin sản phẩm.
*   **Xác nhận bước tiếp theo:** AI nêu rõ hành động tiếp theo (Tiền sẽ hoàn vào ví ShopeePay trong 24h) sau khi người dùng bấm nút xác nhận.

---

### Giai đoạn D – Vòng phản hồi và khôi phục (Feedback & Recovery Loop)

Khi AI hoạt động không hoàn hảo, hệ thống xử lý khôi phục lỗi theo đúng luồng thiết kế chuẩn:
> **AI sai/không chắc chắn** $\rightarrow$ **Người dùng phát hiện hoặc hệ thống tự nêu vấn đề** $\rightarrow$ **Người dùng phản hồi/sửa đổi** $\rightarrow$ **Hệ thống xác nhận đã hiểu** $\rightarrow$ **Đề xuất cách khôi phục** $\rightarrow$ **Người dùng hoàn thành mục tiêu** $\rightarrow$ **Hệ thống nói rõ điều được sửa/ghi nhớ.**

Chúng tôi đã hiện thực hóa vòng lặp này qua 2 kịch bản khôi phục lỗi chi tiết:

#### Kịch bản Khôi phục 1: Ảnh bằng chứng bị mờ (Độ tin cậy thấp - Uncertainty)
1.  **AI không chắc chắn:** AI quét ảnh mờ và phát hiện độ tin cậy thấp (Confidence: 40%).
2.  **Hệ thống tự nêu vấn đề:** AI hiển thị cảnh báo ảnh bị mờ và không phân tích rõ được vết nứt.
3.  **Người dùng phản hồi:** Người dùng bấm nút chọn mô tả bằng chữ thay vì chụp lại ảnh.
4.  **Người dùng cung cấp bối cảnh:** Người dùng nhập: *"Đáy cốc bị nứt dài khoảng 5cm"*.
5.  **Hệ thống xác nhận đã hiểu:** AI phản hồi: *"AI đã ghi nhận mô tả đính chính: 'Đáy cốc bị nứt dài khoảng 5cm'"*.
6.  **Đề xuất khôi phục:** AI cập nhật lại đơn nháp hoàn tiền với đúng nội dung mô tả của khách hàng.
7.  **Người dùng hoàn thành mục tiêu:** Người dùng kiểm tra lại thông tin và xác nhận hoàn tiền thành công.

#### Kịch bản Khôi phục 2: AI nhận diện nhầm sản phẩm (Sai sót hệ thống - Error)
1.  **AI đưa kết quả sai:** AI quét hình ảnh cốc vỡ nhưng nhận diện nhầm sản phẩm lỗi thành *"Áo thun Polo Nam"*.
2.  **Người dùng phát hiện:** Người dùng nhìn thấy tên sản phẩm lỗi hiển thị trên form nháp không đúng.
3.  **Người dùng sửa lỗi:** Người dùng bấm nút *"Sửa thông tin sản phẩm"* và chọn đính chính *"Đây là Cốc thủy tinh"*.
4.  **Hệ thống xác nhận đã hiểu:** AI phản hồi xin lỗi vì sự nhận diện sai lệch và xác nhận đính chính sang Cốc thủy tinh.
5.  **Đề xuất khôi phục:** AI cập nhật lại toàn bộ đơn nháp (đúng sản phẩm Cốc thủy tinh, tự động điều chỉnh số tiền hoàn từ 250k của áo thun về đúng 150k của cốc).
6.  **Hệ thống nói rõ điều được sửa:** Form hiển thị thông tin cập nhật ghi rõ *"Đã cập nhật đúng"*.
7.  **Người dùng hoàn thành mục tiêu:** Bấm xác nhận duyệt hoàn tiền thành công.

---

## 3. Các cơ chế phản hồi ngầm định & Dự phòng nhân sự (Human Backup)

*   **Thời gian dừng (Dwell Time - Implicit Feedback):** Nếu người dùng dừng lại ở bước kiểm tra đơn nháp quá **12 giây** mà không thực hiện bất kỳ thao tác nào, hệ thống ngầm hiểu người dùng đang gặp khó khăn. AI sẽ chủ động gửi tin nhắn hỏi thăm và đề xuất nút chuyển giao trực tiếp cho nhân viên hỗ trợ.
*   **Tỷ lệ chuyển giao (Escalation Rate):** Bất cứ khi nào người dùng gõ từ khóa liên quan như *"nhân viên"*, *"người thật"*, *"cskh"* hoặc bấm nút headset ở góc trên bên phải, AI lập tức chuyển giao cuộc trò chuyện sang nhân viên CSKH kèm theo toàn bộ hình ảnh và lịch sử chat đã ghi nhận trước đó để nhân viên tiếp tục xử lý mà không cần bắt khách hàng giải thích lại từ đầu.
*   **Đánh giá hài lòng (Explicit Feedback):** Sau khi đơn hàng được duyệt hoàn tiền thành công, AI hiển thị nút bấm ngón tay Like/Dislike để người dùng đánh giá trực tiếp trải nghiệm. Dữ liệu này được ghi nhớ để tái huấn luyện mô hình AI của Shopee trong tương lai.

---

## 4. Các chỉ số đo lường hiệu quả thiết kế (HCAI Metrics)

Để đánh giá thiết kế này có thực sự hữu ích và lấy con người làm trung tâm hay không, nhóm đề xuất đo lường các chỉ số sau trên hệ thống thực tế:
1.  **Correction Rate (Tỷ lệ chỉnh sửa thông tin):** Tỷ lệ người dùng chỉnh sửa các ô thông tin do AI tự động điền. Tỷ lệ này cao chứng tỏ mô hình AI cần cải thiện độ chính xác, nhưng thiết kế form nháp vẫn đang hoạt động tốt vì cho phép người dùng kiểm soát.
2.  **Escalation Rate (Tỷ lệ chuyển giao người thật):** Tỷ lệ các phiên giao dịch phải chuyển giao sang nhân viên CSKH. Chỉ số này quá cao phản ánh luồng khôi phục lỗi tự động chưa đủ tốt để khách hàng tự tin hoàn thành.
3.  **Form Completion Rate (Tỷ lệ hoàn thành đơn):** Phần trăm người dùng đi từ màn hình Onboarding đến khi xác nhận đơn hoàn tiền thành công.
4.  **CSAT (Chỉ số hài lòng khách hàng):** Tỷ lệ lượt bình chọn Thumbs Up / Thumbs Down sau mỗi phiên giao dịch.