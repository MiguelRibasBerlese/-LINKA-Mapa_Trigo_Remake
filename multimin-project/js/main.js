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
let filteredStateIds = [];
const STATE_MARKER_POSITIONS = {
    'br-ac': { x: 83, y: 227 },
    'br-al': { x: 410, y: 252 },
    'br-am': { x: 167, y: 151 },
    'br-ap': { x: 335, y: 77 },
    'br-ba': { x: 364, y: 300 },
    'br-ce': { x: 413, y: 176 },
    'br-df': { x: 296, y: 282 },
    'br-es': { x: 360, y: 350 },
    'br-go': { x: 282, y: 298 },
    'br-ma': { x: 347, y: 191 },
    'br-mg': { x: 315, y: 337 },
    'br-ms': { x: 222, y: 351 },
    'br-mt': { x: 225, y: 272 },
    'br-pa': { x: 277, y: 152 },
    'br-pb': { x: 432, y: 206 },
    'br-pe': { x: 425, y: 226 },
    'br-pi': { x: 379, y: 205 },
    'br-pr': { x: 244, y: 418 },
    'br-rj': { x: 330, y: 374 },
    'br-rn': { x: 435, y: 185 },
    'br-ro': { x: 135, y: 253 },
    'br-rr': { x: 203, y: 77 },
    'br-rs': { x: 232, y: 500 },
    'br-sc': { x: 252, y: 463 },
    'br-se': { x: 405, y: 275 },
    'br-sp': { x: 271, y: 387 },
    'br-to': { x: 284, y: 235 }
};

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
    renderMapHotspots(representantesData);

    const stateIds = representantesData.map(item => item.id);
    filteredStateIds = [...stateIds];
    const allStates = document.querySelectorAll('.map-hotspot');

    allStates.forEach(state => {
        const stateId = state.dataset.stateId;
        if (stateIds.includes(stateId)) {
            state.setAttribute('role', 'button');
            state.setAttribute('tabindex', '0');
            state.setAttribute('aria-label', `Ver representantes de ${state.dataset.name}`);
            state.addEventListener('click', () => handleStateSelection(stateId));
            state.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleStateSelection(stateId);
                }
            });
        }
    });

    updateMapStats(representantesData);
    renderStateButtons(representantesData);
    initMapSearch();

    const clearButton = document.getElementById('clearSelection');
    if (clearButton) {
        clearButton.addEventListener('click', resetMapSelection);
    }
}

function handleStateSelection(stateId) {
    const stateData = representantesData.find(item => item.id === stateId);
    if (!stateData) return;

    setSelectedState(stateId);
    const selectedStateName = document.getElementById('selectedStateName');
    const selectedStateSummary = document.getElementById('selectedStateSummary');
    const tooltipBody = document.getElementById('tooltipBody');
    selectedStateName.textContent = stateData.estado;
    selectedStateSummary.textContent = `${stateData.representantes.length} representante(s) disponível(is) neste estado.`;
    tooltipBody.innerHTML = stateData.representantes.map(rep => `
        <div class="map-tooltip__rep">
            <strong>${rep.cidade}</strong>
            <span>${rep.nome}</span>
            <a href="tel:${rep.telefone.replace(/\D/g, '')}">${rep.telefone}</a>
        </div>
    `).join('');
    document.getElementById('selectionCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function setSelectedState(stateId) {
    document.querySelectorAll('.map-hotspot--selected').forEach(el => {
        el.classList.remove('map-hotspot--selected');
    });
    document.querySelectorAll('.map-state-list__button--selected').forEach(button => {
        button.classList.remove('map-state-list__button--selected');
    });

    const currentState = document.querySelector(`[data-state-id="${stateId}"]`);
    const currentButton = document.querySelector(`[data-state-button="${stateId}"]`);
    if (currentState) currentState.classList.add('map-hotspot--selected');
    if (currentButton) currentButton.classList.add('map-state-list__button--selected');
}

function resetMapSelection() {
    setSelectedState('');
    document.getElementById('selectedStateName').textContent = 'Selecione um estado no mapa';
    document.getElementById('selectedStateSummary').textContent = 'Os estados destacados em vermelho têm representantes cadastrados.';
    document.getElementById('tooltipBody').innerHTML = '<p class="map-empty">Clique em um estado ativo para ver os contatos.</p>';
}

function updateMapStats(data) {
    const activeStates = data.length;
    const totalRepresentantes = data.reduce((total, item) => total + item.representantes.length, 0);
    document.getElementById('activeStatesCount').textContent = String(activeStates);
    document.getElementById('activeRepsCount').textContent = String(totalRepresentantes);
}

function renderStateButtons(data) {
    const container = document.getElementById('mapStateList');
    container.innerHTML = data.map(item => `
        <button type="button" class="map-state-list__button" data-state-button="${item.id}">
            <span>${item.estado}</span>
            <small>${item.representantes.length} contato(s)</small>
        </button>
    `).join('');

    container.querySelectorAll('[data-state-button]').forEach(button => {
        button.addEventListener('click', () => handleStateSelection(button.dataset.stateButton));
    });
}

function initMapSearch() {
    const searchInput = document.getElementById('mapSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const query = normalizeText(searchInput.value);
        const filteredData = representantesData.filter(item => {
            const haystack = [
                item.estado,
                ...item.representantes.flatMap(rep => [rep.nome, rep.cidade, rep.telefone])
            ].join(' ');

            return normalizeText(haystack).includes(query);
        });

        filteredStateIds = filteredData.map(item => item.id);
        updateMapVisibility(filteredStateIds);
        renderStateButtons(filteredData);
        updateMapStats(filteredData);

        if (!filteredData.length) {
            document.getElementById('selectedStateName').textContent = 'Nenhum resultado encontrado';
            document.getElementById('selectedStateSummary').textContent = 'Tente buscar por outro estado, cidade ou representante.';
            document.getElementById('tooltipBody').innerHTML = '<p class="map-empty">Nenhum representante encontrado para este filtro.</p>';
            return;
        }

        const hasSelectedVisibleState = document.querySelector('.map-hotspot--selected:not(.map-hotspot--hidden)');
        if (!hasSelectedVisibleState) {
            resetMapSelection();
        }
    });
}

function updateMapVisibility(visibleStateIds) {
    document.querySelectorAll('.map-hotspot').forEach(state => {
        const isActive = representantesData.some(item => item.id === state.dataset.stateId);
        const isVisible = visibleStateIds.includes(state.dataset.stateId);
        state.classList.toggle('map-hotspot--hidden', isActive && !isVisible);
    });
}

function normalizeText(value) {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

function renderMapHotspots(data) {
    const hotspotGroup = document.getElementById('mapHotspots');
    if (!hotspotGroup) return;

    hotspotGroup.innerHTML = data.map(item => {
        const position = STATE_MARKER_POSITIONS[item.id];
        if (!position) return '';

        const shortName = item.estado
            .split(' ')
            .map(word => word[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

        return `
            <g class="map-hotspot" data-state-id="${item.id}" data-name="${item.estado}" transform="translate(${position.x} ${position.y})">
                <circle class="map-hotspot__pulse" r="18"></circle>
                <circle class="map-hotspot__dot" r="12"></circle>
                <text class="map-hotspot__label" y="4" text-anchor="middle">${shortName}</text>
            </g>
        `;
    }).join('');
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
