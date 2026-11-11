// static/js/fieldHandler.js
layui.define([], function (exports) {
    // 常驻字段的默认样式，集中维护避免散落的 if 判断
    const COLUMN_STYLE = {
        list: {width: 120},
        title: {width: 280, align: 'left'},
        icon: {width: 50},
        status: {width: 90}
    };

    // 转义输出到 HTML 的字段值，避免后台可配置内容注入
    function escapeHtml(text) {
        return String(text === undefined || text === null ? '' : text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // 只放行 http(s)、协议相对与站内绝对路径，其它链接按无效处理
    function safeUrl(url) {
        const value = String(url === undefined || url === null ? '' : url).trim();
        return /^(https?:\/\/|\/\/|\/)/i.test(value) ? value : '';
    }

    // 定义字段处理函数
    function init(settings) {
        // 深拷贝一层列配置，避免修改调用方传入的对象
        if (Array.isArray(settings.cols)) {
            settings.cols = settings.cols.map(function (row) {
                return Array.isArray(row) ? row.map(function (col) {
                    return col && typeof col === 'object' ? Object.assign({}, col) : col;
                }) : row;
            });
        }
        // 确保 cols 是一个数组
        if (!Array.isArray(settings.cols) || !settings.cols.length) {
            settings.cols = [[]]; // 提供默认的空列定义数组
        }

        // 确保第一个子数组是有效的列定义数组
        if (!Array.isArray(settings.cols[0])) {
            settings.cols[0] = []; // 如果第一个子数组无效，提供默认的空列定义数组
        }
        // 自动添加 checkbox 列（如果不存在；showCheckbox: false 可关闭）
        if (settings.showCheckbox !== false && !settings.cols[0].some(col => col && col.type === 'checkbox')) {
            settings.cols[0].unshift({type: 'checkbox', fixed: 'left',});
        }
        // 自动添加 操作 列（rightEdit 为 false 时不添加）
        if (settings.rightEdit === true && !settings.cols[0].some(col => col && col.fixed === 'right' && col.title === '操作')) {
            settings.cols[0].push({
                title: '操作',
                toolbar: settings.elem + 'Tool',
                fixed: 'right',
                align: 'left',
                maxWidth: 320,
                minWidth: 120
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
                        const href = safeUrl(d[col.field]);
                        // 非法协议只输出文本，避免 javascript: 等注入
                        if (!href) {
                            return escapeHtml(d[col.field]);
                        }
                        const text = col.link_title ?? d[col.field];
                        return `<a href="${escapeHtml(href)}" target="_blank" class="layui-font-blue">${escapeHtml(text)}</a>`;
                    };
                    break;
                case 'a_link':
                    col.templet = function (d) {
                        return `<div>${d[col.field]}</div>`;
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
                            let currentValue = String(d[col.field] === undefined || d[col.field] === null ? '' : d[col.field]).trim();
                            // 只接受配置的 on/off 两个值，其它值保留原样提示，避免被误显示为关闭
                            if (currentValue !== onValue && currentValue !== offValue) {
                                return `<span class="layui-badge layui-bg-orange" title="未配置的状态值">${escapeHtml(currentValue)}</span>`;
                            }

                            return `<input type="checkbox" 
                               name="${escapeHtml(col.field)}" 
                               lay-filter="form-switch-edit"
                               value="${escapeHtml(currentValue)}" 
                               lay-skin="switch" 
                               lay-text="${escapeHtml(onText + '|' + offText)}" 
                               ${currentValue === onValue ? 'checked' : ''}>`;
                        };

                    } else {
                        col.templet = function (d) {
                            // 后端可能返回字符串 "1"，统一转成字符串比较
                            const currentValue = String(d[col.field] === undefined || d[col.field] === null ? '' : d[col.field]).trim();
                            return `<input type="checkbox" name="${escapeHtml(col.field)}" value="${escapeHtml(currentValue)}" lay-filter="form-switch-edit" lay-skin="switch" lay-text="正常|隐藏" ${currentValue === '1' ? 'checked' : ''}>`;
                        };
                    }
                    if (!col.width) {
                        col.width = 100
                    }

                    break;

                case 'icon':
                    if (!col.width) {
                        col.width = 80
                    }
                    col.templet = function (d) {
                        const iconClass = String(d[col.field] === undefined || d[col.field] === null ? '' : d[col.field]).trim();
                        return iconClass ? `<em class="${escapeHtml(iconClass)}"></em>` : '';
                    };
                    break;

                case 'image':
                    col.templet = function (d) {
                        const imgUrls = d[col.field];
                        if (!imgUrls) return ''; // 如果没有图片URL，则返回空字符串

                        // 兼容数组与逗号分隔字符串
                        const urlsArray = (Array.isArray(imgUrls) ? imgUrls : String(imgUrls).split(','))
                            .map(url => String(url === undefined || url === null ? '' : url).trim())
                            .filter(url => url !== '');

                        // 只取第一张图片来显示
                        const firstImageUrl = urlsArray.length > 0 ? urlsArray[0] : '';

                        // 构建图片标签
                        return firstImageUrl ? `<img data-image="hover" src="${escapeHtml(firstImageUrl)}" alt="Image" style="max-width: 80px; max-height: 100%;">` : '';
                    };
                    if (!col.width) {
                        col.width = 100
                    }
                    break;

                default:
                    if (typeof col.templet === 'string' && col.templet !== '' && !col.templet.startsWith('#')) {
                        // templet 不是以 # 开头的字符串，视为无效模板选择器
                        console.warn('[fieldHandler] 未知的 templet 类型：', col.templet, '字段：', col.field);
                        col.templet = '';
                    }
                    break;
            }
        }

        /**
         * 处理字段
         * @param col
         */
        function handleField(col) {
            // 常驻字段的默认宽度/对齐，交由 COLUMN_STYLE 统一维护
            const style = COLUMN_STYLE[col.field];
            if (style) {
                Object.keys(style).forEach(function (key) {
                    if (!col[key]) {
                        col[key] = style[key];
                    }
                });
            }
            if (!col.align) {
                col.align = 'center';
            }
        }
    }

    // 导出 processCols 函数
    exports('fieldHandler', {init});
});
