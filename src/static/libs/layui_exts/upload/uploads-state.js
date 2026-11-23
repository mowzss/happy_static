// 上传组件 - 状态同步层：隐藏域的增删改、改名、排序。
// 导出方法集合，由 uploads-core 混入 Uploads.prototype。
layui.define(['jquery', 'layer'], function (exports) {
    "use strict";

    var $ = layui.jquery;
    var layer = layui.layer;

    // 把一项数据序列化为隐藏域片段
    function serialize(data, type) {
        return type === 'images'
            ? [data.url].filter(Boolean).join('|')
            : [data.url, data.name, data.size].filter(Boolean).join('|');
    }

    // 当前隐藏域的项数组
    function readItems() {
        var Input = $(this.elem).find('input[name="' + this.config.field + '"]');
        return Input.val() ? Input.val().split(',') : [];
    }

    function writeItems(items) {
        $(this.elem).find('input[name="' + this.config.field + '"]').val(items.join(','));
    }

    // 更新隐藏域（新增/覆盖）
    function updateHiddenField(data) {
        var items = readItems.call(this);
        var newItem = serialize(data, this.config.type);

        if (!items.includes(newItem)) {
            if (this.config.multiple) {
                items.push(newItem);
            } else {
                items = [newItem]; // 单图：直接覆盖
            }
        }
        writeItems.call(this, items);
    };

    // 替换隐藏域中指定 url 的项（多图替换用；单图直接覆盖）
    function replaceHiddenField(oldUrl, data) {
        if (!this.config.multiple) {
            writeItems.call(this, [serialize(data, this.config.type)]);
            return;
        }
        var items = readItems.call(this).map(function (item) {
            return item.split('|')[0] === oldUrl ? serialize(data, this.config.type) : item;
        }, this);
        writeItems.call(this, items.filter(Boolean));
    };

    // 从隐藏域移除指定 url
    function removeHiddenField(url) {
        var items = readItems.call(this).filter(function (item) {
            return item.split('|')[0] !== url;
        });
        writeItems.call(this, items);
    };

    // 删除项：同步隐藏域 + 移除 DOM（单图补回上传入口）
    function deleteItem(elem) {
        var $itemContainer = $(elem).parent();
        var url = $itemContainer.data('files-url');

        this.removeHiddenField(url);

        if (this.config.type === 'images' && this.config.multiple === false) {
            $itemContainer.remove();
            // 上传入口在 list 外常驻，无需重建；仅重新绑定以确保事件有效
            this.initUploader();
        } else {
            $itemContainer.remove();
        }
    };

    // 修改文件名（弹层）
    function editFileName(elem) {
        var that = this;
        var $itemContainer = $(elem).parent();
        var url = $itemContainer.data('files-url');
        var $fileNameElement = $itemContainer.find('.files');
        var oldName = $fileNameElement.text().trim();

        layer.prompt({
            formType: 2,
            title: '请输入新的文件名',
            value: oldName,
            area: ['300px', '150px']
        }, function (newName, index) {
            if (newName.trim() !== '') {
                $fileNameElement.text(newName);
                that.updateHiddenFieldName(url, newName);
                layer.close(index);
            } else {
                layer.msg('文件名不能为空');
            }
        });
    };

    // 更新隐藏域中的文件名
    function updateHiddenFieldName(url, newName) {
        var items = readItems.call(this).map(function (item) {
            var parts = item.split('|');
            if (parts[0] === url && parts.length > 1) {
                parts[1] = newName;
            }
            return parts.filter(Boolean).join('|');
        });
        writeItems.call(this, items);
    };

    // 排序后同步隐藏域顺序
    function updateOrder(oldIndex, newIndex) {
        if (this.callback) return;
        var items = readItems.call(this);
        var movedItem = items.splice(oldIndex, 1)[0];
        items.splice(newIndex, 0, movedItem);
        writeItems.call(this, items);
    };

    exports('uploadsState', {
        updateHiddenField: updateHiddenField,
        replaceHiddenField: replaceHiddenField,
        removeHiddenField: removeHiddenField,
        deleteItem: deleteItem,
        editFileName: editFileName,
        updateHiddenFieldName: updateHiddenFieldName,
        updateOrder: updateOrder
    });
});
