// ==UserScript==
// @name        Небоскреб
// @namespace   Игры
// @include     http://nebo.mobi/*
// @version     1.02
// @description Бот для игры Небоскребы
// @match       http://nebo.mobi/*
// @copyright   BaNru (2014-2016)
// @author   	BaNru
// ==/UserScript==

console.log('НебоБот Запущен');

/* Функции */

/**
 *
 * end_xhr
 *
 * Последний запрос - выполнение действия и вывод ответ на экран
 *
 * url - страница действия
 * text - сообщение для вывода на экран
 * time - вреия ожидания перед действие
 * ref - реферал, если разрешено в браузере
 *
 */
function end_xhr(url, text, time, ref) {
	setTimeout(function(){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		// Раскомментировать строчку, если разрешены рефералы в браузере,
		// немного повышает защиту бота
		// xhr2.setRequestHeader('Referer', ref);
		xhr.onload = function() {
			AddTable(text);
			console.log(url, xhr.responseURL);
		};
		xhr.onerror = function() {
			console.log(xhr);
		};
		xhr.send();
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
if (/nebo.mobi\/lift/.exec(window.location)) {
	setInterval(function(){

		var xhr = new XMLHttpRequest();

		xhr.open('GET', 'http://nebo.mobi/lift', true);
		// Раскомментировать строчку, если разрешены рефералы в браузере,
		// немного повышает защиту бота
		// xhr.setRequestHeader('Referer', 'http://nebo.mobi/lift');

		xhr.onload = function() {

				var parser = new DOMParser();
				var doc = parser.parseFromString(xhr.responseText, "text/html");
				var lift = doc.getElementsByClassName('lift')[0];

				if (lift && lift.getElementsByClassName('tdu')[0]) {
					end_xhr(
						lift.getElementsByClassName('tdu')[0].href ||
						'http://nebo.mobi/'+lift.getElementsByClassName('tdu')[0].getAttribute('href'),
						lift.innerHTML.replace('<div class="clb"></div>',''),
						rand_time(),
						'http://nebo.mobi/lift'
					);
				} else {
					// TODO Сделать паузу согласно указанному времени
					document.getElementById('empty_table').innerHTML = parseFloat(document.getElementById('empty_table').innerHTML)+1||0+1;
					AddTable(lift.innerHTML.replace('<div class="clb"></div>',''));
				}

		};
		xhr.onerror = function() {
			console.log(xhr);
		};
		xhr.send();
	}, rand_time());
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
			var doc = parser.parseFromString(xhr.responseText, "text/html")
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
							console.log(xhr2);
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
			console.log(xhr);
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
			var doc = parser.parseFromString(xhr.responseText, "text/html")
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
			console.log(xhr);
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
			var doc = parser.parseFromString(xhr.responseText, "text/html")
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
			console.log(xhr);
		};
		xhr.send();
	}, 30000);
}



/* Очищаем раз в час */
setInterval(function() {
	document.getElementById('lift_table').innerHTML = '';
}, 3600000);



/* Создаём таблицу логов */
setTimeout(function() {
	document.body.insertAdjacentHTML('beforeend',
									  '<style>#lift_table td > img {float:left}'
									 +'#lift_table,#log_table{left:0;top:0;position:fixed}'
									 +'#lift_table{left:10px;width:calc(50% - 320px)}'
									 +'#lift_table td > .ctrl {display:block}'
									 +'#lift_table td{border-bottom: 1px dotted #275587}</style>'
									 +'<table id="log_table"><tr><td id="empty_table"></td></tr></table>'
									 +'<table id="lift_table"><tr><td colspan="2">'
									 + "<small>Спасибо что воспользовались ботом для игры в Небоскрёбы! "
									 + "Если у вас есть вопросы или пожелания, вы можете их оставить на "
									 + "<a href='http://blog.g63.ru/?p=1903' target='_blank'>странице проекта</a></small>"
									 + '</td></tr></table>');
}, 1000);


/* Функция добавления в "логи" */
function AddTable(e){
	var d = new Date();
	var t = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
	document.getElementById('lift_table').insertAdjacentHTML('afterbegin',
		'<tr><td>'+t+'</td><td>'+e+'</td></tr>');
}


/* Таймеры */
setTimeout(function(){
    var time = document.querySelectorAll('[id^=time]');
    var tl = time.length;
    var parsetime = null;    
    var date = new Date();
    for (var i = 0; i < tl; i++) {
        time[i].title = time[i].innerHTML;
        parsetime = time[i].innerHTML.split(/\s/);
        var d = 0, h = 0, m = 0, s = 0;
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
        timer(d, h, m, s, time[i],i);
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
}, 1000);

function firstMess(e) {
	if( e != "granted" ) return false;
	var notify = new Notification("Уведомления и таймер включены.", {
		tag : "nebo.mobi",
		body : "Перезагрузите страницу!",
		icon : "http://static.nebo.mobi/images/icons/home.png"
	});
};

function timer(d, h, m, s, id, i) {
	var seconds_left = (((d*24+h)*60)+m)*60+s;
    var int_ = [];
    int_[i] = setInterval(function () {
		var seconds_left_d, seconds_left_h,
			days, hours, minutes, seconds;
		seconds_left--;
        days = parseInt(seconds_left / 86400);
        seconds_left_d = seconds_left % 86400;
        hours = parseInt(seconds_left_d / 3600);
        seconds_left_h = seconds_left % 3600;
        minutes = parseInt(seconds_left_h / 60);
        seconds = parseInt(seconds_left % 60);
		if ((hours+"").length == 1){hours = "0"+hours}
		if ((minutes+"").length == 1){minutes = "0"+minutes}
		if ((seconds+"").length == 1){seconds = "0"+seconds}
        id.innerHTML = days + " д, " + hours + ":"
                     + minutes + ":" + seconds;
        if(days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0){
			clearInterval(int_[i]);
			var pn  = id.parentNode.parentNode;
			var notify = new Notification(pn.getElementsByTagName('span')[0].innerHTML, {
				tag : "nebo.mobi",
				body : pn.getElementsByTagName('span')[3].innerHTML,
				icon : pn.parentNode.getElementsByTagName('img')[0].src
			});
        }
    }, 1000);
}