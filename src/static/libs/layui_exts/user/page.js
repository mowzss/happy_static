layui.define(['jquery'], function (exports) {
    "use strict";
    let $ = layui.jquery;
    let $body = $(document);
    let page = {
        render: function (options) {
            //监听
            this.on();
            this.init();
        },
        init: function () {
            $body.find("[data-menu]").eq(0).trigger('click');
        },
        on: function () {
            //菜单点击
            $body.on('click', '[data-menu]', function (e) {
                e.preventDefault();
                let url = this.dataset.menu;
                $.ajax({
                    url: url,
                    type: 'GET',
                    success: function (data, textStatus, jqXHR) {
                        // 检查Content-Type头以确定响应数据类型
                        var contentType = jqXHR.getResponseHeader('Content-Type');

                        if (contentType && contentType.indexOf('application/json') !== -1) {
                            // 如果是JSON数据，假设json格式为 { "msg": "message text" }
                            try {
                                let jsonData = JSON.parse(data);
                                layer.msg(jsonData.msg);
                            } catch (e) {
                                // 如果解析失败，可能是预期内的非JSON文本，或者是一个错误
                                layer.msg('请求网页出错');
                            }
                        } else {
                            // 假设其他情况都是HTML内容
                            $body.find('#content').html(data);
                        }
                    },
                    error: function (xhr, status, error) {
                        // 构造更详细的错误信息
                        var errorMessage = '页面出错！或网络错误: ';

                        // 包含状态码
                        if (xhr.status) {
                            errorMessage += '状态码: ' + xhr.status + ' ';
                        }

                        // 包括可能的错误信息
                        if (error) {
                            errorMessage += '错误: ' + error;
                        }

                        // 显示最终的错误信息
                        layer.msg(errorMessage);
                    }
                })
            })
        }

    }
    exports('page', page)
})
