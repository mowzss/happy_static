/**
 * Web Speech 朗读插件 - 支持 AMD 规范
 * 支持点击按钮朗读指定元素的文本内容
 * 兼容 AMD / CommonJS / 全局环境
 */
(function (global, factory) {
    // 判断环境并调用工厂函数
    if (typeof define === 'function' && define.amd) {
        // AMD 环境 (RequireJS)
        define([], function () {
            return factory(global, global.document);
        });
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS 环境 (Node.js, Browserify)
        module.exports = factory(global, global.document);
    } else {
        // 浏览器全局环境
        global.TextToSpeech = factory(global, global.document);
    }
}(typeof window !== 'undefined' ? window : global, function (window, document) {

    // 检查浏览器是否支持 Web Speech API
    if (!('speechSynthesis' in window)) {
        console.warn('当前浏览器不支持 Web Speech API，语音功能不可用。');
        return null; // 返回 null 表示不可用
    }

    /**
     * 语音朗读类
     */
    function TextToSpeech() {
        this.isSpeaking = false;
        this.utterance = null;
        this.init();
    }

    TextToSpeech.prototype.init = function () {
        var self = this;
        var buttons = document.querySelectorAll('[data-speech]');

        Array.prototype.forEach.call(buttons, function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                var targetId = btn.getAttribute('data-speech');
                var element = document.getElementById(targetId);

                if (!element) {
                    alert('未找到ID为 "' + targetId + '" 的元素');
                    return;
                }

                // 获取文本内容
                var text = '';
                var tagName = element.tagName;
                if (tagName === 'TEXTAREA' || (tagName === 'INPUT' && (element.type === 'text' || element.type === 'search'))) {
                    text = element.value.trim();
                } else {
                    text = element.innerText.trim();
                }

                if (!text) {
                    alert('没有可朗读的文本内容。');
                    return;
                }

                // 配置语音参数（支持自定义属性）
                var rate = parseFloat(btn.getAttribute('data-rate')) || 1.0;
                var pitch = parseFloat(btn.getAttribute('data-pitch')) || 1.0;
                var volume = parseFloat(btn.getAttribute('data-volume')) || 1.0;
                var lang = btn.getAttribute('data-lang') || 'zh-CN';

                if (self.isSpeaking) {
                    // 正在朗读，停止
                    window.speechSynthesis.cancel();
                    self.isSpeaking = false;
                    self.updateButtonState(btn, 'play');
                } else {
                    // 创建新的 utterance
                    var utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = lang;
                    utterance.rate = rate;
                    utterance.pitch = pitch;
                    utterance.volume = volume;

                    utterance.onstart = function () {
                        self.isSpeaking = true;
                        self.updateButtonState(btn, 'stop');
                    };

                    utterance.onend = function () {
                        self.isSpeaking = false;
                        self.updateButtonState(btn, 'play');
                    };

                    utterance.onerror = function () {
                        self.isSpeaking = false;
                        self.updateButtonState(btn, 'play');
                        console.error('语音朗读出错');
                    };

                    window.speechSynthesis.speak(utterance);
                }
            });
        });
    };

    TextToSpeech.prototype.updateButtonState = function (button, state) {
        if (state === 'play') {
            button.textContent = button.getAttribute('data-play-text') || '朗读';
        } else {
            button.textContent = button.getAttribute('data-stop-text') || '停止';
        }
    };

    // DOM 加载完成后自动初始化（仅在全局环境下执行）
    if (typeof define !== 'function' || !define.amd) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                new TextToSpeech();
            });
        } else {
            new TextToSpeech();
        }
    }

    // 返回构造函数
    return TextToSpeech;

}));
