layui.define(function (exports) {
    "use strict";

    let $ = layui.$

    // 默认样式
    let styleContent = `
    /* 萤火虫 */
    .firefly {
        position: absolute;
        width: 3px;
        height: 3px;
        background: #fde39f;
        border-radius: 50%;
        filter: blur(1px);
        animation: firefly-float 15s infinite ease-in-out, firefly-blink 2s infinite;
    }

    @keyframes firefly-float {

        0%,
        100% {
            transform: translate(0, 0);
        }

        25% {
            transform: translate(100px, 100px);
        }

        50% {
            transform: translate(200px, 0);
        }

        75% {
            transform: translate(100px, -100px);
        }
    }

    @keyframes firefly-blink {

        0%,
        100% {
            opacity: 0.1;
        }

        50% {
            opacity: 1;
        }
    }

    /* 小方块 */
    .scene .cube {
        position: absolute;
        width: 50px;
        height: 50px;
        transform-style: preserve-3d;
        animation: square-float 10s infinite ease-in-out;
    }

    .scene .cube div {
        position: absolute;
        width: 50px;
        height: 50px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
    }

    @keyframes square-float {

        0%,
        100% {
            transform: translateZ(-200px) rotateX(0deg) rotateY(0deg);
        }

        25% {
            transform: translateZ(0) rotateX(90deg) rotateY(90deg);
        }

        50% {
            transform: translateZ(200px) rotateX(180deg) rotateY(180deg);
        }

        75% {
            transform: translateZ(0) rotateX(270deg) rotateY(270deg);
        }
    }

    /* 几何 */
    .geom-shape {
        position: absolute;
        opacity: 0.2;
        animation: geom 20s infinite ease-in-out;
    }

    @keyframes geom {

        0%,
        100% {
            transform: translate(0, 0) rotate(0deg);
        }

        25% {
            transform: translate(50px, 50px) rotate(90deg);
        }

        50% {
            transform: translate(100px, 0) rotate(180deg);
        }

        75% {
            transform: translate(50px, -50px) rotate(270deg);
        }
    }
    `
    // 添加样式
    let style = document.createElement('style')
    style.innerHTML = styleContent
    document.body.before(style)

    /**
     * 添加萤火虫
     * @param {object} elem 盒子对象
     */
    const AddFirefly = function (elem) {
        const firefly = document.createElement('div');
        firefly.className = 'firefly';
        firefly.style.left = `${Math.random() * 100}%`;
        firefly.style.top = `${Math.random() * 100}%`;
        firefly.style.animationDelay = `${Math.random() * 15}s, ${Math.random() * 2}s`;
        if (elem) {
            elem.append(firefly);
        }
    }

    /**
     * 创建方块
     * @param {object} elem 盒子对象
     */
    function createCube(elem) {
        const cube = document.createElement('div');
        cube.className = 'cube';
        cube.style.left = `${Math.random() * 100}%`;
        cube.style.top = `${Math.random() * 100}%`;
        cube.style.animationDelay = `${Math.random() * 10}s`;

        for (let i = 0; i < 6; i++) {
            const face = document.createElement('div');
            face.style.transform = `rotateX(${i * 90}deg) translateZ(25px)`;
            cube.appendChild(face);
        }

        elem.append(cube);
    }

    /**
     * 创建几何
     * @param {object} elem 盒子对象
     */
    function createGeom(elem) {

        const shapes = ['square', 'circle', 'triangle'];
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7d794'];

        const shape = document.createElement('div');
        shape.classList.add('geom-shape');
        const size = Math.random() * 100 + 50;
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        shape.style.left = `${Math.random() * 100}%`;
        shape.style.top = `${Math.random() * 100}%`;
        shape.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        shape.style.animationDuration = `${Math.random() * 10 + 10}s`;
        shape.style.animationDelay = `${Math.random() * 5}s`;
        const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
        if (shapeType === 'circle') {
            shape.style.borderRadius = '50%';
        } else if (shapeType === 'triangle') {
            shape.style.width = '0';
            shape.style.height = '0';
            shape.style.borderLeft = `${size / 2}px solid transparent`;
            shape.style.borderRight = `${size / 2}px solid transparent`;
            shape.style.borderBottom = `${size}px solid ${shape.style.backgroundColor}`;
            shape.style.backgroundColor = 'transparent';
        }
        elem.append(shape);
    }

    let movBg = {
        /**
         * 萤火虫
         * @param {object|string} elem 绑定
         * @param {options} options 配置
         */
        firefly: function (elem, options = {}) {
            // 默认配置
            let config = {
                num: 50,
                background: "#001f3f",
                color: "white"
            }

            config.num = options.num || config.num
            config.background = options.background || config.background
            config.color = options.color || config.color

            if (typeof elem === "string") {
                elem = $(elem)
            }

            // 外壳样式
            elem.css({
                "overflow": "hidden",
                "background": config.background,
                "position": "relative"
            })
            // 内容样式
            elem.find(".content").css({
                "position": "relative",
                "z-index": 1,
                "color": config.color,
                "padding": "20px",
                "box-sizing": "border-box"
            })
            // 添加萤火虫
            for (let i = 0; i < config.num; i++) {
                AddFirefly(elem);
            }
        },
        /**
         * 小方块
         * @param {object|string} elem 绑定
         * @param {object} options 配置
         */
        square: function (elem, options = {}) {
            let config = {
                num: 20,
                background: "#1a1a1a",
                color: "white"
            }

            config.num = options.num || config.num
            config.background = options.background || config.background
            config.color = options.color || config.color

            if (typeof elem === "string") {
                elem = $(elem)
            }
            elem.css({
                "overflow": "hidden",
                "background": config.background,
                "perspective": "1000px",
                "position": "relative",
            })
            elem.find(".content").css({
                "position": "relative",
                "z-index": 1,
                "color": config.color,
                "padding": "20px",
                "box-sizing": "border-box"
            })
            const scene = $(`<div class="scene" id="scene"></div>`)
            elem.append(scene)

            for (let i = 0; i < config.num; i++) {
                createCube(scene);
            }

            elem.find(".scene#scene").css({
                "top": 0,
                "left": 0,
                "position": "absolute",
                "width": "100%",
                "height": "100%",
                "transform-style": "preserve-3d",
            })
            elem.find(".content").css({
                "position": "relative",
                "z-index": 1,
                "color": config.color,
                "padding": "20px",
                "box-sizing": "border-box"
            })
        },
        /**
         *
         * @param {object|string} elem
         * @param {object} options 配置
         */
        geom: function (elem, options = {}) {

            let config = {
                num: 20,
                background: "#f0f0f0",
                color: "#000"
            }
            config.num = options.num || config.num
            config.background = options.background || config.background
            config.color = options.color || config.color

            if (typeof elem === "string") {
                elem = $(elem)
            }

            elem.css({
                "overflow": "hidden",
                "background": config.background,
                "position": "relative",
            })

            elem.find(".content").css({
                "z-index": 1,
                "color": config.color,
                "padding": "20px",
                "box-sizing": "border-box"
            })

            for (let i = 0; i < config.num; i++) {
                createGeom(elem);
            }
        }
    }


    exports("movBg", movBg)
})
