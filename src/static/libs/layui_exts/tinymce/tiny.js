layui.define(['jquery', 'tinymce',], function (exports) {
    var $ = layui.$;
    var tinymce = layui.tinymce;
    // 图片上传接口
    var images_upload_url = '/?s=/index/Upload/save';

    // 默认配置项
    var defaultConfig = {
        file_field: 'file',//上传字段
        selector: '',
        license_key: 'gpl',
        height: 600,
        branding: false,
        promotion: false,
        paste_data_images: true,
        language: 'zh_CN',
        plugins: 'code kityformula-editor quickbars print preview searchreplace autolink fullscreen image link media codesample table charmap hr advlist lists wordcount imagetools indent2em',
        toolbar: 'code image | kityformula-editor forecolor backcolor bold italic underline strikethrough | indent2em alignleft aligncenter alignright alignjustify outdent indent | link bullist numlist table codesample | formatselect fontselect fontsizeselect',
        menubar: 'file edit insert format table',
        menu: {
            file: {title: '文件', items: 'newdocument | print preview fullscreen | wordcount'},
            edit: {title: '编辑', items: 'undo redo | cut copy paste pastetext selectall | searchreplace'},
            format: {
                title: '格式',
                items: 'bold italic underline strikethrough superscript subscript | formats | forecolor backcolor | removeformat'
            },
            table: {title: '表格', items: 'inserttable tableprops deletetable | cell row column'},
        },
        // 设置图片上传的URL
        images_upload_url: images_upload_url,
        // 直传签名 / 登记接口（后端为第三方存储时返回直传配置）
        upload_sign_url: '/?s=/index/Upload/sign',
        upload_register_url: '/?s=/index/Upload/register',
        images_upload_base_path: '',
        setup: function (editor) {
            editor.on('init', function () {
                editor.save();
            });

            editor.on('change keyup blur', function () {
                editor.save();
            });
        }
    };

    // tinymce 实例
    var tiny = {
        render: function (options) {
            // 合并默认配置与用户传入的配置
            var config = this.initConfig(options);

            var edit = this.get(options.selector);

            if (edit) {
                edit.destroy();
            }

            // 初始化 tinymce
            var editor = tinymce.init(config);
            return editor;
        },
        get: function (elem) {
            if (!elem) return false;

            // 获取实际的 DOM 元素
            var $elem = $(elem);
            if ($elem.length === 0) {
                console.warn('元素未找到：', elem);
                return false;
            }

            // 获取第一个匹配元素的 ID
            var id = $elem.first().attr('id');
            if (!id) {
                console.warn('元素没有 ID 属性：', elem);
                return false;
            }

            // 使用 tinymce.get 方法从 tinymce 中查找编辑器实例
            return tinymce.get(id) || false;
        },
        initConfig: function (options) {
            var config = $.extend(true, {}, defaultConfig, options);
            var randomName = function () {
                return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
            };

            // 直传：取签名 -> 上传对象存储 -> 登记附件
            var directUpload = function (blob, filename) {
                return new Promise(function (resolve, reject) {
                    $.ajax({url: config.upload_sign_url, type: 'POST', dataType: 'json'})
                        .done(function (res) {
                            if (!(res && res.code === 0 && res.data && res.data.mode === 'direct')) {
                                reject(new Error('relay'));
                                return;
                            }
                            var info = res.data;
                            var ext = filename && filename.indexOf('.') > -1 ? filename.split('.').pop().toLowerCase() : '';
                            if (info.allowExts && info.allowExts.length && info.allowExts.indexOf(ext) === -1) {
                                reject(new Error('不允许的文件类型'));
                                return;
                            }
                            if (info.maxSize && blob.size > info.maxSize) {
                                reject(new Error('文件大小超过限制'));
                                return;
                            }

                            var key = info.dir + randomName() + (ext ? '.' + ext : '');
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
                            // 文件字段必须最后追加；multipart 文件名用 ASCII 安全名（OSS 对象名由 key 决定）
                            formData.append('file', blob, 'upload_' + randomName() + (ext ? '.' + ext : ''));

                            var xhr = new XMLHttpRequest();
                            xhr.onload = function () {
                                if (xhr.status < 200 || xhr.status >= 300) {
                                    reject(new Error('直传失败'));
                                    return;
                                }
                                $.ajax({
                                    url: info.registerUrl || config.upload_register_url,
                                    type: 'POST',
                                    dataType: 'json',
                                    data: {path: key, name: filename, size: blob.size, ext: ext}
                                }).done(function (r) {
                                    if (r && r.code === 0 && r.data && r.data.url) {
                                        resolve(r.data.url);
                                    } else {
                                        reject(new Error((r && r.msg) || '上传失败'));
                                    }
                                }).fail(function () {
                                    reject(new Error('上传登记失败'));
                                });
                            };
                            xhr.onerror = function () {
                                reject(new Error('直传失败'));
                            };
                            xhr.open('POST', info.host, true);
                            xhr.send(formData);
                        })
                        .fail(function () {
                            reject(new Error('relay'));
                        });
                });
            };

            // 回退：服务器中转上传
            var relayUpload = function (blob, filename) {
                return new Promise(function (resolve, reject) {
                    if (!config.images_upload_url) {
                        reject(new Error('上传接口未配置'));
                        return;
                    }
                    var formData = new FormData();
                    formData.append(config.file_field || 'file', blob, filename);
                    if (config.form_data && typeof config.form_data === 'object') {
                        for (var key in config.form_data) {
                            formData.append(key, config.form_data[key]);
                        }
                    }
                    $.ajax({
                        url: config.images_upload_url,
                        dataType: 'json',
                        type: 'POST',
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function (res) {
                            if (res && res.code === 0 && res.data && res.data.url) {
                                resolve(res.data.url);
                            } else {
                                reject(new Error((res && res.msg) || '上传失败'));
                            }
                        },
                        error: function (xhr) {
                            reject(new Error('网络错误：' + xhr.status));
                        }
                    });
                });
            };

            config.images_upload_handler = function (blobInfo, succFun, failFun) {
                var blob = blobInfo.blob();
                var filename = blobInfo.filename();

                return directUpload(blob, filename)
                    .catch(function () {
                        return relayUpload(blob, filename);
                    })
                    .then(function (url) {
                        succFun(url);
                        return url;
                    })
                    .catch(function (error) {
                        var message = error && error.message ? error.message : '上传失败';
                        failFun(message);
                        throw new Error(message);
                    });
            };

            return config;
        },

    };

    // 导出 tinymce 模块
    exports('tiny', tiny);
});
