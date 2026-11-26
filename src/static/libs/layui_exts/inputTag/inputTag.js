layui.define(['jquery'], function (exports) {
    const $ = layui.jquery;

    if (!document.getElementById('inputTagtyle')) {
        const style = document.createElement('style');
        style.id = 'inputTagtyle';
        style.textContent = `
      .layui-input-tag {
        position: relative;
        height: auto;
        min-height: 38px;
        max-height: 38px;
        border: 1px solid #e6e6e6;
        border-radius: 2px;
        padding: 5px 30px 5px 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
        background: #fff;
        cursor: text;
        overflow: hidden;
        box-sizing: border-box;
        transition: none;
        /* 【新增】定义默认标签颜色变量 */
        --tag-bg-color: #16B777+;
      }
      .layui-input-tag.multiline {
        max-height: 76px !important;
      }
      .layui-input-tag.expanded {
        max-height: 9999px !important;
      }
      .layui-input-tag .tag-item {
        height: 28px;
        line-height: 28px;
        padding: 0 10px;
        /* 【改动】使用 CSS 变量替代硬编码颜色 */
        background: var(--tag-bg-color);
        color: #fff;
        border-radius: 5px;
        display: inline-flex;
        align-items: center;
        font-size: 13px;
        white-space: nowrap;
      }
      .layui-input-tag .tag-item .del {
        margin-left: 8px;
        color: #fff;
        opacity: 0.8;
        cursor: pointer;
        font-size: 16px;
      }
      .layui-input-tag input {
        border: none; outline: none;
        flex: 1; min-width: 100px;
        height: 28px; line-height: 28px;
        padding: 0; font-size: 13px;
      }
      .tag-expand-btn, .tag-clear-btn {
        position: absolute;
        width: 24px; height: 24px;
        line-height: 24px; text-align: center;
        z-index: 10;
        cursor: pointer;
      }
      .tag-clear-btn {
        right: 6px; top: 6px;
        font-size: 16px; color: #999;
        display: none;
      }
      .tag-clear-btn:hover { color: #ff5722; }
      .tag-expand-btn {
        right: 6px; bottom: 6px;
        background: #f5f5f5;
        border-radius: 3px;
        font-size: 14px;
        display: none;
      }
    `;
        document.head.appendChild(style);
    }

    const inputTag = {
        render: function (options) {
            const elem = $(options.elem);
            const width = options.width || '100%';
            const enterAdd = options.enterAdd !== false;
            const splitByComma = options.splitByComma !== false;
            // 【新增】自定义标签背景色，默认 #16baaa
            const tagColor = options.tagColor || '#16B777';
            const onDelete = options.onDelete || function () {
            };
            const onClear = options.onClear || function () {
            };

            let tags = [];
            if (options.value && Array.isArray(options.value)) {
                tags = JSON.parse(JSON.stringify(options.value));
            } else {
                const strVal = (elem.val() || options.value || '').split(',').filter(Boolean);
                tags = strVal.map(v => ({label: v, value: v}));
            }

            const $container = $('<div>', {
                class: 'layui-input-tag',
                css: {
                    width: width,
                    // 【核心改动】通过 CSS 变量设置当前实例的标签颜色
                    '--tag-bg-color': tagColor
                }
            });
            const $input = $('<input>', {
                type: 'text',
                readonly: !enterAdd || undefined,
                placeholder: enterAdd
                    ? (splitByComma ? '输入后按回车添加标签，多个用逗号分隔' : '输入后按回车添加标签')
                    : ''
            });
            const $clearBtn = $(`<div class="tag-clear-btn"><i class="layui-icon layui-icon-clear"></i></div>`);
            const $expandBtn = $(`<div class="tag-expand-btn"><i class="layui-icon layui-icon-more"></i></div>`);
            $container.append($input, $clearBtn, $expandBtn);

            elem.after($container).hide();

            tags.forEach(tag => {
                $(`<span class="tag-item" data-value="${tag.value}">${tag.label}<i class="del">×</i></span>`).insertBefore($input);
            });

            function updateLayout() {
                setTimeout(() => {
                    $container.removeClass('multiline');
                    const realHeight = $container[0].scrollHeight;
                    if (realHeight > 40) {
                        $container.addClass('multiline');
                        $expandBtn.show();
                    } else {
                        $expandBtn.hide();
                    }
                    $clearBtn.toggle(tags.length > 0);
                }, 20);
            }

            function syncValue() {
                elem.val(tags.map(t => t.value).join(',')).trigger('change');
            }

            function addSingleTag(val) {
                val = (val || '').trim();
                if (!val || tags.some(t => t.value === val)) return false;
                const tag = {label: val, value: val};
                tags.push(tag);
                $(`<span class="tag-item" data-value="${tag.value}">${tag.label}<i class="del">×</i></span>`).insertBefore($input);
                return true;
            }

            $expandBtn.on('click', e => {
                e.stopPropagation();
                $container.toggleClass('expanded');
                $expandBtn.html($container.hasClass('expanded')
                    ? '<i class="layui-icon layui-icon-up"></i>'
                    : '<i class="layui-icon layui-icon-more"></i> ');
            });

            $clearBtn.on('click', e => {
                e.stopPropagation();
                tags = [];
                $container.find('.tag-item').remove();
                syncValue();
                updateLayout();
                onClear();
            });

            if (enterAdd) {
                $input.on('keydown', e => {
                    if (e.keyCode === 13) {
                        e.preventDefault();
                        const rawVal = $input.val();
                        if (!rawVal || !rawVal.trim()) return;

                        let parts;
                        if (splitByComma) {
                            parts = rawVal.split(/[,，]/).map(s => s.trim()).filter(Boolean);
                        } else {
                            parts = [rawVal.trim()];
                        }

                        let added = false;
                        parts.forEach(val => {
                            if (addSingleTag(val)) added = true;
                        });

                        if (added) {
                            $input.val('');
                            syncValue();
                            updateLayout();
                        }
                    }
                });
            }

            $container.on('click', '.del', function (e) {
                e.stopPropagation();
                const $item = $(this).closest('.tag-item');
                const val = $item.attr('data-value');
                const deletedTag = tags.find(item => item.value === val);
                const idx = tags.findIndex(t => t.value === val);
                if (idx > -1) {
                    tags.splice(idx, 1);
                    $item.remove();
                    syncValue();
                    updateLayout();
                    onDelete(deletedTag);
                }
            });

            $container.on('click', () => $input.focus());
            syncValue();
            updateLayout();

            return {
                addTag(obj) {
                    if (!obj) return;
                    const tag = typeof obj === 'string'
                        ? {label: obj, value: obj}
                        : {label: obj.label || '', value: obj.value || ''};
                    if (addSingleTag(tag.value)) {
                        if (tag.label && tag.label !== tag.value) {
                            const $last = $container.find('.tag-item').last();
                            $last.contents().first().replaceWith(document.createTextNode(tag.label));
                            const t = tags.find(item => item.value === tag.value);
                            if (t) t.label = tag.label;
                        }
                        syncValue();
                        updateLayout();
                    }
                },
                getValue: () => [...tags],
                clear() {
                    tags = [];
                    $container.find('.tag-item').remove();
                    syncValue();
                    updateLayout();
                }
            };
        }
    };
    exports('inputTag', inputTag);
});
