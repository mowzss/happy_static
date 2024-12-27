let srcs = document.scripts[document.scripts.length - 1].src.split('/');
window.appRoot = srcs.slice(0, -3).join('/') + '/';
window.baseRoot = srcs.slice(0, -2).join('/') + '/';
window.$ = window.jQuery = window.jQuery || window.jQuery || layui.$ || layui.jquery;
layui.config({
    base: "/static/libs/layui_exts/",
    version: "4.0.3"
}).extend({
    admin: "admin",
    pageTab: "pageTab",

    //编辑器
    tiny: "tinymce/tiny",//配置
    tinymce: "tinymce/tinymce.min",//
    wangEdit: "wangEditor/wangEdit",//配置
    wangEditor: "wangEditor/index",
    ueditor: "ueditor/ueditor",//配置
    UE: "ueditor/ueditor.all.min",
    UECONFING: "ueditor/ueditor.config",


    laytable: "laytable",
    fieldHandler: "fieldHandler",

    popup: "extends/popup",
    count: "extends/count",
    toast: "extends/toast",
    nprogress: "extends/nprogress",
    echarts: "extends/echarts.min",
    echartsTheme: "extends/echartsTheme",
    yaml: "extends/yaml",
    uploads: '{/}//' + window.location.hostname + '/layui_exts/uploads?',
    //app
    formsbuild: "app/formsbuild",
    app: 'app/app'

}).use(['layer', 'jquery', 'popup'], function () {
    let layer = layui.layer,
        $ = layui.jquery,
        popup = layui.popup,
        $body = $('body');
    //打开弹窗
    $body.on("click", "[data-modal]", function (event) {
        event.preventDefault(); // 阻止默认行为

        // 获取元素上的数据属性
        let url = this.dataset.modal,
            title = $(this).text(),
            customWidth = this.dataset.width || '800px', // 使用 || 提供默认值或保持为 undefined
            customHeight = this.dataset.height || 'auto', // 同上
            screenWidth = $(window).width(),
            modalWidth = screenWidth >= 1400 ? '800px' : '80%'; // 默认宽度

        // 如果有自定义宽度，则使用它；否则使用默认宽度
        if (customWidth) {
            modalWidth = customWidth;
        }

        $.ajax({
            url: url,
            method: 'GET',
            success: function (response) {
                if (response.code) {
                    return layer.msg(response.msg);
                }
                layer.open({
                    type: 1,
                    title: title,
                    content: response,
                    area: [modalWidth, customHeight], // 使用自定义高度或自动调整
                });
                // 检查是否需要移除元素
                if ($(event.target).data('removeAfterClick')) {
                    $(event.target).remove();
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('Error:', textStatus, errorThrown);
                layer.msg('请求失败: ' + textStatus + ', ' + errorThrown, {icon: 5});
            }
        });
    });
    $body.on('click', '[data-href]', function (event) {
        var href = this.dataset.href
        window.open(href)
    })
    $body.on('click', '[data-load]', function (event) {
        var href = this.dataset.load, methodType = this.dataset.method || 'get'
        $.ajax({
            url: href,
            type: methodType,
            dataType: 'json',
            cache: false,
            success: function (res) {
                popup.success(res.msg, function () {
                    window.location.reload()
                })
            },
            error: function (xhr, textstatus, thrown) {
                return popup.warming('Status:' + xhr.status + '，' + xhr.statusText + '，请稍后再试！')
            }

        })
    })
});
