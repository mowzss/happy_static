使用示例（需要 AMD 加载器如 RequireJS）：

javascript

运行

```javascript
require(['web-speech'], function(WebSpeech) {
    // 检查支持情况
    if (WebSpeech.isSpeechSynthesisSupported) {
        // 朗读文本
        WebSpeech.speak('Hello, this is a test of the Web Speech API', {
            lang: 'en-US',
            rate: 1.2
        }).then(() => {
            console.log('Speech completed');
        }).catch((error) => {
            console.error('Speech error:', error);
        });
    }
  
    if (WebSpeech.isSpeechRecognitionSupported) {
        // 开始语音识别
        WebSpeech.startListening(
            (transcript) => {
                console.log('You said:', transcript);
            },
            (error) => {
                console.error('Recognition error:', error);
            },
            () => {
                console.log('Recognition ended');
            }
        );
      
        // 5秒后停止识别
        setTimeout(() => {
            WebSpeech.stopListening();
        }, 5000);
    }
});
```

请注意，语音识别功能在某些浏览器中可能需要 HTTPS 环境，并且用户需要授予麦克风权限才能正常工作。

给我详细讲解一下用法

下面我将详细讲解这个 Web Speech API AMD 模块的使用方法，包括初始化、语音合成、语音识别等功能的具体用法和参数说明。

### 模块加载与基础检查

首先需要通过 AMD 加载器（如 RequireJS）加载模块：

javascript

运行

```javascript
require(['web-speech'], function(WebSpeech) {
    // 在这里使用WebSpeech模块
});
```

加载后，首先应该检查浏览器支持情况：

javascript

运行

```javascript
// 检查语音合成支持
if (WebSpeech.isSpeechSynthesisSupported) {
    console.log('浏览器支持语音合成');
} else {
    console.log('浏览器不支持语音合成');
}

// 检查语音识别支持
if (WebSpeech.isSpeechRecognitionSupported) {
    console.log('浏览器支持语音识别');
} else {
    console.log('浏览器不支持语音识别');
}
```

### 语音合成（Text-to-Speech）用法

语音合成功能用于将文本转换为语音朗读出来。

#### 基本朗读

最简单的使用方式：

javascript

运行

```javascript
// 朗读文本
WebSpeech.speak('欢迎使用Web Speech API')
    .then(() => {
        console.log('朗读完成');
    })
    .catch(error => {
        console.error('朗读出错:', error);
    });
```

#### 带选项的朗读

可以通过第二个参数设置各种朗读选项：

javascript

运行

```javascript
WebSpeech.speak('This is a test with custom options', {
    lang: 'en-US',      // 语言，如'en-US', 'zh-CN'
    volume: 0.8,        // 音量，0到1之间
    rate: 1.1,          // 语速，0.1到10之间，默认1
    pitch: 1.2,         // 音调，0到2之间，默认1
})
.then(() => console.log('朗读完成'))
.catch(err => console.error('错误:', err));
```

#### 语音选择

可以获取并选择不同的语音进行朗读：

javascript

运行

```javascript
// 获取可用语音
const voices = WebSpeech.getAvailableVoices();
console.log('可用语音:', voices);

// 选择中文语音并朗读
if (voices.length > 0) {
    // 查找中文语音
    const chineseVoice = voices.find(voice => 
        voice.lang.includes('zh') || voice.name.includes('Chinese')
    );
  
    if (chineseVoice) {
        const utterance = new SpeechSynthesisUtterance('这是使用指定语音的朗读');
        utterance.voice = chineseVoice;
        window.speechSynthesis.speak(utterance);
    }
}
```

> 注意：语音列表可能需要一点时间加载，有时需要监听`voiceschanged`事件

### 语音识别（Speech-to-Text）用法

语音识别功能用于将语音转换为文本。

#### 基本识别

javascript

运行

```javascript
// 开始识别
WebSpeech.startListening(
    // 识别结果回调
    (transcript) => {
        console.log('识别结果:', transcript);
        // 在这里处理识别到的文本，如显示在页面上
        document.getElementById('result').textContent = transcript;
    },
    // 错误回调
    (error) => {
        console.error('识别错误:', error);
    },
    // 识别结束回调
    () => {
        console.log('识别已结束');
    }
);

// 手动停止识别（例如通过按钮点击）
document.getElementById('stopBtn').addEventListener('click', () => {
    WebSpeech.stopListening();
});
```

