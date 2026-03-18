/* ═══════════════════════════════════════════════════════════════════════
   MULTIMIN® 90 — Página de Representantes
   JavaScript principal — Mapa interativo, menu mobile, formulário
   ═══════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initMobileMenu();
    initPhoneMask();
    initContactForm();
});


/* ═══════════════════════════════════════════════════════════════════════
   1. MAPA INTERATIVO
   Carrega os dados do JSON e torna os estados com representantes clicáveis
   ═══════════════════════════════════════════════════════════════════════ */

// Armazena os dados carregados do JSON para uso em todo o módulo
let representantesData = [];

async function initMap() {
    // Carrega os dados dos representantes do arquivo JSON externo.
    // Isso permite atualizar representantes sem mexer no código.
    try {
        const response = await fetch('data/representantes.json');
        if (!response.ok) {
            throw new Error(`Falha ao carregar JSON: ${response.status}`);
        }
        representantesData = await response.json();
    } catch (error) {
        console.warn('Não foi possível carregar representantes.json:', error);
        console.warn('Usando dados inline como fallback.');
        // Fallback com os dados embutidos caso o JSON não carregue
        representantesData = getFallbackData();
    }

    // Identifica quais estados possuem dados e marca como "ativos" (clicáveis)
    const stateIds = representantesData.map(item => item.id);
    const allStates = document.querySelectorAll('.state');

    allStates.forEach(state => {
        const stateId = state.id;
        if (stateIds.includes(stateId)) {
            // Este estado tem representantes — torna-o vermelho e clicável
            state.classList.add('state--active');
            state.addEventListener('click', (e) => handleStateClick(e, stateId));
        }
    });

    // Fecha o tooltip quando clica fora do mapa ou no botão de fechar
    document.getElementById('tooltipClose').addEventListener('click', closeTooltip);
    document.addEventListener('click', (e) => {
        const tooltip = document.getElementById('mapTooltip');
        const mapContainer = document.getElementById('mapContainer');
        // Fecha se o clique foi fora do mapa e fora do tooltip
        if (!mapContainer.contains(e.target)) {
            closeTooltip();
        }
    });
}

function handleStateClick(event, stateId) {
    event.stopPropagation();

    // Encontra os dados desse estado no array carregado
    const stateData = representantesData.find(item => item.id === stateId);
    if (!stateData) return;

    // Remove seleção visual de qualquer estado anteriormente selecionado
    document.querySelectorAll('.state--selected').forEach(el => {
        el.classList.remove('state--selected');
    });
    // Marca o estado clicado como selecionado (borda mais forte)
    event.currentTarget.classList.add('state--selected');

    // Preenche o conteúdo do tooltip
    const tooltipEstado = document.getElementById('tooltipEstado');
    const tooltipBody = document.getElementById('tooltipBody');
    tooltipEstado.textContent = stateData.estado;

    // Gera o HTML de cada representante desse estado
    tooltipBody.innerHTML = stateData.representantes.map(rep => `
        <div class="map-tooltip__rep">
            <strong>${rep.cidade}</strong>
            <span>${rep.nome}</span>
            <a href="tel:${rep.telefone.replace(/\D/g, '')}">${rep.telefone}</a>
        </div>
    `).join('');

    // Posiciona e exibe o tooltip
    positionTooltip(event);
}

function positionTooltip(event) {
    const tooltip = document.getElementById('mapTooltip');
    const container = document.getElementById('mapContainer');
    
    // Em mobile (largura <= 768px), o tooltip aparece fixo na parte inferior
    // da tela, como um "bottom sheet". Isso é controlado pelo CSS.
    if (window.innerWidth <= 768) {
        tooltip.style.left = '';
        tooltip.style.top = '';
        tooltip.classList.add('visible');
        return;
    }

    // Exibe temporariamente para calcular o tamanho real antes do posicionamento final.
    tooltip.classList.add('visible');

    // Em desktop, posiciona o tooltip próximo ao ponto de clique
    const containerRect = container.getBoundingClientRect();
    const clickX = event.clientX - containerRect.left;
    const clickY = event.clientY - containerRect.top;
    const tooltipRect = tooltip.getBoundingClientRect();

    // Ajusta para que o tooltip não saia dos limites do container
    let left = clickX + 15;
    let top = clickY - 20;

    // Se ultrapassar a direita, posiciona à esquerda do cursor
    if (left + tooltipRect.width > containerRect.width) {
        left = clickX - tooltipRect.width - 15;
    }
    // Se ultrapassar para baixo, ajusta para cima
    if (top + tooltipRect.height > containerRect.height) {
        top = clickY - tooltipRect.height - 15;
    }
    // Garante que não fique com valores negativos
    if (left < 0) left = 10;
    if (top < 0) top = 10;

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}

function closeTooltip() {
    const tooltip = document.getElementById('mapTooltip');
    tooltip.classList.remove('visible');
    // Remove seleção visual do estado
    document.querySelectorAll('.state--selected').forEach(el => {
        el.classList.remove('state--selected');
    });
}

