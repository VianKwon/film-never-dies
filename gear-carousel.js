/* Shared arc display; collection data and saved icon choices stay in app.js. */
(() => {
    const selected = { camera: null, film: null };
    const lastIndex = { camera: 0, film: 0 };
    const listId = type => type === 'camera' ? 'cameras-list' : 'films-list';
    let closeMenu = () => {};

    function render(type) {
        const host = document.getElementById(listId(type));
        if (!host) return;
        closeMenu();
        const names = loadStringArray(type === 'camera' ? STORAGE_KEYS.cameras : STORAGE_KEYS.filmNames)
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        let index = names.indexOf(selected[type]);
        if (index < 0) index = Math.min(lastIndex[type], Math.max(0, names.length - 1));
        selected[type] = names[index] || null;
        const options = type === 'camera' ? cameraIconOptions : filmIconOptions;
        host.closest('.shelf').classList.add('arc-shelf');
        host.className = 'display-items gear-carousel';
        host.style.transform = 'none';
        host.replaceChildren();
        const stage = document.createElement('div');
        stage.className = `gear-stage gear-stage-${type}`;
        stage.tabIndex = 0;
        stage.setAttribute('role', 'region');
        stage.setAttribute('aria-label', type === 'camera' ? 'Camera collection' : 'Film collection');
        const arc = document.createElement('div');
        arc.className = 'gear-arc';
        stage.append(arc);
        const objects = names.map((name, i) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'gear-object';
            item.setAttribute('aria-label', name);
            const img = document.createElement('img');
            const iconPath = savedGearIcon(type, name, options, i);
            item.dataset.icon = iconPath;
            img.dataset.source = gearIconSource(iconPath);
            img.decoding = 'async';
            img.alt = '';
            img.draggable = false;
            item.append(img);
            stage.append(item);
            return item;
        });
        if (!names.length) {
            const empty = document.createElement('div');
            empty.className = 'gear-arc-empty';
            empty.textContent = type === 'camera' ? 'No cameras yet' : 'No films yet';
            stage.append(empty);
        }
        const caption = document.createElement('div');
        caption.className = 'gear-caption';
        caption.setAttribute('aria-live', 'polite');
        const pagination = document.createElement('div');
        pagination.className = 'gear-pagination';
        const menus = names.map(name => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'gear-delete-menu';
            button.hidden = true;
            button.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
            button.setAttribute('aria-label', `Delete ${name}`);
            button.onclick = event => {
                closeMenu();
                (type === 'camera' ? deleteCamera : deleteFilmStock)(name, event);
            };
            return button;
        });
        closeMenu = () => {
            document.querySelectorAll('.gear-delete-menu').forEach(el => { el.hidden = true; });
            document.querySelectorAll('.gear-object.is-held').forEach(el => el.classList.remove('is-held'));
            document.querySelectorAll('.gear-carousel.is-editing').forEach(el => el.classList.remove('is-editing'));
        };
        host.append(stage, caption, pagination, ...menus);
        function showMenu() {
            closeMenu();
            host.classList.add('is-editing');
            const hostBounds = host.getBoundingClientRect();
            objects.forEach((item, i) => {
                if (item.dataset.position === 'hidden') return;
                const img = item.querySelector('img');
                const bounds = img.getBoundingClientRect();
                // Position against the contained bitmap, not its differently shaped button box.
                const ratio = img.naturalWidth / img.naturalHeight || 1;
                const width = Math.min(bounds.width, bounds.height * ratio);
                const height = Math.min(bounds.height, bounds.width / ratio);
                const right = bounds.left + (bounds.width + width) / 2 - hostBounds.left;
                const top = bounds.bottom - height - hostBounds.top;
                let left = right + 5;
                let buttonTop = top - 8;
                if (type === 'camera') {
                    left = right - 1;
                    buttonTop = top - 22;
                }
                if (left + 32 > hostBounds.width - 4) {
                    left = Math.max(4, hostBounds.width - 36);
                    buttonTop = top - 37;
                }
                menus[i].style.left = `${left}px`;
                menus[i].style.top = `${Math.max(4, buttonTop)}px`;
                menus[i].hidden = false;
                item.classList.add('is-held');
            });
        }
        function paint() {
            lastIndex[type] = index;
            selected[type] = names[index] || null;
            objects.forEach((item, i) => {
                let offset = i - index;
                if (names.length > 2) {
                    if (offset > names.length / 2) offset -= names.length;
                    if (offset < -names.length / 2) offset += names.length;
                }
                item.dataset.position = offset === 0 ? 'center' : offset === -1 ? 'left' : offset === 1 ? 'right' : 'hidden';
                const img = item.querySelector('img');
                if (Math.abs(offset) <= 1 && !img.hasAttribute('src')) img.src = img.dataset.source;
                item.tabIndex = Math.abs(offset) <= 1 ? 0 : -1;
                item.setAttribute('aria-hidden', String(Math.abs(offset) > 1));
            });
            caption.textContent = names[index] || '';
            pagination.replaceChildren();
            if (names.length > 7) {
                const counter = document.createElement('span');
                counter.textContent = `${index + 1} / ${names.length}`;
                pagination.append(counter);
            } else if (names.length > 1) names.forEach((name, i) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'gear-dot';
                dot.setAttribute('aria-label', `Show ${name}`);
                dot.setAttribute('aria-current', String(i === index));
                dot.onclick = () => { closeMenu(); index = i; paint(); };
                pagination.append(dot);
            });
        }
        function step(direction) {
            if (names.length < 2) return;
            closeMenu();
            index = names.length === 2 ? Math.max(0, Math.min(1, index + direction))
                : (index + direction + names.length) % names.length;
            paint();
        }
        let gesture = null;
        let suppressClick = false;
        stage.onpointerdown = event => {
            if (event.button !== 0 || !event.isPrimary) return;
            // Pointer long presses should not leave a keyboard-style outline behind.
            if (event.pointerType !== 'mouse') event.target.closest('.gear-object')?.blur();
            if (host.classList.contains('is-editing')) return;
            closeMenu();
            suppressClick = false;
            const item = event.target.closest('.gear-object');
            gesture = { x: event.clientX, y: event.clientY, moved: false, held: false, timer: null };
            const current = gesture;
            if (item) current.timer = setTimeout(() => {
                current.held = true;
                suppressClick = true;
                showMenu(objects.indexOf(item));
            }, LONG_PRESS_DURATION);
        };
        stage.onpointerleave = event => {
            if (event.pointerType === 'mouse' && gesture) {
                clearTimeout(gesture.timer);
                gesture = null;
                suppressClick = true;
            }
        };
        stage.onpointermove = event => {
            if (!gesture) return;
            if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 8) {
                gesture.moved = true;
                clearTimeout(gesture.timer);
            }
        };
        stage.onpointerup = event => {
            if (!gesture) return;
            clearTimeout(gesture.timer);
            const dx = event.clientX - gesture.x;
            const dy = event.clientY - gesture.y;
            suppressClick = gesture.moved || gesture.held;
            if (!gesture.held && Math.abs(dx) > 32 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
            gesture = null;
        };
        stage.onpointercancel = () => {
            if (gesture) clearTimeout(gesture.timer);
            gesture = null;
            suppressClick = true;
        };
        objects.forEach((item, i) => {
            item.onclick = () => {
                if (host.classList.contains('is-editing')) return;
                if (suppressClick) { suppressClick = false; return; }
                closeMenu(); index = i; paint();
            };
            item.oncontextmenu = event => { event.preventDefault(); showMenu(i); };
            item.onkeydown = event => {
                if (event.key === 'Delete' || (event.shiftKey && event.key === 'F10')) {
                    event.preventDefault(); showMenu(); menus[i].focus();
                }
            };
        });
        stage.onkeydown = event => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1);
            }
        };
        paint();
        updateStats();
        const section = host.closest('.form-section');
        section.querySelector('.stats-label').textContent = `${type}${names.length === 1 ? '' : 's'}`;
    }

    renderCamerasList = () => render('camera');
    renderFilmsList = () => render('film');
    // The arc stage owns pointer input instead of the former linear shelf.
    setupDragHandlers = () => {};
    initLongPress = () => {};
    updateScrollButtons = type => {
        const host = document.getElementById(listId(type));
        if (host) host.style.transform = 'none';
    };
    for (const type of ['camera', 'film']) {
        const original = type === 'camera' ? addCamera : addFilmStock;
        const add = name => {
            if (!selected[type]) selected[type] = normalizeText(name);
            original(name);
        };
        if (type === 'camera') addCamera = add;
        else addFilmStock = add;
    }
    document.addEventListener('pointerdown', event => {
        if (!event.target.closest('.gear-object, .gear-delete-menu')) closeMenu();
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
})();