#### 带配置的识别初始化

可以在初始化时配置识别参数：

javascript

运行

```javascript
// 初始化识别器并配置参数
WebSpeech.initRecognition({
    continuous: false,    // 是否连续识别，默认false
    interimResults: false, // 是否返回中间结果，默认false
    lang: 'zh-CN'         // 识别语言，默认'en-US'
});

// 开始识别
WebSpeech.startListening(
    transcript => console.log('你说:', transcript),
    error => console.error('错误:', error)
);
```

参数说明：

* `continuous`：设为`true`时，会持续识别直到调用`stopListening()`
* `interimResults`：设为`true`时，会返回临时结果（可能不完整）
* `lang`：设置识别语言，如 'zh-CN'（中文）、'en-US'（英文）、'ja-JP'（日文）等

### 完整使用示例

下面是一个包含语音合成和语音识别的完整示例：

javascript

运行

```javascript
require(['web-speech'], function(WebSpeech) {
    // 语音合成示例
    const synthBtn = document.getElementById('synthesizeBtn');
    const textInput = document.getElementById('textInput');
  
    synthBtn.addEventListener('click', () => {
        const text = textInput.value;
        if (text) {
            WebSpeech.speak(text, {
                lang: 'zh-CN',
                rate: 1.0
            })
            .then(() => alert('朗读完成'))
            .catch(err => alert('朗读失败: ' + err));
        }
    });
  
    // 语音识别示例
    const startRecBtn = document.getElementById('startRecBtn');
    const stopRecBtn = document.getElementById('stopRecBtn');
    const resultDiv = document.getElementById('resultDiv');
  
    // 初始化识别器为中文识别
    WebSpeech.initRecognition({
        lang: 'zh-CN',
        interimResults: true
    });
  
    startRecBtn.addEventListener('click', () => {
        resultDiv.textContent = '正在聆听...';
        WebSpeech.startListening(
            (transcript) => {
                resultDiv.textContent = transcript;
            },
            (error) => {
                resultDiv.textContent = '识别错误: ' + error;
            },
            () => {
                resultDiv.textContent += ' (识别结束)';
            }
        );
    });
  
    stopRecBtn.addEventListener('click', () => {
        WebSpeech.stopListening();
    });
});
```

在初始化时指定`continuous: true`即可启用长文本识别模式：

javascript

运行

```javascript
// 初始化识别器为连续模式，支持长文本识别
WebSpeech.initRecognition({
    continuous: true,       // 启用连续识别（关键参数）
    interimResults: true,   // 可以获取中间结果
    lang: 'zh-CN',          // 识别语言
    restartInterval: 300000 // 可选：设置重启间隔（5分钟=300000毫秒）
});

// 开始长文本识别
WebSpeech.startListening(
    (transcript) => {
        console.log('完整识别结果:', transcript);
        // 实时显示完整的识别文本
        document.getElementById('result').textContent = transcript;
    },
    (error) => {
        console.error('识别错误:', error);
    },
    () => {
        console.log('识别已手动停止');
    }
);

// 停止识别（例如通过按钮）
document.getElementById('stopBtn').addEventListener('click', () => {
    WebSpeech.stopListening();
});
```


### 注意事项

1. **权限问题**：语音识别需要用户授予麦克风权限，首次使用会有弹窗请求
2. **HTTPS 要求**：多数浏览器要求在 HTTPS 环境下使用语音识别（[localhost](https://localhost/)除外）
3. **浏览器兼容性**：
   * 语音合成支持较好，现代浏览器基本都支持
   * 语音识别支持相对有限，主要在 Chrome、Edge 等浏览器中支持较好
4. **语音列表加载**：`getAvailableVoices()`可能需要等待`voiceschanged`事件触发后才能获取完整列表

通过以上方法，你可以充分利用这个 AMD 模块来实现网页中的语音合成和语音识别功能，为用户提供更丰富的交互体验。
