(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    function initPrestigePlugin() {
        if (window['cinema_online_prestige_loaded']) return;
        window['cinema_online_prestige_loaded'] = true;

        // Регистрируем компонент отображения по стандарту Lampa
        Lampa.Component.add('cinema_online_prestige', function (object) {
            var scroll = new Lampa.Scroll({ mask: true, over: true });
            
            this.start = function () {
                scroll.clear();
                var textHtml = '<div class="online-empty" style="padding: 20px;">' +
                               '<div class="online-empty__title" style="font-size: 2em; margin-bottom: 10px;">Prestige Источник</div>' +
                               '<div class="online-empty__time">Поиск контента: ' + (object.search || '...') + '</div>' +
                               '</div>';
                var textElement = $(textHtml);
                scroll.append(textElement);
                
                Lampa.Controller.add('content', {
                    toggle: function () {
                        Lampa.Controller.collectionFocus(scroll.render(), scroll.render());
                    },
                    left: function () {
                        Lampa.Controller.toggle('menu');
                    },
                    back: function () {
                        Lampa.Activity.backward();
                    }
                });
                Lampa.Controller.toggle('content');
            };

            this.render = function () {
                return scroll.render();
            };

            this.destroy = function () {
                scroll.destroy();
            };
        });

        // Отслеживаем открытие карточек через стандартный Listener
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'activity' && event.name === 'card') {
                setTimeout(function () {
                    var cardRender = event.object.render();
                    // Исправлен селектор контейнера кнопок под современные версии Lampa
                    var targetContainer = cardRender.find('.full-start__buttons, .card__buttons, .movie-buttons');

                    if (targetContainer.length && !cardRender.find('.prestige-online-btn').length) {
                        var btnHtml = '<div class="full-start__button selector lampac--button prestige-online-btn" style="margin-left: 10px;">' +
                                      '<span>Prestige Онлайн</span>' +
                                      '</div>';
                        var $btn = $(btnHtml);

                        // Исправлен обработчик клика для корректной работы на Android-телефонах (сенсорный ввод)
                        $btn.on('hover:enter click', function () {
                            Lampa.Activity.push({
                                url: '',
                                title: 'Prestige Онлайн',
                                component: 'cinema_online_prestige',
                                search: event.data.movie.title || event.data.movie.name || event.data.movie.original_title,
                                movie: event.data.movie,
                                page: 1
                            });
                        });

                        // Позиционирование кнопки строго после кнопки "Смотреть"
                        var mainBtn = targetContainer.find('.full-start__button:first, .button--play:first, .button--watch:first');
                        if (mainBtn.length) {
                            mainBtn.after($btn);
                        } else {
                            targetContainer.append($btn);
                        }

                        // Безопасное обновление фокуса навигации (не вешает мобильный интерфейс)
                        if (Lampa.Controller.window_status && Lampa.Controller.window_status.name === 'card') {
                            if (typeof Lampa.Controller.updateSelect === 'function') {
                                Lampa.Controller.updateSelect(targetContainer);
                            } else {
                                Lampa.Controller.toggle('card');
                            }
                        }
                    }
                }, 400); // Оптимальная задержка рендеринга
            }
        });
    }

    if (document.readyState === 'complete') {
        setTimeout(initPrestigePlugin, 500);
    } else {
        window.addEventListener('load', function () {
            setTimeout(initPrestigePlugin, 500);
        });
    }
})();
