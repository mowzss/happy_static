layui.define(['jquery', 'toast', 'wangEditor'], function (exports) {
    "use strict";
    var wangEditor = layui.wangEditor;
    var $ = layui.jquery;
    var toast = layui.toast;
    // 定义默认配置
    var defaultConfig = {
        selector: '#editor', // 编辑器容器的选择器
        html: '<p><br></p>',
        height: 400,
        placeholder: 'Type here...',
        upload_url: '/index.php?s=/index/Upload/save',
        base64LimitSize: 100, // base64图片大小限制
        serverResponseSuccessCode: 0, // 上传成功的返回码
        mode: 'default', // or 'simple'
        elem: null, // 用户传入的元素
    };

    // 初始化WangEditor实例
    function initEditor(options) {
        // 合并用户提供的配置与默认配置
        var config = Object.assign({}, defaultConfig, options);
        if ($(config.elem).data('wangEditor')) return;
        const $wangEditor = $('<div class="wangEditor"><div class="wangEditor-toolbar"></div><div class="wangEditor-editor"></div></div>');
        $(config.elem).hide().data('wangEditor', $wangEditor).after($wangEditor).parent();
        const E = wangEditor;
        // 创建编辑器
        const editor = E.createEditor({
            selector: $wangEditor.find('.wangEditor-editor').get(0),
            html: config.html,
            config: {
                height: config.height,
                placeholder: config.placeholder,
                MENU_CONF: {
                    uploadImage: {
                        fieldName: 'file',
                        base64LimitSize: config.base64LimitSize,
                        server: config.upload_url,
                        customInsert(res, insertFn) {
                            if (res.code === config.serverResponseSuccessCode) {
                                toast.success({title: "上传成功", message: res.msg});
                                insertFn(res.data.url, res.data.name);
                            } else {
                                toast.error({title: "上传失败", message: res.msg});
                            }
                        },
                    }
                },
                onCreated(editor) {
                    editor.setHtml($(config.elem).val());
                },
                onChange(editor) {
                    $(config.elem).val(editor.getHtml());
                }
            },
            mode: config.mode,
        });

        // 创建工具栏
        E.createToolbar({
            editor,
            selector: $wangEditor.find('.wangEditor-toolbar').get(0),
            config: {}
        });

        return editor; // 返回编辑器实例，以便外部可以调用其方法
    }

    // 暴露给外部的接口
    var wangEdit = {
        render: function (options) {
            return initEditor(options);
        }
    };
    // 输出模块
    exports('wangEdit', wangEdit);
});
