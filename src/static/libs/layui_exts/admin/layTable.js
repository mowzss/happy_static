layui.define(['jquery', 'table', 'layer', 'treeTable', 'form', 'fieldHandler', 'layModal'], function (exports) {
    let $ = layui.jquery;
    let table = layui.table;
    let treeTable = layui.treeTable; // 初始化为 null，稍后根据需要动态加载
    let layer = layui.layer;
    let fieldHandler = layui.fieldHandler;
    let form = layui.form;
    let layModal = layui.layModal;
    const MODUME_NAME = 'layTable';

    // 已渲染表格的配置登记表：tableId / layFilter => settings
    const tableRegistry = {};
    // 已绑定过的 "layFilter:事件名"，避免页签重复渲染时监听器叠加
    const boundEventKeys = {};

    // 快捷开关：模块加载时只注册一次，按开关所属表格派发请求
    form.on('switch(form-switch-edit)', function (obj) {
        const $view = $(obj.elem).closest('.layui-table-view');
        // layui 表格视图上记录表格 id 的属性是 lay-table-id
        const tableId = $view.attr('lay-table-id') || $view.attr('lay-id');
        const settings = tableRegistry[tableId];
        if (!settings || !settings.dataUrls || !settings.dataUrls.quick) {
            revertSwitch(obj, $view);
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
        const filter = $view && $view.attr('lay-filter');
        if (filter) {
            form.render('checkbox', filter);
            return;
        }
        // 没有表单 filter 时只复位当前开关，避免整页重渲染
        const $switch = $(obj.elem).next('.layui-form-switch');
        if ($switch.length) {
            const texts = String($(obj.elem).attr('lay-text') || '').split('|');
            $switch.toggleClass('layui-form-onswitch', obj.elem.checked);
            $switch.find('div').text(obj.elem.checked ? (texts[0] || '') : (texts[1] || ''));
        }
    }

    // 清理已不在文档中的表格配置
    function pruneRegistry() {
        Object.keys(tableRegistry).forEach(function (key) {
            const item = tableRegistry[key];
            if (!item || typeof item.elem !== 'string' || !$(item.elem).length) {
                delete tableRegistry[key];
            }
        });
    }

    // 按 layFilter 只绑定一次事件，处理器内部从登记表取最新配置，
    // 避免页签反复渲染时 layui 事件监听器不断累加（一次操作触发多次请求）
    function bindTableEvents(instance, settings) {
        const filter = settings.layFilters;
        Object.keys(settings.on || {}).forEach(function (event) {
            if (typeof settings.on[event] !== 'function') {
                return;
            }
            const key = filter + ':' + event;
            if (boundEventKeys[key]) {
                return;
            }
            boundEventKeys[key] = true;
            instance.on(event + '(' + filter + ')', function (obj) {
                const current = tableRegistry[filter];
                const handler = current && current.on && current.on[event];
                if (typeof handler !== 'function') {
                    return false;
                }
                return handler.call(this, obj);
            });
        });
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
            options = options || {};
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
                limit: 20,
                limits: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200],
                response: {
                    statusCode: 1,
                },
                parseData: function (res) { // res 即为原始返回的数据
                    res = res || {};
                    const data = res.data || {};
                    return {
                        "code": res.code, // 解析接口状态
                        "msg": res.msg || '', // 解析提示文本
                        "count": data.total || 0, // 解析数据长度（异常响应时兜底为 0）
                        "data": Array.isArray(data.data) ? data.data : [] // 解析数据列表
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

            // 表格元素必须存在，否则后续 toolbar/data-url 都会取不到
            if (typeof settings.elem !== 'string' || !settings.elem || !$(settings.elem).length) {
                console.error('layTable.render: 未找到表格元素', settings.elem);
                return that;
            }
            if (!settings.layFilters) {
                settings.layFilters = settings.elem.replace(/^#/, '');
            }
            // 显式传 toolbar: false 表示不启用工具栏；未设置时才使用约定模板
            if (settings.toolbar !== false && !settings.toolbar) {
                settings.toolbar = settings.elem + 'ToolbarTop';
            }
            // 从目标元素获取 data-url 属性
            if (!settings.url) {
                settings.url = $(settings.elem).data('url');
            }
            if (!settings.url) {
                console.error('layTable.render: 表格缺少数据地址（url 或 data-url）', settings.elem);
                return that;
            }
            // 未开启分页且调用方没有显式指定 limit 时才使用大页容量
            if (!settings.page && !options.limit) {
                settings.limit = 300;
            }
            // 没有操作地址时置空对象，避免工具栏/行内事件报错
            settings.dataUrls = settings.dataUrls || {};
            // 清理已关闭页签遗留的配置后登记当前表格
            pruneRegistry();
            if (settings.id) {
                tableRegistry[settings.id] = settings;
            }
            tableRegistry[settings.layFilters] = settings;
            // 处理表头字段
            fieldHandler.init(settings);

            // 默认的工具栏事件处理程序
            let defaultToolbarHandlers = {

                add: function (obj, callback, defaultHandler) {
                    if (!settings.dataUrls.add) {
                        layer.msg('未配置新增地址');
                        return;
                    }
                    that.defaultSaveHandler(this, settings.dataUrls.add);
                },
                del: function (obj, callback, defaultHandler) {
                    if (!settings.dataUrls.del) {
                        layer.msg('未配置删除地址');
                        return;
                    }
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
                    if (!settings.dataUrls.del) {
                        layer.msg('未配置删除地址');
                        return;
                    }
                    let ids = obj.data.id; // 获得当前行数据
                    that.defaultDeleteHandler(settings.dataUrls.del, ids, function () {
                        that.reload(obj.config.id); // 刷新表格
                    });
                },
                edit: function (obj, callback, defaultHandler) {
                    if (!settings.dataUrls.edit) {
                        layer.msg('未配置编辑地址');
                        return;
                    }
                    let url = updateUrlParams(settings.dataUrls.edit, {id: obj.data.id});
                    that.defaultSaveHandler(this, url);
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
                    if (!settings.dataUrls.quick) {
                        layer.msg('未配置快捷编辑地址');
                        return obj.reedit();
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
            // 渲染表格；事件按 layFilter 只绑定一次，处理器内取最新配置
            if (settings.isTree) {
                treeTable.render(settings);
                bindTableEvents(treeTable, settings);
            } else {
                table.render(settings);
                bindTableEvents(table, settings);
            }
            // 返回渲染实例，以便后续操作
            return that;
        },
        // 重载表格
        reload: function (elem, options) {
            if (elem === null || elem === undefined) {
                return this.reloadByActiveTab(options);
            }
            const id = String(elem).replace(/^#/, '');
            // 优先按渲染时的配置判断，其次兼容 treeTable 视图类名
            const settings = tableRegistry[id];
            let instance = table;
            if (settings && settings.isTree) {
                instance = treeTable;
            } else if (!settings && treeTable && $('#' + id).hasClass('layui-tree-table')) {
                instance = treeTable;
            }
            return instance.reload(id, options);
        },
        // 清理指定表格在登记表中的配置
        unregister: function (elem) {
            if (!elem) {
                return;
            }
            const target = String(elem).replace(/^#/, '');
            Object.keys(tableRegistry).forEach(function (key) {
                const item = tableRegistry[key];
                const itemElem = item && typeof item.elem === 'string' ? item.elem.replace(/^#/, '') : '';
                if (key === target || itemElem === target) {
                    delete tableRegistry[key];
                }
            });
        },
        // 清理已不在文档中的表格配置
        prune: function () {
            pruneRegistry();
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
                        if (res.code === 1) { // code === 1 为成功
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
        defaultSaveHandler: function (elem, url) {
            // 统一由 layModal 处理：成功判定 code === 1，失败只提示不弹层；
            // 保存成功后由表单提交逻辑关闭弹层并刷新表格
            layModal.open(url, {
                title: $(elem).text(),
                width: '800px'
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
        if (!url) {
            return url;
        }
        // 拆出 hash，避免 hash 参与参数拼接
        const hashIndex = url.indexOf('#');
        const hash = hashIndex >= 0 ? url.slice(hashIndex) : '';
        const base = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
        // 拆出已有查询字符串
        const queryIndex = base.indexOf('?');
        const path = queryIndex >= 0 ? base.slice(0, queryIndex) : base;
        const params = new URLSearchParams(queryIndex >= 0 ? base.slice(queryIndex + 1) : '');
        // 覆盖或新增参数
        Object.keys(paramsObject || {}).forEach(function (param) {
            const value = paramsObject[param];
            if (value !== undefined && value !== null) {
                params.set(param, value);
            }
        });
        const queryString = params.toString();
        return path + (queryString ? '?' + queryString : '') + hash;
    }

    exports(MODUME_NAME, layTable);
});
