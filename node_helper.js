/* Magic Mirror
 * Node Helper: snowbowl
 *
 * By Nick Kircos
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");

const getHTML = url =>
  new Promise((resolve, reject) => {
    // select http or https module, depending on reqested url
    const lib = url.startsWith("https") ? require("https") : require("http");
    const request = lib.get(url, response => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(
          new Error("Failed to load page, status code: " + response.statusCode)
        );
      }
      // temporary data holder
      const body = [];
      // on every content chunk, push it to the data array
      response.on("data", chunk => body.push(chunk));
      // we are done, resolve promise with those joined chunks
      response.on("end", () => resolve(body.join("")));
    });
    // handle connection errors of the request
    request.on("error", err => reject(err));
  });

const getData = async function() {
  return report;
};

module.exports = NodeHelper.create({
  // Override socketNotificationReceived method.

  /* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
  socketNotificationReceived: async function(notification, payload) {
    if (notification === "snowbowl-NOTIFICATION_TEST") {
      console.log(
        "Working notification system. Notification:",
        notification,
        "payload: ",
        payload
      );
      try {
        const report = await getHTML("https://montanasnowbowl.com/report.php3");
        this.sendNotificationTest(report); //Is possible send objects :)
      } catch (e) {
        Log.error(e);
      }
    }
  },

  // Example function send notification test
  sendNotificationTest: function(payload) {
    this.sendSocketNotification("snowbowl-NOTIFICATION_TEST", payload);
  },

  // this you can create extra routes for your module
  extraRoutes: function() {
    var self = this;
    this.expressApp.get("/snowbowl/extra_route", function(req, res) {
      // call another function
      values = self.anotherFunction();
      res.send(values);
    });
  },

  // Test another function
  anotherFunction: function() {
    return { date: new Date() };
  }
});
