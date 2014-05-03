// ==UserScript==
// @name        Небоскреб
// @namespace   Игры
// @include     http://nebo.mobi/*
// @version     1
// @description Бот для игры Небоскребы
// @match       http://nebo.mobi/*
// @copyright   BaNru (2014)
// ==/UserScript==

console.log('НебоБот Запущен');

/* Лифтер */
if (/nebo.mobi\/lift/.exec(window.location)) {
setInterval(function(){

	GM_xmlhttpRequest({
        method: "GET",
		url: 'http://nebo.mobi/lift',
		headers : {
			Referrer : "http://nebo.mobi/lift"
		},
		onload: function(response) {

			var parser = new DOMParser();
			var doc = parser.parseFromString(response.responseText, "text/html");
			var lift = doc.getElementsByClassName('lift')[0];

			if (lift.getElementsByClassName('tdu')[0]) {
                var golink = lift.getElementsByClassName('tdu')[0].href || 'http://nebo.mobi/'+lift.getElementsByClassName('tdu')[0].getAttribute('href');
				setTimeout(function(){
				GM_xmlhttpRequest({
					method: "GET",
					url: golink,
					headers : {
						Referrer : "http://nebo.mobi/lift"
					},
					onload: function(response) {
						AddTable(lift.innerHTML.replace('<div class="clb"></div>',''));
                        console.log(golink, response.finalUrl);
					},
					onerror: function(response) {
						console.log(response);
					}
				});
				}, 3000);
			} else {
				// TODO Сделать паузу согласно указанному времени
				document.getElementById('empty_table').innerHTML = parseFloat(document.getElementById('empty_table').innerHTML)+1||0+1;
				AddTable(lift.innerHTML.replace('<div class="clb"></div>',''));
			}

		},
		onerror: function(response) {
			console.log(response);
		}
	});
	
}, 5000);
}



/* Закупаем товар */
if (/nebo.mobi\/floors\/0\/2/.exec(window.location)) {
setInterval(function() {
	GM_xmlhttpRequest({
        method: "GET",
		url: 'http://nebo.mobi/floors/0/2',
		headers : {
			Referrer : "http://nebo.mobi/floors/0/2"
		},
		onload: function(response) {
			var parser = new DOMParser();
			var doc = parser.parseFromString(response.responseText, "text/html")
			var tower = doc.getElementsByClassName('tower')[0];
			var links = tower.getElementsByClassName('tdu');
			var l = links.length;
			var i = 0, golink = "";
			var interval = setInterval(function(){
                golink = links[i].href || 'http://nebo.mobi/'+links[i].getAttribute('href');
				if (/nebo\.mobi\/(?:\.\.\/)*floor\//.exec(golink)) {
                    console.log(golink);
                    AddTable(tower.querySelectorAll('li')[i].innerHTML);
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: golink,
                        headers : {
                            Referrer : "http://nebo.mobi/floors/0/2"
                        },
                        onload: function(response) {
                            productAction(response.responseText, response.finalUrl)
                        },
                        onerror: function(response) {
                            console.log(response);
                        }
                    });
				};
				i++;
				if (i == l){
					clearInterval(interval);
				}
			}, 3000);
		},
		onerror: function(response) {
			console.log(response);
		}
	});
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
        golink = links[i].href || 'http://nebo.mobi/'+links[i].getAttribute('href');
		if (/wicket:interface=:\d+:floorPanel:product[A-Z]:emptyState:action:link::ILinkListener::/.exec(golink)) {
			// TODO Сделать вывод закупаемого товара
			// Сейчас выводится первый, если в магазине 1 товар на закупку
			AddTable(prd.querySelectorAll('li')[i].innerHTML);
				GM_xmlhttpRequest({
				method: "GET",
				url : golink,
				headers : {
					Referrer : ref
				},
				onload: function(response) {
					console.log('Товар куплен', golink);
				},
				onerror: function(response) {
					console.log(response);
				}
			});
		}
		console.log(i);
		i++;
		if (i == l){
			clearInterval(intl);
		}
	}, 1000);

}



