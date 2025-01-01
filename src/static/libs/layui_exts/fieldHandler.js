// static/js/fieldHandler.js
layui.define([], function (exports) {
    // 定义字段处理函数
    function init(settings) {
        // 确保 cols 是一个数组
        if (!Array.isArray(settings.cols) || !settings.cols.length) {
            settings.cols = [[]]; // 提供默认的空列定义数组
        }

        // 确保第一个子数组是有效的列定义数组
        if (!Array.isArray(settings.cols[0])) {
            settings.cols[0] = []; // 如果第一个子数组无效，提供默认的空列定义数组
        }

        // 自动添加 checkbox 列（如果不存在）
        if (!settings.cols[0].some(col => col && col.type === 'checkbox')) {
            settings.cols[0].unshift({type: 'checkbox', fixed: 'left',});
        }

        // 自动添加 操作 列（如果不存在）
        if (!settings.cols[0].some(col => col && col.fixed === 'right' && col.title === '操作')) {
            settings.cols[0].push({
                title: '操作',
                toolbar: settings.elem + 'Tool',
                fixed: 'right',
                align: 'left',
                minWidth: 160,
                maxWidth: 260
            });
        }

        // 处理 templet 和 field 字段
        settings.cols[0].forEach(function (col) {
            if (col) {
                handleTemplet(col);
                handleField(col);
            }
        });

        /**
         * 处理模板
         * @param col
         */
        function handleTemplet(col) {
            switch (col.templet) {
                case 'link':
                    col.templet = function (d) {
                        return `<a href="${d[col.field]}" target="_blank" style="color: blue;">${d[col.field]}</a>`;
                    };
                    break;

                case 'switch':
                    if (col.switch && typeof col.switch === 'object') {
                        let switchName = col.switch.name || '正常|隐藏';  // 默认值为 "正常|隐藏"
                        let switchValue = col.switch.value || '1|0';      // 默认值为 "1|0"

                        let [onText, offText] = switchName.split('|');
                        let [onValue, offValue] = switchValue.split('|');

                        onValue = String(onValue).trim();
                        offValue = String(offValue).trim();

                        col.templet = function (d) {
                            let currentValue = String(d[col.field]).trim();
                            let isChecked = currentValue === onValue;

                            return `<input type="checkbox" 
                               name="status" 
                               value="${currentValue}" 
                               lay-skin="switch" 
                               lay-text="${onText}|${offText}" 
                               ${isChecked ? 'checked' : ''}>`;
                        };
                    } else {
                        col.templet = function (d) {
                            return `<input type="checkbox" name="status" value="${d[col.field]}" lay-skin="switch" lay-text="正常|隐藏" ${d[col.field] === 1 ? 'checked' : ''}>`;
                        };
                    }
                    break;

                case 'icon':
                    col.templet = function (d) {
                        return `<em class="${d[col.field]}"></em>`;
                    };
                    break;

                case 'image':
                    col.templet = function (d) {
                        let imgUrls = d[col.field];
                        if (!imgUrls) return ''; // 如果没有图片URL，则返回空字符串

                        // 将图片URL转换为数组，考虑到可能为空或单个URL的情况
                        let urlsArray = imgUrls.split(',').filter(url => url.trim() !== '');

                        // 只取第一张图片来显示
                        let firstImageUrl = urlsArray.length > 0 ? urlsArray[0].trim() : '';

                        // 定义图片的最大宽度和高度
                        let maxWidth = 80;
                        let maxHeight = '100%'; // 假设layui表格行的高度是固定的或者可以适应内容

                        // 构建图片标签
                        return firstImageUrl ? `<img data-image="hover" src="${firstImageUrl}" alt="Image" style="max-width: ${maxWidth}px; max-height: ${maxHeight};">` : '';
                    };
                    break;

                default:
                    if (!col?.templet?.startsWith('#')) {
                        // 如果 templet 不是以 # 开头的字符串，可能是无效的模板选择器
                        // console.warn('Invalid templet selector:', col.templet);
                        col.templet = ''; // 清空无效的 templet
                    }
                    break;
            }
        }

        /**
         * 处理字段
         * @param col
         */
        function handleField(col) {
            // if (!col.width && !col.maxWidth && !col.minWidth) {
            //     col.width = 160;
            // }
            //list 字段设置宽度120px
            if (col.field === "list" && !col.width) {
                col.width = 120;
            }
            if (!col.align) {
                col.align = 'center';
            }
            if (col.field === "title" && !col.width) {
                col.width = 280;
            }
            if (col.icon === "icon" && !col.width) {
                col.width = 50;
            }
            if (col.icon === "switch" && !col.width) {
                col.width = 90;
            }


        }
    }

    // 导出 processCols 函数
    exports('fieldHandler', {init});
});
