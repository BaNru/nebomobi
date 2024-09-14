// ==UserScript==
// @name        Небоскреб
// @namespace   Игры
// @version     1.9.2
// @description Бот для игры Небоскребы
// @match       https://nebo.mobi/*
// @copyright   BaNru (2014-2024)
// @author   	BaNru
// ==/UserScript==

var BOT = {};
BOT.version = '1.9.2';
const DOMAIN = 'https://nebo.mobi/';
const DOMAIN_NAME = 'nebo.mobi';

console.log('НебоБот Запущен '+BOT.version);

/* Функции */

function debuglog(){
	// console.log(arguments);
}

/**
 *
 * end_xhr
 *
 * Последний запрос - выполнение действия и вывод ответа на экран
 *
 * @param {string} url - страница действия
 * @param {string} text - сообщение для вывода на экран
 * @param {string} time - вреия ожидания перед действие
 * @param {string} ref - реферал, если разрешено в браузере
 * @param {function} callback function, необязательный параметр
 *
 * TODO переписать функцию: заменить аргументы на объект и добавить передачу CLASS в AddTable
 *
 */
function end_xhr(url, text, time, ref, callback) {
	setTimeout(function(){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		// Раскомментировать строчку, если разрешены рефералы в браузере,
		// немного повышает защиту бота
		// xhr2.setRequestHeader('Referer', ref);
		xhr.onload = function() {
			AddTable(text);
			debuglog(url, xhr.responseURL);
		};
		xhr.onerror = function() {
			debuglog(xhr);
		};
		xhr.send();
		if(callback)callback();
	}, time);
}

/**
 *
 * rand_time
 * Случайное время
 *
 * По умолчанию возвращает от 2000 до 5000 (мс);
 * Задавать в секундах. Необязательные параметры
 * @param {number} min secunds
 * @param {number} max secunds
 *
 * @default min = 2s, max = 5s
 *
 * @returns {number} random millseconds
 *
 */
function rand_time(min, max) {
	min = ( min || 2 ) *1000;
	max = ( max || 5 ) *1000;
	return Math.floor(Math.random() * (max - min + 1)) + min;
}



/* Лифтер */
function liftFN() {
	setTimeout(function(){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', DOMAIN + 'lift', true);
		// Раскомментировать строчку, если разрешены рефералы в браузере,
		// немного повышает защиту бота
		// xhr.setRequestHeader('Referer', DOMAIN + 'lift');
		xhr.onload = function() {
			var parser = new DOMParser(),
				doc = parser.parseFromString(xhr.responseText, "text/html"),
				lift = doc.getElementsByClassName('lift')[0],
				ttime;
			if (lift && lift.getElementsByClassName('tdu')[0]) {
				end_xhr(
					lift.getElementsByClassName('tdu')[0].href ||
					DOMAIN + lift.getElementsByClassName('tdu')[0].getAttribute('href'),
					lift.innerHTML.replace('<div class="clb"></div>',''),
					rand_time(1,3),
					DOMAIN + 'lift',
					liftFN
				);
			} else {
				ttime = getTime(doc.querySelector('[id^=time]').innerHTML);
				AddTable(lift.innerHTML.replace('<div class="clb"></div>',''));
				AddMessTable('Ждем посетителя!','',function(){
					timer(ttime, document.getElementById('log_table_2'), false);
				});
				setTimeout(function(){
					AddMessTable('Развозим дальше','');
					liftFN();
				}, getSecond(ttime)*1000);
			}
		};
		xhr.onerror = function() {
			debuglog(xhr);
			AddTable('Лифт сломался, но не отчаивайся - мастера уже на месте!');
			AddMessTable('Ошибка! Перезапуск через','',function(){
				timer([0, 0, 0, 10], document.getElementById('log_table_2'), false);
			});
			setTimeout(function(){
				liftFN();
			}, 10000);
		};
		xhr.send();
	}, rand_time(3,6));
}



