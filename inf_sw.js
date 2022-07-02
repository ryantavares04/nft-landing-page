self.addEventListener('push',
	function (event) {
		if (!(self.Notification && self.Notification.permission === 'granted')) {
			return;
		}

		var data = {};
		if (event.data && event.data.text()) {
			data = event.data.json();
		}

		console.log("Notification Received:");
		console.log(data);

		// Additional options are available, with limited supported across browsers
		// Refer https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification

		var title = data.title || "";
		var body = data.body || "";
		var icon = data.icon || "";
		var image = data.image || "";
		var vibrate = [200, 100, 200, 100, 200, 100, 400];
		var actions = data.clickTitle ? [{ action: "open_url", title: data.clickTitle }] : [];
		var ackUrl = data.data.ack;

		event.waitUntil(
			self.registration.showNotification(title,
				{
					body: body,
					icon: icon,
					image: image,
					badge: icon,
					data: { url: data.data.url },
					vibrate: vibrate,
					actions: actions
				})
		);

		if (ackUrl) {
			fetch(ackUrl);
		}
	}
);

self.addEventListener('notificationclick', function (event) {
	event.notification.close();
	event.waitUntil(clients.matchAll(
		{
			type: "window"
		}).then(function (clientList) {
			for (var i = 0; i < clientList.length; i++) {
				var client = clientList[i];
				if (client.url === event.notification.data.url && "focus" in client)
					return client.focus();
			}
			if (clients.openWindow) {
				return clients.openWindow(event.notification.data.url);
			}
		})
	);
}, false);
