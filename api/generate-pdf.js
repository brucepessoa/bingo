// Importa o módulo 'playwright-core' e, para o Vercel, o @sparticuz/chromium
import { chromium } from 'playwright-core';
import chromium_serverless from '@sparticuz/chromium';

// Define o caminho para o executável do navegador, usando a versão para Vercel
const CHROME_EXECUTABLE_PATH = process.env.CHROME_EXECUTABLE_PATH || chromium_serverless.executablePath;

// Função para gerar os números da cartela
function generateBingoCardNumbers() {
    const numbers = { B: [], I: [], N: [], G: [], O: [] };
    // Lógica para gerar os números
    while (numbers.B.length < 5) {
        const num = Math.floor(Math.random() * 15) + 1;
        if (!numbers.B.includes(num)) numbers.B.push(num);
    }
    while (numbers.I.length < 5) {
        const num = Math.floor(Math.random() * 15) + 16;
        if (!numbers.I.includes(num)) numbers.I.push(num);
    }
    while (numbers.N.length < 4) {
        const num = Math.floor(Math.random() * 15) + 31;
        if (!numbers.N.includes(num)) numbers.N.push(num);
    }
    while (numbers.G.length < 5) {
        const num = Math.floor(Math.random() * 15) + 46;
        if (!numbers.G.includes(num)) numbers.G.push(num);
    }
    while (numbers.O.length < 5) {
        const num = Math.floor(Math.random() * 15) + 61;
        if (!numbers.O.includes(num)) numbers.O.push(num);
    }
    return numbers;
}