/* Закупаем товар */
function productBuy() {
	setTimeout(function(){
		var xhr = new XMLHttpRequest();
	    xhr.open('GET', DOMAIN + 'floors/0/2', true);
		// Раскомментировать строчку, если разрешены рефералы в браузере,
		// немного повышает защиту бота
		// xhr.setRequestHeader('Referer', DOMAIN + 'floors/0/2');

		xhr.onload = function() {
			var parser = new DOMParser();
			var doc = parser.parseFromString(xhr.responseText, "text/html");
			var tower = doc.getElementsByClassName('tower')[0];
			var links = tower.getElementsByClassName('tdu');
			var l = links.length;
			var i = 0, golink = "";
			var interval = setInterval(function(){
				if (links[i]) {
					golink = links[i].href || DOMAIN + links[i].getAttribute('href');
					if (/nebo\.mobi\/(?:\.\.\/)*floor\//.exec(golink)) {
						var xhr2 = new XMLHttpRequest();
						xhr2.open('GET', golink, true);
						// xhr2.setRequestHeader('Referer', DOMAIN + 'floors/0/2');
						xhr2.onload = function() {
							productAction(xhr2.responseText, xhr2.responseURL);
						};
						xhr2.onerror = function() {
							debuglog(xhr2);
						};
						xhr2.send();
					}
				}
				i++;
				if (i == l){
					clearInterval(interval);
				}
			}, 3000);
			productBuy();
		};
		xhr.onerror = function() {
			debuglog(xhr);
			AddTable('Закупка не получилась!');
			AddMessTable('Ошибка! Перезапуск через','',function(){
				timer([0, 0, 0, 10], document.getElementById('log_table_2'), false);
			});
			setTimeout(function(){
				productBuy();
			}, 10000);
		};
		xhr.send();

	}, rand_time(25,30));
}
/* Функция закупки */
function productAction(text,ref){

	var parser    = new DOMParser();
	var doc       = parser.parseFromString(text, "text/html");
	var prd       = doc.getElementsByClassName('prd')[0];
	var links     = prd.getElementsByClassName('tdu');
	var l         = links.length;
	var i = 0, golink = "";
	var intl = setInterval(function(){
		if (links[i]) {
			golink = links[i].href || DOMAIN + links[i].getAttribute('href');
			if (/wicket:interface=:\d+:floorPanel:product[A-Z]:emptyState:action:link::ILinkListener::/.exec(golink)) {
				// TODO Сделать вывод закупаемого товара
				// Сейчас выводится первый, если в магазине 1 товар на закупку
				end_xhr(golink, prd.querySelectorAll('li')[i].innerHTML, 100, ref);
			}
		}
		i++;
		if (i == l){
			clearInterval(intl);
		}
	}, 1000);

}



/* Сбор выручки */
function collectRevenue() {
	setTimeout(function(){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', DOMAIN + 'floors/0/5', true);
		// xhr.setRequestHeader('Referer', DOMAIN + 'floors/0/5');
		xhr.onload = function() {
			var parser = new DOMParser();
			var doc = parser.parseFromString(xhr.responseText, "text/html");
			var tower = doc.getElementsByClassName('tower')[0];
			var links = tower.getElementsByClassName('tdu');
			var l = links.length;
			var i = 0, golink = "";
			var interval = setInterval(function(){
				if (links[i]) {
					golink = links[i].href || DOMAIN + links[i].getAttribute('href');
					if (/wicket:interface=:\d+:floors:\d+:floorPanel:state:action::ILinkListener::/.exec(golink)) {
						end_xhr(golink, tower.querySelectorAll('li')[i].innerHTML, 100, DOMAIN + 'floors/0/5');
					}
				}
				i++;
				if (i == l){
					clearInterval(interval);
				}
			}, 3000);
			collectRevenue();
		};
		xhr.onerror = function() {
			debuglog(xhr);
			AddTable('Сбор выручки не получился!');
			AddMessTable('Ошибка! Перезапуск через','',function(){
				timer([0, 0, 0, 10], document.getElementById('log_table_2'), false);
			});
			setTimeout(function(){
				collectRevenue();
			}, 10000);
		};
		xhr.send();
	}, rand_time(25,30));
}



/* Выложить товар */
function putProduct() {
	setTimeout(function(){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', DOMAIN + 'floors/0/3', true);
		// xhr.setRequestHeader('Referer', DOMAIN + 'floors/0/3');
		xhr.onload = function() {
			var parser = new DOMParser();
			var doc = parser.parseFromString(xhr.responseText, "text/html");
			var tower = doc.getElementsByClassName('tower')[0];
			var links = tower.getElementsByClassName('tdu');
			var l = links.length;
			var i = 0, golink = "";
			var interval = setInterval(function(){
				if (links[i]) {
					golink = links[i].href || DOMAIN + links[i].getAttribute('href');
					if (/wicket:interface=:\d+:floors:\d+:floorPanel:state:action::ILinkListener::/.exec(golink)) {
						end_xhr(golink, tower.querySelectorAll('li')[i].innerHTML, 100, DOMAIN + "floors/0/3");
					}
				}
				i++;
				if (i == l){
					clearInterval(interval);
				}
			}, 3000);
			putProduct();
		};
		xhr.onerror = function() {
			debuglog(xhr);
			AddTable('Выложить товар не получилось!');
			AddMessTable('Ошибка! Перезапуск через','',function(){
				timer([0, 0, 0, 10], document.getElementById('log_table_2'), false);
			});
			setTimeout(function(){
				putProduct();
			}, 10000);
		};
		xhr.send();
	}, rand_time(25,30));
}



