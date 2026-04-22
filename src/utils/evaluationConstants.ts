export const VOCAL_EVALUATION_CRITERIA = {
  luyen_thanh: [
    {
      key: "hoi_tho",
      label: "Hơi thở",
      options: [
        "Không kiểm soát được hơi",
        "Hụt hơi thường xuyên",
        "Hơi không đều, hụt giữa câu",
        "Hơi ổn định, hụt nhẹ cuối câu",
        "Hơi rất tốt, giữ được câu dài",
      ],
      feedbacks: [
        {
          phat_hien: "Hơi quá yếu, không kiểm soát được, không đủ lực hát.",
          goi_y: "Cần luyện tập hít thở bụng cơ bản hàng ngày (15 phút).",
        },
        {
          phat_hien: "Còn hụt hơi thường xuyên ở các cụm từ trung bình.",
          goi_y: "Luyện thổi nến, lip trill kéo dài 10-15s để quen việc điều tiết.",
        },
        {
          phat_hien: "Hơi chưa ổn định, hay bị hụt ngang ở giữa câu hát dài.",
          goi_y: "Cần ngắt nghỉ đúng chỗ, phân bổ sức chú ý đẩy hơi đều.",
        },
        {
          phat_hien: "Kiểm soát hơi thở ổn định, thỉnh thoảng hụt nhẹ đuôi câu.",
          goi_y: "Giữ trụ bụng vững hơn ở những nốt cuối.",
        },
        {
          phat_hien: "Hơi thở rất tuyệt vời, làm chủ được các câu hát dài.",
          goi_y: "Tiếp tục duy trì và khởi động kỹ trước khi tập bài khó.",
        },
      ],
    },
    {
      key: "khau_hinh",
      label: "Khẩu hình",
      options: [
        "Khép chặt, âm bị nghẹt",
        "Mở chưa đủ, âm méo",
        "Mở khá tốt nhưng chưa đúng vị trí",
        "Khẩu hình đúng, âm thanh sáng",
        "Mở chuẩn, cộng minh cộng hưởng tốt",
      ],
      feedbacks: [
        {
          phat_hien: "Miệng khép quá chặt khiến âm thanh không thoát ra được.",
          goi_y: "Cần thả lỏng hàm dưới, ngáp nhẹ để mở khoang miệng.",
        },
        {
          phat_hien: "Mở miệng chưa đủ độ vươn, hát rụt rè làm méo chữ.",
          goi_y: "Tập phát âm rõ các nguyên âm A, O, E trước gương.",
        },
        {
          phat_hien: "Đã biết cách mở khẩu hình nhưng thỉnh thoảng âm còn ngậm.",
          goi_y: "Chú ý nâng ngạc mềm, đưa âm thanh ra phía trước.",
        },
        {
          phat_hien: "Khẩu hình khá chuẩn xác, âm thanh phát ra bắt đầu có độ vang sáng.",
          goi_y: "Kiểm soát độ bật của môi và linh hoạt cơ mặt hơn.",
        },
        {
          phat_hien: "Khẩu hình mở chuẩn không cần chỉnh, cộng hưởng rất tuyệt.",
          goi_y: "Tiếp tục phát huy độ mở khoang miệng chuẩn này.",
        },
      ],
    },
  ],
  hat_bai: [
    {
      key: "cao_do",
      label: "Cao độ",
      options: [
        "Không giữ được melody",
        "Lệch tông rõ rệt",
        "Sai nhiều ở đoạn cao",
        "Sai nhẹ 1–2 chỗ",
        "Gần như không sai nốt",
      ],
      feedbacks: [
        {
          phat_hien: "Chưa định hình được giai điệu, không bắt được tone.",
          goi_y: "Cần tập xướng âm cơ bản với đàn piano chậm rãi.",
        },
        {
          phat_hien: "Có cảm nhận nhưng thường xuyên bị lệch tông gốc.",
          goi_y: "Luyện nghe nốt và đánh đàn hát theo từng chữ thật chậm.",
        },
        {
          phat_hien: "Thường xuyên với không tới hoặc hát phô ở các nhịp điệp khúc.",
          goi_y: "Chưa biết chuyển giọng óc, cần tập mix voice nhẹ nhàng.",
        },
        {
          phat_hien: "Cảm âm tốt, thỉnh thoảng chênh nhẹ ở những nốt chuyển.",
          goi_y: "Tập trung lấy đà và vị trí âm thanh khi lên cao.",
        },
        {
          phat_hien: "Hát chuẩn xác tuyệt đối các nốt nhạc.",
          goi_y: "Rất tốt, chuyển sang áp dụng kỹ thuật luyến láy để bài mượt hơn.",
        },
      ],
    },
    {
      key: "nhip",
      label: "Nhịp",
      options: [
        "Mất nhịp hoàn toàn",
        "Sai nhịp nhiều",
        "Lúc nhanh lúc chậm",
        "Lệch nhẹ vài phách",
        "Chuẩn xác 100%",
      ],
      feedbacks: [
        {
          phat_hien: "Hát hoàn toàn không khớp với nhạc beat.",
          goi_y: "Gõ nhịp chân, nghe drum beat và đếm 1-2-3-4.",
        },
        {
          phat_hien: "Vào sai nhịp liên tục ở đầu đoạn.",
          goi_y: "Kết hợp Metronome tốc độ chậm để làm quen lại phách mạnh.",
        },
        {
          phat_hien: "Lúc hát nhanh hơn nhạc, lúc lại tụt lại phía sau.",
          goi_y: "Nghe kỹ tiếng snare/kick, đừng nôn nóng hát trước beat.",
        },
        {
          phat_hien: "Cảm nhịp ổn, đôi lúc vào trễ ở những chỗ ngắt nghỉ lạ.",
          goi_y: "Phân tích kỹ tổng phổ bài hát ở những chỗ đảo phách.",
        },
        {
          phat_hien: "Bắt nhịp như một cỗ máy metronome, chuẩn không cần chỉnh.",
          goi_y: "Thử áp dụng hát rubato (cố tình lơi nhịp) để tạo feeling.",
        },
      ],
    },
    {
      key: "bieu_cam",
      label: "Biểu cảm",
      options: [
        "Hát vô hồn, như đọc vẹt",
        "Thiếu cảm xúc, hát cứng",
        "Có cảm xúc nhưng chưa sâu",
        "Biểu cảm tốt, xử lý tinh tế",
        "Thổi hồn vào bài hát cực cuốn",
      ],
      feedbacks: [
        {
          phat_hien: "Như đang trả bài, khuôn mặt và giọng hát không có cảm xúc.",
          goi_y: "Cần cảm nhận nội dung bài hát, hát trước gương.",
        },
        {
          phat_hien: "Có cố gắng nhưng giọng vẫn đều đều, thiếu điểm nhấn.",
          goi_y: "Sử dụng To - Nhỏ (Dynamics) vào cuối và đầu câu.",
        },
        {
          phat_hien: "Thể hiện được bài hát nhưng thiếu độ cao trào bùng nổ.",
          goi_y: "Chia bố cục bài hát thành 3 phần mức năng lượng.",
        },
        {
          phat_hien: "Biết cách thả nhỏ, tạo cao trào, xử lý khá tinh tế.",
          goi_y: "Khai thác thêm sự thay đổi màu sắc giọng hát.",
        },
        {
          phat_hien: "Thực sự lay động người nghe bằng cả giọng hát và diễn xuất.",
          goi_y: "Giữ vững phong độ này khi biểu diễn sân khấu nhé.",
        },
      ],
    },
    {
      key: "ky_thuat",
      label: "Kỹ thuật",
      options: [
        "Sai kỹ thuật cơ bản",
        "Áp dụng rất ít kỹ thuật",
        "Áp dụng khá, còn đôi chỗ gượng",
        "Xử lý kỹ thuật mượt mà",
        "Vận dụng xuất sắc, tự nhiên",
      ],
      feedbacks: [
        {
          phat_hien: "Đang gào thét, hát bằng cổ họng gây rát họng.",
          goi_y: "Dừng ngay việc hát bài cao, quay lại luyện thanh cơ bản.",
        },
        {
          phat_hien: "Hát bản năng là chủ yếu, ít áp dụng luyến/rung.",
          goi_y: "Tập thêm kỹ thuật Vibrato ở đuôi câu.",
        },
        {
          phat_hien: "Có áp dụng falsetto/vibrato nhưng còn thô, chưa tự nhiên.",
          goi_y: "Làm mềm mại lại các nốt chuyển giọng.",
        },
        {
          phat_hien: "Chuyển giọng mượt mà, biết dùng twang và mix voice.",
          goi_y: "Đẩy giới hạn thêm vào các note cao hơn.",
        },
        {
          phat_hien: "Kỹ thuật thượng thừa, kết hợp nhuần nhuyễn mọi thứ.",
          goi_y: "Tuyệt vời! Không còn gì để chê.",
        },
      ],
    },
  ],
};
