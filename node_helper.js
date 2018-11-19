/* Magic Mirror
 * Node Helper: snowbowl
 *
 * By Nick Kircos
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

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

module.exports = NodeHelper.create({
  // Override socketNotificationReceived method.

  /* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
  socketNotificationReceived: async function(notification, payload) {
    if (notification === "snowbowl-GET_REPORTS") {
      try {
        const report = await getHTML("https://montanasnowbowl.com/report.php3");
        this.sendSocketNotification("snowbowl-GET_REPORT_SUCCESS", report);
      } catch (error) {
        console.error("snowbowl", error);
        this.sendSocketNotification("snowbowl-GET_REPORT_SUCCESS", {
          isError: true,
          error
        });
      }

      try {
        const report = await getHTML(
          "https://www.skidiscovery.com/snow-report/"
        );
        this.sendSocketNotification(
          "snowbowl-GET_REPORT_DISCO_SUCCESS",
          report
        );
      } catch (error) {
        console.error("snowbowl", error);
        this.sendSocketNotification("snowbowl-GET_REPORT_DISCO_SUCCESS", {
          isError: true,
          error
        });
      }

      try {
        const response = await exec(
          "curl 'https://www.losttrail.com/snow-report/' -H 'authority: www.losttrail.com' -H 'pragma: no-cache' -H 'cache-control: no-cache' -H 'upgrade-insecure-requests: 1' -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36' -H 'dnt: 1' -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8' -H 'accept-encoding: gzip, deflate, br' -H 'accept-language: en-US,en;q=0.9' -H 'cookie: PHPSESSID=fj63rlp29ogot5tbcjsrmcev02; wcp_useroptions_id=9a66350fb22ae9459b26a24a1df4bfc15befb463d85e55.61366257; vchideactivationmsg=1; vchideactivationmsg_vc11=5.5.5; incap_ses_207_1728444=WT5wOviXOF5+MgKs22nfAucB8VsAAAAAYiu9ezmIfv7FKutembzS2w==; visid_incap_1728444=bHAfANHZQOeM0K8OENIuI2G071sAAAAAQ0IPAAAAAACAkkiIAUiuSWcKrQEmjD1O9l26I7DxgxA+; _fbp=fb.1.1542521456051.1361509601' --compressed"
        );

        this.sendSocketNotification(
          "snowbowl-GET_REPORT_LOST_SUCCESS",
          response
        );
      } catch (error) {
        console.error("snowbowl", error);
        this.sendSocketNotification("snowbowl-GET_REPORT_LOST_SUCCESS", {
          isError: true,
          error
        });
      }
    }
  }
});