/* Выселение жителей */
// TODO не всегда выселяет с первого раза, когда-нибудь найти ошибку и исправить
function humansFN() {
	setTimeout(function(){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', DOMAIN + 'humans', true);
		xhr.onload = function() {
			var link, lvl, amount,
				parser	= new DOMParser(),
				doc 	= parser.parseFromString(xhr.responseText, "text/html"),
				human	= doc.querySelectorAll('.rsd li'),
				tl		= human.length,
				time_	= 0;
			for (var i = 0; i < tl; i++) {
				link	= human[i].querySelector('a'),
				lvl		= human[i].querySelector('.abstr'),
				amount	= human[i].querySelector('.amount');
				if (link && parseInt(lvl.innerText) < 9 && !amount) {
					time_ = rand_time()+time_;
					debuglog(link, parseInt(lvl.innerText));
					AddTable('<div class="rsd">'+human[i].innerHTML+'</div>');
					!function(t,l) {
						setTimeout(function(){
							evict(l);
						},t);
					}(time_, link.getAttribute('href'));
				}
			}
		};
		xhr.onerror = function() {
			debuglog(xhr);
		};
		xhr.send();
		humansFN();
	}, rand_time(180,300));// Раз в 3-5 минут
}
/* Функция выселения выбранного жителя */
function evict(url) {
	setTimeout(function(){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onload = function() {
			var parser	= new DOMParser(),
				doc 	= parser.parseFromString(xhr.responseText, "text/html"),
				name	= doc.querySelector('.wrk strong.stat'),
				link	= doc.querySelector('a.btnr').getAttribute('href');
			end_xhr(link, name.innerText+' выселен(а)', rand_time(), url);
		};
		xhr.onerror = function() {
			debuglog(xhr);
		};
		xhr.send();
	}, rand_time());
}


/* Задания */
function quests(){
	setTimeout(function(){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', DOMAIN + 'quests', true);
		xhr.onload = function() {
			var parser	= new DOMParser(),
				doc 	= parser.parseFromString(xhr.responseText, "text/html"),
				link	= doc.querySelectorAll('.nfl .btng'),
				tl		= link.length,
				time_	= 0;
			for (var i = 0; i < tl; i++) {
				time_ 	= rand_time()+time_;
				//TODO не забыть: когда изменю nd_xhr - убрать тут и в других местах оборачивающий DIV
				end_xhr(DOMAIN + link[i].getAttribute('href'), '<div class="nfl">'+link[i].closest('.nfl').innerHTML+'</div>', time_, DOMAIN + 'quests');
			}
		};
		xhr.onerror = function() {
			debuglog(xhr);
		};
		xhr.send();
		quests();
	}, rand_time(180,300));// Раз в 3-5 минут
}



/* Задания города */
function questsCity(){
	setTimeout(function(){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', DOMAIN + 'city/quests/', true);
		xhr.onload = function() {
			var parser	= new DOMParser(),
				doc 	= parser.parseFromString(xhr.responseText, "text/html"),
				link	= doc.querySelector('.nfl .btng[href*="myQuest:getAwarLink"') ||
						  doc.querySelector('.nfl .btnr[href*="myQuest:getAwarLink"'),
				stop	= false;

			// Если нет ссылок сбора
			if(!link){
				var setting = JSON.parse(localStorage.getItem('setting_bot_quests')) || {},
					easyMoney = localStorage.getItem('setting_bot_easy_money'),
					hour = (new Date).getHours(),
					links = doc.querySelectorAll('.nfl .btng[href*="freeQuests"');

				// Баксы в полночь
				if(easyMoney && easyMoney >= 0 && hour >= easyMoney){
					setting[0] = 'Легкие деньги';
				}

				for(var cur in setting){
					if(stop)break;
					for (var i = 0, l = links.length; i < l; i++) {
						if(setting[cur] === links[i].parentNode.parentNode.querySelector('div:nth-child(1) > strong').textContent){
							link = links[i];
							stop = true;
							break;
						}
					}
				}

			}

			// Сбор задания или выбор нового
			if(link){
				end_xhr(
					DOMAIN + link.getAttribute('href'),
					'<div class="nfl">'+link.closest('.nfl').innerHTML+'</div>',
					rand_time(),
					DOMAIN + 'city/quests/'
				);
			}
		};
		xhr.onerror = function() {
			debuglog(xhr);
		};
		xhr.send();
		questsCity();
	}, rand_time(180,300));// Раз в 3-5 минут
}
/* Выбор задания города (вывод инпутов) */
function questsCitySelect(){
	var elements  = document.querySelectorAll('div.nfl > div:nth-child(1) > strong'),
		setting   = JSON.parse(localStorage.getItem('setting_bot_quests')) || {},
		easyMoney = localStorage.getItem('setting_bot_easy_money'),
		inputMoney;

	// Поле для Легких денег
	inputMoney = document.createElement('input');
	inputMoney.className = 'easy_money';
	inputMoney.type="number";
	inputMoney.size='2';
	inputMoney.min = '0';
	inputMoney.max = '23';
	inputMoney.value = easyMoney;
	inputMoney.addEventListener('input', function(){
		localStorage.setItem('setting_bot_easy_money', parseInt(this.value));
	});

	for (var i = 0, l = elements.length, input; i < l; i++) {
		input = document.createElement('input');
		input.addEventListener('input', questsCitySelectChange);
		input.className = 'input_bot_quests';
		input.type="number";
		input.size='2';
		input.min = '0';
		input.max = '19';
		input.value = 0;
		input.setAttribute('value', 0);
		for(var cur in setting){
			if (setting[cur] === elements[i].textContent){
				input.value = cur;
				input.setAttribute('value', cur);
			}
			if(elements[i].textContent === 'Легкие деньги'){
				elements[i].appendChild(inputMoney);
			}
		}
		elements[i].appendChild(input);
	}
}
/* Изменение приоритета заданий города */
function questsCitySelectChange(){

	var thisInput = this,
		thisInputValue = this.value,
		thisText = thisInput.parentNode.textContent,
		setting = JSON.parse(localStorage.getItem('setting_bot_quests')) || {},
		inputD = document.querySelector('div.nfl > div:nth-child(1) > strong input[value="'+thisInputValue+'"]');

	// Удаялем/обнуляем другие значения с таким же приоритетом
	if(thisInputValue > 0 && inputD){
		inputD.value = 0;
		inputD.setAttribute('value', 0);
	}

	// Удаляем текущее, чтобы записать новое
	for(var cur in setting){
		if(setting[cur] === thisText){
			delete setting[cur];
		}
	}

	// Устанавливаем value, чтобы сработал querySelector на удаление
	thisInput.setAttribute('value', thisInputValue);


	// Пишем новое значение
	if(thisInputValue.length > 0){
		setting[thisInputValue] = thisText;
	}

	// Удаляем пустышки
	delete setting[""];
	delete setting[0];

	// Пишем в localStorage
	localStorage.setItem('setting_bot_quests', JSON.stringify(setting));
}



