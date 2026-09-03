(function() {
    'use strict';

    // Проверяем, что Lampa доступна
    if (typeof Lampa === 'undefined') return;

    // Регистрация компонента плагина в системе Lampa
    function initPrestigePlugin() {
        if (window['cinema_online_prestige_loaded']) return;
        window['cinema_online_prestige_loaded'] = true;

        // Создаем описание плагина
        var pluginManifest = {
            type: 'video',
            version: '1.0.0',
            name: 'Cinema Prestige',
            description: 'Параллельный просмотр через источник Prestige',
            component: 'cinema_online_prestige'
        };

        // Регистрируем пустой базовый компонент, чтобы Lampa не выдавала ошибку при вызове
        Lampa.Component.add('cinema_online_prestige', function(object) {
            var scroll = new Lampa.Scroll({mask: true, over: true});
            
            this.start = function() {
                scroll.clear();
                // Выводим сообщение о том, что источник успешно интегрирован
                var textElement = $('<div class="online-empty"><div class="online-empty__title">Prestige Источник</div><div class="online-empty__time">Поиск по названию: ' + object.search + '</div></div>');
                scroll.append(textElement);
                Lampa.Controller.add('content', {
                    toggle: function() {
                        Lampa.Controller.collectionFocus(scroll.render(), scroll.render());
                    },
                    left: function() { Lampa.Controller.toggle('menu'); },
                    back: function() { Lampa.Activity.backward(); }
                });
                Lampa.Controller.toggle('content');
            };

            this.render = function() { return scroll.render(); };
            this.destroy = function() { scroll.destroy(); };
        });

        // Инжектим кнопку "Prestige Онлайн" в карточку фильма (событие открытия карточки)
        Lampa.Listener.follow('app', function(event) {
            if (event.type === 'activity' && event.name === 'card') {
                var targetContainer = event.object.render().find('.full-start__buttons');
                
                // Проверяем, нет ли уже нашей кнопки, чтобы избежать дублирования
                if (targetContainer.length && !targetContainer.find('.prestige-online-btn').length) {
                    var btnHtml = '<div class="full-start__button selector lampac--button prestige-online-btn"><span>Prestige Онлайн</span></div>';
                    var $btn = $(btnHtml);
                    
                    // Навешиваем обработчик клика/нажатия на кнопку
                    $btn.on('hover:enter', function() {
                        Lampa.Activity.push({
                            url: '',
                            title: 'Prestige Онлайн',
                            component: 'cinema_online_prestige',
                            search: event.data.movie.title || event.data.movie.name,
                            movie: event.data.movie,
                            page: 1
                        });
                    });

                    // Аккуратно добавляем кнопку в самый конец списка кнопок карточки
                    targetContainer.append($btn);
                }
            }
        });
    }

    // Запуск инициализации с небольшой задержкой, чтобы все модули Lampa успели прогрузиться
    setTimeout(initPrestigePlugin, 500);
})();
