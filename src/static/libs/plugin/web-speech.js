define([], function () {
    'use strict';

    // 检查浏览器支持
    const isSpeechSynthesisSupported = 'speechSynthesis' in window;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const isSpeechRecognitionSupported = !!SpeechRecognition;

    // 语音合成实例
    let speechSynthesisInstance = null;

    // 语音识别实例
    let speechRecognitionInstance = null;

    // 长文本识别相关变量
    let recognitionTimeout = null;
    let isContinuousRecognition = false;
    let fullTranscript = '';
    let resultCallback = null;
    let errorCallback = null;
    let endCallback = null;
    let restartInterval = 4 * 60 * 1000; // 4分钟自动重启一次（预留缓冲时间）

    /**
     * 初始化语音合成
     * @returns {boolean} 是否初始化成功
     */
    function initSynthesis() {
        if (!isSpeechSynthesisSupported) {
            console.error('Web Speech Synthesis is not supported in this browser');
            return false;
        }

        speechSynthesisInstance = window.speechSynthesis;
        return true;
    }

    /**
     * 初始化语音识别
     * @param {Object} options - 识别配置选项
     * @returns {boolean} 是否初始化成功
     */
    function initRecognition(options = {}) {
        if (!isSpeechRecognitionSupported) {
            console.error('Web Speech Recognition is not supported in this browser');
            return false;
        }

        // 保存是否需要连续识别
        isContinuousRecognition = options.continuous || false;

        // 如果是连续识别，设置自动重启时间（可通过options配置）
        if (isContinuousRecognition) {
            restartInterval = options.restartInterval || restartInterval;
        }

        speechRecognitionInstance = new SpeechRecognition();

        // 设置默认配置
        speechRecognitionInstance.continuous = isContinuousRecognition;
        speechRecognitionInstance.interimResults = options.interimResults || false;
        speechRecognitionInstance.lang = options.lang || 'en-US';

        return true;
    }

    /**
     * 语音合成（朗读文本）
     * @param {string} text - 要朗读的文本
     * @param {Object} options - 朗读选项
     * @returns {Promise} 朗读完成的Promise
     */
    function speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            if (!isSpeechSynthesisSupported) {
                reject(new Error('Web Speech Synthesis is not supported'));
                return;
            }

            if (!speechSynthesisInstance) {
                if (!initSynthesis()) {
                    reject(new Error('Failed to initialize speech synthesis'));
                    return;
                }
            }

            // 停止任何正在进行的语音
            speechSynthesisInstance.cancel();

            // 创建语音实例
            const utterance = new SpeechSynthesisUtterance(text);

            // 设置选项
            utterance.lang = options.lang || 'en-US';
            utterance.volume = options.volume !== undefined ? options.volume : 1;
            utterance.rate = options.rate !== undefined ? options.rate : 1;
            utterance.pitch = options.pitch !== undefined ? options.pitch : 1;

            // 事件监听
            utterance.onend = resolve;
            utterance.onerror = (event) => reject(event.error);

            // 开始朗读
            speechSynthesisInstance.speak(utterance);
        });
    }

    /**
     * 处理识别结果，拼接长文本
     */
    function handleRecognitionResult(event) {
        const transcript = [];
        for (let i = 0; i < event.results.length; i++) {
            transcript.push(event.results[i][0].transcript);
        }

        const currentTranscript = transcript.join(' ');

        // 如果是连续识别，拼接结果
        if (isContinuousRecognition) {
            fullTranscript += currentTranscript;
            if (resultCallback) {
                resultCallback(fullTranscript, event.results);
            }
        } else {
            if (resultCallback) {
                resultCallback(currentTranscript, event.results);
            }
        }
    }

    /**
     * 自动重启识别会话
     */
    function restartRecognition() {
        if (isContinuousRecognition && speechRecognitionInstance) {
            // 停止当前识别
            speechRecognitionInstance.stop();

            // 短暂延迟后重启
            setTimeout(() => {
                if (isContinuousRecognition) {
                    speechRecognitionInstance.start();

                    // 设置下一次重启定时器
                    setupRecognitionTimeout();
                }
            }, 500);
        }
    }

    /**
     * 设置识别超时定时器
     */
    function setupRecognitionTimeout() {
        // 清除已有定时器
        if (recognitionTimeout) {
            clearTimeout(recognitionTimeout);
        }

        // 如果是连续识别，设置自动重启定时器
        if (isContinuousRecognition) {
            recognitionTimeout = setTimeout(restartRecognition, restartInterval);
        }
    }

    /**
     * 开始语音识别
     * @param {Function} onResult - 识别结果回调函数
     * @param {Function} onError - 错误回调函数
     * @param {Function} onEnd - 识别结束回调函数
     */
    function startListening(onResult, onError, onEnd) {
        if (!isSpeechRecognitionSupported) {
            if (onError) onError('Web Speech Recognition is not supported');
            return;
        }

        // 保存回调函数
        resultCallback = onResult;
        errorCallback = onError;
        endCallback = onEnd;

        // 重置完整转录文本
        fullTranscript = '';

        if (!speechRecognitionInstance) {
            if (!initRecognition()) {
                if (onError) onError('Failed to initialize speech recognition');
                return;
            }
        }

        // 设置结果回调
        speechRecognitionInstance.onresult = handleRecognitionResult;

        // 设置错误回调
        speechRecognitionInstance.onerror = (event) => {
            if (errorCallback) errorCallback(event.error);

            // 如果是连续识别，发生错误后尝试重启
            if (isContinuousRecognition) {
                restartRecognition();
            }
        };

        // 设置结束回调
        speechRecognitionInstance.onend = () => {
            if (endCallback) endCallback();

            // 如果是连续识别，自动重启
            if (isContinuousRecognition) {
                restartRecognition();
            }
        };

        // 开始识别
        speechRecognitionInstance.start();

        // 设置超时重启定时器
        setupRecognitionTimeout();
    }

    /**
     * 停止语音识别
     */
    function stopListening() {
        // 清除超时定时器
        if (recognitionTimeout) {
            clearTimeout(recognitionTimeout);
            recognitionTimeout = null;
        }

        // 重置连续识别标记
        isContinuousRecognition = false;

        if (isSpeechRecognitionSupported && speechRecognitionInstance) {
            speechRecognitionInstance.stop();
        }
    }

    /**
     * 获取可用的语音合成声音
     * @returns {Array} 声音列表
     */
    function getAvailableVoices() {
        if (!isSpeechSynthesisSupported || !speechSynthesisInstance) {
            return [];
        }

        return speechSynthesisInstance.getVoices();
    }

    /**
     * 设置语音合成声音
     * @param {SpeechSynthesisVoice} voice - 要使用的声音
     */
    function setVoice(voice) {
        // 这个方法通常在speak时通过utterance设置更合适
        // 这里提供一个全局设置的参考实现
        // 实际使用中可能需要在speak方法中应用
    }

    // 暴露公共API
    return {
        // 检测支持情况
        isSpeechSynthesisSupported,
        isSpeechRecognitionSupported,

        // 初始化方法
        initSynthesis,
        initRecognition,

        // 语音合成
        speak,
        getAvailableVoices,
        setVoice,

        // 语音识别
        startListening,
        stopListening
    };
});
