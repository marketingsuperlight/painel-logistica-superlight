const API_URL = 'https://script.google.com/macros/s/AKfycbyFCvbzaTAGBwqyUbr7xEk2jUEF-SxPAD3mNED-AUbXwjCx44SWjacSaSXZd-x6x1kXcQ/exec'; // URL copiado no Passo 2

let dadosTransportadoras = {};

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

// 2. Aplica os eventos (mouseover e mouseout) a cada estado do SVG
function aplicarEventosAoMapa() {
  // Seleciona todos os elementos 'path' (estados) dentro do seu SVG
  const estados = document.querySelectorAll('#mapa-svg path'); 
  const popover = document.getElementById('popover');

  estados.forEach(estado => {
    // Ex: id do estado é 'BR-SP', pegamos apenas 'SP'
    const uf = estado.id.replace('BR-', ''); 
    
    estado.addEventListener('mouseover', (e) => mostrarPopover(e, uf));
    estado.addEventListener('mouseout', esconderPopover);
  });
}

// 3. Mostra o popover com os dados do estado
function mostrarPopover(e, uf) {
    // Acessa o nome do estado a partir do elemento SVG (se ele tiver o atributo 'name')
    const estadoElement = e.target;
    // Tenta pegar o nome completo do atributo 'name', se existir. Senão, usa a UF.
    const nomeCompleto = estadoElement.getAttribute('name') || uf; 
    
    const listaTransportadoras = dadosTransportadoras[uf] || [];
    
    // Conteúdo do Popover
    let html = `<h4>${nomeCompleto} - ${listaTransportadoras.length} Transportadoras</h4>`;
    
    if (listaTransportadoras.length > 0) {
        html += '<ul>';
        listaTransportadoras.forEach(t => {
            // AQUI É ONDE USAMOS O <strong> PARA O NOVO DESIGN:
            html += `<li> 
                        Transportadora: <strong>${t.Transportadora}</strong><br>
                    </li>`;
        });
        html += '</ul>';
    } else {
        html += '<p>Nenhuma transportadora disponível para esta região.</p>';
    }

    // Posiciona o Popover
    popover.innerHTML = html;
    popover.style.display = 'block';

    // *** Melhoria de Usabilidade: Tenta ajustar a posição para não sair da tela ***
    
    // Calcula a largura da tela e a largura do popover
    const popoverWidth = popover.offsetWidth;
    const viewportWidth = window.innerWidth;
    
    let leftPosition = e.clientX + 15;
    let topPosition = e.clientY - 10;

    // Se o popover sair da tela à direita, joga ele para a esquerda do cursor
    if (leftPosition + popoverWidth > viewportWidth) {
        leftPosition = e.clientX - popoverWidth - 15;
    }

    popover.style.left = `${leftPosition}px`;
    popover.style.top = `${topPosition}px`;
}

// 4. Esconde o popover
function esconderPopover() {
  document.getElementById('popover').style.display = 'none';
}

// Inicia o processo
carregarDados();


