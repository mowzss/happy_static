/* Happy Admin · 系统安装向导
   原生 JS 实现，不依赖 jQuery / layui。所有请求走统一 api 入口并携带安装令牌。 */
(function () {
    'use strict';

    const BOOT = window.INSTALL_BOOT || {};
    const S = {
        api: BOOT.api || '',
        token: BOOT.token || '',
        entrance: BOOT.entrance || 'admin.php',
        state: BOOT.state || {},
        step: 1,
        envPassed: false,
        dbChecked: false,
        dbHasData: false,
        installing: false
    };

    const TASKS = [
        { key: 'schema', action: 'install_schema', title: '初始化数据表', desc: '执行 system/install.sql，创建系统表与初始数据' },
        { key: 'admin', action: 'install_admin', title: '创建管理员', desc: '写入超级管理员账号与站点基础配置' },
        { key: 'finalize', action: 'install_finalize', title: '完成配置', desc: '生成系统配置、执行升级脚本并写入安装锁' }
    ];

    const $ = (id) => document.getElementById(id);
    const el = (tag, cls, text) => {
        const node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text !== undefined && text !== null) node.textContent = text;
        return node;
    };
    const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));

    // ---------------------------------------------------------------- 通用
    function toast(message, type) {
        const box = $('toast');
        if (!box) return;
        box.textContent = message;
        box.className = 'toast is-visible' + (type ? ' is-' + type : '');
        clearTimeout(box._timer);
        box._timer = setTimeout(() => { box.className = 'toast'; }, 3200);
    }

    function showAlert(id, type, message) {
        const box = $(id);
        if (!box) return;
        if (!message) { box.className = 'alert'; box.textContent = ''; return; }
        box.className = 'alert is-visible alert-' + type;
        box.textContent = message;
    }

    function overlay(visible, text) {
        const box = $('overlay');
        if (!box) return;
        box.className = visible ? 'overlay is-visible' : 'overlay';
        if (text) box.querySelector('span').textContent = text;
    }

    function setBusy(button, busy, label) {
        if (!button) return;
        if (busy) {
            button.dataset.original = button.textContent.trim();
            button.innerHTML = '<i class="spin"></i>' + (label || '处理中…');
            button.disabled = true;
        } else {
            button.textContent = button.dataset.original || button.textContent;
            button.disabled = false;
        }
    }

    function status(text, type) {
        const pill = $('statusPill');
        if (!pill) return;
        pill.textContent = text;
        pill.className = 'pill pill-' + (type || 'idle');
    }

    function api(action, params) {
        const body = new URLSearchParams();
        body.set('action', action);
        body.set('token', S.token);
        Object.keys(params || {}).forEach((key) => body.set(key, params[key]));
        return fetch(S.api, {
            method: 'POST',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
            body: body
        }).then((response) => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        }).then((result) => {
            if (result && result.state) S.state = result.state;
            return result || {};
        }).catch((error) => ({
            ok: false,
            code: 'NETWORK_ERROR',
            message: '请求失败：' + error.message
        }));
    }

    function setStep(step) {
        S.step = step;
        document.querySelectorAll('.panel').forEach((panel) => {
            panel.classList.toggle('is-current', Number(panel.dataset.panel) === step);
        });
        document.querySelectorAll('#stepList .step-item').forEach((item) => {
            const n = Number(item.dataset.step);
            item.classList.toggle('is-active', n === step);
            item.classList.toggle('is-done', n < step);
            const index = item.querySelector('.step-index');
            index.textContent = n < step ? '✓' : String(n);
        });
        const names = ['环境检测', '数据库配置', '站点与管理员', '安装完成'];
        const crumb = $('crumb');
        if (crumb) crumb.textContent = '/ ' + (names[step - 1] || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ---------------------------------------------------------------- 环境检测
    function renderEnv(data) {
        const groups = $('envGroups');
        if (!groups) return;
        groups.innerHTML = '';
        const grouped = {};
        (data.items || []).forEach((item) => {
            (grouped[item.group] = grouped[item.group] || []).push(item);
        });
        Object.keys(grouped).forEach((name) => {
            const wrap = el('div', 'env-group');
            wrap.appendChild(el('div', 'env-group-title', name));
            grouped[name].forEach((item) => {
                const row = el('div', 'env-row');
                const icon = el('span', 'env-icon ' + (item.ok ? 'ok' : (item.required ? 'bad' : 'warn')), item.ok ? '✓' : '!');
                const nameBox = el('div', 'env-name');
                nameBox.appendChild(document.createTextNode(item.name));
                if (!item.ok && item.hint) nameBox.appendChild(el('span', 'env-hint', item.hint));
                row.appendChild(icon);
                row.appendChild(nameBox);
                if (!item.required) row.appendChild(el('span', 'env-tag', '建议项'));
                row.appendChild(el('span', 'env-value mono', item.current || '—'));
                wrap.appendChild(row);
            });
            groups.appendChild(wrap);
        });

        const score = $('envScore');
        const passed = (data.summary && data.summary.passed) || 0;
        const total = (data.summary && data.summary.total) || 0;
        score.textContent = passed + '/' + total;
        score.className = 'env-score ' + (data.passed ? 'is-ok' : 'is-bad');
        $('envSummaryText').innerHTML = '<strong>' + escapeHtml(data.passed ? '运行环境符合安装要求' : '存在 ' + (data.failed || 0) + ' 项必需条件未满足') + '</strong>'
            + 'PHP ' + escapeHtml(data.php || '') + ' · ' + escapeHtml(data.server || 'Web Server') + ' · 必需项 ' + ((data.summary && data.summary.required) || 0) + ' 项';

        S.envPassed = !!data.passed;
        $('btnEnvNext').disabled = !data.passed;
        showAlert('envAlert', data.passed ? 'ok' : 'error',
            data.passed ? '' : '请先修复标红的项目，然后点击「重新检测」。');
        status(data.passed ? '环境检测通过' : '环境检测未通过', data.passed ? 'ok' : 'bad');
    }

    function runEnvCheck(button) {
        setBusy(button || $('btnEnvRecheck'), true, '检测中…');
        return api('check_environment').then((result) => {
            setBusy(button || $('btnEnvRecheck'), false);
            if (!result.ok) {
                showAlert('envAlert', 'error', result.message);
                status('检测失败', 'bad');
                toast(result.message, 'error');
                return;
            }
            renderEnv(result.data || {});
        });
    }

    // ---------------------------------------------------------------- 数据库
    function dbFields() {
        return {
            db_host: $('dbHost').value.trim(),
            db_port: $('dbPort').value.trim(),
            db_name: $('dbName').value.trim(),
            db_user: $('dbUser').value.trim(),
            db_pass: $('dbPass').value,
            db_prefix: $('dbPrefix').value.trim()
        };
    }

    function validateDbClient(fields) {
        if (!/^[A-Za-z0-9_.\-:\[\]]{1,120}$/.test(fields.db_host)) return '数据库主机格式不正确';
        const port = Number(fields.db_port);
        if (!port || port < 1 || port > 65535) return '数据库端口必须在 1-65535 之间';
        if (!/^[A-Za-z0-9_]{1,64}$/.test(fields.db_name)) return '数据库名称只能包含字母、数字与下划线';
        if (!fields.db_user) return '请填写数据库用户名';
        if (!/^[A-Za-z][A-Za-z0-9]{0,19}_$/.test(fields.db_prefix)) return '表前缀须以字母开头、由字母数字组成并以下划线结尾，例如 ha_';
        return '';
    }

    function runDbCheck() {
        const fields = dbFields();
        const invalid = validateDbClient(fields);
        if (invalid) { showAlert('dbAlert', 'error', invalid); return; }
        showAlert('dbAlert', 'info', '正在连接数据库…');
        setBusy($('btnDbTest'), true, '连接中…');
        api('check_database', fields).then((result) => {
            setBusy($('btnDbTest'), false);
            if (!result.ok) {
                showAlert('dbAlert', 'error', result.message);
                $('dbResult').className = 'db-result';
                $('btnDbSave').disabled = true;
                S.dbChecked = false;
                return;
            }
            const data = result.data || {};
            S.dbChecked = true;
            S.dbHasData = !!data.has_data;
            $('dbVersion').textContent = data.version || '—';
            $('dbCharset').textContent = data.charset || '—';
            $('dbPrefixOut').textContent = data.prefix || '—';
            $('dbTableCount').textContent = (data.existing_tables || []).length + ' 张';
            const list = $('dbTableList');
            list.innerHTML = '';
            (data.existing_tables || []).forEach((table) => list.appendChild(el('div', '', table)));
            list.style.display = data.has_data ? 'block' : 'none';
            $('dbResult').className = 'db-result is-visible';
            $('dbOverwriteBox').style.display = data.has_data ? 'block' : 'none';
            $('overwrite').checked = false;
            $('btnDbSave').disabled = true;
            showAlert('dbAlert', data.has_data ? 'warn' : 'ok',
                data.has_data
                    ? '目标库检测到同前缀数据表。安装脚本会 DROP 并重建这些表，原数据将无法恢复，请先备份。'
                    : '连接成功，数据库为空，可以安全安装。');
            status('数据库连接正常', data.has_data ? 'run' : 'ok');
            toast('数据库连接成功', 'ok');
        });
    }

    function saveDatabase() {
        if (!S.dbChecked) { showAlert('dbAlert', 'error', '请先测试数据库连接'); return; }
        if (S.dbHasData && !$('overwrite').checked) {
            showAlert('dbAlert', 'error', '请先勾选覆盖确认');
            return;
        }
        const fields = dbFields();
        const invalid = validateDbClient(fields);
        if (invalid) { showAlert('dbAlert', 'error', invalid); return; }
        fields.overwrite = $('overwrite').checked ? '1' : '0';
        setBusy($('btnDbSave'), true, '保存中…');
        api('save_database', fields).then((result) => {
            setBusy($('btnDbSave'), false);
            if (!result.ok) { showAlert('dbAlert', 'error', result.message); toast(result.message, 'error'); return; }
            $('summaryDb').textContent = fields.db_host + ':' + fields.db_port + ' / ' + fields.db_name + ' / ' + fields.db_prefix;
            $('summaryEnv').textContent = 'PHP ' + (BOOT.php || '') + ' · 环境检测通过';
            showAlert('dbAlert', 'ok', '数据库配置已写入，请继续设置管理员。');
            status('数据库配置已保存', 'ok');
            setStep(3);
        });
    }

    // ---------------------------------------------------------------- 管理员
    function updateStrength() {
        const value = $('adminPassword').value;
        let score = 0;
        if (value.length >= 8) score++;
        if (/[A-Za-z]/.test(value) && /\d/.test(value)) score++;
        if (/[^A-Za-z0-9]/.test(value)) score++;
        if (value.length >= 12) score++;
        const width = [0, 30, 60, 82, 100][score];
        const colors = ['#e3e8f1', '#d8493f', '#c07a12', '#2f5bde', '#0f9d68'];
        const labels = ['未填写', '弱：需同时包含字母与数字', '一般：建议增加长度或特殊字符', '较强', '强'];
        $('strengthBar').style.width = width + '%';
        $('strengthBar').style.background = colors[score];
        $('strengthText').textContent = labels[score];
    }

    function accountFields() {
        return {
            site_name: $('siteName').value.trim(),
            admin_username: $('adminUsername').value.trim(),
            admin_password: $('adminPassword').value,
            admin_password_confirm: $('adminPasswordConfirm').value,
            admin_entrance: $('adminEntrance').value.trim()
        };
    }

    function validateAccountClient(f) {
        if (!/^[A-Za-z][A-Za-z0-9_]{2,31}$/.test(f.admin_username)) return '管理员账号须以字母开头，长度 3-32 位，仅含字母、数字与下划线';
        if (f.admin_password.length < 8 || f.admin_password.length > 72) return '管理员密码长度须为 8-72 位';
        if (!/[A-Za-z]/.test(f.admin_password) || !/\d/.test(f.admin_password)) return '管理员密码须同时包含字母与数字';
        if (f.admin_password !== f.admin_password_confirm) return '两次输入的密码不一致';
        if (f.site_name.length > 60) return '站点名称不能超过 60 个字符';
        if (!/^[A-Za-z0-9_\-]{1,40}\.php$/.test(f.admin_entrance)) return '后台入口文件名不合法，示例：admin.php';
        return '';
    }

    // ---------------------------------------------------------------- 安装
    function renderTasks() {
        const list = $('taskList');
        if (!list) return;
        list.innerHTML = '';
        TASKS.forEach((task) => {
            const row = el('div', 'task');
            row.id = 'task-' + task.key;
            row.appendChild(el('span', 'task-icon', '·'));
            const body = el('div', 'task-body');
            body.appendChild(el('div', 'task-title', task.title));
            body.appendChild(el('div', 'task-desc', task.desc));
            row.appendChild(body);
            row.appendChild(el('span', 'task-status', '等待中'));
            list.appendChild(row);
        });
    }

    function setTask(key, state, text) {
        const row = $('task-' + key);
        if (!row) return;
        row.className = 'task' + (state === 'waiting' ? '' : ' is-' + state);
        const icon = row.querySelector('.task-icon');
        icon.textContent = state === 'done' ? '✓' : (state === 'failed' ? '!' : (state === 'running' ? '…' : '·'));
        row.querySelector('.task-status').textContent = text || ({
            waiting: '等待中', running: '进行中', done: '已完成', failed: '失败'
        }[state] || '');
    }

    function appendLog(text, type) {
        const box = $('installLog');
        if (!box) return;
        const line = el('div', type ? 'l-' + type : '');
        line.appendChild(el('span', 'l-time', new Date().toLocaleTimeString('zh-CN', { hour12: false })));
        line.appendChild(document.createTextNode(text));
        box.appendChild(line);
        box.scrollTop = box.scrollHeight;
    }

    function showFinish(data) {
        $('finish').className = 'finish is-visible';
        const url = data.entrance || ('/' + S.entrance);
        const link = $('finishEntrance');
        link.textContent = window.location.origin + url;
        link.href = url;
        $('finishLink').href = url;
        $('finishUsername').textContent = data.username || '—';
        $('finishTime').textContent = (S.state && S.state.finished_at) || new Date().toLocaleString('zh-CN', { hour12: false });
        const warnings = data.warnings || [];
        $('finishWarnings').style.display = warnings.length ? 'block' : 'none';
        $('finishWarnings').textContent = warnings.join('；');
        status('安装完成', 'ok');
        toast('系统安装完成', 'ok');
    }

    function installFailed(message) {
        S.installing = false;
        overlay(false);
        $('btnResetFlow').style.display = 'inline-flex';
        $('btnInstall').disabled = false;
        showAlert('installAlert', 'error', message);
        status('安装失败', 'bad');
        appendLog('失败：' + message, 'err');
    }

    function runInstallChain(account) {
        if (S.installing) return;
        S.installing = true;
        $('btnResetFlow').style.display = 'none';
        showAlert('installAlert', 'info', '请勿关闭页面，安装过程需要执行数据库脚本与系统升级。');
        status('正在安装', 'run');
        overlay(true, '正在初始化系统，请稍候…');
        appendLog('开始安装，共 3 个阶段');

        const done = (S.state && S.state.steps) || {};
        let completed = TASKS.filter((t) => done[t.key]).length;
        $('progressBar').style.width = Math.round(completed / TASKS.length * 100) + '%';
        TASKS.forEach((task) => setTask(task.key, done[task.key] ? 'done' : 'waiting', done[task.key] ? '已完成' : '等待中'));

        let chain = Promise.resolve(true);
        TASKS.forEach((task) => {
            chain = chain.then((goOn) => {
                if (!goOn) return false;
                if (done[task.key]) return true;
                setTask(task.key, 'running', '进行中');
                appendLog('执行：' + task.title);
                return api(task.action, task.key === 'admin' ? account : {}).then((result) => {
                    if (!result.ok) {
                        setTask(task.key, 'failed', '失败');
                        installFailed(result.message || '未知错误');
                        return false;
                    }
                    setTask(task.key, 'done', '已完成');
                    appendLog((result.message || '完成') + (result.data && result.data.tables ? '（' + result.data.tables + ' 张表）' : ''), 'ok');
                    completed = TASKS.filter((t) => (S.state.steps || {})[t.key]).length;
                    $('progressBar').style.width = Math.round(completed / TASKS.length * 100) + '%';
                    return true;
                });
            });
        });

        chain.then((success) => {
            if (!success) return;
            overlay(false);
            S.installing = false;
            $('progressBar').style.width = '100%';
            showAlert('installAlert', 'ok', '安装完成。请妥善保管管理员密码，并及时删除安装残留备份。');
            appendLog('全部阶段执行完毕', 'ok');
            showFinish({
                entrance: '/' + (account.admin_entrance || (S.state && S.state.entrance) || S.entrance),
                username: account.admin_username || (S.state && S.state.account && S.state.account.username) || '',
                warnings: (S.state && S.state.warnings) || []
            });
        });
    }

    function startInstall() {
        const fields = accountFields();
        const invalid = validateAccountClient(fields);
        if (invalid) { showAlert('accountAlert', 'error', invalid); return; }
        showAlert('accountAlert', '');
        setStep(4);
        renderTasks();
        $('installLog').innerHTML = '';
        // 密码仅在本页内存中传递，不写入状态文件、不回显到完成页
        runInstallChain(fields);
    }

    function resetFlow() {
        if (S.installing) return;
        setBusy($('btnResetFlow'), true, '重置中…');
        api('reset').then((result) => {
            setBusy($('btnResetFlow'), false);
            if (!result.ok) { toast(result.message, 'error'); return; }
            toast('已重置，页面即将刷新', 'ok');
            setTimeout(() => window.location.reload(), 600);
        });
    }

    // ---------------------------------------------------------------- 初始化
    function init() {
        if (BOOT.installed) return;
        $('phpVersion').textContent = BOOT.php || '';
        $('adminEntrance').value = S.entrance;

        const state = S.state || {};
        if (state.db && state.db.host) {
            $('dbHost').value = state.db.host || '127.0.0.1';
            $('dbPort').value = state.db.port || 3306;
            $('dbName').value = state.db.name || '';
            $('dbUser').value = state.db.user || '';
            $('dbPrefix').value = state.db.prefix || 'ha_';
            $('summaryDb').textContent = (state.db.host || '') + ':' + (state.db.port || '') + ' / ' + (state.db.name || '') + ' / ' + (state.db.prefix || '');
        }
        if (state.account && state.account.username) $('adminUsername').value = state.account.username;
        if (state.account && state.account.site_name) $('siteName').value = state.account.site_name;
        $('summaryEnv').textContent = 'PHP ' + (BOOT.php || '') + ' · ' + (state.env_checked ? '环境检测通过' : '待检测');

        const steps = state.steps || {};
        // 中断恢复：管理员已建好但收尾未完成 -> 可只执行 finalize；
        // 仅建表完成 -> 回到第 3 步重新填写管理员信息（密码不落盘）。
        let resumeMode = '';
        let initial = 1;
        if (state.stage === 'done' || steps.finalize) { initial = 4; resumeMode = 'finished'; }
        else if (steps.admin) { initial = 4; resumeMode = 'can_finalize'; }
        else if (steps.schema) { initial = 3; resumeMode = 'need_account'; }
        else if (state.stage === 'account' || state.db_saved) initial = 3;
        else if (state.stage === 'database' || state.env_checked) initial = 2;
        setStep(initial);
        S.envPassed = !!state.env_checked;
        S.dbChecked = !!state.db_saved;

        if (initial === 4) {
            renderTasks();
            $('installLog').innerHTML = '';
            TASKS.forEach((task) => setTask(task.key, steps[task.key] ? 'done' : 'waiting', steps[task.key] ? '已完成' : '等待中'));
            $('progressBar').style.width = Math.round(TASKS.filter((t) => steps[t.key]).length / TASKS.length * 100) + '%';
            if (resumeMode === 'finished') {
                $('progressBar').style.width = '100%';
                TASKS.forEach((task) => setTask(task.key, 'done', '已完成'));
                showFinish({ entrance: '/' + (state.entrance || S.entrance), username: (state.account && state.account.username) || '', warnings: state.warnings || [] });
            } else {
                appendLog('检测到未完成的安装流程，点击「继续完成安装」从中断处继续');
                $('btnInstallContinue').style.display = 'inline-flex';
                status('安装已中断', 'run');
            }
        } else {
            status(state.db_saved ? '数据库配置已保存' : '准备安装', 'idle');
        }
        if (resumeMode === 'need_account') {
            showAlert('accountAlert', 'warn', '数据表已初始化，请重新填写管理员信息后继续。密码不会保存在服务器上。');
        }

        // 事件绑定
        $('btnEnvRecheck').addEventListener('click', function () { runEnvCheck(this); });
        $('btnEnvNext').addEventListener('click', () => { if (S.envPassed) setStep(2); });
        $('btnDbBack').addEventListener('click', () => setStep(1));
        $('btnDbTest').addEventListener('click', runDbCheck);
        $('btnDbSave').addEventListener('click', saveDatabase);
        $('overwrite').addEventListener('change', () => { $('btnDbSave').disabled = !(S.dbHasData && $('overwrite').checked || !S.dbHasData); });
        $('btnAccountBack').addEventListener('click', () => setStep(2));
        $('btnInstall').addEventListener('click', startInstall);
        $('btnInstallContinue').addEventListener('click', () => runInstallChain({}));
        $('btnResetFlow').addEventListener('click', resetFlow);
        $('btnReset').addEventListener('click', resetFlow);
        if (initial > 1) $('btnEnvNext').disabled = false;
        $('adminPassword').addEventListener('input', updateStrength);
        $('dbForm').addEventListener('submit', (e) => { e.preventDefault(); runDbCheck(); });
        $('accountForm').addEventListener('submit', (e) => { e.preventDefault(); startInstall(); });

        if (initial === 1) runEnvCheck(null);
        else if (initial === 2) { S.envPassed = true; status('环境检测已通过', 'ok'); }
        if (initial === 3) { S.envPassed = true; S.dbChecked = true; $('btnDbSave').disabled = false; }
        if (resumeMode === 'can_finalize') {
            appendLog('若不需要保留已执行的步骤，可点击「重置并重试」重新开始');
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
