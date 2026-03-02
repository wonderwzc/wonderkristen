document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const body = document.body;
  const HEADER_SCROLL_THRESHOLD = 60;

  const throttle = (fn, ms) => {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= ms) {
        last = now;
        fn.apply(null, args);
      }
    };
  };

  const bgMusic = document.getElementById("bg-music");
  const bgMusicToggle = document.getElementById("bg-music-toggle");
  const BG_MUSIC_MUTED_KEY = "bg-music-muted";

  if (bgMusic && bgMusicToggle) {
    if (typeof window.BG_MUSIC_BASE64 === "string" && window.BG_MUSIC_BASE64.length > 0) {
      bgMusic.src = "data:audio/mpeg;base64," + window.BG_MUSIC_BASE64;
    } else {
      bgMusic.src = "bg-music.mp3";
    }
    bgMusic.volume = 0.25;
    const stored = localStorage.getItem(BG_MUSIC_MUTED_KEY);
    const startMuted = stored !== "0";
    bgMusic.muted = startMuted;
    if (startMuted) bgMusicToggle.classList.add("is-muted"); else bgMusicToggle.classList.remove("is-muted");
    if (!startMuted) {
      bgMusic.play().catch(() => {
        bgMusic.muted = true;
        bgMusicToggle.classList.add("is-muted");
        localStorage.setItem(BG_MUSIC_MUTED_KEY, "1");
      });
    }
    bgMusicToggle.addEventListener("click", () => {
      const nextMuted = !bgMusic.muted;
      bgMusic.muted = nextMuted;
      bgMusicToggle.classList.toggle("is-muted", nextMuted);
      localStorage.setItem(BG_MUSIC_MUTED_KEY, nextMuted ? "1" : "0");
      if (!nextMuted) bgMusic.play().catch(() => {});
    });
  }

  const updateHeaderScroll = throttle(() => {
    if (!header) return;
    if (window.scrollY > HEADER_SCROLL_THRESHOLD) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }, 80);
  window.addEventListener("scroll", updateHeaderScroll, { passive: true });
  updateHeaderScroll();

  const backToTopBtn = document.getElementById("back-to-top-btn");
  const goToBottomBtn = document.getElementById("go-to-bottom-btn");
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
    const heroSection = document.getElementById("hero");
    const updateBackToTopVisible = () => {
      if (!heroSection) {
        backToTopBtn.classList.add("back-to-top-btn--visible");
        backToTopBtn.removeAttribute("hidden");
        return;
      }
      const rect = heroSection.getBoundingClientRect();
      if (rect.bottom < 100) {
        backToTopBtn.classList.add("back-to-top-btn--visible");
        backToTopBtn.removeAttribute("hidden");
      } else {
        backToTopBtn.classList.remove("back-to-top-btn--visible");
        backToTopBtn.setAttribute("hidden", "");
      }
    };
    const onBackToTopTick = throttle(updateBackToTopVisible, 120);
    window.addEventListener("scroll", onBackToTopTick, { passive: true });
    window.addEventListener("resize", onBackToTopTick);
    updateBackToTopVisible();
  }
  if (goToBottomBtn) {
    goToBottomBtn.addEventListener("click", () => {
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        document.body.scrollHeight - window.innerHeight,
        0
      );
      window.scrollTo({ top: maxScroll, behavior: "smooth" });
    });
    const updateGoToBottomVisible = () => {
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        document.body.scrollHeight - window.innerHeight,
        0
      );
      const atBottom = maxScroll <= 0 || window.scrollY >= maxScroll - 80;
      if (atBottom) {
        goToBottomBtn.classList.remove("go-to-bottom-btn--visible");
        goToBottomBtn.setAttribute("hidden", "");
      } else {
        goToBottomBtn.classList.add("go-to-bottom-btn--visible");
        goToBottomBtn.removeAttribute("hidden");
      }
    };
    const onGoToBottomTick = throttle(updateGoToBottomVisible, 120);
    window.addEventListener("scroll", onGoToBottomTick, { passive: true });
    window.addEventListener("resize", onGoToBottomTick);
    updateGoToBottomVisible();
  }

  const STORAGE_THEME = "site-theme-colors";
  const THEME_ITEMS = [
    { key: "pageBg", var: "--theme-page-bg", label: "页面背景", default: "#0f172a" },
    { key: "header", var: "--theme-header", label: "顶栏", default: "#05070a" },
    { key: "headerBtn", var: "--theme-header-btn", label: "顶栏按钮", default: "#94a3b8" },
    { key: "hero", var: "--theme-hero", label: "首屏区", default: "#1e293b" },
    { key: "section", var: "--theme-section", label: "板块区域", default: "#1e293b" },
    { key: "sectionBtn", var: "--theme-section-btn", label: "板块按钮", default: "#38bdf8" },
    { key: "footer", var: "--theme-footer", label: "底栏", default: "#050d1a" },
    { key: "footerBtn", var: "--theme-footer-btn", label: "底栏按钮", default: "#94a3b8" },
    { key: "detailBtn", var: "--theme-detail-btn", label: "板块内容按钮", default: "#fbbf24" },
    { key: "star", var: "--theme-star", label: "星星特效", default: "#fef3c7" },
    { key: "galaxy", var: "--theme-galaxy", label: "银河特效", default: "#94a3b8" },
  ];
  function getTheme() {
    try {
      const raw = localStorage.getItem(STORAGE_THEME);
      if (!raw) return null;
      const o = JSON.parse(raw);
      return typeof o === "object" && o !== null ? o : null;
    } catch {
      return null;
    }
  }
  function setTheme(obj) {
    try {
      localStorage.setItem(STORAGE_THEME, JSON.stringify(obj));
    } catch (_) {}
  }
  function applyTheme(obj) {
    if (!obj || !document.documentElement) return;
    THEME_ITEMS.forEach((item) => {
      const value = obj[item.key];
      if (value) document.documentElement.style.setProperty(item.var, value);
    });
  }
  function getThemeToApply() {
    const saved = getTheme();
    const obj = {};
    THEME_ITEMS.forEach((item) => {
      obj[item.key] = (saved && saved[item.key]) || item.default;
    });
    return obj;
  }
  function renderThemeList() {
    const listEl = document.getElementById("theme-color-list");
    const resetBtn = document.getElementById("theme-reset-btn");
    if (!listEl) return;
    const theme = getThemeToApply();
    listEl.innerHTML = "";
    THEME_ITEMS.forEach((item) => {
      const row = document.createElement("div");
      row.className = "footer-theme-row";
      const label = document.createElement("label");
      label.textContent = item.label;
      const input = document.createElement("input");
      input.type = "color";
      input.value = theme[item.key] || item.default;
      input.dataset.themeKey = item.key;
      input.setAttribute("aria-label", item.label);
      input.addEventListener("input", () => {
        const next = getThemeToApply();
        next[item.key] = input.value;
        setTheme(next);
        applyTheme(next);
      });
      row.appendChild(label);
      row.appendChild(input);
      listEl.appendChild(row);
    });
    if (resetBtn) {
      resetBtn.onclick = () => {
        const defaults = {};
        THEME_ITEMS.forEach((item) => { defaults[item.key] = item.default; });
        setTheme(defaults);
        applyTheme(defaults);
        renderThemeList();
      };
    }
  }
  applyTheme(getThemeToApply());
  renderThemeList();

  (function initGalaxyBars() {
    const headerGalaxy = document.getElementById("header-galaxy-stars");
    const footerGalaxy = document.getElementById("footer-galaxy-stars");

    const addNebulaLayers = (parent) => {
      if (!parent) return;
      const layer1 = document.createElement("div");
      layer1.className = "galaxy-nebula-layer";
      layer1.setAttribute("aria-hidden", "true");
      const layer2 = document.createElement("div");
      layer2.className = "galaxy-nebula-layer-2";
      layer2.setAttribute("aria-hidden", "true");
      parent.appendChild(layer1);
      parent.appendChild(layer2);
    };

    const createFlowStrip = (parent, opts) => {
      if (!parent) return;
      addNebulaLayers(parent);
      const inner = document.createElement("div");
      inner.className = "galaxy-flow-inner";
      inner.setAttribute("aria-hidden", "true");
      const bandTop = opts.bandTop ?? 10;
      const bandBottom = opts.bandBottom ?? 90;
      const starCount = opts.starCount ?? 120;
      const planetCount = opts.planetCount ?? 14;
      const nebulaCount = opts.nebulaCount ?? 8;
      const brightStarRatio = opts.brightStarRatio ?? 0.2;

      const addStar = (leftPct, topPct, isBright) => {
        const el = document.createElement("span");
        el.className = "galaxy-dot" + (isBright ? " galaxy-dot--bright" : "");
        el.style.left = leftPct + "%";
        el.style.top = topPct + "%";
        inner.appendChild(el);
      };
      const addPlanet = (leftPct, topPct) => {
        const el = document.createElement("span");
        el.className = "galaxy-planet";
        el.style.left = leftPct + "%";
        el.style.top = topPct + "%";
        const size = 2.5 + Math.random() * 4;
        el.style.width = el.style.height = size + "px";
        inner.appendChild(el);
      };
      const addNebula = (leftPct, topPct, sizePx, warm) => {
        const el = document.createElement("span");
        el.className = "galaxy-nebula" + (warm ? " galaxy-nebula--warm" : "");
        el.style.left = leftPct + "%";
        el.style.top = topPct + "%";
        el.style.width = el.style.height = sizePx + "px";
        inner.appendChild(el);
      };

      for (let i = 0; i < starCount; i++) {
        const left = Math.random() * 50;
        const top = bandTop + Math.random() * (bandBottom - bandTop);
        const isBright = Math.random() < brightStarRatio;
        addStar(left, top, isBright);
        addStar(left + 50, top, isBright);
      }
      for (let i = 0; i < planetCount; i++) {
        const left = Math.random() * 50;
        const top = bandTop + Math.random() * (bandBottom - bandTop);
        addPlanet(left, top);
        addPlanet(left + 50, top);
      }
      for (let i = 0; i < nebulaCount; i++) {
        const left = Math.random() * 50;
        const top = bandTop + Math.random() * (bandBottom - bandTop);
        const size = 28 + Math.random() * 36;
        const warm = Math.random() < 0.35;
        addNebula(left, top, size, warm);
        addNebula(left + 50, top, size, warm);
      }
      parent.appendChild(inner);
    };

    createFlowStrip(headerGalaxy, { bandTop: 12, bandBottom: 88, starCount: 120, planetCount: 14, nebulaCount: 8, brightStarRatio: 0.2, reverse: false });
    createFlowStrip(footerGalaxy, { bandTop: 8, bandBottom: 92, starCount: 115, planetCount: 16, nebulaCount: 9, brightStarRatio: 0.18, reverse: true });
  })();

  (function initStarfield() {
    const container = document.getElementById("starfield-overlay");
    if (!container) return;
    const count = 100;
    for (let i = 0; i < count; i++) {
      const star = document.createElement("span");
      let className = "starfield-star";
      const kind = Math.random();
      if (kind < 0.28) className += " starfield-star--cross";
      else if (kind < 0.56) className += " starfield-star--glow";
      star.className = className;
      const size = 1.2 + Math.random() * 2.2;
      star.style.width = star.style.height = size + "px";
      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 100 + "%";
      container.appendChild(star);
    }
  })();

  const themeTrigger = document.getElementById("theme-trigger-btn");
  const themeWrap = document.querySelector(".footer-theme-wrap");
  const themePanel = document.getElementById("theme-panel");
  if (themeTrigger && themeWrap && themePanel) {
    themeTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = themeWrap.classList.toggle("is-open");
      themeTrigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      themePanel.hidden = !isOpen;
      themePanel.setAttribute("aria-hidden", isOpen ? "false" : "true");
      document.body.classList.toggle("theme-panel-open", isOpen);
    });
    document.addEventListener("click", (e) => {
      if (!themeWrap.classList.contains("is-open")) return;
      if (themeWrap.contains(e.target) || themeTrigger.contains(e.target)) return;
      themeWrap.classList.remove("is-open");
      themeTrigger.setAttribute("aria-expanded", "false");
      themePanel.hidden = true;
      themePanel.setAttribute("aria-hidden", "true");
      document.body.classList.remove("theme-panel-open");
    });
    themePanel.addEventListener("click", (e) => e.stopPropagation());
  }

  const navLinks = Array.from(document.querySelectorAll(".site-header nav a.nav-item"));
  const sections = navLinks
    .map((link) => {
      const hash = link.getAttribute("href");
      if (!hash || !hash.startsWith("#")) return null;
      const el = document.querySelector(hash);
      return el ? { link, el } : null;
    })
    .filter(Boolean);

  const LANG_KEY = "site-lang";
  const getLang = () => localStorage.getItem(LANG_KEY) || "zh";
  const setLang = (lang) => localStorage.setItem(LANG_KEY, lang);

  const I18N = {
    zh: {
      "header.tag": "Rhine Lab // Director",
      "header.name": "克丽斯腾·莱特",
      "header.subtitle": "莱茵生命总辖",
      "header.editTag": "上方文字",
      "header.editMainName": "主名字",
      "header.editSubtitle": "副标题",
      "header.cancel": "取消",
      "header.save": "保存",
      "nav.hero": "首屏",
      "nav.about": "角色简介",
      "nav.story": "背景故事",
      "nav.gallery": "立绘插图",
      "nav.voice": "文本台词",
      "nav.fanworks": "同人创作",
      "nav.moments": "随笔记录",
      "nav.books": "书籍",
      "nav.links": "相关链接",
      "section.hero": "首屏",
      "section.hero.desc": "这里将展示首屏区域内容的图片主视觉效果。",
      "hero.customArea": "自定义本区域",
      "hero.changeBg": "更换页面背景",
      "hero.bgTitle": "更换页面背景",
      "hero.bgDesc": "上传图片可替换整站背景图，与首屏、板块的毛玻璃效果搭配使用。",
      "hero.bgUpload": "选择背景图",
      "hero.bgRestore": "恢复默认背景",
      "hero.changeFavicon": "更换 Logo",
      "hero.faviconRestore": "恢复默认 Logo",
      "hero.useAsDisplay": "立即使用为首屏图片",
      "hero.editDesc": "更改说明",
      "hero.delete": "删除",
      "section.about": "角色简介",
      "section.about.desc": "在这里填写出身、种族、所属、身份等基础信息。",
      "section.about.basic": "基础信息",
      "section.about.name": "名字",
      "section.about.relations": "人物关系",
      "section.about.relations.desc": "在此填写与克丽斯腾相关的角色关系、所属组织与重要人物。",
      "section.about.relations.blockDesc": "关系板块说明（可自定义）",
      "section.about.relations.people": "人物列表",
      "section.about.relations.addPerson": "添加人物",
      "section.about.relations.addLink": "添加关系",
      "section.about.relations.personName": "人物名称",
      "section.about.relations.uploadAvatar": "上传头像",
      "section.about.relations.from": "来自",
      "section.about.relations.to": "至",
      "section.about.relations.relationLabel": "关系说明",
      "section.story": "背景故事",
      "section.story.desc": "可按时间线或主题分段展示：早期经历、莱茵生命、总辖之路、孤星事件等。",
      "section.gallery": "立绘 / 插图",
      "section.gallery.desc": "图片画廊占位：未来可替换为立绘、皮肤、CG 等。",
      "section.voice": "文本台词",
      "section.voice.desc": "此处展示角色相关的文本台词内容，可按场景或触发条件分类整理。",
      "section.fanworks": "同人创作",
      "section.moments": "随笔记录",
      "section.books": "书籍",
      "section.books.desc": "Olib 电子书：搜索、阅读与收藏电子书，支持多线路与在线阅读。",
      "books.openInNew": "在新页面打开 Olib",
      "books.hint": "需通过已部署网址访问（如 Vercel），勿直接打开本地 HTML 文件。",
      "section.links": "相关链接",
      "moments.overview": "记录每日文本灵感，类似说说动态。可写内容、加表情，支持点赞与评论。",
      "moments.publish": "发一条说说",
      "moments.date": "日期",
      "moments.dateTime": "日期时间",
      "moments.uploadImage": "上传图片",
      "moments.content": "内容",
      "moments.contentPh": "写下此刻灵感…",
      "moments.emoji": "表情",
      "moments.publishBtn": "发布",
      "moments.like": "赞",
      "moments.comment": "评论",
      "moments.addComment": "写评论…",
      "moments.sendComment": "发送",
      "links.bilibili": "孤星先导PV",
      "links.rhineComic": "莱茵生命漫画",
      "links.official": "官方档案 / 活动页",
      "form.workTitle": "作品标题",
      "form.creatorName": "创作者名称 / ID",
      "form.workLink": "创作者个人链接",
      "form.workDesc": "作品简介",
      "form.file": "上传文件",
      "form.submit": "提交投稿",
      "form.ph.workTitle": "例如：孤星下的总辖",
      "form.ph.creatorName": "例如：ExampleArtist",
      "form.ph.workLink": "例如：https://space.bilibili.com/xxxx",
      "form.ph.workDesc": "可以简单介绍作品内容、氛围或创作灵感。",
      "fanworks.intro": "这里用于收录与展示其他创作者对克丽斯腾的二创作品，并标注创作者信息与个人链接。",
      "fanworks.howto": "如何投稿（二创展示）",
      "fanworks.li1": "准备好你的作品（插画 / 漫画 / 短文 / 音声等），并确保为非商业用途。",
      "fanworks.li2": "注明作品标题、创作者名称（或 ID）、作品类型，以及你希望展示的个人链接（如 B 站 / 微博）。",
      "fanworks.li3": "通过站长指定的方式提交（例如邮件、表单或仓库 PR），由站长人工整理后添加到下方列表。",
      "fanworks.note": "※ 当前展示区仅示例，实际作品由站长审核后添加。",
      "fanworks.display": "同人创作展示区",
      "fanworks.displayDesc": "站长精选收录的插画、短文、音声等作品会在这里集中展示。",
      "fanworks.overview": "这里用于收录与展示其他创作者对克丽斯腾的二创作品。点击进入可投稿、浏览展示区，或按需装扮成自己的站点。",
      "detail.back": "← 返回总览",
      "detail.title": "板块详情",
      "detail.subtitle": "此处为该板块的完整内容区域。",
      "detail.placeholder": "点击上方任意板块进入后，可在此展示该板块的详细内容。",
      "detail.uploadHint": "本板块可在此展示/编辑内容；可直接在页面上提交文字、链接、图片，装扮成属于自己的站点，无需改代码。",
      "detail.avatar": "头像",
      "detail.avatarDisplayStyle": "头像显示样式",
      "detail.avatarShape": "形状",
      "detail.avatarShape.circle": "圆形",
      "detail.avatarShape.rounded": "圆角方形",
      "detail.avatarShape.square": "方形",
      "detail.avatarFit": "显示方式",
      "detail.avatarFit.cover": "覆盖填充",
      "detail.avatarFit.contain": "完整显示",
      "detail.avatarPosition": "显示位置",
      "detail.avatarPosition.center": "居中",
      "detail.avatarPosition.top": "顶部",
      "detail.avatarPosition.bottom": "底部",
      "detail.avatarPosition.left": "左侧",
      "detail.avatarPosition.right": "右侧",
      "detail.mySubmissions": "我的投稿展示区",
      "detail.displayHint": "下方展示你在本板块已提交的内容，可在此整理与装扮。",
      "detail.filterByDate": "按日期查找",
      "detail.pickDate": "选择日期",
      "detail.pickMonth": "选择月份（按当月）",
      "detail.filterByDateHint": "各板块提交时会记录时间，可按日期或当月筛选当前板块内容。",
      "detail.filterApplyDay": "查找当天",
      "detail.filterApplyMonth": "查找当月",
      "detail.filterClear": "清除筛选",
      "detail.importExport": "一键导入/导出",
      "detail.importFromClipboard": "从剪贴板导入",
      "detail.exportData": "导出当前数据",
      "detail.exportPdf": "导出为 PDF",
      "detail.exportPdfA4": "导出为 PDF（多页 A4）",
      "detail.exportPdfLong": "导出为 PDF（单页长图）",
      "detail.importExportHint": "复制好内容后点击「从剪贴板导入」即可导入；导出将生成当前站点信息的 PDF 文件。",
      "detail.importSuccess": "导入成功",
      "detail.importFail": "导入失败",
      "detail.exportSuccess": "已导出",
      "theme.starsToggle": "星星特效",
      "theme.starsOff": "关闭",
      "theme.starsOn": "开启",
      footer: "自建站 · 非商用 · 所有版权归原著作权人所有",
    },
    en: {
      "header.tag": "Rhine Lab // Director",
      "header.name": "Kristen Wright",
      "header.subtitle": "Rhine Lab Director",
      "header.editTag": "Tag line",
      "header.editMainName": "Name",
      "header.editSubtitle": "Subtitle",
      "header.cancel": "Cancel",
      "header.save": "Save",
      "nav.hero": "Hero",
      "nav.about": "Profile",
      "nav.story": "Story",
      "nav.gallery": "Gallery",
      "nav.voice": "Lines",
      "nav.fanworks": "Fanworks",
      "nav.moments": "Moments",
      "nav.books": "Books",
      "nav.links": "Links",
      "section.hero": "Hero",
      "section.hero.desc": "Here, the main visual images of the hero area will be displayed.",
      "hero.customArea": "Customize This Area",
      "hero.changeBg": "Change Page Background",
      "hero.bgTitle": "Change Page Background",
      "hero.bgDesc": "Upload an image to replace the site background; works with the glass effect.",
      "hero.bgUpload": "Choose Background Image",
      "hero.bgRestore": "Restore Default Background",
      "hero.changeFavicon": "Change Logo",
      "hero.faviconRestore": "Restore Default Logo",
      "hero.useAsDisplay": "Use as hero image",
      "hero.editDesc": "Edit description",
      "hero.delete": "Delete",
      "section.about": "Profile",
      "section.about.desc": "Fill in origin, race, affiliation, identity and other basic info here.",
      "section.about.basic": "Basic Info",
      "section.about.name": "Name",
      "section.about.relations": "Relations",
      "section.about.relations.desc": "Character relationships, affiliations and key figures related to Kristen.",
      "section.about.relations.blockDesc": "Block description (editable)",
      "section.about.relations.people": "Characters",
      "section.about.relations.addPerson": "Add character",
      "section.about.relations.addLink": "Add relation",
      "section.about.relations.personName": "Name",
      "section.about.relations.uploadAvatar": "Upload avatar",
      "section.about.relations.from": "From",
      "section.about.relations.to": "To",
      "section.about.relations.relationLabel": "Relationship",
      "section.story": "Story",
      "section.story.desc": "Display by timeline or theme: early life, Rhine Lab, path to Director, Lone Trail, etc.",
      "section.gallery": "Gallery / Art",
      "section.gallery.desc": "Image gallery placeholder for illustrations, skins, CGs, etc.",
      "section.voice": "Lines",
      "section.voice.desc": "Character text lines; organize by scenario or trigger.",
      "section.fanworks": "Fanworks",
      "section.moments": "Moments",
      "section.books": "Books",
      "section.books.desc": "Olib ebooks: search, read and collect ebooks, with multi-line support and online reading.",
      "books.openInNew": "Open Olib in new page",
      "books.hint": "Use a deployed URL (e.g. Vercel); do not open local HTML files directly.",
      "section.links": "Links",
      "moments.overview": "Daily text inspirations like a feed. Add content, emoji, with like and comment.",
      "moments.publish": "Post a moment",
      "moments.date": "Date",
      "moments.dateTime": "Date & time",
      "moments.uploadImage": "Upload image",
      "moments.content": "Content",
      "moments.contentPh": "Write your thought…",
      "moments.emoji": "Emoji",
      "moments.publishBtn": "Publish",
      "moments.like": "Like",
      "moments.comment": "Comment",
      "moments.addComment": "Add a comment…",
      "moments.sendComment": "Send",
      "links.bilibili": "Bilibili Profile",
      "links.rhineComic": "Rhine Lab Comic",
      "links.official": "Official Archive / Events",
      "form.workTitle": "Work Title",
      "form.creatorName": "Creator Name / ID",
      "form.workLink": "Creator Link",
      "form.workDesc": "Description",
      "form.file": "Upload File",
      "form.submit": "Submit",
      "form.ph.workTitle": "e.g. Director Under Lone Star",
      "form.ph.creatorName": "e.g. ExampleArtist",
      "form.ph.workLink": "e.g. https://space.bilibili.com/xxxx",
      "form.ph.workDesc": "Brief intro to the work, mood or inspiration.",
      "fanworks.intro": "Fan-created works for Kristen are collected and shown here with creator info and links.",
      "fanworks.howto": "How to Submit (Fanworks)",
      "fanworks.li1": "Prepare your work (art / comic / fic / audio, etc.) and ensure it is non-commercial.",
      "fanworks.li2": "Provide work title, creator name (or ID), type, and the personal link you want to show (e.g. Bilibili / Weibo).",
      "fanworks.li3": "Submit via the method specified by the site owner (e.g. email, form, or repo PR); entries are added after review.",
      "fanworks.note": "Display area is for demo; entries are added after review.",
      "fanworks.display": "Fanworks Gallery",
      "fanworks.displayDesc": "Curated fan art, fic, audio, etc. are displayed here.",
      "fanworks.overview": "Fan-created works for Kristen are collected here. Enter to submit, browse the gallery, or customize this space as your own.",
      "detail.back": "← Back to Overview",
      "detail.title": "Section Detail",
      "detail.subtitle": "Full content for this section is shown here.",
      "detail.placeholder": "Click any section above to open its detail view here.",
      "detail.uploadHint": "This section can display/edit content here; submit text, links, and images directly on the page to make it your own—no code required.",
      "detail.avatar": "Avatar",
      "detail.avatarDisplayStyle": "Avatar display style",
      "detail.avatarShape": "Shape",
      "detail.avatarShape.circle": "Circle",
      "detail.avatarShape.rounded": "Rounded square",
      "detail.avatarShape.square": "Square",
      "detail.avatarFit": "Fit",
      "detail.avatarFit.cover": "Cover",
      "detail.avatarFit.contain": "Contain",
      "detail.avatarPosition": "Position",
      "detail.avatarPosition.center": "Center",
      "detail.avatarPosition.top": "Top",
      "detail.avatarPosition.bottom": "Bottom",
      "detail.avatarPosition.left": "Left",
      "detail.avatarPosition.right": "Right",
      "detail.mySubmissions": "My Submissions",
      "detail.displayHint": "Your submitted content for this section appears below. Organize and customize here.",
      "detail.filterByDate": "Find by date",
      "detail.pickDate": "Pick date",
      "detail.pickMonth": "Pick month",
      "detail.filterByDateHint": "Submissions are dated; filter current section by day or month.",
      "detail.filterApplyDay": "Find day",
      "detail.filterApplyMonth": "Find month",
      "detail.filterClear": "Clear filter",
      "detail.importExport": "Import / Export",
      "detail.importFromClipboard": "Import from clipboard",
      "detail.exportData": "Export data",
      "detail.exportPdf": "Export as PDF",
      "detail.exportPdfA4": "Export as PDF (multi-page A4)",
      "detail.exportPdfLong": "Export as PDF (single long page)",
      "detail.importExportHint": "Paste your content, then click the import button; export generates a PDF of the current site.",
      "detail.importSuccess": "Import successful",
      "detail.importFail": "Import failed",
      "detail.exportSuccess": "Exported",
      "theme.starsToggle": "Star effect",
      "theme.starsOff": "Off",
      "theme.starsOn": "On",
      footer: "Fan site · Non-commercial · All rights to original authors.",
    },
  };

  const applyLangToPage = (lang) => {
    const t = I18N[lang] || I18N.zh;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (t[key] != null) el.textContent = t[key];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (t[key] != null) el.placeholder = t[key];
    });
    const starsBtn = document.getElementById("theme-stars-toggle-btn");
    if (starsBtn) {
      const disabled = localStorage.getItem("site-stars-disabled") === "1";
      starsBtn.textContent = disabled ? (t["theme.starsOn"] || "开启") : (t["theme.starsOff"] || "关闭");
      starsBtn.setAttribute("aria-pressed", disabled ? "true" : "false");
    }
  };

  const CUSTOM_HEADER_TAG_KEY = "custom-header-tag";
  const CUSTOM_HEADER_NAME_KEY = "custom-header-name";
  const CUSTOM_HEADER_SUBTITLE_KEY = "custom-header-subtitle";
  const applyCustomHeaderNames = () => {
    const tagEl = document.getElementById("header-tag-text");
    const nameEl = document.getElementById("header-name-text");
    const subtitleEl = document.getElementById("header-subtitle-text");
    const t = I18N[getLang()] || I18N.zh;
    const tag = localStorage.getItem(CUSTOM_HEADER_TAG_KEY);
    const name = localStorage.getItem(CUSTOM_HEADER_NAME_KEY);
    const subtitle = localStorage.getItem(CUSTOM_HEADER_SUBTITLE_KEY);
    if (tagEl) tagEl.textContent = (tag && tag.trim()) ? tag.trim() : (t["header.tag"] || "");
    if (nameEl) nameEl.textContent = (name && name.trim()) ? name.trim() : (t["header.name"] || "");
    if (subtitleEl) subtitleEl.textContent = (subtitle && subtitle.trim()) ? subtitle.trim() : (t["header.subtitle"] || "");
  };

  const setActiveNav = (activeLink) => {
    navLinks.forEach((l) => l.classList.remove("is-active"));
    if (activeLink) activeLink.classList.add("is-active");
  };

  const scrollToSection = (el) => {
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const hash = link.getAttribute("href");
      if (!hash || !hash.startsWith("#")) return;
      e.preventDefault();
      const detailViewEl = document.getElementById("detail-view");
      if (detailViewEl && !detailViewEl.hidden) {
        detailViewEl.hidden = true;
        detailViewEl.setAttribute("aria-hidden", "true");
        document.querySelectorAll(".main-section").forEach((s) => (s.hidden = false));
        if (detailViewEl.dataset.currentSectionId === "hero") {
          if (typeof renderHeroDisplay === "function") renderHeroDisplay();
        }
      }
      setActiveNav(link);
      const target = document.querySelector(hash);
      if (target) scrollToSection(target);
    });
  });

  if (sections.length) {
    const getHeaderHeight = () => document.querySelector(".site-header")?.offsetHeight || 0;
    const onScroll = throttle(() => {
      const headerH = getHeaderHeight();
      const scrollY = window.scrollY + headerH + 50;
      let current = sections[0];
      sections.forEach((s) => {
        if (s.el.offsetTop <= scrollY) current = s;
      });
      setActiveNav(current.link);
    }, 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  applyLangToPage(getLang());
  applyCustomHeaderNames();

  const STORAGE_STARS_DISABLED = "site-stars-disabled";
  const starfieldOverlay = document.getElementById("starfield-overlay");
  const themeStarsToggleBtn = document.getElementById("theme-stars-toggle-btn");
  function applyStarsPreference() {
    const disabled = localStorage.getItem(STORAGE_STARS_DISABLED) === "1";
    if (document.body) document.body.classList.toggle("stars-effect-disabled", !!disabled);
    if (starfieldOverlay) starfieldOverlay.classList.toggle("starfield-overlay--hidden", !!disabled);
  }
  function updateStarsToggleButton() {
    if (!themeStarsToggleBtn) return;
    const disabled = localStorage.getItem(STORAGE_STARS_DISABLED) === "1";
    const t = I18N[getLang()] || I18N.zh;
    themeStarsToggleBtn.textContent = disabled ? (t["theme.starsOn"] || "开启") : (t["theme.starsOff"] || "关闭");
    themeStarsToggleBtn.setAttribute("aria-pressed", disabled ? "true" : "false");
  }
  applyStarsPreference();
  updateStarsToggleButton();
  if (themeStarsToggleBtn) {
    themeStarsToggleBtn.addEventListener("click", () => {
      const disabled = localStorage.getItem(STORAGE_STARS_DISABLED) === "1";
      localStorage.setItem(STORAGE_STARS_DISABLED, disabled ? "0" : "1");
      applyStarsPreference();
      updateStarsToggleButton();
    });
  }

  const langToggle = document.querySelector(".lang-toggle");
  if (langToggle) {
    langToggle.addEventListener("click", () => {
      const next = getLang() === "zh" ? "en" : "zh";
      setLang(next);
      applyLangToPage(next);
      applyCustomHeaderNames();
      if (typeof detailView !== "undefined" && detailView && !detailView.hidden && typeof detailBody !== "undefined" && detailBody) {
        const sectionId = detailView.dataset.currentSectionId;
        if (sectionId) {
          const section = document.getElementById(sectionId);
          if (section) {
            const titleEl = section.querySelector("h2");
            const descEl = section.querySelector("p");
            const t = detailBody.querySelector(".detail-title");
            const s = detailBody.querySelector(".detail-subtitle");
            if (t && titleEl) t.textContent = titleEl.textContent;
            if (s && descEl) s.textContent = descEl.textContent;
          }
          if (typeof applyDetailConfig === "function") {
            applyDetailConfig(sectionId);
          }
        }
      }
    });
  }

  const headerNameEditBtn = document.getElementById("header-name-edit-btn");
  const headerNameEditPopover = document.getElementById("header-name-edit-popover");
  const headerEditTagInput = document.getElementById("header-edit-tag");
  const headerEditNameInput = document.getElementById("header-edit-name");
  const headerEditSubtitleInput = document.getElementById("header-edit-subtitle");
  const headerNameEditSave = document.getElementById("header-name-edit-save");
  const headerNameEditCancel = document.getElementById("header-name-edit-cancel");
  const tagEl = document.getElementById("header-tag-text");
  const nameEl = document.getElementById("header-name-text");
  const subtitleEl = document.getElementById("header-subtitle-text");

  let headerNameEditPopoverParent = null;

  const openHeaderNamePopover = () => {
    if (headerEditTagInput) headerEditTagInput.value = tagEl ? tagEl.textContent : "";
    if (headerEditNameInput) headerEditNameInput.value = nameEl ? nameEl.textContent : "";
    if (headerEditSubtitleInput) headerEditSubtitleInput.value = subtitleEl ? subtitleEl.textContent : "";
    headerNameEditPopover.hidden = false;
    headerNameEditPopover.classList.add("is-open");
    headerNameEditPopoverParent = headerNameEditPopover.parentElement;
    document.body.appendChild(headerNameEditPopover);
    const rect = headerNameEditBtn.getBoundingClientRect();
    const gap = 6;
    const margin = 10;
    const docTop = rect.bottom + window.scrollY + gap;
    let docLeft = rect.left + window.scrollX;
    const popoverW = headerNameEditPopover.offsetWidth;
    const vw = window.innerWidth;
    if (docLeft + popoverW > window.scrollX + vw - margin) docLeft = window.scrollX + vw - popoverW - margin;
    if (docLeft < window.scrollX + margin) docLeft = window.scrollX + margin;
    headerNameEditPopover.style.position = "absolute";
    headerNameEditPopover.style.top = docTop + "px";
    headerNameEditPopover.style.left = docLeft + "px";
    headerNameEditPopover.style.marginTop = "0";
    if (headerEditTagInput) headerEditTagInput.focus(); else if (headerEditNameInput) headerEditNameInput.focus();
  };

  const closeHeaderNamePopover = () => {
    headerNameEditPopover.hidden = true;
    headerNameEditPopover.classList.remove("is-open");
    headerNameEditPopover.style.position = "";
    headerNameEditPopover.style.top = "";
    headerNameEditPopover.style.left = "";
    headerNameEditPopover.style.marginTop = "";
    if (headerNameEditPopoverParent) {
      headerNameEditPopoverParent.appendChild(headerNameEditPopover);
    }
    headerNameEditPopoverParent = null;
  };

  const applySavedHeaderNames = (tag, name, subtitle) => {
    const t = I18N[getLang()] || I18N.zh;
    if (tagEl) tagEl.textContent = (tag && tag.trim()) ? tag : (t["header.tag"] || "");
    if (nameEl) nameEl.textContent = (name && name.trim()) ? name : (t["header.name"] || "");
    if (subtitleEl) subtitleEl.textContent = (subtitle && subtitle.trim()) ? subtitle : (t["header.subtitle"] || "");
  };

  if (headerNameEditBtn && headerNameEditPopover && headerEditNameInput && headerEditSubtitleInput) {
    headerNameEditBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openHeaderNamePopover();
    });
    if (headerNameEditSave) {
      headerNameEditSave.addEventListener("click", (e) => {
        e.stopPropagation();
        const tag = headerEditTagInput ? (headerEditTagInput.value || "").trim() : "";
        const name = (headerEditNameInput.value || "").trim();
        const subtitle = (headerEditSubtitleInput.value || "").trim();
        if (tag) localStorage.setItem(CUSTOM_HEADER_TAG_KEY, tag); else localStorage.removeItem(CUSTOM_HEADER_TAG_KEY);
        if (name) localStorage.setItem(CUSTOM_HEADER_NAME_KEY, name); else localStorage.removeItem(CUSTOM_HEADER_NAME_KEY);
        if (subtitle) localStorage.setItem(CUSTOM_HEADER_SUBTITLE_KEY, subtitle); else localStorage.removeItem(CUSTOM_HEADER_SUBTITLE_KEY);
        applyCustomHeaderNames();
        applySavedHeaderNames(tag, name, subtitle);
        closeHeaderNamePopover();
      });
    }
    if (headerNameEditCancel) {
      headerNameEditCancel.addEventListener("click", (e) => {
        e.stopPropagation();
        closeHeaderNamePopover();
      });
    }
    document.addEventListener("click", (e) => {
      if (headerNameEditPopover.hidden) return;
      if (!headerNameEditPopover.contains(e.target) && !headerNameEditBtn.contains(e.target)) closeHeaderNamePopover();
    });
  }

  const collapseToggle = document.querySelector(".header-collapse-toggle");
  if (collapseToggle && header) {
    collapseToggle.addEventListener("click", () => {
      const collapsed = header.classList.toggle("is-collapsed");
      if (body) body.classList.toggle("header-collapsed", collapsed);
      collapseToggle.textContent = collapsed ? "↓" : "↑";
      const label = collapsed ? "展开顶栏" : "收起顶栏";
      collapseToggle.setAttribute("aria-label", label);
      collapseToggle.title = label;

      if (collapsed) {
        const activeLink = document.querySelector(".site-header nav a.nav-item.is-active");
        const targetSelector = activeLink?.getAttribute("href") || "#hero-display";
        const target = targetSelector ? document.querySelector(targetSelector) : null;
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  }

  const BODY_BG_GRADIENT = "linear-gradient(to bottom, rgba(15, 23, 42, 0.82) 0%, rgba(15, 23, 42, 0.5) 45%, rgba(15, 23, 42, 0.35) 100%)";
  const CUSTOM_BG_STYLE_ID = "custom-page-bg-style";
  const heroBgInput = document.querySelector(".hero-background-input");
  const heroBgRestore = document.querySelector(".hero-background-restore");
  function applyCustomPageBg(dataUrl) {
    let styleEl = document.getElementById(CUSTOM_BG_STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = CUSTOM_BG_STYLE_ID;
      document.head.appendChild(styleEl);
    }
    const safeUrl = String(dataUrl)
      .replace(/\\/g, "\\\\")
      .replace(/\u0000/g, "")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\a ")
      .replace(/\r/g, "");
    styleEl.textContent = `body::before { background-image: ${BODY_BG_GRADIENT}, url("${safeUrl}"); }`;
  }
  function clearCustomPageBg() {
    const styleEl = document.getElementById(CUSTOM_BG_STYLE_ID);
    if (styleEl) styleEl.remove();
  }
  if (heroBgInput) {
    heroBgInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        if (dataUrl && typeof dataUrl === "string") applyCustomPageBg(dataUrl);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    });
  }
  if (heroBgRestore) {
    heroBgRestore.addEventListener("click", () => clearCustomPageBg());
  }

  const DEFAULT_FAVICON_HREF = "kw-logo.png";
  const STORAGE_FAVICON = "site-favicon";
  const heroFaviconInput = document.querySelector(".hero-favicon-input");
  const heroFaviconRestore = document.querySelector(".hero-favicon-restore");
  function applyFavicon(href) {
    let link = document.getElementById("site-favicon");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.id = "site-favicon";
      link.type = "image/png";
      document.head.appendChild(link);
    }
    link.href = href;
    const headerLogoImg = document.getElementById("header-logo-img");
    if (headerLogoImg) headerLogoImg.src = href;
  }
  function clearFavicon() {
    localStorage.removeItem(STORAGE_FAVICON);
    applyFavicon(DEFAULT_FAVICON_HREF);
  }
  const savedFavicon = localStorage.getItem(STORAGE_FAVICON);
  if (savedFavicon) applyFavicon(savedFavicon);
  if (heroFaviconInput) {
    heroFaviconInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        if (dataUrl && typeof dataUrl === "string") {
          localStorage.setItem(STORAGE_FAVICON, dataUrl);
          applyFavicon(dataUrl);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    });
  }
  if (heroFaviconRestore) {
    heroFaviconRestore.addEventListener("click", () => clearFavicon());
  }

  const detailView = document.getElementById("detail-view");
  const detailBody = detailView?.querySelector(".detail-body");
  const mainSections = Array.from(document.querySelectorAll(".main-section"));

  const STORAGE_AVATAR = "site-avatar";
  const STORAGE_AVATAR_DISPLAY = "site-avatar-display";
  const STORAGE_ABOUT_NAME = "site-about-name";
  const STORAGE_ABOUT_RELATIONS = "site-about-relations";
  const STORAGE_ABOUT_CUSTOM_FIELDS = "site-about-custom-fields";
  const STORAGE_PREFIX = "section-submissions-";
  const AVATAR_STORAGE_MAX_PX = 640;
  const AVATAR_STORAGE_QUALITY = 0.88;
  const CROP_RENDER_SIZE = 400;
  const CROP_RENDER_QUALITY = 0.88;
  const MAX_SOURCE_PX = 2048;

  function compressImageToDataUrl(dataUrl, maxPx, quality) {
    return new Promise((resolve) => {
      if (!dataUrl || !dataUrl.startsWith("data:")) {
        resolve(dataUrl || "");
        return;
      }
      const img = new Image();
      img.onload = () => {
        try {
          let w = img.naturalWidth;
          let h = img.naturalHeight;
          if (!w || !h) {
            resolve(dataUrl);
            return;
          }
          if (w > MAX_SOURCE_PX || h > MAX_SOURCE_PX) {
            const r = MAX_SOURCE_PX / Math.max(w, h);
            w = Math.round(w * r);
            h = Math.round(h * r);
          }
          if (w > maxPx || h > maxPx) {
            const r = maxPx / Math.max(w, h);
            w = Math.round(w * r);
            h = Math.round(h * r);
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          const out = canvas.toDataURL("image/jpeg", quality);
          resolve(out || dataUrl);
        } catch (_) {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  function renderCroppedAvatarToDataUrl(sourceDataUrl, positionX, positionY, scale, outputSize) {
    return new Promise((resolve) => {
      if (!sourceDataUrl || !sourceDataUrl.startsWith("data:")) {
        resolve(sourceDataUrl || "");
        return;
      }
      const img = new Image();
      img.onload = () => {
        try {
          let W = img.naturalWidth;
          let H = img.naturalHeight;
          if (!W || !H) {
            resolve(sourceDataUrl);
            return;
          }
          if (W > MAX_SOURCE_PX || H > MAX_SOURCE_PX) {
            compressImageToDataUrl(sourceDataUrl, MAX_SOURCE_PX, 0.9).then((resized) => {
              renderCroppedAvatarToDataUrl(resized, positionX, positionY, scale, outputSize).then(resolve).catch(() => resolve(sourceDataUrl));
            }).catch(() => resolve(sourceDataUrl));
            return;
          }
          const size = outputSize || CROP_RENDER_SIZE;
          const s = Math.max(size / W, size / H);
          const userScale = typeof scale === "number" ? Math.max(0.5, Math.min(3, scale)) : 1;
          const drawW = W * s * userScale;
          const drawH = H * s * userScale;
          const px = typeof positionX === "number" ? Math.max(0, Math.min(100, positionX)) : 50;
          const py = typeof positionY === "number" ? Math.max(0, Math.min(100, positionY)) : 50;
          const offsetX = (size - drawW) * (px / 100);
          const offsetY = (size - drawH) * (py / 100);
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(sourceDataUrl);
            return;
          }
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, 0, 0, W, H, offsetX, offsetY, drawW, drawH);
          const out = canvas.toDataURL("image/jpeg", CROP_RENDER_QUALITY);
          resolve(out || sourceDataUrl);
        } catch (_) {
          resolve(sourceDataUrl);
        }
      };
      img.onerror = () => resolve(sourceDataUrl);
      img.src = sourceDataUrl;
    });
  }

  const DEFAULT_AVATAR_DISPLAY = { shape: "circle", fit: "cover", position: "center", positionX: 50, positionY: 50, scale: 1 };

  const getAvatarDisplayConfig = () => {
    try {
      const raw = localStorage.getItem(STORAGE_AVATAR_DISPLAY);
      if (!raw) return { ...DEFAULT_AVATAR_DISPLAY };
      const o = JSON.parse(raw);
      const posX = typeof o.positionX === "number" ? Math.max(0, Math.min(100, o.positionX)) : 50;
      const posY = typeof o.positionY === "number" ? Math.max(0, Math.min(100, o.positionY)) : 50;
      const scale = typeof o.scale === "number" ? Math.max(0.5, Math.min(3, o.scale)) : 1;
      return {
        shape: o.shape === "rounded" || o.shape === "square" ? o.shape : "circle",
        fit: o.fit === "contain" ? "contain" : "cover",
        position: ["center", "top", "bottom", "left", "right"].includes(o.position) ? o.position : "center",
        positionX: posX,
        positionY: posY,
        scale,
      };
    } catch {
      return { ...DEFAULT_AVATAR_DISPLAY };
    }
  };

  const saveAvatarDisplayConfig = (config) => {
    try {
      localStorage.setItem(STORAGE_AVATAR_DISPLAY, JSON.stringify(config));
    } catch (_) {}
  };

  function buildAvatarTransform(config) {
    const scale = config.scale != null ? config.scale : 1;
    return scale !== 1 ? `scale(${scale})` : "";
  }

  const applyAvatarDisplayToPreview = (previewEl, config) => {
    if (!previewEl) return;
    previewEl.classList.remove("avatar-shape--circle", "avatar-shape--rounded", "avatar-shape--square");
    previewEl.classList.add("avatar-shape--" + (config.shape || "circle"));
    const img = previewEl.querySelector(".detail-avatar-preview-img");
    const posX = config.positionX != null ? config.positionX : 50;
    const posY = config.positionY != null ? config.positionY : 50;
    const transform = buildAvatarTransform(config);
    if (img) {
      img.style.objectFit = config.fit === "contain" ? "contain" : "cover";
      img.style.objectPosition = `${posX}% ${posY}%`;
      img.style.transform = transform;
      img.style.transformOrigin = "center center";
    } else {
      previewEl.style.backgroundSize = config.fit === "contain" ? "contain" : "cover";
      previewEl.style.backgroundPosition = `${posX}% ${posY}%`;
    }
  };

  const getSectionSubmissions = (sectionId) => {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + sectionId);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  function getSubmittedAtDateString() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  const setSectionSubmissions = (sectionId, list) => {
    try {
      const str = JSON.stringify(list);
      localStorage.setItem(STORAGE_PREFIX + sectionId, str);
      return true;
    } catch (e) {
      if (e && e.name === "QuotaExceededError") {
        try {
          const lastOnly = list.map((item, i) =>
            i === list.length - 1 ? { ...item, fileDataUrl: "" } : item
          );
          localStorage.setItem(STORAGE_PREFIX + sectionId, JSON.stringify(lastOnly));
        } catch (e2) {
          try {
            const withoutDataUrls = list.map((item) => {
              const { fileDataUrl, ...rest } = item;
              return rest;
            });
            localStorage.setItem(STORAGE_PREFIX + sectionId, JSON.stringify(withoutDataUrls));
          } catch (e3) {
            console.warn("Save submissions failed (quota)", e3);
          }
        }
        return false;
      }
      console.warn("Save submissions failed", e);
      return false;
    }
  };

  const LIST_IMAGE_COMPRESS_MAX_PX = 320;
  const LIST_IMAGE_COMPRESS_QUALITY = 0.82;
  const PROFILE_AVATAR_RENDER_SIZE = 1024;
  const PROFILE_AVATAR_COMPRESS_MAX_PX = 1024;
  const PROFILE_AVATAR_COMPRESS_QUALITY = 0.92;

  async function compressSectionListImages(list, options) {
    const forProfile = options && options.profileAvatar;
    const maxPx = forProfile ? PROFILE_AVATAR_COMPRESS_MAX_PX : LIST_IMAGE_COMPRESS_MAX_PX;
    const quality = forProfile ? PROFILE_AVATAR_COMPRESS_QUALITY : LIST_IMAGE_COMPRESS_QUALITY;
    const out = [];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (item.fileDataUrl && item.fileDataUrl.startsWith("data:")) {
        try {
          const compressed = await compressImageToDataUrl(item.fileDataUrl, maxPx, quality);
          out.push({ ...item, fileDataUrl: compressed });
        } catch (_) {
          out.push(item);
        }
      } else {
        out.push(item);
      }
    }
    return out;
  }

  const clearAvatarPreview = () => {
    const preview = detailView?.querySelector(".detail-avatar-preview");
    const img = preview?.querySelector(".detail-avatar-preview-img");
    const avatarInput = detailView?.querySelector(".detail-avatar-input");
    if (img) {
      img.src = "";
      img.style.display = "none";
    }
    if (preview) {
      preview.classList.remove("has-image");
      preview.style.backgroundImage = "";
    }
    if (avatarInput) avatarInput.value = "";
  };

  const loadAvatar = () => {
    const sectionId = detailView?.dataset.currentSectionId;
    const preview = detailView?.querySelector(".detail-avatar-preview");
    const img = preview?.querySelector(".detail-avatar-preview-img");
    if (!preview) return;
    if (sectionId === "about") {
      const data = localStorage.getItem(STORAGE_AVATAR);
      if (img) {
        if (data) {
          img.src = data;
          img.style.display = "block";
          preview.classList.add("has-image");
        } else {
          img.src = "";
          img.style.display = "none";
          preview.classList.remove("has-image");
        }
      } else {
        if (data) {
          preview.style.backgroundImage = `url(${data})`;
          preview.classList.add("has-image");
        } else {
          preview.style.backgroundImage = "";
          preview.classList.remove("has-image");
        }
      }
      applyAvatarDisplayToPreview(preview, getAvatarDisplayConfig());
      if (typeof renderDisplayList === "function") renderDisplayList("about");
    } else {
      clearAvatarPreview();
    }
  };

  const saveAvatar = (dataUrl) => {
    try {
      if (dataUrl) localStorage.setItem(STORAGE_AVATAR, dataUrl);
      else localStorage.removeItem(STORAGE_AVATAR);
      loadAvatar();
    } catch (e) {
      if (e && e.name === "QuotaExceededError") {
        try {
          localStorage.removeItem(STORAGE_AVATAR);
          loadAvatar();
        } catch (_) {}
      } else {
        console.warn("Save avatar failed", e);
      }
    }
  };

  let detailFilterDate = null;

  const renderDisplayList = (sectionId) => {
    const listEl = detailView?.querySelector(".detail-display-list");
    if (!listEl) return;
    if (sectionId === "books") {
      listEl.innerHTML = "";
      return;
    }
    let items = getSectionSubmissions(sectionId);
    if (sectionId === "moments") {
      items = [...items].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    }
    if (detailFilterDate) {
      const dateStr = String(detailFilterDate).trim();
      if (dateStr) items = items.filter((it) => (it.date || "").startsWith(dateStr));
    }
    const cfg = DETAIL_CONFIG[sectionId];
    const layout = cfg?.displayLayout || "card";
    const lang = getLang();
    const i18n = I18N[lang] || I18N.zh;
    listEl.className = "detail-display-list layout-" + layout;
    listEl.innerHTML = "";
    items.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "detail-submission-card layout-" + layout;
      card.dataset.index = String(index);
      if (layout === "moments" && item.id) card.dataset.momentId = item.id;
      const t = (s) => escapeHtml(s || "");
      const thumb = item.fileDataUrl
        ? `<div class="detail-card-thumb" style="background-image:url('${(item.fileDataUrl || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'")}')" title="预览"></div>`
        : "";
      const linkHtml = item.link
        ? `<a class="detail-card-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">${t(item.link)}</a>`
        : "";

      if (layout === "hero") {
        card.innerHTML = `
          ${thumb}
          <div class="detail-card-body">
            ${item.desc ? `<div class="detail-card-long-desc">${t(item.desc)}</div>` : ""}
            <div class="detail-card-actions">
              <button type="button" class="detail-card-use-hero" data-hero-index="${index}">${t(i18n["hero.useAsDisplay"] || "立即使用为首屏图片")}</button>
              <button type="button" class="detail-card-edit-desc" data-hero-index="${index}">${t(i18n["hero.editDesc"] || "更改说明")}</button>
              <button type="button" class="detail-card-delete">${t(i18n["hero.delete"] || "删除")}</button>
            </div>
          </div>
        `;
      } else if (layout === "profile") {
        const isAbout = sectionId === "about";
        const avatarUrl = isAbout ? (item.fileDataUrl || "") : (item.fileDataUrl || "");
        const displayName = isAbout ? ((item.name || "").trim() || (item.title ? String(item.title) : "")) : "";
        const cardTitle = isAbout ? displayName : t(item.title);
        let cardBodyHtml;
        if (isAbout && cfg && cfg.fields) {
          const isEn = lang === "en";
          const label = (key) => (cfg.fields[key] ? (isEn ? cfg.fields[key].en : cfg.fields[key].zh) : "");
          const has = (val) => (val || "").trim().length > 0;
          const rows = [];
          if (has(cardTitle)) rows.push(`<h4 class="detail-card-title detail-profile-name">${escapeHtml(cardTitle)}</h4>`);
          if (has(item.title)) rows.push(`<div class="detail-profile-row"><span class="detail-card-label">${label("title")}</span><span class="detail-profile-value">${t(item.title)}</span></div>`);
          if (has(item.creator)) rows.push(`<div class="detail-profile-row"><span class="detail-card-label">${label("meta")}</span><span class="detail-profile-value">${t(item.creator)}</span></div>`);
          cardBodyHtml = `
              <div class="detail-profile-fields">${rows.join("")}</div>
              <button type="button" class="detail-card-delete">${t(i18n["hero.delete"] || "删除")}</button>
            `;
        } else {
          cardBodyHtml = `
              <h4 class="detail-card-title">${t(cardTitle)}</h4>
              ${item.creator ? `<p class="detail-card-meta">${t(item.creator)}</p>` : ""}
              ${item.desc ? `<div class="detail-card-long-desc">${t(item.desc)}</div>` : ""}
              ${linkHtml}
              <button type="button" class="detail-card-delete">${t(i18n["hero.delete"] || "删除")}</button>
            `;
        }
        card.innerHTML = `
          <div class="detail-profile-card-inner">
            <div class="detail-card-thumb detail-profile-thumb">
              <img class="detail-profile-thumb-img" alt="" loading="lazy">
            </div>
            <div class="detail-card-body">
              ${cardBodyHtml}
            </div>
          </div>
        `;
        const thumbImg = card.querySelector(".detail-profile-thumb-img");
        if (thumbImg) {
          if (avatarUrl && avatarUrl.startsWith("data:")) {
            thumbImg.src = avatarUrl;
            thumbImg.style.display = "block";
            const px = (isAbout && item.positionX != null) ? item.positionX : 50;
            const py = (isAbout && item.positionY != null) ? item.positionY : 50;
            const sc = (isAbout && item.scale != null) ? item.scale : 1;
            thumbImg.style.objectPosition = `${px}% ${py}%`;
            thumbImg.style.transform = buildAvatarTransform({ scale: sc });
            thumbImg.style.transformOrigin = "center center";
          } else {
            thumbImg.removeAttribute("src");
            thumbImg.style.display = "none";
          }
        }
      } else if (layout === "story") {
        card.innerHTML = `
          <div class="detail-card-body detail-card-full">
            <h4 class="detail-card-chapter">${t(item.title)}</h4>
            ${item.creator ? `<p class="detail-card-meta">${t(item.creator)}</p>` : ""}
            ${item.desc ? `<div class="detail-card-long-desc">${t(item.desc)}</div>` : ""}
            ${linkHtml}
            <button type="button" class="detail-card-delete">删除</button>
          </div>
        `;
      } else if (layout === "voice") {
        card.innerHTML = `
          <div class="detail-card-body detail-card-full">
            <span class="detail-card-category">${t(item.title)}</span>
            ${item.creator ? `<span class="detail-card-trigger">${t(item.creator)}</span>` : ""}
            ${item.desc ? `<p class="detail-card-line-text">${t(item.desc)}</p>` : ""}
            ${linkHtml}
            <button type="button" class="detail-card-delete">删除</button>
          </div>
        `;
      } else if (layout === "fanworks") {
        const typeLabel = item.creator || "作品";
        card.innerHTML = `
          ${thumb}
          <div class="detail-card-body">
            <span class="detail-card-type">${t(typeLabel)}</span>
            <h4 class="detail-card-title">${t(item.title)}</h4>
            ${item.desc ? `<p class="detail-card-desc">${t(item.desc)}</p>` : ""}
            ${linkHtml}
            <button type="button" class="detail-card-delete">删除</button>
          </div>
        `;
      } else if (layout === "gallery") {
        card.innerHTML = `
          ${thumb}
          <div class="detail-card-body">
            <h4 class="detail-card-title">${t(item.title)}</h4>
            ${item.creator ? `<p class="detail-card-meta">${t(item.creator)}</p>` : ""}
            ${item.desc ? `<p class="detail-card-desc">${t(item.desc)}</p>` : ""}
            ${linkHtml}
            <button type="button" class="detail-card-delete">删除</button>
          </div>
        `;
      } else if (layout === "links") {
        card.innerHTML = `
          <div class="detail-card-body detail-card-full">
            <h4 class="detail-card-title">${t(item.title)}</h4>
            ${item.creator ? `<p class="detail-card-meta">${t(item.creator)}</p>` : ""}
            ${item.link ? `<a class="detail-card-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">${t(item.link)}</a>` : ""}
            ${item.desc ? `<p class="detail-card-desc">${t(item.desc)}</p>` : ""}
            <button type="button" class="detail-card-delete">删除</button>
          </div>
        `;
      } else if (layout === "moments") {
        const likeCount = typeof item.likes === "number" ? item.likes : 0;
        const comments = Array.isArray(item.comments) ? item.comments : [];
        const commentsHtml = comments.map((c) => `<div class="moments-comment-item"><span class="moments-comment-text">${escapeHtml(c.text || "")}</span></div>`).join("");
        const imgUrl = item.imageDataUrl || item.fileDataUrl || "";
        const imageBlock = imgUrl ? `<div class="moments-card-image-wrap"><img class="moments-card-image" src="${String(imgUrl).replace(/"/g, "&quot;")}" alt=""></div>` : "";
        card.innerHTML = `
          <div class="detail-card-body detail-card-moments">
            <div class="moments-card-date">${escapeHtml(item.date || "")}</div>
            ${imageBlock}
            <div class="moments-card-content">${escapeHtml((item.content || "").replace(/\n/g, "<br>"))}</div>
            ${item.emoji ? `<div class="moments-card-emoji">${escapeHtml(item.emoji)}</div>` : ""}
            <div class="moments-card-actions">
              <button type="button" class="moments-like-btn" data-moment-id="${escapeHtml(item.id || "")}">${i18n["moments.like"] || "赞"} ${likeCount > 0 ? likeCount : ""}</button>
              <span class="moments-comment-count">${i18n["moments.comment"] || "评论"} ${comments.length}</span>
            </div>
            <div class="moments-comments-list">${commentsHtml}</div>
            <div class="moments-comment-form">
              <input type="text" class="moments-comment-input" placeholder="${escapeHtml(i18n["moments.addComment"] || "写评论…")}" data-moment-id="${escapeHtml(item.id || "")}">
              <button type="button" class="moments-comment-send" data-moment-id="${escapeHtml(item.id || "")}">${i18n["moments.sendComment"] || "发送"}</button>
            </div>
            <button type="button" class="detail-card-delete">删除</button>
          </div>
        `;
        const likeBtn = card.querySelector(".moments-like-btn");
        const commentInput = card.querySelector(".moments-comment-input");
        const commentSend = card.querySelector(".moments-comment-send");
        if (likeBtn) {
          likeBtn.addEventListener("click", () => {
            const list = getSectionSubmissions("moments");
            const item = list.find((m) => m.id === likeBtn.dataset.momentId);
            if (item) {
              item.likes = (item.likes || 0) + 1;
              setSectionSubmissions("moments", list);
              renderDisplayList("moments");
            }
          });
        }
        const sendComment = () => {
          const text = (commentInput?.value || "").trim();
          if (!text) return;
          const list = getSectionSubmissions("moments");
          const item = list.find((m) => m.id === commentSend?.dataset.momentId);
          if (item) {
            if (!item.comments) item.comments = [];
            item.comments.push({ id: "c-" + Date.now(), text, date: new Date().toISOString().slice(0, 10) });
            setSectionSubmissions("moments", list);
            renderDisplayList("moments");
            if (commentInput) commentInput.value = "";
          }
        };
        if (commentSend) commentSend.addEventListener("click", sendComment);
        if (commentInput) commentInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); sendComment(); } });
      } else {
        card.innerHTML = `
          ${thumb}
          <div class="detail-card-body">
            <h4 class="detail-card-title">${t(item.title)}</h4>
            ${item.creator ? `<p class="detail-card-creator">${t(item.creator)}</p>` : ""}
            ${item.desc ? `<p class="detail-card-desc">${t(item.desc)}</p>` : ""}
            ${linkHtml}
            <button type="button" class="detail-card-delete">删除</button>
          </div>
        `;
      }
      listEl.appendChild(card);
    });
  };

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  const heroDisplaySection = document.getElementById("hero-display");
  let heroCurrentIndex = 0;
  const renderHeroDisplay = (scrollIntoView) => {
    if (!heroDisplaySection) return;
    const items = getSectionSubmissions("hero");
    const visual = heroDisplaySection.querySelector(".hero-display-visual");
    const titleEl = heroDisplaySection.querySelector(".hero-display-title");
    const subtitleEl = heroDisplaySection.querySelector(".hero-display-subtitle");
    const descEl = heroDisplaySection.querySelector(".hero-display-desc");
    const linkEl = heroDisplaySection.querySelector(".hero-display-link");
    const hintEl = heroDisplaySection.querySelector(".hero-display-hint");
    if (!items.length) {
      heroCurrentIndex = 0;
      heroDisplaySection.classList.remove("hero-display--has-nav");
      if (visual) {
        visual.style.backgroundImage = "";
        visual.style.backgroundSize = "";
        visual.style.backgroundPosition = "";
        visual.style.backgroundRepeat = "";
      }
      if (titleEl) titleEl.textContent = "";
      if (subtitleEl) subtitleEl.textContent = "";
      if (descEl) descEl.textContent = "";
      if (linkEl) linkEl.style.display = "none";
      if (hintEl) hintEl.style.display = "";
      return;
    }
    heroDisplaySection.classList.toggle("hero-display--has-nav", items.length > 1);
    if (heroCurrentIndex < 0 || heroCurrentIndex >= items.length) {
      heroCurrentIndex = items.length - 1;
    }
    const item = items[heroCurrentIndex];
    const displayTitle = "";
    const displaySubtitle = "";
    const displayDesc = item.desc || "";
    if (visual) {
      if (item.fileDataUrl) {
        try {
          visual.style.backgroundImage = `url(${item.fileDataUrl})`;
          visual.style.backgroundSize = "cover";
          visual.style.backgroundPosition = "center center";
          visual.style.backgroundRepeat = "no-repeat";
        } catch (_) {
          visual.style.backgroundImage = "";
        }
      } else {
        visual.style.backgroundImage = "";
      }
    }
    if (titleEl) titleEl.textContent = displayTitle;
    if (subtitleEl) subtitleEl.textContent = displaySubtitle;
    if (descEl) descEl.textContent = displayDesc;
    if (linkEl) {
      if (item.link) {
        linkEl.href = item.link;
        linkEl.textContent = item.link;
        linkEl.style.display = "inline-block";
      } else linkEl.style.display = "none";
    }
    if (hintEl) hintEl.style.display = "";
    if (scrollIntoView && heroDisplaySection) {
      heroDisplaySection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const heroDisplayInner = heroDisplaySection?.querySelector(".hero-display-inner");
  if (heroDisplayInner) {
    heroDisplayInner.addEventListener("mouseenter", () => heroDisplaySection.classList.add("hero-display--nav-hover"));
    heroDisplayInner.addEventListener("mouseleave", () => heroDisplaySection.classList.remove("hero-display--nav-hover"));
  }
  const heroPrevBtn = heroDisplaySection?.querySelector(".hero-display-prev");
  const heroNextBtn = heroDisplaySection?.querySelector(".hero-display-next");
  if (heroPrevBtn && heroNextBtn) {
    heroPrevBtn.addEventListener("click", () => {
      const items = getSectionSubmissions("hero");
      if (!items.length) return;
      heroCurrentIndex = (heroCurrentIndex - 1 + items.length) % items.length;
      renderHeroDisplay();
    });
    heroNextBtn.addEventListener("click", () => {
      const items = getSectionSubmissions("hero");
      if (!items.length) return;
      heroCurrentIndex = (heroCurrentIndex + 1) % items.length;
      renderHeroDisplay();
    });
  }
  const heroCollapseBtn = document.getElementById("hero-collapse-btn");
  const heroCollapseBar = document.getElementById("hero-collapse-bar");
  if (heroCollapseBtn && heroDisplaySection) {
    heroCollapseBtn.addEventListener("click", () => {
      const isCollapsed = heroDisplaySection.classList.toggle("hero-display--collapsed");
      if (heroCollapseBar) heroCollapseBar.classList.toggle("is-collapsed", isCollapsed);
      heroCollapseBtn.setAttribute("aria-label", isCollapsed ? "展开首屏" : "收起首屏");
      heroCollapseBtn.setAttribute("title", isCollapsed ? "展开首屏" : "收起首屏");
    });
  }

  const displayListRoot = detailView?.querySelector(".detail-display-list");
  if (displayListRoot) {
    displayListRoot.addEventListener("click", (e) => {
      const useHeroBtn = e.target.closest(".detail-card-use-hero");
      if (useHeroBtn && detailView && detailView.dataset.currentSectionId === "hero") {
        const idx = parseInt(useHeroBtn.getAttribute("data-hero-index"), 10);
        if (!Number.isNaN(idx)) {
          heroCurrentIndex = idx;
          renderHeroDisplay(true);
        }
        return;
      }
      const editDescBtn = e.target.closest(".detail-card-edit-desc");
      if (editDescBtn && detailView && detailView.dataset.currentSectionId === "hero") {
        const idx = parseInt(editDescBtn.getAttribute("data-hero-index"), 10);
        if (Number.isNaN(idx)) return;
        const list = getSectionSubmissions("hero");
        if (idx < 0 || idx >= list.length) return;
        const item = list[idx];
        const lang = getLang();
        const newDesc = window.prompt(lang === "zh" ? "请输入该首屏图片的说明文本：" : "Enter description for this hero image:", item.desc || "");
        if (newDesc !== null) {
          list[idx] = { ...item, desc: newDesc };
          setSectionSubmissions("hero", list);
          renderDisplayList("hero");
          renderHeroDisplay();
        }
        return;
      }
      const profileCard = e.target.closest(".detail-submission-card.layout-profile");
      if (profileCard && detailView && detailView.dataset.currentSectionId === "about" && !e.target.closest(".detail-card-delete")) {
        const idx = parseInt(profileCard.dataset.index, 10);
        if (!Number.isNaN(idx)) openProfileCardExpand(idx);
        return;
      }
      const btn = e.target.closest(".detail-card-delete");
      if (!btn || !detailView) return;
      const sectionId = detailView.dataset.currentSectionId;
      if (!sectionId) return;
      const card = btn.closest(".detail-submission-card");
      if (!card) return;
      const list = getSectionSubmissions(sectionId);
      let index;
      if (sectionId === "moments" && card.dataset.momentId) {
        index = list.findIndex((m) => m.id === card.dataset.momentId);
      } else {
        const cards = Array.from(displayListRoot.children);
        index = cards.indexOf(card);
      }
      if (index === -1) return;
      list.splice(index, 1);
      if (sectionId === "hero") {
        const newLen = list.length;
        if (newLen === 0) heroCurrentIndex = 0;
        else if (heroCurrentIndex >= newLen) heroCurrentIndex = newLen - 1;
      }
      setSectionSubmissions(sectionId, list);
      renderDisplayList(sectionId);
      if (sectionId === "hero") renderHeroDisplay();
    });
  }

  const profileExpandEl = document.getElementById("profile-card-expand");
  let profileExpandIndex = -1;
  let profileExpandPendingAvatar = null;

  function openProfileCardExpand(index) {
    const list = getSectionSubmissions("about");
    if (index < 0 || index >= list.length || !profileExpandEl) return;
    const item = list[index];
    profileExpandIndex = index;
    profileExpandPendingAvatar = null;
    const fileInp = profileExpandEl.querySelector("#expand-avatar-file");
    if (fileInp) fileInp.value = "";
    const img = profileExpandEl.querySelector(".profile-card-expand-img");
    const avatarUrl = (item.fileDataUrl || "").trim();
    if (img) {
      img.src = avatarUrl || "";
      img.style.display = avatarUrl ? "block" : "none";
    }
    setElValue(profileExpandEl, "#expand-name", (item.name || "").trim());
    setElValue(profileExpandEl, "#expand-title", (item.title || "").trim());
    setElValue(profileExpandEl, "#expand-meta", (item.creator || "").trim());
    setElValue(profileExpandEl, "#expand-desc", (item.desc || "").trim());
    renderExpandCustomFieldsInCard(item);
    profileExpandEl.hidden = false;
    profileExpandEl.removeAttribute("aria-hidden");
  }

  function closeProfileCardExpand() {
    if (!profileExpandEl) return;
    profileExpandEl.hidden = true;
    profileExpandEl.setAttribute("aria-hidden", "true");
    profileExpandIndex = -1;
    profileExpandPendingAvatar = null;
  }

  function setElValue(root, selector, value) {
    const el = root.querySelector(selector);
    if (el) el.value = value;
  }

  if (profileExpandEl) {
    profileExpandEl.querySelector(".profile-card-expand-backdrop")?.addEventListener("click", closeProfileCardExpand);
    profileExpandEl.querySelector(".profile-card-expand-close")?.addEventListener("click", closeProfileCardExpand);
    profileExpandEl.querySelector(".profile-card-expand-save")?.addEventListener("click", async () => {
      if (profileExpandIndex < 0) return;
      let list = getSectionSubmissions("about");
      if (profileExpandIndex >= list.length) return;
      const titleInp = profileExpandEl.querySelector("#expand-title");
      const metaInp = profileExpandEl.querySelector("#expand-meta");
      const descInp = profileExpandEl.querySelector("#expand-desc");
      const item = list[profileExpandIndex];
      const nameInp = profileExpandEl.querySelector("#expand-name");
      syncDefinitionsFromExpand();
      const customFields = collectCustomFieldsFromExpand();
      list[profileExpandIndex] = {
        ...item,
        name: (nameInp?.value || "").trim(),
        title: (titleInp?.value || "").trim(),
        creator: (metaInp?.value || "").trim(),
        desc: (descInp?.value || "").trim(),
        customFields,
        fileDataUrl: profileExpandPendingAvatar !== null ? profileExpandPendingAvatar : (item.fileDataUrl || ""),
      };
      let ok = setSectionSubmissions("about", list);
      if (!ok) {
        const compressed = await compressSectionListImages(list, { profileAvatar: true });
        setSectionSubmissions("about", compressed);
      }
      renderDisplayList("about");
      if (typeof renderDetailCustomFields === "function") renderDetailCustomFields();
      closeProfileCardExpand();
    });
    const expandAvatarFile = profileExpandEl.querySelector("#expand-avatar-file");
    if (expandAvatarFile) {
      expandAvatarFile.addEventListener("change", async () => {
        const file = expandAvatarFile.files && expandAvatarFile.files[0];
        if (!file || !file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = async () => {
          let data = reader.result || "";
          try {
            data = await compressImageToDataUrl(data, PROFILE_AVATAR_RENDER_SIZE, PROFILE_AVATAR_COMPRESS_QUALITY);
          } catch (_) {}
          profileExpandPendingAvatar = data;
          const img = profileExpandEl.querySelector(".profile-card-expand-img");
          if (img) {
            img.src = profileExpandPendingAvatar;
            img.style.display = "block";
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  const displayListContainer = detailView?.querySelector(".detail-display-area");
  if (displayListContainer) {
    let profileExpandTimer = null;
    let profileExpandCooldownUntil = 0;
    const PROFILE_COLLAPSE_DELAY_MS = 40;
    const PROFILE_COOLDOWN_MS = 280;

    function clearProfileExpandTimer() {
      if (profileExpandTimer) {
        clearTimeout(profileExpandTimer);
        profileExpandTimer = null;
      }
    }

    function setActiveProfileCard(card) {
      const listEl = detailView?.querySelector(".detail-display-list.layout-profile");
      if (!listEl || !card || !listEl.contains(card)) return;
      if (Date.now() < profileExpandCooldownUntil) return;
      clearProfileExpandTimer();
      listEl.querySelectorAll(".detail-submission-card").forEach((c) => c.classList.remove("is-active"));
      card.classList.add("is-active");
    }

    function collapseAllProfileCards() {
      const listEl = detailView?.querySelector(".detail-display-list");
      if (!listEl) return;
      listEl.querySelectorAll(".detail-submission-card.is-active").forEach((c) => c.classList.remove("is-active"));
      profileExpandCooldownUntil = Date.now() + PROFILE_COOLDOWN_MS;
    }

    displayListContainer.addEventListener("mouseenter", (e) => {
      const listEl = detailView?.querySelector(".detail-display-list.layout-profile");
      if (!listEl) return;
      const card = e.target.closest(".detail-submission-card");
      if (!card || !listEl.contains(card)) return;
      setActiveProfileCard(card);
    }, true);

    displayListContainer.addEventListener("mouseleave", (e) => {
      const listEl = detailView?.querySelector(".detail-display-list.layout-profile");
      if (!listEl) return;
      const fromCard = e.target.closest(".detail-submission-card");
      const toEl = e.relatedTarget;
      const toCard = toEl && toEl.closest ? toEl.closest(".detail-submission-card") : null;
      const toInsideList = toEl && displayListContainer.contains(toEl);

      if (fromCard && listEl.contains(fromCard)) {
        clearProfileExpandTimer();
        if (toCard && toCard !== fromCard && listEl.contains(toCard)) {
          return;
        }
        profileExpandTimer = setTimeout(() => {
          collapseAllProfileCards();
          profileExpandTimer = null;
        }, PROFILE_COLLAPSE_DELAY_MS);
      } else if (e.target === displayListContainer && !toInsideList) {
        clearProfileExpandTimer();
        profileExpandTimer = setTimeout(() => {
          collapseAllProfileCards();
          profileExpandTimer = null;
        }, PROFILE_COLLAPSE_DELAY_MS);
      }
    }, true);
  }

  const detailFilterByDateBtn = document.getElementById("detail-filter-by-date-btn");
  const detailFilterByDateOverlay = document.getElementById("detail-filter-by-date-overlay");
  const detailFilterByDateBackdrop = document.getElementById("detail-filter-by-date-backdrop");
  const detailFilterDateInput = document.getElementById("detail-filter-date-input");
  const detailFilterMonthInput = document.getElementById("detail-filter-month-input");
  const detailFilterByDateApply = document.getElementById("detail-filter-by-date-apply");
  const detailFilterByDateApplyMonth = document.getElementById("detail-filter-by-date-apply-month");
  const detailFilterByDateClear = document.getElementById("detail-filter-by-date-clear");

  function closeDetailFilterOverlay() {
    if (detailFilterByDateOverlay) {
      detailFilterByDateOverlay.setAttribute("hidden", "");
      detailFilterByDateOverlay.setAttribute("aria-hidden", "true");
    }
    if (detailFilterByDateBtn) detailFilterByDateBtn.setAttribute("aria-expanded", "false");
  }

  if (detailFilterByDateBtn && detailFilterByDateOverlay) {
    detailFilterByDateBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = detailFilterByDateOverlay.hasAttribute("hidden");
      if (isHidden) {
        detailFilterByDateOverlay.removeAttribute("hidden");
        detailFilterByDateOverlay.setAttribute("aria-hidden", "false");
        detailFilterByDateBtn.setAttribute("aria-expanded", "true");
      } else {
        closeDetailFilterOverlay();
      }
    });
  }
  if (detailFilterByDateBackdrop) {
    detailFilterByDateBackdrop.addEventListener("click", closeDetailFilterOverlay);
  }
  if (detailFilterByDateApply && detailFilterDateInput) {
    detailFilterByDateApply.addEventListener("click", () => {
      closeDetailFilterOverlay();
      const dateVal = (detailFilterDateInput.value || "").trim();
      if (!dateVal) return;
      detailFilterDate = dateVal;
      const sectionId = detailView?.dataset.currentSectionId;
      if (sectionId) renderDisplayList(sectionId);
    });
  }
  if (detailFilterByDateApplyMonth && detailFilterMonthInput) {
    detailFilterByDateApplyMonth.addEventListener("click", () => {
      closeDetailFilterOverlay();
      const monthVal = (detailFilterMonthInput.value || "").trim();
      if (!monthVal) return;
      detailFilterDate = monthVal;
      const sectionId = detailView?.dataset.currentSectionId;
      if (sectionId) renderDisplayList(sectionId);
    });
  }
  if (detailFilterByDateClear) {
    detailFilterByDateClear.addEventListener("click", () => {
      detailFilterDate = null;
      if (detailFilterDateInput) detailFilterDateInput.value = "";
      if (detailFilterMonthInput) detailFilterMonthInput.value = "";
      closeDetailFilterOverlay();
      const sectionId = detailView?.dataset.currentSectionId;
      if (sectionId) renderDisplayList(sectionId);
    });
  }

  /** 站点板块顺序（与 index.html 导航、main 内 section 顺序一致，上传 Vercel 后即按此展示） */
  const SECTION_ORDER = ["hero", "about", "story", "gallery", "voice", "fanworks", "moments", "books"];

  const DETAIL_CONFIG = {
    hero: {
      displayLayout: "hero",
      displayTitle: { zh: "首屏展示区", en: "Hero Display" },
      displayHint: {
        zh: "用于放置主视觉、头图和简要说明。",
        en: "Place main visual, header image and a short description here.",
      },
      fields: {
        title: {
          zh: "主标题 / Banner 文案",
          en: "Main Title / Banner",
          phZh: "例如：克丽斯腾·莱特｜孤星下的总辖",
          phEn: "e.g. Kristen Wright | Lone Star Director",
        },
        meta: {
          zh: "小标题 / 备注",
          en: "Subtitle / Note",
          phZh: "例如：莱茵生命总辖 · 开拓者",
          phEn: "e.g. Rhine Lab Director",
        },
        link: {
          zh: "相关链接（可选）",
          en: "Related Link (optional)",
        },
        desc: {
          zh: "说明文本描述",
          en: "Description",
          phZh: "简单说明这一首屏想表达的氛围与信息。",
          phEn: "Describe the mood and info of this hero view.",
        },
        file: {
          enabled: true,
          zh: "上传主视觉图片",
          en: "Upload Key Visual",
        },
      },
    },
    about: {
      displayLayout: "profile",
      displayTitle: { zh: "角色资料卡", en: "Profile Card" },
      displayHint: {
        zh: "用于整理出身、种族、所属、身份等基础信息。",
        en: "Organize origin, race, affiliation and identity here.",
      },
      fields: {
        name: {
          zh: "名字",
          en: "Name",
          phZh: "角色姓名",
          phEn: "Character name",
        },
        title: {
          zh: "出身 / 出生地",
          en: "Origin / Birthplace",
        },
        meta: {
          zh: "种族 / 所属阵营",
          en: "Race / Faction",
        },
        desc: {
          zh: "身份与角色简介",
          en: "Identity & Profile",
          phZh: "概括身份、职务、个性与整体印象。",
          phEn: "Summarize identity, role, personality and impression.",
        },
        file: { enabled: false },
      },
    },
    story: {
      displayLayout: "story",
      displayTitle: { zh: "背景故事区", en: "Story Area" },
      displayHint: {
        zh: "按时间线或章节分段记录事件与故事。",
        en: "Record events and story segments by timeline or chapters.",
      },
      fields: {
        title: {
          zh: "章节 / 时间点",
          en: "Chapter / Time Point",
        },
        meta: {
          zh: "相关人物 / 关键词",
          en: "Related Characters / Keywords",
        },
        link: {
          zh: "外部长文链接（可选）",
          en: "External Story Link (optional)",
        },
        desc: {
          zh: "故事正文",
          en: "Story Text",
          phZh: "详细描述该时间点发生的事件与心境。",
          phEn: "Describe what happened and the mindset here.",
        },
        file: { enabled: false },
      },
    },
    gallery: {
      displayLayout: "gallery",
      displayTitle: { zh: "立绘 / 插图区", en: "Illustration Area" },
      displayHint: {
        zh: "用于整理立绘、皮肤、官方与同人插图。",
        en: "Organize official and fan illustrations, skins, etc.",
      },
      fields: {
        title: {
          zh: "图片标题",
          en: "Image Title",
        },
        meta: {
          zh: "来源 / 画师 / 标签",
          en: "Source / Artist / Tags",
        },
        link: {
          zh: "原图链接（可选）",
          en: "Original Link (optional)",
        },
        desc: {
          zh: "图片说明",
          en: "Image Description",
        },
        file: {
          enabled: true,
          zh: "上传插图文件",
          en: "Upload Illustration",
        },
      },
    },
    voice: {
      displayLayout: "voice",
      displayTitle: { zh: "文本台词区", en: "Lines Area" },
      displayHint: {
        zh: "按分类整理不同场景下的台词文本。",
        en: "Organize text lines by category and scene.",
      },
      fields: {
        title: {
          zh: "台词分类",
          en: "Line Category",
          phZh: "例如：问候 / 进场 / 闲聊",
          phEn: "e.g. Greeting / Entry / Idle",
        },
        meta: {
          zh: "触发条件 / 备注",
          en: "Trigger / Notes",
        },
        link: {
          zh: "原始来源链接（可选）",
          en: "Source Link (optional)",
        },
        desc: {
          zh: "台词正文",
          en: "Line Text",
        },
        file: { enabled: false },
      },
    },
    fanworks: {
      displayLayout: "fanworks",
      displayTitle: { zh: "同人作品区", en: "Fanworks Area" },
      displayHint: {
        zh: "用于记录自己的或他人的插画、短文、音声等二创。",
        en: "Record your or others' fan art, fic, audio and more.",
      },
      fields: {
        title: {
          zh: "作品标题",
          en: "Work Title",
        },
        meta: {
          zh: "创作者 / ID",
          en: "Creator / ID",
        },
        link: {
          zh: "作品链接（可选）",
          en: "Work Link (optional)",
        },
        desc: {
          zh: "作品简介",
          en: "Work Description",
        },
        file: {
          enabled: true,
          zh: "上传预览文件（可选）",
          en: "Upload Preview File (optional)",
        },
      },
    },
    links: {
      displayLayout: "links",
      displayTitle: { zh: "链接清单", en: "Links List" },
      displayHint: {
        zh: "整理与角色相关的各类外部链接。",
        en: "Collect external links related to the character.",
      },
      fields: {
        title: {
          zh: "链接名称",
          en: "Link Name",
        },
        meta: {
          zh: "类型 / 备注",
          en: "Type / Notes",
        },
        link: {
          zh: "URL 地址",
          en: "URL",
        },
        desc: {
          zh: "说明（可选）",
          en: "Description (optional)",
        },
        file: { enabled: false },
      },
    },
    moments: {
      displayLayout: "moments",
      displayTitle: { zh: "说说动态", en: "Moments" },
      displayHint: {
        zh: "按时间倒序展示你的随笔与灵感。",
        en: "Your moments in reverse chronological order.",
      },
      fields: {},
    },
    books: {
      displayLayout: "books",
      displayTitle: { zh: "Olib 电子书", en: "Olib Books" },
      displayHint: {
        zh: "在下方 iframe 中使用 Olib 搜索、阅读与收藏电子书。",
        en: "Use Olib in the iframe below to search, read and collect ebooks.",
      },
      fields: {},
    },
  };

  const applyDetailConfig = (sectionId) => {
    if (!detailBody) return;
    const booksWrap = document.getElementById("detail-books-wrap");
    const refinedBlock = detailBody.querySelector(".detail-refined-block");
    const aboutRelations = detailBody.querySelector(".detail-about-relations");
    const displayArea = detailBody.querySelector(".detail-display-area");
    const isBooks = sectionId === "books";
    if (booksWrap) {
      if (isBooks) {
        booksWrap.removeAttribute("hidden");
        booksWrap.removeAttribute("aria-hidden");
        booksWrap.style.display = "block";
        booksWrap.style.visibility = "visible";
      } else {
        booksWrap.setAttribute("hidden", "");
        booksWrap.setAttribute("aria-hidden", "true");
        booksWrap.style.display = "none";
        booksWrap.style.visibility = "hidden";
        var iframe = document.getElementById("detail-books-iframe");
        if (iframe) iframe.src = "";
        var loadingEl = document.getElementById("detail-books-loading");
        if (loadingEl) { loadingEl.classList.remove("is-hidden"); loadingEl.textContent = "正在加载 Olib 电子书…"; }
      }
    }
    if (refinedBlock) refinedBlock.style.display = isBooks ? "none" : "";
    if (aboutRelations) aboutRelations.style.display = isBooks ? "none" : "";
    if (displayArea) displayArea.style.display = isBooks ? "none" : "";
    detailBody.classList.toggle("detail-body--books-layout", isBooks);

    const cfg = DETAIL_CONFIG[sectionId];
    const lang = getLang();
    const isEn = lang === "en";
    const isHero = sectionId === "hero";
    detailBody.querySelectorAll("[data-detail-optional]").forEach((el) => {
      el.style.display = isHero ? "none" : "";
    });
    const displayTitleEl = detailBody.querySelector(".detail-display-title");
    const displayHintEl = detailBody.querySelector(".detail-display-hint");
    const titleLabel = detailBody.querySelector('.detail-submit-form label[data-field="title"] span');
    const metaLabel = detailBody.querySelector('.detail-submit-form label[data-field="meta"] span');
    const linkLabel = detailBody.querySelector('.detail-submit-form label[data-field="link"] span');
    const descLabel = detailBody.querySelector('.detail-submit-form label[data-field="desc"] span');
    const fileLabel = detailBody.querySelector('.detail-submit-form label[data-field="file"] span');
    const fileRow = detailBody.querySelector('.detail-submit-form [data-field="file-row"]');
    const titleInput = detailBody.querySelector('.detail-submit-form [name="title"]');
    const metaInput = detailBody.querySelector('.detail-submit-form [name="creator"]');
    const linkInput = detailBody.querySelector('.detail-submit-form [name="link"]');
    const descInput = detailBody.querySelector('.detail-submit-form [name="desc"]');

    if (!cfg) {
      if (displayTitleEl) displayTitleEl.textContent = isEn ? "My Submissions" : "我的投稿展示区";
      if (displayHintEl)
        displayHintEl.textContent = isEn
          ? "Your submitted content for this section appears below."
          : "下方展示你在本板块已提交的内容，可在此整理与装扮。";
      return;
    }

    if (displayTitleEl) displayTitleEl.textContent = isEn ? cfg.displayTitle.en : cfg.displayTitle.zh;
    if (displayHintEl) displayHintEl.textContent = isEn ? cfg.displayHint.en : cfg.displayHint.zh;

    if (!isHero && titleLabel && cfg.fields.title) titleLabel.textContent = isEn ? cfg.fields.title.en : cfg.fields.title.zh;
    if (!isHero && metaLabel && cfg.fields.meta) metaLabel.textContent = isEn ? cfg.fields.meta.en : cfg.fields.meta.zh;
    if (!isHero && linkLabel && cfg.fields.link) linkLabel.textContent = isEn ? cfg.fields.link.en : cfg.fields.link.zh;
    if (descLabel && cfg.fields.desc) descLabel.textContent = isEn ? cfg.fields.desc.en : cfg.fields.desc.zh;

    const fileCfg = cfg.fields.file;
    if (fileRow) {
      if (fileCfg && fileCfg.enabled) {
        fileRow.style.display = "";
        if (fileLabel) fileLabel.textContent = isEn ? fileCfg.en : fileCfg.zh;
      } else {
        fileRow.style.display = "none";
      }
    }

    if (!isHero && titleInput && cfg.fields.title) {
      titleInput.placeholder = isEn ? cfg.fields.title.phEn || "" : cfg.fields.title.phZh || "";
    }
    if (!isHero && metaInput && cfg.fields.meta) {
      metaInput.placeholder = isEn ? cfg.fields.meta.phEn || "" : cfg.fields.meta.phZh || "";
    }
    if (!isHero && linkInput && cfg.fields.link) {
      linkInput.placeholder = isEn ? cfg.fields.link.phEn || "" : cfg.fields.link.phZh || "";
    }
    if (descInput && cfg.fields.desc) {
      descInput.placeholder = isEn ? cfg.fields.desc.phEn || "" : cfg.fields.desc.phZh || "";
    }

    const aboutRelationsBlock = detailBody.querySelector(".detail-about-relations");
    const aboutBasicTitle = detailBody.querySelector(".detail-about-basic-title");
    const isAbout = sectionId === "about";
    detailBody.classList.toggle("detail-body--about-layout", isAbout);
    detailBody.querySelectorAll("[data-detail-only-section=\"about\"]").forEach((el) => {
      el.style.display = isAbout ? "" : "none";
      if (isAbout && el.getAttribute("hidden") !== null) el.removeAttribute("hidden");
      if (!isAbout) el.setAttribute("hidden", "");
    });
    if (aboutRelationsBlock && !isAbout) aboutRelationsBlock.setAttribute("hidden", "");
    if (aboutRelationsBlock && isAbout) aboutRelationsBlock.removeAttribute("hidden");
    if (aboutBasicTitle) {
      if (isAbout) aboutBasicTitle.removeAttribute("hidden");
      else aboutBasicTitle.setAttribute("hidden", "");
    }
    const linkRow = detailBody.querySelector('.detail-submit-form [data-optional-row="link"]');
    if (linkRow) linkRow.style.display = isAbout ? "none" : (cfg && cfg.fields && cfg.fields.link ? "" : "none");
    if (isAbout) {
      const nameRow = detailBody.querySelector('.detail-submit-form [data-optional-row="name"]');
      if (nameRow) nameRow.style.display = "flex";
      const nameInput = document.getElementById("about-name-input");
      if (nameInput) {
        try {
          nameInput.value = localStorage.getItem(STORAGE_ABOUT_NAME) || "";
        } catch (_) {}
      }
      const cfgAbout = DETAIL_CONFIG.about;
      if (nameInput && cfgAbout && cfgAbout.fields.name) {
        nameInput.placeholder = isEn ? (cfgAbout.fields.name.phEn || "") : (cfgAbout.fields.name.phZh || "");
      }
      if (typeof renderAboutRelations === "function") renderAboutRelations();
      if (typeof renderDetailCustomFields === "function") renderDetailCustomFields();
    } else {
      const nameRow = detailBody.querySelector('.detail-submit-form [data-optional-row="name"]');
      if (nameRow) nameRow.style.display = "none";
    }

    const isMoments = sectionId === "moments";
    const avatarLabelEl = detailBody.querySelector(".detail-avatar-text");
    const avatarCropOptions = detailBody.querySelector(".detail-avatar-display-options");
    if (avatarLabelEl) {
      if (isMoments) avatarLabelEl.textContent = (I18N[lang] || I18N.zh || {})["moments.uploadImage"] || (isEn ? "Upload image" : "上传图片");
      else avatarLabelEl.textContent = (I18N[lang] || I18N.zh || {})["detail.avatar"] || (isEn ? "Avatar" : "头像");
    }
    if (avatarCropOptions) avatarCropOptions.style.display = isMoments ? "none" : "";
    const standardForm = detailBody.querySelector(".detail-submit-form");
    const momentsFormEl = document.getElementById("detail-moments-form");
    if (standardForm) standardForm.style.display = isMoments ? "none" : "";
    if (momentsFormEl) {
      momentsFormEl.style.display = isMoments ? "block" : "none";
      if (isMoments) {
        momentsFormEl.removeAttribute("hidden");
        const dateInp = document.getElementById("moments-date");
        if (dateInp) {
          const now = new Date();
          const pad = (n) => String(n).padStart(2, "0");
          dateInp.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
        }
        const contentPh = document.getElementById("moments-content");
        if (contentPh) contentPh.placeholder = (I18N[lang] || I18N.zh || {})["moments.contentPh"] || (isEn ? "Write your thought…" : "写下此刻灵感…");
        const strip = document.getElementById("moments-emoji-strip");
        if (strip && strip.children.length === 0) {
          ["😊", "🌟", "💡", "✨", "🎉", "❤️", "🔥", "👍"].forEach((emoji) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "moments-emoji-btn";
            btn.textContent = emoji;
            btn.addEventListener("click", () => {
              const input = document.getElementById("moments-emoji-input");
              if (input) input.value = (input.value + emoji).slice(0, 4);
            });
            strip.appendChild(btn);
          });
        }
      } else momentsFormEl.setAttribute("hidden", "");
    }
  };

  const getRelationsData = () => {
    try {
      const raw = localStorage.getItem(STORAGE_ABOUT_RELATIONS);
      if (!raw) return { blockDesc: "", characters: [], relations: [] };
      const o = JSON.parse(raw);
      return {
        blockDesc: o.blockDesc || "",
        characters: Array.isArray(o.characters) ? o.characters : [],
        relations: Array.isArray(o.relations) ? o.relations : [],
      };
    } catch {
      return { blockDesc: "", characters: [], relations: [] };
    }
  };

  const setRelationsData = (data) => {
    try {
      localStorage.setItem(STORAGE_ABOUT_RELATIONS, JSON.stringify(data));
    } catch (_) {}
  };

  const getCustomFieldsDefinitions = () => {
    try {
      const raw = localStorage.getItem(STORAGE_ABOUT_CUSTOM_FIELDS);
      if (!raw) return [];
      const a = JSON.parse(raw);
      return Array.isArray(a) ? a : [];
    } catch {
      return [];
    }
  };

  const setCustomFieldsDefinitions = (list) => {
    try {
      localStorage.setItem(STORAGE_ABOUT_CUSTOM_FIELDS, JSON.stringify(list));
    } catch (_) {}
  };

  function renderDetailCustomFields() {
    const blocks = detailBody ? detailBody.querySelectorAll(".detail-custom-fields-block") : [];
    if (!blocks.length) return;
    const defs = getCustomFieldsDefinitions();
    blocks.forEach((block) => {
      const listEl = block.querySelector(".detail-custom-fields-list");
      const addBtn = block.querySelector(".detail-custom-fields-add");
      if (!listEl) return;
      listEl.innerHTML = "";
      defs.forEach((d) => {
        const row = document.createElement("div");
        row.className = "detail-custom-fields-row";
        row.dataset.customId = d.id;
        row.innerHTML = `
          <input type="text" class="detail-custom-fields-label" value="${escapeHtml(d.label || "")}" placeholder="栏目名称（如：组织、部门）" data-custom-id="${escapeHtml(d.id)}">
          <input type="text" class="detail-custom-fields-value" placeholder="内容（可选）" data-custom-id="${escapeHtml(d.id)}">
          <button type="button" class="detail-custom-fields-delete" data-custom-id="${escapeHtml(d.id)}" aria-label="删除">×</button>
        `;
        listEl.appendChild(row);
        const labelInp = row.querySelector(".detail-custom-fields-label");
        const delBtn = row.querySelector(".detail-custom-fields-delete");
        if (labelInp) {
          labelInp.addEventListener("blur", () => {
            const defs = getCustomFieldsDefinitions();
            const def = defs.find((x) => x.id === d.id);
            if (def) def.label = (labelInp.value || "").trim();
            setCustomFieldsDefinitions(defs);
            renderDetailCustomFields();
          });
        }
        if (delBtn) {
          delBtn.addEventListener("click", () => {
            const next = getCustomFieldsDefinitions().filter((x) => x.id !== d.id);
            setCustomFieldsDefinitions(next);
            renderDetailCustomFields();
          });
        }
      });
      if (addBtn && !addBtn.dataset.addBound) {
        addBtn.dataset.addBound = "1";
        addBtn.addEventListener("click", () => {
          const next = [...getCustomFieldsDefinitions(), { id: "cf-" + Date.now(), label: "" }];
          setCustomFieldsDefinitions(next);
          renderDetailCustomFields();
        });
      }
    });
  }

  function getCurrentExpandItem() {
    if (profileExpandIndex < 0) return null;
    const list = getSectionSubmissions("about");
    return list[profileExpandIndex] || null;
  }

  function renderExpandCustomFieldsInCard(item) {
    const listEl = document.getElementById("expand-custom-fields-list");
    const addBtn = document.getElementById("expand-custom-fields-add");
    if (!listEl) return;
    const defs = getCustomFieldsDefinitions();
    const valuesByLabel = {};
    (item?.customFields || []).forEach((v) => {
      if (v && v.label != null) valuesByLabel[v.label] = v.value;
    });
    listEl.innerHTML = "";
    defs.forEach((d) => {
      const row = document.createElement("div");
      row.className = "profile-card-expand-custom-row";
      row.dataset.customId = d.id;
      const labelVal = (d.label || "").trim();
      const valueVal = (valuesByLabel[labelVal] ?? (item?.customFields || []).find((cf) => (cf.label || "").trim() === labelVal)?.value) ?? "";
      row.innerHTML = `
        <input type="text" class="profile-card-expand-input expand-custom-label" placeholder="栏目名称" value="${escapeHtml(labelVal)}" data-custom-id="${escapeHtml(d.id)}">
        <input type="text" class="profile-card-expand-input expand-custom-value" placeholder="内容（可选）" value="${escapeHtml(valueVal)}" data-custom-id="${escapeHtml(d.id)}">
        <button type="button" class="profile-card-expand-custom-delete" data-custom-id="${escapeHtml(d.id)}" aria-label="删除">×</button>
      `;
      listEl.appendChild(row);
      const labelInp = row.querySelector(".expand-custom-label");
      const delBtn = row.querySelector(".profile-card-expand-custom-delete");
      if (labelInp) {
        labelInp.addEventListener("blur", () => {
          const defs2 = getCustomFieldsDefinitions();
          const def = defs2.find((x) => x.id === d.id);
          if (def) def.label = (labelInp.value || "").trim();
          setCustomFieldsDefinitions(defs2);
          renderExpandCustomFieldsInCard(getCurrentExpandItem());
        });
      }
      if (delBtn) {
        delBtn.addEventListener("click", () => {
          const next = getCustomFieldsDefinitions().filter((x) => x.id !== d.id);
          setCustomFieldsDefinitions(next);
          renderExpandCustomFieldsInCard(getCurrentExpandItem());
        });
      }
    });
    if (addBtn && !addBtn.dataset.addBound) {
      addBtn.dataset.addBound = "1";
      addBtn.addEventListener("click", () => {
        const next = [...getCustomFieldsDefinitions(), { id: "cf-" + Date.now(), label: "" }];
        setCustomFieldsDefinitions(next);
        renderExpandCustomFieldsInCard(getCurrentExpandItem());
      });
    }
  }

  function collectCustomFieldsFromForm() {
    const block = detailBody?.querySelector(".detail-custom-fields-block");
    if (!block) return [];
    const listEl = block.querySelector(".detail-custom-fields-list");
    if (!listEl) return [];
    const defs = getCustomFieldsDefinitions();
    const rows = listEl.querySelectorAll(".detail-custom-fields-row");
    const out = [];
    rows.forEach((row, i) => {
      const labelInp = row.querySelector(".detail-custom-fields-label");
      const valueInp = row.querySelector(".detail-custom-fields-value");
      const label = (labelInp?.value || "").trim();
      const value = (valueInp?.value || "").trim();
      if (label) out.push({ label, value });
    });
    return out;
  }

  function collectCustomFieldsFromExpand() {
    const listEl = document.getElementById("expand-custom-fields-list");
    if (!listEl) return [];
    const rows = listEl.querySelectorAll(".profile-card-expand-custom-row");
    const out = [];
    rows.forEach((row) => {
      const labelInp = row.querySelector(".expand-custom-label");
      const valueInp = row.querySelector(".expand-custom-value");
      const label = (labelInp?.value || "").trim();
      const value = (valueInp?.value || "").trim();
      if (label) out.push({ label, value });
    });
    return out;
  }

  function syncDefinitionsFromExpand() {
    const listEl = document.getElementById("expand-custom-fields-list");
    if (!listEl) return;
    const rows = listEl.querySelectorAll(".profile-card-expand-custom-row");
    const newDefs = [];
    rows.forEach((row, i) => {
      const labelInp = row.querySelector(".expand-custom-label");
      const label = (labelInp?.value || "").trim();
      const id = row.dataset.customId || "cf-" + Date.now() + "-" + i;
      newDefs.push({ id, label });
    });
    setCustomFieldsDefinitions(newDefs);
  }

  function renderAboutRelations() {
    const block = detailBody?.querySelector(".detail-about-relations");
    if (!block) return;
    const data = getRelationsData();
    const lang = getLang();
    const i18n = (I18N[lang] || I18N.zh);

    const descInput = block.querySelector(".detail-relations-block-desc-input");
    if (descInput) {
      descInput.value = data.blockDesc || "";
      if (!descInput.dataset.bound) {
        descInput.dataset.bound = "1";
        descInput.addEventListener("input", () => {
          const d = getRelationsData();
          d.blockDesc = descInput.value;
          setRelationsData(d);
        });
      }
    }

    const peopleList = block.querySelector(".detail-relations-people-list");
    const linksList = block.querySelector(".detail-relations-links-list");
    if (!peopleList || !linksList) return;

    peopleList.innerHTML = "";
    const avatarDisplay = getAvatarDisplayConfig();
    const avatarShapeClass = "detail-relations-avatar-shape--" + (avatarDisplay.shape || "circle");
    data.characters.forEach((char, idx) => {
      const item = document.createElement("div");
      item.className = "detail-relations-person-item";
      item.dataset.id = char.id;
      item.innerHTML = `
        <div class="detail-relations-person-avatar ${avatarShapeClass}" data-relation-person-id="${char.id}">
          <img class="detail-relations-person-avatar-img" alt="" src="">
        </div>
        <input type="text" class="detail-relations-person-name" value="${escapeHtml(char.name || "")}" placeholder="${escapeHtml(i18n["section.about.relations.personName"] || "人物名称")}" data-relation-person-id="${char.id}">
        <label class="detail-relations-person-upload">
          <span>${i18n["section.about.relations.uploadAvatar"] || "上传头像"}</span>
          <input type="file" accept="image/*" class="detail-relations-person-file" data-relation-person-id="${char.id}">
        </label>
        <button type="button" class="detail-relations-person-delete" data-relation-person-id="${char.id}" aria-label="删除">×</button>
      `;
      peopleList.appendChild(item);
      const avatarImg = item.querySelector(".detail-relations-person-avatar-img");
      if (avatarImg && char.avatar) {
        avatarImg.src = char.avatar;
        avatarImg.style.display = "block";
        avatarImg.style.objectFit = avatarDisplay.fit === "contain" ? "contain" : "cover";
        const posMap = { center: "center", top: "top", bottom: "bottom", left: "left", right: "right" };
        avatarImg.style.objectPosition = posMap[avatarDisplay.position] || "center";
      } else if (avatarImg) {
        avatarImg.style.display = "none";
      }
    });

    linksList.innerHTML = "";
    data.relations.forEach((rel, idx) => {
      const item = document.createElement("div");
      item.className = "detail-relations-link-item";
      const fromOpts = data.characters.map((c) => `<option value="${escapeHtml(c.id)}" ${rel.fromId === c.id ? "selected" : ""}>${escapeHtml(c.name || c.id)}</option>`).join("");
      const toOpts = data.characters.map((c) => `<option value="${escapeHtml(c.id)}" ${rel.toId === c.id ? "selected" : ""}>${escapeHtml(c.name || c.id)}</option>`).join("");
      item.innerHTML = `
        <select class="detail-relations-link-from" data-relation-idx="${idx}"><option value="">—</option>${fromOpts}</select>
        <input type="text" class="detail-relations-link-label" value="${escapeHtml(rel.label || "")}" placeholder="${escapeHtml(i18n["section.about.relations.relationLabel"] || "关系说明")}" data-relation-idx="${idx}">
        <select class="detail-relations-link-to" data-relation-idx="${idx}"><option value="">—</option>${toOpts}</select>
        <button type="button" class="detail-relations-link-delete" data-relation-idx="${idx}" aria-label="删除">×</button>
      `;
      linksList.appendChild(item);
    });

    block.querySelectorAll(".detail-relations-person-name").forEach((input) => {
      if (input.dataset.bound) return;
      input.dataset.bound = "1";
      input.addEventListener("input", () => {
        const d = getRelationsData();
        const c = d.characters.find((x) => x.id === input.dataset.relationPersonId);
        if (c) c.name = input.value;
        setRelationsData(d);
      });
    });
    block.querySelectorAll(".detail-relations-person-file").forEach((fileInput) => {
      fileInput.addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = async () => {
          let data = reader.result || "";
          try {
            data = await compressImageToDataUrl(data, LIST_IMAGE_COMPRESS_MAX_PX, LIST_IMAGE_COMPRESS_QUALITY);
          } catch (_) {}
          const d = getRelationsData();
          const c = d.characters.find((x) => x.id === fileInput.dataset.relationPersonId);
          if (c) c.avatar = data;
          setRelationsData(d);
          renderAboutRelations();
        };
        reader.readAsDataURL(file);
        e.target.value = "";
      });
    });
    block.querySelectorAll(".detail-relations-person-delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.relationPersonId;
        const d = getRelationsData();
        d.characters = d.characters.filter((x) => x.id !== id);
        d.relations = d.relations.filter((r) => r.fromId !== id && r.toId !== id);
        setRelationsData(d);
        renderAboutRelations();
      });
    });
    block.querySelectorAll(".detail-relations-link-from").forEach((sel) => {
      sel.addEventListener("change", () => {
        const d = getRelationsData();
        const idx = parseInt(sel.dataset.relationIdx, 10);
        if (d.relations[idx]) d.relations[idx].fromId = sel.value;
        setRelationsData(d);
      });
    });
    block.querySelectorAll(".detail-relations-link-to").forEach((sel) => {
      sel.addEventListener("change", () => {
        const d = getRelationsData();
        const idx = parseInt(sel.dataset.relationIdx, 10);
        if (d.relations[idx]) d.relations[idx].toId = sel.value;
        setRelationsData(d);
      });
    });
    block.querySelectorAll(".detail-relations-link-label").forEach((input) => {
      input.addEventListener("input", () => {
        const d = getRelationsData();
        const idx = parseInt(input.dataset.relationIdx, 10);
        if (d.relations[idx]) d.relations[idx].label = input.value;
        setRelationsData(d);
      });
    });
    block.querySelectorAll(".detail-relations-link-delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        const d = getRelationsData();
        const idx = parseInt(btn.dataset.relationIdx, 10);
        d.relations.splice(idx, 1);
        setRelationsData(d);
        renderAboutRelations();
      });
    });
  }

  const aboutNameInput = document.getElementById("about-name-input");
  if (aboutNameInput) {
    aboutNameInput.addEventListener("input", () => {
      try {
        localStorage.setItem(STORAGE_ABOUT_NAME, aboutNameInput.value);
      } catch (_) {}
    });
  }

  const addPersonBtn = detailBody?.querySelector(".detail-relations-add-person");
  if (addPersonBtn) {
    addPersonBtn.addEventListener("click", () => {
      const d = getRelationsData();
      d.characters.push({ id: "p" + Date.now() + "_" + Math.random().toString(36).slice(2, 8), name: "", avatar: "" });
      setRelationsData(d);
      renderAboutRelations();
    });
  }

  const addLinkBtn = detailBody?.querySelector(".detail-relations-add-link");
  if (addLinkBtn) {
    addLinkBtn.addEventListener("click", () => {
      const d = getRelationsData();
      d.relations.push({ fromId: "", toId: "", label: "" });
      setRelationsData(d);
      renderAboutRelations();
    });
  }

  function createDetailParticles() {
    const container = detailView?.querySelector(".detail-view-particles");
    if (!container) return;
    container.innerHTML = "";
    const types = ["star", "star", "silver", "gold", "cyan", "lavender", "coral", "mint", "sky"];
    const count = 165;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      p.className = "detail-particle detail-particle--" + types[i % types.length];
      p.style.left = left + "%";
      p.style.top = top + "%";
      const size = 1.2 + Math.random() * 3;
      p.style.width = p.style.height = size + "px";
      p.style.animationDelay = Math.random() * 1.2 + "s";
      p.style.animationDuration = 1.6 + Math.random() * 0.8 + "s";
      const pull = 14 + Math.random() * 22;
      const angle = Math.atan2(50 - top, 50 - left);
      p.style.setProperty("--particle-dx", Math.cos(angle) * pull + "px");
      p.style.setProperty("--particle-dy", Math.sin(angle) * pull + "px");
      container.appendChild(p);
    }
  }

  const openDetailView = (sectionEl) => {
    if (!detailView || !sectionEl || !detailBody) return;
    detailFilterDate = null;
    const filterOverlay = document.getElementById("detail-filter-by-date-overlay");
    if (filterOverlay) {
      filterOverlay.setAttribute("hidden", "");
      filterOverlay.setAttribute("aria-hidden", "true");
    }
    const filterBtn = document.getElementById("detail-filter-by-date-btn");
    if (filterBtn) filterBtn.setAttribute("aria-expanded", "false");
    const importExportOverlayEl = document.getElementById("detail-import-export-overlay");
    if (importExportOverlayEl) {
      importExportOverlayEl.setAttribute("hidden", "");
      importExportOverlayEl.setAttribute("aria-hidden", "true");
    }
    const importExportBtnEl = document.getElementById("detail-import-export-btn");
    if (importExportBtnEl) importExportBtnEl.setAttribute("aria-expanded", "false");
    const sectionId = sectionEl.id;
    detailView.dataset.currentSectionId = sectionId;

    const titleEl = sectionEl.querySelector("h2");
    const descEl = sectionEl.querySelector("p");
    const titleNode = detailBody.querySelector(".detail-title");
    const subtitleNode = detailBody.querySelector(".detail-subtitle");
    if (titleNode) titleNode.textContent = titleEl ? titleEl.textContent : "";
    if (subtitleNode) subtitleNode.textContent = descEl ? descEl.textContent : "";

    applyDetailConfig(sectionId);

    if (sectionId === "books") {
      const booksIframe = document.getElementById("detail-books-iframe");
      const booksLoading = document.getElementById("detail-books-loading");
      if (booksIframe && booksLoading) {
        booksLoading.classList.remove("is-hidden");
        try {
          const olibUrl = new URL("olib/index.html", window.location.href).href;
          booksIframe.src = olibUrl;
          const onLoad = () => {
            booksLoading.classList.add("is-hidden");
            booksIframe.removeEventListener("load", onLoad);
            booksIframe.removeEventListener("error", onErr);
          };
          const onErr = () => {
            booksLoading.textContent = "Olib 加载失败，请确认 olib 目录已正确部署。";
            booksLoading.classList.remove("is-hidden");
            booksIframe.removeEventListener("load", onLoad);
            booksIframe.removeEventListener("error", onErr);
          };
          booksIframe.addEventListener("load", onLoad);
          booksIframe.addEventListener("error", onErr);
        } catch (e) {
          booksLoading.textContent = "Olib 加载出错：" + (e && e.message ? e.message : "未知");
        }
      }
    }

    loadAvatar();
    renderDisplayList(sectionId);

    mainSections.forEach((s) => (s.hidden = true));
    detailView.hidden = false;
    detailView.removeAttribute("aria-hidden");
    detailView.classList.remove("detail-view-visible");
    detailView.classList.toggle("detail-view--books-mode", sectionId === "books");
    if (sectionId === "books") {
      const openNewLink = document.getElementById("detail-books-open-new");
      if (openNewLink) openNewLink.href = new URL("olib/index.html", window.location.href).href;
    }
    createDetailParticles();
    requestAnimationFrame(() => {
      detailView.classList.add("detail-view-visible");
    });
    requestAnimationFrame(() => {
      const mainTop = document.querySelector("main")?.offsetTop ?? 0;
      window.scrollTo({ top: Math.max(0, mainTop - 80), behavior: "smooth" });
    });
  };

  const closeDetailView = () => {
    if (!detailView) return;
    const wasHero = detailView.dataset.currentSectionId === "hero";
    detailView.classList.remove("detail-view-visible", "detail-view--books-mode");
    detailView.hidden = true;
    detailView.setAttribute("aria-hidden", "true");
    mainSections.forEach((s) => (s.hidden = false));
    if (wasHero) renderHeroDisplay();
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && detailView && !detailView.hidden) {
      closeDetailView();
    }
  });

  mainSections.forEach((section) => {
    section.addEventListener("click", (e) => {
      if (e.target.closest("a") || e.target.closest("button") || e.target.closest("input") || e.target.closest("form") || e.target.closest("label")) return;
      openDetailView(section);
    });
    section.style.cursor = "pointer";
  });

  const heroSection = document.getElementById("hero");
  const customAreaBtn = heroSection?.querySelector(".hero-section-btn-custom");
  if (customAreaBtn && heroSection) {
    customAreaBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openDetailView(heroSection);
    });
  }

  const backBtn = detailView?.querySelector(".detail-back-btn");
  if (backBtn) backBtn.addEventListener("click", closeDetailView);
  const detailCollapseBtn = document.getElementById("detail-collapse-btn");
  if (detailCollapseBtn) detailCollapseBtn.addEventListener("click", closeDetailView);

  renderHeroDisplay();

  const avatarInput = detailView?.querySelector(".detail-avatar-input");
  if (avatarInput) {
    avatarInput.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        e.target.value = "";
        return;
      }
      const preview = detailView?.querySelector(".detail-avatar-preview");
      if (preview) preview.classList.add("avatar-uploading");
      const reader = new FileReader();
      reader.onload = async () => {
        const result = reader.result;
        if (!result) {
          if (preview) preview.classList.remove("avatar-uploading");
          return;
        }
        let data = result;
        const isMoments = detailView?.dataset.currentSectionId === "moments";
        if (!isMoments) {
          try {
            data = await compressImageToDataUrl(result, AVATAR_STORAGE_MAX_PX, AVATAR_STORAGE_QUALITY);
          } catch (_) {}
          saveAvatar(data);
        }
        const img = preview?.querySelector(".detail-avatar-preview-img");
        if (img) {
          img.src = data;
          img.style.display = "block";
        }
        if (preview) {
          preview.classList.remove("avatar-uploading");
          preview.classList.add("has-image");
          if (!isMoments) applyAvatarDisplayToPreview(preview, getAvatarDisplayConfig());
        }
        if (detailView?.dataset.currentSectionId === "about") renderDisplayList("about");
      };
      reader.onerror = () => {
        if (preview) preview.classList.remove("avatar-uploading");
      };
      reader.readAsDataURL(file);
    });
  }

  const avatarPreviewEl = detailView?.querySelector(".detail-avatar-preview");
  applyAvatarDisplayToPreview(avatarPreviewEl, getAvatarDisplayConfig());

  const avatarCropOverlay = document.getElementById("avatar-crop-overlay");
  const avatarCropBtn = document.getElementById("avatar-crop-btn");
  const avatarCropImg = document.getElementById("avatar-crop-img");
  const avatarCropFrame = document.getElementById("avatar-crop-frame");
  const avatarCropX = document.getElementById("avatar-crop-x");
  const avatarCropY = document.getElementById("avatar-crop-y");
  const avatarCropScale = document.getElementById("avatar-crop-scale");
  const avatarCropDone = document.getElementById("avatar-crop-done");
  const avatarCropCancel = document.getElementById("avatar-crop-cancel");

  let cropDragging = false;
  let cropLastX = 0;
  let cropLastY = 0;

  function openAvatarCrop() {
    const src = avatarPreviewEl?.querySelector(".detail-avatar-preview-img")?.src || localStorage.getItem(STORAGE_AVATAR) || "";
    if (!src || !src.startsWith("data:")) return;
    if (!avatarCropOverlay || !avatarCropImg) return;
    const cfg = getAvatarDisplayConfig();
    avatarCropImg.src = src;
    const x = cfg.positionX != null ? cfg.positionX : 50;
    const y = cfg.positionY != null ? cfg.positionY : 50;
    avatarCropImg.style.objectPosition = `${x}% ${y}%`;
    avatarCropImg.style.transform = buildAvatarTransform(cfg);
    avatarCropImg.style.transformOrigin = "center center";
    if (avatarCropX) avatarCropX.value = String(Math.round(x));
    if (avatarCropY) avatarCropY.value = String(Math.round(y));
    if (avatarCropScale) avatarCropScale.value = String(Math.round((cfg.scale != null ? cfg.scale : 1) * 100));
    avatarCropOverlay.hidden = false;
    avatarCropOverlay.removeAttribute("aria-hidden");
  }

  function applyCropSlidersToImg() {
    const x = avatarCropX ? Math.max(0, Math.min(100, parseInt(avatarCropX.value, 10) || 50)) : 50;
    const y = avatarCropY ? Math.max(0, Math.min(100, parseInt(avatarCropY.value, 10) || 50)) : 50;
    const scale = avatarCropScale ? Math.max(0.5, Math.min(3, (parseInt(avatarCropScale.value, 10) || 100) / 100)) : 1;
    const transform = buildAvatarTransform({ scale });
    if (avatarCropImg) {
      avatarCropImg.style.objectPosition = `${x}% ${y}%`;
      avatarCropImg.style.transform = transform;
      avatarCropImg.style.transformOrigin = "center center";
    }
    if (avatarPreviewEl) {
      const img = avatarPreviewEl.querySelector(".detail-avatar-preview-img");
      if (img) {
        img.style.objectPosition = `${x}% ${y}%`;
        img.style.transform = transform;
        img.style.transformOrigin = "center center";
      }
    }
  }

  function cropOnPointerMove(clientX, clientY) {
      if (!cropDragging || !avatarCropX || !avatarCropY) return;
      const dx = clientX - cropLastX;
      const dy = clientY - cropLastY;
      cropLastX = clientX;
      cropLastY = clientY;
      const sens = 0.5;
      let x = Math.max(0, Math.min(100, (parseInt(avatarCropX.value, 10) || 50) - dx * sens));
      let y = Math.max(0, Math.min(100, (parseInt(avatarCropY.value, 10) || 50) - dy * sens));
      avatarCropX.value = String(Math.round(x));
      avatarCropY.value = String(Math.round(y));
      applyCropSlidersToImg();
    }

  if (avatarCropFrame) {
    avatarCropFrame.addEventListener("mousedown", (e) => {
      if (!avatarCropImg || !avatarCropImg.src) return;
      cropDragging = true;
      cropLastX = e.clientX;
      cropLastY = e.clientY;
    });
    document.addEventListener("mousemove", (e) => { cropOnPointerMove(e.clientX, e.clientY); });
    document.addEventListener("mouseup", () => { cropDragging = false; });
    avatarCropFrame.addEventListener("mouseleave", () => { cropDragging = false; });

    avatarCropFrame.addEventListener("touchstart", (e) => {
      if (!avatarCropImg || !avatarCropImg.src || !e.touches.length) return;
      e.preventDefault();
      cropDragging = true;
      cropLastX = e.touches[0].clientX;
      cropLastY = e.touches[0].clientY;
    }, { passive: false });
    avatarCropFrame.addEventListener("touchmove", (e) => {
      if (!cropDragging || !e.touches.length) return;
      e.preventDefault();
      cropOnPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    avatarCropFrame.addEventListener("touchend", () => { cropDragging = false; });
    avatarCropFrame.addEventListener("touchcancel", () => { cropDragging = false; });

    avatarCropFrame.addEventListener("wheel", (e) => {
      if (!avatarCropScale || !avatarCropImg || !avatarCropImg.src) return;
      e.preventDefault();
      const step = 0.05;
      let v = (parseInt(avatarCropScale.value, 10) || 100) / 100;
      v += e.deltaY > 0 ? -step : step;
      v = Math.max(0.5, Math.min(3, v));
      avatarCropScale.value = String(Math.round(v * 100));
      applyCropSlidersToImg();
    }, { passive: false });
  }

  function closeAvatarCrop() {
    if (avatarCropOverlay) {
      avatarCropOverlay.hidden = true;
      avatarCropOverlay.setAttribute("aria-hidden", "true");
    }
  }

  if (avatarCropBtn) avatarCropBtn.addEventListener("click", openAvatarCrop);
  if (avatarCropCancel) avatarCropCancel.addEventListener("click", closeAvatarCrop);
  avatarCropOverlay?.querySelector(".avatar-crop-backdrop")?.addEventListener("click", closeAvatarCrop);
  if (avatarCropX) avatarCropX.addEventListener("input", applyCropSlidersToImg);
  if (avatarCropY) avatarCropY.addEventListener("input", applyCropSlidersToImg);
  if (avatarCropScale) avatarCropScale.addEventListener("input", applyCropSlidersToImg);
  if (avatarCropDone) {
    avatarCropDone.addEventListener("click", () => {
      const x = avatarCropX ? Math.max(0, Math.min(100, parseInt(avatarCropX.value, 10) || 50)) : 50;
      const y = avatarCropY ? Math.max(0, Math.min(100, parseInt(avatarCropY.value, 10) || 50)) : 50;
      const scale = avatarCropScale ? Math.max(0.5, Math.min(3, (parseInt(avatarCropScale.value, 10) || 100) / 100)) : 1;
      const cfg = { ...getAvatarDisplayConfig(), positionX: x, positionY: y, scale };
      saveAvatarDisplayConfig(cfg);
      applyAvatarDisplayToPreview(avatarPreviewEl, cfg);
      if (detailView?.dataset.currentSectionId === "about" && typeof renderDisplayList === "function") renderDisplayList("about");
      closeAvatarCrop();
    });
  }

  const submitForm = detailView?.querySelector(".detail-submit-form");

  if (submitForm) {
    submitForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const sectionId = detailView.dataset.currentSectionId;
      if (!sectionId) return;
      const form = e.target;
      const title = (form.querySelector('[name="title"]')?.value || "").trim();
      const creator = (form.querySelector('[name="creator"]')?.value || "").trim();
      const link = (form.querySelector('[name="link"]')?.value || "").trim();
      const desc = (form.querySelector('[name="desc"]')?.value || "").trim();
      const fileInput = form.querySelector(".detail-file-input");

      const addAndRender = (payload) => {
        try {
          const list = getSectionSubmissions(sectionId);
          list.push({ ...payload, date: payload.date != null ? payload.date : getSubmittedAtDateString() });
          if (sectionId === "hero") {
            heroCurrentIndex = list.length - 1;
          }
          setSectionSubmissions(sectionId, list);
          renderDisplayList(sectionId);
          if (sectionId === "hero") renderHeroDisplay(true);
          form.reset();
          if (sectionId !== "about" && sectionId !== "moments") clearAvatarPreview();
        } catch (err) {
          console.warn("Submit failed", err);
        }
      };

      const addAndRenderAboutWithRetry = async (payload) => {
        const list = getSectionSubmissions("about");
        list.push(payload);
        let ok = setSectionSubmissions("about", list);
        if (!ok) {
          const compressed = await compressSectionListImages(list, { profileAvatar: true });
          setSectionSubmissions("about", compressed);
        }
        renderDisplayList("about");
        form.reset();
      };

      const fileName = fileInput?.files?.[0]?.name || "";
      const displayTitle = title || fileName || "(无标题)";

      try {
        if (sectionId === "about") {
          const submitBtn = form.querySelector(".detail-submit-btn");
          const btnText = submitBtn ? submitBtn.textContent : "";
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "处理中…";
          }
          try {
            const aboutName = (localStorage.getItem(STORAGE_ABOUT_NAME) || "").trim();
            const previewImg = detailView?.querySelector(".detail-avatar-preview-img");
            const previewDataUrl = (previewImg && previewImg.src && previewImg.src.startsWith("data:")) ? previewImg.src : "";
            const topAvatar = previewDataUrl || localStorage.getItem(STORAGE_AVATAR) || "";
            const cropCfg = getAvatarDisplayConfig();
            const posX = cropCfg.positionX != null ? cropCfg.positionX : 50;
            const posY = cropCfg.positionY != null ? cropCfg.positionY : 50;
            const scale = cropCfg.scale != null ? cropCfg.scale : 1;
            const croppedDataUrl = await renderCroppedAvatarToDataUrl(topAvatar, posX, posY, scale, PROFILE_AVATAR_RENDER_SIZE);
            const customFields = collectCustomFieldsFromForm();
            await addAndRenderAboutWithRetry({
              name: aboutName,
              title,
              creator,
              desc,
              customFields,
              fileName: "",
              fileDataUrl: croppedDataUrl || topAvatar,
              positionX: 50,
              positionY: 50,
              scale: 1,
              date: getSubmittedAtDateString(),
            });
          } finally {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = btnText;
            }
          }
        } else if (fileInput?.files?.[0]) {
          const f = fileInput.files[0];
          if (f.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = async () => {
              let fileDataUrl = reader.result || "";
              try {
                fileDataUrl = await compressImageToDataUrl(fileDataUrl, 800, 0.85);
              } catch (_) {}
              let ok = true;
              const list = getSectionSubmissions(sectionId);
              list.push({ title: displayTitle, creator, link, desc, fileDataUrl, fileName: f.name, date: getSubmittedAtDateString() });
              if (sectionId === "hero") heroCurrentIndex = list.length - 1;
              ok = setSectionSubmissions(sectionId, list);
              if (!ok) {
                const compressed = await compressSectionListImages(list);
                setSectionSubmissions(sectionId, compressed);
              }
              renderDisplayList(sectionId);
              if (sectionId === "hero") renderHeroDisplay(true);
              form.reset();
              if (sectionId !== "about" && sectionId !== "moments") clearAvatarPreview();
            };
            reader.onerror = () => {
              addAndRender({ title: displayTitle, creator, link, desc, fileName: f.name });
            };
            reader.readAsDataURL(f);
          } else {
            addAndRender({ title: displayTitle, creator, link, desc, fileName: f.name });
          }
        } else {
          addAndRender({ title: displayTitle, creator, link, desc, fileDataUrl: "", fileName: "" });
        }
      } catch (err) {
        console.warn("Submit failed", err);
      }
    });
  }

  const momentsSubmitBtn = document.getElementById("moments-submit-btn");
  if (momentsSubmitBtn) {
    momentsSubmitBtn.addEventListener("click", () => {
      const dateInp = document.getElementById("moments-date");
      const contentInp = document.getElementById("moments-content");
      const emojiInp = document.getElementById("moments-emoji-input");
      let dateStr = (dateInp?.value || "").trim();
      if (dateStr) {
        const d = new Date(dateStr);
        if (!Number.isNaN(d.getTime())) {
          const pad = (n) => String(n).padStart(2, "0");
          dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }
      }
      if (!dateStr) {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      }
      const content = (contentInp?.value || "").trim();
      const emoji = (emojiInp?.value || "").trim();
      if (!content) return;
      const previewImg = detailView?.querySelector(".detail-avatar-preview-img");
      const imageDataUrl = (previewImg?.src && previewImg.src.startsWith("data:")) ? previewImg.src : "";
      const list = getSectionSubmissions("moments");
      list.push({
        id: "m-" + Date.now(),
        date: dateStr,
        content,
        emoji: emoji || undefined,
        imageDataUrl: imageDataUrl || undefined,
        likes: 0,
        comments: [],
      });
      setSectionSubmissions("moments", list);
      renderDisplayList("moments");
      if (contentInp) contentInp.value = "";
      if (emojiInp) emojiInp.value = "";
      if (previewImg) previewImg.src = "";
      const avatarInput = detailView?.querySelector(".detail-avatar-input");
      if (avatarInput) avatarInput.value = "";
      if (dateInp) {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        dateInp.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      }
    });
  }

  const SECTION_IDS = Object.keys(DETAIL_CONFIG || {});
  const importExportOverlay = document.getElementById("detail-import-export-overlay");
  const importExportBackdrop = document.getElementById("detail-import-export-backdrop");
  const importExportBtn = document.getElementById("detail-import-export-btn");
  const importClipboardBtn = document.getElementById("detail-import-clipboard-btn");
  const exportPdfA4Btn = document.getElementById("detail-export-pdf-a4");
  const exportPdfLongBtn = document.getElementById("detail-export-pdf-long");
  const importExportToast = document.getElementById("detail-import-export-toast");
  const t = (key) => ((I18N[getLang()] || I18N.zh)[key] || key);

  function showImportExportToast(message, isError) {
    if (!importExportToast) return;
    importExportToast.textContent = message;
    importExportToast.hidden = false;
    importExportToast.style.color = isError ? "#f87171" : "#94a3b8";
    clearTimeout(showImportExportToast._tid);
    showImportExportToast._tid = setTimeout(() => {
      importExportToast.hidden = true;
    }, 3000);
  }

  function closeImportExportOverlay() {
    if (importExportOverlay) {
      importExportOverlay.setAttribute("hidden", "");
      importExportOverlay.setAttribute("aria-hidden", "true");
    }
    if (importExportBtn) importExportBtn.setAttribute("aria-expanded", "false");
  }

  function applyImportedData(data) {
    if (!data || typeof data !== "object") return false;
    let applied = 0;
    SECTION_IDS.forEach((sectionId) => {
      const arr = data[sectionId];
      if (!Array.isArray(arr)) return;
      try {
        setSectionSubmissions(sectionId, arr);
        applied++;
      } catch (_) {}
    });
    return applied > 0;
  }

  if (importExportBtn && importExportOverlay) {
    importExportBtn.addEventListener("click", () => {
      const hidden = importExportOverlay.hasAttribute("hidden");
      if (hidden) {
        importExportOverlay.removeAttribute("hidden");
        importExportOverlay.setAttribute("aria-hidden", "false");
        importExportBtn.setAttribute("aria-expanded", "true");
      } else {
        closeImportExportOverlay();
      }
    });
  }
  if (importExportBackdrop) importExportBackdrop.addEventListener("click", closeImportExportOverlay);

  function escapeHtml(s) {
    if (s == null || s === "") return "";
    const t = String(s);
    return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function getThemeColor(cssVar) {
    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
      return v || null;
    } catch (_) {
      return null;
    }
  }

  function buildPdfExportHtml() {
    const lang = getLang();
    const isEn = lang === "en";
    const siteBg = getThemeColor("--theme-section") || getThemeColor("--theme-hero") || "#1e293b";
    const siteAccent = getThemeColor("--theme-detail-btn") || "#fbbf24";
    const siteCard = "#334155";
    const siteText = "#e2e8f0";
    const siteMuted = "#94a3b8";
    const siteBorder = "#475569";
    const rootStyle = "width:100%;padding:14px 18px;font-family:\'Microsoft YaHei\',\'PingFang SC\',sans-serif;font-size:12px;line-height:1.5;color:" + siteText + ";background:" + siteBg + ";box-sizing:border-box;";
    let html = '<div class="pdf-export-root" style="' + rootStyle + '">';
    html += '<header style="margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid ' + siteAccent + ';">';
    html += '<h1 style="font-size:18px;margin:0;font-weight:700;color:' + siteText + ';">' + escapeHtml(isEn ? "Site Summary" : "站点信息整理") + '</h1>';
    html += '<p style="margin:4px 0 0;font-size:11px;color:' + siteMuted + ';">' + escapeHtml(new Date().toLocaleDateString(lang === "en" ? "en-US" : "zh-CN", { year: "numeric", month: "long", day: "numeric" })) + '</p>';
    html += '</header>';
    let hasAny = false;
    SECTION_IDS.forEach((sectionId) => {
      const cfg = DETAIL_CONFIG[sectionId];
      const title = (cfg && cfg.displayTitle) ? (cfg.displayTitle[lang] || cfg.displayTitle.zh) : sectionId;
      const items = getSectionSubmissions(sectionId);
      if (!items || !items.length) return;
      hasAny = true;
      html += '<section style="margin-bottom:16px;page-break-inside:auto;">';
      html += '<h2 style="font-size:13px;margin:0 0 8px;padding-left:8px;border-left:3px solid ' + siteAccent + ';color:' + siteAccent + ';font-weight:700;line-height:1.3;">' + escapeHtml(title) + '</h2>';
      items.forEach((item) => {
        html += '<div class="pdf-item" style="margin-bottom:8px;padding:10px 12px;background:' + siteCard + ';border-radius:6px;border:1px solid ' + siteBorder + ';page-break-inside:avoid;">';
        if (item.name) html += '<p style="margin:0 0 4px;font-size:13px;font-weight:700;color:' + siteText + ';">' + escapeHtml(item.name) + '</p>';
        if (item.title) html += '<p style="margin:0 0 2px;font-size:11px;color:' + siteMuted + ';">' + escapeHtml(item.title) + '</p>';
        if (item.meta) html += '<p style="margin:0 0 2px;font-size:11px;color:' + siteMuted + ';">' + escapeHtml(item.meta) + '</p>';
        if (item.desc) html += '<p style="margin:6px 0 0;font-size:12px;white-space:pre-wrap;word-break:break-word;color:' + siteText + ';">' + escapeHtml(item.desc) + '</p>';
        if (item.content) html += '<p style="margin:6px 0 0;font-size:12px;white-space:pre-wrap;word-break:break-word;color:' + siteText + ';">' + escapeHtml(item.content) + '</p>';
        if (item.link) html += '<p style="margin:4px 0 0;font-size:11px;"><a href="' + escapeHtml(item.link) + '" style="color:' + siteAccent + ';">' + escapeHtml(item.link) + '</a></p>';
        if (item.date) html += '<p style="margin:2px 0 0;font-size:10px;color:' + siteMuted + ';">' + escapeHtml(item.date) + '</p>';
        if (item.fileDataUrl && String(item.fileDataUrl).startsWith("data:")) {
          html += '<p style="margin:6px 0 0;"><img src="' + item.fileDataUrl.replace(/"/g, "&quot;") + '" alt="" style="max-width:100%;height:auto;max-height:180px;border-radius:6px;display:block;border:1px solid ' + siteBorder + ';" /></p>';
        }
        html += '</div>';
      });
      html += '</section>';
    });
    if (!hasAny) {
      html += '<p style="color:' + siteMuted + ';font-size:13px;">' + escapeHtml(isEn ? "No content yet." : "当前暂无已填写内容。") + '</p>';
    }
    html += '</div>';
    return html;
  }

  function runPdfExport(mode) {
    const JSPDF = (typeof window.jspdf !== "undefined" && window.jspdf.jsPDF) || (typeof window.jsPDF !== "undefined" && window.jsPDF);
    if (typeof html2canvas === "undefined" || !JSPDF) {
      showImportExportToast(t("detail.importFail") + " (PDF 库未加载)", true);
      return;
    }
    const wrapper = document.createElement("div");
    wrapper.id = "pdf-export-wrap";
    wrapper.setAttribute("aria-hidden", "true");
    wrapper.style.cssText = "position:fixed;left:0;top:0;width:100%;height:100%;z-index:99999;display:flex;align-items:flex-start;justify-content:center;padding-top:24px;padding-bottom:24px;overflow:auto;background:rgba(0,0,0,0.5);";
    const inner = document.createElement("div");
    inner.style.cssText = "width:794px;max-width:96vw;box-shadow:0 8px 32px rgba(0,0,0,0.5);border-radius:12px;overflow:hidden;";
    inner.innerHTML = buildPdfExportHtml();
    wrapper.appendChild(inner);
    document.body.appendChild(wrapper);

    function removeWrapper() {
      if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
    }

    const filename = "克丽斯腾-站点信息-" + new Date().toISOString().slice(0, 10) + ".pdf";
    const MARGIN_MM = 6;
    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;
    const CONTENT_WIDTH_MM = A4_WIDTH_MM - MARGIN_MM * 2;
    const A4_CONTENT_HEIGHT_MM = A4_HEIGHT_MM - MARGIN_MM * 2;

    function doExport() {
      html2canvas(inner, { scale: 2, useCORS: true, allowTaint: true, logging: false }).then((canvas) => {
        const w = canvas.width;
        const h = canvas.height;
        if (!w || !h) {
          removeWrapper();
          showImportExportToast(t("detail.importFail"), true);
          return;
        }
        if (mode === "long") {
          const contentHeightMm = CONTENT_WIDTH_MM * (h / w);
          const pageHeightMm = MARGIN_MM * 2 + contentHeightMm;
          const doc = new JSPDF({
            unit: "mm",
            format: [A4_WIDTH_MM, pageHeightMm],
            hotfixes: ["px_scaling"],
          });
          doc.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", MARGIN_MM, MARGIN_MM, CONTENT_WIDTH_MM, contentHeightMm);
          doc.save(filename);
        } else {
          const pageContentHeightPx = (A4_CONTENT_HEIGHT_MM * w) / CONTENT_WIDTH_MM;
          const totalPages = Math.ceil(h / pageContentHeightPx);
          const doc = new JSPDF({
            unit: "mm",
            format: [A4_WIDTH_MM, A4_HEIGHT_MM],
            hotfixes: ["px_scaling"],
          });
          for (let i = 0; i < totalPages; i++) {
            if (i > 0) doc.addPage([A4_WIDTH_MM, A4_HEIGHT_MM]);
            const sourceY = i * pageContentHeightPx;
            const sliceHeightPx = Math.min(pageContentHeightPx, h - sourceY);
            const sliceHeightMm = (sliceHeightPx * CONTENT_WIDTH_MM) / w;
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = w;
            tempCanvas.height = sliceHeightPx;
            const ctx = tempCanvas.getContext("2d");
            ctx.drawImage(canvas, 0, sourceY, w, sliceHeightPx, 0, 0, w, sliceHeightPx);
            doc.addImage(tempCanvas.toDataURL("image/jpeg", 0.95), "JPEG", MARGIN_MM, MARGIN_MM, CONTENT_WIDTH_MM, sliceHeightMm);
          }
          doc.save(filename);
        }
        removeWrapper();
        showImportExportToast(t("detail.exportSuccess"));
      }).catch(() => {
        removeWrapper();
        showImportExportToast(t("detail.importFail"), true);
      });
    }

    setTimeout(doExport, 500);
  }

  if (exportPdfA4Btn) exportPdfA4Btn.addEventListener("click", () => runPdfExport("a4"));
  if (exportPdfLongBtn) exportPdfLongBtn.addEventListener("click", () => runPdfExport("long"));

  if (importClipboardBtn) {
    importClipboardBtn.addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (!text || !text.trim()) {
          showImportExportToast(t("detail.importFail"), true);
          return;
        }
        const trimmed = text.trim();
        let data = null;
        try {
          data = JSON.parse(trimmed);
        } catch (_) {}
        if (data && typeof data === "object" && !Array.isArray(data)) {
          if (applyImportedData(data)) {
            const sectionId = detailView?.dataset.currentSectionId;
            if (sectionId) renderDisplayList(sectionId);
            if (SECTION_IDS.includes("hero")) renderHeroDisplay(true);
            showImportExportToast(t("detail.importSuccess"));
            closeImportExportOverlay();
          } else {
            showImportExportToast(t("detail.importFail"), true);
          }
        } else {
          const list = getSectionSubmissions("moments");
          list.push({
            id: "m-" + Date.now(),
            date: getSubmittedAtDateString(),
            content: trimmed,
            likes: 0,
            comments: [],
          });
          setSectionSubmissions("moments", list);
          renderDisplayList("moments");
          showImportExportToast(t("detail.importSuccess"));
          closeImportExportOverlay();
        }
      } catch (e) {
        showImportExportToast(t("detail.importFail") + " (需授权剪贴板)", true);
      }
    });
  }

  });
