(function() {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    // Регистрируем плагин
    Lampa.Plugin.add({
        id: 'prestige-online',
        name: 'Prestige Онлайн',
        version: '1.1',
        description: 'Добавляет кнопку поиска в карточке',
        onStart: function() {
            if (window._prestige_online_initialized) return;
            window._prestige_online_initialized = true;

            // Слушаем открытие карточки
            Lampa.Listener.follow('app', function(event) {
                if (event.type === 'activity' && event.name === 'card') {
                    var cardObject = event.object;
                    // Ждём рендера карточки (более надёжно)
                    setTimeout(function() {
                        try {
                            addButtonToCard(cardObject);
                        } catch (e) {
                            console.warn('Prestige plugin error:', e);
                        }
                    }, 500);
                }
            });
        }
    });

    function addButtonToCard(cardObject) {
        var cardRender = cardObject.render ? cardObject.render() : null;
        if (!cardRender) return;

        // Ищем контейнер с кнопками
        var container = cardRender.find(
            '.full-start__buttons, .card__buttons, .movie-buttons, ' +
            '.buttons-row, .card-actions, [data-role="buttons"]'
        );
        if (!container.length) {
            // Если не нашли, пробуем найти внутри .full-start или .card
            container = cardRender.find('.full-start, .card').find('.buttons, .actions');
        }
        if (!container.length) return;

        // Проверяем, не добавлена ли уже кнопка
        if (container.find('.prestige-online-btn').length) return;

        // Создаём кнопку
        var btn = $('<div class="full-start__button selector lampac--button prestige-online-btn" style="margin-left:10px;"><span>Prestige Онлайн</span></div>');

        btn.on('hover:enter click', function(e) {
            e.stopPropagation();
            var movie = cardObject.data ? cardObject.data.movie : null;
            if (!movie) movie = cardObject.movie || {};
            var title = movie.title || movie.name || movie.original_title || '';
            if (!title) {
                Lampa.Notify.show('Название не найдено', 3000);
                return;
            }
            Lampa.Activity.push({
                url: '',
                title: 'Prestige Онлайн: ' + title,
                component: 'search',
                search: title,
                movie: movie,
                page: 1
            });
        });

        // Вставляем после первой кнопки
        var firstBtn = container.find('.full-start__button:first, .button--play:first, .button--watch:first');
        if (firstBtn.length) {
            firstBtn.after(btn);
        } else {
            container.append(btn);
        }

        // Обновляем навигацию
        if (Lampa.Controller && typeof Lampa.Controller.updateSelect === 'function') {
            Lampa.Controller.updateSelect(container);
        }
    }

})();
