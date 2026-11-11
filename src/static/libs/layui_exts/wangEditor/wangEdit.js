layui.define(['jquery', 'layer', 'wangEditor'], function (exports) {
    "use strict";
    //引入css样式
    layui.link(layui.cache.base + "wangEditor/wangEditor.css", 'wangEditorCss')
    const wangEditor = layui.wangEditor;
    const $ = layui.jquery;
    const layer = layui.layer;
    // 定义默认配置
    const defaultConfig = {
        selector: '#editor', // 编辑器容器的选择器
        html: '<p><br></p>',
        height: 400,
        placeholder: 'Type here...',
        upload_url: '/?s=/index/Upload/save',
        upload_sign_url: '/?s=/index/Upload/sign',
        upload_register_url: '/?s=/index/Upload/register',
        base64LimitSize: 100, // base64图片大小限制
        serverResponseSuccessCode: 0, // 上传成功的返回码
        mode: 'default', // or 'simple'
        elem: null, // 用户传入的元素
    };

    // 随机文件名
    const randomName = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    // 获取直传签名
    const fetchSign = (config) => new Promise((resolve, reject) => {
        $.ajax({url: config.upload_sign_url, type: 'POST', dataType: 'json'})
            .done((res) => {
                if (res && res.code === 0 && res.data && res.data.mode === 'direct') {
                    resolve(res.data);
                } else {
                    reject(new Error('relay'));
                }
            })
            .fail(() => reject(new Error('relay')));
    });

    // 上传到对象存储
    const uploadToStorage = (file, key, info) => new Promise((resolve, reject) => {
        const formData = new FormData();
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
        // 文件字段必须最后追加
        formData.append('file', file, file.name);

        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
            } else {
                reject(new Error('直传失败'));
            }
        };
        xhr.onerror = () => reject(new Error('直传失败'));
        xhr.open('POST', info.host, true);
        xhr.send(formData);
    });

    // 登记附件
    const registerAttachment = (key, file, ext, info, config) => new Promise((resolve, reject) => {
        $.ajax({
            url: info.registerUrl || config.upload_register_url,
            type: 'POST',
            dataType: 'json',
            data: {path: key, name: file.name, size: file.size, ext: ext}
        }).done((res) => {
            if (res && res.code === config.serverResponseSuccessCode && res.data) {
                resolve(res.data);
            } else {
                reject(new Error((res && res.msg) || '上传失败'));
            }
        }).fail(() => reject(new Error('上传登记失败')));
    });

    // 浏览器直传
    const directUploadImage = async (file, config) => {
        const info = await fetchSign(config);
        const ext = file.name && file.name.indexOf('.') > -1 ? file.name.split('.').pop().toLowerCase() : '';
        if (info.allowExts && info.allowExts.length && ext && info.allowExts.indexOf(ext) === -1) {
            throw new Error('不允许的文件类型');
        }
        if (info.maxSize && file.size > info.maxSize) {
            throw new Error('文件大小超过限制');
        }
        const key = info.dir + randomName() + (ext ? '.' + ext : '');
        await uploadToStorage(file, key, info);
        return registerAttachment(key, file, ext, info, config);
    };

    // 服务器中转
    const relayUploadImage = (file, config) => new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file, file.name);
        $.ajax({
            url: config.upload_url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: (res) => {
                if (res && res.code === config.serverResponseSuccessCode && res.data) {
                    resolve(res.data);
                } else {
                    reject(new Error((res && res.msg) || '上传失败'));
                }
            },
            error: (xhr) => reject(new Error('网络错误：' + xhr.status))
        });
    });

    // 初始化WangEditor实例
    function initEditor(options) {
        // 合并用户提供的配置与默认配置
        const config = Object.assign({}, defaultConfig, options);
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
                        // 第三方存储优先浏览器直传，失败回退服务器中转
                        async customUpload(file, insertFn) {
                            try {
                                const data = await directUploadImage(file, config);
                                layer.msg("上传成功", {icon: 1});
                                insertFn(data.url, data.name);
                            } catch (e) {
                                try {
                                    const data = await relayUploadImage(file, config);
                                    layer.msg("上传成功", {icon: 1});
                                    insertFn(data.url, data.name);
                                } catch (err) {
                                    layer.msg((err && err.message) || "上传失败", {icon: 2});
                                }
                            }
                        },
                        customInsert(res, insertFn) {
                            if (res.code === config.serverResponseSuccessCode) {
                                layer.msg("上传成功", {icon: 1});
                                insertFn(res.data.url, res.data.name);
                            } else {
                                layer.msg("上传失败", {icon: 2});
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
    const wangEdit = {
        render: function (options) {
            return initEditor(options);
        }
    };

    // 输出模块
    exports('wangEdit', wangEdit);
});