/* Сбор выручки */
if (/nebo.mobi\/floors\/0\/5/.exec(window.location)) {
setInterval(function() {
	GM_xmlhttpRequest({
        method: "GET",
		url: 'http://nebo.mobi/floors/0/5',
		headers : {
			Referrer : "http://nebo.mobi/floors/0/5"
		},
		onload: function(response) {
			var parser = new DOMParser();
			var doc = parser.parseFromString(response.responseText, "text/html")
			var tower = doc.getElementsByClassName('tower')[0];
			var links = tower.getElementsByClassName('tdu');
			var l = links.length;
			var i = 0, golink = "";
			var interval = setInterval(function(){
                golink = links[i].href || 'http://nebo.mobi/'+links[i].getAttribute('href');
                if (/wicket:interface=:\d+:floors:\d+:floorPanel:state:action::ILinkListener::/.exec(golink)) {
						AddTable(tower.querySelectorAll('li')[i].innerHTML);
						GM_xmlhttpRequest({
							method: "GET",
							url: golink,
							headers : {
								Referrer : "http://nebo.mobi/floors/0/5"
							},
							onload: function(response) {
								console.log('Бабло собрано!', response.finalUrl);
							},
							onerror: function(response) {
								console.log(response);
							}
						});
				};
				i++;
				if (i == l){
					clearInterval(interval);
				}
			}, 3000);
		},
		onerror: function(response) {
			console.log(response);
		}
	});
}, 30000);
}



/* Выложить товар */
if (/nebo.mobi\/floors\/0\/3/.exec(window.location)) {
setInterval(function() {

	GM_xmlhttpRequest({
        method: "GET",
		url: 'http://nebo.mobi/floors/0/3',
		headers : {
			Referrer : "http://nebo.mobi/floors/0/3"
		},
		onload: function(response) {
			var parser = new DOMParser();
			var doc = parser.parseFromString(response.responseText, "text/html")
			var tower = doc.getElementsByClassName('tower')[0];
			var links = tower.getElementsByClassName('tdu');
			var l = links.length;
			var i = 0, golink = "";
			var interval = setInterval(function(){
                golink = links[i].href || 'http://nebo.mobi/'+links[i].getAttribute('href');
				if (/wicket:interface=:\d+:floors:\d+:floorPanel:state:action::ILinkListener::/.exec(golink)) {
						AddTable(tower.querySelectorAll('li')[i].innerHTML);
						GM_xmlhttpRequest({
							method: "GET",
							url: golink,
							headers : {
								Referrer : "http://nebo.mobi/floors/0/3"
							},
							onload: function(response) {
								console.log('Товар выложен!', response.finalUrl);
							},
							onerror: function(response) {
								console.log(response);
							}
						});
				};
				i++;
				if (i == l){
					clearInterval(interval);
				}
			}, 3000);
		},
		onerror: function(response) {
			console.log(response);
		}
	});

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
									 +'<table id="lift_table"></table>');
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
    var time = document.getElementsByClassName('time');
    var tl = time.length;
    var parsetime = null;    
    var date = new Date();
    for (var i = 0; i < tl; i++) {
        time[i].title = time[i].getElementsByTagName('span')[0].innerHTML;
        parsetime = time[i].getElementsByTagName('span')[0].innerHTML.split(/\s/);
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
        timer(d, h, m, s, time[i].getElementsByTagName('span')[0],i);
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
};unsafeWindow.firstMess = firstMess;

function timer(d, h, m, s, id, i) {
	var seconds_left = (((d*24+h)*60)+m)*60+s;
    var int = [];
    int[i] = setInterval(function () {
		seconds_left--;
        days = parseInt(seconds_left / 86400);
        seconds_left = seconds_left % 86400;
        hours = parseInt(seconds_left / 3600);
        seconds_left = seconds_left % 3600;
        minutes = parseInt(seconds_left / 60);
        seconds = parseInt(seconds_left % 60);
        id.innerHTML = days + " д, " + hours + ":"
                     + minutes + ":" + seconds;
        if(days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0){
			clearInterval(int[i]);
			console.log('1');
			var pn  = id.parentNode.parentNode;
			var notify = new Notification(pn.getElementsByTagName('span')[0].innerHTML, {
				tag : "nebo.mobi",
				body : pn.getElementsByTagName('span')[3].getElementsByTagName('span')[0].innerHTML,
				icon : pn.parentNode.getElementsByTagName('img')[0].src
			});
        }
    }, 1000);
}
