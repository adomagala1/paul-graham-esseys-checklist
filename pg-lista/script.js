document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('essays-container');
    let essaysData = [];
    let appState = {};

    // Używamy unikalnego klucza dla localStorage, aby uniknąć konfliktów
    const STORAGE_KEY = 'pgEssaysTracker_v2';

    // Funkcja do wczytywania danych o postępach (kropki, notatki)
    function loadState() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsedData = JSON.parse(data);
            // Sprawdzamy, czy liczba esejów się zgadza. Jeśli nie, resetujemy.
            if (parsedData.read && parsedData.read.length === essaysData.length) {
                return parsedData;
            }
        }
        // Zwracamy pusty stan, jeśli nic nie ma lub dane są nieaktualne
        return {
            read: Array(essaysData.length).fill(false),
            notes: Array(essaysData.length).fill('')
        };
    }

    // Funkcja do zapisywania postępów
    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    }

    // Funkcja, która buduje całą listę na stronie
    function renderEssays() {
        container.innerHTML = ''; // Czyścimy przed renderowaniem
        essaysData.forEach((essay, index) => {
            const isRead = appState.read[index];
            const note = appState.notes[index];

            const item = document.createElement('div');
            item.className = 'essay-item';
            item.dataset.index = index;

            // SVG dla ikonki linku zewnętrznego (załacznik)
            const linkIconSvg = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M10.5858 13.4142L7.75735 16.2426C5.41421 18.5858 1.41421 18.5858 -0.928932 16.2426C-3.27208 13.8995 -3.27208 9.90051 -0.928932 7.55736L1.51472 5.11371C2.88578 3.74264 5.0181 3.74264 6.38916 5.11371L7.80337 6.52792M13.4142 10.5858L16.2426 7.75735C18.5858 5.41421 18.5858 1.41421 16.2426 -0.928932C13.8995 -3.27208 9.90051 -3.27208 7.55736 -0.928932L5.11371 1.51472C3.74264 2.88578 3.74264 5.0181 5.11371 6.38916L6.52792 7.80337" transform="rotate(45 12 12)" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>`;

            item.innerHTML = `
                <div class="essay-header">
                    <div class="status-dot ${isRead ? 'read' : ''}"></div>
                    <span class="essay-title">${essay.title}</span>
                    <a href="${essay.url}" target="_blank" rel="noopener noreferrer" class="external-link" title="Otwórz esej w nowej karcie">
                        ${linkIconSvg}
                    </a>
                </div>
                <div class="notes-section">
                    <textarea placeholder="Twoje notatki...">${note}</textarea>
                </div>
            `;
            container.appendChild(item);
        });
    }

    // GŁÓWNA LOGIKA APLIKACJI
    async function initializeApp() {
        try {
            // Wczytaj dane o esejach z pliku JSON
            const response = await fetch('essays.json');
            if (!response.ok) {
                throw new Error(`Nie udało się wczytać pliku essays.json. Status: ${response.status}`);
            }
            essaysData = await response.json();

            // Wczytaj stan (postępy) z localStorage
            appState = loadState();

            // Wyrenderuj listę
            renderEssays();
        } catch (error) {
            container.innerHTML = `<p style="color: #ff4d4d;">Błąd aplikacji: ${error.message}</p>`;
            console.error(error);
        }
    }

    // Obsługa kliknięć
    container.addEventListener('click', (e) => {
        const header = e.target.closest('.essay-header');
        if (!header) return;

        const item = header.parentElement;
        const index = item.dataset.index;

        // Kliknięcie w link otwiera nową kartę (to jest obsłużone przez przeglądarkę)
        // więc nie musimy nic robić, ale zapobiegamy rozwijaniu notatek
        if (e.target.closest('.external-link')) {
            e.stopPropagation();
            return;
        }

        // Kliknięcie w kropkę zmienia status
        if (e.target.classList.contains('status-dot')) {
            appState.read[index] = !appState.read[index];
            e.target.classList.toggle('read');
            saveState();
            e.stopPropagation();
            return;
        }

        // Kliknięcie w resztę nagłówka rozwija notatki
        item.classList.toggle('open');
    });

    // Obsługa pisania w notatkach (zapisuje na bieżąco)
    container.addEventListener('input', (e) => {
        if (e.target.tagName.toLowerCase() === 'textarea') {
            const item = e.target.closest('.essay-item');
            const index = item.dataset.index;
            appState.notes[index] = e.target.value;
            saveState();
        }
    });

    // Uruchomienie aplikacji
    initializeApp();
});