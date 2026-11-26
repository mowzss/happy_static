// 统一上传内核：md5 计算、签名、对象存储直传、附件登记、失败回退服务器中转。
// 调用方只需传入配置并拿到 Promise<data>，各自负责回调风格与错误呈现。
layui.define(['jquery', 'layer'], function (exports) {
    "use strict";

    var $ = layui.jquery;
    var layer = layui.layer;

    var DEFAULTS = {
        signUrl: '',          // 直传签名接口
        registerUrl: '',      // 直传登记接口
        saveUrl: '',          // 服务器中转接口
        maxSize: 0,           // 直传大小上限（字节），0 表示不限制
        successCode: 0,       // 业务成功码
        direct: true,         // 是否允许浏览器直传（local 驱动时置 false 直接走中转）
        fieldName: 'file',    // 中转上传的字段名
        name: '',             // 可选：文件名（Blob 无 name 时用，如 TinyMCE 的 blobInfo.filename()）
        ext: '',              // 可选：扩展名（Blob 无 name 时可从文件名提取后传入）
        progress: null,       // function(percent) 上传进度
        before: null,         // function() 上传开始前
        after: null           // function() 上传结束后（无论成败）
    };

    // 按需加载 SparkMD5（layui 外部模块，路径由 common.js 统一管理）
    function ensureSparkMD5() {
        if (typeof SparkMD5 !== 'undefined') return Promise.resolve();
        return new Promise(function (resolve, reject) {
            layui.use(['sparkmd5'], function () {
                typeof SparkMD5 !== 'undefined' ? resolve() : reject(new Error('MD5 组件加载失败'));
            });
        });
    }

    // 分块计算文件/Blob 的 md5（2MB 分块，大文件不卡主线程）
    function md5(blob) {
        return ensureSparkMD5().then(function () {
            return new Promise(function (resolve, reject) {
                var blobSlice = blob.slice || blob.mozSlice || blob.webkitSlice;
                var chunkSize = 2 * 1024 * 1024;
                var chunks = Math.ceil(blob.size / chunkSize) || 1;
                var current = 0;
                var spark = new SparkMD5.ArrayBuffer();
                var reader = new FileReader();

                reader.onload = function (e) {
                    spark.append(e.target.result);
                    current++;
                    if (current < chunks) {
                        loadNext();
                    } else {
                        resolve(spark.end());
                    }
                };
                reader.onerror = function () { reject(new Error('读取文件失败')); };

                function loadNext() {
                    var start = current * chunkSize;
                    var end = Math.min(start + chunkSize, blob.size);
                    reader.readAsArrayBuffer(blobSlice.call(blob, start, end));
                }
                loadNext();
            });
        });
    }

    // 取直传签名
    function fetchSign(url, fileMd5) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: { md5: fileMd5 }
            }).done(function (res) {
                if (res && res.code === 0 && res.data && res.data.mode === 'direct') {
                    resolve(res.data);
                } else {
                    reject(new Error((res && res.msg) || '获取直传签名失败'));
                }
            }).fail(function () {
                reject(new Error('获取直传签名失败'));
            });
        });
    }

    // 组直传表单（OSS / 七牛）。文件字段必须最后追加，文件名用 ASCII 安全名。
    function buildDirectForm(file, key, info, ext) {
        var formData = new FormData();
        if (info.driver === 'oss') {
            formData.append('key', key);
            formData.append('policy', info.policy);
            formData.append('OSSAccessKeyId', info.accessId);
            formData.append('signature', info.signature);
            formData.append('success_action_status', String(info.successActionStatus || 200));
        } else {
            formData.append('token', info.token);
            formData.append('key', key);
        }
        var safeName = 'upload_' + randomName() + (ext ? '.' + ext : '');
        formData.append('file', file, safeName);
        return formData;
    }

    // 发送到对象存储
    function postToStorage(url, formData, progress) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            if (xhr.upload && progress) {
                xhr.upload.addEventListener('progress', function (e) {
                    if (e.lengthComputable) {
                        progress(Math.round((e.loaded / e.total) * 100));
                    }
                }, false);
            }
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error('直传失败'));
                }
            };
            xhr.onerror = function () { reject(new Error('直传失败')); };
            xhr.open('POST', url, true);
            xhr.send(formData);
        });
    }

    // 直传后登记附件
    function register(url, key, file, ext, fileMd5, successCode, name) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: { path: key, name: name || file.name || 'file', size: file.size, ext: ext, md5: fileMd5 }
            }).done(function (res) {
                if (res && res.code === successCode && res.data) {
                    resolve(res.data);
                } else {
                    reject(new Error((res && res.msg) || '上传登记失败'));
                }
            }).fail(function () {
                reject(new Error('上传登记失败'));
            });
        });
    }

    // 服务器中转上传
    function relay(file, cfg) {
        var options = $.extend(true, {}, DEFAULTS, cfg);
        return new Promise(function (resolve, reject) {
            if (!options.saveUrl) {
                reject(new Error('上传接口未配置'));
                return;
            }
            var formData = new FormData();
            formData.append(options.fieldName, file, options.name || file.name || 'file');

            $.ajax({
                url: options.saveUrl,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'json',
                xhr: function () {
                    var xhr = new window.XMLHttpRequest();
                    if (xhr.upload && options.progress) {
                        xhr.upload.addEventListener('progress', function (e) {
                            if (e.lengthComputable) {
                                options.progress(Math.round((e.loaded / e.total) * 100));
                            }
                        }, false);
                    }
                    return xhr;
                },
                success: function (res) {
                    var result = typeof res === 'string' ? safeParse(res) : res;
                    if (result && result.code === options.successCode && result.data) {
                        resolve(result.data);
                    } else {
                        reject(new Error((result && result.msg) || '上传失败'));
                    }
                },
                error: function (xhr) {
                    reject(new Error('网络错误：' + (xhr && xhr.status)));
                }
            });
        });
    }

    // 浏览器直传（md5 路径，内容级去重）
    function direct(file, cfg) {
        var options = $.extend(true, {}, DEFAULTS, cfg);
        var name = file.name || 'file';
        var ext = options.ext || (name.indexOf('.') > -1 ? name.split('.').pop().toLowerCase() : '');

        if (options.maxSize && file.size > options.maxSize) {
            return Promise.reject(new Error('文件大小超过限制'));
        }

        return md5(file).then(function (fileMd5) {
            return fetchSign(options.signUrl, fileMd5).then(function (info) {
                // 以服务端签发的前缀为准拼 key，防止越权
                var key = info.dir + fileMd5 + (ext ? '.' + ext : '');
                var formData = buildDirectForm(file, key, info, ext);
                return postToStorage(info.host, formData, options.progress).then(function () {
                    return register(info.registerUrl || options.registerUrl, key, file, ext, fileMd5, options.successCode, options.name);
                });
            });
        });
    }

    // 主编排：优先直传，任何环节失败自动回退服务器中转
    // 返回 Promise<data>；调用方只需处理成功数据，错误呈现各自负责
    function upload(file, cfg) {
        var options = $.extend(true, {}, DEFAULTS, cfg);
        if (options.before) options.before();
        var chain = options.direct === false
            ? relay(file, options)
            : direct(file, options).catch(function () { return relay(file, options); });
        return chain.then(function (data) {
                if (options.after) options.after();
                return data;
            }, function (err) {
                if (options.after) options.after();
                throw err;
            });
    }

    function randomName() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function safeParse(text) {
        try { return JSON.parse(text); } catch (e) { return null; }
    }

    exports('happyUpload', {
        md5: md5,
        direct: direct,
        relay: relay,
        upload: upload
    });
});