/*
 * Инвесторы
 *
 * @param {String} url, необязательный параметр
 * @param {Number} millseconds - время ожидания, необязательный параметр
 *
*/
function boss(url,time){
	// TODO Сделать ожидание дня
	var day = (new Date()).getDay();
	url = url || DOMAIN + "boss/";
	if(day == 6){
		time = time || rand_time();
	}
	setTimeout(function(){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onload = function() {
			var parser	= new DOMParser(),
				doc 	= parser.parseFromString(xhr.responseText, "text/html"),
				link	= doc.querySelector('.btng[href*="startCombatLink"]'),
				time0	= doc.querySelector('.cntr > div > div.amount span'),
				time1	= doc.querySelector('.m5 > .cntr.amount .hr + span'),
				time2	= doc.querySelector('.cntr span[id^=time]');

			// Инициируем запуск переговоров
			if(link){
				AddTable('<div class="nfl">'+link.closest('.m5').innerHTML+'</div>');
				setTimeout(function(){
					debuglog(link, link.innerHTML);
					boss(DOMAIN + link.getAttribute('href'));
				},rand_time());
			} else {

				// Ожидание начала
				link = doc.querySelector('.btng[href*="actionLink"]');
				if(time0){
					boss(DOMAIN + link.getAttribute('href'),parseInt(time0.textContent)*1000);
					AddTable('<div class="nfl">'+time0.closest('.cntr').innerHTML+'</div>');
				}

				// Перерыв
				else if(time1){
					boss(DOMAIN + link.getAttribute('href'),getSecond(('0:'+time1.textContent).split(':'))*1000);
					AddTable('<div class="nfl">'+time1.closest('.m5').innerHTML+'</div>');
				}

				// Переговоры уже идут
				else if(time2){
					boss(DOMAIN + link.getAttribute('href'),parseInt(time2.textContent)*1000);
					AddTable('<div class="nfl">'+time2.closest('.cntr').parentNode.innerHTML+'</div>');
				}

				// Скорее всего начало переговоров
				else {
					if(link){
						AddTable('<div class="nfl">'+link.closest('.cntr').parentNode.innerHTML+'</div>');
						boss(DOMAIN + link.getAttribute('href'),500);
					}
					// Вероятно ошибка
					else{
						boss();
					}
				}
			}
		};
		xhr.onerror = function() {
			boss();
			debuglog(xhr);
		};
		xhr.send();
	}, time);
}



/* Задания вестибюля */
function lobby(){
	setTimeout(function(){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', DOMAIN + 'lobby', true);
		xhr.onload = function() {
			var parser	= new DOMParser(),
				doc 	= parser.parseFromString(xhr.responseText, "text/html"),
				link	= doc.querySelector('.btng[href*="questPanel:getAwarLink"]') ||
						  doc.querySelector('.btng[href*="questPanel:getQuest"]'),
				thisText= doc.querySelector('.nfl .admin').textContent,
				setting = JSON.parse(localStorage.getItem('setting_bot_lobby')) || {};

			if(link && setting[thisText]){
				end_xhr(
					DOMAIN + link.getAttribute('href'),
					'<div class="nfl">'+link.closest('.nfl').innerHTML+'</div>',
					rand_time(),
					DOMAIN + 'lobby'
				);
			}
		};
		xhr.onerror = function() {
			debuglog(xhr);
		};
		xhr.send();
		lobby();
	}, rand_time(180,300));// Раз в 3-5 минут
}
/* Инпуты в вестибюле */
function lobbySelect(){
	var element	= document.querySelector('div.nfl:not(.m5)'),
		setting	= JSON.parse(localStorage.getItem('setting_bot_lobby')) || {},
		input	= document.createElement('input');

	input.addEventListener('change', function(){
		setting[element.querySelector('.admin').textContent] = this.checked;
		localStorage.setItem('setting_bot_lobby', JSON.stringify(setting));
	});
	input.className = 'input_bot_check';
	input.type="checkbox";
	if (setting[element.querySelector('.admin').textContent]){
		input.checked = true;
	}
	element.insertBefore(input, element.firstChild);
}



