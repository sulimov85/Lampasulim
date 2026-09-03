(function () {
    'use strict';

    Lampa.Platform.tv();

    if (window.prestige_online_loaded) return;
    window.prestige_online_loaded = true;

    function initPlugin() {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'activity' && event.name === 'card') {
                setTimeout(function () {
                    addPrestigeButton(event.object);
                }, 500);
            }
        });
    }

    function addPrestigeButton(cardObject) {
        var cardRender = cardObject.render ? cardObject.render() : null;
        if (!cardRender) return;

        var container = cardRender.find(
            '.full-start__buttons, .card__buttons, .movie-button, ' +
            '.buttons-row, .card-actions, [data-role="buttons"]'
        );
        if (!container.length) {
            container = cardRender.find('.full-start, .card').find('.buttons, .actions');
        }
        if (!container.length) return;

        if (container.find('.prestige-online-btn').length) return;

        var btn = $(
            '<div class="full-start__button selector lampac--button prestige-online-btn" style="margin-left:10px;">' +
            '<span>Prestige Онлайн</span>' +
            '</div>'
        );

        btn.on('hover:enter click', function (e) {
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

        var firstBtn = container.find('.full-start__button:first, .button--play:first, .button--watch:first');
        if (firstBtn.length) {
            firstBtn.after(btn);
        } else {
            container.append(btn);
        }

        if (Lampa.Controller && typeof Lampa.Controller.updateSelect === 'function') {
            Lampa.Controller.updateSelect(container);
        }
    }

    if (window.lampa_started) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                initPlugin();
            }
        });
    }
})();
