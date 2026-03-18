# MULTIMIN® 90 — Página de Representantes (Reconstrução)

## O que é este projeto?
Reconstrução moderna da página de Representantes do site multimin.com.br, sem dependência de WordPress ou plugins pagos.

## Estrutura de pastas
```
multimin-project/
├── index.html              ← Página principal (abrir no navegador)
├── css/
│   └── styles.css          ← Todos os estilos visuais
├── js/
│   └── main.js             ← Lógica do mapa, menu e formulário
├── data/
│   └── representantes.json ← Dados dos representantes (editável)
├── assets/
│   ├── images/             ← Colocar logos e imagens aqui
│   │   ├── logo-01.svg     (logo do header - PENDENTE)
│   │   ├── logo.svg        (logo do footer - PENDENTE)
│   │   ├── favicon.png     (ícone da aba - PENDENTE)
│   │   └── bg.jpg          (fundo do banner - PENDENTE)
│   └── maps/
│       └── brazil.svg      (mapa SVG detalhado - PENDENTE*)
└── README.md               ← Este arquivo
```

## Como testar
1. Abra o arquivo `index.html` em qualquer navegador moderno
2. Os estados com representantes aparecem em vermelho no mapa
3. Clique em um estado vermelho para ver os representantes

## O que está pendente (marcado como PLACEHOLDER no código)
- **Imagens da marca**: Logotipos SVG, favicon e imagem de fundo do banner
- **Mapa SVG detalhado**: O mapa incluído é simplificado. Para produção, substituir pelo SVG real do Brasil (baixar de amcharts.com/svg-maps mantendo os IDs no padrão `br-xx`)
- **Endpoint do formulário**: Configurar o serviço de envio (Formspree, EmailJS ou API). Editar a variável `FORM_ENDPOINT` no arquivo `js/main.js`
- **E-mails dos executivos**: Atualmente com placeholder. Substituir pelos reais

## Como atualizar representantes
Edite o arquivo `data/representantes.json`. O formato é auto-explicativo:
```json
{
  "id": "br-xx",         ← ID do estado no SVG do mapa
  "estado": "Nome",      ← Nome do estado
  "representantes": [
    {
      "nome": "...",
      "cidade": "...",
      "telefone": "..."
    }
  ]
}
```
Salve o arquivo e recarregue a página. O novo representante aparecerá automaticamente.
