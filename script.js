/* =========================================================
   PEPINO v2 — script compartilhado
   O MENU e o RODAPÉ ficam aqui: mude uma vez, muda em todas as páginas.
   ========================================================= */

// ---------- botões da barra lateral ----------
// Para adicionar uma página nova, copie uma linha e troque os dados.
// { separador: true } desenha uma linha divisória.
const MENU = [
  { nome: "Home",       link: "index.html",    imagem: "favicon.png" },
  { nome: "Membros",    link: "membros.html",  icone: "🧑‍🤝‍🧑" },
  { nome: "Projetos",   link: "projetos.html", icone: "🛠️" },
  { nome: "RPG",        link: "rpg.html",      icone: "🎲" },
  { nome: "Lore",       link: "lore.html",     icone: "📜" },
  { separador: true },
  { nome: "Discord",    link: "https://discord.gg/Jna6Ru8eWD", imagem: "disc.png", externo: true },
];
// (use "icone" pra emoji ou "imagem" pra um arquivo da pasta images)

const GITHUB = "https://github.com/pepino-dev";

// ---------- Área de membros (login "de mentirinha") ----------
// Os @ do Discord (sem o @), separados por situação. Só os ATIVOS conseguem entrar.
// Pra mudar alguém de situação, recorte o @ e cole na outra lista.
const LOGIN_ATIVOS = [
  "fekkho", "httpspedru", "brenex5212", "leothenard", "luizz1603", "lucasbcc",
  "furmelancholy", "seupaidecalcinha6026", "rodrekee", "ouhkaes",
];
const LOGIN_OCIOSOS = ["gabigrc", "gisicolin", "furyed_"];
const LOGIN_EX = ["bandeco", "fencer"];
// A senha não fica escrita aqui, só um "código" dela (SHA-256).
// Pra trocar a senha, peça pro Claude gerar o código da senha nova.
const LOGIN_SENHA_HASH = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";

function usuarioLogado() {
  try { return localStorage.getItem("pepino-membro"); } catch (e) { return null; }
}

