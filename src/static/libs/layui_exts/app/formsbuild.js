// formsbuild.js
layui.define(['form', 'layer', 'jquery', 'laytable'], function (exports) {
    "use strict";

    var form = layui.form,
        layer = layui.layer,
        $ = layui.jquery;

    // 定义 formsbuild 模块
    var formsbuild = {
        render: function (options) {
            options = options || {};
            var $form = $(options.formSelector || '#form'); // 默认表单选择器
            var triggers = options.triggers || []; // 默认为空数组

            this.form(options);
            //图标选择
            this.icon();
            // 图片上传
            $('[data-file]').each(function () {
                var that = this, up = {};
                layui.use(['uploads'], function () {
                    var uploads = layui.uploads;
                    var multiple = that.dataset.multiple === "true",
                        type = that.dataset.file, id = $(that).attr('id');
                    new uploads({
                        elem: "#" + id,
                        type: type,
                        multiple: multiple,
                        sort: multiple,
                    });
                });
            });
            // 时间选择器
            this.inputDate()
            // 颜色选择器
            this.color()
            // 联动字段
            this.triggers(triggers, $form);
            // 编辑器
            this.editor();
            // 返回 formsbuild 实例
            return formsbuild;
        },
        form: function (options) {
            // 表单渲染
            form.render();
            // 提交事件
            form.on('submit(' + (options.layFilter || '') + ')', function (data) {
                var field = data.field;
                var url = data.form.action;
                $.ajax({
                    type: "POST",
                    url: url,
                    data: field,
                    dataType: "json",
                    success: function (response) {
                        if (response.code === 0) {
                            layer.msg(response.msg, function () {
                                layer.closeAll();
                                let $pageTable = $('.page-Table');
                                if ($pageTable.length > 0) {
                                    layui.laytable.reload($pageTable.attr('id'));
                                }
                            });
                        } else {
                            layer.alert(response.msg);
                        }
                    }
                });
                return false; // 阻止默认 form 跳转
            });
        },
        /**
         * 时间选择
         */
        inputDate: function () {
            $('[data-input-date]').each(function () {
                var that = this, type = this.dataset.inputDate || 'date';
                layui.use(['laydate'], function () {
                    var laydate = layui.laydate;
                    laydate.render({
                        elem: that,
                        type: type,
                    });
                })
            });
        },
        /**
         * 颜色选择器
         */
        color: function () {
            $('[data-input-color]').each(function () {
                let name = this.dataset.inputColor,
                    $thisInput = $('[name=' + name + ']'),
                    value = $thisInput.val() || '#1c97f5';
                layui.use(['colorpicker'], function () {
                    var colorpicker = layui.colorpicker;
                    colorpicker.render({
                        elem: this,
                        color: value,
                        done: function (color) {
                            $thisInput.val(color);
                        }
                    });
                })
            });
        },
        /**
         * 图标选择
         */
        icon: function () {
            // 图标选择器
            $('[data-icon]').on('click', function () {
                let url = this.dataset.icon;
                layer.open({
                    type: 2,
                    content: url,
                    title: '图标选择',
                    area: ['800px', '80%']
                });
            });
            $('[data-input-icon]').on('change', function () {
                $(this).next().find('i').get(0).className = this.value;
            }).each(function () {
                $(this).trigger('change');
            });
        },
        /**
         * 编辑器
         */
        editor: function () {
            $('[data-input-editor]').each(function () {
                var that = this,
                    type = this.dataset.type,
                    name = this.dataset.inputEditor,
                    id = $(this).attr('id');
                switch (type) {
                    case 'tinymce':
                        layui.use(['tiny'], function () {
                            var tiny = layui.tiny;
                            tiny.render({
                                selector: "#" + id
                            });
                        });
                        break;
                    case 'wangeditor':
                        layui.use(['wangEdit'], function () {
                            var wangEdit = layui.wangEdit;
                            wangEdit.render({
                                elem: "#" + id
                            });
                        });
                        break;
                    case 'ueditor':
                        layui.use(['ueditor'], function () {
                            var ueditor = layui.ueditor;
                            ueditor.render("#" + id);
                        });
                        break;
                }
            });
        },
        /**
         * 联动字段
         * @param triggers
         * @param $form
         */
        triggers: function (triggers, $form) {
            // 转义选择器中的特殊字符
            function escapeSelector(selector) {
                return selector.replace(/\[|\]/g, function (match) {
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

// 处理依赖字段的显示/隐藏
            function handleDependentFields(trigger, data) {
                if (Array.isArray(trigger.values)) { // 确保 values 是一个数组
                    // 获取所有可能的依赖字段
                    let allDependentFields = new Set();
                    trigger.values.forEach(function (valueConfig) {
                        if (Array.isArray(valueConfig.field)) {
                            valueConfig.field.forEach(function (field) {
                                allDependentFields.add(field);
                            });
                        }
                    });
                    // 遍历所有依赖字段并隐藏它们
                    allDependentFields.forEach(function (field) {
                        var escapedField = escapeSelector(field);
                        var dependentItem = $('#item-' + escapedField);
                        dependentItem.hide(); // 先隐藏所有依赖字段
                    });

                    // 根据当前选择的值，显示符合条件的依赖字段
                    let shouldShow = false;
                    trigger.values.forEach(function (valueConfig) {
                        if (data.value === valueConfig.value) {
                            shouldShow = true;

                            if (Array.isArray(valueConfig.field)) { // 确保 field 是一个数组
                                valueConfig.field.forEach(function (field) {
                                    // 转义 field 以确保选择器有效
                                    var escapedField = escapeSelector(field);
                                    var dependentItem = $('#item-' + escapedField);

                                    dependentItem.show(); // 显示符合条件的依赖字段
                                });
                            }

                            return false; // 终止 forEach 循环
                        }
                    });
                }
            }

// 处理表单变化
            function handleFormChange(data) {
                if (!Array.isArray(triggers) || triggers.length === 0) {
                    return;
                }

                $.each(triggers, function (index, trigger) {
                    // 检查是否是同一个字段
                    if (data.elem.getAttribute('name') === trigger.name) {
                        // 处理依赖字段
                        handleDependentFields(trigger, data);
                    }
                });
            }

// 初始化表单状态
            function initializeForm() {
                if (!Array.isArray(triggers) || triggers.length === 0) {
                    return;
                }

                // 根据当前字段的值来处理依赖字段
                $.each(triggers, function (index, trigger) {
                    // 转义 trigger.name 以确保选择器有效
                    var escapedTriggerName = escapeSelector(trigger.name);
                    var triggerField = $('[name="' + escapedTriggerName + '"]');
                    var currentValue = getFieldValue(triggerField);

                    // 处理依赖字段
                    handleDependentFields(trigger, {elem: null, value: currentValue});
                });
            }

            if (Array.isArray(triggers) && triggers.length > 0) {

                // $form.on('change', 'input, select, [type="radio"], [type="checkbox"]', function (event) {
                //     var data = {elem: this, value: $(this).val()};
                //     handleFormChange(data);
                // });

                $form.find('input').on('change', function () {
                    var data = {elem: this, value: $(this).val()};
                    handleFormChange(data);
                });
                form.on('radio', function (data) {
                    handleFormChange(data);
                });
                form.on('select', function (data) {
                    handleFormChange(data);
                });


                // 初始化表单状态
                initializeForm();
            }
        }
    };

    // 暴露 formsbuild 模块
    exports('formsbuild', formsbuild);
});
