const tooltipPanel = document.getElementById('tooltipPanel');
const tooltipText = document.getElementById('tooltipText');
let tooltipTimer = null;
let panelTimer = null;

function updateTooltipPosition(event) {
    const x = event.pageX + 14;
    const y = event.pageY - 20;
    tooltipPanel.style.left = `${x}px`;
    tooltipPanel.style.top = `${y}px`;
}

function typeDescription(text) {
    tooltipText.textContent = '';
    let index = 0;

    function typeNext() {
        if (index < text.length) {
            tooltipText.textContent += text[index++];
            tooltipTimer = window.setTimeout(typeNext, 32);
        }
    }

    typeNext();
}

function showTooltip(event, description) {
    if (!description) {
        return;
    }

    window.clearTimeout(tooltipTimer);
    tooltipText.textContent = '';
    updateTooltipPosition(event);
    tooltipPanel.classList.add('visible');
    typeDescription(description);
}

function hideTooltip() {
    window.clearTimeout(tooltipTimer);
    tooltipPanel.classList.remove('visible');
    tooltipText.textContent = '';
}

document.querySelectorAll('.outline-button, .settings-action-button, .theme-swatch, .dock-item').forEach(button => {
    button.addEventListener('mouseenter', event => showTooltip(event, button.dataset.description));
    button.addEventListener('mousemove', updateTooltipPosition);
    button.addEventListener('mouseleave', hideTooltip);
});

const topBar = document.querySelector('.top-bar');
const openBlankBtn = document.getElementById('openBlankBtn');
const sideMenu = document.getElementById('sideMenu');
const settingsMenuBtn = document.getElementById('settingsMenuBtn');
const settingsOverlay = document.getElementById('settingsOverlay');
const settingsCloseBtn = document.getElementById('settingsCloseBtn');
const settingsOpenBlankBtn = document.getElementById('settingsOpenBlankBtn');
const settingsAppearanceBtn = document.getElementById('settingsAppearanceBtn');
const settingsPrivacyBtn = document.getElementById('settingsPrivacyBtn');
const settingsMainView = document.getElementById('settingsMainView');
const appearanceView = document.getElementById('appearanceView');
const appearanceBackBtn = document.getElementById('appearanceBackBtn');
const partnersDockBtn = document.getElementById('partnersDockBtn');
const gamesDockBtn = document.getElementById('gamesDockBtn');
const partnersOverlay = document.getElementById('partnersOverlay');
const partnersWindow = document.getElementById('partnersWindow');
const partnersWindowHeader = document.getElementById('partnersWindowHeader');
const partnersWindowClose = document.getElementById('partnersWindowClose');
const partnersWindowResize = document.getElementById('partnersWindowResize');
const gamesOverlay = document.getElementById('gamesOverlay');
const gamesWindow = document.getElementById('gamesWindow');
const gamesWindowHeader = document.getElementById('gamesWindowHeader');
const gamesWindowBack = document.getElementById('gamesWindowBack');
const gamesWindowClose = document.getElementById('gamesWindowClose');
const gamesWindowResize = document.getElementById('gamesWindowResize');
const gamesWindowBody = document.getElementById('gamesWindowBody');
const gamesPreviewFrame = document.getElementById('gamesPreviewFrame');
const gamesMenuButtons = Array.from(document.querySelectorAll('.games-menu-button[data-target]'));
let lastScrollY = window.scrollY;
let appearanceCloseTimer = null;
let partnersDrag = null;
let partnersResize = null;
let gamesDrag = null;
let gamesResize = null;

function openPartnersWindow() {
    partnersOverlay?.classList.add('visible');
    partnersOverlay?.setAttribute('aria-hidden', 'false');
}

function closePartnersWindow() {
    partnersOverlay?.classList.remove('visible');
    partnersOverlay?.setAttribute('aria-hidden', 'true');
}

function openGamesWindow() {
    gamesOverlay?.classList.add('visible');
    gamesOverlay?.setAttribute('aria-hidden', 'false');
    updateActiveGamesMenuButton();
}

