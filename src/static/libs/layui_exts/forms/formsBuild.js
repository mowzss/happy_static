// formsbuild.js
layui.define(['form', 'layer', 'jquery', 'layTable', 'layTabs', 'layModal'], function (exports) {
    "use strict";
    const MODULE_NAME = 'formsBuild';
    const form = layui.form, layer = layui.layer, layTabs = layui.layTabs, layTable = layui.layTable, layModal = layui.layModal, $ = layui.jquery;

    // inputTag 实例，按字段名保存
    const tagInstances = {};


    /**
     * 表单构建
     * @type {any}
     */
    const formsBuild = {
        /**
         * 表单构建
         * @param options
         * @returns {*}
         */
        render: function (options) {
            options = options || {};
            const $form = $(options.formSelector || '#form'); // 默认表单选择器
            let triggers = options.triggers || []; // 默认为空数组
            const that = this;

            // 表单验证
            that.form(options);
            //图标选择
            that.icon($form);
            // 上传
            that.uploads($form)
            // 时间选择器
            that.inputDate($form)
            // 颜色选择器
            that.color($form)
            // 联动字段
            that.triggers(triggers, $form);
            // 编辑器
            that.editor($form);
            //tag
            that.tag($form)
            //xmSelect
            that.xmSelect($form)
            //Cron
            that.cron($form)
            // 开关
            that.checkboxSwitch($form)
            // 返回 formsbuild 实例
            return formsBuild;
        }, //表单渲染
        form: function (options) {
            // 表单渲染
            form.render();
            // 提交事件
            form.on('submit(' + (options.layFilter || '') + ')', function (data) {
                let field = data.field;
                let url = data.form.action;
                let $btn = $(this);
                // 防止重复提交
                if ($btn.hasClass('layui-btn-disabled')) {
                    return false;
                }
                $btn.addClass('layui-btn-disabled');
                $.ajax({
                    type: "POST",
                    url: url,
                    data: field,
                    dataType: "json",
                    success: function (response) {
                        if (response.code === 1) {
                            layer.msg(response.msg, {icon: 1}, function () {
                                // 只关闭当前表单所在弹层，避免误关其他层
                                const inModal = layModal.closeByElem(data.form);
                                // 页面存在表格则刷新当前页签内的表格，否则关闭当前页签
                                if (!layTable.reloadByActiveTab() && !inModal) {
                                    layTabs.close();
                                }
                            });
                        } else {
                            layer.alert(response.msg);
                        }
                    },
                    error: function () {
                        layer.msg('提交失败，请稍后重试', {icon: 2});
                    },
                    complete: function () {
                        $btn.removeClass('layui-btn-disabled');
                    }
                });
                return false; // 阻止默认 form 跳转
            });
        },
        checkboxSwitch: function (elem) {
            elem.find('[lay-skin="switch"]').each(function () {
                if (this.dataset.happySwitchBound === '1') {
                    return;
                }
                this.dataset.happySwitchBound = '1';
                const filter = $(this).attr('lay-filter');
                const inputName = this.dataset.input;
                if (filter) {
                    form.on('switch(' + filter + ')', function (data) {
                        const value = data.elem.checked ? 1 : 0;
                        elem.find('[name="' + inputName + '"]').val(value);
                        // 开关变化同样要触发表单联动
                        if (typeof formsBuild._applyTrigger === 'function') {
                            formsBuild._applyTrigger(inputName, value);
                        }
                    })
                }
            })
        },
        uploads: function (elem) {
            // 图片上传
            elem.find('[data-file]').each(function () {
                let that = this;
                layui.use(['uploads'], function (uploads) {
                    let multiple = that.dataset.multiple === "true", type = that.dataset.file,
                        id = $(that).attr('id');
                    new uploads({
                        elem: "#" + id, type: type, multiple: multiple, sort: multiple,
                    });
                });
            });
        },
        tag: function (elem) {
            elem.find('[data-tag]').each(function () {
                const name = $(this).attr('name'), $tag = "#" + $(this).attr('id'), value = $(this).val();
                layui.use(['inputTag'], function (inputTag) {
                    tagInstances[name] = inputTag.render({
                        elem: $tag,          // 绑定元素
                        value: value,
                    });
                })
            })
        },
        xmSelect: function (elem) {
            elem.find('[data-xm-select]').each(function () {
                const $this = $(this), name = this.dataset.name, elemId = '#' + $this.attr('id');
                const required = this.dataset.required === '1', disabled = this.dataset.disabled === '1';

                // 读取模板中的 JSON 数据，解析失败时降级为空数组
                const readJson = function (selector, fallback) {
                    const text = elem.find(selector).text();
                    if (!text || !text.trim()) {
                        return fallback;
                    }
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        console.error('xmSelect JSON 解析失败: ' + selector, text, e.message);
                        return fallback;
                    }
                };

                const value = readJson('[xm-select-value="' + name + '"]', []);
                const data = readJson('[xm-select-data="' + name + '"]', []);
                const config = readJson('[xm-select="' + name + '"]', {});
                const pageSize = Math.max(1, parseInt(config.pageSize, 10) || 20);
                const remoteSearch = !!config.remoteSearch && !!config.searchUrl;

                // 远程接口返回结构兼容：{data:{data:[],last_page:0}} 或 {data:[]}
                const readList = function (res) {
                    if (!res) {
                        return {list: [], lastPage: 1};
                    }
                    const payload = res.data !== undefined ? res.data : res;
                    if (Array.isArray(payload)) {
                        return {list: payload, lastPage: 1};
                    }
                    if (payload && Array.isArray(payload.data)) {
                        return {list: payload.data, lastPage: Math.max(1, parseInt(payload.last_page, 10) || 1)};
                    }
                    return {list: [], lastPage: 1};
                };

                layui.use(['xmSelect'], function (xmSelect) {
                    const loadData = Array.isArray(data) ? data : [];
                    const option = {
                        el: elemId,
                        name: name,
                        theme: {color: '#16B777'},
                        autoRow: true,
                        filterable: true,
                        radio: !!config.radio,
                        prop: config.prop && config.prop.name && config.prop.value ? config.prop : {name: 'title', value: 'id'},
                        data: loadData,
                        initValue: Array.isArray(value) ? value : [],
                        paging: remoteSearch || loadData.length > pageSize,
                        pageRemote: remoteSearch,
                        pageSize: pageSize,
                        disabled: disabled,
                        layVerify: (required && !disabled) ? 'required' : '',
                        layReqText: '请选择' + name,
                        toolbar: {show: config.showToolbar !== false},
                        empty: config.empty || '暂无数据',
                    };

                    if (remoteSearch) {
                        const minLength = Math.max(0, parseInt(config.minKeywordLength, 10) || 0);
                        let lastRequest = null;
                        option.remoteMethod = function (val, cb, show, pageIndex) {
                            const keyword = $.trim(val || '');
                            if (keyword.length < minLength) {
                                // 关键字不足最小长度时不请求后端，避免无效请求
                                return cb(keyword === '' ? loadData : [], 1);
                            }
                            if (lastRequest && lastRequest.readyState !== 4) {
                                lastRequest.abort();
                            }
                            lastRequest = $.ajax({
                                type: 'POST', url: config.searchUrl, dataType: 'json', data: {
                                    keyword: keyword, page: pageIndex || 1, page_size: pageSize,
                                    add: config.autoAdd ? 1 : 0,
                                    source: config.source ? JSON.stringify(config.source) : '',
                                }, success: function (res) {
                                    const result = readList(res);
                                    cb(result.list, result.lastPage);
                                }, error: function (xhr, status) {
                                    if (status === 'abort') {
                                        return;
                                    }
                                    layer.msg(name + ' 远程搜索异常');
                                    cb([], 1);
                                }
                            });
                        };
                    }

                    const instance = xmSelect.render(option);

                    // 旧配置兼容：服务端未返回数据时，按已选值请求初始化接口
                    if (config.initUrl && Array.isArray(value) && value.length && loadData.length === 0) {
                        $.ajax({
                            type: 'POST', url: config.initUrl, dataType: 'json', data: {
                                id: value,
                            }, success: function (res) {
                                const result = readList(res);
                                if (result.list.length) {
                                    instance.update({data: result.list, autoRow: true});
                                }
                            }, error: function () {
                                layer.msg('初始化 ' + name + ' 数据异常');
                            }
                        });
                    }
                });
            });
        },
        cron: function (elem) {
            elem.find('[data-input-cron]').each(function () {
                let elemId = '#' + $(this).attr('id');
                let cronTestUrl = this.dataset.inputCron;
                layui.use(['cron'], function () {
                    const cron = layui.cron;
                    cron.render({
                        elem: elemId, // 绑定元素
                        run: cronTestUrl, // 获取最近运行时间的接口
                    });
                })
            })
        },
        // 日期选择器
        inputDate: function (elem) {
            elem.find('[data-input-date]').each(function () {
                let that = this, type = this.dataset.inputDate || 'date', range = this.dataset.range || '';
                layui.use(['laydate'], function () {
                    let laydate = layui.laydate, options = {
                        elem: that, type: type,
                    };
                    if (range) {
                        options.range = range;
                        options.rangeLinked = true;
                    }
                    laydate.render(options);
                })
            });
        },
        // 颜色选择器
        color: function (elem) {
            elem.find('[data-input-color]').each(function () {
                let name = this.dataset.inputColor, $thisInput = elem.find('[name="' + name + '"]'),
                    value = $thisInput.val() || '#1C97F5', currentElem = this;
                layui.use(['colorpicker'], function () {
                    let colorpicker = layui.colorpicker;
                    colorpicker.render({
                        elem: currentElem, color: value, done: function (color) {
                            $thisInput.val(color);
                        }
                    });
                })
            });
        },
        // 图标选择器
        icon: function (elem) {
            // 图标选择器
            elem.find('[data-icon]').on('click', function () {
                let url = this.dataset.icon;
                layer.open({
                    type: 2, content: url, title: '图标选择', area: ['800px', '80%']
                });
            });
            elem.find('[data-input-icon]').on('change', function () {
                const icon = $(this).next().find('i').get(0);
                if (icon) {
                    icon.className = this.value;
                }
            }).each(function () {
                $(this).trigger('change');
            });
        },
        // 富文本编辑器
        editor: function (elem) {
            elem.find('[data-input-editor]').each(function () {
                let type = this.dataset.type, id = $(this).attr('id');
                switch (type) {
                    case 'tinymce':
                        layui.use(['tiny'], function () {
                            let tiny = layui.tiny;
                            tiny.render({
                                selector: "#" + id
                            });
                        });
                        break;
                    case 'wangeditor':
                        layui.use(['wangEdit'], function () {
                            let wangEdit = layui.wangEdit;
                            wangEdit.render({
                                elem: "#" + id
                            });
                        });
                        break;
                    case 'ueditor':
                        layui.use(['ueditor'], function () {
                            let ueditor = layui.ueditor;
                            ueditor.render("#" + id);
                        });
                        break;
                }
            });
        },
        /**
         * 触发器
         * @param triggers
         * @param $form
         */
        triggers: function (triggers, $form) {
            // 转义选择器中的特殊字符
            function escapeSelector(selector) {
                return String(selector).replace(/\[|\]/g, function (match) {
                    return "\\" + match;
                });
            }

            // 获取字段的当前值
            function getFieldValue($field) {
                if ($field.is(':radio')) {
                    return $field.filter(':checked').val();
                } else if ($field.is(':checkbox')) {
                    return $field.is(':checked') ? $field.val() : null;
                } else if ($field.is('select')) {
                    return $field.val();
                } else {
                    return $field.val();
                }
            }

            // 显示/隐藏依赖字段，并同步移除/恢复必填校验
            function toggleDependentItem(field, visible) {
                const $item = $form.find('#item-' + escapeSelector(field));
                if (!$item.length) {
                    return;
                }
                $item.toggle(visible);
                if (visible) {
                    $item.find('[lay-verify]').each(function () {
                        const $field = $(this);
                        if ($field.data('happyVerify') !== undefined) {
                            $field.attr('lay-verify', $field.data('happyVerify'));
                        }
                    });
                } else {
                    $item.find('[lay-verify]').each(function () {
                        const $field = $(this);
                        if ($field.data('happyVerify') === undefined) {
                            $field.data('happyVerify', $field.attr('lay-verify'));
                        }
                        $field.removeAttr('lay-verify');
                    });
                }
            }

            // 处理依赖字段的显示/隐藏
            function handleDependentFields(trigger, value) {
                if (!Array.isArray(trigger.values)) {
                    return;
                }
                // 先隐藏所有依赖字段
                const allDependentFields = new Set();
                trigger.values.forEach(function (valueConfig) {
                    if (Array.isArray(valueConfig.field)) {
                        valueConfig.field.forEach(function (field) {
                            allDependentFields.add(field);
                        });
                    }
                });
                allDependentFields.forEach(function (field) {
                    toggleDependentItem(field, false);
                });

                // 再显示与当前值匹配的依赖字段（数字/字符串统一比较）
                const matched = trigger.values.find(function (valueConfig) {
                    return String(valueConfig.value) === String(value);
                });
                if (matched && Array.isArray(matched.field)) {
                    matched.field.forEach(function (field) {
                        toggleDependentItem(field, true);
                    });
                }
            }

            // 根据字段名应用联动，供 change 事件与开关写值后复用
            function applyTrigger(name, value) {
                if (!Array.isArray(triggers) || triggers.length === 0) {
                    return;
                }
                triggers.forEach(function (trigger) {
                    if (trigger.name === name) {
                        handleDependentFields(trigger, value);
                    }
                });
            }

            formsBuild._applyTrigger = applyTrigger;

            // 初始化表单状态
            function initializeForm() {
                if (!Array.isArray(triggers) || triggers.length === 0) {
                    return;
                }
                // 根据当前字段的值来处理依赖字段
                triggers.forEach(function (trigger) {
                    let escapedTriggerName = escapeSelector(trigger.name);
                    let triggerField = $form.find('[name="' + escapedTriggerName + '"]');
                    let currentValue = getFieldValue(triggerField);
                    handleDependentFields(trigger, currentValue);
                });
            }

            if (Array.isArray(triggers) && triggers.length > 0) {
                if (!$form.data('happyTriggersBound')) {
                    $form.data('happyTriggersBound', true);
                    $form.on('change', 'input, textarea', function () {
                        applyTrigger(this.getAttribute('name'), $(this).val());
                    });
                    // layui 控件事件用 * 通配所有 lay-filter
                    form.on('radio(*)', function (data) {
                        applyTrigger(data.elem.name, data.value);
                    });
                    form.on('select(*)', function (data) {
                        applyTrigger(data.elem.name, data.value);
                    });
                    form.on('switch(*)', function (data) {
                        applyTrigger(data.elem.name, data.elem.checked ? 1 : 0);
                    });
                    form.on('checkbox(*)', function (data) {
                        applyTrigger(data.elem.name, data.elem.checked ? (data.elem.value || 1) : 0);
                    });
                }
                // 初始化表单状态
                initializeForm();
            }
        }
    };

    /**
     * 表单构建
     */
    exports(MODULE_NAME, formsBuild);
});
