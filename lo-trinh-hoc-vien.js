/* ============================================================================
   LỘ TRÌNH KHÓA HỌC HỌC VIÊN — Tony Music Academy
   ----------------------------------------------------------------------------
   CÁCH GẮN VÀO APP (file Index.html production):
   1) Dán TOÀN BỘ khối này vào trong <script> chính, ngay TRƯỚC dòng
      "// ==================== KHỞI CHẠY (INIT) ====================" (trước bootApp();).
   2) Thêm 1 nút tab + 1 pane trong view hồ sơ học viên (xem hướng dẫn kèm theo).
   3) Trong hàm displayStudentProfileView(s) thêm 1 dòng:
         if (typeof renderCourseRoadmap === 'function') renderCourseRoadmap('roadmapBox', s);
   4) (Tùy chọn) Trong renderMySchedule(d) thêm 1 container để học viên tự xem lộ trình.
   Khối này chỉ dùng các hàm có sẵn: $, esc, courseInfo (đều đã có trong app).
   Không đổi backend, không đổi schema.
============================================================================ */

const RM_RANK_SEQ = ['A', 'B', 'C', 'D'];
const RM_RANK = {
  A: { ten: 'Sơ cấp',        mau: '#C5A059', nguong: '0–6 / 17' },
  B: { ten: 'Trung cấp sơ',  mau: '#34D399', nguong: '7–11 / 17' },
  C: { ten: 'Trung cấp',     mau: '#6bb0e0', nguong: '12–14 / 17' },
  D: { ten: 'Khá / Tốt',     mau: '#b78fe0', nguong: '15–17 / 17' }
};
const RM_GOAL = {
  G1: { label: '🎤 Hát Karaoke',           target: 'B' },
  G2: { label: '☕ Giao lưu Cafe',          target: 'C' },
  G3: { label: '🎙 Vocalist chuyên nghiệp', target: 'D' },
  G4: { label: '🎓 Thi trường Âm nhạc',     target: 'D' }
};

/* Mỗi khóa = 6 buổi. Mỗi buổi: k = kỹ thuật trọng tâm, n = nội dung chính,
   b = bài hát gợi ý (tùy), h = bài tập về nhà. Buổi 6 của mỗi khóa là TEST. */
