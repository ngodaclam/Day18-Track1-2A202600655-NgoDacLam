document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const quickRepliesContainer = document.getElementById('quick-replies');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const scanningOverlay = document.getElementById('scanning-overlay');
    const scanProgress = document.getElementById('scan-progress');
    const appContainer = document.querySelector('.app-container');

    let currentStep = 0;
    let dwellTimer = null;

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
        setQuickReplies([]); // clear quick replies while typing
        showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator();
            callback();
        }, delay);
    };

    // --- Scenario Handlers ---

    const startScenario = () => {
        simulateAgentTyping(() => {
            addMessage("Chào bạn, mình là trợ lý AI của Shopee. Mình thấy bạn đang xem đơn hàng <b>#SPX123456</b>. Bạn cần hỗ trợ gì ạ?", "agent", true);
            setQuickReplies([
                { text: "Tôi muốn đổi/trả hàng", action: "RETURN_START" },
                { text: "Kiểm tra vận đơn", action: "TRACKING" },
                { text: "Gặp nhân viên", action: "ESCALATE" }
            ]);
        });
    };

    const handleUserAction = (action, textOverride) => {
        if (textOverride) {
            addMessage(textOverride, 'user');
        } else if (chatInput.value.trim() !== '') {
            const text = chatInput.value.trim();
            addMessage(text, 'user');
            chatInput.value = '';
            
            // Check for implicit feedback (Escalation Rate)
            if (text.toLowerCase().includes("nhân viên") || text.toLowerCase().includes("người thật")) {
                action = "ESCALATE";
            }
        }

        switch(action) {
            case "RETURN_START":
                simulateAgentTyping(() => {
                    addMessage("Dạ, bạn muốn trả hàng với lý do gì ạ? (Explicit User Feedback)", "agent");
                    setQuickReplies([
                        { text: "Hàng bị vỡ/móp méo", action: "REASON_BROKEN" },
                        { text: "Giao sai màu/size", action: "REASON_WRONG" },
                        { text: "Sản phẩm lỗi", action: "REASON_DEFECT" }
                    ]);
                });
                break;
                
            case "REASON_BROKEN":
                simulateAgentTyping(() => {
                    addMessage("Rất tiếc về sự cố này. Bạn vui lòng tải lên hình ảnh sản phẩm bị vỡ hoặc vỏ hộp bị móp méo nhé. (Bấm nút Camera bên dưới)");
                    setQuickReplies([]);
                    currentStep = 1; // Waiting for upload
                });
                break;
                
            case "UPLOAD_IMAGE":
                currentStep = 2;
                // Simulate explicitly uploading an image
                const imgMsg = document.createElement('div');
                imgMsg.className = 'message-wrapper user';
                imgMsg.innerHTML = `<div class="bubble"><i class="fa-solid fa-image"></i> Hình ảnh đính kèm<br><img src="https://via.placeholder.com/150/cccccc/666666?text=Loi+San+Pham" class="evidence-img"><div class="time">${getCurrentTime()}</div></div>`;
                chatContainer.appendChild(imgMsg);
                scrollToBottom();
                
                // Explicit System Feedback: Scanning
                scanningOverlay.classList.add('active');
                let prog = 0;
                const interval = setInterval(() => {
                    prog += 20;
                    scanProgress.innerText = `${prog}%`;
                    if(prog >= 100) {
                        clearInterval(interval);
                        setTimeout(() => {
                            scanningOverlay.classList.remove('active');
                            processImage();
                        }, 500);
                    }
                }, 400);
                break;

            case "CONFIRM_FORM":
                // Simulate submitting the form
                const amount = document.getElementById('refund-amount').value;
                const reason = document.getElementById('refund-reason').value;
                
                // Check if user edited the amount (Implicit Feedback: Editing/Overwriting)
                if (amount !== "150000") {
                    console.log("Implicit Feedback: User edited the extracted amount.");
                }

                document.getElementById('confirm-btn').innerText = "Đang xử lý...";
                document.getElementById('confirm-btn').disabled = true;

                simulateAgentTyping(() => {
                    // Implicit System Feedback: Color Coding (Success)
                    appContainer.classList.add('success-mode');
                    
                    addMessage(`Yêu cầu hoàn trả <b>${parseInt(amount).toLocaleString()}đ</b> cho lỗi "${reason}" đã được duyệt tự động. Tiền sẽ được hoàn vào Ví ShopeePay của bạn trong 24h.`, "agent", true);
                    
                    setTimeout(() => {
                        addMessage("Bạn có hài lòng với sự hỗ trợ của AI hôm nay không? (Explicit User Feedback)", "agent");
                        const evalHtml = `
                            <div class="bubble">
                                <p>Đánh giá trải nghiệm:</p>
                                <div class="eval-box">
                                    <button class="eval-btn" id="eval-up" onclick="window.submitEval('up')"><i class="fa-regular fa-thumbs-up"></i></button>
                                    <button class="eval-btn" id="eval-down" onclick="window.submitEval('down')"><i class="fa-regular fa-thumbs-down"></i></button>
                                </div>
                            </div>
                        `;
                        addMessage(evalHtml, "agent", true);
                    }, 1000);

                }, 1500);
                break;

            case "ESCALATE":
                simulateAgentTyping(() => {
                    addMessage("Dạ, AI xin lỗi vì chưa đáp ứng được yêu cầu. Mình đang kết nối bạn với Nhân viên CSKH (Escalation Rate - Implicit Feedback). Vui lòng đợi trong giây lát...");
                    setQuickReplies([]);
                });
                break;

            default:
                if (action && action.startsWith("TEXT_")) {
                    // Do nothing extra
                } else {
                    simulateAgentTyping(() => {
                        addMessage("Xin lỗi, mình chưa hiểu ý bạn. Bạn chọn các gợi ý bên dưới nhé.");
                        setQuickReplies([
                            { text: "Tôi muốn đổi/trả hàng", action: "RETURN_START" },
                            { text: "Gặp nhân viên", action: "ESCALATE" }
                        ]);
                    });
                }
        }
    };

    const processImage = () => {
        simulateAgentTyping(() => {
            // Implicit System Feedback: Auto-fill via Vision & Explicit System Feedback: Confirmation Prompt
            const formHtml = `
                <div class="bubble">
                    Dựa trên hình ảnh, AI ghi nhận sản phẩm bị vỡ. Vui lòng xác nhận thông tin (bạn có thể sửa nếu cần):
                    <div class="form-card">
                        <div class="form-group">
                            <label>Sản phẩm</label>
                            <input type="text" class="form-input" value="Cốc thủy tinh chịu nhiệt" readonly>
                        </div>
                        <div class="form-group">
                            <label>Lý do (Auto-fill)</label>
                            <input type="text" id="refund-reason" class="form-input" value="Bể vỡ do vận chuyển">
                        </div>
                        <div class="form-group">
                            <label>Số tiền hoàn (VNĐ)</label>
                            <input type="number" id="refund-amount" class="form-input" value="150000">
                        </div>
                        <div class="warning-box">
                            <i class="fa-solid fa-circle-exclamation"></i> Nếu số tiền > 5.000.000đ, hồ sơ sẽ cần quản lý duyệt thủ công (Explicit System Feedback: Giới hạn).
                        </div>
                        <button class="btn btn-primary" id="confirm-btn" style="margin-top: 12px" onclick="window.handleAction('CONFIRM_FORM')">Xác nhận hoàn tiền</button>
                    </div>
                </div>
            `;
            addMessage(formHtml, "agent", true);

            // Implicit User Feedback (Dwell Time)
            // If user stays on this form for 8 seconds without confirming, AI asks if they need help
            dwellTimer = setTimeout(() => {
                simulateAgentTyping(() => {
                    addMessage("Bạn có đang gặp khó khăn ở bước xác nhận không? Nếu cần, hãy bấm <b>Gặp nhân viên</b> để được hỗ trợ trực tiếp nhé (Dwell Time Demo).", "agent", true);
                    setQuickReplies([{text: "Gặp nhân viên", action: "ESCALATE"}]);
                }, 500);
            }, 8000);
        });
    };

    // Make global for inline handlers
    window.handleAction = (action) => {
        if(dwellTimer) clearTimeout(dwellTimer);
        handleUserAction(action);
    };

    window.submitEval = (type) => {
        document.getElementById('eval-up').classList.remove('active');
        document.getElementById('eval-down').classList.remove('active');
        document.getElementById(`eval-${type}`).classList.add('active');
        
        simulateAgentTyping(() => {
            addMessage("Cảm ơn bạn đã đánh giá. Chúc bạn một ngày tốt lành!");
            appContainer.classList.remove('success-mode'); // Reset
        }, 800);
    };

    // Event Listeners
    sendBtn.addEventListener('click', () => {
        handleUserAction();
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserAction();
    });

    uploadBtn.addEventListener('click', () => {
        if (currentStep === 1) {
            handleUserAction("UPLOAD_IMAGE");
        } else {
            alert("Tính năng upload chỉ hoạt động ở bước yêu cầu gửi hình ảnh chứng cứ.");
        }
    });

    // Start App
    setTimeout(startScenario, 500);
});
