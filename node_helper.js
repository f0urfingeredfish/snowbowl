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
        const report = await getHTML("https://montanasnowbowl.com/report.php");
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
          "curl 'https://www.onthesnow.com/auth/my/favorites/resort?id=217' -H 'Pragma: no-cache' -H 'DNT: 1' -H 'Accept-Encoding: gzip, deflate, br' -H 'Accept-Language: en-US,en;q=0.9' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36' -H 'Accept: application/json, text/javascript, */*; q=0.01' -H 'Cache-Control: no-cache' -H 'X-Requested-With: XMLHttpRequest' -H 'Cookie: __utmc=24804196; __utmz=24804196.1542523170.1.1.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); _stn_uid=aee88d55-748b-4525-96c5-5f32ba3ecbee; __gads=ID=f9b64e8a5de7e150:T=1542523171:S=ALNI_MaN60F6qBJhHNhn-A_3n04IpJPVJA; otssi_s=eyJwYXNzcG9ydCI6eyJ1c2VyIjoiY2M0ZWNjYzEtODA1OC00M2RmLWFhMmQtNGNlMzkxZjMwZWRiIn19; otssi_s.sig=Ts6b9Q09mPLz8Uy0Junrb_rg6ps; acceptCookies=1; AAMC_mountainnews_0=REGION%7C7; aam_uuid=44566505136598064033676255330239828336; rdircan=https%253A%252F%252Fwww.onthesnow.com%252Fmontana%252Flost-trail-powder-mtn%252Fskireport.html; __utma=24804196.760504358.1542523170.1542660570.1542866636.3; _fbp=fb.1.1542866636717.1927706343; session=127.0.0.1.1542866653601691; actresort=55%26217; __utmt=1; __utmt_globalTracker=1; __utmb=24804196.12.10.1542866636; resfav=217; __utmli=favorite217; resfavdt=1542867432488' -H 'Connection: keep-alive' -H 'Referer: https://www.onthesnow.com/montana/lost-trail-powder-mtn/ski-resort.html' --compressed"
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
