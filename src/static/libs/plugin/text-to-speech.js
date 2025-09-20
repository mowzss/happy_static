define([], function () {
    'use strict';

    // 模块状态常量
    const STATES = {
        READY: 'ready',        // 就绪状态，未进行任何操作
        SPEAKING: 'speaking',  // 正在朗读
        PAUSED: 'paused',      // 已暂停
        STOPPED: 'stopped'     // 已停止
    };

    // 语音合成核心实例
    let speechSynthesisInstance = null;
    let currentUtterance = null;    // 当前朗读实例
    let currentText = '';           // 当前朗读文本
    let currentOptions = {};        // 当前朗读选项
    let currentState = STATES.READY; // 当前状态
    let pausePosition = 0;          // 暂停位置（用于恢复朗读）

    // 检查浏览器支持
    const isSupported = 'speechSynthesis' in window;

    /**
     * 初始化语音合成
     * @returns {boolean} 是否初始化成功
     */
    function init() {
        if (!isSupported) {
            console.error('Web Speech Synthesis is not supported in this browser');
            return false;
        }

        if (!speechSynthesisInstance) {
            speechSynthesisInstance = window.speechSynthesis;
        }

        // 监听语音合成状态变化
        speechSynthesisInstance.onvoiceschanged = () => {
            // 当可用语音列表变化时触发
            if (currentOptions.onVoicesChanged) {
                currentOptions.onVoicesChanged(getAvailableVoices());
            }
        };

        currentState = STATES.READY;
        return true;
    }

    /**
     * 开始或继续朗读文本
     * @param {string} text - 要朗读的文本（如果在暂停状态下，可不传）
     * @param {Object} options - 朗读选项
     * @returns {Promise} 朗读完成的Promise
     */
    function speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            if (!isSupported) {
                reject(new Error('Web Speech Synthesis is not supported'));
                return;
            }

            if (!speechSynthesisInstance && !init()) {
                reject(new Error('Failed to initialize speech synthesis'));
                return;
            }

            // 保存选项
            currentOptions = {
                onStateChange: options.onStateChange || null,
                onSpeaking: options.onSpeaking || null,
                onVoicesChanged: options.onVoicesChanged || null,
                lang: options.lang || 'en-US',
                volume: options.volume !== undefined ? options.volume : 1,
                rate: options.rate !== undefined ? options.rate : 1,
                pitch: options.pitch !== undefined ? options.pitch : 1,
                voice: options.voice || null
            };

            // 如果处于暂停状态且未提供新文本，则继续朗读
            if (currentState === STATES.PAUSED && !text) {
                resumeSpeaking(resolve, reject);
                return;
            }

            // 新的朗读任务，停止任何正在进行的语音
            stop();

            // 如果提供了新文本，则更新当前文本
            if (text) {
                currentText = text;
                pausePosition = 0;
            }

            // 创建语音实例
            currentUtterance = new SpeechSynthesisUtterance(
                currentText.substring(pausePosition)
            );

            // 设置选项
            currentUtterance.lang = currentOptions.lang;
            currentUtterance.volume = currentOptions.volume;
            currentUtterance.rate = currentOptions.rate;
            currentUtterance.pitch = currentOptions.pitch;
            if (currentOptions.voice) {
                currentUtterance.voice = currentOptions.voice;
            }

            // 事件监听
            currentUtterance.onstart = () => {
                setState(STATES.SPEAKING);
                if (currentOptions.onSpeaking) {
                    currentOptions.onSpeaking(true);
                }
            };

            currentUtterance.onend = () => {
                // 如果是完整朗读结束（不是因为暂停）
                if (currentState !== STATES.PAUSED) {
                    pausePosition = 0;
                    setState(STATES.READY);
                    if (currentOptions.onSpeaking) {
                        currentOptions.onSpeaking(false);
                    }
                    resolve();
                }
            };

            currentUtterance.onerror = (event) => {
                const error = new Error(`Speech error: ${event.error}`);
                setState(STATES.READY);
                if (currentOptions.onSpeaking) {
                    currentOptions.onSpeaking(false);
                }
                reject(error);
            };

            currentUtterance.onpause = () => {
                // 记录当前朗读位置（这是一个近似值计算）
                const estimatedPosition = calculateCurrentPosition();
                if (estimatedPosition > pausePosition) {
                    pausePosition = estimatedPosition;
                }
                setState(STATES.PAUSED);
                if (currentOptions.onSpeaking) {
                    currentOptions.onSpeaking(false);
                }
            };

            currentUtterance.onresume = () => {
                setState(STATES.SPEAKING);
                if (currentOptions.onSpeaking) {
                    currentOptions.onSpeaking(true);
                }
            };

            // 开始朗读
            speechSynthesisInstance.speak(currentUtterance);
        });
    }

    /**
     * 恢复暂停的朗读
     */
    function resumeSpeaking(resolve, reject) {
        if (currentState !== STATES.PAUSED || !currentUtterance) {
            reject(new Error('No speech to resume'));
            return;
        }

        // 更新当前Utterance的文本为剩余部分
        currentUtterance.text = currentText.substring(pausePosition);

        // 重新设置完成回调
        currentUtterance.onend = () => {
            pausePosition = 0;
            setState(STATES.READY);
            if (currentOptions.onSpeaking) {
                currentOptions.onSpeaking(false);
            }
            resolve();
        };

        // 恢复朗读
        speechSynthesisInstance.resume();
    }

    /**
     * 暂停当前朗读
     * @returns {boolean} 是否暂停成功
     */
    function pause() {
        if (!isSupported || !speechSynthesisInstance) {
            return false;
        }

        if (currentState === STATES.SPEAKING) {
            speechSynthesisInstance.pause();
            return true;
        }

        return false;
    }

    /**
     * 停止当前朗读
     * @returns {boolean} 是否停止成功
     */
    function stop() {
        if (!isSupported || !speechSynthesisInstance) {
            return false;
        }

        // 只有在说话或暂停状态下才需要停止
        if (currentState === STATES.SPEAKING || currentState === STATES.PAUSED) {
            speechSynthesisInstance.cancel();
            pausePosition = 0;
            setState(STATES.STOPPED);

            // 触发状态变化回调
            if (currentOptions.onSpeaking) {
                currentOptions.onSpeaking(false);
            }

            return true;
        }

        return false;
    }

    /**
     * 获取当前状态
     * @returns {string} 当前状态
     */
    function getState() {
        return currentState;
    }

    /**
     * 检查是否正在朗读
     * @returns {boolean} 是否正在朗读
     */
    function isSpeaking() {
        return currentState === STATES.SPEAKING;
    }

    /**
     * 检查是否处于暂停状态
     * @returns {boolean} 是否暂停
     */
    function isPaused() {
        return currentState === STATES.PAUSED;
    }

    /**
     * 获取可用的语音合成声音
     * @returns {Array} 声音列表
     */
    function getAvailableVoices() {
        if (!isSupported || !speechSynthesisInstance) {
            return [];
        }

        return speechSynthesisInstance.getVoices();
    }

    /**
     * 设置当前使用的语音
     * @param {SpeechSynthesisVoice} voice - 要使用的语音
     */
    function setVoice(voice) {
        currentOptions.voice = voice;
        // 如果正在说话，需要重新开始才能生效
        if (currentState === STATES.SPEAKING) {
            const wasSpeaking = true;
            pause();
            setTimeout(() => {
                speak().catch(err => console.error('Failed to restart speech:', err));
            }, 100);
        }
    }

    /**
     * 更新状态并触发回调
     * @param {string} newState - 新状态
     */
    function setState(newState) {
        if (currentState !== newState) {
            const previousState = currentState;
            currentState = newState;

            // 触发状态变化回调
            if (currentOptions.onStateChange) {
                currentOptions.onStateChange(newState, previousState);
            }
        }
    }

    /**
     * 估算当前朗读位置（近似值）
     * 由于API限制，无法精确获取位置，这里使用简单的估算
     */
    function calculateCurrentPosition() {
        // 这是一个基于语速和时间的粗略估算
        // 实际应用中可能需要更复杂的算法
        if (!currentUtterance || currentState !== STATES.SPEAKING) {
            return pausePosition;
        }

        // 假设平均每个字符的朗读时间（毫秒）
        const msPerChar = 1000 / (currentOptions.rate * 5); // 粗略估算
        const speakingTime = Date.now() - currentUtterance.startTime;
        const estimatedChars = Math.floor(speakingTime / msPerChar);

        return Math.min(pausePosition + estimatedChars, currentText.length);
    }

    // 初始化模块
    if (isSupported) {
        init();
    }

    // 暴露公共API
    return {
        // 状态常量
        STATES,

        // 基本信息
        isSupported,

        // 控制方法
        speak,
        pause,
        stop,
        resume: () => speak(), // 恢复朗读（调用不带文本的speak）

        // 状态查询
        getState,
        isSpeaking,
        isPaused,

        // 语音管理
        getAvailableVoices,
        setVoice
    };
});
