// ==UserScript==
// @name        Небоскреб
// @namespace   Игры
// @include     http://nebo.mobi/*
// @version     1.05
// @description Бот для игры Небоскребы
// @match       http://nebo.mobi/*
// @copyright   BaNru (2014-2016)
// @author   	BaNru
// ==/UserScript==

var BOT = {};
BOT.version = '1.05';

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
 * url - страница действия
 * text - сообщение для вывода на экран
 * time - вреия ожидания перед действие
 * ref - реферал, если разрешено в браузере
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
 * min и max задавать в секундах
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
		xhr.open('GET', 'http://nebo.mobi/lift', true);
		// Раскомментировать строчку, если разрешены рефералы в браузере,
		// немного повышает защиту бота
		// xhr.setRequestHeader('Referer', 'http://nebo.mobi/lift');
		xhr.onload = function() {
			var parser = new DOMParser(),
				doc = parser.parseFromString(xhr.responseText, "text/html"),
				lift = doc.getElementsByClassName('lift')[0],
				ttime;
			if (lift && lift.getElementsByClassName('tdu')[0]) {
				end_xhr(
					lift.getElementsByClassName('tdu')[0].href ||
					'http://nebo.mobi/'+lift.getElementsByClassName('tdu')[0].getAttribute('href'),
					lift.innerHTML.replace('<div class="clb"></div>',''),
					rand_time(1,3),
					'http://nebo.mobi/lift',
					liftFN
				);
			} else {
				ttime = getTime(doc.querySelector('[id^=time]').innerHTML);
				AddTable(lift.innerHTML.replace('<div class="clb"></div>',''));
				AddMessTable('Ждем посетителя!','',
							function(){timer(ttime, document.getElementById('log_table_2'), false)});
				setTimeout(function(){
					AddMessTable('Развозим дальше','');
					liftFN();
				}, getSecond(ttime)*1000);
			}
		};
		xhr.onerror = function() {
			debuglog(xhr);
			AddTable('Лифт сломался, но не отчаивайся - мастера уже на месте!');
			AddMessTable('Ошибка! Перезапуск через','',function(){timer([0, 0, 0, 10], document.getElementById('log_table_2'), false)});
			setTimeout(function(){
				liftFN();
			}, 10000);
		};
		xhr.send();
	}, rand_time(3,6));
}



/* Закупаем товар */
if (/nebo.mobi\/floors\/0\/2/.exec(window.location)) {
	setInterval(function() {

		var xhr = new XMLHttpRequest();
	    xhr.open('GET', 'http://nebo.mobi/floors/0/2', true);
		// Раскомментировать строчку, если разрешены рефералы в браузере,
		// немного повышает защиту бота
		// xhr.setRequestHeader('Referer', 'http://nebo.mobi/floors/0/2');

		xhr.onload = function() {
			var parser = new DOMParser();
			var doc = parser.parseFromString(xhr.responseText, "text/html");
			var tower = doc.getElementsByClassName('tower')[0];
			var links = tower.getElementsByClassName('tdu');
			var l = links.length;
			var i = 0, golink = "";
			var interval = setInterval(function(){
				if (links[i]) {
					golink = links[i].href || 'http://nebo.mobi/'+links[i].getAttribute('href');
					if (/nebo\.mobi\/(?:\.\.\/)*floor\//.exec(golink)) {
						var xhr2 = new XMLHttpRequest();
						xhr2.open('GET', golink, true);
						// xhr2.setRequestHeader('Referer', 'http://nebo.mobi/floors/0/2');
						xhr2.onload = function() {
							productAction(xhr2.responseText, xhr2.responseURL)
						};
						xhr2.onerror = function() {
							debuglog(xhr2);
						};
						xhr2.send();
					};
				}
				i++;
				if (i == l){
					clearInterval(interval);
				}
			}, 3000);
		};
		xhr.onerror = function() {
			debuglog(xhr);
		};
		xhr.send();

	}, 30000);
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
			golink = links[i].href || 'http://nebo.mobi/'+links[i].getAttribute('href');
			if (/wicket:interface=:\d+:floorPanel:product[A-Z]:emptyState:action:link::ILinkListener::/.exec(golink)) {
				// TODO Сделать вывод закупаемого товара
				// Сейчас выводится первый, если в магазине 1 товар на закупку
				end_xhr(golink, prd.querySelectorAll('li')[i].innerHTML, 100, ref)
			}
		}
		i++;
		if (i == l){
			clearInterval(intl);
		}
	}, 1000);

}