function stopGamesPreview() {
    if (!gamesWindowBody) {
        return;
    }

    gamesWindowBody.classList.remove('has-preview');
    if (gamesPreviewFrame) {
        gamesPreviewFrame.src = 'about:blank';
    }
}

function closeGamesWindow() {
    stopGamesPreview();
    gamesOverlay?.classList.remove('visible');
    gamesOverlay?.setAttribute('aria-hidden', 'true');
}

function setActiveGamesMenuButton(targetId) {
    gamesMenuButtons.forEach(button => {
        button.classList.toggle('is-active', button.dataset.target === targetId);
    });
}

function updateActiveGamesMenuButton() {
    if (!gamesWindowBody || gamesMenuButtons.length === 0) {
        return;
    }

    const bodyRect = gamesWindowBody.getBoundingClientRect();
    const markerY = bodyRect.top + bodyRect.height * 0.25;
    let currentId = gamesMenuButtons[0].dataset.target;

    for (const button of gamesMenuButtons) {
        const targetId = button.dataset.target;
        const target = targetId ? gamesWindowBody.querySelector(`#${targetId}`) : null;
        if (!target) {
            continue;
        }

        const rect = target.getBoundingClientRect();
        if (rect.top <= markerY) {
            currentId = targetId;
        } else {
            break;
        }
    }

    if (currentId) {
        setActiveGamesMenuButton(currentId);
    }
}

partnersDockBtn?.addEventListener('click', openPartnersWindow);
partnersWindowClose?.addEventListener('click', closePartnersWindow);
gamesDockBtn?.addEventListener('click', openGamesWindow);
gamesWindowBack?.addEventListener('click', stopGamesPreview);
gamesWindowClose?.addEventListener('click', closeGamesWindow);

partnersOverlay?.addEventListener('click', event => {
    if (event.target === partnersOverlay) {
        closePartnersWindow();
    }
});

gamesOverlay?.addEventListener('click', event => {
    if (event.target === gamesOverlay) {
        closeGamesWindow();
    }
});

gamesMenuButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (!gamesWindowBody) {
            return;
        }

        const targetId = button.dataset.target;
        const target = targetId ? gamesWindowBody.querySelector(`#${targetId}`) : null;
        if (targetId) {
            setActiveGamesMenuButton(targetId);
        }

        // Letter menu should keep scroll behavior.
        if (target) {
            stopGamesPreview();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

gamesWindowBody?.addEventListener('click', event => {
    const gameButton = event.target instanceof Element
        ? event.target.closest('.games-section button')
        : null;

    if (!gameButton || !gamesPreviewFrame || !gamesWindowBody) {
        return;
    }

    const section = gameButton.closest('.games-section');
    const sectionKey = section?.id?.replace('games-section-', '') || 'unknown';
    const gameName = gameButton.textContent?.trim() || 'game';

    // If the button has a data-src attribute, load that file directly.
    // Otherwise fall back to the placeholder so nothing breaks.
    const customSrc = gameButton.dataset.src;
    gamesPreviewFrame.src = customSrc
        ? customSrc
        : `game-placeholder.html?section=${encodeURIComponent(sectionKey)}&game=${encodeURIComponent(gameName)}`;
    gamesWindowBody.classList.add('has-preview');
    setActiveGamesMenuButton(`games-section-${sectionKey}`);
});

gamesWindowBody?.addEventListener('scroll', updateActiveGamesMenuButton);
window.addEventListener('resize', updateActiveGamesMenuButton);
updateActiveGamesMenuButton();

partnersWindowHeader?.addEventListener('pointerdown', event => {
    if (!partnersWindow || event.target === partnersWindowClose || partnersWindowClose?.contains(event.target)) {
        return;
    }

    const rect = partnersWindow.getBoundingClientRect();
    partnersDrag = {
        startX: event.clientX,
        startY: event.clientY,
        left: rect.left,
        top: rect.top,
    };

    partnersWindow.style.left = `${rect.left}px`;
    partnersWindow.style.top = `${rect.top}px`;
    partnersWindow.style.transform = 'none';
    partnersWindowHeader.setPointerCapture(event.pointerId);
});

partnersWindowResize?.addEventListener('pointerdown', event => {
    if (!partnersWindow) {
        return;
    }

    const rect = partnersWindow.getBoundingClientRect();
    partnersResize = {
        startX: event.clientX,
        startY: event.clientY,
        width: rect.width,
        height: rect.height,
    };

    partnersWindowResize.setPointerCapture(event.pointerId);
    event.stopPropagation();
});

gamesWindowHeader?.addEventListener('pointerdown', event => {
    if (
        !gamesWindow ||
        event.target === gamesWindowClose ||
        gamesWindowClose?.contains(event.target) ||
        event.target === gamesWindowBack ||
        gamesWindowBack?.contains(event.target)
    ) {
        return;
    }

    const rect = gamesWindow.getBoundingClientRect();
    gamesDrag = {
        startX: event.clientX,
        startY: event.clientY,
        left: rect.left,
        top: rect.top,
    };

    gamesWindow.style.left = `${rect.left}px`;
    gamesWindow.style.top = `${rect.top}px`;
    gamesWindow.style.transform = 'none';
    gamesWindowHeader.setPointerCapture(event.pointerId);
});

gamesWindowResize?.addEventListener('pointerdown', event => {
    if (!gamesWindow) {
        return;
    }

    const rect = gamesWindow.getBoundingClientRect();
    gamesResize = {
        startX: event.clientX,
        startY: event.clientY,
        width: rect.width,
        height: rect.height,
    };

    gamesWindowResize.setPointerCapture(event.pointerId);
    event.stopPropagation();
});

window.addEventListener('pointermove', event => {
    if (partnersDrag && partnersWindow) {
        const dx = event.clientX - partnersDrag.startX;
        const dy = event.clientY - partnersDrag.startY;
        const maxLeft = Math.max(8, window.innerWidth - partnersWindow.offsetWidth - 8);
        const maxTop = Math.max(8, window.innerHeight - partnersWindow.offsetHeight - 8);
        const nextLeft = Math.min(maxLeft, Math.max(8, partnersDrag.left + dx));
        const nextTop = Math.min(maxTop, Math.max(8, partnersDrag.top + dy));
        partnersWindow.style.left = `${nextLeft}px`;
        partnersWindow.style.top = `${nextTop}px`;
    }

    if (partnersResize && partnersWindow) {
        const dw = event.clientX - partnersResize.startX;
        const dh = event.clientY - partnersResize.startY;
        const newWidth = Math.max(320, partnersResize.width + dw);
        const newHeight = Math.max(220, partnersResize.height + dh);
        partnersWindow.style.width = `${newWidth}px`;
        partnersWindow.style.height = `${newHeight}px`;
    }

    if (gamesDrag && gamesWindow) {
        const dx = event.clientX - gamesDrag.startX;
        const dy = event.clientY - gamesDrag.startY;
        const maxLeft = Math.max(8, window.innerWidth - gamesWindow.offsetWidth - 8);
        const maxTop = Math.max(8, window.innerHeight - gamesWindow.offsetHeight - 8);
        const nextLeft = Math.min(maxLeft, Math.max(8, gamesDrag.left + dx));
        const nextTop = Math.min(maxTop, Math.max(8, gamesDrag.top + dy));
        gamesWindow.style.left = `${nextLeft}px`;
        gamesWindow.style.top = `${nextTop}px`;
    }

    if (gamesResize && gamesWindow) {
        const dw = event.clientX - gamesResize.startX;
        const dh = event.clientY - gamesResize.startY;
        const newWidth = Math.max(320, gamesResize.width + dw);
        const newHeight = Math.max(220, gamesResize.height + dh);
        gamesWindow.style.width = `${newWidth}px`;
        gamesWindow.style.height = `${newHeight}px`;
    }
});

window.addEventListener('pointerup', () => {
    partnersDrag = null;
    partnersResize = null;
    gamesDrag = null;
    gamesResize = null;
});

function showMainSettingsView() {
    window.clearTimeout(appearanceCloseTimer);
    appearanceCloseTimer = null;
    settingsMainView?.classList.add('is-active');
    settingsMainView?.classList.remove('is-leaving');
    appearanceView?.classList.remove('is-active');
    appearanceView?.classList.remove('is-leaving');
    appearanceView?.setAttribute('aria-hidden', 'true');
}

function showAppearanceView() {
    window.clearTimeout(appearanceCloseTimer);
    appearanceCloseTimer = null;
    settingsMainView?.classList.remove('is-active');
    settingsMainView?.classList.remove('is-leaving');
    appearanceView?.classList.add('is-active');
    appearanceView?.classList.remove('is-leaving');
    appearanceView?.setAttribute('aria-hidden', 'false');
}

function closeAppearanceViewAnimated() {
    if (!appearanceView?.classList.contains('is-active')) {
        showMainSettingsView();
        return;
    }

    appearanceView.classList.add('is-leaving');
    appearanceCloseTimer = window.setTimeout(() => {
        showMainSettingsView();
    }, 220);
}

function openInAboutBlank() {
    const blankWindow = window.open('about:blank', '_blank');
    if (!blankWindow) {
        return;
    }

    const safeUrl = window.location.href.replace(/"/g, '&quot;');
    blankWindow.document.write(`<!DOCTYPE html><html><head><title>about:blank</title><style>html,body{margin:0;height:100%;overflow:hidden;background:#000;}iframe{width:100%;height:100%;border:0;}</style></head><body><iframe src="${safeUrl}" allow="clipboard-read; clipboard-write"></iframe></body></html>`);
    blankWindow.document.close();
}

function openSettingsPanel() {
    if (!settingsOverlay || !sideMenu) {
        return;
    }

    showMainSettingsView();
    settingsOverlay.classList.add('visible');
    settingsOverlay.setAttribute('aria-hidden', 'false');
    sideMenu.classList.add('side-menu-locked');
    settingsMenuBtn?.blur();
}

function closeSettingsPanel() {
    if (!settingsOverlay || !sideMenu) {
        return;
    }

    showMainSettingsView();
    settingsOverlay.classList.remove('visible');
    settingsOverlay.setAttribute('aria-hidden', 'true');
    sideMenu.classList.remove('side-menu-locked');
}

settingsMenuBtn?.addEventListener('click', openSettingsPanel);
settingsCloseBtn?.addEventListener('click', closeSettingsPanel);

settingsOverlay?.addEventListener('click', event => {
    if (event.target === settingsOverlay) {
        closeSettingsPanel();
    }
});

window.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        if (partnersOverlay?.classList.contains('visible')) {
            closePartnersWindow();
        } else if (gamesOverlay?.classList.contains('visible')) {
            closeGamesWindow();
        } else if (settingsOverlay?.classList.contains('visible')) {
            closeSettingsPanel();
        }
    }
});

