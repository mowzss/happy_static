layui.define(['jquery', 'table', 'layer', 'treeTable', 'form', 'fieldHandler'], function (exports) {
    let $ = layui.jquery;
    let table = layui.table;
    let treeTable = layui.treeTable; // 初始化为 null，稍后根据需要动态加载
    let layer = layui.layer;
    let fieldHandler = layui.fieldHandler;
    let form = layui.form;
    const MODUME_NAME = 'layTable';

    // 已渲染表格的配置登记表：tableId / layFilter => settings
    const tableRegistry = {};

    // 快捷开关：模块加载时只注册一次，按开关所属表格派发请求
    form.on('switch(form-switch-edit)', function (obj) {
        const $view = $(obj.elem).closest('.layui-table-view');
        const tableId = $view.attr('lay-id') || $view.attr('lay-filter');
        const settings = tableRegistry[$view.attr('lay-id')] || tableRegistry[$view.attr('lay-filter')];
        if (!settings || !settings.dataUrls || !settings.dataUrls.quick) {
            return;
        }
        const field = obj.elem.name;
        const rowData = getRowData(tableId, obj.elem);
        if (!rowData || rowData.id === undefined || rowData.id === null) {
            revertSwitch(obj, $view);
            layer.msg('未获取到当前行数据');
            return;
        }
        const value = obj.elem.checked ? 1 : 0;
        const url = updateUrlParams(settings.dataUrls.quick, {id: rowData.id});
        $.ajax({
            url: url,
            type: 'POST',
            data: {
                field: field,
                value: value
            },
            success: function (res) {
                if (res && res.code === 1) {
                    layer.msg(res.msg || '更新成功');
                    // 同步本地缓存，避免下次切换取到旧值
                    rowData[field] = value;
                } else {
                    revertSwitch(obj, $view);
                    layer.msg('更新失败：' + ((res && res.msg) || '未知错误'));
                }
            },
            error: function () {
                revertSwitch(obj, $view);
                layer.msg('请求失败，请稍后再试');
            }
        });
    });

    // 撤销开关界面状态（只重渲染当前表格的开关）
    function revertSwitch(obj, $view) {
        obj.elem.checked = !obj.elem.checked;
        const filter = $view.attr('lay-filter');
        if (filter) {
            form.render('checkbox', filter);
        } else {
            form.render('checkbox');
        }
    }

    // 取当前行数据：兼容普通表格与 treeTable
    function getRowData(tableId, elem) {
        const index = $(elem).closest('tr').data('index');
        const list = (table.cache && table.cache[tableId])
            || (treeTable && treeTable.cache && treeTable.cache[tableId])
            || [];
        return list[index] || null;
    }

    // 定义 layTable 模块
    let layTable = {
        // 初始化表格
        render: function (options) {
            let that = this;
            // 默认选项（仅包含 layTable 特定的扩展逻辑）
            let defaults = {
                elem: '#happyTable',
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
                response: {
                    statusCode: 1,
                },
                parseData: function (res) { // res 即为原始返回的数据
                    return {
                        "code": res.code, // 解析接口状态
                        "msg": res.msg, // 解析提示文本
                        "count": res.data.total, // 解析数据长度
                        "data": res.data.data // 解析数据列表
                    };
                },
                loading: true, // 加载条
                initSort: {
                    field: 'id', // 按 id 字段排序
                    type: 'desc' // 降序排序
                },
                rightEdit: true,//自动增加操作栏 false则不增加
            };

            // 合并用户提供的选项和默认选项
            let settings = $.extend(true, {}, defaults, options);

            // 如果没有设置 toolbar，默认使用 elem + 'ToolbarTop'
            if (!settings.toolbar) {
                settings.toolbar = settings.elem + 'ToolbarTop';
            }
            if (!settings.layFilters) {
                settings.layFilters = settings.elem.replace(/^#/, '');
            }
            // 从目标元素获取 data-url 属性
            if (!settings.url) {
                settings.url = $(settings.elem).data('url');
            }
            // 未开启分页且调用方没有显式指定 limit 时才使用大页容量
            if (!settings.page && !options.limit) {
                settings.limit = 300;
            }
            // 登记表格配置，供快捷开关按表格派发
            if (settings.id) {
                tableRegistry[settings.id] = settings;
            }
            tableRegistry[settings.layFilters] = settings;
            // 处理表头字段
            fieldHandler.init(settings);

            // 默认的工具栏事件处理程序
            let defaultToolbarHandlers = {

                add: function (obj, callback, defaultHandler) {
                    that.defaultSaveHandler(this, settings.dataUrls.add, function () {
                        that.reload(obj.config.id); // 刷新表格
                    });
                },
                del: function (obj, callback, defaultHandler) {
                    let checkStatus = table.checkStatus(obj.config.id); // 获取选中行的状态
                    let data = checkStatus.data; // 获取选中的数据
                    if (!data.length) {
                        layer.msg('请先选择要删除的记录');
                        return;
                    }
                    let ids = data.map(function (item) {
                        return item.id;
                    }); // 提取选中的ID
                    that.defaultDeleteHandler(settings.dataUrls.del, ids, function () {
                        that.reload(obj.config.id); // 刷新表格
                    });
                }
            };

            // 默认的行内工具事件处理程序
            let defaultToolHandlers = {
                del: function (obj, callback, defaultHandler) {
                    let ids = obj.data.id; // 获得当前行数据
                    that.defaultDeleteHandler(settings.dataUrls.del, ids, function () {
                        that.reload(obj.config.id); // 刷新表格
                    });
                },
                edit: function (obj, callback, defaultHandler) {
                    let url = updateUrlParams(settings.dataUrls.edit, {id: obj.data.id});
                    that.defaultSaveHandler(this, url, function () {
                        that.reload(obj.config.id); // 刷新表格
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
                    if (obj.config.layFilters !== settings.layFilters) { // 确保只处理对应表格的事件
                        return false;
                    }

                    // 动态调用用户提供的或默认的特定事件处理程序
                    let eventHandler = defaultToolbarHandlers[obj.event];
                    if (typeof eventHandler === 'function') {
                        eventHandler.call(this, obj, function () {
                            that.reload(obj.config.id); // 刷新表格
                        }, settings.defaultDeleteHandler);
                    }
                };
            }

            // 行内工具事件处理
            if (!settings.on.tool) {
                settings.on.tool = function (obj) {
                    if (obj.config.layFilters !== settings.layFilters) { // 确保只处理对应表格的事件
                        return false;
                    }

                    // 动态调用用户提供的或默认的特定事件处理程序
                    let eventHandler = defaultToolHandlers[obj.event];
                    if (typeof eventHandler === 'function') {
                        eventHandler.call(this, obj, function () {
                            that.reload(obj.config.id); // 刷新表格
                        }, settings.defaultDeleteHandler);
                    }
                };
            }

            // 添加排序事件监听
            if (!settings.on.sort) {
                settings.on.sort = function (obj) {
                    if (obj.config.layFilters !== settings.layFilters) { // 确保只处理对应表格的事件
                        return false;
                    }
                    let field = obj.field;
                    let type = obj.type;
                    that.reload(obj.config.id, {
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
                    if (obj.config.layFilters !== settings.layFilters) { // 确保只处理对应表格的事件
                        return false;
                    }
                    let load = layer.load();
                    let field = obj.field; // 得到修改的字段
                    let value = obj.value; // 得到修改后的值
                    let data = obj.data; // 得到所在行所有键值
                    let url = updateUrlParams(settings.dataUrls.quick, {id: data.id});
                    // 值的校验
                    if (String(value).replace(/\s/g, '') === '') {
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
                            if (res.code === 1) {
                                layer.msg(res.msg || '更新成功', {icon: 1});
                                // 更新当前缓存数据
                                let update = {};
                                update[field] = value;
                                obj.update(update, true); // 参数 true 为 v2.7 新增功能，即同步更新其他包含自定义模板并可能存在关联的列视图
                            } else {
                                layer.msg(res.msg || '更新失败', {icon: 2});
                                obj.reedit(); // 失败时回到编辑态，避免界面与数据不一致
                            }
                        },
                        error: function (xhr, textstatus, thrown) {
                            layer.close(load);
                            layer.msg('网络请求失败', {icon: 2});
                            obj.reedit();
                        }
                    })
                };
            }
            // 如果是 treeTable 模式，动态加载 treeTable 模块
            if (settings.isTree) {
                // 初始化 treeTable
                treeTable.render(settings);
                // 注册事件监听器
                for (let event in settings.on) {
                    if (settings.on.hasOwnProperty(event)) {
                        treeTable.on(event + '(' + settings.layFilters + ')', settings.on[event]);
                    }
                }
            } else {

                // 初始化普通 table
                table.render(settings);
                // 注册事件监听器
                for (let event in settings.on) {
                    if (settings.on.hasOwnProperty(event)) {
                        table.on(event + '(' + settings.layFilters + ')', settings.on[event]);
                    }
                }
            }
            // 返回渲染实例，以便后续操作
            return that;
        },
        // 重载表格
        reload: function (elem, options) {
            if (elem === null || elem === undefined) {
                return this.reloadByActiveTab(options);
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
        // 重载当前激活页签内的表格，返回是否找到表格
        reloadByActiveTab: function (options) {
            const $activeItem = $('#happy-content .layui-tabs-body > .layui-tabs-item.layui-show');
            const $table = $activeItem.find('.page-Table').first();
            if (!$table.length) {
                return false;
            }
            this.reload($table.attr('id'), options);
            return true;
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
                        if (res.code === 1) { // 假设 0 为成功代码
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
            // 获取元素上的数据属性
            let title = $(elem).text(),
                customWidth = '800px', // 使用 || 提供默认值或保持为 undefined
                screenWidth = $(window).width(),
                screenHeight = $(window).height(),
                modalHeight = screenHeight - 200,
                modalWidth = screenWidth >= 1400 ? '800px' : '80%'; // 默认宽度
            // 如果有自定义宽度，则使用它；否则使用默认宽度
            if (customWidth) {
                modalWidth = customWidth;
            }

            $.ajax({
                url: url,
                method: 'GET',
                success: function (response) {
                    if (response.code === 0) {
                        return layer.msg(response.msg);
                    }
                    layer.open({
                        type: 1,
                        title: title,
                        content: response,
                        area: modalWidth, // 使用自定义高度或自动调整
                        maxHeight: modalHeight
                    });
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error('Error:', textStatus, errorThrown);
                    layer.msg('请求失败: ' + textStatus + ', ' + errorThrown, {icon: 5});
                }
            });
        }
    };

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
                    params.set(param, value);
                } else {
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

    exports(MODUME_NAME, layTable);
});
