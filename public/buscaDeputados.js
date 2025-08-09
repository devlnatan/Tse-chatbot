const baseUrlTodosOsCandidatos = "https://dadosabertos.camara.leg.br/api/v2/deputados?ordem=ASC&ordenarPor=nome"

const inputFicha = document.querySelector("#nomeInput")
const resultadoDiv = document.querySelector("#retorno")

// Função para formatar valores monetários
function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor)
}

// Função para formatar datas
function formatarData(data) {
  return new Date(data).toLocaleDateString("pt-BR")
}

// Função para obter informações completas do deputado
async function obterInformacoesCompletas(deputado) {
  const promises = [
    // Despesas
    fetch(`https://dadosabertos.camara.leg.br/api/v2/deputados/${deputado.id}/despesas?ano=2024&ordem=DESC&itens=10`)
      .then((res) => res.json())
      .catch(() => ({ dados: [] })),

    // Proposições
    fetch(
      `https://dadosabertos.camara.leg.br/api/v2/proposicoes?idDeputadoAutor=${deputado.id}&ordem=DESC&ordenarPor=id&itens=5`,
    )
      .then((res) => res.json())
      .catch(() => ({ dados: [] })),

    // Órgãos
    fetch(`https://dadosabertos.camara.leg.br/api/v2/deputados/${deputado.id}/orgaos`)
      .then((res) => res.json())
      .catch(() => ({ dados: [] })),

    // Profissões
    fetch(`https://dadosabertos.camara.leg.br/api/v2/deputados/${deputado.id}/profissoes`)
      .then((res) => res.json())
      .catch(() => ({ dados: [] })),

    // Histórico
    fetch(`https://dadosabertos.camara.leg.br/api/v2/deputados/${deputado.id}/historico`)
      .then((res) => res.json())
      .catch(() => ({ dados: [] })),
  ]

  const [despesas, proposicoes, orgaos, profissoes, historico] = await Promise.all(promises)

  return {
    despesas: despesas.dados || [],
    proposicoes: proposicoes.dados || [],
    orgaos: orgaos.dados || [],
    profissoes: profissoes.dados || [],
    historico: historico.dados || [],
  }
}