if (openBlankBtn) {
    openBlankBtn.addEventListener('click', openInAboutBlank);
}

settingsOpenBlankBtn?.addEventListener('click', openInAboutBlank);

settingsAppearanceBtn?.addEventListener('click', () => {
    showAppearanceView();
});

settingsPrivacyBtn?.addEventListener('click', () => {
    typePanelText('Privacy settings are coming soon.');
});

appearanceBackBtn?.addEventListener('click', closeAppearanceViewAnimated);

const themes = {
    default: {
        '--bg-dark': '#050006',
        '--bg-mid': '#150a24',
        '--chrome-dark': 'rgba(11, 8, 20, 1)',
        '--chrome-mid': 'rgba(20, 12, 34, 1)',
        '--accent': '#9900ff',
        '--accent-soft': 'rgba(153, 0, 255, 0.18)',
        '--panel-border': 'rgba(153, 0, 255, 0.45)',
        '--panel-surface': 'rgba(255, 255, 255, 0.06)',
        '--text': '#fff',
    },
    minty: {
        '--bg-dark': '#020d06',
        '--bg-mid': '#071a10',
        '--chrome-dark': 'rgba(4, 18, 10, 1)',
        '--chrome-mid': 'rgba(7, 26, 16, 1)',
        '--accent': '#3dd68c',
        '--accent-soft': 'rgba(61, 214, 140, 0.18)',
        '--panel-border': 'rgba(61, 214, 140, 0.45)',
        '--panel-surface': 'rgba(255, 255, 255, 0.06)',
        '--text': '#fff',
    },
    orange: {
        '--bg-dark': '#0d0500',
        '--bg-mid': '#1a0a00',
        '--chrome-dark': 'rgba(18, 8, 0, 1)',
        '--chrome-mid': 'rgba(30, 14, 0, 1)',
        '--accent': '#ff6a00',
        '--accent-soft': 'rgba(255, 106, 0, 0.18)',
        '--panel-border': 'rgba(255, 106, 0, 0.45)',
        '--panel-surface': 'rgba(255, 255, 255, 0.06)',
        '--text': '#fff',
    },
    light: {
        '--bg-dark': '#dcdae6',
        '--bg-mid': '#e8e8f0',
        '--chrome-dark': 'rgba(200, 196, 220, 1)',
        '--chrome-mid': 'rgba(215, 210, 235, 1)',
        '--accent': '#7c5cbf',
        '--accent-soft': 'rgba(124, 92, 191, 0.18)',
        '--panel-border': 'rgba(124, 92, 191, 0.45)',
        '--panel-surface': 'rgba(0, 0, 0, 0.05)',
        '--text': '#1a1a2e',
    },
    black: {
        '--bg-dark': '#000000',
        '--bg-mid': '#0a0a0a',
        '--chrome-dark': 'rgba(6, 6, 6, 1)',
        '--chrome-mid': 'rgba(12, 12, 12, 1)',
        '--accent': '#555555',
        '--accent-soft': 'rgba(85, 85, 85, 0.18)',
        '--panel-border': 'rgba(85, 85, 85, 0.45)',
        '--panel-surface': 'rgba(255, 255, 255, 0.04)',
        '--text': '#fff',
    },
};

