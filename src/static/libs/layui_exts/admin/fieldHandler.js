// fieldHandler.js — 表格列配置处理器
// 职责：列深拷贝、自动补 checkbox/操作列、templet 分发、默认样式与对齐
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

    // 将服务端下发的函数字符串模板还原为函数。
    // 内容来自开发者在控制器中写死的配置（如 SpiderHourly 的平均值计算），非用户输入。
    function toFunctionTemplate(tpl) {
        try {
            // eslint-disable-next-line no-new-func
            const fn = new Function('return (' + tpl + ');')();
            return typeof fn === 'function' ? fn : '';
        } catch (e) {
            console.warn('[fieldHandler] 函数模板解析失败', tpl, e);
            return '';
        }
    }

    // 处理单个列的 templet
    function handleTemplet(col) {
        switch (col.templet) {
            case 'link':
                col.templet = function (d) {
                    // link_url_field 允许 URL 来自独立字段（如 title_url），
                    // 主字段仅作为显示文本，避免后端拼接 HTML 字符串带来的 XSS 风险。
                    const urlField = col.link_url_field && typeof col.link_url_field === 'string'
                        ? col.link_url_field
                        : col.field;
                    const href = safeUrl(d[urlField]);
                    // 非法协议或缺失 URL 时降级为纯文本，保证信息不丢失
                    if (!href) {
                        return escapeHtml(d[col.field]);
                    }
                    const text = col.link_title ?? d[col.field];
                    return `<a href="${escapeHtml(href)}" target="_blank" class="layui-font-blue">${escapeHtml(text)}</a>`;
                };
                break;
            case 'a_link':
                // 已废弃：历史 a_link 由后端拼接完整 HTML，存在 XSS 风险且无法安全转义。
                // 请改用 link + link_url_field（URL 与文本分离）。此处仅作兼容降级，输出纯文本。
                console.warn('[fieldHandler] a_link 已废弃，请改用 link + link_url_field，字段：', col.field);
                col.templet = function (d) {
                    return `<div>${escapeHtml(d[col.field])}</div>`;
                };
                break;
            case 'switch': {
                let onText = '正常';
                let offText = '隐藏';
                let onValue = '1';
                let offValue = '0';
                if (col.switch && typeof col.switch === 'object') {
                    const names = String(col.switch.name || '正常|隐藏').split('|');
                    const values = String(col.switch.value || '1|0').split('|');
                    onText = names[0] ?? onText;
                    offText = names[1] ?? offText;
                    onValue = String(values[0] ?? onValue).trim();
                    offValue = String(values[1] ?? offValue).trim();
                }

                // 生成 checkbox，并把真实的 on/off 值写入 data-*，
                // 供 layTable.js 提交时读取，解决"自定义值却提交 1/0"的契约不一致。
                const render = function (d) {
                    const currentValue = String(d[col.field] === undefined || d[col.field] === null ? '' : d[col.field]).trim();
                    // 只接受配置的 on/off 两个值，其它值保留原样提示，避免被误显示为关闭
                    if (currentValue !== onValue && currentValue !== offValue) {
                        return `<span class="layui-badge layui-bg-orange" title="未配置的状态值">${escapeHtml(currentValue)}</span>`;
                    }
                    return `<input type="checkbox"
                               name="${escapeHtml(col.field)}"
                               value="${escapeHtml(currentValue)}"
                               data-on-value="${escapeHtml(onValue)}"
                               data-off-value="${escapeHtml(offValue)}"
                               lay-filter="form-switch-edit"
                               lay-skin="switch"
                               lay-text="${escapeHtml(onText + '|' + offText)}"
                               ${currentValue === onValue ? 'checked' : ''}>`;
                };
                col.templet = render;
                col._switchValues = {on: onValue, off: offValue};
                if (!col.width) {
                    col.width = 100;
                }
                break;
            }
            case 'icon':
                if (!col.width) {
                    col.width = 80;
                }
                col.templet = function (d) {
                    const iconClass = String(d[col.field] === undefined || d[col.field] === null ? '' : d[col.field]).trim();
                    return iconClass ? `<em class="${escapeHtml(iconClass)}"></em>` : '';
                };
                break;
            case 'image':
                col.templet = function (d) {
                    const imgUrls = d[col.field];
                    if (!imgUrls) return '';
                    // 兼容数组与逗号分隔字符串
                    const urlsArray = (Array.isArray(imgUrls) ? imgUrls : String(imgUrls).split(','))
                        .map(url => String(url === undefined || url === null ? '' : url).trim())
                        .filter(url => url !== '');
                    const firstImageUrl = urlsArray.length > 0 ? safeUrl(urlsArray[0]) : '';
                    return firstImageUrl
                        ? `<img data-image="hover" src="${escapeHtml(firstImageUrl)}" alt="图片" style="max-width:80px;max-height:100%;">`
                        : '';
                };
                if (!col.width) {
                    col.width = 100;
                }
                break;
            default:
                if (typeof col.templet === 'string' && col.templet !== '') {
                    // 以 # 开头视为模板选择器，保留
                    if (col.templet.startsWith('#')) {
                        break;
                    }
                    // 服务端下发的函数字符串（如 function(d){...}）还原为函数
                    if (/^function\s*\(/.test(col.templet)) {
                        col.templet = toFunctionTemplate(col.templet);
                        break;
                    }
                    console.warn('[fieldHandler] 未知的 templet 类型：', col.templet, '字段：', col.field);
                    col.templet = '';
                }
                break;
        }
    }

    // 处理字段默认宽度与对齐
    function handleField(col) {
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

    function init(settings) {
        // 深拷贝列配置，避免修改调用方传入的对象。
        // nested 对象（如 switch）一并拷贝，防止闭包共享引用。
        if (Array.isArray(settings.cols)) {
            settings.cols = settings.cols.map(function (row) {
                return Array.isArray(row) ? row.map(function (col) {
                    if (!col || typeof col !== 'object') return col;
                    const copy = Object.assign({}, col);
                    if (col.switch && typeof col.switch === 'object') {
                        copy.switch = Object.assign({}, col.switch);
                    }
                    return copy;
                }) : row;
            });
        }
        // 确保 cols 是至少含一个有效数组的结构
        if (!Array.isArray(settings.cols) || !settings.cols.length) {
            settings.cols = [[]];
        }
        if (!Array.isArray(settings.cols[0])) {
            settings.cols[0] = [];
        }

        // checkbox 列与操作列只添加到第一行（layui 多行表头的首行为数据列）
        const firstRow = settings.cols[0];
        if (settings.showCheckbox !== false && !firstRow.some(col => col && col.type === 'checkbox')) {
            firstRow.unshift({type: 'checkbox', fixed: 'left'});
        }
        if (settings.rightEdit === true && !firstRow.some(col => col && col.fixed === 'right' && col.title === '操作')) {
            firstRow.push({
                title: '操作',
                toolbar: settings.elem + 'Tool',
                fixed: 'right',
                align: 'left',
                maxWidth: 320,
                minWidth: 120
            });
        }

        // 遍历所有表头行处理 templet 与字段默认样式，支持多级表头
        settings.cols.forEach(function (row) {
            if (!Array.isArray(row)) return;
            row.forEach(function (col) {
                if (col) {
                    handleTemplet(col);
                    handleField(col);
                }
            });
        });
    }

    exports('fieldHandler', {init});
});