// Função para criar o HTML das informações completas
function criarHTMLCompleto(deputado, dados) {
  const totalDespesas = dados.despesas.reduce((total, despesa) => total + (despesa.valorLiquido || 0), 0)

  return `
    <div class="deputy-profile">
       Cabeçalho do Deputado 
      <div class="deputy-header">
        <div class="deputy-photo">
          ${deputado.urlFoto ? `<img src="${deputado.urlFoto}" alt="Foto de ${deputado.nome}">` : '<div class="no-photo">📷</div>'}
        </div>
        <div class="deputy-basic-info">
          <h2>${deputado.nome}</h2>
          <div class="deputy-tags">
            <span class="tag party">${deputado.siglaPartido}</span>
            <span class="tag state">${deputado.siglaUf}</span>
            <span class="tag status">Ativo</span>
          </div>
          <p class="deputy-email">📧 ${deputado.email}</p>
        </div>
      </div>

       Estatísticas Rápidas 
      <div class="quick-stats">
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <span class="stat-value">${formatarMoeda(totalDespesas)}</span>
            <span class="stat-label">Gastos em 2024</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <span class="stat-value">${dados.proposicoes.length}</span>
            <span class="stat-label">Propostas Recentes</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏢</div>
          <div class="stat-info">
            <span class="stat-value">${dados.orgaos.length}</span>
            <span class="stat-label">Comissões</span>
          </div>
        </div>
      </div>

       Abas de Informações 
      <div class="info-tabs">
        <div class="tab-buttons">
          <button class="tab-btn active" data-tab="propostas">📊 Projetos</button>
          <button class="tab-btn" data-tab="despesas">💰 Gastos</button>
          <button class="tab-btn" data-tab="orgaos">🏢 Comissões</button>
          <button class="tab-btn" data-tab="perfil">👤 Perfil</button>
        </div>

         Aba Propostas 
        <div class="tab-content active" id="propostas">
          <h3>🎯 Principais Projetos e Propostas</h3>
          ${
            dados.proposicoes.length > 0
              ? `
            <div class="propostas-list">
              ${dados.proposicoes
                .slice(0, 3)
                .map(
                  (prop) => `
                <div class="proposta-card">
                  <div class="proposta-header">
                    <span class="proposta-tipo">${prop.siglaTipo} ${prop.numero}/${prop.ano}</span>
                    <span class="proposta-status">${prop.statusProposicao?.descricaoSituacao || "Em tramitação"}</span>
                  </div>
                  <h4>${prop.ementa}</h4>
                  <p class="proposta-meta">📅 ${formatarData(prop.dataApresentacao)}</p>
                </div>
              `,
                )
                .join("")}
            </div>
            <div class="explanation-box">
              <h4>💡 O que isso significa?</h4>
              <p>Estes são os projetos de lei e propostas mais recentes apresentados pelo deputado. Cada proposta passa por várias etapas até virar lei.</p>
            </div>
          `
              : `
            <div class="empty-state">
              <div class="empty-icon">📝</div>
              <p>Nenhuma proposta recente encontrada</p>
            </div>
          `
          }
        </div>

         Aba Despesas 
        <div class="tab-content" id="despesas">
          <h3>💳 Como o dinheiro público foi usado</h3>
          ${
            dados.despesas.length > 0
              ? `
            <div class="despesas-summary">
              <div class="total-gasto">
                <span class="total-label">Total gasto em 2024:</span>
                <span class="total-value">${formatarMoeda(totalDespesas)}</span>
              </div>
            </div>
            <div class="despesas-list">
              ${dados.despesas
                .slice(0, 5)
                .map(
                  (despesa) => `
                <div class="despesa-card">
                  <div class="despesa-info">
                    <h4>${despesa.tipoDespesa}</h4>
                    <p>${despesa.fornecedor}</p>
                    <span class="despesa-data">📅 ${formatarData(despesa.dataDocumento)}</span>
                  </div>
                  <div class="despesa-valor">
                    ${formatarMoeda(despesa.valorLiquido)}
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
            <div class="explanation-box">
              <h4>💡 Entenda os gastos</h4>
              <p>Deputados têm direito a uma cota parlamentar para custear atividades relacionadas ao mandato, como passagens, hospedagem, combustível e material de escritório. Todos os gastos são públicos e fiscalizados.</p>
            </div>
          `
              : `
            <div class="empty-state">
              <div class="empty-icon">💰</div>
              <p>Nenhuma despesa encontrada para 2024</p>
            </div>
          `
          }
        </div>

         Aba Órgãos 
        <div class="tab-content" id="orgaos">
          <h3>🏛️ Comissões e Cargos</h3>
          ${
            dados.orgaos.length > 0
              ? `
            <div class="orgaos-list">
              ${dados.orgaos
                .map(
                  (orgao) => `
                <div class="orgao-card">
                  <div class="orgao-info">
                    <h4>${orgao.nome}</h4>
                    <p>${orgao.titulo || "Membro"}</p>
                    <span class="orgao-periodo">📅 ${formatarData(orgao.dataInicio)} - ${orgao.dataFim ? formatarData(orgao.dataFim) : "Atual"}</span>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
            <div class="explanation-box">
              <h4>💡 O que são as comissões?</h4>
              <p>Comissões são grupos de deputados que analisam projetos de lei em áreas específicas (saúde, educação, economia, etc.). É onde os projetos são debatidos antes de ir ao plenário.</p>
            </div>
          `
              : `
            <div class="empty-state">
              <div class="empty-icon">🏢</div>
              <p>Nenhuma comissão encontrada</p>
            </div>
          `
          }
        </div>

         Aba Perfil 
        <div class="tab-content" id="perfil">
          <h3>👤 Perfil Completo</h3>
          <div class="perfil-info">
            <div class="info-section">
              <h4>📋 Informações Básicas</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Nome Completo:</span>
                  <span class="info-value">${deputado.nome}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Partido:</span>
                  <span class="info-value">${deputado.siglaPartido}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Estado:</span>
                  <span class="info-value">${deputado.siglaUf}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${deputado.email}</span>
                </div>
              </div>
            </div>

            ${
              dados.profissoes.length > 0
                ? `
              <div class="info-section">
                <h4>💼 Profissões</h4>
                <div class="profissoes-list">
                  ${dados.profissoes
                    .map(
                      (prof) => `
                    <span class="profissao-tag">${prof.titulo}</span>
                  `,
                    )
                    .join("")}
                </div>
              </div>
            `
                : ""
            }

            <div class="info-section">
              <h4>🔗 Links Úteis</h4>
              <div class="links-grid">
                <a href="https://www.camara.leg.br/deputados/${deputado.id}" target="_blank" class="info-link">
                  🏛️ Página Oficial na Câmara
                </a>
                <a href="https://www.camara.leg.br/deputados/${deputado.id}/biografia" target="_blank" class="info-link">
                  📖 Biografia Completa
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

// Event listener principal
document.querySelector("#buscarButton").addEventListener("click", async () => {
  const nome = inputFicha.value.trim().toLowerCase()

  if (!nome) {
    resultadoDiv.innerHTML = `
      <div class="error-message">
        <div class="error-icon">⚠️</div>
        <p>Por favor, digite o nome de um deputado</p>
      </div>
    `
    return
  }

  // Mostrar loading
  resultadoDiv.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">Buscando informações completas...</div>
      <div class="loading-subtitle">Isso pode levar alguns segundos</div>
    </div>
  `

  try {
    // Buscar deputado
    const response = await fetch(baseUrlTodosOsCandidatos)
    const data = await response.json()

    const deputado = data.dados.find((dep) => dep.nome.toLowerCase().includes(nome))

    if (!deputado) {
      resultadoDiv.innerHTML = `
        <div class="error-message">
          <div class="error-icon">❌</div>
          <h3>Deputado não encontrado</h3>
          <p><strong>"${inputFicha.value}"</strong> não foi encontrado</p>
          <div class="error-suggestions">
            <p>Dicas:</p>
            <ul>
              <li>✅ Digite o nome completo</li>
              <li>✅ Verifique a ortografia</li>
              <li>✅ Tente usar as sugestões acima</li>
            </ul>
          </div>
        </div>
      `
      return
    }

    // Buscar informações completas
    const dadosCompletos = await obterInformacoesCompletas(deputado)

    // Exibir resultado
    resultadoDiv.innerHTML = criarHTMLCompleto(deputado, dadosCompletos)

    // Adicionar funcionalidade das abas
    adicionarFuncionalidadeAbas()
  } catch (error) {
    console.error("Erro:", error)
    resultadoDiv.innerHTML = `
      <div class="error-message">
        <div class="error-icon">⚠️</div>
        <h3>Erro na busca</h3>
        <p>Ocorreu um erro ao buscar as informações. Tente novamente.</p>
        <p class="error-detail">Erro: ${error.message}</p>
      </div>
    `
  }
})

// Função para adicionar funcionalidade das abas
function adicionarFuncionalidadeAbas() {
  const tabButtons = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab")

      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      // Add active class to clicked button and corresponding content
      button.classList.add("active")
      document.getElementById(targetTab).classList.add("active")
    })
  })
}