function applyTheme(name) {
    const theme = themes[name];
    if (!theme) {
        return;
    }

    const root = document.documentElement;
    Object.entries(theme).forEach(([prop, value]) => {
        root.style.setProperty(prop, value);
    });
}

document.querySelectorAll('.theme-swatch[data-theme]').forEach(swatch => {
    swatch.addEventListener('click', () => applyTheme(swatch.dataset.theme));
});

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 20) {
        topBar.classList.add('hidden');
    } else {
        topBar.classList.remove('hidden');
    }
    lastScrollY = currentScrollY;
});

// Add click handler for button 1
const panelTextElement = document.createElement('p');
panelTextElement.style.color = 'var(--text)';
panelTextElement.style.fontSize = '1.2rem';
panelTextElement.style.lineHeight = '1.6';
panelTextElement.style.margin = '0';
panelTextElement.style.padding = '20px';

function typePanelText(text, onDone) {
    panelTextElement.textContent = '';
    const panel = document.querySelector('.transparent-panel');
    panel.innerHTML = '';
    panel.appendChild(panelTextElement);
    let index = 0;

    function typeNext() {
        if (index < text.length) {
            panelTextElement.textContent += text[index++];
            panelTimer = window.setTimeout(typeNext, 10);
        } else if (onDone) {
            onDone();
        }
    }

    typeNext();
}

// Add click handlers for all buttons
const buttonMessages = {
    2: 'coming soon...',
    3: 'coming soon...',
    4: 'coming soon...',
    5: 'coming soon...',
    6: 'coming soon...',
    7: 'coming soon...',
    8: 'coming soon...'
};

