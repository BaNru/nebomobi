// ==UserScript==
// @name        Небоскреб
// @namespace   Игры
// @version     1.9.6.2
// @description Бот для игры Небоскребы
// @match       https://nebo.mobi/*
// @icon        https://nebo.mobi/images/icons/home.png
// @copyright   BaNru (2014-2025)
// @author      BaNru
// @tag         game bot
// ==/UserScript==

var BOT = {};
BOT.version = '1.9.6.2';
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
 * @param {string} time - вреия ожидания перед действием
 * @param {string} ref - реферал, если разрешено в браузере
 * @param {function} callback function, необязательный параметр
 *
 * TODO переписать функцию: заменить аргументы на объект и добавить передачу CLASS в AddTable
 *
 */
function end_xhr(url, text, time, ref, callback) {
	setTimeout(function(){
		let xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		// Раскомментировать строчку, если разрешены рефералы в браузере,
		// немного повышает защиту бота
		// xhr2.setRequestHeader('Referer', ref);
		xhr.onload = function() {
			AddTable(text);
			debuglog(url, xhr.responseURL);
			let parser = new DOMParser();
			let document_ = parser.parseFromString(xhr.response, "text/html");
			updateBlocks(document_);
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
		fetch_promise('lift','.lift', true)
			.then(([lift,doc])=>{
				let el = document.querySelector('div.vs .flbdy');
				lift.appendChild(lift.querySelector(".clb"));

				if (lift && lift.getElementsByClassName('tdu')[0]) {
					end_xhr(
						lift.getElementsByClassName('tdu')[0].href || DOMAIN + lift.getElementsByClassName('tdu')[0].getAttribute('href'),
						lift.innerHTML.replace('<div class="clb"></div>',''),
						rand_time(1,3),
						DOMAIN + 'lift',
						liftFN
					);
					el.innerHTML = '<div class="lift">' + lift.innerHTML + '</div>';
					if(!lift.querySelector('.lift .white').classList.contains('nwr')){
						document.querySelector('.vs .rs.small').textContent = Number(document.querySelector('.vs .rs.small').textContent) + 1;
					}
				} else {
					let ttime = 3;
					AddTable(lift.innerHTML.replace('<div class="clb"></div>',''));
					let time = doc.querySelector('[id^=time]'),
						el = document.querySelector('div.vs .flbdy');
					if(time){
						ttime = getSecond(getTime(time.innerHTML));
						time.title = time.innerHTML;
						time.className = "minor small flr";
						lift.querySelector('.flr').parentNode.replaceChild(time,lift.querySelector('.flr'));
						AddMessTable('Ждем посетителя!','',function(){
							timer(ttime, document.getElementById('log_table_2'), false);
						});
					}
					if(el){
						el.innerHTML = '<div class="lift">' + lift.innerHTML.replace() + '</div>';
						if(time && lift.querySelector('.flr')){
							timer(ttime, el.querySelector('[id^=time]'), false);
						}
					}
					setTimeout(function(){
						AddMessTable('Развозим дальше','');
						liftFN();
					}, ttime*1000);
				}
			})
			.catch(err=>{
				debuglog(err);
				console.error(err);
				AddTable('Лифт сломался, но не отчаивайся - мастера уже на месте!');
				AddMessTable('Ошибка! Перезапуск через','',function(){
					timer([0, 0, 0, 10], document.getElementById('log_table_2'), false);
				});
				setTimeout(function(){
					liftFN();
				}, 10000);
			})
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



/**
 * Функция добавления в "логи" форматированного текста
 *
 * @param {String} text - текст сообщения
 * @param {String} className необязательный параметр
 */
function AddTable(text, className = '') {
	var d = new Date();
	var t = addZero(d.getHours())+':'+addZero(d.getMinutes())+':'+addZero(d.getSeconds());
	document.querySelector('#event_table tbody').insertAdjacentHTML('afterbegin',
		'<tr><td>' + t + '</td><td class="' + className + '">' + text +'</td></tr>');
	document.querySelectorAll('#event_table tr:nth-child(n+10)').forEach(item=>{item.remove()})
}
/**
 * Функция добавления в таблицу Логов
 *
 * @param {String} firstText текст сообщения
 * @param {String} secondText,текст сообщения
 * @param {function} callback function, необязательный параметр
 *
 */
function AddMessTable(firstText, secondText, callback) {
	document.getElementById('log_table_1').innerHTML = firstText;
	document.getElementById('log_table_2').innerHTML = secondText;
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
 * @param {Array<4>|String|Number} time - время. На входе возможны массив [0,0,0,0], string время в формате игры "29 м 59 сек"
 * @param {String} id - элемент
 * @param {String} notice - текст уведомления
 * @param {Function} callback функция, необязательный параметр
 *
 */
function timer(time, id, notice, callback) {
	// Проверяем и преобразуем формат фремени
	if(Array.isArray(time) && time.length == 4){
		time = getSecond(time);
	} else if (typeof time === 'string'){
		getSecond(getTime(time));
	} else {
		time = Number(time) || 1;
	}
	var int_ = setInterval(function () {
		var seconds_left_d, seconds_left_h,
			days, hours, minutes, seconds, tpmcl, notifyD = {};
		time--;
        days = parseInt(time / 86400);
        seconds_left_d = time % 86400;
        hours = parseInt(seconds_left_d / 3600);
        seconds_left_h = time % 3600;
        minutes = parseInt(seconds_left_h / 60);
        seconds = parseInt(time % 60);
        id.innerHTML = (days == 0 ? '' : (days + " д, ")) + addZero(hours) + ":"
                     + addZero(minutes) + ":" + addZero(seconds);
        if(days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0){
			clearInterval(int_);
			if(callback)callback();
			if (notice) {
				tpmcl = id.closest('.flbdy') || false;
				if(tpmcl){
					notifyD.name = tpmcl?.parentNode.querySelector('.flhdr > span')?.innerText.trim();
					notifyD.body = tpmcl?.querySelector('.state')?.innerText.trim();
					notifyD.icon = tpmcl?.querySelector('img')?.src;
				} else if (id.closest('.flr.small.amount')) {
					notifyD.name = id?.parentNode?.parentNode?.querySelector('.lift .ctrl')?.innerText.trim();
					notifyD.body = id?.parentNode?.parentNode?.querySelector('.lift .nshd')?.innerText.trim();
					notifyD.icon = id?.parentNode?.parentNode?.querySelector('.lift img')?.src;
				}
				notifyD.name = notifyD.name || 'Неизвестный таймер';
				notifyD.body = notifyD.body || 'Какой-то таймер завершился';
				notifyD.icon = notifyD.icon || 'http://igrotop.mobi/images/game7.png';
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
			timer(
				getTime(chM.trim()),
				els[i].querySelector('span'),
				'Менеджер закончил свою работу!'
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
 * @param {*} returnBlock - класс блока(ов), который надо вернуть
 * @param {*} single - выборка массива блоков (по умолчанию) или один блок
 *
 * @returns Promise arrays documents select node and document
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
				updateBlocks(document_);
				resolve( [single ? document_.querySelector(returnBlock) : document_.querySelectorAll(returnBlock), document_] );
			}).catch(err=>{
				console.error('Ошибка', err);
				reject(err)
			});
	})
}


// Обновление строки с деньгами
function updateBlocks(doc) {
	// Обновление блока с деньгами
	let cash = doc.querySelector('.cash');
	cash?.querySelector('script')?.remove()
	document.querySelector('.cash').innerHTML = cash.innerHTML;

	// Обновление блоков с заданиями
	let notify = doc.querySelectorAll('.nfl .prgbr');
	notify.forEach((element, index) => {
		let notify_new = document.querySelectorAll('.nfl .prgbr')[index];
		if (notify_new) {
			notify_new.closest('.nfl').innerHTML = element.closest('.nfl').innerHTML;
		} else if (document.querySelector('.main > .hr')){
			document.querySelector('.main > .hr').insertAdjacentHTML('afterend', element.closest('.nfl').outerHTML);
		}
	})

	// Обновление ключей
	let curDoors = doc.querySelector('a.link.tdn[href="doors"]');
	let doors_page = document.querySelector('a.link.tdn[href="doors"]');
	if (curDoors && doors_page){
		doors_page.innerHTML = curDoors.innerHTML;
	}
}


/**
 * Функция квесты (заданий-событий)
 */
function quests_events() {
	// Список страниц для срабатывания
	var URLS_EVENTS = [
		'timebox' // Контракты, событие с 20 по 26 января
	]
	if (new RegExp(URLS_EVENTS.join('|')).exec(window.location.pathname)) {
		fetch_promise(window.location.pathname, 'a.btng[href*="getQuest"],.nfl a.btng', true)
			.then(([block, doc]) => {
				if (block) {
					end_xhr(
						block.href,
						block.textContent,
						rand_time(),
						block.href,
						quests_events
					)
				} else {
					if (doc.querySelector('.cntr.minor.small [id*="time_"]')) {
						let t = getTime(doc.querySelector('.cntr.minor.small [id*="time_"]').textContent);
						setTimeout(() => {
							AddMessTable(
								'Ждём задание',
								'',
								() => {
									timer(
										t,
										document.getElementById('log_table_2'),
										false,
										quests_events
									);
								}
							);
						}, t);
					} else {
						setTimeout(() => {
							quests_events();
						}, 3 * 60 * 1000); // Проверяем раз в 3 мин
					}
				}
			})
			.catch(err => {
				AddTable('Что-то сломалось! Будем пробовать ещё раз!');
				setTimeout(() => {
					quests_events();
				}, 3000);
				console.error(err);
			})
	}
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
	setTimeout(function(){
		// ('.fd, .sr, .rc, .fs, .el')
		// Добавить в очередь
		// ?wicket:interface=:[0-9]{5}:product1:startContainer:startLink::ILinkListener::
		// Забрать
		// ?wicket:interface=:[0-9]{5}:product1:collectContainer:collectLink::ILinkListener::"
		fetch_promise(url,'.flbdy.snow3_.gift_', true)
			.then(([block, doc]) =>{
				if (!block) {
					setTimeout(() => {
						fabric();
					}, rand_time());
					return false;
				}

				// findFloor
				var floor = url.match(/fabric\/floor\/0\/([0-9])/);
				if(floor){
					floor = floor[1];
				}else{
					let img = block.querySelector('.flogo');
					if(img){
						img = img.src.match(/([0-9])\.(?:gif|png)/);
						if(img && img[1]){
							floor = img[1];
						}
					}
				}
				let time = block.querySelector('[id*="time_"]');
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
				let link = block.querySelector('.tdu')?.getAttribute('href');
				if (link && /startContainer/.test(link)) {
					fabric(link);
				} else if (link && /collectContainer/.test(link)) {
					fabric(link);
					document.querySelector('.fabricBot').textContent = parseInt(document.querySelector('.fabricBot').textContent)+1;
				} else if (time && floor) {
					TIMERS['fabric/floor/0/' + floor] = Datenow() + getSecond(getTime(time.textContent));
					fabric();
				} else if (floor) {
					TIMERS['fabric/floor/0/' + floor] = 3;
					fabric();
				} else {
					AddTable('Ошибка. Пробуем ещё раз!!');
					setTimeout(() => {
						fabric();
					}, 3000);
				}

				// Обновляем количество билетов
				if(doc.querySelector('.snow3_ img[src*="ticket"] + span')){
					document.querySelector('.snow3_ img[src*="ticket"] + span').textContent = parseInt(doc.querySelector('.snow3_ img[src*="ticket"] + span').textContent);
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
									  `<style>
										#event_table td > img {float:left}
										.bot_table{left:10px;position:fixed;width:calc(50% - 320px)}
										#log_table{top:0;}
										#event_table{top:28px;}
										#event_table td > .ctrl {display:block}
										#event_table td{border-bottom: 1px dotted #275587}
										.input_bot_quests,.easy_money{float: right;width:2em;text-align:center;margin-left:-2em;}
										.input_bot_quests[value="0"]{color: red;font-weight: 800;}
										.easy_money{float:left;margin: 3px -2em 3px 0}
										.input_bot_check{float:left;margin-right:-100%;}
										.tabs li {
											display:inline-block;
										}
										[data-hover]{
											position: relative;
											cursor:pointer;
										}
										[data-hover]:hover:before {
											content:attr(data-hover);
											position: absolute;
											bottom:-100%;
											background-color:#444;
											color:#f0f0f0;
											padding: 2px 5px;
										}
									</style>
									<table id="log_table" class="hdr bot_table"><tbody>
											<tr>
												<td id="log_table_1">&nbsp;</td>
												<td id="log_table_2" style="text-align:right;" class="amount">&nbsp;</td>
											</tr>
									</tbody></table>
									<table id="event_table" class="bot_table"><tbody>
										<tr><td colspan="2" class="amount" style="text-align: left;">
											Новогоднее обновление:<br>
											- Лифтёр работает теперь на главной.:<br>
											- На главной теперь обновляются денежки и задания.
										</td></tr>
										<tr><td colspan="2">
											<small>Спасибо что воспользовались ботом для игры в Небоскрёбы!
											Если у вас есть вопросы или пожелания, вы можете их оставить на
											<a href='http://blog.g63.ru/?p=1903' target='_blank'>странице проекта</a></small>
										</td></tr>
									</tbody></table>
									`);

	AddMessTable('Небобот запущен', BOT.version);



	if (/\/home/.exec(window.location.pathname)) {
		document.querySelector('.main').insertAdjacentHTML('afterbegin',`
		<div class="nshd nfl ny">
			<!-- <ul class="tabs">
				<li data-hover="Жители"><img alt="Жители" src="/images/icons/man.png" width="16" height="16"></li>
				<li data-hover="Лифт"><img alt="Лифт" src="/images/icons/tb_lift.png" width="16" height="16"></li>
			</ul>-->
			<table id="event_table" class="bot_table" style="left: auto;right: 0;"><tbody>

			</tbody></table>
		</div>
		`);
		checkingManager();
		liftFN();
		document.querySelector('.vs .rs.small').textContent = 0;
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
		AddTable('Автоматизация началась!','rc');
		document.querySelector('.cntr.nshd.m5.white').insertAdjacentHTML('beforeend',' <span class="amount"> Собрано: <b class="fabricBot">0</b></span>');
	// Кнопка "Обучить всех на данной странице" в Жителях Специалистах
	} else if (document?.title == 'Мои жители' && document.querySelector('[href*="humanPanel:upgradeLinkPanel"]')) {
		document.querySelector('table.rtgh').insertAdjacentHTML('beforebegin', '<a class="nfl upgradeAllHuman" style="display: block;cursor: pointer;">Обучить всех на данной странице</a>');
		document.querySelector('.upgradeAllHuman').addEventListener('click', async (btn) => {
			let timerHuman = 1;
			const items = Array.from(document.querySelectorAll('[href*="humanPanel:upgradeLinkPanel"]'));
			btn.target.textContent = 'Идёт обучение 0 их ' + items.length;
			btn.target.style.cursor = "wait";
			let shouldStop = false;
			for (const item of items) {
				if (shouldStop) break; // Останавливаем, если были проблемы
				await new Promise(resolve => setTimeout(
					resolve,
					timerHuman += rand_time(1,2)
				)).then(async () => {
					const response = await fetch(item.href);
					if (/\/home/.exec(response.url)) {
						item.innerHTML = '<i style="color:#d66">✘</i> Не обучили. Обновите страницу и повторите!';
						btn.target.style.background = '#b22';
						btn.target.textContent = 'Обновите страницу и перезапустите обучение';
						btn.target.style.cursor = "";
						btn.target.href = '/humans';
						shouldStop = true; // Остановка при ошибке
						return;
					} else {
						item.removeAttribute('href');
						item.style.textDecoration = 'none!important';
						item.innerHTML = '<b style="color:#0f0">✓</b> Успешно обучили';
						btn.target.textContent = 'Идёт обучение ' + (items.length - document.querySelectorAll('[href*="humanPanel:upgradeLinkPanel"]').length) + ' их ' + items.length;
					}
					// Дополнительное условие
					// if(){shouldStop = true;}
				});
			}
			if (!shouldStop) {
				btn.target.textContent = 'Обучение ' + items.length + ' жителей завершено!';
				btn.target.style.background = '#061';
			}
		}, { once: true })
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

	// Заданий-событий
	quests_events();

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