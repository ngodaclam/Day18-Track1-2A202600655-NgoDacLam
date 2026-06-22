document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const chatContainer = document.getElementById('chat-container');
    const quickRepliesContainer = document.getElementById('quick-replies');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const uploadBtn = document.getElementById('upload-btn');
    
    const onboardingScreen = document.getElementById('onboarding-screen');
    const chatScreen = document.getElementById('chat-screen');
    const startOnboardingBtn = document.getElementById('start-onboarding-btn');
    
    const scanningOverlay = document.getElementById('scanning-overlay');
    const scanProgress = document.getElementById('scan-progress');
    const scanText = document.getElementById('scan-text');
    const highlightBoxSim = document.getElementById('highlight-box-sim');
    const appContainer = document.querySelector('.app-container');
    
    const rationaleDetails = document.getElementById('rationale-details');
    
    // --- State Variables ---
    let currentScenario = 'ONBOARDING'; // ONBOARDING, BROKEN_STANDARD, WRONG_SIZE, BLURRY_RECOVERY, MISMATCH_RECOVERY
    let currentStep = 0;
    let dwellTimer = null;
    let typingTimer = null;

    // --- HCAI Rationale Content Map ---
    const rationaleData = {
        ONBOARDING: {
            phase: 'A',
            title: 'Giai đoạn A: Onboarding & Thiết lập kỳ vọng',
            desc: 'Giúp người dùng hiểu đúng năng lực, giới hạn của AI ngay khi bắt đầu trải nghiệm.',
            points: [
                { badge: 'Năng lực AI', class: 'text-primary', text: 'Nêu rõ khả năng hỗ trợ quét ảnh lỗi, tự điền nhanh đơn và đề xuất phương án.' },
                { badge: 'Giới Hạn AI', class: 'text-warning', text: 'Giới hạn số tiền tự động duyệt (< 5 triệu) và không can thiệp ví ngân hàng ngoài hệ thống.' },
                { badge: 'Quyền Kiểm Soát', class: 'text-info', text: 'Khẳng định kết quả chỉ là "Bản nháp", người dùng có toàn quyền sửa đổi hoặc bỏ qua AI bất kỳ lúc nào.' }
            ],
            checklist: [true, false, false, false, true] // [Expectation, Provenance, Uncertainty, Recovery, Agency]
        },
        BROKEN_SELECT: {
            phase: 'B',
            title: 'Giai đoạn B: Trong khi AI hỗ trợ (Lựa chọn)',
            desc: 'Người dùng bắt đầu hành động và AI cung cấp ngữ cảnh rõ ràng.',
            points: [
                { badge: 'Thu Thập Ngữ Cảnh', class: 'text-primary', text: 'AI chủ động nhận diện mã đơn hàng #SPX123456 mà người dùng đang xem để khoanh vùng hỗ trợ.' },
                { badge: 'Gợi ý hành động', class: 'text-success', text: 'Đưa ra các nút trả lời nhanh (Quick Replies) giúp giảm tải gánh nặng nhập liệu.' }
            ],
            checklist: [true, true, false, false, true]
        },
        BROKEN_SCAN: {
            phase: 'B',
            title: 'Giai đoạn B: Trong khi AI hỗ trợ (Scanning)',
            desc: 'Hiển thị minh bạch tiến độ và bối cảnh hoạt động của AI.',
            points: [
                { badge: 'Trạng Thái Hệ Thống', class: 'text-info', text: 'Màn hình quét (Scanning Overlay) kèm thanh tiến trình từ 0% đến 100% giúp người dùng biết hệ thống vẫn đang hoạt động.' },
                { badge: 'Khoanh Vùng Lỗi', class: 'text-success', text: 'Simulate khung bounding box màu xanh định vị sản phẩm vỡ trong ảnh, cho người dùng biết AI đang nhìn vào đâu (Visual Evidence).' }
            ],
            checklist: [true, true, false, false, true]
        },
        BROKEN_FORM: {
            phase: 'C',
            title: 'Giai đoạn C: Đưa ra kết quả & Phân biệt dữ liệu',
            desc: 'Trình bày kết quả đề xuất của AI dưới dạng Bản nháp và hỗ trợ chỉnh sửa.',
            points: [
                { badge: 'Phân Biệt Dữ Liệu', class: 'text-success', text: 'Các ô nhập liệu do AI trích xuất được tô màu viền xanh lá (inferred-val) để phân biệt rõ với dữ liệu hệ thống (tên sản phẩm).' },
                { badge: 'Quyền Chỉnh Sửa', class: 'text-primary', text: 'Mọi ô thông tin đều cho phép chỉnh sửa trước khi xác nhận. Cảnh báo rõ ràng nếu số tiền lớn sẽ cần duyệt thủ công.' }
            ],
            checklist: [true, true, false, false, true]
        },
        WRONG_SIZE_SELECT: {
            phase: 'B',
            title: 'Giai đoạn B: Phối hợp chọn sản phẩm (Co-action)',
            desc: 'AI lấy dữ liệu thực tế của đơn hàng làm nền tảng tương tác.',
            points: [
                { badge: 'Truy xuất Đơn Hàng', class: 'text-primary', text: 'AI hiển thị danh sách các sản phẩm thực tế trong đơn #SPX123456 để người dùng chọn trực quan.' },
                { badge: 'Hành động phối hợp', class: 'text-info', text: 'Người dùng chọn áo thun Polo -> AI yêu cầu chụp tag size áo để đối chiếu dữ liệu.' }
            ],
            checklist: [true, true, false, false, true]
        },
        WRONG_SIZE_FORM: {
            phase: 'C',
            title: 'Giai đoạn C: Đối chiếu bằng chứng & Đề xuất',
            desc: 'Hiển thị lý do lập luận của AI để tăng tính thuyết phục.',
            points: [
                { badge: 'Lập Luận Của AI', class: 'text-primary', text: 'AI giải thích: phát hiện tag size M trong khi đơn hàng đặt size L, làm rõ lý do vì sao đề xuất hoàn trả.' },
                { badge: 'Đề xuất giá trị', class: 'text-success', text: 'Tự động tính toán số tiền hoàn dựa trên giá mua của sản phẩm đã chọn.' }
            ],
            checklist: [true, true, false, false, true]
        },
        BLURRY_UNCERTAIN: {
            phase: 'D',
            title: 'Giai đoạn D: Thừa nhận không chắc chắn (Low Confidence)',
            desc: 'AI không cố tình đoán mò khi dữ liệu đầu vào kém chất lượng.',
            points: [
                { badge: 'Độ Tin Cậy Thấp', class: 'text-warning', text: 'AI phát hiện ảnh mờ, cảnh báo mức độ tin cậy thấp (Confidence: 40%) thay vì đưa ra kết quả sai.' },
                { badge: 'Ủy quyền khôi phục', class: 'text-info', text: 'Cung cấp các lựa chọn khôi phục: nhập mô tả bằng chữ hoặc khoanh vùng lại vết nứt.' }
            ],
            checklist: [true, true, true, true, true]
        },
        BLURRY_RECOVERY_DONE: {
            phase: 'D',
            title: 'Giai đoạn D: Khôi phục bằng thông tin bổ sung',
            desc: 'Người dùng cung cấp thêm bối cảnh để AI hoàn thành mục tiêu.',
            points: [
                { badge: 'Khôi Phục Thành Công', class: 'text-success', text: 'Người dùng mô tả: "Đáy cốc bị nứt dài 5cm". AI ghi nhận, cập nhật lại form nháp và nói rõ đã hiểu bối cảnh mới.' },
                { badge: 'Lưu Lịch Sử', class: 'text-info', text: 'AI nói rõ: hệ thống đã cập nhật lý do mới dựa trên mô tả của bạn.' }
            ],
            checklist: [true, true, true, true, true]
        },
        MISMATCH_ERROR: {
            phase: 'D',
            title: 'Giai đoạn D: Phát hiện sai sót hệ thống',
            desc: 'Người dùng dễ dàng nhận ra lỗi của AI nhờ thiết kế minh bạch.',
            points: [
                { badge: 'Sai Sót Hệ Thống', class: 'text-danger', text: 'AI nhận diện sai cốc thủy tinh thành Áo thun Polo.' },
                { badge: 'Nút Đính Chính', class: 'text-primary', text: 'Thiết kế nút "Sửa thông tin sản phẩm" nổi bật ngay trên thẻ đề xuất giúp người dùng phản hồi lỗi ngay lập tức.' }
            ],
            checklist: [true, true, false, true, true]
        },
        MISMATCH_RECOVERY_DONE: {
            phase: 'D',
            title: 'Giai đoạn D: Khắc phục và Ghi nhớ sửa đổi',
            desc: 'AI phản hồi lịch sự, sửa sai và cập nhật lại trạng thái chuẩn xác.',
            points: [
                { badge: 'Phản Hồi Sửa Lỗi', class: 'text-success', text: 'AI phản hồi: xin lỗi vì nhận diện sai, xác nhận đính chính thành Cốc thủy tinh chịu nhiệt.' },
                { badge: 'Sửa Lỗi Hệ Thống', class: 'text-primary', text: 'Form được cập nhật lại đúng sản phẩm và số tiền của cốc thủy tinh (150.000đ).' }
            ],
            checklist: [true, true, false, true, true]
        },
        SUCCESS_EVAL: {
            phase: 'D',
            title: 'Giai đoạn D: Đánh giá chất lượng & Kết thúc',
            desc: 'Tạo vòng phản hồi hai chiều để cải tiến mô hình AI lâu dài.',
            points: [
                { badge: 'Thu Thập Đánh Giá', class: 'text-primary', text: 'Nút Like/Dislike thu thập phản hồi tường minh (Explicit Feedback) của người dùng về trải nghiệm AI.' },
                { badge: 'Chuyển Đổi Trực Quan', class: 'text-success', text: 'Màu sắc giao diện chuyển sang Xanh lục (Success Theme) khẳng định giao dịch đã hoàn thành an toàn.' }
            ],
            checklist: [true, true, false, true, true]
        },
        ESCALATED: {
            phase: 'D',
            title: 'Giai đoạn D: Chuyển giao sang Con người (Human Backup)',
            desc: 'Luôn cung cấp đường thoát an toàn khi AI không đáp ứng được yêu cầu.',
            points: [
                { badge: 'Chuyển Giao CSKH', class: 'text-warning', text: 'Khi người dùng yêu cầu hoặc AI nhận biết khó khăn (dwell time), hệ thống lập tức chuyển kết nối sang nhân viên thật.' },
                { badge: 'Bảo Toàn Bối Cảnh', class: 'text-info', text: 'Lịch sử chat được chuyển tiếp nguyên vẹn giúp nhân viên thật tiếp nhận ngay lập tức mà không cần hỏi lại khách hàng.' }
            ],
            checklist: [true, true, false, true, true]
        }
    };

    // --- Helper Functions ---
    const scrollToBottom = () => {
        setTimeout(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 50);
    };

    const getCurrentTime = () => {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    };

    const addMessage = (text, sender = 'agent', isHTML = false) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message-wrapper ${sender}`;
        
        let content = isHTML ? text : `<div class="bubble">${text}</div>`;
        if (sender === 'user') {
            content = `<div class="bubble">${text}<div class="time">${getCurrentTime()}</div></div>`;
        } else {
            content += `<div class="time">${getCurrentTime()}</div>`;
        }
        
        msgDiv.innerHTML = content;
        chatContainer.appendChild(msgDiv);
        scrollToBottom();
    };

    const showTypingIndicator = () => {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        chatContainer.appendChild(indicator);
        scrollToBottom();
    };

    const removeTypingIndicator = () => {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    };

    const setQuickReplies = (replies) => {
        quickRepliesContainer.innerHTML = '';
        if (replies.length === 0) {
            quickRepliesContainer.style.display = 'none';
            return;
        }
        quickRepliesContainer.style.display = 'flex';
        replies.forEach(reply => {
            const btn = document.createElement('button');
            btn.className = 'qr-btn';
            btn.innerText = reply.text;
            btn.onclick = () => {
                handleUserAction(reply.action, reply.text);
            };
            quickRepliesContainer.appendChild(btn);
        });
    };

    const simulateAgentTyping = (callback, delay = 1000) => {
        setQuickReplies([]); 
        showTypingIndicator();
        if (typingTimer) clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            removeTypingIndicator();
            callback();
        }, delay);
    };

    // --- Rationale Sync Manager ---
    const updateRationale = (key) => {
        const data = rationaleData[key];
        if (!data) return;

        // Update Phase step markers
        document.querySelectorAll('.phase-step').forEach(step => step.classList.remove('active'));
        const activeStep = document.getElementById(`phase-step-${data.phase}`);
        if (activeStep) activeStep.classList.add('active');

        // Update points
        let pointsHtml = `
            <h3>${data.title}</h3>
            <p class="rationale-desc">${data.desc}</p>
        `;
        data.points.forEach(pt => {
            pointsHtml += `
                <div class="rationale-point">
                    <span class="point-badge ${pt.badge.toLowerCase().includes('lỗi') || pt.badge.toLowerCase().includes('hạn') ? 'text-warning' : (pt.badge.toLowerCase().includes('kiểm') || pt.badge.toLowerCase().includes('năng') ? 'text-primary' : 'text-success')}">${pt.badge}</span>
                    <p>${pt.text}</p>
                </div>
            `;
        });
        rationaleDetails.innerHTML = pointsHtml;

        // Update checklist
        const chkIds = ['chk-1', 'chk-2', 'chk-3', 'chk-4', 'chk-5'];
        chkIds.forEach((id, index) => {
            const li = document.getElementById(id);
            if (li) {
                if (data.checklist[index]) {
                    li.className = 'completed';
                    li.querySelector('i').className = 'fa-solid fa-circle-check';
                } else {
                    li.className = '';
                    li.querySelector('i').className = 'fa-solid fa-circle-xmark';
                }
            }
        });
    };

    // --- Scenario Switcher ---
    window.switchScenario = (scenarioKey) => {
        if (dwellTimer) clearTimeout(dwellTimer);
        if (typingTimer) clearTimeout(typingTimer);
        
        currentScenario = scenarioKey;
        currentStep = 0;
        
        // Reset styles
        appContainer.classList.remove('success-mode');
        scanningOverlay.classList.remove('active');
        highlightBoxSim.style.opacity = 0;
        
        // Update active class on scenario control buttons
        document.querySelectorAll('.scen-btn').forEach(btn => btn.classList.remove('active'));
        
        // Clear chat
        chatContainer.innerHTML = `
            <div class="message system-msg time-stamp">Hôm nay ${getCurrentTime()}</div>
            <div class="message system-msg secure-notice">
                <i class="fa-solid fa-lock"></i> Lịch sử trò chuyện đã được mã hóa bảo mật.
            </div>
        `;

        if (scenarioKey === 'ONBOARDING') {
            document.getElementById('btn-onboarding').classList.add('active');
            onboardingScreen.classList.add('active');
            chatScreen.classList.remove('active');
            updateRationale('ONBOARDING');
        } else {
            onboardingScreen.classList.remove('active');
            chatScreen.classList.add('active');
            
            if (scenarioKey === 'BROKEN_STANDARD') {
                document.getElementById('btn-broken').classList.add('active');
                updateRationale('BROKEN_SELECT');
                startBrokenScenario();
            } else if (scenarioKey === 'WRONG_SIZE') {
                document.getElementById('btn-wrong-size').classList.add('active');
                updateRationale('WRONG_SIZE_SELECT');
                startWrongSizeScenario();
            } else if (scenarioKey === 'BLURRY_RECOVERY') {
                document.getElementById('btn-blurry').classList.add('active');
                updateRationale('BROKEN_SELECT');
                startBlurryScenario();
            } else if (scenarioKey === 'MISMATCH_RECOVERY') {
                document.getElementById('btn-mismatch').classList.add('active');
                updateRationale('BROKEN_SELECT');
                startMismatchScenario();
            }
        }
    };

    window.resetPrototype = () => {
        window.switchScenario('ONBOARDING');
    };

    window.backToOnboarding = () => {
        window.switchScenario('ONBOARDING');
    };

    // --- START SCENARIO FLOWS ---

    // 1. BROKEN STANDARD
    const startBrokenScenario = () => {
        simulateAgentTyping(() => {
            addMessage("Chào bạn, mình là Shopee AI Agent. Mình nhận thấy bạn vừa xem đơn hàng <b>#SPX123456</b> và gặp vấn đề. Bạn cần hỗ trợ gì ạ?", "agent", true);
            setQuickReplies([
                { text: "Tôi muốn đổi/trả hàng", action: "RETURN_START" },
                { text: "Kiểm tra vận đơn", action: "TRACKING" },
                { text: "Gặp nhân viên CSKH", action: "ESCALATE" }
            ]);
        }, 800);
    };

    // 2. WRONG SIZE
    const startWrongSizeScenario = () => {
        simulateAgentTyping(() => {
            addMessage("Chào bạn! Đơn hàng <b>#SPX123456</b> của bạn có 2 sản phẩm. Bạn muốn làm đơn đổi trả cho sản phẩm nào dưới đây?", "agent", true);
            
            const itemsSelectorHtml = `
                <div class="bubble">
                    <p>Chọn sản phẩm cần đổi trả:</p>
                    <div class="item-card" onclick="window.handleAction('SELECT_SHIRT')">
                        <img src="https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=150" class="item-img">
                        <div class="item-details">
                            <h5>Áo thun Polo Nam cao cấp</h5>
                            <p>Màu: Trắng | Size đặt: <b>L</b></p>
                            <span class="tag-badge badge-primary">Đủ điều kiện trả hàng</span>
                        </div>
                    </div>
                    <div class="item-card" onclick="window.handleAction('SELECT_SHOES')">
                        <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150" class="item-img">
                        <div class="item-details">
                            <h5>Giày Thể Thao Sneaker</h5>
                            <p>Màu: Đỏ | Size đặt: <b>42</b></p>
                            <span class="tag-badge badge-primary">Đủ điều kiện trả hàng</span>
                        </div>
                    </div>
                </div>
            `;
            addMessage(itemsSelectorHtml, 'agent', true);
            setQuickReplies([]);
        }, 800);
    };

    // 3. BLURRY PHOTO
    const startBlurryScenario = () => {
        startBrokenScenario();
    };

    // 4. MISMATCH SCENARIO
    const startMismatchScenario = () => {
        startBrokenScenario();
    };


    // --- CHAT INTERACTION FLOWS (STATE MANAGEMENT) ---
    const handleUserAction = (action, textOverride) => {
        if (textOverride) {
            addMessage(textOverride, 'user');
        } else if (chatInput.value.trim() !== '') {
            const text = chatInput.value.trim();
            addMessage(text, 'user');
            chatInput.value = '';
            
            // Check for direct human escalation keywords
            if (text.toLowerCase().includes("nhân viên") || text.toLowerCase().includes("người thật") || text.toLowerCase().includes("cskh")) {
                action = "ESCALATE";
            } else if (currentScenario === 'BLURRY_RECOVERY' && currentStep === 3) {
                // User inputting description of blur
                action = "BLURRY_SUBMIT_DESC";
            } else if (currentScenario === 'MISMATCH_RECOVERY' && currentStep === 3) {
                action = "MISMATCH_SUBMIT_CORRECTION";
            }
        }

        if (dwellTimer) clearTimeout(dwellTimer);

        switch (action) {
            // General start of Return
            case "RETURN_START":
                simulateAgentTyping(() => {
                    addMessage("Dạ, bạn muốn đổi/trả sản phẩm vì lý do gì ạ?", "agent");
                    setQuickReplies([
                        { text: "Hàng bị bể vỡ do vận chuyển", action: "REASON_BROKEN" },
                        { text: "Giao sai màu sắc/kích thước", action: "REASON_WRONG" },
                        { text: "Sản phẩm bị lỗi kỹ thuật", action: "REASON_DEFECT" }
                    ]);
                }, 800);
                break;

            case "REASON_BROKEN":
                simulateAgentTyping(() => {
                    addMessage("AI rất tiếc về sự cố này. Bạn vui lòng chụp ảnh sản phẩm bị vỡ rõ nét nhé. Bấm vào nút <b>Máy ảnh</b> bên dưới để tải lên minh chứng.", "agent", true);
                    setQuickReplies([]);
                    currentStep = 1; // Waiting for upload
                });
                break;

            case "UPLOAD_IMAGE":
                if (currentScenario === 'BLURRY_RECOVERY') {
                    handleBlurryUpload();
                } else if (currentScenario === 'MISMATCH_RECOVERY') {
                    handleMismatchUpload();
                } else {
                    handleBrokenUpload();
                }
                break;

            // Scenario 1: Broken item form submit
            case "CONFIRM_FORM_BROKEN":
                const amount = document.getElementById('refund-amount').value;
                const reason = document.getElementById('refund-reason').value;
                document.getElementById('confirm-btn').innerText = "Đang xử lý hoàn tiền...";
                document.getElementById('confirm-btn').disabled = true;

                simulateAgentTyping(() => {
                    appContainer.classList.add('success-mode');
                    updateRationale('SUCCESS_EVAL');
                    addMessage(`Yêu cầu hoàn trả <b>${parseInt(amount).toLocaleString()}đ</b> cho lỗi "${reason}" đã được duyệt tự động thành công. Số tiền đã được chuyển vào Ví ShopeePay của bạn.`, "agent", true);
                    
                    setTimeout(() => {
                        addMessage("Bạn có hài lòng với sự hỗ trợ của AI hôm nay không? (Phản hồi tường minh)", "agent");
                        const evalHtml = `
                            <div class="bubble">
                                <p>Đánh giá trải nghiệm AI:</p>
                                <div class="eval-box">
                                    <button class="eval-btn" id="eval-up" onclick="window.submitEval('up')"><i class="fa-regular fa-thumbs-up"></i></button>
                                    <button class="eval-btn" id="eval-down" onclick="window.submitEval('down')"><i class="fa-regular fa-thumbs-down"></i></button>
                                </div>
                            </div>
                        `;
                        addMessage(evalHtml, "agent", true);
                    }, 800);
                }, 1500);
                break;

            // Scenario 2: Select item wrong size
            case "SELECT_SHIRT":
                addMessage("Tôi muốn đổi trả Áo thun Polo Nam", "user");
                updateRationale('WRONG_SIZE_SELECT');
                simulateAgentTyping(() => {
                    addMessage("Dạ, bạn muốn trả sản phẩm <b>Áo thun Polo Nam</b> do lỗi gì ạ?", "agent", true);
                    setQuickReplies([
                        { text: "Shop giao sai kích thước (Size)", action: "SIZE_WRONG_STEPS" },
                        { text: "Shop giao sai màu sắc", action: "SIZE_WRONG_STEPS" }
                    ]);
                }, 800);
                break;

            case "SIZE_WRONG_STEPS":
                simulateAgentTyping(() => {
                    addMessage("Bạn vui lòng chụp ảnh nhãn mác (tag size) đính trên áo thun nhận được để AI đối chiếu với hệ thống nhé. (Bấm nút Máy ảnh để tải lên)", "agent", true);
                    currentStep = 1; // Waiting for upload tag size
                    setQuickReplies([]);
                }, 800);
                break;

            case "UPLOAD_SIZE_TAG":
                runScanningAnimation("AI đang đọc tag size sản phẩm...", () => {
                    updateRationale('WRONG_SIZE_FORM');
                    simulateAgentTyping(() => {
                        addMessage("AI phát hiện tag trên sản phẩm thực nhận ghi size <b>M</b>. Trong đơn hàng #SPX123456 bạn đặt size <b>L</b>. Hệ thống ghi nhận lỗi: <b>Shop giao sai kích thước</b>.", "agent", true);
                        
                        const sizeFormHtml = `
                            <div class="bubble">
                                Đề xuất phương án hoàn tiền tự động (Bản nháp):
                                <div class="form-card">
                                    <div class="form-group">
                                        <label>Sản phẩm đổi trả</label>
                                        <input type="text" class="form-input" value="Áo thun Polo Nam cao cấp" readonly>
                                    </div>
                                    <div class="form-group">
                                        <label>Lý do (AI trích xuất)</label>
                                        <input type="text" id="refund-reason" class="form-input inferred-val" value="Shop giao sai size (đặt L nhận M)" readonly>
                                    </div>
                                    <div class="form-group">
                                        <label>Số tiền hoàn trả (VNĐ)</label>
                                        <input type="number" id="refund-amount" class="form-input inferred-val" value="250000">
                                    </div>
                                    <div class="warning-box">
                                        <i class="fa-solid fa-circle-info"></i> Số tiền này bằng 100% giá mua thực tế của bạn. Bạn không cần trả lại áo do phí ship trả hàng cao hơn giá trị sản phẩm.
                                    </div>
                                    <button class="btn btn-primary" id="confirm-btn" style="margin-top: 10px" onclick="window.handleAction('CONFIRM_FORM_BROKEN')">Xác nhận hoàn tiền</button>
                                </div>
                            </div>
                        `;
                        addMessage(sizeFormHtml, "agent", true);
                    }, 1000);
                });
                break;

            // Scenario 3: Blurry recovery paths
            case "BLURRY_DESC_START":
                updateRationale('BLURRY_UNCERTAIN');
                simulateAgentTyping(() => {
                    addMessage("Dạ, xin mời bạn nhập chi tiết vết nứt/vết bể của sản phẩm vào khung chat bên dưới nhé.", "agent");
                    currentStep = 3; // Waiting for text description
                }, 500);
                break;

            case "BLURRY_SUBMIT_DESC":
                updateRationale('BLURRY_RECOVERY_DONE');
                simulateAgentTyping(() => {
                    const descVal = textOverride || "Đáy cốc bị nứt dài khoảng 5cm";
                    addMessage(`Cảm ơn bạn. AI đã ghi nhận mô tả đính chính: <b>"${descVal}"</b>. Đề xuất hoàn đơn đã được cập nhật thành công:`, "agent", true);
                    
                    const recoveryFormHtml = `
                        <div class="bubble">
                            Phiếu hoàn tiền tự động cập nhật (Bản nháp):
                            <div class="form-card">
                                <div class="form-group">
                                    <label>Sản phẩm</label>
                                    <input type="text" class="form-input" value="Cốc thủy tinh chịu nhiệt" readonly>
                                </div>
                                <div class="form-group">
                                    <label>Lý do lỗi (Bạn đính chính)</label>
                                    <input type="text" id="refund-reason" class="form-input inferred-val" value="Đáy cốc bị nứt bể do vận chuyển">
                                </div>
                                <div class="form-group">
                                    <label>Số tiền hoàn (VNĐ)</label>
                                    <input type="number" id="refund-amount" class="form-input inferred-val" value="150000">
                                </div>
                                <button class="btn btn-primary" id="confirm-btn" style="margin-top: 10px" onclick="window.handleAction('CONFIRM_FORM_BROKEN')">Xác nhận hoàn tiền</button>
                            </div>
                        </div>
                    `;
                    addMessage(recoveryFormHtml, "agent", true);
                }, 1000);
                break;

            // Scenario 4: Mismatch correction
            case "MISMATCH_START_CORRECTION":
                updateRationale('MISMATCH_ERROR');
                simulateAgentTyping(() => {
                    addMessage("Dạ, AI xin lỗi vì nhận diện sai. Bạn vui lòng sửa lại đúng tên sản phẩm bị lỗi nhé:", "agent");
                    setQuickReplies([
                        { text: "Đây là Cốc thủy tinh", action: "MISMATCH_CORRECT_GLASS" },
                        { text: "Gặp nhân viên hỗ trợ", action: "ESCALATE" }
                    ]);
                }, 600);
                break;

            case "MISMATCH_CORRECT_GLASS":
                updateRationale('MISMATCH_RECOVERY_DONE');
                simulateAgentTyping(() => {
                    addMessage("Đã cập nhật đính chính! AI vô cùng xin lỗi bạn vì lỗi phân loại hình ảnh này. Hệ thống đã sửa đổi thông tin đơn hoàn:", "agent");
                    
                    const correctedFormHtml = `
                        <div class="bubble">
                            Đơn đổi trả đã cập nhật đúng (Bản nháp):
                            <div class="form-card">
                                <div class="form-group">
                                    <label>Sản phẩm chính xác</label>
                                    <input type="text" class="form-input" value="Cốc thủy tinh chịu nhiệt" readonly>
                                </div>
                                <div class="form-group">
                                    <label>Lý do (AI & Bạn đính chính)</label>
                                    <input type="text" id="refund-reason" class="form-input inferred-val" value="Bể vỡ do vận chuyển">
                                </div>
                                <div class="form-group">
                                    <label>Số tiền hoàn đúng (VNĐ)</label>
                                    <input type="number" id="refund-amount" class="form-input inferred-val" value="150000">
                                </div>
                                <button class="btn btn-primary" id="confirm-btn" style="margin-top: 10px" onclick="window.handleAction('CONFIRM_FORM_BROKEN')">Xác nhận hoàn tiền</button>
                            </div>
                        </div>
                    `;
                    addMessage(correctedFormHtml, "agent", true);
                    setQuickReplies([]);
                }, 1000);
                break;

            // Human Escalation
            case "ESCALATE":
                updateRationale('ESCALATED');
                simulateAgentTyping(() => {
                    addMessage("Dạ, AI xin lỗi vì chưa thể giải quyết trọn vẹn yêu cầu của bạn. Hệ thống đang chuyển tiếp hội thoại kèm hình ảnh bằng chứng sang <b>Nhân viên hỗ trợ (Người thật)</b>. Vui lòng đợi trong giây lát...", "agent", true);
                    setQuickReplies([]);
                }, 1000);
                break;

            default:
                simulateAgentTyping(() => {
                    addMessage("Xin lỗi, mình chưa hiểu ý của bạn. Bạn chọn các gợi ý bên dưới để AI hỗ trợ nhé.");
                    setQuickReplies([
                        { text: "Tôi muốn đổi/trả hàng", action: "RETURN_START" },
                        { text: "Gặp nhân viên CSKH", action: "ESCALATE" }
                    ]);
                }, 800);
        }
    };

    // --- SCENARIO UPLOAD HANDLING ---

    const runScanningAnimation = (text, callback) => {
        scanningOverlay.classList.add('active');
        scanText.innerHTML = `${text} <span id="scan-progress">0%</span>`;
        highlightBoxSim.style.opacity = 0;
        
        let prog = 0;
        const interval = setInterval(() => {
            prog += 20;
            const progressSpan = document.getElementById('scan-progress');
            if (progressSpan) progressSpan.innerText = `${prog}%`;
            
            // Show bounding box at 60%
            if (prog === 60) {
                highlightBoxSim.style.top = '30%';
                highlightBoxSim.style.left = '30%';
                highlightBoxSim.style.width = '40%';
                highlightBoxSim.style.height = '40%';
                highlightBoxSim.style.opacity = 1;
            }
            
            if (prog >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    scanningOverlay.classList.remove('active');
                    callback();
                }, 600);
            }
        }, 300);
    };

    // Standard Broken Scenario Upload
    const handleBrokenUpload = () => {
        currentStep = 2;
        // User uploads image message
        const imgMsg = document.createElement('div');
        imgMsg.className = 'message-wrapper user';
        imgMsg.innerHTML = `<div class="bubble"><i class="fa-solid fa-image"></i> Đã đính kèm ảnh bằng chứng<br><img src="https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=200" class="evidence-img"><div class="time">${getCurrentTime()}</div></div>`;
        chatContainer.appendChild(imgMsg);
        scrollToBottom();

        updateRationale('BROKEN_SCAN');
        runScanningAnimation("AI đang xác thực vết bể cốc thủy tinh...", () => {
            updateRationale('BROKEN_FORM');
            simulateAgentTyping(() => {
                const formHtml = `
                    <div class="bubble">
                        AI nhận diện: <b>Sản phẩm bị bể vỡ</b>. Dưới đây là đơn hoàn tiền tự động được AI thiết lập nhanh (Bản nháp):
                        <div class="form-card">
                            <div class="form-group">
                                <label>Sản phẩm trong đơn hàng</label>
                                <input type="text" class="form-input" value="Cốc thủy tinh chịu nhiệt" readonly>
                            </div>
                            <div class="form-group">
                                <label>Lý do lỗi (AI tự điền)</label>
                                <input type="text" id="refund-reason" class="form-input inferred-val" value="Bể vỡ do vận chuyển">
                            </div>
                            <div class="form-group">
                                <label>Số tiền hoàn (AI trích xuất)</label>
                                <input type="number" id="refund-amount" class="form-input inferred-val" value="150000">
                            </div>
                            <div class="warning-box">
                                <i class="fa-solid fa-circle-exclamation"></i> Bạn có thể sửa lý do và số tiền nếu chưa đúng. (Quyền kiểm soát thuộc về người dùng)
                            </div>
                            <button class="btn btn-primary" id="confirm-btn" style="margin-top: 10px" onclick="window.handleAction('CONFIRM_FORM_BROKEN')">Xác nhận hoàn tiền</button>
                        </div>
                    </div>
                `;
                addMessage(formHtml, "agent", true);

                // Dwell Time Implicit Feedback: If user stays for 12 seconds on the form, offer human help
                dwellTimer = setTimeout(() => {
                    simulateAgentTyping(() => {
                        updateRationale('ESCALATED');
                        addMessage("Mình thấy bạn đang dừng lại hơi lâu ở bước này. Bạn có gặp khó khăn gì khi kiểm tra thông tin không? Hãy bấm <b>Gặp nhân viên</b> nếu cần hỗ trợ trực tiếp nhé (Dwell Time Feedback).", "agent", true);
                        setQuickReplies([{text: "Kết nối nhân viên", action: "ESCALATE"}]);
                    }, 500);
                }, 12000);
            }, 1000);
        });
    };

    // Blurry Scenario Upload
    const handleBlurryUpload = () => {
        currentStep = 2;
        const imgMsg = document.createElement('div');
        imgMsg.className = 'message-wrapper user';
        imgMsg.innerHTML = `<div class="bubble"><i class="fa-solid fa-image"></i> Ảnh lỗi đính kèm (Bị mờ)<br><img src="https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=200" class="evidence-img" style="filter: blur(4px)"><div class="time">${getCurrentTime()}</div></div>`;
        chatContainer.appendChild(imgMsg);
        scrollToBottom();

        runScanningAnimation("AI đang quét ảnh bằng chứng...", () => {
            updateRationale('BLURRY_UNCERTAIN');
            simulateAgentTyping(() => {
                addMessage("<i class=\"fa-solid fa-triangle-exclamation color-warning\"></i> <b>Cảnh báo: Ảnh chụp bị mờ.</b> AI chỉ nhận diện được cốc thủy tinh nhưng không phân tích rõ được vết nứt (Độ tin cậy thấp: 40%).", "agent", true);
                
                const blurBoxHtml = `
                    <div class="bubble">
                        Bạn vui lòng chụp lại ảnh khác rõ hơn, khoanh vùng vị trí nứt, hoặc miêu tả lỗi bằng văn bản bên dưới:
                        <div class="blur-fix-box">
                            <p style="font-size: 11px; margin-bottom:6px;">Mô phỏng khoanh vùng lỗi:</p>
                            <div class="crop-area-simulate">
                                <img src="https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=200" class="crop-img">
                                <div class="crop-rect"></div>
                            </div>
                            <button class="btn btn-outline" style="font-size:11px; padding:6px; color:#333; border-color:#ccc;" onclick="window.handleAction('BLURRY_DESC_START')"><i class="fa-solid fa-pen"></i> Nhập mô tả lỗi bằng chữ</button>
                        </div>
                    </div>
                `;
                addMessage(blurBoxHtml, "agent", true);
                setQuickReplies([
                    { text: "Mô tả lỗi bằng chữ", action: "BLURRY_DESC_START" },
                    { text: "Gặp nhân viên hỗ trợ", action: "ESCALATE" }
                ]);
            }, 1000);
        });
    };

    // Mismatch Scenario Upload
    const handleMismatchUpload = () => {
        currentStep = 2;
        const imgMsg = document.createElement('div');
        imgMsg.className = 'message-wrapper user';
        imgMsg.innerHTML = `<div class="bubble"><i class="fa-solid fa-image"></i> Đã đính kèm ảnh cốc vỡ<br><img src="https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=200" class="evidence-img"><div class="time">${getCurrentTime()}</div></div>`;
        chatContainer.appendChild(imgMsg);
        scrollToBottom();

        runScanningAnimation("AI đang nhận diện sản phẩm...", () => {
            updateRationale('MISMATCH_ERROR');
            simulateAgentTyping(() => {
                addMessage("<i class=\"fa-solid fa-circle-question color-warning\"></i> <b>AI Nhận diện: Áo thun Polo Nam</b> (Nhầm lẫn!). Vui lòng kiểm tra lại đơn hoàn tự động do AI trích xuất bên dưới:", "agent", true);
                
                const mismatchFormHtml = `
                    <div class="bubble">
                        <div class="form-card" style="border-color: var(--warning);">
                            <div class="form-group">
                                <label>Sản phẩm nhận diện nhầm</label>
                                <input type="text" class="form-input inferred-val" style="border-color:var(--warning); background:#fffef4; color:#b78103;" value="Áo thun Polo Nam cao cấp" readonly>
                            </div>
                            <div class="form-group">
                                <label>Lý do (AI tự nhận)</label>
                                <input type="text" class="form-input inferred-val" style="border-color:var(--warning); background:#fffef4; color:#b78103;" value="Hàng bể vỡ do vận chuyển" readonly>
                            </div>
                            <div class="form-group">
                                <label>Số tiền hoàn (AI trích xuất sai)</label>
                                <input type="number" class="form-input inferred-val" style="border-color:var(--warning); background:#fffef4; color:#b78103;" value="250000" readonly>
                            </div>
                            <div class="warning-box" style="background:#fff3cd; border-color:#ffc107; color:#664d03;">
                                <i class="fa-solid fa-triangle-exclamation"></i> AI đã phân loại nhầm hình ảnh cốc thủy tinh thành áo thun. Bạn hãy đính chính để AI sửa sai.
                            </div>
                            <button class="btn btn-outline" style="color:var(--primary); border-color:var(--primary); margin-top: 10px;" onclick="window.handleAction('MISMATCH_START_CORRECTION')"><i class="fa-solid fa-eraser"></i> Sửa thông tin sản phẩm</button>
                        </div>
                    </div>
                `;
                addMessage(mismatchFormHtml, "agent", true);
                setQuickReplies([
                    { text: "Đính chính sản phẩm", action: "MISMATCH_START_CORRECTION" },
                    { text: "Gặp nhân viên hỗ trợ", action: "ESCALATE" }
                ]);
            }, 1000);
        });
    };

    // --- GLOBAL ACTIONS ---
    window.handleAction = (action) => {
        if (dwellTimer) clearTimeout(dwellTimer);
        handleUserAction(action);
    };

    window.submitEval = (type) => {
        document.getElementById('eval-up').classList.remove('active');
        document.getElementById('eval-down').classList.remove('active');
        document.getElementById(`eval-${type}`).classList.add('active');
        
        simulateAgentTyping(() => {
            addMessage("Cảm ơn bạn rất nhiều vì đã đánh giá! Phản hồi của bạn đã được lưu lại để AI cải thiện độ chính xác của mô hình.", "agent");
            appContainer.classList.remove('success-mode');
        }, 800);
    };

    // --- EVENT LISTENERS ---
    startOnboardingBtn.addEventListener('click', () => {
        onboardingScreen.classList.remove('active');
        chatScreen.classList.add('active');
        
        // Start the corresponding chat flow
        currentStep = 0;
        if (currentScenario === 'ONBOARDING' || currentScenario === 'BROKEN_STANDARD') {
            currentScenario = 'BROKEN_STANDARD';
            document.querySelectorAll('.scen-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById('btn-broken').classList.add('active');
            updateRationale('BROKEN_SELECT');
            startBrokenScenario();
        } else if (currentScenario === 'WRONG_SIZE') {
            updateRationale('WRONG_SIZE_SELECT');
            startWrongSizeScenario();
        } else if (currentScenario === 'BLURRY_RECOVERY') {
            updateRationale('BROKEN_SELECT');
            startBlurryScenario();
        } else if (currentScenario === 'MISMATCH_RECOVERY') {
            updateRationale('BROKEN_SELECT');
            startMismatchScenario();
        }
    });

    sendBtn.addEventListener('click', () => {
        handleUserAction();
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserAction();
    });

    uploadBtn.addEventListener('click', () => {
        if (currentStep === 1) {
            if (currentScenario === 'WRONG_SIZE') {
                handleUserAction("UPLOAD_SIZE_TAG");
            } else {
                handleUserAction("UPLOAD_IMAGE");
            }
        } else {
            alert("Nút chụp ảnh/tải lên chỉ hoạt động ở bước AI yêu cầu bạn cung cấp hình ảnh chứng cứ.");
        }
    });

    window.triggerEscalate = () => {
        handleUserAction("ESCALATE");
    };

    // Initialize Onboarding
    updateRationale('ONBOARDING');
});
