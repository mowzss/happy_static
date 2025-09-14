/**
 * TextToSpeech v1.1.0 - Web Speech 朗读插件
 * 支持任意 CSS 选择器（#id, .class, [attr] 等）
 * 优先使用 layer 提示，无 layer 时降级为 alert
 * 兼容 AMD / CommonJS / 全局环境
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
     */
    function TextToSpeech(options) {
        this.isSpeaking = false;
        this.utterance = null;
        this.currentButton = null;
        this.options = Object.assign({
            playText: '朗读',
            stopText: '停止',
            selector: '[data-speech]',
            silent: false // 是否静默模式（不弹提示）
        }, options || {});

        this.init();
    }

    /**
     * 初始化：绑定所有 data-speech 按钮
     */
    TextToSpeech.prototype.init = function () {
        var self = this;
        var buttons = document.querySelectorAll(this.options.selector);

        Array.prototype.forEach.call(buttons, function (btn) {
            self.setDefaultButtonText(btn);
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                self.handleSpeechClick(btn);
            });
        });
    };

    /**
     * 处理点击事件
     */
    TextToSpeech.prototype.handleSpeechClick = function (btn) {
        var selector = btn.getAttribute('data-speech');
        if (!selector || typeof selector !== 'string') {
            this.showMessage('缺少 data-speech 属性', 'error');
            return;
        }

        var element = document.querySelector(selector);
        if (!element) {
            this.showMessage('未找到元素: ' + selector, 'error');
            return;
        }

        var text = this.extractText(element);
        if (!text) {
            this.showMessage('没有可朗读的文本内容。', 'warning');
            return;
        }

        this.isSpeaking ? this.stopSpeech() : this.speak(text, btn);
    };

    /**
     * 提取文本内容
     */
    TextToSpeech.prototype.extractText = function (element) {
        var tagName = element.tagName;
        if (tagName === 'TEXTAREA' ||
            (tagName === 'INPUT' && ['text', 'search', 'email', 'url', 'tel'].includes(element.type))) {
            return element.value.trim();
        }
        return (element.innerText || element.textContent).trim();
    };

    /**
     * 开始朗读
     */
    TextToSpeech.prototype.speak = function (text, button) {
        var self = this;
        var rate = parseFloat(button.getAttribute('data-rate')) || 1.0;
        var pitch = parseFloat(button.getAttribute('data-pitch')) || 1.0;
        var volume = parseFloat(button.getAttribute('data-volume')) || 1.0;
        var lang = button.getAttribute('data-lang') || 'zh-CN';

        this.utterance = new SpeechSynthesisUtterance(text);
        this.utterance.lang = lang;
        this.utterance.rate = rate;
        this.utterance.pitch = pitch;
        this.utterance.volume = volume;

        this.utterance.onstart = function () {
            self.isSpeaking = true;
            self.currentButton = button;
            self.updateButtonState(button, 'stop');
        };

        this.utterance.onend = function () {
            self.isSpeaking = false;
            self.currentButton = null;
            self.updateButtonState(button, 'play');
            self.showMessage('朗读完成', 'success');
        };

        this.utterance.onerror = function (event) {
            self.isSpeaking = false;
            self.currentButton = null;
            self.updateButtonState(button, 'play');

            // 静默处理中断类错误
            if (['interrupted', 'cancelled'].includes(event.error)) {
                return;
            }
            self.showMessage('语音朗读失败: ' + event.error, 'error');
        };

        window.speechSynthesis.speak(this.utterance);
    };

    /**
     * 停止朗读
     */
    TextToSpeech.prototype.stopSpeech = function () {
        if (this.isSpeaking) {
            window.speechSynthesis.cancel();
            this.isSpeaking = false;
            if (this.currentButton) {
                this.updateButtonState(this.currentButton, 'play');
            }
            this.currentButton = null;
        }
    };

    /**
     * 更新按钮状态
     */
    TextToSpeech.prototype.updateButtonState = function (button, state) {
        var text = state === 'play'
            ? button.getAttribute('data-play-text') || this.options.playText
            : button.getAttribute('data-stop-text') || this.options.stopText;
        button.textContent = text;
    };

    /**
     * 设置默认按钮文本
     */
    TextToSpeech.prototype.setDefaultButtonText = function (button) {
        if (!button.textContent.trim()) {
            button.textContent = button.getAttribute('data-play-text') || this.options.playText;
        }
    };

    /**
     * 显示消息（优先 layer，否则 alert）
     */
    TextToSpeech.prototype.showMessage = function (message, type) {
        if (this.options.silent) return;

        // Layer 配置映射
        var layerStyleMap = {
            success: {icon: 1, time: 2000},
            error: {icon: 2, time: 3000},
            warning: {icon: 0, time: 2500},
            info: {icon: -1, time: 2000}
        };

        // 优先使用 layer
        if (typeof layer !== 'undefined' && typeof layer.msg === 'function') {
            var config = layerStyleMap[type] || layerStyleMap.info;
            layer.msg(message, config);
            return;
        }

        // 降级为 alert + 控制台
        var prefix = {success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️'}[type] || 'ℹ️';
        console[type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'log']('[语音]', message);

        if (typeof alert !== 'undefined') {
            alert(prefix + ' ' + message);
        }
    };

    // ========== 自动初始化 ==========
    if (typeof define !== 'function' || !define.amd) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                new TextToSpeech();
            });
        } else {
            new TextToSpeech();
        }
    }

    // ========== 页面卸载前清理语音 ==========
    ['beforeunload', 'pagehide'].forEach(function (event) {
        window.addEventListener(event, function () {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        });
    });

    return TextToSpeech;
}));
