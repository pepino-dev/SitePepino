/* =========================================================
   PEPINO v2 — script compartilhado
   O MENU e o RODAPÉ ficam aqui: mude uma vez, muda em todas as páginas.
   ========================================================= */

// ---------- itens da gaveta (menu) ----------
// Para adicionar uma página nova, copie uma linha e troque os dados.
const MENU = [
  { nome: "Membros",    link: "membros.html",  icone: "👥" },
  { nome: "Projetos",   link: "projetos.html", icone: "🛠️" },
  { nome: "RPG",        link: "rpg.html",      icone: "🎲" },
  { nome: "Lore",       link: "lore.html",     icone: "📜" },
  { separador: true },
  { nome: "Discord",    link: "https://discord.gg/Jna6Ru8eWD", icone: "💬", externo: true },
];

const GITHUB = "https://github.com/pepino-dev";

// ---------- monta a barra de cima ----------
function montarNav() {
  const itens = MENU.map((i, n) =>
    i.separador
      ? `<hr style="--i:${n}">`
      : `<a href="${i.link}" style="--i:${n}"${i.externo ? ' target="_blank" rel="noopener"' : ""}>
           <span class="ico">${i.icone}</span>${i.nome}
         </a>`
  ).join("");

  const nav = document.createElement("header");
  nav.className = "nav";
  nav.innerHTML = `
    <a class="nav-marca" href="index.html">
      <img src="images/favicon.png" alt=""><span>PEPINO</span>
    </a>
    <nav class="nav-botoes">
      <div class="gaveta-wrap">
        <a class="botao" href="index.html" id="botao-home" aria-haspopup="true" aria-expanded="false">
          Home <span class="seta">▼</span>
        </a>
        <div class="gaveta" role="menu">${itens}</div>
      </div>
    </nav>`;
  document.body.prepend(nav);

  // No celular não existe "passar o mouse": o 1º toque abre a gaveta, o 2º vai pra Home.
  const wrap = nav.querySelector(".gaveta-wrap");
  const botao = nav.querySelector("#botao-home");
  const semMouse = () =>
    window.matchMedia("(hover: none), (max-width: 600px)").matches;

  botao.addEventListener("click", (e) => {
    if (semMouse() && !wrap.classList.contains("aberta")) {
      e.preventDefault();
      wrap.classList.add("aberta");
      botao.setAttribute("aria-expanded", "true");
    }
  });
  // teclado: abre com setinha pra baixo, fecha com Esc
  botao.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); wrap.classList.add("aberta"); wrap.querySelector(".gaveta a").focus(); }
  });
  wrap.addEventListener("focusout", (e) => { if (!wrap.contains(e.relatedTarget)) wrap.classList.remove("aberta"); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") wrap.classList.remove("aberta"); });
  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) { wrap.classList.remove("aberta"); botao.setAttribute("aria-expanded", "false"); }
  });
}

// ---------- monta o rodapé com a caixa portal ----------
function montarRodape() {
  const rodape = document.createElement("footer");
  rodape.className = "rodape";
  rodape.innerHTML = `
    <a class="portal" href="${GITHUB}" target="_blank" rel="noopener" title="GitHub do Pepino">
      <img src="images/Portal_Box_sprite_001.webp" alt="Caixa portal — abre o GitHub">
    </a>
    <p>Site Oficial Pepino - by FeeF</p>`;
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

  function redimensionar() {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    const qtd = Math.min(110, Math.floor((innerWidth * innerHeight) / 14000));
    pontos = Array.from({ length: qtd }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.6 + 0.6,
    }));
  }

  function desenhar() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of pontos) {
      // o mouse empurra as partículas
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 120) { p.x += (dx / d) * 1.5; p.y += (dy / d) * 1.5; }
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(199,125,255,0.85)";
      ctx.fill();
    }
    // linhas entre partículas próximas
    for (let i = 0; i < pontos.length; i++) {
      for (let j = i + 1; j < pontos.length; j++) {
        const a = pontos[i], b = pontos[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) {
          ctx.strokeStyle = `rgba(160,32,240,${0.35 * (1 - d / 120)})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(desenhar);
  }

  addEventListener("resize", redimensionar);
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
  redimensionar();
  desenhar();
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
