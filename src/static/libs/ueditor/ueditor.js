layui.define(['jquery', 'UECONFING', 'UE'], function (exports) {
    var $ = layui.jquery;
    var UE = layui.UE;
    var modFile = layui.cache.modules['ueditor'];
    var modPath = modFile.substring(0, modFile.lastIndexOf('/'));
    // 定义配置对象
    var conf = {
        uploadUrl: '/index.php?s=/index/Upload/ueditor',
        // 自定义上传配置
        uploadServiceEnable: true,
        uploadServiceUpload: function (type, file, callback, option) {
            // 创建FormData对象用于上传文件
            var formData = new FormData();
            formData.append('file', file);  // 文件字段名为 'file'
            // 发起AJAX请求
            $.ajax({
                url: '/index.php?s=/index/Upload/save',  // 上传地址
                type: 'POST',
                data: formData,
                processData: false,  // 不要处理数据（让数据保持原始格式）
                contentType: false,  // 不设置内容类型
                xhr: function () {
                    var xhr = new window.XMLHttpRequest();
                    if (xhr.upload && callback.progress) {
                        xhr.upload.addEventListener('progress', function (e) {
                            if (e.lengthComputable) {
                                callback.progress(Math.round((e.loaded / e.total) * 100));  // 更新上传进度
                            }
                        }, false);
                    }
                    return xhr;
                },
                success: function (response) {
                    handleResponse(response, callback);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(callback, '网络错误或服务器错误: ' + textStatus + ' - ' + errorThrown);
                }
            });
        }
    };

    // 默认配置
    var defaultConfig = {
        UEDITOR_HOME_URL: modPath + '/',
        UEDITOR_CORS_URL: modPath + '/',
        serverUrl: conf.uploadUrl,
        initialFrameHeight: 500,  // 固定高度
        autoHeightEnabled: false,  // 禁用自动高度调整
        uploadServiceEnable: conf.uploadServiceEnable,  // 启用自定义上传服务
        uploadServiceUpload: conf.uploadServiceUpload,  // 自定义上传函数
        tipError: function (msg, param) {
            if (window && window.MS && window.MS.dialog) {
                window.MS.dialog.tipError(msg);
            } else {
                alert(msg);
            }
        }
    };

    // 处理服务器响应
    function handleResponse(response, callback) {
        try {
            var result = typeof response === 'string' ? JSON.parse(response) : response;

            if (result.code === 0) {  // 成功
                var uploadResult = {
                    state: 'SUCCESS',
                    url: result.data.url,  // 文件访问路径
                    title: result.data.name,  // 文件名
                    original: result.data.name,  // 原始文件名
                    type: result.data.ext,  // 文件扩展名
                    size: result.data.size  // 文件大小
                };
                callback.success(uploadResult);  // 调用成功回调
            } else {
                handleError(callback, result.msg || '上传失败');
            }
        } catch (error) {
            handleError(callback, '服务器响应解析失败');
        }
    }

    // 处理错误
    function handleError(callback, message) {
        callback.error({msg: message});
    }

    // 暴露的方法
    var ueditor = {

        render: function (elem, config) {
            var finalConfig = $.extend({}, defaultConfig, config);
            var $elem = $(elem), id = $elem.attr('id');
            UE.delEditor(id);
            var editor = UE.getEditor(id, finalConfig);

            editor.ready(function () {
                editor.setContent($elem.val());  // 设置初始内容
                // 编辑器内容改变时更新textarea内容，实现双向绑定
                editor.addListener('contentChange', function () {
                    $elem.val(editor.getContent());
                });
                // textarea内容改变时更新编辑器内容，同样实现双向绑定
                $elem.on('input', function () {
                    editor.setContent(this.value);
                });
            });
        }
    };

    // 将ueditor模块暴露出去，遵循Layui模块规范
    exports('ueditor', ueditor);
});