// Adicionar estilos CSS dinamicamente
const style = document.createElement("style")
style.textContent = `
  /* Estilos para o perfil do deputado */
  .deputy-profile {
    animation: slideInUp 0.6s ease-out;
  }

  .deputy-header {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
    padding: 25px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border-radius: 16px;
    border: 1px solid rgba(102, 126, 234, 0.2);
  }

  .deputy-photo img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid white;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .no-photo {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    border: 4px solid white;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .deputy-basic-info {
    flex: 1;
  }

  .deputy-basic-info h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 12px;
  }

  .deputy-tags {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .tag {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .tag.party {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .tag.state {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    color: white;
  }

  .tag.status {
    background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
    color: white;
  }

  .deputy-email {
    color: #718096;
    font-size: 0.95rem;
    font-weight: 500;
  }

  /* Quick Stats */
  .quick-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px;
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    font-size: 2rem;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border-radius: 12px;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 1.4rem;
    font-weight: 700;
    color: #2d3748;
  }

  .stat-label {
    font-size: 0.9rem;
    color: #718096;
    font-weight: 500;
  }

  /* Tabs */
  .info-tabs {
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  }

  .tab-buttons {
    display: flex;
    background: #f7fafc;
    border-bottom: 1px solid #e2e8f0;
    overflow-x: auto;
  }

  .tab-btn {
    padding: 16px 20px;
    border: none;
    background: transparent;
    color: #718096;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    border-bottom: 3px solid transparent;
    box-shadow: none;
  }

  .tab-btn:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    transform: none;
    box-shadow: none;
  }

  .tab-btn.active {
    background: white;
    color: #667eea;
    border-bottom-color: #667eea;
  }

  .tab-content {
    display: none;
    padding: 30px;
  }

  .tab-content.active {
    display: block;
    animation: fadeIn 0.4s ease-out;
  }

  .tab-content h3 {
    font-size: 1.4rem;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 20px;
  }

  /* Propostas */
  .propostas-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 25px;
  }

  .proposta-card {
    padding: 20px;
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
  }

  .proposta-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .proposta-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .proposta-tipo {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .proposta-status {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .proposta-card h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 8px;
    line-height: 1.4;
  }

  .proposta-meta {
    color: #718096;
    font-size: 0.9rem;
    font-weight: 500;
  }

  /* Despesas */
  .despesas-summary {
    background: linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(56, 161, 105, 0.1) 100%);
    padding: 20px;
    border-radius: 12px;
    border: 1px solid rgba(72, 187, 120, 0.2);
    margin-bottom: 20px;
  }

  .total-gasto {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .total-label {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2d3748;
  }

  .total-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #48bb78;
  }

  .despesas-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 25px;
  }

  .despesa-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
  }

  .despesa-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  }

  .despesa-info {
    flex: 1;
  }

  .despesa-info h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 4px;
  }

  .despesa-info p {
    font-size: 0.9rem;
    color: #718096;
    margin-bottom: 4px;
  }

  .despesa-data {
    font-size: 0.8rem;
    color: #a0aec0;
    font-weight: 500;
  }

  .despesa-valor {
    font-size: 1.2rem;
    font-weight: 700;
    color: #e53e3e;
  }

  /* Órgãos */
  .orgaos-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 25px;
  }

  .orgao-card {
    padding: 20px;
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
  }

  .orgao-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .orgao-info h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 8px;
  }

  .orgao-info p {
    font-size: 1rem;
    color: #667eea;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .orgao-periodo {
    font-size: 0.9rem;
    color: #718096;
    font-weight: 500;
  }

  /* Perfil */
  .perfil-info {
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  .info-section {
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    padding: 20px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }

  .info-section h4 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 15px;
  }

  .info-grid {
    display: grid;
    gap: 12px;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  .info-label {
    font-weight: 600;
    color: #4a5568;
  }

  .info-value {
    font-weight: 500;
    color: #2d3748;
  }

  .profissoes-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .profissao-tag {
    padding: 6px 12px;
    background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
    color: white;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .links-grid {
    display: grid;
    gap: 12px;
  }

  .info-link {
    display: block;
    padding: 12px 16px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .info-link:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
  }

  /* Explanation boxes */
  .explanation-box {
    background: linear-gradient(135deg, rgba(237, 137, 54, 0.1) 0%, rgba(221, 107, 32, 0.1) 100%);
    padding: 20px;
    border-radius: 12px;
    border: 1px solid rgba(237, 137, 54, 0.2);
    margin-top: 20px;
  }

  .explanation-box h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 10px;
  }

  .explanation-box p {
    color: #4a5568;
    line-height: 1.6;
    font-weight: 500;
  }

  /* Empty states */
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #718096;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 15px;
    opacity: 0.7;
  }

  .empty-state p {
    font-size: 1.1rem;
    font-weight: 500;
  }

  /* Error states */
  .error-message {
    text-align: center;
    padding: 40px 20px;
  }

  .error-icon {
    font-size: 3rem;
    margin-bottom: 15px;
  }

  .error-message h3 {
    font-size: 1.4rem;
    font-weight: 700;
    color: #e53e3e;
    margin-bottom: 10px;
  }

  .error-message p {
    color: #718096;
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .error-suggestions {
    background: linear-gradient(135deg, rgba(229, 62, 62, 0.1) 0%, rgba(197, 48, 48, 0.1) 100%);
    padding: 20px;
    border-radius: 12px;
    border: 1px solid rgba(229, 62, 62, 0.2);
    margin-top: 20px;
    text-align: left;
    display: inline-block;
  }

  .error-suggestions p {
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 10px;
  }

  .error-suggestions ul {
    list-style: none;
    padding: 0;
  }

  .error-suggestions li {
    color: #4a5568;
    margin-bottom: 5px;
    font-weight: 500;
  }

  .error-detail {
    font-size: 0.9rem !important;
    color: #a0aec0 !important;
    font-style: italic;
  }

  /* Responsividade para os novos elementos */
  @media (max-width: 768px) {
    .deputy-header {
      flex-direction: column;
      text-align: center;
      gap: 15px;
    }

    .deputy-photo img,
    .no-photo {
      width: 80px;
      height: 80px;
    }

    .deputy-basic-info h2 {
      font-size: 1.5rem;
    }

    .quick-stats {
      grid-template-columns: 1fr;
    }

    .tab-buttons {
      flex-wrap: wrap;
    }

    .tab-btn {
      flex: 1;
      min-width: 120px;
    }

    .proposta-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .total-gasto {
      flex-direction: column;
      align-items: flex-start;
      gap: 5px;
    }

    .despesa-card {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .despesa-valor {
      align-self: flex-end;
    }
  }

  @media (max-width: 480px) {
    .deputy-header {
      padding: 20px;
    }

    .deputy-photo img,
    .no-photo {
      width: 70px;
      height: 70px;
    }

    .deputy-basic-info h2 {
      font-size: 1.3rem;
    }

    .tab-content {
      padding: 20px;
    }

    .stat-card {
      padding: 15px;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      font-size: 1.5rem;
    }

    .stat-value {
      font-size: 1.2rem;
    }

    .proposta-card,
    .orgao-card {
      padding: 15px;
    }

    .info-section {
      padding: 15px;
    }
  }
`
document.head.appendChild(style)