/*
 * Функция добавления в "логи"
 *
 * @param {String} текст сообщения
 * @param {String} class, необязательный параметр
 */
function AddTable(e,c){
	var d = new Date();
	var t = addZero(d.getHours())+':'+addZero(d.getMinutes())+':'+addZero(d.getSeconds());
	document.getElementById('event_table').insertAdjacentHTML('afterbegin',
		'<tr><td>'+t+'</td><td class="'+(c||'')+'">'+e+'</td></tr>');
}
function AddMessTable(f,s,callback){
	document.getElementById('log_table_1').innerHTML = f;
	document.getElementById('log_table_2').innerHTML = s;
	if(callback)callback();
}


/*
 *
 * Функция извлечения времени из строки
 *
 * @param {String} t - время со страницы формата "39 ч 59 мин"
 * @returns {Array} [days, hours, minutes, seconds]
 *
 */
function getTime(t) {
	var d = 0, h = 0, m = 0, s = 0,
		parsetime = t.split(/\s/);
	if (parsetime[1] == 'д') {
		d = Math.round(parsetime[0]);
		h = Math.round(parsetime[2]);
	}
	if (parsetime[1] == 'ч') {
		h = Math.round(parsetime[0]);
		m = Math.round(parsetime[2]);
	}
	if (parsetime[1] == 'м') {
		m = Math.round(parsetime[0]);
		s = Math.round(parsetime[2]);
	}
	if (parsetime[1] == 'сек') {
		s = Math.round(parsetime[0]);
	}
	return [d, h, m, s];
}
/*
 *
 * Функция получения секунд из массива времени getTime()
 *
 * @param {Array} [days, hours, minutes, seconds]
 * @returns {Number} seconds
 *
*/
function getSecond(t) {
	return (((parseInt(t[0])*24+parseInt(t[1]))*60)+parseInt(t[2]))*60+parseInt(t[3]);
}

function firstMess(e) {
	if( e != "granted" ) return false;
	new Notification("Уведомления и таймер включены.", {
		tag : DOMAIN_NAME,
		body : "Перезагрузите страницу!",
		icon : "http://static."+DOMAIN_NAME+"/images/icons/home.png"
	});
}
/*
 *
 * Функция добавления ведущео нуля у элемента времени,
 * если требуется
 *
 * @param {Number}
 * @returns {Number}
 *
*/
function addZero(int_) {
	if ((int_+"").length == 1){
		int_ = "0"+int_;
	}
	return int_;
}

/**
 * Функция создания таймера на месте времени,
 * с последующим уведомлением
 *
 * @param {String} time - время
 * @param {String} id - элемент
 * @param {String} notice - текст уведомления
 * @param {Function} callback функция, необязательный параметр
 *
 */
function timer(time, id, notice, callback) {
	var seconds_left = getSecond(time);
	var int_ = setInterval(function () {
		var seconds_left_d, seconds_left_h,
			days, hours, minutes, seconds, tpmcl, notifyD = {};
		seconds_left--;
        days = parseInt(seconds_left / 86400);
        seconds_left_d = seconds_left % 86400;
        hours = parseInt(seconds_left_d / 3600);
        seconds_left_h = seconds_left % 3600;
        minutes = parseInt(seconds_left_h / 60);
        seconds = parseInt(seconds_left % 60);
        id.innerHTML = (days == 0 ? '' : (days + " д, ")) + addZero(hours) + ":"
                     + addZero(minutes) + ":" + addZero(seconds);
        if(days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0){
			clearInterval(int_);
			if(callback)callback();
			if (notice) {
				tpmcl = id.closest('.flbdy') || false;
				if(tpmcl){
					notifyD.name = tpmcl.parentNode.querySelector('.flhdr > span').innerText.trim();
					notifyD.body = tpmcl.querySelector('.state').innerText.trim();
					notifyD.icon = tpmcl.querySelector('img').src;
				} else if (id.closest('.flr.small.amount')) {
					notifyD.name = id.parentNode.parentNode.querySelector('.lift .ctrl').innerText.trim();
					notifyD.body = id.parentNode.parentNode.querySelector('.lift .nshd').innerText.trim();
					notifyD.icon = id.parentNode.parentNode.querySelector('.lift img').src;
				} else {
					notifyD.name = 'Неизвестный таймер';
					notifyD.body = 'Какой-то таймер завершился';
					notifyD.icon = 'http://igrotop.mobi/images/game7.png';
				}
				new Notification(notifyD.name, {
					tag : DOMAIN_NAME,
					body : notifyD.body,
					icon : notifyD.icon
				});
			}
        }
    }, 1000);
}



