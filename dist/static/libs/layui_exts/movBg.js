layui.define(function(e){let d=layui.$;var t=document.createElement("style");t.innerHTML=`
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
    `,document.body.before(t);e("movBg",{firefly:function(t,e={}){var o,r,a={num:50,background:"#001f3f",color:"white"};a.num=e.num||a.num,a.background=e.background||a.background,a.color=e.color||a.color,(t="string"==typeof t?d(t):t).css({overflow:"hidden",background:a.background,position:"relative"}),t.find(".content").css({position:"relative","z-index":1,color:a.color,padding:"20px","box-sizing":"border-box"});for(let e=0;e<a.num;e++)o=t,r=void 0,(r=document.createElement("div")).className="firefly",r.style.left=100*Math.random()+"%",r.style.top=100*Math.random()+"%",r.style.animationDelay=`${15*Math.random()}s, ${2*Math.random()}s`,o&&o.append(r)},square:function(e,t={}){var o={num:20,background:"#1a1a1a",color:"white"},r=(o.num=t.num||o.num,o.background=t.background||o.background,o.color=t.color||o.color,(e="string"==typeof e?d(e):e).css({overflow:"hidden",background:o.background,perspective:"1000px",position:"relative"}),e.find(".content").css({position:"relative","z-index":1,color:o.color,padding:"20px","box-sizing":"border-box"}),d('<div class="scene" id="scene"></div>'));e.append(r);for(let e=0;e<o.num;e++){i=n=a=void 0;var a=r,n=document.createElement("div");n.className="cube",n.style.left=100*Math.random()+"%",n.style.top=100*Math.random()+"%",n.style.animationDelay=10*Math.random()+"s";for(let e=0;e<6;e++){var i=document.createElement("div");i.style.transform=`rotateX(${90*e}deg) translateZ(25px)`,n.appendChild(i)}a.append(n)}e.find(".scene#scene").css({top:0,left:0,position:"absolute",width:"100%",height:"100%","transform-style":"preserve-3d"}),e.find(".content").css({position:"relative","z-index":1,color:o.color,padding:"20px","box-sizing":"border-box"})},geom:function(t,e={}){var o,r,a,n,i,s={num:20,background:"#f0f0f0",color:"#000"};s.num=e.num||s.num,s.background=e.background||s.background,s.color=e.color||s.color,(t="string"==typeof t?d(t):t).css({overflow:"hidden",background:s.background,position:"relative"}),t.find(".content").css({"z-index":1,color:s.color,padding:"20px","box-sizing":"border-box"});for(let e=0;e<s.num;e++)o=t,i=n=a=r=void 0,r=["square","circle","triangle"],a=["#ff6b6b","#4ecdc4","#45b7d1","#f7d794"],(n=document.createElement("div")).classList.add("geom-shape"),i=100*Math.random()+50,n.style.width=i+"px",n.style.height=i+"px",n.style.left=100*Math.random()+"%",n.style.top=100*Math.random()+"%",n.style.backgroundColor=a[Math.floor(Math.random()*a.length)],n.style.animationDuration=10*Math.random()+10+"s",n.style.animationDelay=5*Math.random()+"s","circle"===(a=r[Math.floor(Math.random()*r.length)])?n.style.borderRadius="50%":"triangle"===a&&(n.style.width="0",n.style.height="0",n.style.borderLeft=i/2+"px solid transparent",n.style.borderRight=i/2+"px solid transparent",n.style.borderBottom=i+"px solid "+n.style.backgroundColor,n.style.backgroundColor="transparent"),o.append(n)}})});