const RM_CURRICULUM = {
  A: [
    { code: 'A1', ten: 'Nền tảng Hơi thở & Nhận diện Giọng', s: [
      { k: 'Đánh giá giọng & Giới thiệu', n: 'Test quãng giọng (thấp→cao), xác định loại giọng, giải thích hệ thống Rank, đặt mục tiêu cá nhân.', b: 'Hát 1 bài tự chọn để GV đánh giá', h: 'Ghi âm giọng nói 1 phút, nghe lại' },
      { k: 'Hơi thở cơ hoành (Diaphragm)', n: 'Cơ chế hơi thở từ cơ hoành vs ngực; tư thế đứng/ngồi đúng; bài tập "sss" kéo dài hơi.', b: 'Hát câu ngắn (1 câu nhạc) giữ hơi', h: 'Hít 4 – giữ 7 – thở 8, mỗi ngày 5 phút' },
      { k: 'Nhận diện cao độ (Pitch)', n: 'Nghe nốt đàn hát lại đúng; phân biệt cao-thấp; luyện tai nghe (ear training).', b: 'Hát theo đàn từng câu, GV sửa pitch', h: 'App Vocal Pitch Monitor 10 phút/ngày' },
      { k: 'Khẩu hình & Nguyên âm', n: '5 nguyên âm A-E-I-O-U: cách mở miệng, vị trí lưỡi, hàm; bài tập "Ma-Me-Mi-Mo-Mu".', b: 'Bài đơn giản chú ý khẩu hình nguyên âm', h: 'Nói chậm 5 nguyên âm trước gương 5 phút' },
      { k: 'Thang âm & Vocalise cơ bản', n: 'Thang trưởng 5 nốt (Do-Re-Mi-Fa-Sol); hát legato; nhận biết quãng 2 và 3.', b: 'Bài giai điệu theo thang âm đơn giản', h: 'Hát Do-Re-Mi-Fa-Sol-Fa-Mi-Re-Do mỗi ngày' },
      { k: 'TEST CUỐI KHÓA A1', n: 'Ôn toàn bộ 5 buổi; hát 1 bài hoàn chỉnh; GV chấm Scorecard 8 tiêu chí.', b: 'Bài tự chọn hoặc GV chọn', h: 'Xem lại video test, tự đánh giá' }
    ]},
    { code: 'A2', ten: 'Nhịp phách & Kiểm soát Hơi', s: [
      { k: 'Nhịp điệu với Metronome', n: 'Nhịp 4/4, phách mạnh-nhẹ; vỗ tay theo nhịp; hát vào đúng phách; đếm 1-2-3-4.', b: 'Bài nhịp 4/4 đơn giản theo metronome', h: 'Tập đếm nhịp khi nghe nhạc hằng ngày' },
      { k: 'Kiểm soát hơi câu ngắn', n: 'Hát trọn 1 câu không hụt hơi; lấy hơi nhanh giữa 2 câu; đánh dấu vị trí lấy hơi.', b: 'Bài 2 câu ngắn, lấy hơi đúng chỗ', h: 'Đọc to 1 đoạn văn, lấy hơi đúng dấu chấm' },
      { k: 'Ôn cao độ + Quãng 2-3', n: 'Nhảy quãng 2 (Do-Re) và quãng 3 (Do-Mi) chính xác; phân biệt trưởng/thứ; bài tập interval.', b: 'Bài có bước nhảy quãng 3', h: 'Luyện quãng 2-3 với đàn/app 10 phút' },
      { k: 'Ôn khẩu hình + Phụ âm', n: 'Phụ âm đầu (B, D, M, N, L) ghép nguyên âm; rõ lời; tránh nuốt âm cuối câu.', b: 'Bài chú ý phát âm rõ lời', h: 'Đọc lời bài hát to, rõ, chậm' },
      { k: 'Kết hợp Hơi + Pitch + Nhịp', n: 'Hát trọn 1 bài: đúng cao độ, đúng nhịp, không hụt hơi; GV sửa lỗi real-time.', b: 'Bài hoàn chỉnh (verse + chorus)', h: 'Ghi âm bài tập, nghe lại tìm lỗi' },
      { k: 'TEST CUỐI KHÓA A2', n: 'Hát 1 bài hoàn chỉnh + 1 vocalise; chấm Scorecard; so sánh điểm A1.', b: 'Bài test + vocalise', h: 'Tự đánh giá tiến bộ' }
    ]},
    { code: 'A3', ten: 'Mở rộng Giọng & Nhận biết Giọng', s: [
      { k: 'Giọng ngực (Chest Voice) cơ bản', n: 'Cảm nhận rung ngực khi hát nốt thấp; phân biệt giọng ngực vs giọng cổ (sai); hát vùng thoải mái.', b: '', h: 'Nói to ở nhà, cảm nhận rung ngực' },
      { k: 'Mở rộng quãng xuống (+1-2 nốt)', n: 'Mở cổ họng, hạ thanh quản nhẹ; hát nốt thấp hơn bình thường mà không gằn.', b: '', h: 'Hát theo đàn nốt thấp dần' },
      { k: 'Mở rộng quãng lên (+1-2 nốt)', n: 'Nhẹ giọng khi lên cao (không gào); giới thiệu falsetto tự nhiên; tìm "ceiling" an toàn.', b: '', h: 'Lip Trill lên cao mỗi ngày' },
      { k: 'Vocalise nâng cao', n: 'Pattern 5 nốt + arpeggio (Do-Mi-Sol-Mi-Do); bán cung; chuyển tông (transpose).', b: '', h: 'Luyện pattern theo audio hướng dẫn' },
      { k: 'Ứng dụng tổng hợp A1-A3', n: 'Hát 1 bài mới, tự phân tích (đánh dấu lấy hơi, nốt cao, nốt thấp); cách "đọc" bài hát.', b: 'Bài mới học viên tự chọn', h: 'Tự phân tích 1 bài hát mới' },
      { k: 'TEST CUỐI KHÓA A3', n: 'Vocalise + bài hát; Scorecard; đánh giá đủ điều kiện bước vào Rank B chưa.', b: '', h: 'Tự đánh giá' }
    ]},
    { code: 'A4', ten: 'Củng cố & Mở rộng Repertoire', s: [
      { k: 'Ôn kỹ thuật chưa vững (theo Scorecard)', n: 'Rà các tiêu chí còn yếu ở A1-A3 và luyện lại trọng tâm.', b: 'Bài vừa sức', h: 'Luyện đúng tiêu chí yếu 10 phút/ngày' },
      { k: 'Kiểm soát hơi câu dài hơn', n: 'Giữ hơi ổn định cho câu dài; phân bổ hơi hợp lý.', b: 'Bài có câu dài', h: 'Giữ "sss" 20 giây' },
      { k: 'Dynamics cơ bản (to - nhỏ)', n: 'Bắt đầu hát to-nhỏ có kiểm soát trong 1 câu.', b: 'Bài ballad nhẹ', h: 'Tập crescendo trên 1 nốt' },
      { k: 'Mở rộng thể loại bài hát', n: 'Thêm 1-2 bài mới ở thể loại khác để làm dày repertoire.', b: 'Bài thể loại mới', h: 'Nghe & tập 1 bài mới' },
      { k: 'Ứng dụng tổng hợp', n: 'Hát hoàn chỉnh 1 bài kết hợp hơi + pitch + nhịp + dynamics cơ bản.', b: 'Bài hoàn chỉnh', h: 'Ghi âm, nghe lại' },
      { k: 'TEST CUỐI KHÓA A4', n: 'Vocalise + bài hát; Scorecard; đánh giá tiến bộ.', b: '', h: 'Tự đánh giá' }
    ]},
    { code: 'A5', ten: 'Củng cố nâng cao', s: [
      { k: 'Ôn luyện toàn diện', n: 'Luyện lại toàn bộ nền tảng, chuẩn hóa thói quen hát đúng.', b: 'Bài vừa sức', h: 'Warm-up đầy đủ mỗi ngày' },
      { k: 'Hơi thở & Pitch nâng cao', n: 'Giữ pitch ổn định ở câu dài, nhảy quãng chắc chắn hơn.', b: '', h: 'Luyện interval + giữ hơi' },
      { k: 'Chest Voice vững hơn', n: 'Hát verse chắc bằng giọng ngực, không gằn.', b: 'Bài pop verse mạnh', h: 'Ghi âm verse' },
      { k: 'Mở rộng quãng an toàn', n: 'Tiếp tục nới quãng cao/thấp trong giới hạn an toàn.', b: '', h: 'Sirene/Lip trill mở rộng' },
      { k: 'Tổng hợp repertoire', n: 'Hoàn thiện 2-3 bài "tủ" ở nhiều thể loại.', b: '2-3 bài tủ', h: 'Ghi âm bộ bài tủ' },
      { k: 'TEST CUỐI KHÓA A5', n: 'Vocalise + bài hát; Scorecard; chuẩn bị Test Rank lên B.', b: '', h: 'Tự đánh giá' }
    ]},
    { code: 'A6', ten: 'Chuẩn bị & TEST RANK lên B', s: [
      { k: 'Ôn trọng tâm theo Scorecard', n: 'Tập trung các tiêu chí còn thiếu điểm để vượt ngưỡng Rank B.', b: 'Bài phù hợp', h: 'Luyện tiêu chí yếu' },
      { k: 'Hơi thở câu dài + Pitch chắc', n: 'Chuẩn hóa hơi thở và cao độ cho bài thi Rank.', b: '', h: 'Giữ hơi + luyện pitch' },
      { k: 'Chest Voice + Dynamics cơ bản', n: 'Thể hiện giọng ngực chắc kết hợp to-nhỏ.', b: 'Bài có verse mạnh', h: 'Ghi âm có dynamics' },
      { k: 'Hoàn thiện bài test', n: 'Chọn & luyện kỹ 1 bài hoàn chỉnh cho Test Rank.', b: 'Bài test Rank', h: 'Tập thuộc & xử lý bài test' },
      { k: 'Tổng duyệt', n: 'Chạy thử toàn bộ bài thi + vocalise như thật.', b: 'Bài test Rank', h: 'Quay video chạy thử' },
      { k: 'TEST RANK — LÊN B', n: 'Vocalise 5 nốt + 1 bài hoàn chỉnh; cần đạt ≥ 7/17 điểm Rank Test để lên Rank B.', b: '', h: 'So sánh kết quả với các test trước' }
    ]}
  ],
  B: [
    { code: 'B1', ten: 'Legato, Staccato & Chest Voice', s: [
      { k: 'Legato (hát liền mượt)', n: 'Nối nốt không ngắt; breath flow liên tục; ứng dụng vào câu ballad.', b: 'Câu ballad mượt', h: 'Hát 1 câu ballad cực mượt' },
      { k: 'Staccato (hát nảy, ngắt)', n: 'Nốt ngắn, gọn, có lực; bài tập cơ hoành nảy; dùng khi nhạc vui, up-tempo.', b: 'Bài up-tempo', h: 'Tập "Ha" gọn theo metronome' },
      { k: 'Chest Voice luyện tập', n: 'Cảm nhận rung ngực rõ; vùng chest từng loại giọng; hát mạnh vùng thấp-trung; tránh gằn.', b: 'Bài pop verse mạnh', h: 'Hát verse mạnh ghi âm' },
      { k: 'Chest Voice ứng dụng bài hát', n: 'Hát verse hoàn toàn bằng Chest Voice đúng kỹ thuật; chuyển nói→hát tự nhiên.', b: 'Bài có verse chắc', h: 'Ghi âm verse, nghe rung ngực' },
      { k: 'Kết hợp Legato + Staccato + Chest', n: 'Hát 1 bài: verse chest, pre-chorus dynamics; biết đâu legato, đâu staccato.', b: 'Bài hoàn chỉnh', h: 'Hát cả bài, tự phân tích kỹ thuật' },
      { k: 'TEST CUỐI KHÓA B1', n: 'Vocalise legato + staccato + 1 bài; Scorecard; so sánh cuối Rank A.', b: '', h: 'Tự đánh giá' }
    ]},
    { code: 'B2', ten: 'Head Voice & Dynamics', s: [
      { k: 'Head Voice cơ bản', n: 'Cảm nhận rung đầu; phân biệt Head Voice vs Falsetto; bài tập "Oo" nhẹ vùng cao.', b: '', h: '"Oo" lên cao nhẹ nhàng mỗi ngày' },
      { k: 'Head Voice mở rộng', n: 'Hát nốt cao không gào; kiểm soát air flow; vượt qua "break" (vùng chuyển giọng).', b: '', h: 'Sirene 5 phút mỗi ngày' },
      { k: 'Dynamics: Piano → Forte', n: 'Hát nhỏ (p) có kiểm soát; hát to (f) không gào; crescendo trên 1 nốt.', b: '', h: 'Tập crescendo trên "Ah"' },
      { k: 'Dynamics trong bài', n: 'Verse nhỏ → chorus to; kỹ thuật build-up; câu đinh (climax) của bài.', b: 'Bài có dynamics rõ', h: 'Hát 1 bài có dynamics rõ ràng' },
      { k: 'Kết hợp Chest + Head + Dynamics', n: 'Verse (chest, nhỏ) → pre-chorus (build) → chorus (chest mạnh/head cao, to); vẽ "bản đồ kỹ thuật".', b: 'Bài hoàn chỉnh', h: 'Tự vẽ "bản đồ" kỹ thuật 1 bài mới' },
      { k: 'TEST CUỐI KHÓA B2', n: 'Tổng hợp B1-B2; Scorecard.', b: '', h: 'Tự đánh giá' }
    ]},
    { code: 'B3', ten: 'Mở rộng Quãng & Hơi thở nâng cao', s: [
      { k: 'Mở rộng quãng giọng ±3 nốt', n: 'Đánh giá range; mở cổ họng cho nốt thấp; placement cho nốt cao; mục tiêu +3 nốt mỗi hướng.', b: '', h: 'Luyện scale mở rộng có đàn' },
      { k: 'Hơi thở câu dài', n: 'Kiểm soát air flow câu 8-12 nhịp; tiết kiệm hơi; đánh dấu vị trí lấy hơi thông minh.', b: '', h: 'Tập giữ "sss" 25 giây+' },
      { k: 'Quãng nhảy xa: Quãng 4, 5', n: 'Nhảy quãng 4 (Do→Fa) và 5 (Do→Sol) chính xác; interval nâng cao; nhận biết quãng trong bài.', b: '', h: 'Luyện interval 4-5 với app' },
      { k: 'Mezza voce (nửa giọng)', n: 'Hát nửa sức mà vẫn rõ, vang; ứng dụng verse nhẹ, ballad; kiểm soát hơi tốt hơn.', b: 'Verse ballad nhẹ', h: 'Hát verse rất nhẹ, rõ lời' },
      { k: 'Tổng hợp Rank B', n: 'Hát 2 bài khác thể loại: 1 ballad (legato, dynamics) + 1 pop/rock (staccato, chest).', b: '2 bài khác thể loại', h: 'Ghi âm 2 bài, so sánh với đầu Rank B' },
      { k: 'TEST RANK — LÊN C', n: 'Vocalise + 1 bài có Chest/Head/Dynamics; cần đạt ≥ 12/17 điểm để lên Rank C.', b: '', h: 'So sánh kết quả với mọi test trước' }
    ]}
  ],
  C: [
    { code: 'C1', ten: 'Mixed Voice & Vùng chuyển giọng', s: [
      { k: 'Vùng chuyển giọng (Passaggio)', n: 'Xác định vị trí "break"; hiểu vì sao giọng vỡ/gãy; trượt qua vùng break nhẹ nhàng.', b: '', h: 'Sirene qua break nhẹ nhàng' },
      { k: 'Mixed Voice — Lý thuyết & Cảm nhận', n: 'Pha trộn Chest + Head; bài tập "Mum" qua passaggio; không gào, không falsetto thuần.', b: '', h: '"Mum" scale qua break 10 phút/ngày' },
      { k: 'Mixed Voice với nguyên âm', n: 'Luyện MV trên "Ah", "Eh", "Oh"; giữ balance Chest-Head; nhận biết khi "rơi" chest hoặc "bay" head.', b: '', h: 'Luyện MV trên 3 nguyên âm' },
      { k: 'Mixed Voice ứng dụng bài hát', n: 'Phân tích bài: đâu chest, đâu mixed, đâu head; hát chorus bằng Mixed Voice; sửa gằn/thắt/hụt hơi.', b: 'Bài có chorus cao', h: 'Hát bài có chorus cao, ghi âm' },
      { k: 'Mixed Voice nâng cao — Belt nhẹ', n: 'Từ MV thêm lực (light belt); kiểm soát áp suất hơi; hát nốt cao mạnh mà không gào; giới hạn an toàn.', b: '', h: 'Tập belt nhẹ 1-2 nốt trên break' },
      { k: 'TEST CUỐI KHÓA C1', n: 'Vocalise qua passaggio + bài có Mixed Voice rõ; Scorecard.', b: '', h: 'Tự đánh giá MV' }
    ]},
    { code: 'C2', ten: 'Vibrato & Phrasing', s: [
      { k: 'Vibrato nhập môn (Natural Vibrato)', n: 'Dao động pitch tự nhiên; phân biệt vibrato thật vs rung cổ/hàm (sai); giữ nốt rồi thả lỏng.', b: '', h: 'Giữ nốt 5s → thả lỏng, quan sát vibrato' },
      { k: 'Vibrato kiểm soát', n: 'Bật/tắt vibrato theo ý; điều chỉnh tốc độ (nhanh/chậm) và biên độ (rộng/hẹp).', b: '', h: 'Luyện bật-tắt vibrato' },
      { k: 'Phrasing & Interpretation', n: 'Cách "nói" 1 câu nhạc — nhấn đâu, nhẹ đâu, kéo đâu; "kể chuyện" qua giai điệu.', b: 'Bài phân tích phrasing', h: 'Nghe 1 bài, phân tích cách ca sĩ xử lý' },
      { k: 'Dynamics nâng cao (pp → ff)', n: 'Crescendo dài qua cả đoạn; decrescendo tinh tế cuối bài; kết hợp vibrato cuối câu.', b: 'Bài có dynamics "thở"', h: 'Hát 1 bài với dynamics "thở"' },
      { k: 'Biểu diễn sân khấu cơ bản', n: 'Tư thế, ánh mắt, tay, biểu cảm; cầm micro; quản lý năng lượng verse-chorus; "bán" cảm xúc.', b: 'Bài biểu diễn', h: 'Tập hát trước gương, quay video' },
      { k: 'TEST CUỐI KHÓA C2', n: 'Bài có vibrato + dynamics + phrasing + biểu diễn; Scorecard; đánh giá sẵn sàng lên D.', b: '', h: 'So sánh video đầu/cuối Rank C' }
    ]},
    { code: 'C3', ten: 'Mở rộng Range & Chuẩn bị Rank D', s: [
      { k: 'Mở rộng range +2-4 nốt', n: 'Placement cho nốt cực cao; hạ thanh quản cho nốt cực thấp; safety check (không cố quá).', b: '', h: 'Scale mở rộng an toàn' },
      { k: 'Thể loại: Pop / Ballad', n: 'Breathy tone, sustained notes, emotional delivery; hát 1 bài pop/ballad hoàn chỉnh.', b: 'Bài ballad', h: 'Hát 1 bài ballad ghi âm' },
      { k: 'Thể loại: R&B / Soul', n: 'Runs đơn giản, groove, syncopation; cảm giác nhịp lệch (off-beat).', b: 'Bài R&B', h: 'Nghe R&B, cảm nhận groove' },
      { k: 'Thể loại: Rock / Power', n: 'Chest voice mạnh, distortion nhẹ (an toàn), năng lượng cao; khi nào dùng belt mạnh.', b: 'Bài rock', h: 'Hát 1 bài rock ghi âm' },
      { k: 'Tổng hợp Rank C', n: 'Hát 2 bài khác thể loại thể hiện Mixed Voice, Vibrato, Dynamics, Phrasing, Biểu diễn.', b: '2 bài khác thể loại', h: 'Ghi âm 2 bài, tự chấm' },
      { k: 'TEST RANK — LÊN D', n: 'Vocalise qua passaggio + 2 bài (ballad + up-tempo); cần đạt ≥ 15/17 để lên Rank D.', b: '', h: 'So sánh kết quả toàn bộ lộ trình' }
    ]}
  ],
  D: [
    { code: 'D1', ten: 'Belting, Riff & Run, Thu âm', s: [
      { k: 'Belting an toàn (Safe Belting)', n: 'Hát nốt cao mạnh bằng giọng ngực pha; cry/twang + mixed + hơi thở đẩy; dấu hiệu cần dừng (đau, khản).', b: '', h: 'Tập belt 2-3 nốt trên break' },
      { k: 'Belting ứng dụng & Vibrato nâng cao', n: 'Belt trong chorus; kết hợp belt + vibrato cuối câu; kiểm soát belt dài; dynamics trong belt.', b: 'Bài có chorus belt', h: 'Hát chorus belt 1 bài, ghi âm' },
      { k: 'Riff & Run cơ bản', n: 'Chuỗi nốt nhanh, trang trí; bắt đầu 3-4 nốt chậm; pattern run đơn giản; dùng ở cuối câu, ad-lib.', b: '', h: 'Luyện pattern run chậm→nhanh' },
      { k: 'Riff & Run trung cấp + Ad-lib', n: 'Run 5-7 nốt; pentatonic runs; ad-lib cuối bài; phong cách R&B/Pop/Gospel runs.', b: '', h: 'Tự sáng tạo 2-3 run ngắn' },
      { k: 'Thu âm Studio & Microphone', n: 'Hát trước micro; khoảng cách micro; pop filter; kiểm soát breath noise; nhiều take; nghe playback tự sửa.', b: 'Bài thu âm', h: 'Thu âm 1 bài hoàn chỉnh (điện thoại chất lượng cao)' },
      { k: 'TEST CUỐI KHÓA D1', n: 'Vocalise nâng cao + 1 bài thể hiện belt + vibrato + run + dynamics; Scorecard cuối.', b: '', h: 'So sánh với điểm Rank C' }
    ]},
    { code: 'D2', ten: 'Phong cách & Biểu diễn chuyên nghiệp', s: [
      { k: 'Tìm phong cách cá nhân', n: 'Phân tích điểm mạnh/yếu, "màu" giọng; chọn thể loại phù hợp; xây repertoire 10 bài signature.', b: '10 bài signature', h: 'Liệt kê 10 bài yêu thích, phân tích vì sao' },
      { k: 'Xử lý bài nâng cao: Song Mapping', n: 'Map toàn bộ kỹ thuật cho từng câu (Chest/Mixed/Head, dynamics, vibrato, run); lên "kịch bản" trước khi hát.', b: 'Bài tự chọn', h: 'Tự map 1 bài mới hoàn chỉnh' },
      { k: 'Biểu diễn chuyên nghiệp', n: 'Movement trên sân khấu; tương tác khán giả; quản lý năng lượng set 3-5 bài; sound check; in-ear monitor.', b: 'Set 3 bài', h: 'Tập performance 3 bài liền' },
      { k: 'Thể loại chuyên sâu (theo mục tiêu)', n: 'Tuỳ chỉnh Pop/R&B/Rock/Jazz/Musical; kỹ thuật đặc trưng thể loại; bài đại diện.', b: '2 bài thể loại chuyên sâu', h: 'Hát 2 bài thể loại chuyên sâu' },
      { k: 'Mock Performance / Mock Audition', n: 'Hát 2-3 bài liên tục như thật; GV đánh giá như giám khảo; feedback chi tiết; quay video.', b: '2-3 bài', h: 'Xem lại video, tự phân tích' },
      { k: 'ĐÁNH GIÁ TỔNG KẾT TOÀN LỘ TRÌNH', n: 'Vocalise + 2 bài thể hiện toàn bộ kỹ thuật; Scorecard; so sánh với buổi đầu Rank A; cấp chứng nhận hoàn thành.', b: '2 bài', h: 'Lưu video so sánh đầu-cuối' }
    ]}
  ]
};

