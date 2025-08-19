// Variável global para armazenar as folhas renderizadas na tela
let sheetsToPrint = [];

function renderPrizeInputs() {
    const numCards = document.querySelector('input[name="numCards"]:checked').value;
    const container = document.getElementById('prizeInputsContainer');
    container.innerHTML = '';

    for (let i = 0; i < numCards; i++) {
        const label = document.createElement('label');
        label.textContent = `Prêmio ${i + 1}:`;
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `prize${i + 1}`;
        input.placeholder = `Descreva o prêmio ${i + 1}`;
        input.required = true;
        
        container.appendChild(label);
        container.appendChild(input);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const radioButtons = document.querySelectorAll('input[name="numCards"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', renderPrizeInputs);
    });
    renderPrizeInputs();
});

// A função generateSheets() agora apenas mostra uma mensagem
function generateSheets() {
    // Escondemos o botão de download para evitar cliques acidentais
    document.getElementById('downloadButton').style.display = 'block';
    
    // Apenas para mostrar ao usuário que o processo está pronto
    const outputArea = document.getElementById('output-area');
    outputArea.innerHTML = '<p>Folhas prontas para o download. Clique em "Baixar PDF" para gerar o documento.</p>';
}

// NOVO CÓDIGO: Envia os dados para a API do Vercel
async function downloadPDF() {
    const downloadButton = document.getElementById('downloadButton');
    downloadButton.textContent = 'Gerando...';
    downloadButton.disabled = true;

    const establishmentName = document.getElementById('establishmentName').value;
    const eventLocation = document.getElementById('eventLocation').value;
    const bingoDay = document.getElementById('bingoDay').value;
    const bingoTime = document.getElementById('bingoTime').value;
    const numCards = document.querySelector('input[name="numCards"]:checked').value;
    const numPages = document.getElementById('numPages').value;

    const prizes = [];
    for (let i = 0; i < numCards; i++) {
        const prizeValue = document.getElementById(`prize${i + 1}`).value;
        prizes.push(prizeValue);
    }

    const payload = {
        establishmentName,
        eventLocation,
        bingoDay,
        bingoTime,
        numCards,
        numPages,
        prizes
    };

    try {
        // Manda os dados para a nossa função no Vercel
        const response = await fetch('/api/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Falha na geração do PDF.');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bingo-folhas-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

    } catch (error) {
        alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
        console.error('Erro na requisição:', error);
    } finally {
        downloadButton.textContent = 'Baixar PDF';
        downloadButton.disabled = false;
    }
}