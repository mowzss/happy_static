(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.AutoInitService = factory();
    }
}(this, function () {
    function AutoInitService(config) {
        const services = {
            lingQue: (key) => {
                if (!key) return;
                let scriptSrc = "https://sdk.51.la/perf/js-sdk-perf.min.js";
                insertScript(scriptSrc, 'lingQueMonitor');

                // 监听脚本加载完成事件
                window.addEventListener('load', () => {
                    if (window['LingQue'] && window['LingQue']['Monitor']) {
                        new window['LingQue']["Monitor"]().init({id: key, sendSuspicious: true});
                    }
                });
            },
            ToutiaoPush: (ttpushKey) => {
                if (!ttpushKey) return;
                let t_url = "https://lf1-cdn-tos.bytegoofy.com/goofy/ttzz/push.js?" + ttpushKey;
                insertScript(t_url, 'ttzz');
            },
            baiduPush: () => {
                const curProtocol = window.location.protocol.split(':')[0];
                let bpSrc = curProtocol === 'https' ? 'https://zz.bdstatic.com/linksubmit/push.js' : 'http://push.zhanzhang.baidu.com/push.js';
                insertScript(bpSrc);

                // 可选：设置全局变量或监听加载完成事件（视需求而定）
                window._hmt = window._hmt || [];
            },
            baiduTongji: (bdtjKey) => {
                if (!bdtjKey) return;
                insertScript('https://hm.baidu.com/hm.js?' + bdtjKey);
            },
            clarity: (clarityKey) => {
                if (!clarityKey) return;
                window["clarity"] = window["clarity"] || function () {
                    (window["clarity"].q = window["clarity"].q || []).push(arguments)
                };
                insertScript("https://www.clarity.ms/tag/" + clarityKey);
            },
            w51Tongji: (w51tjKey) => {
                if (!w51tjKey) return;
                insertScript("https://sdk.51.la/js-sdk-pro.min.js", "LA_COLLECT");
                window.LA = {ids: [{id: w51tjKey, ck: w51tjKey, autoTrack: true}]};
            }
        };

        const insertScript = (src, id = '') => {
            let el = document.createElement("script");
            el.src = src;
            if (id.length > 0) {
                el.id = id;
            }
            let s = document.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(el, s);
        };

        this.init = () => {
            for (let [serviceName, serviceFunc] of Object.entries(services)) {
                // 如果服务不需要参数，或者配置中存在该服务的参数，则调用服务函数
                if (serviceName !== 'baiduPush' && !config[serviceName]) continue; // 跳过未配置的服务（除了baiduPush）
                serviceFunc(config[serviceName]);
            }
        };
    }

    return AutoInitService;
}));