/* ---- Trạng thái + helper ---- */
let RM_LAST = null;   // { containerId, student, opts }

// Ưu tiên Mục tiêu đã lưu trong hồ sơ HV (mucTieuHoc) → localStorage → mặc định G3
function rmGetGoal(student) {
  if (student && RM_GOAL[student.mucTieuHoc]) return student.mucTieuHoc;
  try { const g = localStorage.getItem('tma_goal_' + (student && student.id)); if (RM_GOAL[g]) return g; } catch (e) {}
  return 'G3';
}
function rmChangeGoal(g) {
  if (!RM_LAST || !RM_GOAL[g]) return;
  const s = RM_LAST.student;
  s.mucTieuHoc = g;
  try { localStorage.setItem('tma_goal_' + s.id, g); } catch (e) {}
  // Lưu bền vững vào hồ sơ HV (nếu có field mucTieuHoc + quyền sửa học viên) để đồng bộ mọi thiết bị
  try {
    if (typeof API_RUN !== 'undefined' && typeof hasPerm === 'function' && hasPerm('students', 'edit')) {
      API_RUN.withSuccessHandler(function () {}).withFailureHandler(function () {}).saveStudent({ id: s.id, mucTieuHoc: g });
    }
  } catch (e) {}
  renderCourseRoadmap(RM_LAST.containerId, s, RM_LAST.opts);
}
function rmStat(label, val) {
  return '<div style="background:#0d1812;border:1px solid #1c2e21;border-radius:10px;padding:10px 12px">' +
    '<div style="font-size:11px;color:var(--mut)">' + esc(label) + '</div>' +
    '<div style="font-size:14px;font-weight:700;color:#fff;margin-top:2px">' + esc(val) + '</div></div>';
}
function rmPlan(rank, target) {
  const start = RM_CURRICULUM[rank] ? rank : 'A';
  const i0 = RM_RANK_SEQ.indexOf(start);
  let i1 = RM_RANK_SEQ.indexOf(target);
  if (i1 < i0) i1 = i0;
  const out = [];
  for (let i = i0; i <= i1 && i < RM_RANK_SEQ.length; i++) {
    const r = RM_RANK_SEQ[i];
    (RM_CURRICULUM[r] || []).forEach(function (c) { out.push({ rank: r, code: c.code, ten: c.ten, s: c.s }); });
  }
  return out;
}

