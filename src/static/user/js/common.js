let srcs = document.scripts[document.scripts.length - 1].src.split('/');
window.appRoot = srcs.slice(0, -3).join('/') + '/';
window.baseRoot = srcs.slice(0, -2).join('/') + '/';
window.$ = window.jQuery = window.jQuery || window.jQuery || layui.$ || layui.jquery;
layui.config({
    base: "/static/libs/layui_exts/",
    version: "4.0.3"
}).extend({
    page: "user/page",
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

    xmSelect: "xm-select",
    popup: "extends/popup",
    count: "extends/count",
    toast: "extends/toast",
    nprogress: "extends/nprogress",
    echarts: "extends/echarts.min",
    echartsTheme: "extends/echartsTheme",
    yaml: "extends/yaml",
    uploads: '{/}//' + window.location.hostname + '/index/upload/index?',
    //app
    formsbuild: "app/formsbuild",
    app: 'app/app'

}).use(['layer', 'jquery', 'popup', 'util'], function () {
    let layer = layui.layer,
        $ = layui.jquery,
        popup = layui.popup,
        util = layui.util,
        $body = $('body');
    // data-image 预览图片
    $body.on('click', '[data-image="click"]', function (e) {
        e.preventDefault(); // 阻止默认行为
        // 获取当前元素的原始图片src属性
        var imgSrc = $(this).attr('src') || $(this).find('img').attr('src');
        if (imgSrc) {
            // 使用layer的图片弹出层显示原始尺寸的图片
            layer.photos({
                photos: {
                    "data": [{
                        "alt": "点击查看大图",
                        "pid": 1, // 相册id，可以不填
                        "src": imgSrc,
                        "thumb": imgSrc // 缩略图，可以不填
                    }]
                },
                anim: 5 // 0-6的动画形式，-1不开启
            });
        }
    });

    $body.on('mouseenter', '[data-image="hover"]', function (e) {
        let $el = $(this);

        // 尝试从子元素 img 获取 src
        let imgSrc = $el.find('img').attr('src') || $el.attr('src');

        if (imgSrc) {
            console.log('Image src:', imgSrc); // 调试：打印图片路径

            // 创建一个 Image 对象来确保图片路径有效
            let img = new Image();
            img.src = imgSrc;

            // 监听图片加载完成事件
            img.onload = function () {
                // 动态计算图片的宽度和高度
                let imgWidth = img.width;
                let imgHeight = img.height;

                // 定义提示框的最大宽度和高度
                let maxWidth = 260;
                let maxHeight = 260;

                // 计算缩放比例
                let scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight, 1);
                let scaledWidth = imgWidth * scale;
                let scaledHeight = imgHeight * scale;

                // 创建提示框并存储其索引
                let layidx = layer.tips('<img src="' + imgSrc + '" style="max-width:100%; max-height:100%; display:block; object-fit:contain;">', this, {
                    anim: 5, // 动画效果
                    tips: 3, // 提示框位置（3 表示跟随鼠标）
                    time: 0, // 悬停时持续显示，直到鼠标移开
                    skin: 'layui-layer-image', // 自定义样式类
                    isOutAnim: false, // 关闭时是否有动画
                    scrollbar: false, // 是否显示滚动条
                    area: [scaledWidth + 'px', scaledHeight + 'px'] // 动态设置提示框的宽度和高度
                });
                $el.data('layidx', layidx);

                // 立即设置提示框的初始位置
                let $lay = $('#layui-layer' + layidx);
                updateTooltipPosition(e, $lay);

                // 当鼠标移开时关闭提示框
                $el.off('mouseleave').on('mouseleave', function () {
                    layer.close(layidx);
                    $el.off('mousemove.tooltip'); // 解除 mousemove 事件监听
                });

                // 让提示框跟随鼠标移动
                $el.on('mousemove.tooltip', function (e) {
                    updateTooltipPosition(e, $lay);
                });
            };

            // 监听图片加载失败事件
            img.onerror = function () {
                console.error('Failed to load image:', imgSrc); // 调试：打印加载失败的图片路径
            };
        }
    });

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
                    content: response, maxmin: true,
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

    // 辅助函数：更新提示框的位置，并进行边界检查
    function updateTooltipPosition(event, $tooltip) {
        let windowWidth = $(window).width();
        let windowHeight = $(window).height();
        let tooltipWidth = $tooltip.outerWidth();
        let tooltipHeight = $tooltip.outerHeight();

        // 计算新的 top 和 left 值
        let newTop = event.pageY + 20;
        let newLeft = event.pageX - 20;

        // 确保提示框不会超出窗口的右边界
        if (newLeft + tooltipWidth > windowWidth) {
            newLeft = windowWidth - tooltipWidth - 10;
        }

        // 确保提示框不会超出窗口的底部边界
        if (newTop + tooltipHeight > windowHeight) {
            newTop = windowHeight - tooltipHeight - 10;
        }

        // 确保提示框不会超出窗口的左边界
        if (newLeft < 0) {
            newLeft = 10;
        }

        // 确保提示框不会超出窗口的顶部边界
        if (newTop < 0) {
            newTop = 10;
        }

        // 更新提示框的位置
        $tooltip.css({top: newTop, left: newLeft});
    }

    // 定义一个全局的图片加载错误处理器
    function handleImageError(event) {
        // 阻止默认行为，即浏览器尝试重新加载图片
        event.preventDefault();

        // 你可以选择隐藏图片、替换为占位符图片或执行其他操作
        var img = event.target;
        // img.style.display = 'none'; // 或者
        img.src = '/static/libs/image/error/no_image.png';

        // 取消事件冒泡，防止影响其他监听器
        event.stopPropagation();
    }

// 添加全局的错误事件监听器
    window.addEventListener('error', function (event) {
        // 检查触发事件的目标是否是 <img> 元素
        if (event.target.tagName.toLowerCase() === 'img') {
            handleImageError(event);
        }
    }, true);

})