/**
 * Проверка на менеджера
 *
 * @param {Function} callback
 *
 * @returns true or false
*/
function checkingManager(callback) {
	var els = document.querySelectorAll('.tdn .buff'),
		l = els.length,
		chM;
    for (var i = 0; i < l; i++) {
		if(/Менеджер*/.exec(els[i].innerText)){
			chM = els[i].querySelector('span').innerText;
			AddMessTable(
				'Работает менеджер', chM,
				function(){
					timer(
						getTime(chM.trim()),
						document.getElementById('log_table_2'),
						false,
						callback
					);
				}
			);
			return true;
		}
	}
	return false;
}

/**
 * Открывание дверей
 *
 * @param {string} url открытия дври
 * @param {Function} doors_open порядковый номер двери от 0 до 2
 *
 */
function doors(url,doors_open){

	if(localStorage.doors_key == undefined || localStorage.doors_key < 1){
		AddTable('Нечем открывать двери');
		return false;
	}

	AddMessTable('Лабиринт запущен', '<img alt="" src="/images/icons/key.png" width="16" height="16"> ' + localStorage.doors_key || 0);

	setTimeout(function(){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url || DOMAIN + 'doors', true);
		// Раскомментировать строчку, если разрешены рефералы в браузере,
		// немного повышает защиту бота
		// xhr.setRequestHeader('Referer', DOMAIN + 'doors');
		xhr.onload = function() {
			var parser = new DOMParser(),
				doc = parser.parseFromString(xhr.responseText, "text/html"),
				doorsLinks = doc.querySelectorAll('[href*=":doorLink"]'),
				ttime;

				localStorage.doors_key -= 1;
				AddMessTable('Лабиринт запущен', '<img alt="" src="/images/icons/key.png" width="16" height="16">' + localStorage.doors_key || 0);

				console.log(doc.querySelector('.m5.cntr'));

				let html = doc.querySelector('.m5.cntr');
				if(doors_open){
					AddTable('Открыта '+ (doors_open+1)  +' дверь');
				}
				if(html.querySelector('.doorSel')){
					html.querySelector('.doorSel').style.backgroundColor = '#4BF';
				}
				html.querySelectorAll('span.amount:first-child,.hint,.minor.small, .hr').forEach(e => e.remove());
				AddTable(html.innerHTML);

			if (doorsLinks && doorsLinks.length === 3) {
				let rand_door = Math.floor(Math.random() * (3 - 1 + 1));
				doors(doorsLinks[rand_door].href, rand_door);
			} else {
				setTimeout(function(){
					AddMessTable('Надо больше ключей!','');
					doors();
				}, 5000);
			}
		};
		xhr.onerror = function() {
			debuglog(xhr);
			AddTable('Дверь оказалась без замка. Надо вызывать медвежатника!');
			AddMessTable('Ошибка! Перезапуск через','',function(){
				timer([0, 0, 0, 10], document.getElementById('log_table_2'), false);
			});
			setTimeout(function(){
				doors();
			}, 10000);
		};
		xhr.send();
	}, rand_time(5,7));
}


/**
 *
 * Выбор в объекте максимального или минимально значения (value)
 *
 * @param {*} object
 * @returns key object
 *
 */
const max = object=>Object.keys(object).reduce((key, v) => object[v] < object[key] ? v : key);
const min = object=>Object.keys(object).reduce((key, v) => object[v] < object[key] ? v : key);


/**
 * Обёртка fetch Promise, делает запрос к странице и возвращает карточку(и)
 *
 * @param {*} url - адрес страницы
 * @param {*} returnBlock - класс блока карточки(ек), который надо вернуть
 * @param {*} single - выборка массива карточкек (по умолчанию) или одну карточку
 *
 * @returns Promise documents node
 *
 */
function fetch_promise(url,returnBlock,single = false) {
	return new Promise((resolve, reject) => {
		// url = url.replace(/https?:\/\/nebo.mobi\//,'');
		fetch(DOMAIN+url)
			.then(response => {
				return response.text();
			})
			.then(text => {
				var parser = new DOMParser();
				var document_ = parser.parseFromString(text, "text/html");
				resolve( single ? document_.querySelector(returnBlock) : document_.querySelectorAll(returnBlock) );
			}).catch(err=>{
				reject(err)
			});
	})
}


// function replaceCard(original,new_) {

// }

var Datenow = () => parseInt(Date.now()/1000);

/**
 * Ферма
 */
const TIMERS = {
	'fabric/floor/0/1' : Datenow() + 1,
	'fabric/floor/0/2' : Datenow() + 2,
	'fabric/floor/0/3' : Datenow() + 3,
	'fabric/floor/0/4' : Datenow() + 4,
	'fabric/floor/0/5' : Datenow() + 5
};

