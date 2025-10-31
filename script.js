const API_URL = 'https://script.google.com/macros/s/AKfycbyFCvbzaTAGBwqyUbr7xEk2jUEF-SxPAD3mNED-AUbXwjCx44SWjacSaSXZd-x6x1kXcQ/exec';

let dadosTransportadoras = {};
const mapaSVG = document.getElementById('mapa-svg'); // Variável global para o mapa
let estados; // Variável global para os estados (path)

// 1. Carrega os dados da "API" (Google Apps Script)
async function carregarDados() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    dadosTransportadoras = await response.json();
    aplicarEventosAoMapa();
  } catch (error) {
    console.error("Erro ao carregar os dados:", error);
  }
}

// 2. Aplica os eventos (agora apenas 'click') a cada estado do SVG
function aplicarEventosAoMapa() {
    estados = mapaSVG.querySelectorAll('path'); // Atribui à variável global 'estados'
    
    window.estadoAtivo = null;

    estados.forEach(estado => {
        const uf = estado.id.replace('BR-', ''); 
        
        // 1. CLIQUE: Abre o popover e desativa o mapa
        estado.addEventListener('click', function(e) {
            e.stopPropagation(); 
            
            // Limpa o estado ativo anterior e aplica o novo destaque
            estados.forEach(e => e.style.fill = '#007B8C'); 
            this.style.fill = '#FF6600'; 
            window.estadoAtivo = this;
            
            mostrarPopover(e, uf);
        });
        
        // 2. HOVER (Mouseover/Mouseout) - Mantém apenas o feedback visual de cor
        estado.addEventListener('mouseover', function() {
            if (this !== window.estadoAtivo) {
                 this.style.fill = '#FF6600';
            }
        });

        estado.addEventListener('mouseout', function() {
            if (this !== window.estadoAtivo) {
                 this.style.fill = '#007B8C';
            }
        });
    });

    // 3. NOVO: Adiciona um evento para fechar o popover ao clicar FORA
    document.addEventListener('click', function(e) {
        const popover = document.getElementById('popover');
        
        if (popover.style.display === 'block') { // Apenas se o popover estiver visível
            // Se o clique não foi no mapa SVG e não foi no popover, esconde
            if (!mapaSVG.contains(e.target) && !popover.contains(e.target)) {
                esconderPopover();
                // Restaura a cor de todos os estados
                estados.forEach(e => e.style.fill = '#007B8C'); 
                window.estadoAtivo = null;
            }
        }
    });
}

// 3. Mostra o popover com os dados do estado
function mostrarPopover(e, uf) {
    const popover = document.getElementById('popover');
    const estadoElement = e.target;
    const nomeCompleto = estadoElement.getAttribute('name') || uf; 
    const listaTransportadoras = dadosTransportadoras[uf] || [];
    
    // Conteúdo do Popover: ADICIONANDO O BOTÃO DE FECHAR
    let html = `
        <button id="fechar-popover">X</button>
        <h4>${nomeCompleto} - ${listaTransportadoras.length} Transportadoras</h4>
    `;
    
    if (listaTransportadoras.length > 0) {
        // [HTML da lista]
        html += '<ul>';
        listaTransportadoras.forEach(t => {
            html += `<li> 
                        Transportadora: <strong>${t.Transportadora}</strong><br>
                        Serviço: ${t.Tipo_Servico} | Prazo: <strong>${t.Prazo_dias} dias</strong>
                    </li>`;
        });
        html += '</ul>';
    } else {
        html += '<p>Nenhuma transportadora disponível para esta região.</p>';
    }

    // Posiciona o Popover
    popover.innerHTML = html;
    popover.style.display = 'block';
    
    // ATENÇÃO: Habilita o bloqueio de cliques no mapa
    mapaSVG.classList.add('map-disabled'); 

    // *** REMOVEMOS O CÓDIGO DE POSICIONAMENTO DO MOUSE AQUI ***
    
    // NOVO: Adiciona o evento para fechar ao clicar no botão
    // Deve ser atribuído APÓS o innerHTML
    document.getElementById('fechar-popover').addEventListener('click', function() {
        esconderPopover();
        // Restaura a cor do estado ativo ao fechar pelo botão
        if (window.estadoAtivo) {
            window.estadoAtivo.style.fill = '#007B8C';
            window.estadoAtivo = null;
        }
    });
}

// 4. Esconde o popover
function esconderPopover() {
  const popover = document.getElementById('popover');
  popover.style.display = 'none';
  // ATENÇÃO: Remove o bloqueio de cliques no mapa
  mapaSVG.classList.remove('map-disabled'); 
}

// Inicia o processo
carregarDados();