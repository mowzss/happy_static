layui.define(['jquery', 'tinymce', 'admin'], function (exports) {
    var $ = layui.$;
    var tinymce = layui.tinymce;
    var admin = layui.admin || {}
    // 图片上传接口
    var images_upload_url = '/index.php?s=/index/Upload/save';

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
            config.images_upload_handler = function (blobInfo, succFun, failFun) {
                return new Promise((resolve, reject) => {
                    // 确保 images_upload_url 已配置
                    if (!config.images_upload_url) {
                        failFun("上传接口未配置");
                        console.error('images_upload_url未配置');
                        reject("上传接口未配置");
                        return;
                    }

                    var formData = new FormData();
                    formData.append(config.file_field || 'file', blobInfo.blob(), blobInfo.filename());

                    // 添加额外的表单数据（如果有）
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
                            try {
                                if (res && res.code === 0 && res.data && res.data.url) {
                                    succFun(res.data.url); // 成功时调用成功回调
                                    resolve(res.data.url);
                                } else {
                                    failFun(res.msg || '上传失败，服务器响应异常');
                                    reject(res.msg || '上传失败，服务器响应异常');
                                }
                            } catch (error) {
                                failFun('解析服务器响应时出错：' + error.message);
                                reject('解析服务器响应时出错：' + error.message);
                            }
                        },
                        error: function (xhr, status, error) {
                            var errorMessage = "网络错误：" + xhr.status + " " + (xhr.responseText ? (JSON.parse(xhr.responseText).msg || '未知错误') : error);
                            failFun(errorMessage); // 网络错误时调用失败回调
                            reject(errorMessage);
                        }
                    });
                });
            };

            return config;
        },

    };

    // 导出 tinymce 模块
    exports('tiny', tiny);
});