// ---------- monta a barra de cima e a barra lateral ----------
function montarNav() {
  // <body data-menu="rpg.html"> faz uma página "filha" acender o botão da página mãe
  const paginaAtual = document.body.dataset.menu || location.pathname.split("/").pop() || "index.html";
  const itens = MENU.map((i) =>
    i.separador
      ? "<hr>"
      : `<a href="${i.link}" title="${i.nome}"${i.link === paginaAtual ? ' class="atual" aria-current="page"' : ""}${i.externo ? ' target="_blank" rel="noopener"' : ""}>
           <span class="ico">${i.imagem ? `<img src="images/${i.imagem}" alt="">` : i.icone}</span><span class="rot">${i.nome}</span>
         </a>`
  ).join("");

  const nav = document.createElement("header");
  nav.className = "nav";
  nav.innerHTML = `
    <button class="botao-lateral" type="button" aria-label="Abrir ou recolher o menu">☰</button>
    <a class="nav-marca" href="index.html">
      <img src="images/favicon.png" alt=""><span>PEPINO</span>
    </a>
    <a class="botao botao-area${paginaAtual === "area.html" ? " atual" : ""}" href="area.html">
      ${usuarioLogado() ? `<span class="ico">🟢</span><span class="txt">@${usuarioLogado()}</span>` : `<span class="ico">🔒</span><span class="txt">Área de membros</span>`}
    </a>`;
  const lateral = document.createElement("nav");
  lateral.className = "lateral";
  lateral.innerHTML = itens;
  const fundo = document.createElement("div");
  fundo.className = "lateral-fundo";
  document.body.prepend(nav, lateral, fundo);
  document.body.classList.add("com-lateral");

  // ☰ no computador: recolhe/expande (e lembra a escolha). No celular: abre por cima.
  const celular = window.matchMedia("(max-width: 900px)");
  let mini = false;
  try { mini = localStorage.getItem("lateral-mini") === "1"; } catch (e) {}
  const aplicar = () => {
    document.body.classList.toggle("lateral-mini", mini && !celular.matches);
    if (!celular.matches) document.body.classList.remove("lateral-aberta");
  };
  aplicar();
  celular.addEventListener("change", aplicar);
  // outras páginas podem pedir pra barra começar recolhida (sem mudar a preferência salva)
  window.recolherLateral = () => {
    mini = true;
    document.body.style.transition = "none"; // recolhe na hora, sem animação de entrada
    aplicar();
    requestAnimationFrame(() => (document.body.style.transition = ""));
  };

  nav.querySelector(".botao-lateral").addEventListener("click", () => {
    if (celular.matches) {
      document.body.classList.toggle("lateral-aberta");
    } else {
      mini = !mini;
      try { localStorage.setItem("lateral-mini", mini ? "1" : "0"); } catch (e) {}
      aplicar();
    }
  });
  fundo.addEventListener("click", () => document.body.classList.remove("lateral-aberta"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") document.body.classList.remove("lateral-aberta"); });
}

// ---------- monta o rodapé com a caixa portal ----------
function montarRodape() {
  const rodape = document.createElement("footer");
  rodape.className = "rodape";
  rodape.innerHTML = `
    <a class="portal" href="${GITHUB}" target="_blank" rel="noopener" title="GitHub do Pepino">
      <img src="images/Portal_Box_sprite_001.webp" alt="Caixa portal — abre o GitHub">
    </a>
    <p>Site Oficial do Pepino - by <a href="membros.html#felipe">@fekkho</a></p>`;
  document.body.append(rodape);
}

// ---------- fundo de partículas roxas que reagem ao mouse ----------
function montarFundo() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.createElement("canvas");
  canvas.id = "fundo";
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");
  const mouse = { x: -9999, y: -9999 };
  let pontos = [];

  // Otimizações (pra não pesar a placa de vídeo):
  // - desenha 30 vezes por segundo (antes era a cada quadro do monitor, até 144x)
  // - desenha em resolução normal da tela (as bolinhas são pequenas, não faz diferença)
  // - para de desenhar quando a aba não está visível
  const FPS = 30;
  const INTERVALO = 1000 / FPS;
  const VEL = 60 / FPS; // compensa a velocidade pra parecer igual a antes
  const ALCANCE = 120, ALCANCE2 = ALCANCE * ALCANCE;

  function redimensionar() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    const qtd = Math.min(80, Math.floor((innerWidth * innerHeight) / 16000));
    pontos = Array.from({ length: qtd }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.4 * VEL,
      vy: (Math.random() - 0.5) * 0.4 * VEL,
      r: Math.random() * 1.6 + 0.6,
    }));
  }

  function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // bolinhas (todas num desenho só)
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(199,125,255,0.85)";
    ctx.beginPath();
    for (const p of pontos) {
      // o mouse empurra as partículas
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < ALCANCE2) { const d = Math.sqrt(d2) || 1; p.x += (dx / d) * 1.5 * VEL; p.y += (dy / d) * 1.5 * VEL; }
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
      ctx.moveTo(p.x + p.r, p.y);
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    }
    ctx.fill();
    // linhas entre partículas próximas
    ctx.strokeStyle = "rgb(160,32,240)";
    ctx.lineWidth = 1;
    for (let i = 0; i < pontos.length; i++) {
      const a = pontos[i];
      for (let j = i + 1; j < pontos.length; j++) {
        const b = pontos[j];
        const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < ALCANCE2) {
          ctx.globalAlpha = 0.35 * (1 - Math.sqrt(d2) / ALCANCE);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  let ultimo = 0, rodando = false;
  function loop(t) {
    if (!rodando) return;
    requestAnimationFrame(loop);
    if (t - ultimo < INTERVALO) return;
    ultimo = t;
    desenhar();
  }
  function iniciar() { if (!rodando) { rodando = true; requestAnimationFrame(loop); } }
  function parar() { rodando = false; }
  document.addEventListener("visibilitychange", () => (document.hidden ? parar() : iniciar()));

  addEventListener("resize", () => { redimensionar(); desenhar(); });
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
  redimensionar();
  desenhar();
  if (!document.hidden) iniciar();
}

// ---------- elementos aparecem suavemente ao rolar ----------
function animarEntrada() {
  const els = document.querySelectorAll(".cartao, .item, .titulo");
  if (!("IntersectionObserver" in window)) return;
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visivel"); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach((el) => { el.classList.add("aparecer"); obs.observe(el); });
}

montarNav();
montarRodape();
montarFundo();
animarEntrada();
