// async function $invoke(method, args, cb) {
// 	let argsarr = [];
// 	for (let k in args) {
// 	   argsarr.push(args[k]);
// 	}
// 	let ret = await fetch('/api/' + method, {
// 	   method     : "POST", // *GET, POST, PUT, DELETE, etc.
// 	   mode       : "cors", // no-cors, cors, *same-origin
// 	//    cache      : "reload", // *default, no-cache, reload, force-cache, only-if-cached
// 	   credentials: "same-origin", // include, same-origin, *omit
// 	   headers    : {
// 		  "Content-Type": "application/json; charset=utf-8"
// 	   },
// 	   redirect   : "follow", // manual, *follow, error
// 	   referrer   : "no-referrer", // no-referrer, *client
// 	   body       : JSON.stringify(argsarr) // body data type must match "Content-Type" header
// 	});
// 	let txt = await ret.text();
// 	// log.debug(`${method} - ${txt}`);
// 	try {
// 	   let ret = JSON.parse(txt);
// 	   if (cb) return cb(null, ret);
// 	   else return ret;
// 	} catch (e) {
// 	   console.group("ERROR");
// 	   console.error("METHOD:" + method);
// 	   console.error("ARGS:" + JSON.stringify(args));
// 	   console.error("JSON IS:" + txt);
// 	   console.error(e);
// 	   console.groupEnd();
// 	   if (cb) return (cb(e));
// 	   return e;
// 	}
	
//  }
 
// //  let CACHE_NAME = "cache";
 
 
// //  async function handleMessages() {
// // 	let msgs = await $invoke("myNotifications", []);
	
// // 	if (msgs.constructor.name !== "Array") {
// // 	   msgs = [msgs];
// // 	}
	
// // 	for (let m of msgs) {
// // 	   self.registration.showNotification(m.title, m);
// // 	   messageAllClients(m);
// // 	}
// //  }
 
// //  function messageAllClients(msg) {
	
// // 	function send_message_to_client(client, msg) {
// // 	   return new Promise(function (resolve, reject) {
// // 		  var msg_chan = new MessageChannel();
		  
// // 		  msg_chan.port1.onmessage = function (event) {
// // 			 if (event.data.error) {
// // 				reject(event.data.error);
// // 			 } else {
// // 				resolve(event.data);
// // 			 }
// // 		  };
		  
// // 		  client.postMessage(msg, [msg_chan.port2]);
// // 	   });
// // 	}
	
// // 	clients.matchAll().then(clients => {
// // 	   clients.forEach(client => {
// // 		  send_message_to_client(client, msg).then(m => console.log("SW Received Message: " + m));
// // 	   });
// // 	});
	
// //  }
 
// //  self.addEventListener('activate', function (event) {
// // 	console.log("SW - Activate");
// // 	event.waitUntil(self.clients.claim().then(handleMessages())); // Become available to all pages
// //  });
 
// //  self.addEventListener('install', async function (event) {
// // 	console.log("SW - Install");
	
// // 	async function Initiate() {
// // 	   // let config = await $invoke("getCacheConfig");
	   
// // 	   let filesJson   = await fetch("/localcache.txt");
// // 	   let fileContent = await filesJson.text();
// // 	   let files       = fileContent.split("\n");
	   
	   
// // 	   let urlsToCache = files;
	   
// // 	   console.group("Installing ServiceWorker");
// // 	   // console.dir(config);
// // 	   // console.groupEnd();
	   
// // 	   let cache   = await caches.open(CACHE_NAME);
// // 	   let ps      = [];
// // 	   let counter = 1;
// // 	   for (let f of urlsToCache) {
// // 		  console.log("Caching:" + f + " - " + Math.round((counter / urlsToCache.length) * 100) + "%");
// // 		  counter++;
// // 		  ps.push(cache.add(f));
// // 	   }
// // 	   console.group("ServiceWorker started with success");
// // 	   let ret = Promise.all(ps);
// // 	}
	
// // 	event.waitUntil(Initiate());
// // 	// event.waitUntil(self.skipWaiting()); // Activate worker immediately
// //  });
 
// //  self.addEventListener('fetch', function (event) {
// // 	//console.log(`${event.request.method}:${event.request.url}`);
// // 	event.respondWith(
// // 	   caches.match(event.request)
// // 		  .then(function (response) {
// // 			 // Cache hit - return response
// // 			 if (response) {
// // 				return response;
// // 			 }
			 
// // 			 var fetchRequest = event.request.clone();
			 
// // 			 return fetch(fetchRequest).then(
// // 				function (response) {
// // 				   console.log(`Cache miss:${event.request.method}:${event.request.url}`);
// // 				   // Check if we received a valid response
// // 				   if (!response || response.status !== 200 || response.type !== 'basic' || event.request.method !== "GET") {
// // 					  return response;
// // 				   }
				   
// // 				   var responseToCache = response.clone();
				   
// // 				   caches.open(CACHE_NAME)
// // 					  .then(function (cache) {
// // 						 cache.put(event.request, responseToCache);
// // 					  });
				   
// // 				   return response;
// // 				}
// // 			 );
// // 		  })
// // 	);
// //  });
 
// //  self.addEventListener('push', async function (event) {
	
// // 	// const title   = 'Plantao Ja';
// // 	// const options = {
// // 	//     body : 'Yay it works.',
// // 	//     icon : '/assets/logo_48.png',
// // 	//     badge: '/assets/logo_48.png'
// // 	// };
// // 	// self.registration.showNotification(title, options);
	
// // 	handleMessages();
	
// //  });
 
// //  self.addEventListener('message', function (event) {
// // 	console.log("SW Received Message: " + event.data);
// //  });