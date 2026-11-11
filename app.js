/**
 * Apple-style Multi-Theme Engine & Live Code Playground
 */

// Okamžitá aplikace tématu ještě před vykreslením DOM (podpora URL parametru i localStorage)
(function() {
    try {
        var match = window.location.search.match(/[?&]theme=([a-zA-Z0-9_-]+)/);
        var theme = match ? decodeURIComponent(match[1]) : (localStorage.getItem('apple_web_theme') || 'light');
        document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
        try {
            document.documentElement.setAttribute('data-theme', 'light');
        } catch(err) {}
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Rozšířený správce témat (10 různých motivů s 100% perzistencí)
    // -------------------------------------------------------------
    const THEMES = {
        'light':    { name: 'Světlý', color: '#0071e3' },
        'dark':     { name: 'Space Black', color: '#2997ff' },
        'midnight': { name: 'Půlnoční', color: '#38bdf8' },
        'purple':   { name: 'Fialový titan', color: '#a855f7' },
        'titanium': { name: 'Přírodní titan', color: '#eab308' },
        'green':    { name: 'Alpská zeleň', color: '#10b981' },
        'paper':    { name: 'Kniha & Papír', color: '#c25e37' },
        'rose':     { name: 'Růžové zlato', color: '#f43f5e' },
        'matrix':   { name: 'Terminál Matrix', color: '#22c55e' },
        'nord':     { name: 'Nord Frost', color: '#88c0d0' },
        'sunset':   { name: 'Západ slunce', color: '#f97316' },
        'cyberpunk':{ name: 'Cyberpunk', color: '#00f0ff' },
        'dracula':  { name: 'Dracula Pro', color: '#bd93f9' },
        'tokyo':    { name: 'Tokyo Night', color: '#7aa2f7' },
        'solarized-light': { name: 'Solarized Světlý', color: '#268bd2' },
        'deep-ocean': { name: 'Hluboký oceán', color: '#0ea5e9' }
    };

    const themeTriggerBtn = document.getElementById('theme-trigger');
    const themePopover = document.getElementById('theme-popover');
    const currentThemeLabel = document.getElementById('current-theme-label');
    const activeDot = document.querySelector('.theme-active-dot');
    const themeButtons = document.querySelectorAll('[data-set-theme]');

    function getInitialTheme() {
        try {
            const match = window.location.search.match(/[?&]theme=([a-zA-Z0-9_-]+)/);
            if (match && THEMES[match[1]]) {
                return match[1];
            }
            const saved = localStorage.getItem('apple_web_theme');
            if (saved && THEMES[saved]) return saved;
        } catch (e) {}
        return 'light';
    }

    // Aktualizace všech interních odkazů na stránce, aby nesly ?theme=
    function syncThemeToLinks(themeKey) {
        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                const [base, hash] = href.split('#');
                const [path, search] = base.split('?');
                if (path.endsWith('.html') || path === '' || path === './') {
                    const params = new URLSearchParams(search || '');
                    params.set('theme', themeKey);
                    link.setAttribute('href', path + '?' + params.toString() + (hash ? '#' + hash : ''));
                }
            }
        });
    }

    function setTheme(themeKey) {
        if (!THEMES[themeKey]) themeKey = 'light';

        document.documentElement.setAttribute('data-theme', themeKey);
        try {
            localStorage.setItem('apple_web_theme', themeKey);
        } catch (e) {}

        // Aktualizovat URL v adresním řádku bez reloadu stránky
        try {
            if (window.history && window.history.replaceState) {
                const url = new URL(window.location.href);
                url.searchParams.set('theme', themeKey);
                window.history.replaceState({}, '', url.toString());
            }
        } catch (e) {}

        const themeData = THEMES[themeKey];
        if (currentThemeLabel) {
            currentThemeLabel.textContent = themeData.name;
        }
        if (activeDot) {
            activeDot.style.backgroundColor = themeData.color;
        }

        // Aktualizovat aktivní stavy na všech tlačítkách (v popoveru i v hero liště)
        themeButtons.forEach(btn => {
            if (btn.getAttribute('data-set-theme') === themeKey) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Synchronizovat do všech odkazů na stránce
        syncThemeToLinks(themeKey);
    }

    // Globální zachycení kliknutí na odkazy – zaručuje přenos motivu i pro dynamické prvky
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (link) {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                const [base, hash] = href.split('#');
                const [path, search] = base.split('?');
                if (path.endsWith('.html') || path === '' || path === './') {
                    const params = new URLSearchParams(search || '');
                    params.set('theme', currentTheme);
                    link.href = path + '?' + params.toString() + (hash ? '#' + hash : '');
                }
            }
        }
    }, true);

    // Inicializace
    const activeTheme = getInitialTheme();
    setTheme(activeTheme);

    // Otevírání a zavírání vyskakovacího menu (popover)
    if (themeTriggerBtn && themePopover) {
        themeTriggerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            themePopover.classList.toggle('open');
        });

        // Zavřít při kliknutí mimo
        document.addEventListener('click', (e) => {
            if (!themePopover.contains(e.target) && !themeTriggerBtn.contains(e.target)) {
                themePopover.classList.remove('open');
            }
        });
    }

    // Obsluha kliknutí na jakékoli tlačítko pro výběr motivu
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-set-theme');
            setTheme(theme);
            if (themePopover) themePopover.classList.remove('open');
            showToast(`Motiv nastaven: ${THEMES[theme]?.name || theme}`);
        });
    });

    // -------------------------------------------------------------
    // 2. Toast notifikace
    // -------------------------------------------------------------
    let toastTimeout;
    function showToast(message = "Akce dokončena") {
        let toast = document.querySelector('.toast-notice');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast-notice';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2200);
    }

    // -------------------------------------------------------------
    // 3. Živý interaktivní editor (Live Code Playground)
    // -------------------------------------------------------------
    const playgroundCards = document.querySelectorAll('.playground-card');

    playgroundCards.forEach(card => {
        const textarea = card.querySelector('.code-textarea');
        const preview = card.querySelector('.preview-render');
        const resetBtn = card.querySelector('.btn-reset');
        const copyBtn = card.querySelector('.btn-copy');
        const statusBadge = card.querySelector('.pane-badge');

        if (!textarea || !preview) return;

        const initialCode = textarea.value.trim();
        card.dataset.initialCode = initialCode;

        function updateLivePreview() {
            preview.innerHTML = textarea.value;

            if (statusBadge) {
                if (textarea.value.trim() !== initialCode) {
                    statusBadge.textContent = "Živě upraveno";
                    statusBadge.style.color = "var(--accent)";
                } else {
                    statusBadge.textContent = "Živý náhled";
                    statusBadge.style.color = "";
                }
            }
        }

        textarea.addEventListener('input', updateLivePreview);

        // Klávesa Tab pro odsazení
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, start) + "    " + textarea.value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + 4;
                updateLivePreview();
            }
        });

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                textarea.value = initialCode;
                updateLivePreview();
                showToast("Původní kód obnoven ↺");
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(textarea.value);
                    showToast("Kód zkopírován do schránky ✓");
                } catch (err) {
                    textarea.select();
                    document.execCommand('copy');
                    showToast("Kód zkopírován ✓");
                }
            });
        }

        // Inicializace při startu
        updateLivePreview();
    });

    // -------------------------------------------------------------
    // 4. Spotlight vyhledávání v glosáři pojmů
    // -------------------------------------------------------------
    const glossaryInput = document.querySelector('.glossary-search-input');
    const glossaryTable = document.querySelector('.glossary-table');

    if (glossaryInput && glossaryTable) {
        const rows = glossaryTable.querySelectorAll('tbody tr');
        glossaryInput.addEventListener('input', () => {
            const query = glossaryInput.value.toLowerCase().trim();
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // -------------------------------------------------------------
    // 5. Interaktivní maturitní flashcards (Otázky & Odpovědi)
    // -------------------------------------------------------------
    const maturitaCards = document.querySelectorAll('.maturita-card');
    maturitaCards.forEach(card => {
        const q = card.querySelector('.maturita-q');
        const a = card.querySelector('.maturita-a');
        if (q && a) {
            // Výchozí stav – schováno
            a.style.display = 'none';
            q.addEventListener('click', () => {
                const isOpen = a.style.display === 'block';
                a.style.display = isOpen ? 'none' : 'block';
                const arrow = q.querySelector('.maturita-arrow');
                if (arrow) {
                    arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
                }
            });
        }
    });

    // -------------------------------------------------------------
    // 6. Interaktivní Maturitní Kvíz
    // -------------------------------------------------------------
    const quizContainer = document.getElementById('maturita-quiz');
    if (quizContainer) {
        const questionBoxes = quizContainer.querySelectorAll('.quiz-question-box');
        const scoreSpan = document.getElementById('quiz-score');
        const totalSpan = document.getElementById('quiz-total');
        const resetBtn = document.getElementById('btn-reset-quiz');
        const retryBtn = document.getElementById('btn-quiz-retry');
        const banner = document.getElementById('quiz-banner');
        const bannerTitle = document.getElementById('quiz-banner-title');
        const bannerDesc = document.getElementById('quiz-banner-desc');

        let score = 0;
        let answeredCount = 0;
        const totalQuestions = questionBoxes.length;
        if (totalSpan) totalSpan.textContent = totalQuestions;

        function checkCompletion() {
            if (answeredCount >= totalQuestions && banner) {
                banner.style.display = 'block';
                const percent = Math.round((score / totalQuestions) * 100);
                if (percent >= 85) {
                    bannerTitle.textContent = `🎉 Výborně! Známka: 1 (${score}/${totalQuestions} bodů - ${percent} %)`;
                    bannerDesc.textContent = "Perfektní výkon! Z témat webu i informatiky máš skvělé znalosti a maturitu bys zvládl na jedničku.";
                } else if (percent >= 70) {
                    bannerTitle.textContent = `👏 Chvalitebně! Známka: 2 (${score}/${totalQuestions} bodů - ${percent} %)`;
                    bannerDesc.textContent = "Velmi dobrý výsledek. Pár drobných chyb, ale klíčové základy máš pevně v malíku.";
                } else if (percent >= 50) {
                    bannerTitle.textContent = `👍 Dobře! Známka: 3 (${score}/${totalQuestions} bodů - ${percent} %)`;
                    bannerDesc.textContent = "Základy ovládáš, ale některé záludnosti tě zaskočily. Projdi si jednotlivé moduly v laboratoři.";
                } else {
                    bannerTitle.textContent = `⚠️ Potřeba procvičit! (${score}/${totalQuestions} bodů - ${percent} %)`;
                    bannerDesc.textContent = "Nezoufej! Prozkoumej interaktivní příklady a taháky v této aplikaci a zkus test znovu.";
                }
                banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        questionBoxes.forEach(box => {
            const buttons = box.querySelectorAll('.quiz-option-btn');
            const explanation = box.querySelector('.quiz-explanation');

            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    if (box.dataset.answered === 'true') return;
                    box.dataset.answered = 'true';
                    answeredCount++;

                    const isCorrect = btn.getAttribute('data-correct') === 'true';
                    if (isCorrect) {
                        btn.classList.add('correct');
                        score++;
                        if (scoreSpan) scoreSpan.textContent = score;
                    } else {
                        btn.classList.add('wrong');
                        // Zvýraznit správnou odpověď zeleně
                        buttons.forEach(b => {
                            if (b.getAttribute('data-correct') === 'true') {
                                b.classList.add('correct');
                            }
                        });
                    }

                    buttons.forEach(b => b.style.cursor = 'default');

                    if (explanation) {
                        explanation.style.display = 'block';
                    }

                    checkCompletion();
                });
            });
        });

        function resetQuiz() {
            score = 0;
            answeredCount = 0;
            if (scoreSpan) scoreSpan.textContent = '0';
            if (banner) banner.style.display = 'none';

            questionBoxes.forEach(box => {
                delete box.dataset.answered;
                const buttons = box.querySelectorAll('.quiz-option-btn');
                buttons.forEach(btn => {
                    btn.classList.remove('correct', 'wrong', 'selected');
                    btn.style.cursor = 'pointer';
                });
                const explanation = box.querySelector('.quiz-explanation');
                if (explanation) explanation.style.display = 'none';
            });
            showToast("Kvíz byl resetován ↺");
        }

        if (resetBtn) resetBtn.addEventListener('click', resetQuiz);
        if (retryBtn) retryBtn.addEventListener('click', resetQuiz);
    }

    // -------------------------------------------------------------
    // 7. Vizuální generátor tabulek (Nástroje)
    // -------------------------------------------------------------
    const tableRowsInput = document.getElementById('table-rows');
    const tableColsInput = document.getElementById('table-cols');
    const tableHasTh = document.getElementById('table-has-th');
    const tableHasCaption = document.getElementById('table-has-caption');
    const tablePreviewOutput = document.getElementById('table-preview-output');
    const copyTableBtn = document.getElementById('copy-table-code');
    const valRows = document.getElementById('val-rows');
    const valCols = document.getElementById('val-cols');

    let currentTableHtml = '';

    function generateTable() {
        if (!tableRowsInput || !tableColsInput || !tablePreviewOutput) return;

        const rows = parseInt(tableRowsInput.value, 10) || 3;
        const cols = parseInt(tableColsInput.value, 10) || 3;
        const withTh = tableHasTh ? tableHasTh.checked : true;
        const withCaption = tableHasCaption ? tableHasCaption.checked : true;

        if (valRows) valRows.textContent = rows;
        if (valCols) valCols.textContent = cols;

        let code = '<table border="1">\n';
        if (withCaption) {
            code += '    <caption>Vygenerovaná tabulka</caption>\n';
        }
        if (withTh) {
            code += '    <thead>\n        <tr>\n';
            for (let c = 1; c <= cols; c++) {
                code += `            <th>Sloupec ${c}</th>\n`;
            }
            code += '        </tr>\n    </thead>\n';
        }
        code += '    <tbody>\n';
        for (let r = 1; r <= rows; r++) {
            code += '        <tr>\n';
            for (let c = 1; c <= cols; c++) {
                code += `            <td>Řádek ${r}, Sl. ${c}</td>\n`;
            }
            code += '        </tr>\n';
        }
        code += '    </tbody>\n</table>';

        currentTableHtml = code;
        tablePreviewOutput.innerHTML = code;
    }

    if (tableRowsInput && tableColsInput) {
        [tableRowsInput, tableColsInput].forEach(inp => inp.addEventListener('input', generateTable));
        if (tableHasTh) tableHasTh.addEventListener('change', generateTable);
        if (tableHasCaption) tableHasCaption.addEventListener('change', generateTable);
        generateTable();
    }

    if (copyTableBtn) {
        copyTableBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(currentTableHtml);
                showToast("HTML kód tabulky zkopírován do schránky ✓");
            } catch (e) {
                showToast("Kód zkopírován ✓");
            }
        });
    }

    // -------------------------------------------------------------
    // 8. Vizuální generátor CSS stínů Box-Shadow (Nástroje)
    // -------------------------------------------------------------
    const shadowX = document.getElementById('shadow-x');
    const shadowY = document.getElementById('shadow-y');
    const shadowBlur = document.getElementById('shadow-blur');
    const shadowSpread = document.getElementById('shadow-spread');
    const shadowBox = document.getElementById('shadow-box');
    const shadowCssText = document.getElementById('shadow-css-text');
    const copyShadowBtn = document.getElementById('copy-shadow-code');
    const valShadowX = document.getElementById('val-shadow-x');
    const valShadowY = document.getElementById('val-shadow-y');
    const valShadowBlur = document.getElementById('val-shadow-blur');
    const valShadowSpread = document.getElementById('val-shadow-spread');

    function updateShadow() {
        if (!shadowX || !shadowBox) return;

        const x = shadowX.value;
        const y = shadowY.value;
        const blur = shadowBlur.value;
        const spread = shadowSpread.value;

        if (valShadowX) valShadowX.textContent = `${x}px`;
        if (valShadowY) valShadowY.textContent = `${y}px`;
        if (valShadowBlur) valShadowBlur.textContent = `${blur}px`;
        if (valShadowSpread) valShadowSpread.textContent = `${spread}px`;

        const shadowValue = `${x}px ${y}px ${blur}px ${spread}px rgba(0, 0, 0, 0.22)`;
        shadowBox.style.boxShadow = shadowValue;
        if (shadowCssText) {
            shadowCssText.textContent = `box-shadow: ${shadowValue};`;
        }
    }

    if (shadowX && shadowY && shadowBlur && shadowSpread) {
        [shadowX, shadowY, shadowBlur, shadowSpread].forEach(inp => {
            inp.addEventListener('input', updateShadow);
        });
        updateShadow();
    }

    if (copyShadowBtn) {
        copyShadowBtn.addEventListener('click', async () => {
            const text = shadowCssText ? shadowCssText.textContent : '';
            try {
                await navigator.clipboard.writeText(text);
                showToast("CSS stín zkopírován do schránky ✓");
            } catch (e) {
                showToast("CSS zkopírováno ✓");
            }
        });
    }

    // -------------------------------------------------------------
    // 9. Jazykový filtr na hlavní stránce (Language Filter Bar)
    // -------------------------------------------------------------
    const langFilterButtons = document.querySelectorAll('.lang-filter-btn');
    const bentoCards = document.querySelectorAll('.bento-card[data-lang]');

    if (langFilterButtons.length > 0 && bentoCards.length > 0) {
        langFilterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetLang = btn.getAttribute('data-lang');
                langFilterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                bentoCards.forEach(card => {
                    const cardLang = card.getAttribute('data-lang');
                    if (targetLang === 'all' || cardLang === targetLang) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // -------------------------------------------------------------
    // 10. Interaktivní spouštěč kódu a terminál (Multi-Language Runner)
    // -------------------------------------------------------------
    const runButtons = document.querySelectorAll('.btn-run-code');
    runButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.playground-card');
            if (!card) return;

            const textarea = card.querySelector('.code-textarea');
            const terminalBody = card.querySelector('.terminal-body');
            const lang = card.getAttribute('data-lang') || 'js';

            if (!terminalBody) return;

            const code = textarea ? textarea.value : '';

            // Efekt spuštění
            btn.textContent = '⏳ Běží...';
            btn.style.opacity = '0.7';

            setTimeout(() => {
                btn.textContent = '▶ Spustit kód';
                btn.style.opacity = '1';

                if (lang === 'js') {
                    // Reálné spuštění JavaScriptu se zachycením console.log
                    const logs = [];
                    const originalLog = console.log;
                    console.log = (...args) => {
                        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
                    };

                    try {
                        const runFn = new Function(code);
                        runFn();
                        console.log = originalLog;
                        const output = logs.length > 0 ? logs.join('\n') : '[Program proběhl v pořádku bez výstupu do konzole]';
                        terminalBody.innerHTML = `<span class="terminal-prompt">$ node main.js</span>\n<span class="terminal-output-text">${escapeHtml(output)}</span>\n<span class="terminal-success">✓ Kód úspěšně proběhl (exit code 0)</span>`;
                    } catch (err) {
                        console.log = originalLog;
                        terminalBody.innerHTML = `<span class="terminal-prompt">$ node main.js</span>\n<span style="color:#f85149;">Chyba: ${escapeHtml(err.message)}</span>`;
                    }
                } else if (lang === 'python') {
                    // Simulace Python výstupu
                    let simulatedOutput = "";
                    const printMatches = [...code.matchAll(/print\((['"])(.*?)\1\)/g)];
                    if (printMatches.length > 0) {
                        simulatedOutput = printMatches.map(m => m[2]).join('\n');
                    } else if (code.includes('print(')) {
                        simulatedOutput = "Výstup funkce print() z tvého kódu:\n";
                        const lines = code.split('\n').filter(l => l.trim().startsWith('print'));
                        simulatedOutput += lines.map(l => ">> " + l.trim()).join('\n');
                    } else {
                        simulatedOutput = "Program úspěšně interpretován Pythonem 3.12 bez chyb.";
                    }
                    terminalBody.innerHTML = `<span class="terminal-prompt">$ python3 main.py</span>\n<span class="terminal-output-text">${escapeHtml(simulatedOutput)}</span>\n<span class="terminal-success">✓ Hotovo (Process finished with exit code 0)</span>`;
                } else if (lang === 'sql') {
                    // SQL simulace
                    terminalBody.innerHTML = `<span class="terminal-prompt">sqlite3 skola.db</span>\n<span class="terminal-output-text">Dotaz: ${escapeHtml(code.trim().split('\n')[0])}\n\nVýsledek dotazu (Tabulka studentů):\n+----+------------+---------+-------+\n| id | jmeno      | trida   | znamka|\n+----+------------+---------+-------+\n| 1  | Jan Novák  | 4.A     | 1     |\n| 2  | Petr Svoboda| 4.A    | 2     |\n| 3  | Eva Černá  | 4.B     | 1     |\n+----+------------+---------+-------+</span>\n<span class="terminal-success">✓ 3 řádky vráceny za 0.002s</span>`;
                } else if (lang === 'java') {
                    terminalBody.innerHTML = `<span class="terminal-prompt">$ javac Main.java && java Main</span>\n<span class="terminal-output-text">Kompilace Java bytecode... OK\nVýstup programu:\nAhoj ze školní třídy Java!\nObjekt vytvořen v paměti JVM.</span>\n<span class="terminal-success">✓ BUILD SUCCESSFUL</span>`;
                } else if (lang === 'cpp') {
                    terminalBody.innerHTML = `<span class="terminal-prompt">$ g++ -std=c++17 main.cpp -o main && ./main</span>\n<span class="terminal-output-text">Kompilace pomocí G++... OK\nVýstup:\nProgram v C++ alokoval a zpracoval data.\nPaměť byla úspěšně uvolněna.</span>\n<span class="terminal-success">✓ Execution completed (0ms)</span>`;
                } else if (lang === 'csharp') {
                    terminalBody.innerHTML = `<span class="terminal-prompt">$ dotnet run</span>\n<span class="terminal-output-text">Sestavení projektu .NET 8.0... OK\nVýstup aplikace v C#:\nAplikace běží na platformě .NET!\nObjekt zpracován pomocí LINQ dotazu.</span>\n<span class="terminal-success">✓ Hotovo bez chyb</span>`;
                } else if (lang === 'git') {
                    terminalBody.innerHTML = `<span class="terminal-prompt">$ git status</span>\n<span class="terminal-output-text">On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)\n\t<span style="color:#3fb950;">modified: index.html</span>\n\t<span style="color:#3fb950;">new file: script.js</span></span>\n<span class="terminal-success">✓ Git repozitář v pořádku</span>`;
                }
                showToast("Kód spuštěn v simulátoru ▶");
            }, 300);
        });
    });

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // -------------------------------------------------------------
    // 11. Interaktivní vizualizér řadicích algoritmů (Sorting Visualizer)
    // -------------------------------------------------------------
    const sortStage = document.getElementById('sort-stage');
    const btnSortShuffle = document.getElementById('btn-sort-shuffle');
    const btnSortStep = document.getElementById('btn-sort-step');
    const btnSortPlay = document.getElementById('btn-sort-play');
    const sortAlgoSelect = document.getElementById('sort-algo-select');
    const sortStatusText = document.getElementById('sort-status-text');

    if (sortStage) {
        let sortArray = [45, 18, 85, 32, 64, 12, 95, 27, 53, 76, 38, 70];
        let sortingSteps = [];
        let currentStepIndex = 0;
        let isPlaying = false;
        let playInterval = null;

        function renderSortBars(activeIndices = [], swapIndices = [], sortedIndices = []) {
            sortStage.innerHTML = '';
            sortArray.forEach((val, idx) => {
                const bar = document.createElement('div');
                bar.className = 'sort-bar';
                bar.style.height = `${val * 1.8}px`;
                bar.textContent = val;

                if (sortedIndices.includes(idx)) {
                    bar.classList.add('sorted');
                } else if (swapIndices.includes(idx)) {
                    bar.classList.add('swap');
                } else if (activeIndices.includes(idx)) {
                    bar.classList.add('comparing');
                }

                sortStage.appendChild(bar);
            });
        }

        function generateBubbleSortSteps(arr) {
            const steps = [];
            const a = [...arr];
            const n = a.length;
            const sorted = [];

            for (let i = 0; i < n - 1; i++) {
                for (let j = 0; j < n - i - 1; j++) {
                    steps.push({
                        type: 'compare',
                        indices: [j, j + 1],
                        arr: [...a],
                        sorted: [...sorted],
                        msg: `Porovnání indexů ${j} (${a[j]}) a ${j + 1} (${a[j + 1]})`
                    });

                    if (a[j] > a[j + 1]) {
                        const temp = a[j];
                        a[j] = a[j + 1];
                        a[j + 1] = temp;

                        steps.push({
                            type: 'swap',
                            indices: [j, j + 1],
                            arr: [...a],
                            sorted: [...sorted],
                            msg: `Prohození: ${a[j + 1]} > ${a[j]} → prohozeno`
                        });
                    }
                }
                sorted.push(n - 1 - i);
            }
            sorted.push(0);
            steps.push({
                type: 'done',
                indices: [],
                arr: [...a],
                sorted: [...sorted],
                msg: '✓ Pole je kompletně seřazeno (Bubble Sort dokončen)!'
            });
            return steps;
        }

        function shuffleSort() {
            stopPlay();
            sortArray = Array.from({ length: 12 }, () => Math.floor(Math.random() * 85) + 12);
            sortingSteps = generateBubbleSortSteps(sortArray);
            currentStepIndex = 0;
            if (sortStatusText) sortStatusText.textContent = "Pole zamícháno. Připraveno k řazení.";
            renderSortBars();
        }

        function stepSort() {
            if (currentStepIndex >= sortingSteps.length) {
                stopPlay();
                if (sortStatusText) sortStatusText.textContent = "✓ Řazení již bylo dokončeno.";
                return;
            }

            const step = sortingSteps[currentStepIndex];
            sortArray = [...step.arr];

            if (step.type === 'compare') {
                renderSortBars(step.indices, [], step.sorted);
            } else if (step.type === 'swap') {
                renderSortBars([], step.indices, step.sorted);
            } else if (step.type === 'done') {
                renderSortBars([], [], step.sorted);
                stopPlay();
            }

            if (sortStatusText) sortStatusText.textContent = step.msg;
            currentStepIndex++;
        }

        function stopPlay() {
            isPlaying = false;
            clearInterval(playInterval);
            if (btnSortPlay) btnSortPlay.textContent = "▶ Spustit řazení";
        }

        function startPlay() {
            isPlaying = true;
            if (btnSortPlay) btnSortPlay.textContent = "⏸ Pozastavit";
            playInterval = setInterval(() => {
                if (currentStepIndex < sortingSteps.length) {
                    stepSort();
                } else {
                    stopPlay();
                }
            }, 300);
        }

        if (btnSortShuffle) btnSortShuffle.addEventListener('click', shuffleSort);
        if (btnSortStep) btnSortStep.addEventListener('click', stepSort);
        if (btnSortPlay) {
            btnSortPlay.addEventListener('click', () => {
                if (isPlaying) {
                    stopPlay();
                } else {
                    startPlay();
                }
            });
        }

        // Inicializace
        shuffleSort();
    }

    // -------------------------------------------------------------
    // 12. Převodník číselných soustav & 8bitový registr
    // -------------------------------------------------------------
    const decInput = document.getElementById('num-dec');
    const binInput = document.getElementById('num-bin');
    const hexInput = document.getElementById('num-hex');
    const octInput = document.getElementById('num-oct');
    const bitButtons = document.querySelectorAll('.bit-btn');

    if (decInput && binInput && hexInput && octInput) {
        let currentDecValue = 42;

        function updateAllFromDec(val, sender = null) {
            val = Math.max(0, Math.min(255, isNaN(val) ? 0 : val));
            currentDecValue = val;

            if (sender !== decInput) decInput.value = val;
            if (sender !== binInput) binInput.value = val.toString(2).padStart(8, '0');
            if (sender !== hexInput) hexInput.value = val.toString(16).toUpperCase();
            if (sender !== octInput) octInput.value = val.toString(8);

            // Aktualizace tlačítek bitů
            bitButtons.forEach(btn => {
                const bitWeight = parseInt(btn.getAttribute('data-weight'), 10);
                const isSet = (currentDecValue & bitWeight) !== 0;
                btn.textContent = isSet ? '1' : '0';
                if (isSet) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }

        decInput.addEventListener('input', () => updateAllFromDec(parseInt(decInput.value, 10), decInput));
        binInput.addEventListener('input', () => updateAllFromDec(parseInt(binInput.value, 2), binInput));
        hexInput.addEventListener('input', () => updateAllFromDec(parseInt(hexInput.value, 16), hexInput));
        octInput.addEventListener('input', () => updateAllFromDec(parseInt(octInput.value, 8), octInput));

        bitButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const bitWeight = parseInt(btn.getAttribute('data-weight'), 10);
                // Přepnout bit pomocí XOR
                currentDecValue = currentDecValue ^ bitWeight;
                updateAllFromDec(currentDecValue);
            });
        });

        // Počáteční stav
        updateAllFromDec(42);
    }

    // -------------------------------------------------------------
    // 13. IPv4 Subnet Calculator (Kalkulačka podsítí)
    // -------------------------------------------------------------
    const subnetIpInput = document.getElementById('subnet-ip');
    const subnetPrefixInput = document.getElementById('subnet-prefix');

    if (subnetIpInput && subnetPrefixInput) {
        function ipToInt(ipStr) {
            return ipStr.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0) >>> 0;
        }

        function intToIp(intVal) {
            return [
                (intVal >>> 24) & 255,
                (intVal >>> 16) & 255,
                (intVal >>> 8) & 255,
                intVal & 255
            ].join('.');
        }

        function calculateSubnet() {
            const ipStr = subnetIpInput.value.trim() || '192.168.1.100';
            const prefix = parseInt(subnetPrefixInput.value, 10) || 24;

            const parts = ipStr.split('.');
            if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
                return; // Neplatná IP
            }

            const ipInt = ipToInt(ipStr);
            const maskInt = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
            const wildcardInt = ~maskInt >>> 0;
            const networkInt = (ipInt & maskInt) >>> 0;
            const broadcastInt = (networkInt | wildcardInt) >>> 0;

            const totalHosts = prefix >= 31 ? (prefix === 31 ? 2 : 1) : Math.pow(2, 32 - prefix);
            const usableHosts = prefix >= 31 ? 0 : totalHosts - 2;

            const firstHostInt = usableHosts > 0 ? networkInt + 1 : networkInt;
            const lastHostInt = usableHosts > 0 ? broadcastInt - 1 : broadcastInt;

            // Výpis do UI
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.textContent = val;
            };

            setVal('res-net-ip', intToIp(networkInt));
            setVal('res-broadcast-ip', intToIp(broadcastInt));
            setVal('res-netmask', intToIp(maskInt));
            setVal('res-wildcard', intToIp(wildcardInt));
            setVal('res-first-host', usableHosts > 0 ? intToIp(firstHostInt) : 'N/A');
            setVal('res-last-host', usableHosts > 0 ? intToIp(lastHostInt) : 'N/A');
            setVal('res-usable-hosts', usableHosts.toLocaleString('cs-CZ'));
            
            // Třída IP sítě
            const firstOct = parseInt(parts[0], 10);
            let ipClass = 'Neznámá';
            if (firstOct >= 1 && firstOct <= 126) ipClass = 'Třída A (Velké sítě)';
            else if (firstOct >= 128 && firstOct <= 191) ipClass = 'Třída B (Střední sítě)';
            else if (firstOct >= 192 && firstOct <= 223) ipClass = 'Třída C (Malé lokální sítě LAN)';
            else if (firstOct >= 224 && firstOct <= 239) ipClass = 'Třída D (Multicast)';
            setVal('res-ip-class', ipClass);
        }

        subnetIpInput.addEventListener('input', calculateSubnet);
        subnetPrefixInput.addEventListener('input', calculateSubnet);
        calculateSubnet();
    }

    // -------------------------------------------------------------
    // 14. Kyberbezpečnost: SHA-256 Hash Generátor & Testér hesel
    // -------------------------------------------------------------
    const hashPassInput = document.getElementById('hash-pass-input');
    const hashOutput = document.getElementById('hash-output');
    const entropyFill = document.getElementById('entropy-bar-fill');
    const entropyScore = document.getElementById('entropy-score');
    const crackTime = document.getElementById('crack-time');
    const btnCopyHash = document.getElementById('btn-copy-hash');

    if (hashPassInput && hashOutput) {
        async function computeSha256(text) {
            const encoder = new TextEncoder();
            const data = encoder.encode(text);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }

        async function updateHash() {
            const val = hashPassInput.value;
            if (!val) {
                hashOutput.textContent = 'Zadej text nebo heslo výše...';
                if (entropyFill) entropyFill.style.width = '0%';
                if (entropyScore) entropyScore.textContent = '0 bitů';
                if (crackTime) crackTime.textContent = 'Okamžitě';
                return;
            }

            const hashHex = await computeSha256(val);
            hashOutput.textContent = hashHex;

            // Výpočet entropie hesla E = L * log2(R)
            let pool = 0;
            if (/[a-z]/.test(val)) pool += 26;
            if (/[A-Z]/.test(val)) pool += 26;
            if (/[0-9]/.test(val)) pool += 10;
            if (/[^a-zA-Z0-9]/.test(val)) pool += 32;

            const entropy = Math.round(val.length * (pool > 0 ? Math.log2(pool) : 0));
            if (entropyScore) entropyScore.textContent = `${entropy} bitů entropie`;

            if (entropyFill) {
                const percent = Math.min(100, Math.round((entropy / 80) * 100));
                entropyFill.style.width = `${percent}%`;
                if (entropy < 35) {
                    entropyFill.style.backgroundColor = '#ef4444';
                    if (crackTime) crackTime.textContent = 'Několik sekund (Extrémně slabé)';
                } else if (entropy < 55) {
                    entropyFill.style.backgroundColor = '#f59e0b';
                    if (crackTime) crackTime.textContent = 'Několik dní / týdnů (Průměrné)';
                } else if (entropy < 75) {
                    entropyFill.style.backgroundColor = '#10b981';
                    if (crackTime) crackTime.textContent = 'Několik let / století (Silné)';
                } else {
                    entropyFill.style.backgroundColor = '#38bdf8';
                    if (crackTime) crackTime.textContent = 'Miliony let (Vojenská síla)';
                }
            }
        }

        hashPassInput.addEventListener('input', updateHash);
        updateHash();

        if (btnCopyHash) {
            btnCopyHash.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(hashOutput.textContent);
                    showToast("SHA-256 hash zkopírován ✓");
                } catch (e) {
                    showToast("Zkopírováno ✓");
                }
            });
        }
    }

    // -------------------------------------------------------------
    // 10. Linux Chmod Oprávnění Kalkulačka
    // -------------------------------------------------------------
    const chmodChecks = document.querySelectorAll('.chmod-check');
    const octalDisplay = document.getElementById('chmod-octal');
    const symbolicDisplay = document.getElementById('chmod-symbolic');

    function updateChmodCalc() {
        if (!octalDisplay || !symbolicDisplay) return;
        const perms = { u: 0, g: 0, o: 0 };
        const sym = { u: ['-', '-', '-'], g: ['-', '-', '-'], o: ['-', '-', '-'] };

        chmodChecks.forEach(cb => {
            if (cb.checked) {
                const target = cb.dataset.target; // u, g, o
                const val = parseInt(cb.dataset.val, 10); // 4, 2, 1
                const type = cb.dataset.type; // r, w, x
                perms[target] += val;
                if (type === 'r') sym[target][0] = 'r';
                if (type === 'w') sym[target][1] = 'w';
                if (type === 'x') sym[target][2] = 'x';
            }
        });

        octalDisplay.textContent = 'chmod ' + perms.u + perms.g + perms.o + ' soubor.sh';
        symbolicDisplay.textContent = '-' + sym.u.join('') + sym.g.join('') + sym.o.join('');
    }

    if (chmodChecks.length > 0) {
        chmodChecks.forEach(cb => cb.addEventListener('change', updateChmodCalc));
        updateChmodCalc();
    }

    // -------------------------------------------------------------
    // 11. REST API Simulátor dotazů
    // -------------------------------------------------------------
    const apiMethodSelect = document.getElementById('api-method-select');
    const apiEndpointInput = document.getElementById('api-endpoint-input');
    const apiSendBtn = document.getElementById('api-send-btn');
    const apiResponseStatus = document.getElementById('api-response-status');
    const apiResponseBody = document.getElementById('api-response-body');

    if (apiSendBtn && apiMethodSelect && apiResponseBody) {
        apiSendBtn.addEventListener('click', () => {
            const method = apiMethodSelect.value;
            const endpoint = (apiEndpointInput ? apiEndpointInput.value : '/api/v1/students').trim();

            apiResponseBody.textContent = 'Odesílám požadavek ' + method + ' ' + endpoint + '...';
            if (apiResponseStatus) apiResponseStatus.textContent = '200 OK (Simulováno)';

            setTimeout(() => {
                let dummyResponse = {};
                if (method === 'GET') {
                    dummyResponse = {
                        status: 200,
                        endpoint: endpoint,
                        data: [
                            { id: 1, jmeno: "Jan Novák", obor: "Informační technologie", rocnik: 4 },
                            { id: 2, jmeno: "Eva Dvořáková", obor: "Aplikovaná kybernetika", rocnik: 4 }
                        ],
                        message: "Data úspěšně načtena ze serveru."
                    };
                } else if (method === 'POST') {
                    dummyResponse = {
                        status: 201,
                        message: "Záznam byl úspěšně vytvořen.",
                        createdId: 104,
                        payload: { jmeno: "Petr Svoboda", trida: "4.IT" }
                    };
                    if (apiResponseStatus) apiResponseStatus.textContent = '201 Created';
                } else if (method === 'PUT') {
                    dummyResponse = {
                        status: 200,
                        message: "Záznam ID byl kompletně aktualizován.",
                        timestamp: new Date().toISOString()
                    };
                } else if (method === 'DELETE') {
                    dummyResponse = {
                        status: 204,
                        message: "Záznam byl trvale smazán z databáze."
                    };
                    if (apiResponseStatus) apiResponseStatus.textContent = '204 No Content';
                }

                apiResponseBody.textContent = JSON.stringify(dummyResponse, null, 2);
            }, 250);
        });
    }

});