// parseInt(Date.now() / 1000) - 715
function fabric(url){
		url = url || min(TIMERS);
		console.log(TIMERS, url, TIMERS[url]);
		setTimeout(function(){
			// ('.fd, .sr, .rc, .fs, .el')
			// Добавить в очередь
			// ?wicket:interface=:[0-9]{5}:product1:startContainer:startLink::ILinkListener::
			// Забрать
			// ?wicket:interface=:[0-9]{5}:product1:collectContainer:collectLink::ILinkListener::"
			fetch_promise(url,'.flbdy.snow3_.gift_', true)
				.then(block=>{
					let link = block.querySelector('.tdu') && block.querySelector('.tdu').getAttribute('href');
					let time = block.querySelector('[id*="time_"]');

					// findFloor
					var floor = url.match(/fabric\/floor\/0\/([0-9])/);
					if(floor){
						floor = floor[1];
					}else{
						let img = block.querySelector('.flogo');
						if(img){
							img = img.src.match(/september2024\/(?:ready|time)([0-9])\.(?:gif|png)/);
							if(img && img[1]){
								floor = img[1];
							}
						}
					}
					if(floor){
						let el = document.querySelectorAll('.fd > .flbdy, .sr > .flbdy, .rc > .flbdy, .fs > .flbdy, .el > .flbdy')[floor-1]
						el.innerHTML = block.innerHTML;
						let time = el.querySelector('[id^=time]');
						if(time){
							time.title = time.innerHTML;
							timer(getTime(time.innerHTML), time,true);
						}
					}

					AddTable(block.innerHTML);

					if (link && /startContainer/.test(link)) {
						console.log(1);
						fabric(link);
					} else if (link && /collectContainer/.test(link)) {
						console.log(2);
						fabric(link);
						document.querySelector('.fabricBot').textContent = parseInt(document.querySelector('.fabricBot').textContent)+1;
					} else if (time){
						console.log(3);
						TIMERS['fabric/floor/0/'+floor] = Datenow() + getSecond(getTime(time.textContent));
						fabric();
					} else {
						console.log(4);
						TIMERS['fabric/floor/0/'+floor] = 3;
						fabric();
					}
				})
				.catch(err=>{
					AddTable('Что-то сломалось! Будем пробовать ещё раз!');
					setTimeout(() => {
						fabric(url);
					}, 3000);
					console.log(err);
				})
		},  ( TIMERS[url] - Datenow() ) * 1000);
		console.log(TIMERS);
	//}
}