document.querySelectorAll('.button-row .outline-button').forEach((button, idx) => {
    button.addEventListener('click', () => {
        const btnNum = idx + 1;
        if (btnNum === 1) {
            typePanelText('Tuff Terminal 2.0 a terminal for AI access from any page. Drag this link to your bookmarks bar to install: ', () => {
            const link = document.createElement('a');
            link.href = "javascript:(function () { if (document.getElementById('ai-terminal')) { document.getElementById('ai-terminal').style.display = 'flex'; return; } const t = document.createElement('div'); t.id = 'ai-terminal'; t.style.cssText = 'position:fixed;bottom:20px;right:20px;width:600px;height:400px;background:#000;color:#0f0;font-family:Courier,monospace;border:2px solid #0f0;border-radius:8px;box-shadow:0 0 15px #0f0;z-index:999999;display:flex;flex-direction:column;'; t.innerHTML = '<div id=%22terminal-header%22 style=%22background:#111;padding:8px;text-align:center;cursor:move;font-size:14px;%22>AI Terminal [drag] <button id=%22close-btn%22 style=%22float:right;background:#111;color:#fff;border:none;padding:0 6px;font-size:12px;cursor:pointer;%22>%E2%9C%95</button></div><div id=%22terminal-body%22 style=%22flex:1;padding:10px;overflow-y:auto;%22></div><div style=%22display:flex;%22><input id=%22terminal-input%22 style=%22flex:1;background:none;border:none;color:#0f0;font:inherit;padding:8px;outline:none;%22 placeholder=%22Ask anything...%22 /></div>'; document.body.appendChild(t); const header = t.querySelector('#terminal-header'); let isDragging = false, offsetX, offsetY; header.addEventListener('mousedown', e => { isDragging = true; offsetX = e.clientX - t.getBoundingClientRect().left; offsetY = e.clientY - t.getBoundingClientRect().top; }); document.addEventListener('mousemove', e => { if (isDragging) { t.style.left = (e.clientX - offsetX) + 'px'; t.style.top = (e.clientY - offsetY) + 'px'; t.style.right = 'auto'; t.style.bottom = 'auto'; } }); document.addEventListener('mouseup', () => isDragging = false); const closeBtn = t.querySelector('#close-btn'); let hue = 0; setInterval(() => { hue = (hue + 5) % 360; const color = %60hsl(${hue},100%,50%)%60; t.style.borderColor = color; t.style.boxShadow = %600 0 15px ${color}%60; header.style.color = color; closeBtn.style.color = color; }, 50); function log(text, cls) { const line = document.createElement('div'); line.className = cls; line.style.margin = '0;font-weight:bold;color:' + cls; line.textContent = text; body.appendChild(line); body.scrollTop = body.scrollHeight; } const body = t.querySelector('#terminal-body'); log('AI Terminal ready. Ask anything.', 'white'); closeBtn.addEventListener('click', () => t.style.display = 'none'); const input = t.querySelector('#terminal-input'); input.focus(); const s = document.createElement('script'); s.src = 'https://js.puter.com/v2/'; s.onload = () => { input.addEventListener('keypress', async e => { if (e.key === 'Enter') { const prompt = input.value.trim(); if (!prompt) return; log('> ' + prompt, 'white'); input.value = ''; try { const response = await puter.ai.chat(prompt, { model: 'gpt-5.4-nano' }); log(response, 'hsl(' + hue + ',100%,50%)'); } catch (err) { log('Error: AI service failed.', 'red'); } } }); }; document.head.appendChild(s); })();";
            link.textContent = 'TuffTerminal';
            link.title = 'Drag me to your bookmarks bar!';
            link.style.color = 'var(--accent, #89b4fa)';
            link.style.fontWeight = 'bold';
            link.style.cursor = 'grab';
            link.style.textDecoration = 'underline';
            link.addEventListener('click', e => e.preventDefault());
            panelTextElement.appendChild(link);
            });
        } else if (btnNum === 2) {
            typePanelText('Web Console. Execute JavaScript from any page. Drag this link to your bookmarks bar to install: ', () => {
            const link = document.createElement('a');
            link.href = "javascript:(function(){const c=document.createElement('div');c.innerHTML='<style>.console{position:fixed;top:20px;right:20px;width:500px;height:300px;background:#0d1117;color:#c9d1d9;font:12px/1.5 \"SF Mono\",Consolas,Monaco,monospace;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.5);display:flex;flex-direction:column;z-index:9999;border:1px solid #30363d;animation:slideDown .5s ease-out}.header{padding:8px 12px;background:#161b22;border-bottom:1px solid #30363d;cursor:move;display:flex;justify-content:space-between;align-items:center}.body{flex:1;padding:10px;overflow:auto;max-height:0;transition:max-height .3s ease-out .5s}.animate .body{max-height:300px}@keyframes slideDown{from{top:0;opacity:0}to{top:20px;opacity:1}}</style><div class=\"console animate\"><div class=\"header\"><div>Web Console</div><div class=\"close\">×</div></div><div class=\"body\"></div><div style=\"padding:8px 12px;background:#161b22\"><input autofocus style=\"width:100%;background:transparent;border:none;color:#c9d1d9;outline:none\" placeholder=\"Enter JavaScript...\"></div></div>';document.body.appendChild(c);const console=c.querySelector('.body'),input=c.querySelector('input');input.addEventListener('keydown',e=>{if(e.key==='Enter'){try{console.innerHTML+=%60<div>&gt; ${input.value}</div><div>${String(eval(input.value))}</div>%60;console.scrollTop=console.scrollHeight}catch(err){console.innerHTML+=%60<div>Error: ${err.message}</div>%60}input.value=''}});c.querySelector('.close').onclick=()=>c.remove();console.innerHTML='<div>Console ready. Type JavaScript commands.</div>'})();";
            link.textContent = 'Web Console';
            link.title = 'Drag me to your bookmarks bar!';
            link.style.color = 'var(--accent, #89b4fa)';
            link.style.fontWeight = 'bold';
            link.style.cursor = 'grab';
            link.style.textDecoration = 'underline';
            link.addEventListener('click', e => e.preventDefault());
            panelTextElement.appendChild(link);
            });
        } else if (btnNum === 3) {
            typePanelText('Web pr0xy. Browse from a glass widget overlay. Drag this link to your bookmarks bar to install: ', () => {
            const link = document.createElement('a');
            link.href = `javascript:(function(){var ID='ghc-glass-widget',SID='ghc-glass-widget-style';var old=document.getElementById(ID);if(old){old.remove();var os=document.getElementById(SID);if(os)os.remove();if(window.ghcGlassWidgetLoad)delete window.ghcGlassWidgetLoad;if(window.ghcGlassWidgetLoadHosted)delete window.ghcGlassWidgetLoadHosted;return;}var st=document.createElement('style');st.id=SID;st.textContent='#'+ID+'{position:fixed;top:60px;left:60px;width:min(520px,calc(100vw - 24px));height:min(380px,calc(100vh - 24px));min-width:260px;min-height:220px;border-radius:16px;border:1px solid rgba(255,255,255,.18);background:linear-gradient(160deg,rgba(20,26,37,.62),rgba(8,12,20,.52));-webkit-backdrop-filter:blur(18px) saturate(130%);backdrop-filter:blur(18px) saturate(130%);box-shadow:0 24px 50px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.08);color:#eef3ff;z-index:2147483647;overflow:hidden;font:14px/1.45 Avenir Next,Segoe UI,Helvetica Neue,Arial,sans-serif}#'+ID+' .gh{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;cursor:move;user-select:none;background:rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.15)}#'+ID+' .gt{font-weight:600;letter-spacing:.7px;text-transform:uppercase;font-size:12px;opacity:.92}#'+ID+' .gc{border:0;padding:0;margin:0;background:transparent;color:#d8e2ff;cursor:pointer;font:700 16px/1 Arial,sans-serif}#'+ID+' .gc:hover{opacity:.8}#'+ID+' .gb{height:calc(100% - 41px);padding:8px;background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.01))}#'+ID+' .gf{width:100%;height:100%;border:0;border-radius:10px;background:#0b111d}#'+ID+' .gr{position:absolute;right:0;bottom:0;width:18px;height:18px;cursor:nwse-resize;border-bottom-right-radius:16px;background:linear-gradient(135deg,transparent 53%,rgba(255,255,255,.55) 53%,rgba(255,255,255,.55) 58%,transparent 58%),linear-gradient(135deg,transparent 66%,rgba(255,255,255,.38) 66%,rgba(255,255,255,.38) 71%,transparent 71%)}';var p=document.createElement('section');p.id=ID;p.innerHTML='<div class="gh"><div class="gt">web pr0xy</div><button class="gc" type="button" aria-label="Close">X</button></div><div class="gb"><iframe class="gf" title="web pr0xy Content" referrerpolicy="no-referrer"></iframe></div><div class="gr" aria-hidden="true"></div>';document.head.appendChild(st);document.body.appendChild(p);var h=p.querySelector('.gh'),c=p.querySelector('.gc'),f=p.querySelector('.gf'),r=p.querySelector('.gr');var clamp=function(v,min,max){return Math.max(min,Math.min(v,max));};var load=function(input,mode){var v=String(input==null?'':input).trim();if(!v)return;var asHtml=mode==='html'||v.indexOf('<')===0||v.indexOf('<!DOCTYPE')===0;if(asHtml){f.removeAttribute('src');f.srcdoc=v;return;}f.removeAttribute('srcdoc');f.src=v;};var loadHosted=function(url){var target=String(url==null?'':url).trim();if(!target)return;var safe=target.replace(/&/g,'&').replace(/"/g,'"');var wrapper='<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;height:100%;background:#0b111d}iframe{width:100%;height:100%;border:0}</style></head><body><iframe src="'+safe+'" referrerpolicy="no-referrer"></iframe></body></html>';load(wrapper,'html');};window.ghcGlassWidgetLoad=load;window.ghcGlassWidgetLoadHosted=loadHosted;loadHosted('https://sandstone.pages.dev/');var dragging=false,resizing=false,sx=0,sy=0,sl=0,stp=0,sw=0,sh=0;h.addEventListener('pointerdown',function(e){if(resizing||e.button!==0||e.target.closest('.gc'))return;dragging=true;var b=p.getBoundingClientRect();sx=e.clientX;sy=e.clientY;sl=b.left;stp=b.top;e.preventDefault();});r.addEventListener('pointerdown',function(e){if(e.button!==0)return;e.stopPropagation();resizing=true;var b=p.getBoundingClientRect();sx=e.clientX;sy=e.clientY;sw=b.width;sh=b.height;e.preventDefault();});var mv=function(e){if(dragging&&!resizing){var dx=e.clientX-sx,dy=e.clientY-sy,maxL=Math.max(8,window.innerWidth-p.offsetWidth-8),maxT=Math.max(8,window.innerHeight-p.offsetHeight-8);p.style.left=clamp(sl+dx,8,maxL)+'px';p.style.top=clamp(stp+dy,8,maxT)+'px';}if(resizing){var dx2=e.clientX-sx,dy2=e.clientY-sy,b2=p.getBoundingClientRect(),maxW=Math.max(260,window.innerWidth-b2.left-8),maxH=Math.max(220,window.innerHeight-b2.top-8);p.style.width=clamp(sw+dx2,260,maxW)+'px';p.style.height=clamp(sh+dy2,220,maxH)+'px';}};var up=function(){dragging=false;resizing=false;};window.addEventListener('pointermove',mv,true);window.addEventListener('pointerup',up,true);window.addEventListener('pointercancel',up,true);var rm=function(){window.removeEventListener('pointermove',mv,true);window.removeEventListener('pointerup',up,true);window.removeEventListener('pointercancel',up,true);if(window.ghcGlassWidgetLoad===load)delete window.ghcGlassWidgetLoad;if(window.ghcGlassWidgetLoadHosted===loadHosted)delete window.ghcGlassWidgetLoadHosted;p.remove();st.remove();};c.addEventListener('pointerdown',function(e){e.stopPropagation();});c.addEventListener('click',rm);})();`;
            link.textContent = 'Web pr0xy';
            link.title = 'Drag me to your bookmarks bar!';
            link.style.color = 'var(--accent, #89b4fa)';
            link.style.fontWeight = 'bold';
            link.style.cursor = 'grab';
            link.style.textDecoration = 'underline';
            link.addEventListener('click', e => e.preventDefault());
            panelTextElement.appendChild(link);
            });
        } else {
            const text = buttonMessages[btnNum] || `Button ${btnNum} clicked.`;
            typePanelText(text);
        }
    });
});
