/**
 * Web Speech 朗读插件 - 最终优化版
 * 特性：
 * - 支持 AMD / CommonJS / 全局环境
 * - 支持 data-speech 自动绑定 和 new TextToSpeech('#btn', options) 手动初始化
 * - 修复页面跳转后语音残留导致无法朗读的问题
 *
 */
(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return factory(global, global.document);
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(global, global.document);
    } else {
        global.TextToSpeech = factory(global, global.document);
    }
}(typeof window !== 'undefined' ? window : global, function (window, document) {

    // 检查浏览器是否支持 Web Speech API
    if (!('speechSynthesis' in window)) {
        console.warn('当前浏览器不支持 Web Speech API，语音功能不可用。');
        return null;
    }

    /**
     * 语音朗读类
     * @param {String|HTMLElement} buttonSelector - 按钮选择器或元素（可选）
     * @param {Object} options - 配置项（可选）
     */
    function TextToSpeech(buttonSelector, options) {
        this.isSpeaking = false;

        if (buttonSelector) {
            // 手动初始化模式
            this.initWithConfig(buttonSelector, options || {});
        } else {
            // 自动初始化模式：绑定所有 [data-speech]
            this.initAuto();
        }
    }

    TextToSpeech.prototype.initAuto = function () {
        var self = this;
        var buttons = document.querySelectorAll('[data-speech]');
        Array.prototype.forEach.call(buttons, function (btn) {
            var targetId = btn.getAttribute('data-speech');
            var element = document.querySelector(targetId); // 支持 #id 或 .class 或 其他选择器
            if (!element) {
                console.warn('未找到目标元素:', targetId);
                return;
            }

            self.bindButton(btn, function () {
                return self.getTextContent(element);
            }, btn);
        });
    };

    TextToSpeech.prototype.initWithConfig = function (buttonSelector, options) {
        var self = this;

        var btn = typeof buttonSelector === 'string' ? document.querySelector(buttonSelector) : buttonSelector;
        if (!btn) {
            console.error('未找到按钮元素:', buttonSelector);
            return;
        }

        var targetSelector = options.target || btn.getAttribute('data-speech');
        var targetElement = typeof targetSelector === 'string' ? document.querySelector(targetSelector) : targetSelector;
        if (!targetElement) {
            console.error('未找到目标元素:', targetSelector);
            return;
        }

        var getText = function () {
            return self.getTextContent(targetElement);
        };

        this.bindButton(btn, getText, btn, options);
    };

    TextToSpeech.prototype.getTextContent = function (element) {
        var tagName = element.tagName;
        if (tagName === 'TEXTAREA' || (tagName === 'INPUT' && ['text', 'search', 'email', 'url', 'tel'].includes(element.type))) {
            return element.value.trim();
        }
        return element.innerText.trim();
    };

    TextToSpeech.prototype.bindButton = function (btn, getTextFunc, stateButton, options) {
        var self = this;

        btn.addEventListener('click', function (e) {
            e.preventDefault();

            var text = getTextFunc();
            if (!text) {
                alert('没有可朗读的文本内容。');
                return;
            }

            var config = self.mergeConfig(btn, options);

            if (self.isSpeaking) {
                window.speechSynthesis.cancel();
                self.isSpeaking = false;
                self.updateButtonState(stateButton, 'play', config);
            } else {
                // === 关键：开始前先 cancel，防止残留任务或冲突 ===
                window.speechSynthesis.cancel();

                var utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = config.lang;
                utterance.rate = config.rate;
                utterance.pitch = config.pitch;
                utterance.volume = config.volume;

                utterance.onstart = function () {
                    self.isSpeaking = true;
                    self.updateButtonState(stateButton, 'stop', config);
                };

                utterance.onend = function () {
                    self.isSpeaking = false;
                    self.updateButtonState(stateButton, 'play', config);
                };

                utterance.onerror = function (event) {
                    self.isSpeaking = false;
                    self.updateButtonState(stateButton, 'play', config);
                    console.error('语音朗读出错:', event.error || 'Unknown error');
                    window.speechSynthesis.cancel();
                };

                window.speechSynthesis.speak(utterance);
            }
        });
    };

    TextToSpeech.prototype.mergeConfig = function (btn, options) {
        return {
            lang: options.lang || btn.getAttribute('data-lang') || 'zh-CN',
            rate: parseFloat(options.rate) || parseFloat(btn.getAttribute('data-rate')) || 1.0,
            pitch: parseFloat(options.pitch) || parseFloat(btn.getAttribute('data-pitch')) || 1.0,
            volume: parseFloat(options.volume) || parseFloat(btn.getAttribute('data-volume')) || 1.0,
            playText: options.playText || btn.getAttribute('data-play-text') || '朗读',
            stopText: options.stopText || btn.getAttribute('data-stop-text') || '停止'
        };
    };

    TextToSpeech.prototype.updateButtonState = function (button, state, config) {
        button.textContent = state === 'play' ? config.playText : config.stopText;
    };

    // ========================
    // 自动初始化（非 AMD 环境）
    // ========================
    if (typeof define !== 'function' || !define.amd) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                new TextToSpeech();
            });
        } else {
            new TextToSpeech();
        }
    }

    // ========================
    // 🔥 关键修复：防止页面跳转后语音残留
    // ========================
    var cleanup = function () {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    };

    // 标准事件
    window.addEventListener('beforeunload', cleanup);
    // 更强兼容（尤其 Safari）
    window.addEventListener('pagehide', cleanup);

    // 返回构造函数
    return TextToSpeech;

}));
