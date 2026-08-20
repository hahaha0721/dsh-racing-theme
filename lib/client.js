/**
 * dsh-racing-theme —— 客户端入口
 *
 * DSH 客户端模块加载器契约：bundle 被浏览器以 <script> 加载时，必须同步调用
 * window.__ModuleLoader__.load({ id, factory }) 注册自身，否则报
 * "loaded without registering \"<id>\" via __ModuleLoader__.load"。
 * factory 返回 { name, inject, apply }（Cordis 插件入口）。
 *
 * 主题实现机制（修复 2026-08-20）：
 * - 不用 register()+setTheme("racing")：第三方 id 的 preference 只存进程内，
 *   设置持久化加载完成后的 adopt() 会用磁盘内置值覆盖回去（表现为"只有 CSS 生效"）。
 * - 改用官方 token 覆盖层 API：ctx.theme.overrideTokens(source, tokens)
 *   —— 不碰 preference、不受 adopt 回滚，每次加载重新应用。
 * - overrideTokens 校验要求每个 token 必须同时提供 { light, dark } 两套值。
 * - 同时 setTheme("dark") 保证基底是暗色（内置值可持久化，无竞态）。
 */
window.__ModuleLoader__.load({
  id: "dsh-racing-theme",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    // 赛车红
    const RED = "#e10600";
    const RED_HOVER = "#c00500";
    // 暗色（碳黑）
    const DARK = {
      bg: "#0a0a0c", l1: "#101013", l2: "#151519", l3: "#1a1a1f",
      module: "#121216", overlay: "#0e0e11", skeleton: "#1c1c21",
      border1: "#1e1e23", border2: "#26262c", border3: "#2e2e35",
      text1: "#f4f4f6", text2: "#c6c8ce", text3: "#878a92",
    };
    // 亮色（碳白）
    const LIGHT = {
      bg: "#f2f2f4", l1: "#ffffff", l2: "#f7f7f9", l3: "#ecedf0",
      module: "#ffffff", overlay: "#fafafc", skeleton: "#e6e6ea",
      border1: "#e2e2e6", border2: "#d5d5da", border3: "#c8c8ce",
      text1: "#141416", text2: "#3f4147", text3: "#7a7d85",
    };
    const PAIR = (light, dark) => ({ light, dark });

    const RACING_TOKENS = {
      // —— 基底 ——
      "--dsw-alias-bg-base": PAIR("rgba(242, 242, 244, 0.90)", "rgba(10, 10, 12, 0.84)"),
      "--dsw-alias-bg-layer-1": PAIR("rgba(255, 255, 255, 0.62)", "rgba(16, 16, 19, 0.42)"),
      "--dsw-alias-bg-layer-2": PAIR("rgba(247, 247, 249, 0.66)", "rgba(21, 21, 25, 0.48)"),
      "--dsw-alias-bg-layer-3": PAIR("rgba(236, 237, 240, 0.70)", "rgba(26, 26, 31, 0.52)"),
      "--dsw-alias-bg-module-platform": PAIR("rgba(255, 255, 255, 0.66)", "rgba(18, 18, 22, 0.48)"),
      "--dsw-alias-bg-overlay": PAIR(LIGHT.overlay, DARK.overlay),
      "--dsw-alias-bg-skeleton": PAIR(LIGHT.skeleton, DARK.skeleton),
      "--dsw-alias-bg-multi-select": PAIR("rgba(225, 6, 0, 0.08)", "rgba(225, 6, 0, 0.10)"),
      // —— 边框 ——
      "--dsw-alias-border-l1": PAIR(LIGHT.border1, DARK.border1),
      "--dsw-alias-border-l2": PAIR(LIGHT.border2, DARK.border2),
      "--dsw-alias-border-l3": PAIR(LIGHT.border3, DARK.border3),
      "--dsw-alias-border-l4": PAIR("#b5b5bc", "#3a3a42"),
      // —— 品牌/强调：赛车红 ——
      "--dsw-alias-brand-primary": PAIR(RED, RED),
      "--dsw-alias-brand-primary-invert": PAIR("#ffffff", "#ffffff"),
      "--dsw-alias-brand-text": PAIR("#ffffff", "#ffffff"),
      // —— 文字 ——
      "--dsw-alias-label-primary": PAIR(LIGHT.text1, DARK.text1),
      "--dsw-alias-label-secondary": PAIR(LIGHT.text2, DARK.text2),
      "--dsw-alias-label-tertiary": PAIR(LIGHT.text3, DARK.text3),
      "--dsw-alias-label-dimmed": PAIR("#a0a3ab", "#5d6068"),
      "--dsw-alias-label-caption": PAIR("#8a8d95", "#9b9ea6"),
      "--dsw-alias-label-error": PAIR("#d92d20", "#f25454"),
      // —— 按钮：红 = 主操作 ——
      "--dsw-alias-button-primary-fill": PAIR(RED, RED),
      "--dsw-alias-button-primary-hover": PAIR(RED_HOVER, RED_HOVER),
      "--dsw-alias-button-info-fill": PAIR(RED, RED),
      "--dsw-alias-button-info-hover": PAIR(RED_HOVER, RED_HOVER),
      "--dsw-alias-button-primary-dimmed": PAIR("rgba(225, 6, 0, 0.45)", "rgba(225, 6, 0, 0.45)"),
      "--dsw-alias-button-contrast-fill": PAIR("#141416", "#f4f4f6"),
      "--dsw-alias-button-floating-fill": PAIR("#ffffff", "#1c1c21"),
      "--dsw-alias-button-floating-hover": PAIR("#f0f0f3", "#232329"),
      // —— 交互态 ——
      "--dsw-alias-interactive-bg-hover": PAIR("rgba(0, 0, 0, 0.05)", "rgba(255, 255, 255, 0.07)"),
      "--dsw-alias-interactive-bg-active": PAIR("rgba(225, 6, 0, 0.12)", "rgba(225, 6, 0, 0.16)"),
      "--dsw-alias-interactive-bg-hover-accent": PAIR("rgba(225, 6, 0, 0.10)", "rgba(225, 6, 0, 0.14)"),
      "--dsw-alias-interactive-bg-hover-danger": PAIR("rgba(217, 45, 32, 0.10)", "rgba(242, 84, 84, 0.12)"),
      // —— 状态色 ——
      "--dsw-alias-state-success-primary": PAIR("#129444", "#1fae54"),
      "--dsw-alias-state-success-tertiary": PAIR("rgba(18, 148, 68, 0.14)", "rgba(31, 174, 84, 0.18)"),
      "--dsw-alias-state-warn-primary": PAIR("#b45309", "#f5a30b"),
      "--dsw-alias-state-warn-secondary": PAIR("#d97706", "#f7ad31"),
      "--dsw-alias-state-error-secondary": PAIR("#d92d20", "#f25454"),
      // —— 代码块（暗红调） ——
      "--dsw-alias-markdown-code-block": PAIR("#f7f7f9", "#131316"),
      "--dsw-alias-markdown-code-block-banner": PAIR("#fdf2f2", "#1a1313"),
      "--dsw-alias-markdown-inline-code": PAIR("rgba(225, 6, 0, 0.10)", "rgba(225, 6, 0, 0.14)"),
      // —— 大表面半透明（让 body 碳纤维/水印透出） ——
      "--dsw-specific-sidebar-fill": PAIR("rgba(250, 250, 252, 0.55)", "rgba(12, 12, 15, 0.42)"),
    };

    const RACING_CSS = `
  /* ========== 纯 CSS 赛车背景（无图片） ========== */
  body {
    background-color: #0a0a0c;
    background-image:
      /* 中央红色氛围光 */
      radial-gradient(ellipse 60% 45% at 50% 42%, rgba(225,6,0,0.12) 0%, rgba(225,6,0,0.03) 50%, rgba(225,6,0,0) 75%),
      /* 碳纤维方格（可视化拉满：白色 15%） */
      repeating-conic-gradient(rgba(255,255,255,0.15) 0% 25%, rgba(255,255,255,0) 0% 50%),
      /* 碳纤维双向斜纹（9%） */
      repeating-linear-gradient(45deg, rgba(255,255,255,0.09) 0 2px, rgba(255,255,255,0) 2px 4px),
      repeating-linear-gradient(-45deg, rgba(255,255,255,0.09) 0 2px, rgba(255,255,255,0) 2px 4px),
      /* 横向速度线（6%） */
      repeating-linear-gradient(90deg, rgba(255,255,255,0) 0 46px, rgba(255,255,255,0.06) 46px 48px, rgba(255,255,255,0) 48px 90px),
      /* 底部暗角 */
      linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%);
    background-size: 100% 100%, 24px 24px, 4px 4px, 4px 4px, 100% 100%, 100% 100%;
    background-position: center, 0 0, 0 0, 0 0, 0 0, 0 0;
    background-attachment: fixed;
  }

  /* ========== 官方 F1 logo 水印（内联 SVG，染红 + 辉光呼吸 + 溅射） ========== */
  #racing-watermark {
    position: fixed; top: 50%;
    transform: translate(-50%, -50%);
    text-align: center; pointer-events: none; z-index: 9998;
  }
  /* 全屏光源：跟随水印位置，呼吸时把周围碳纤维照亮（与 racingF1Glow 同周期） */
  #racing-light {
    position: fixed;
    left: 50%; top: 50%;
    transform: translate(-50%, -50%);
    width: 130vw; height: 130vw;
    background: radial-gradient(circle,
      rgba(255, 120, 50, 0.10) 0%,
      rgba(225, 6, 0, 0.05) 30%,
      rgba(225, 6, 0, 0) 62%);
    mix-blend-mode: screen;
    pointer-events: none;
    z-index: 9997;
    animation: racingLight 2.8s ease-in-out infinite;
  }
  @keyframes racingLight {
    0%, 100% { opacity: 0.18; }
    50%      { opacity: 0.6; }
  }
  #racing-watermark .rw-logo {
    position: relative;
    display: inline-block;
    animation: racingF1Glow 2.8s ease-in-out infinite;
  }
  /* 光晕：logo 亮起时把周围碳纤维照亮（与呼吸动画同步） */
  #racing-watermark .rw-halo {
    position: absolute;
    left: 50%; top: 50%;
    width: 180%; aspect-ratio: 1;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle,
      rgba(225, 6, 0, 0.42) 0%,
      rgba(225, 6, 0, 0.12) 36%,
      rgba(225, 6, 0, 0.03) 55%,
      rgba(225, 6, 0, 0) 70%);
    pointer-events: none;
    z-index: 0;
    animation: racingHalo 2.8s ease-in-out infinite;
  }
  #racing-watermark .rw-logo svg {
    display: block;
    position: relative;
    z-index: 1;
    width: 46vw; max-width: 720px;
    height: auto;
    fill: #e10600;
  }
  @keyframes racingHalo {
    0%, 100% { opacity: 0.10; transform: translate(-50%, -50%) scale(0.94); }
    50%      { opacity: 0.55; transform: translate(-50%, -50%) scale(1.10); }
  }
  @keyframes racingF1Glow {
    0%, 100% {
      opacity: 0.34;
      filter: drop-shadow(0 0 8px rgba(225,6,0,0.6)) drop-shadow(0 0 34px rgba(225,6,0,0.22));
    }
    50% {
      opacity: 0.60;
      filter: drop-shadow(0 0 18px rgba(225,6,0,0.9)) drop-shadow(0 0 70px rgba(255,80,20,0.45)) hue-rotate(10deg);
    }
  }

  /* ========== 主队选择：发送按钮变队标 ========== */
  button[aria-label="发送消息"], button[aria-label="Send message"] {
    position: relative; overflow: hidden;
  }
  .rw-team-logo {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 72%; height: 72%;
    object-fit: contain;
    pointer-events: none;
    z-index: 2;
  }
  .rw-team-picker { position: relative; flex: none; display: inline-flex; align-self: center; margin-right: 6px; }
  .rw-team-trigger {
    height: 36px; width: 36px; padding: 0;
    border: 1px solid var(--dsw-alias-border-l2);
    border-radius: 50%;
    background: var(--dsw-alias-bg-module-platform);
    color: var(--dsw-alias-label-secondary);
    font-size: 15px; cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .rw-team-trigger:hover { background: var(--dsw-alias-interactive-bg-hover); }
  .rw-team-menu {
    position: absolute; bottom: calc(100% + 8px); right: 0;
    width: 230px; max-height: 330px; overflow-y: auto;
    background: var(--dsw-alias-bg-overlay);
    border: 1px solid var(--dsw-alias-border-l2);
    border-radius: 12px; padding: 6px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
    z-index: 9999;
    display: flex; flex-direction: column; gap: 2px;
  }
  .rw-team-menu[hidden] { display: none; }
  .rw-team-item {
    display: flex; align-items: center; gap: 10px;
    padding: 7px 10px; border: none; background: transparent;
    color: var(--dsw-alias-label-primary);
    font-size: 13px; cursor: pointer; border-radius: 8px; text-align: left;
  }
  .rw-team-item:hover { background: var(--dsw-alias-interactive-bg-hover); }
  .rw-team-item img { width: 36px; height: auto; flex: none; }

  /* ========== 其余细节 ========== */
  ::selection { background: rgba(225, 6, 0, 0.55); color: #fff; }
  *:focus-visible { outline-color: #e10600 !important; }
  ::-webkit-scrollbar-thumb { background: #3a3a42; }
  ::-webkit-scrollbar-thumb:hover { background: #e10600; }
  /* 顶部赛车条纹 */
  body::before {
    content: ""; position: fixed; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, #e10600 0%, #e10600 60%, #f4f4f6 60%, #f4f4f6 66%, #0a0a0c 66%);
    z-index: 9999; pointer-events: none;
  }
`;

    const name = "dsh-racing-theme";
    const inject = ["theme"];

    function apply(ctx) {
      ctx.effect(() => {
        // 基底固定为暗色（内置值，可持久化、无 adopt 竞态）
        try { ctx.theme.setTheme("dark"); } catch { /* 已处于暗色则忽略 */ }
        // token 覆盖层：不碰 preference，adopt 回滚不影响
        const dispose = ctx.theme.overrideTokens("dsh-racing-theme", RACING_TOKENS);
        const tag = document.createElement("style");
        tag.dataset.plugin = "dsh-racing-theme";
        tag.textContent = RACING_CSS;
        document.head.appendChild(tag);
                // —— CSS 绘制的 F1 标志水印（无图片，纯代码） ——
        const wm = document.createElement("div");
        wm.id = "racing-watermark";
        const F1_SVG = '<svg width="512" height="512" viewBox="0 55 164 50" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"> <g transform="matrix(1,0,0,1,-0.395691,60.9992)"> <path d="M23.955,41.374L42.027,23.84L42.023,23.84C49.145,16.935 52.036,15.886 65.618,15.886L119.784,15.886L135.37,0.628L63.563,0.628C45.385,0.628 40.245,2.359 29.583,12.911L0.903,41.374L23.955,41.374ZM65.944,18.323L117.459,18.323L103.172,32.609L66.212,32.609C59.438,32.609 57.94,32.928 54.578,36.289L49.493,41.374L28.118,41.374L43.92,25.572C50.126,19.371 52.265,18.323 65.944,18.323ZM163.888,0.628L123.031,41.374L97.765,41.374L138.511,0.628L163.888,0.628ZM136.987,40.084C137.836,40.945 138.906,41.374 140.192,41.374C141.478,41.374 142.534,40.945 143.371,40.092C144.207,39.239 144.623,38.182 144.623,36.926C144.623,35.669 144.202,34.613 143.362,33.751C142.522,32.889 141.461,32.461 140.175,32.461C138.889,32.461 137.823,32.889 136.979,33.742C136.134,34.596 135.709,35.652 135.709,36.909C135.709,38.165 136.134,39.222 136.987,40.084ZM137.518,34.256C138.231,33.526 139.113,33.161 140.166,33.161C141.223,33.161 142.106,33.526 142.815,34.256C143.523,34.986 143.88,35.873 143.88,36.917C143.88,37.961 143.523,38.844 142.815,39.57C142.102,40.296 141.223,40.657 140.166,40.657C139.109,40.657 138.226,40.292 137.518,39.562C136.809,38.832 136.452,37.949 136.452,36.909C136.452,35.869 136.809,34.986 137.518,34.256ZM139.296,39.4L139.296,37.652L139.3,37.656L140.298,37.656L141.142,39.405L142.174,39.405L141.244,37.528C141.558,37.384 141.779,37.197 141.911,36.964C142.042,36.731 142.106,36.374 142.106,35.894C142.106,35.415 141.944,35.054 141.622,34.816C141.299,34.574 140.815,34.456 140.175,34.456L138.316,34.456L138.316,39.4L139.296,39.4ZM139.279,36.883L139.279,35.219L140.09,35.219C140.79,35.219 141.138,35.495 141.138,36.051C141.138,36.344 141.07,36.557 140.934,36.688C140.803,36.82 140.582,36.883 140.276,36.883L139.279,36.883Z" style="fill:rgb(225,6,0);"/> </g> </svg>';
        wm.innerHTML =
          '<div class="rw-logo"><span class="rw-halo"></span>' + F1_SVG + '</div>';
        // 居中偏移：宽侧栏 280px → 主内容区中心 = 视口中心 + 140px；
        // 折叠时侧栏约 36px → 偏移 18px。MutationObserver 跟随折叠状态。
        const light = document.createElement("div");
        light.id = "racing-light";
        document.body.appendChild(light);
        const centerWatermark = () => {
          const collapsed = !!document.querySelector("[data-sidebar-collapsed]");
          const offset = collapsed ? 18 : 140;
          wm.style.left = "calc(50% + " + offset + "px)";
          light.style.left = wm.style.left;
        };
        centerWatermark();
        // 布局容器自己用 bg-base 画了一层底色，盖住 body 的碳纤维。
        // 按"grid 布局 + 背景色 = 当前 bg-base"特征定位它，把底色改透明。
        const normColor = (c) => c.replace(/\s+/g, "");
        const clearFrameBg = () => {
          const token = normColor(
            getComputedStyle(document.body).getPropertyValue("--dsw-alias-bg-base")
          );
          document.querySelectorAll("#root div").forEach((el) => {
            const cs = getComputedStyle(el);
            if (
              cs.display === "grid" &&
              el.clientWidth > 400 &&
              normColor(cs.backgroundColor) === token
            ) {
              el.style.backgroundColor = "transparent";
            }
          });
        };
        clearFrameBg();
        const obs = new MutationObserver(() => {
          centerWatermark();
          clearFrameBg();
        });
        obs.observe(document.body, {
          attributes: true,
          subtree: true,
          attributeFilter: ["data-sidebar-collapsed", "data-details-collapsed"],
        });
        // 布局可能延迟挂载，兜底重试几次
        let tries = 0;
        const retry = setInterval(() => {
          clearFrameBg();
          if (++tries > 10) clearInterval(retry);
        }, 800);
        document.body.appendChild(wm);

        // ===== 主队选择：发送按钮变队标 =====
        const TEAMS = [
  { id: "alpine", name: "Alpine", color: "#00A1E8", logo: "https://media.formula1.com/image/upload/c_lfill,w_256/q_auto/v1740000001/common/f1/2026/alpine/2026alpinelogowhite.webp" },
  { id: "astonmartin", name: "Aston Martin", color: "#006F62", logo: "https://media.formula1.com/image/upload/c_lfill,w_256/q_auto/v1740000001/common/f1/2026/astonmartin/2026astonmartinlogowhite.webp" },
  { id: "audi", name: "Audi", color: "#FF2D00", logo: "https://media.formula1.com/image/upload/c_lfill,w_256/q_auto/v1740000001/common/f1/2026/audi/2026audilogowhite.webp" },
  { id: "cadillac", name: "Cadillac", color: "#58585B", logo: "https://media.formula1.com/image/upload/c_lfill,w_256/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaclogowhite.webp" },
  { id: "ferrari", name: "Ferrari", color: "#E8002D", logo: "https://media.formula1.com/image/upload/c_lfill,w_256/q_auto/v1740000001/common/f1/2026/ferrari/2026ferrarilogowhite.webp" },
  { id: "haas", name: "Haas", color: "#CF1B2B", logo: "https://media.formula1.com/image/upload/c_lfill,w_256/q_auto/v1740000001/common/f1/2026/haasf1team/2026haasf1teamlogowhite.webp" },
  { id: "mclaren", name: "McLaren", color: "#FF8000", logo: "https://media.formula1.com/image/upload/c_lfill,w_256/q_auto/v1740000001/common/f1/2026/mclaren/2026mclarenlogowhite.webp" },
  { id: "mercedes", name: "Mercedes", color: "#27F4D2", logo: "https://media.formula1.com/image/upload/c_lfill,w_256/q_auto/v1740000001/common/f1/2026/mercedes/2026mercedeslogowhite.webp" },
  { id: "racingbulls", name: "Racing Bulls", color: "#6692FF", logo: "https://media.formula1.com/image/upload/c_lfill,w_256/q_auto/v1740000001/common/f1/2026/racingbulls/2026racingbullslogowhite.webp" },
  { id: "redbull", name: "Red Bull Racing", color: "#0052B4", logo: "https://media.formula1.com/image/upload/c_lfill,w_256/q_auto/v1740000001/common/f1/2026/redbullracing/2026redbullracinglogowhite.webp" },
  { id: "williams", name: "Williams", color: "#1868DB", logo: "https://media.formula1.com/image/upload/c_lfill,w_256/q_auto/v1740000001/common/f1/2026/williams/2026williamslogowhite.webp" },
];
        const TEAM_KEY = "dsh-racing-team";
        const primarySel = 'button[aria-label="发送消息"], button[aria-label="Send message"]';
        const stopRe = /停止生成|Stop generating/;

        const applyTeamLogo = () => {
          const btn = document.querySelector(primarySel);
          if (!btn) return;
          if (stopRe.test(btn.getAttribute("aria-label") || "")) return; // 运行中不动
          const teamId = localStorage.getItem(TEAM_KEY);
          const svg = btn.querySelector("svg");
          const img = btn.querySelector(".rw-team-logo");
          if (!teamId) {
            if (img) img.remove();
            if (svg) svg.style.display = "";
            btn.style.backgroundColor = "";
            return;
          }
          const team = TEAMS.find((t) => t.id === teamId);
          if (!team) return;
          btn.style.backgroundColor = team.color;
          if (!img) {
            const el = document.createElement("img");
            el.className = "rw-team-logo";
            el.alt = team.name;
            btn.prepend(el);
            el.src = team.logo;
          } else {
            img.src = team.logo;
          }
          if (svg) svg.style.display = "none";
        };

        const buildTeamPicker = () => {
          const btn = document.querySelector(primarySel);
          if (!btn || btn.parentElement.querySelector(".rw-team-picker")) return;
          const wrap = document.createElement("div");
          wrap.className = "rw-team-picker";
          const trigger = document.createElement("button");
          trigger.type = "button";
          trigger.className = "rw-team-trigger";
          trigger.title = "选择主队";
          trigger.textContent = "🏁";
          const menu = document.createElement("div");
          menu.className = "rw-team-menu";
          menu.hidden = true;
          TEAMS.forEach((t) => {
            const item = document.createElement("button");
            item.type = "button";
            item.className = "rw-team-item";
            item.innerHTML = '<img src="' + t.logo + '" alt="" loading="lazy"><span>' + t.name + "</span>";
            item.onclick = () => {
              localStorage.setItem(TEAM_KEY, t.id);
              applyTeamLogo();
              menu.hidden = true;
            };
            menu.appendChild(item);
          });
          const clear = document.createElement("button");
          clear.type = "button";
          clear.className = "rw-team-item";
          clear.innerHTML = "<span>默认（无主队）</span>";
          clear.onclick = () => {
            localStorage.removeItem(TEAM_KEY);
            applyTeamLogo();
            menu.hidden = true;
          };
          menu.appendChild(clear);
          trigger.onclick = (e) => {
            e.stopPropagation();
            menu.hidden = !menu.hidden;
          };
          document.addEventListener("click", () => { menu.hidden = true; });
          wrap.appendChild(trigger);
          wrap.appendChild(menu);
          btn.parentElement.insertBefore(wrap, btn);
          // 动态同步发送键尺寸，保证视觉对齐
          const h = btn.offsetHeight || 36;
          trigger.style.height = h + "px";
          trigger.style.width = h + "px";
          applyTeamLogo();
        };

        // composer 挂载轮询 + React 重渲染时重新应用队标
        let teamTries = 0;
        let btnObs = null;
        const teamTimer = setInterval(() => {
          const btn = document.querySelector(primarySel);
          if (btn) {
            buildTeamPicker();
            applyTeamLogo();
            if (!btnObs) {
              btnObs = new MutationObserver(applyTeamLogo);
              btnObs.observe(btn, { childList: true, attributes: true, attributeFilter: ["aria-label"] });
            }
            if (++teamTries > 15) clearInterval(teamTimer);
          } else if (++teamTries > 15) {
            clearInterval(teamTimer);
          }
        }, 700);

        return () => {
          dispose();
          tag.remove();
          obs.disconnect();
          clearInterval(retry);
          clearInterval(teamTimer);
          if (btnObs) btnObs.disconnect();
          light.remove();
          wm.remove();
        };
      }, "dsh-racing-theme: apply racing tokens + css");
    }

    module.exports = { name, inject, apply };
    return module.exports;
  },
});
