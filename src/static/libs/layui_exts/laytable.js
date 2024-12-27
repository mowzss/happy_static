layui.define(['jquery', 'table', 'layer', 'treeTable', 'admin', 'fieldHandler'], function (exports) {
    var $ = layui.jquery;
    var table = layui.table;
    var treeTable = layui.treeTable; // 初始化为 null，稍后根据需要动态加载
    var layer = layui.layer;
    var fieldHandler = layui.fieldHandler;

    // 定义 laytable 模块
    var laytable = {
        // 用于存储事件监听器的对象
        eventListeners: {},
        // 初始化表格
        render: function (options) {
            var layThis = this;
            var urlParams = getUrlParams();
            // 默认选项（仅包含 laytable 特定的扩展逻辑）
            var defaults = {
                where: {}, // 用户可以自定义 where 参数
                on: {},   // 用户可以自定义事件监听器
                isTree: false, // 是否使用 treeTable 模式，默认为 false
                even: true,//开启隔行换色
                skin: 'row',
                // size: 'sm',
                autoSort: false, // 默认禁用前端排序
                tree: {}, // treeTable 特有的参数
                limit: '20',
                limits: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200],
                parseData: function (res) { // res 即为原始返回的数据
                    return {
                        "code": res.code, // 解析接口状态
                        "msg": res.msg, // 解析提示文本
                        "count": res.data.total, // 解析数据长度
                        "data": res.data.data // 解析数据列表
                    };
                },
                done: function (res, curr, count) {
                    $("table").css("width", "100%");
                    $("tbody").css("width", "100%");
                },
                loading: true, // 加载条
                initSort: {
                    field: 'id', // 按 id 字段排序
                    type: 'desc' // 降序排序
                }

            };

            // 合并用户提供的选项和默认选项
            var settings = $.extend(true, {}, defaults, options);

            // 如果没有设置 toolbar，默认使用 elem + '-toolbarTop'
            if (!settings.toolbar) {
                settings.toolbar = settings.elem + '-toolbarTop';
            }

            // 从目标元素获取 data-url 属性
            if (!settings.url) {
                settings.url = $(settings.elem).data('url');
            }

            // 处理表头字段
            fieldHandler.init(settings);

            // 默认的工具栏事件处理程序
            var defaultToolbarHandlers = {
                add: function (obj, callback, defaultHandler) {
                    layThis.defaultSaveHandler(this, settings.dataUrls.add, function () {
                        layThis.reload(obj.config.id); // 刷新表格
                    });
                },
                del: function (obj, callback, defaultHandler) {
                    var checkStatus = table.checkStatus(obj.config.id); // 获取选中行的状态
                    var data = checkStatus.data; // 获取选中的数据
                    var ids = data.map(function (item) {
                        return item.id;
                    }); // 提取选中的ID
                    layThis.defaultDeleteHandler(settings.dataUrls.del, ids, function () {
                        layThis.reload(obj.config.id); // 刷新表格
                    });
                }
            };

            // 默认的行内工具事件处理程序
            var defaultToolHandlers = {
                del: function (obj, callback, defaultHandler) {
                    var ids = obj.data.id; // 获得当前行数据
                    layThis.defaultDeleteHandler(settings.dataUrls.del, ids, function () {
                        layThis.reload(obj.config.id); // 刷新表格
                    });
                },
                edit: function (obj, callback, defaultHandler) {
                    var url = updateUrlParams(settings.dataUrls.edit, {id: obj.data.id});
                    layThis.defaultSaveHandler(this, url, function () {
                        layThis.reload(obj.config.id); // 刷新表格
                    });
                }
            };

            // 如果用户提供了 toolEvent，则合并到默认事件处理程序中
            if (options.toolEvent) {
                $.extend(true, defaultToolHandlers, options.toolEvent); // 合并行内工具事件
            }

            // 如果用户提供了 toolbarEvent，则合并到默认事件处理程序中
            if (options.toolbarEvent) {
                $.extend(true, defaultToolbarHandlers, options.toolbarEvent); // 合并工具栏事件
            }

            // 工具栏事件处理
            if (!settings.on.toolbar) {
                settings.on.toolbar = function (obj) {
                    if (obj.config.elem.selector !== settings.elem) { // 确保只处理对应表格的事件
                        return false;
                    }

                    // 动态调用用户提供的或默认的特定事件处理程序
                    var eventHandler = defaultToolbarHandlers[obj.event];
                    if (typeof eventHandler === 'function') {
                        eventHandler.call(this, obj, function () {
                            layThis.reload(obj.config.id); // 刷新表格
                        }, settings.defaultDeleteHandler);
                    }
                };
            }

            // 行内工具事件处理
            if (!settings.on.tool) {
                settings.on.tool = function (obj) {
                    if (obj.config.elem.selector !== settings.elem) { // 确保只处理对应表格的事件
                        return false;
                    }

                    // 动态调用用户提供的或默认的特定事件处理程序
                    var eventHandler = defaultToolHandlers[obj.event];
                    if (typeof eventHandler === 'function') {
                        eventHandler.call(this, obj, function () {
                            layThis.reload(obj.config.id); // 刷新表格
                        }, settings.defaultDeleteHandler);
                    }
                };
            }

            // 添加排序事件监听
            if (!settings.on.sort) {
                settings.on.sort = function (obj) {
                    if (obj.config.elem.selector !== settings.elem) { // 确保只处理对应表格的事件
                        return false;
                    }
                    var field = obj.field;
                    var type = obj.type;
                    layThis.reload(obj.config.id, {
                        initSort: obj, // 记录初始排序，以标记表头的排序状态
                        where: {
                            _order: field,
                            _by: type
                        } // 传递更新后的查询条件
                    });
                };
            }

            // 单元格编辑事件
            if (!settings.on.edit) {
                settings.on.edit = function (obj) {
                    if (obj.config.elem.selector !== settings.elem) { // 确保只处理对应表格的事件
                        return false;
                    }
                    var load = layer.load();
                    var field = obj.field; // 得到修改的字段
                    var value = obj.value; // 得到修改后的值
                    var oldValue = obj.oldValue; // 得到修改前的值 -- v2.8.0 新增
                    var data = obj.data; // 得到所在行所有键值
                    var col = obj.getCol(); // 得到当前列的表头配置属性 -- v2.8.0 新增
                    var url = updateUrlParams(settings.dataUrls.quick, {id: data.id});
                    // 值的校验
                    if (value.replace(/\s/g, '') === '') {
                        layer.tips('值不能为空', this, {tips: 1});
                        return obj.reedit(); // 重新编辑 -- v2.8.0 新增
                    }
                    $.ajax({
                        url: url,
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            field: field,
                            value: value
                        },
                        success: function (res) {
                            layer.close(load);
                            if (res.code === 0) {
                                layer.msg(res.msg, this, {tips: 1});
                                // 更新当前缓存数据
                                let update = {};
                                update[field] = value;
                                obj.update(update, true); // 参数 true 为 v2.7 新增功能，即同步更新其他包含自定义模板并可能存在关联的列视图
                            } else if (res.code >= 1) {
                                layer.msg(res.msg);
                            }
                        },
                        error: function (xhr, textstatus, thrown) {
                            layer.close(load);
                            layer.msg('网络请求失败')
                        }
                    })
                };
            }

            // 如果是 treeTable 模式，动态加载 treeTable 模块
            if (settings.isTree) {
                // 初始化 treeTable
                treeTable.render(settings);
                // 注册事件监听器
                for (var event in settings.on) {
                    if (settings.on.hasOwnProperty(event)) {
                        treeTable.on(event, settings.on[event]);
                    }
                }
            } else {
                // 初始化普通 table
                table.render(settings);
                // 注册事件监听器
                for (var event in settings.on) {
                    if (settings.on.hasOwnProperty(event)) {
                        table.on(event, settings.on[event]);
                    }
                }
            }

            // 返回渲染实例，以便后续操作
            return layThis;
        },
        // 重载表格
        reload: function (elem, options) {
            if (elem === null || elem === undefined) {
                let $content = $('#content'), $elem;
                $elem = $content.find('.pear-tab-page.layui-tab-rollTool.layui-tab');
                //多页模式
                if ($elem.length === 1) {
                    $elem = $elem.find('.layui-show.layui-tab-item .layui-hide.page-Table');
                } else {
                    $elem = $elem.find('layui-hide.page-Table');
                }
                if ($elem.length === 0) return;
                elem = $elem.attr('id');
            }

            // 确定要使用的 table 实例
            let instance;
            if (treeTable && $('#' + elem).hasClass('layui-tree-table')) { // 如果是 treeTable
                instance = treeTable;
            } else { // 否则使用普通的 table
                instance = table;
            }
            // 调用相应的 reload 方法
            instance.reload(elem, options);
        },
        defaultDeleteHandler: function (url, ids, callback) {
            layer.confirm('确认删除？', function (index) {
                $.ajax({
                    url: url, // 删除接口的 URL
                    type: 'POST',
                    data: {
                        ids: ids, // 如果需要批量删除，这里应该是一个 ID 数组
                    },
                    success: function (res) {
                        if (res.code === 0) { // 假设 0 为成功代码
                            layer.msg('删除成功');
                            callback(); // 成功后调用回调函数
                        } else {
                            layer.msg('删除失败: ' + res.msg);
                        }
                    },
                    error: function () {
                        layer.msg('请求出错');
                    }
                });
                layer.close(index);
            });
        },
        defaultSaveHandler: function (elem, url, callback) {
            let shouldRemoveAfterClick = true; // 设置为 true 或 false 来控制是否移除
            let newLink = $('<a></a>')
                .attr({
                    'href': url,
                    'data-modal': url, // 设置 data-modal 属性为 URL
                    'style': 'display:none;', // 隐藏链接
                    'data-remove-after-click': shouldRemoveAfterClick // 控制是否移除
                }).text($(elem).text()); // 设置链接文本

            $('body').append(newLink);
            newLink.trigger('click');
        }
    };

    /**
     * 获取get参数 转换为where使用
     * @returns {{}}
     */
    function getUrlParams() {
        // 创建一个 URLSearchParams 对象，它会自动解析当前页面的查询字符串
        const searchParams = new URLSearchParams(window.location.search);
        // 将查询参数转换为一个对象
        const params = {};
        for (const [key, value] of searchParams.entries()) {
            if (value !== 'undefined' && value !== '') {
                params[key] = value;
            }
        }
        return params;
    }

    /**
     * 更新url 组合参数
     * @param url
     * @param paramsObject
     * @returns {*}
     */
    function updateUrlParams(url, paramsObject) {
        // 创建一个新的 URLSearchParams 对象来处理查询字符串
        let params = new URLSearchParams();
        // 检查 URL 是否包含查询字符串
        let hasQuery = url.includes('?');
        if (hasQuery) {
            // 分割 URL 为路径部分和查询字符串部分
            let [path, query] = url.split('?', 2);
            // 解析现有的查询字符串
            params = new URLSearchParams(query);
            url = path;  // 更新 url 为路径部分
        }
        // 遍历参数对象并添加/更新查询参数
        for (let param in paramsObject) {
            if (paramsObject.hasOwnProperty(param)) {
                let value = paramsObject[param];
                if (params.has(param)) {
                    console.log(`Parameter "${param}" already exists and its value will be updated.`);
                    params.set(param, value);
                } else {
                    console.log(`Adding new parameter "${param}".`);
                    params.append(param, value);
                }
            }
        }
        // 构建新的查询字符串
        let queryString = params.toString();
        // 如果有查询参数，则在 URL 后面加上 '?' 和查询字符串
        if (queryString) {
            url += (url.includes('?') ? '&' : '?') + queryString;
        }
        // 返回修改后的 URL
        return url;
    }

    // 导出 laytable 模块
    exports('laytable', laytable);
});