/* ---- Render lộ trình đầy đủ (dùng ở hồ sơ học viên và màn "Lịch của tôi") ---- */
function renderCourseRoadmap(containerId, student, opts) {
  const box = (typeof $ === 'function') ? $(containerId) : document.getElementById(containerId);
  if (!box || !student) return;
  opts = opts || {};
  RM_LAST = { containerId: containerId, student: student, opts: opts };

  const rank = String(student.rank || 'A').toUpperCase();
  const useRank = RM_CURRICULUM[rank] ? rank : 'A';
  const goal = rmGetGoal(student);
  const target = (RM_GOAL[goal] || RM_GOAL.G3).target;
  const plan = rmPlan(useRank, target);
  const totalBuoi = plan.length * 6;

  let ci = null;
  try { ci = (typeof courseInfo === 'function') ? courseInfo(student) : null; } catch (e) { ci = null; }

  const goalSel = '<select onchange="rmChangeGoal(this.value)" style="width:auto;padding:6px 8px;font-size:12.5px">' +
    Object.keys(RM_GOAL).map(function (g) {
      return '<option value="' + g + '"' + (g === goal ? ' selected' : '') + '>' + RM_GOAL[g].label + '</option>';
    }).join('') + '</select>';

  const header =
    '<div class="panel" style="margin-bottom:14px;background:linear-gradient(135deg,' + RM_RANK[useRank].mau + '1f,#0d1812)">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">' +
        '<div><h3 style="margin:0;color:#fff">🧭 Lộ trình khóa học — ' + esc(student.hoTen || 'Học viên') + '</h3>' +
          '<div style="color:var(--mut);font-size:12.5px;margin-top:4px">Rank hiện tại: ' +
          '<b style="color:' + RM_RANK[useRank].mau + '">' + useRank + ' — ' + RM_RANK[useRank].ten + '</b> ' +
          '<small>(' + RM_RANK[useRank].nguong + ')</small></div></div>' +
        '<div style="text-align:right"><label style="font-size:11px;color:var(--gold);display:block;margin-bottom:3px">MỤC TIÊU HỌC</label>' + goalSel + '</div>' +
      '</div>' +
      '<div class="three" style="margin-top:12px;gap:10px">' +
        rmStat('Mục tiêu', (RM_GOAL[goal] || RM_GOAL.G3).label) +
        rmStat('Rank mục tiêu', 'Rank ' + target + ' — ' + RM_RANK[target].ten) +
        rmStat('Lộ trình dự kiến', plan.length + ' khóa · ~' + totalBuoi + ' buổi') +
      '</div>' +
      (ci && ci.size ? '<div style="margin-top:10px;color:#cfe2d6;font-size:12.5px">📈 Khóa hiện tại: đã học <b style="color:var(--teal)">' + ci.done + '/' + ci.size + '</b> buổi · còn <b style="color:var(--gold)">' + ci.left + '</b> buổi</div>' : '') +
      '<div style="margin-top:6px;color:var(--mut);font-size:11.5px">* Mỗi khóa 6 buổi, buổi cuối là Test Rank. <b>Đạt ngưỡng</b> → lên khóa mới; <b>chưa đạt</b> → ôn lại khóa cũ, tập trung kỹ thuật còn yếu.</div>' +
    '</div>';

  const courses = plan.map(function (c, idx) {
    const rinfo = RM_RANK[c.rank];
    const next = plan[idx + 1];
    const open = (c.rank === useRank) ? ' open' : '';
    const techs = c.s.slice(0, 5).map(function (x) { return x.k; });

    const sessions = c.s.map(function (x, i) {
      const isTest = /TEST|ĐÁNH GIÁ/.test(x.k);
      return '<div style="padding:8px 12px;border-top:1px solid #142019' + (isTest ? ';background:#141d12' : '') + '">' +
        '<div style="font-weight:700;color:' + (isTest ? 'var(--gold)' : '#fff') + '">Buổi ' + (i + 1) + ' — ' + esc(x.k) + '</div>' +
        '<div style="color:#cfe2d6;font-size:12.5px;margin-top:2px;line-height:1.5">' + esc(x.n) + '</div>' +
        (x.b ? '<div style="color:var(--teal);font-size:12px;margin-top:3px">🎵 Bài hát: ' + esc(x.b) + '</div>' : '') +
        (x.h ? '<div style="color:var(--gold);font-size:12px;margin-top:2px">📝 BTVN: ' + esc(x.h) + '</div>' : '') +
        '</div>';
    }).join('');

    const retest =
      '<div style="margin:10px 12px 12px;padding:10px 12px;border-radius:8px;background:#0b140f;border:1px dashed #2d4535;font-size:12.5px">' +
        '<b style="color:#fff">📊 Cuối khóa ' + c.code + ' → Test Rank:</b>' +
        '<div style="margin-top:5px;color:var(--teal)">✅ <b>Đạt</b> → học khóa tiếp theo: <b>' +
          (next ? (next.code + ' — ' + esc(next.ten)) : '🎓 Hoàn thành lộ trình (đạt Rank ' + target + ')') + '</b></div>' +
        '<div style="margin-top:3px;color:#ffb47a">❌ <b>Chưa đạt</b> → ôn lại khóa ' + c.code + ', tập trung kỹ thuật còn yếu: ' + esc(techs.join(' · ')) + '</div>' +
      '</div>';

    return '<details class="panel" style="margin-bottom:10px;padding:0;overflow:hidden"' + open + '>' +
      '<summary style="cursor:pointer;padding:12px 14px;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:8px">' +
        '<span><span class="badge" style="background:' + rinfo.mau + '22;color:' + rinfo.mau + '">Rank ' + c.rank + '</span> ' +
        '<b style="color:#fff">' + c.code + ' — ' + esc(c.ten) + '</b></span>' +
        '<span style="color:var(--mut);font-size:12px">6 buổi ▾</span>' +
      '</summary>' + sessions + retest + '</details>';
  }).join('');

  box.innerHTML = header + courses;
}