/* Сбор выручки */
if (/nebo.mobi\/floors\/0\/5/.exec(window.location)) {
	setInterval(function() {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'http://nebo.mobi/floors/0/5', true);
		// xhr.setRequestHeader('Referer', 'http://nebo.mobi/floors/0/5');
		xhr.onload = function() {
			var parser = new DOMParser();
			var doc = parser.parseFromString(xhr.responseText, "text/html");
			var tower = doc.getElementsByClassName('tower')[0];
			var links = tower.getElementsByClassName('tdu');
			var l = links.length;
			var i = 0, golink = "";
			var interval = setInterval(function(){
				if (links[i]) {
					golink = links[i].href || 'http://nebo.mobi/'+links[i].getAttribute('href');
					if (/wicket:interface=:\d+:floors:\d+:floorPanel:state:action::ILinkListener::/.exec(golink)) {
						end_xhr(golink, tower.querySelectorAll('li')[i].innerHTML, 100, 'http://nebo.mobi/floors/0/5');
					};
				}
				i++;
				if (i == l){
					clearInterval(interval);
				}
			}, 3000);
		};
		xhr.onerror = function() {
			debuglog(xhr);
		};
		xhr.send();
	}, 30000);
}



/* Выложить товар */
if (/nebo.mobi\/floors\/0\/3/.exec(window.location)) {
	setInterval(function() {

		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'http://nebo.mobi/floors/0/3', true);
		// xhr.setRequestHeader('Referer', 'http://nebo.mobi/floors/0/3');
		xhr.onload = function() {
			var parser = new DOMParser();
			var doc = parser.parseFromString(xhr.responseText, "text/html");
			var tower = doc.getElementsByClassName('tower')[0];
			var links = tower.getElementsByClassName('tdu');
			var l = links.length;
			var i = 0, golink = "";
			var interval = setInterval(function(){
				if (links[i]) {
					golink = links[i].href || 'http://nebo.mobi/'+links[i].getAttribute('href');
					if (/wicket:interface=:\d+:floors:\d+:floorPanel:state:action::ILinkListener::/.exec(golink)) {
						end_xhr(golink, tower.querySelectorAll('li')[i].innerHTML, 100, "http://nebo.mobi/floors/0/3");
					};
				}
				i++;
				if (i == l){
					clearInterval(interval);
				}
			}, 3000);
		};
		xhr.onerror = function() {
			debuglog(xhr);
		};
		xhr.send();
	}, 30000);
}


/* Выселение жителей */
// TODO не всегда выселяет с первого раза, когда-нибудь найти ошибку и исправить
function humansFN() {
	setTimeout(function(){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'http://nebo.mobi/humans', true);
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
		xhr.open('GET', 'http://nebo.mobi/quests', true);
		xhr.onload = function() {
			var parser	= new DOMParser(),
				doc 	= parser.parseFromString(xhr.responseText, "text/html"),
				link	= doc.querySelectorAll('.nfl .btng'),
				tl		= link.length,
				time_	= 0;
			for (var i = 0; i < tl; i++) {
				time_ 	= rand_time()+time_;
				//TODO не забыть: когда изменю nd_xhr - убрать тут и в других местах оборачивающий DIV
				end_xhr('http://nebo.mobi/'+link[i].getAttribute('href'), '<div class="nfl">'+link[i].closest('.nfl').innerHTML+'</div>', time_, 'http://nebo.mobi/quests');
			}
		};
		xhr.onerror = function() {
			debuglog(xhr);
		};
		xhr.send();
		quests();
	}, rand_time(180,300));// Раз в 3-5 минут
}


/* Функция добавления в "логи" */
function AddTable(e,c){
	var d = new Date();
	var t = addZero(d.getHours())+':'+addZero(d.getMinutes())+':'+addZero(d.getSeconds());
	document.getElementById('lift_table').insertAdjacentHTML('afterbegin',
		'<tr><td>'+t+'</td><td class="'+(c||'')+'">'+e+'</td></tr>');
}
function AddMessTable(f,s,callback){
	document.getElementById('log_table_1').innerHTML = f;
	document.getElementById('log_table_2').innerHTML = s;
	if(callback)callback();
}


/*
 * Функция извлечения времени
 */