/*
 * Если скрипт не запускается, то необходимо
 * раскомментировать (удалить в начале строки //)
 * и закомментировать (добавить в начале строки // или удалить строку)
 * строки ниже и в самом конце файла.
*/
//document.addEventListener("DOMContentLoaded", function(){	// Раскомментировать 1 из 2
window.onload = function() {								// Закомментировать  1 из 2

	/* Создаём таблицу логов */
	document.body.insertAdjacentHTML('beforeend',
									  '<style>'
										+'#event_table td > img {float:left}'
										+'.bot_table{left:10px;position:fixed;width:calc(50% - 320px)}'
										+'#log_table{top:0;}'
										+'#event_table{top:28px;}'
										+'#event_table td > .ctrl {display:block}'
										+'#event_table td{border-bottom: 1px dotted #275587}'
										+'.input_bot_quests,.easy_money{float: right;width:2em;text-align:center;margin-left:-2em;}'
										+'.input_bot_quests[value="0"]{color: red;font-weight: 800;}'
										+'.easy_money{float:left;margin: 3px -2em 3px 0}'
										+'.input_bot_check{float:left;margin-right:-100%;}'
									 +'</style>'
									 +'<table id="log_table" class="hdr bot_table"><tr><td id="log_table_1">&nbsp;</td>'
									 +'<td id="log_table_2" style="text-align:right;" class="amount">&nbsp;</td></tr></table>'
									 +'<table id="event_table" class="bot_table"><tr><td colspan="2" class="amount" style="text-align: center;">'
									 + "Лучше поздно, чем никогда! ДОБАВЛЕНА ФЕРМА! Некоторые могут успеть воспользоваться на этих выходных в последние дни. Переходите на страницу <a href='/fabric' title='Ферма' target='_blank'>Фермы</a> и наблюдайте за процессом производства и сбора в новом интерактивном формате. Это задел на будущее улучшение бота, который будет ещё больше интегрирован в игру."
									 + '</td></tr><tr><td colspan="2" style="text-align: center;">'
									 + "УРА! Вышла новая версия года в честь десятилетия бота!<br>"
									 + "По просьбе трудящихся было добавлено прохождение ЛАБИРИНТА!"
									 + '</td></tr><tr><td colspan="2">'
									 + "<small>Спасибо что воспользовались ботом для игры в Небоскрёбы! "
									 + "Если у вас есть вопросы или пожелания, вы можете их оставить на "
									 + "<a href='http://blog.g63.ru/?p=1903' target='_blank'>странице проекта</a></small>"
									 + '</td></tr></table>');

	AddMessTable('Небобот запущен', BOT.version);



	if (/\/lift/.exec(window.location.pathname)) {
		liftFN();
		AddTable('Лифтёр скоро приступит к работе.','rc');
	} else if (/\/humans/.exec(window.location.pathname)) {
		humansFN();
		AddTable('Скоро начнётся выселение.','rc');
	} else if (/\/quests/.exec(window.location.pathname)) {
		quests();
		AddTable('Задания скоро начнут собираться.','rc');
	} else if (/\/city\/quests*/.exec(window.location.pathname)) {
		questsCity();
		questsCitySelect();
		AddTable('Задания города скоро начнут собираться.','rc');
	} else if (/\/floors\/0\/2/.exec(window.location.pathname)) {
		if(!checkingManager(productBuy)){
			productBuy();
		}
		AddTable('Закупки скоро начнутся.','rc');
	} else if (/\/floors\/0\/3/.exec(window.location.pathname)) {
		if(!checkingManager(collectRevenue)){
			collectRevenue();
		}
		AddTable('Раскладывание товара уже скоро.','rc');
	} else if (/\/floors\/0\/5/.exec(window.location.pathname)) {
		if(!checkingManager(putProduct)){
			putProduct();
		}
		AddTable('Сбор выручки скоро начнётся.','rc');
	} else if (/\/boss*/.exec(window.location.pathname)) {
		boss();
		AddTable('Ожидаем инвесторов.','rc');
	} else if (/\/lobby/.exec(window.location.pathname)) {
		lobbySelect();
		lobby();
		AddTable('Ждём задания в вестибюле.','rc');
	} else if (/\/doors/.exec(window.location.pathname)) {
		document.querySelector('#log_table tr').insertAdjacentHTML('afterend','<tr><td>Сколько ключей потратить?</td><td style="text-align:right;"><input value="" size="3" class="Doors_Keys_Input"> <span class="btn DoorsRun" style="cursor:pointer">GO</span></td></tr>');
		document.querySelector('#event_table').style.top = '62px';
		document.querySelector('.DoorsRun').addEventListener('click', ()=>{
			localStorage.doors_key = document.querySelector('.Doors_Keys_Input').value || 0;
			doors();
		})
		AddTable('Запустите прохождение дверей вручную','rc');
		doors();
	} else if (/\/fabric/.exec(window.location.pathname)) {
		fabric();
		AddTable('Агрофитнес начинаем! Раз, два!','rc');
		document.querySelector('.cntr.nshd.m5.white').insertAdjacentHTML('beforeend',' <span class="amount"> Собрано: <b class="fabricBot">0</b></span>');
	} else {
		AddTable(`Бот автоматически запускается на страницах:<br>
			<a href="/lift" title="Лифт" target="_blank">Лифт</a><br>
			<a href="/floors/0/5" title="Сбор выручки" target="_blank">Сбор выручки</a><br>
			<a href="/floors/0/2" title="Закупка товара" target="_blank">Закупка товара</a><br>
			<a href="/floors/0/3" title="Выложить товар" target="_blank">Выложить товар</a><br>
			<a href="/humans" title="Мои жители" target="_blank">Мои жители</a><br>
			<a href="/city/quests" title="Задания города" target="_blank">Задания города</a><br>
			<a href="/quests" title="Задания" target="_blank">Задания</a><br>
			<a href="/lobby" title="Вестибюль" target="_blank">Вестибюль</a><br>
			<a href="/boss" title="Босс" target="_blank">Босс</a><br>
			<a href="/doors" title="Лабиринт" target="_blank">Лабиринт</a><br>
			Для работы бота эти страницы должны быть постоянно открыты`,'rc');
	}

	/* Таймеры */
    var time = document.querySelectorAll('[id^=time]');
    var tl = time.length;
    for (var i = 0; i < tl; i++) {
        time[i].title = time[i].innerHTML;
        timer(getTime(time[i].innerHTML), time[i],true);
    }
    switch ( Notification.permission.toLowerCase() ) {
        case "granted" : break;
        case "denied" :
            document.body.insertAdjacentHTML('beforeend','<span style="position:fixed;top:5px;right:10px;">У вас запрещены уведомления!</span>');
            break;
        case "default" :
            document.body.insertAdjacentHTML('beforeend','<a onclick="Notification.requestPermission(firstMess)" style="position:fixed;top:5px;right:10px;cursor:pointer;"><img src="http://static.'+DOMAIN_NAME+'/images/icons/letters.png" alt="Включить уведомления"> Включить уведомления</a>');
            break;
	}

	/* Очищаем раз в час */
	setInterval(function() {
		if(document.querySelectorAll('#event_table tr td')[1].className !== 'clear_log'){
			var els	= document.querySelectorAll('#event_table tr'),
				ell	= els.length,
				lt	= document.getElementById('event_table');
				lt.innerHTML = '';
			for (var i = 0; i < ell; i++) {
				lt.insertAdjacentHTML("beforeEnd",els[i].innerHTML);
				if (i > 3) {
					break;
				}
			}
			if(ell > 4){
				AddTable('Логи очищены!','clear_log');
			}
		}
		console.clear();
	}, 3600000);
};		// Закомментировать  2 из 2
//});	// Раскомментировать 2 из 2