/*! UEditorPlus v2.0.0*/
!function () {
    function a(a, d) {
        return c(a || self.document.URL || self.location.href, d || b())
    }

    function b() {
        var a = document.getElementsByTagName("script");
        return a[a.length - 1].src
    }

    function c(a, b) {
        var c = b;
        return /^(\/|\\\\)/.test(b) ? c = /^.+?\w(\/|\\\\)/.exec(a)[0] + b.replace(/^(\/|\\\\)/, "") : /^[a-z]+:/i.test(b) || (a = a.split("#")[0].split("?")[0].replace(/[^\\\/]+$/, ""), c = a + "" + b), d(c)
    }

    function d(a) {
        var b = /^[a-z]+:\/\//.exec(a)[0], c = null, d = [];
        for (a = a.replace(b, "").split("?")[0].split("#")[0], a = a.replace(/\\/g, "/").split(/\//), a[a.length - 1] = ""; a.length;) ".." === (c = a.shift()) ? d.pop() : "." !== c && d.push(c);
        return b + d.join("/")
    }

    var e, f;
    e = window.UEDITOR_HOME_URL ? window.UEDITOR_HOME_URL : window.__msCDN ? window.__msCDN + "asset/vendor/ueditor/" : window.__msRoot ? window.__msRoot + "asset/vendor/ueditor/" : a(), f = window.UEDITOR_CORS_URL ? window.UEDITOR_CORS_URL : window.__msRoot ? window.__msRoot + "asset/vendor/ueditor/" : window.UEDITOR_HOME_URL ? window.UEDITOR_HOME_URL : a(), window.UEDITOR_CONFIG = {
        UEDITOR_HOME_URL: e,
        UEDITOR_CORS_URL: f,
        debug: !1,
        serverUrl: "/ueditor-plus/_demo_server/handle.php",
        loadConfigFromServer: !0,
        serverHeaders: {},
        serverResponsePrepare: function (a) {
            return a
        },
        toolbars: [["fullscreen", "source", "|", "undo", "redo", "|", "bold", "italic", "underline", "fontborder", "strikethrough", "superscript", "subscript", "removeformat", "formatmatch", "autotypeset", "blockquote", "pasteplain", "|", "forecolor", "backcolor", "insertorderedlist", "insertunorderedlist", "selectall", "cleardoc", "|", "rowspacingtop", "rowspacingbottom", "lineheight", "|", "customstyle", "paragraph", "fontfamily", "fontsize", "|", "directionalityltr", "directionalityrtl", "indent", "|", "justifyleft", "justifycenter", "justifyright", "justifyjustify", "|", "touppercase", "tolowercase", "|", "link", "unlink", "anchor", "|", "imagenone", "imageleft", "imagecenter", "imageright", "|", "simpleupload", "insertimage", "emotion", "scrawl", "insertvideo", "insertaudio", "attachment", "insertframe", "insertcode", "pagebreak", "template", "background", "formula", "|", "horizontal", "date", "time", "spechars", "wordimage", "|", "inserttable", "deletetable", "insertparagraphbeforetable", "insertrow", "deleterow", "insertcol", "deletecol", "mergecells", "mergeright", "mergedown", "splittocells", "splittorows", "splittocols", "|", "print", "preview", "searchreplace", "|", "contentimport", "help"]],
        toolbarCallback: function (a, b) {
        },
        uploadServiceEnable: !1,
        uploadServiceUpload: function (a, b, c, d) {
            console.log("uploadServiceUpload", a, b, c, d)
        },
        imageConfig: {disableUpload: !1, disableOnline: !1, selectCallback: null},
        videoConfig: {disableUpload: !1, selectCallback: null},
        audioConfig: {disableUpload: !1, selectCallback: null},
        formulaConfig: {
            imageUrlTemplate: "https://r.latexeasy.com/image.svg?{}",
            editorMode: "live",
            editorLiveServer: "https://latexeasy.com"
        },
        autoSaveEnable: !0,
        autoSaveRestore: !1,
        autoSaveKey: null,
        initialContent: "",
        focus: !1,
        initialStyle: "",
        indentValue: "2em",
        readonly: !1,
        autoClearEmptyNode: !0,
        fullscreen: !1,
        allHtmlEnabled: !1,
        enableContextMenu: !0,
        shortcutMenu: ["bold", "italic", "underline", "strikethrough", "fontborder", "forecolor", "backcolor", "imagenone", "imageleft", "imagecenter", "imageright", "insertimage", "formula"],
        elementPathEnabled: !0,
        wordCount: !0,
        maximumWords: 1e4,
        maxUndoCount: 20,
        maxInputCount: 1,
        autoHeightEnabled: !0,
        minFrameHeight: 220,
        autoFloatEnabled: !0,
        topOffset: 0,
        toolbarTopOffset: 0,
        catchRemoteImageEnable: !0,
        autotypeset: {
            mergeEmptyline: !0,
            removeClass: !0,
            removeEmptyline: !1,
            textAlign: "left",
            imageBlockLine: "center",
            pasteFilter: !1,
            clearFontSize: !1,
            clearFontFamily: !1,
            removeEmptyNode: !1,
            removeTagNames: {div: 1},
            indent: !1,
            indentValue: "2em",
            bdc2sb: !1,
            tobdc: !1
        },
        allowDivTransToP: !0,
        rgb2Hex: !0,
        tipError: function (a, b) {
            window && window.MS && window.MS.dialog ? window.MS.dialog.tipError(a) : alert(a)
        }
    }, window.UE = {getUEBasePath: a}
}();