function getTime(t) {
	var d = 0, h = 0, m = 0, s = 0,
		parsetime = t.split(/\s/);
	if (parsetime[1] == 'д') {
		var d = Math.round(parsetime[0]);
		var h = Math.round(parsetime[2]);
	}
	if (parsetime[1] == 'ч') {
		var h = Math.round(parsetime[0]);
		var m = Math.round(parsetime[2]);
	}
	if (parsetime[1] == 'м') {
		var m = Math.round(parsetime[0]);
		var s = Math.round(parsetime[2]);
	}
	if (parsetime[1] == 'сек') {
		var s = Math.round(parsetime[0]);
	}
	return [d, h, m, s];
}
function getSecond(t) {
	return (((t[0]*24+t[1])*60)+t[2])*60+t[3];
}

function firstMess(e) {
	if( e != "granted" ) return false;
	var notify = new Notification("Уведомления и таймер включены.", {
		tag : "nebo.mobi",
		body : "Перезагрузите страницу!",
		icon : "http://static.nebo.mobi/images/icons/home.png"
	});
};

function addZero(int_) {
	if ((int_+"").length == 1){int_ = "0"+int_}
	return int_;
}

function timer(time, id, notice) {
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
        id.innerHTML = days + " д, " + addZero(hours) + ":"
                     + addZero(minutes) + ":" + addZero(seconds);
        if(days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0){
			clearInterval(int_);
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
				var notify = new Notification(notifyD.name, {
					tag : "nebo.mobi",
					body : notifyD.body,
					icon : notifyD.icon
				});
			}
        }
    }, 1000);
}



/*
 * Если скрипт не запускается, то необходимо
 * раскомментировать (удалить в начале строки //)
 * и закомментировать (добавить в начале строки // или удалить строку)
 * строки ниже и в самом конце файла.
*/
//document.addEventListener("DOMContentLoaded", function(){	// Раскомментировать 1 из 2
window.onload = function() {								// Закомментировать  1 из 2
	var chM;

	/* Создаём таблицу логов */
	document.body.insertAdjacentHTML('beforeend',
									  '<style>#lift_table td > img {float:left}'
									 +'#lift_table,#log_table{left:10px;position:fixed;width:calc(50% - 320px)}'
									 +'#log_table{top:0;}'
									 +'#lift_table{top:28px;}'
									 +'#lift_table td > .ctrl {display:block}'
									 +'#lift_table td{border-bottom: 1px dotted #275587}</style>'
									 +'<table id="log_table" class="hdr"><tr><td id="log_table_1">&nbsp;</td>'
									 +'<td id="log_table_2" style="text-align:right;" class="amount">&nbsp;</td></tr></table>'
									 +'<table id="lift_table"><tr><td colspan="2">'
									 + "<small>Спасибо что воспользовались ботом для игры в Небоскрёбы! "
									 + "Если у вас есть вопросы или пожелания, вы можете их оставить на "
									 + "<a href='http://blog.g63.ru/?p=1903' target='_blank'>странице проекта</a></small>"
									 + '</td></tr></table>');

	AddMessTable('Небобот запущен', BOT.version);

	if (/nebo.mobi\/lift/.exec(window.location)) {
		liftFN();
		AddTable('Лифтёр скоро приступит к работе.','rc');
	} else if (/nebo.mobi\/humans/.exec(window.location)) {
		humansFN();
		AddTable('Скоро начнётся выселение.','rc');
	} else if (/nebo.mobi\/quests/.exec(window.location)) {
		quests();
		AddTable('Задания скоро начнут собираться.','rc');
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
            document.body.insertAdjacentHTML('beforeend','<a onclick="Notification.requestPermission(firstMess)" style="position:fixed;top:5px;right:10px;cursor:pointer;"><img src="http://static.nebo.mobi/images/icons/letters.png" alt="Включить уведомления"> Включить уведомления</a>');
            break;
	}

	/* Очищаем раз в час */
	setInterval(function() {
		var els = document.querySelectorAll('#lift_table tr'),
			ell = els.length,
			lt  = document.getElementById('lift_table');
		lt.innerHTML = '';
		for (var i = 0; i < ell; i++) {
			lt.insertAdjacentHTML("beforeEnd",els[i].innerHTML);
			if (i > 3) {
				break;
			}
		}
		AddTable('Логи очищены!');
		console.clear();
	}, 3600000);
}		// Закомментировать  2 из 2
//})	// Раскомментировать 2 из 2