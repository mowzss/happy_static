layui.define(['jquery', 'tinymce', 'happyUpload'], function (exports) {
    var $ = layui.$;
    var tinymce = layui.tinymce;
    var happyUpload = layui.happyUpload;
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
            // 统一上传内核：直传（md5 路径去重）失败自动回退服务器中转
            config.images_upload_handler = function (blobInfo, succFun, failFun) {
                var blob = blobInfo.blob();
                var filename = blobInfo.filename();
                happyUpload.upload(blob, {
                    signUrl: config.upload_sign_url,
                    registerUrl: config.upload_register_url,
                    saveUrl: config.images_upload_url,
                    fieldName: config.file_field || 'file',
                    name: filename, // Blob 本身无 name，用 blobInfo.filename()
                    ext: filename && filename.indexOf('.') > -1 ? filename.split('.').pop().toLowerCase() : '',
                    direct: true
                }).then(function (data) {
                    succFun(data.url);
                }).catch(function (err) {
                    failFun((err && err.message) || '上传失败');
                });
            };

            return config;
        },

    };

    // 导出 tinymce 模块
    exports('tiny', tiny);
});