// Dados de fallback caso o JSON externo não carregue
function getFallbackData() {
    return [
        {
            id: "br-sp", estado: "São Paulo",
            representantes: [
                { nome: "Eduardo Hara", cidade: "Araçatuba - SP", telefone: "18 99601 6371" },
                { nome: "Sylvio Di Jacintho", cidade: "São José do Rio Preto - SP", telefone: "17 99772 6801" },
                { nome: "Thiago Guzella", cidade: "Botucatu - SP", telefone: "19 99753 7102" },
                { nome: "Marcelo Gallerani Peres", cidade: "Tabapuã - SP", telefone: "17 99741 2462" }
            ]
        },
        {
            id: "br-ms", estado: "Mato Grosso do Sul",
            representantes: [
                { nome: "Everton Pereira", cidade: "Montes Claros - MS", telefone: "38 99857 7050" },
                { nome: "Deomar Carvalho Jr", cidade: "Inocência - MS", telefone: "18 99644 4090" },
                { nome: "Rafael Vicentini", cidade: "Três Lagoas - MS", telefone: "18 99121 7217" },
                { nome: "Vinicius Gusmão", cidade: "Dourados - MS", telefone: "67 98121 2961" },
                { nome: "Wagner Garcia", cidade: "Campo Grande - MS", telefone: "67 98121 5996" }
            ]
        },
        {
            id: "br-mt", estado: "Mato Grosso",
            representantes: [
                { nome: "Eduardo Siroto de Brito", cidade: "Alta Floresta - MT", telefone: "66 98436 4137" }
            ]
        },
        {
            id: "br-go", estado: "Goiás",
            representantes: [
                { nome: "Yuri Carneiro", cidade: "Goiânia - GO", telefone: "62 99856 6007" },
                { nome: "Wedson Maria Costa Jr.", cidade: "Uruaçu - GO", telefone: "62 9 9139 5958" }
            ]
        },
        {
            id: "br-al", estado: "Alagoas",
            representantes: [
                { nome: "João Cavalcanti", cidade: "Maceió - AL", telefone: "82 3142 9805" }
            ]
        }
    ];
}


/* ═══════════════════════════════════════════════════════════════════════
   2. MENU MOBILE
   Abre/fecha o menu lateral (nav drawer) e o overlay escuro
   ═══════════════════════════════════════════════════════════════════════ */

function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const nav = document.getElementById('navMobile');
    const close = document.getElementById('navClose');
    const overlay = document.getElementById('navOverlay');

    // Abre o menu ao tocar no botão hamburger
    toggle.addEventListener('click', () => {
        nav.classList.add('open');
        overlay.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // Trava o scroll do body
    });

    // Funções para fechar o menu
    function closeMenu() {
        nav.classList.remove('open');
        overlay.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = ''; // Libera o scroll
    }

    close.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    // Fecha o menu ao clicar em qualquer link dentro dele
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}


/* ═══════════════════════════════════════════════════════════════════════
   3. MÁSCARA DE TELEFONE
   Formata automaticamente o campo de telefone no padrão (XX) XXXXX-XXXX
   ═══════════════════════════════════════════════════════════════════════ */

function initPhoneMask() {
    const input = document.getElementById('inputTelefone');
    if (!input) return;

    input.addEventListener('input', (e) => {
        // Remove tudo que não é número
        let value = e.target.value.replace(/\D/g, '');
        
        // Limita a 11 dígitos (DDD + 9 dígitos)
        if (value.length > 11) value = value.slice(0, 11);

        // Aplica a máscara progressivamente
        if (value.length > 7) {
            // Formato completo: (XX) XXXXX-XXXX
            value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        } else if (value.length > 2) {
            // Formato parcial: (XX) XXXXX
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length > 0) {
            // Apenas DDD: (XX
            value = `(${value}`;
        }

        e.target.value = value;
    });
}


/* ═══════════════════════════════════════════════════════════════════════
   4. FORMULÁRIO DE CONTATO
   Validação client-side e envio (configurável para Formspree/API)
   ═══════════════════════════════════════════════════════════════════════ */

function initContactForm() {
    const form = document.getElementById('contactForm');
    const btnSubmit = document.getElementById('btnSubmit');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Limpa erros visuais anteriores
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

        // Valida campos obrigatórios
        const nome = form.querySelector('[name="nome"]');
        const email = form.querySelector('[name="email"]');
        const telefone = form.querySelector('[name="telefone"]');
        const cidade = form.querySelector('[name="cidade"]');
        const estado = form.querySelector('[name="estado"]');

        let isValid = true;

        // Verifica se cada campo obrigatório está preenchido
        [nome, email, telefone, cidade, estado].forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            }
        });

        // Valida formato do e-mail com uma expressão regular simples
        if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            email.classList.add('error');
            isValid = false;
        }

        // Valida telefone (precisa ter pelo menos 10 dígitos numéricos)
        const phoneDigits = telefone.value.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            telefone.classList.add('error');
            isValid = false;
        }

        if (!isValid) return;

        // ── Envio do formulário ──
        // Muda o texto do botão para feedback visual
        btnSubmit.textContent = 'Aguarde! Processando...';
        btnSubmit.disabled = true;

        try {
            // CONFIGURAÇÃO: Substitua a URL abaixo pelo endpoint real.
            // Opções: Formspree (https://formspree.io), EmailJS, ou API própria.
            // Exemplo Formspree: 'https://formspree.io/f/SEU_FORM_ID'
            const FORM_ENDPOINT = '#'; // ← Substituir pelo endpoint real

            if (FORM_ENDPOINT === '#') {
                // Modo demonstração — simula envio com sucesso após 1.5s
                await new Promise(resolve => setTimeout(resolve, 1500));
                btnSubmit.textContent = 'Enviado com sucesso!';
                form.reset();
            } else {
                // Envio real via fetch
                const formData = new FormData(form);
                const response = await fetch(FORM_ENDPOINT, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    btnSubmit.textContent = 'Enviado com sucesso!';
                    form.reset();
                } else {
                    throw new Error('Falha no envio');
                }
            }
        } catch (error) {
            btnSubmit.textContent = 'Erro ao enviar. Tente novamente!';
            console.error('Erro ao enviar formulário:', error);
        }

        // Reabilita o botão após 3 segundos para permitir novo envio
        setTimeout(() => {
            btnSubmit.textContent = 'Enviar';
            btnSubmit.disabled = false;
        }, 3000);
    });
}