// A função que será executada pelo Vercel
export default async (req, res) => {
    // Garante que é um método POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    try {
        const { establishmentName, eventLocation, bingoDay, bingoTime, numCards, numPages, prizes } = req.body;
        
        let htmlContent = '';
        const headerHtml = `
            <div class="sheet-header">
                <div class="header-top-info">
                    <div class="establishment-banner">${establishmentName.toUpperCase()}</div>
                </div>
                <div class="header-mid">
                    <div class="show-title">
                        <div class="show">SHOW</div>
                        <div class="de-premios">de prêmios</div>
                    </div>
                    <div class="event-details">
                        <div class="date-time">${bingoDay.split('-').reverse().join('/')} ÀS ${bingoTime.slice(0, 5)}H</div>
                        <div class="location">${eventLocation.toUpperCase()}</div>
                    </div>
                </div>
            </div>`;

        // Loop para gerar todas as folhas
        for (let i = 0; i < numPages; i++) {
            let cardsHtml = '';
            for (let j = 0; j < numCards; j++) {
                const masterNumbers = generateBingoCardNumbers();
                const prizeLabel = `${j + 1}º Prêmio: ${prizes[j]}`;
                cardsHtml += `
                    <div class="bingo-card">
                        <table>
                            <thead><tr><th>B</th><th>I</th><th>N</th><th>G</th><th>O</th></tr></thead>
                            <tbody>
                                <tr><td>${masterNumbers.B[0]}</td><td>${masterNumbers.I[0]}</td><td>${masterNumbers.N[0]}</td><td>${masterNumbers.G[0]}</td><td>${masterNumbers.O[0]}</td></tr>
                                <tr><td>${masterNumbers.B[1]}</td><td>${masterNumbers.I[1]}</td><td>${masterNumbers.N[1]}</td><td>${masterNumbers.G[1]}</td><td>${masterNumbers.O[1]}</td></tr>
                                <tr><td>${masterNumbers.B[2]}</td><td>${masterNumbers.I[2]}</td><td class="free-space">Livre</td><td>${masterNumbers.G[2]}</td><td>${masterNumbers.O[2]}</td></tr>
                                <tr><td>${masterNumbers.B[3]}</td><td>${masterNumbers.I[3]}</td><td>${masterNumbers.N[2]}</td><td>${masterNumbers.G[3]}</td><td>${masterNumbers.O[3]}</td></tr>
                                <tr><td>${masterNumbers.B[4]}</td><td>${masterNumbers.I[4]}</td><td>${masterNumbers.N[3]}</td><td>${masterNumbers.G[4]}</td><td>${masterNumbers.O[4]}</td></tr>
                            </tbody>
                        </table>
                        <div class="prize-box">${prizeLabel}</div>
                    </div>
                `;
            }
            // Adiciona a folha completa com o cabeçalho e a numeração
            htmlContent += `
                <div class="full-sheet">
                    ${headerHtml}
                    <div class="page-info">Folha ${i + 1}</div>
                    <div class="sheet-container">${cardsHtml}</div>
                </div>
            `;
        }

        const fullHtml = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Bingo Sheets</title>
                    <style>
                        body { margin: 0; padding: 0; }
                        /* Coloque o seu CSS aqui */
                        .full-sheet { page-break-after: always; }
                        .full-sheet:last-of-type { page-break-after: avoid; }
                        
                        .sheet-header {
                            width: 100%;
                            padding: 15px;
                            margin-bottom: 20px;
                            text-align: left;
                            position: relative;
                            box-sizing: border-box;
                            display: flex;
                            flex-direction: column;
                            gap: 10px; 
                        }
                        
                        .page-info {
                            font-size: 16px;
                            font-weight: bold;
                            position: absolute;
                            top: 10px;
                            right: 10px;
                            padding: 5px;
                        }
                        
                        .header-top-info {
                            display: flex;
                            justify-content: center;
                            width: 100%;
                        }
                        
                        .establishment-banner {
                            background-color: #b0c4de;
                            color: white;
                            padding: 10px 20px;
                            font-size: 18px;
                            font-weight: bold;
                            text-align: center;
                            border-radius: 5px;
                        }
                        
                        .header-mid {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-end;
                        }
                        
                        .show-title {
                            display: flex;
                            flex-direction: column;
                            align-items: flex-start;
                        }
                        
                        .show {
                            font-size: 60px;
                            font-family: Arial, sans-serif;
                            line-height: 1;
                        }
                        
                        .de-premios {
                            font-size: 24px;
                            font-style: italic;
                            margin-left: 10px;
                            margin-top: 5px;
                        }
                        
                        .event-details {
                            display: flex;
                            flex-direction: column;
                            align-items: flex-end;
                            font-weight: bold;
                            font-size: 14px;
                            line-height: 1.2;
                        }
                        
                        .date-time {
                            text-transform: uppercase;
                        }
                        
                        .location {
                            text-transform: uppercase;
                        }
                        
                        .sheet-container {
                            display: flex;
                            flex-wrap: wrap;
                            justify-content: space-around;
                            padding: 10px;
                            border: 1px solid #ddd;
                            margin-bottom: 15px;
                        }
                        
                        .bingo-card {
                            border: 2px solid #333;
                            padding: 8px;
                            text-align: center;
                            width: 300px;
                            margin: 5px;
                        }
                        
                        .bingo-card table {
                            width: 100%;
                            border-collapse: collapse;
                        }
                        
                        .bingo-card th, .bingo-card td {
                            border: 1px solid #999;
                            padding: 10px;
                            font-size: 22px;
                        }
                        
                        .bingo-card th {
                            background-color: #f0f0f0;
                        }
                        
                        .free-space {
                            background-color: #ccc;
                        }
                        
                        .prize-box {
                            margin-top: 10px;
                            border: 1px solid #333;
                            padding: 8px;
                            font-size: 16px;
                        }
                    </style>
                </head>
                <body>
                    <div id="output-area">${htmlContent}</div>
                </body>
            </html>
        `;

        // Usa o navegador headless para gerar o PDF
        const browser = await chromium.launch({
            args: [...chromium.args, '--font-render-hinting=none'],
            executablePath: await chromium.executablePath(),
            headless: true,
        });

        const page = await browser.newPage();
        await page.setContent(fullHtml, { waitUntil: 'domcontentloaded' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm',
            },
        });
        
        await browser.close();

        // Envia o PDF para o navegador do cliente
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=bingo-folhas.pdf`);
        res.status(200).send(pdfBuffer);

    } catch (error) {
        console.error('Erro na função serverless:', error);
        res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
    }
};