/* global Module */

/* Magic Mirror
 * Module: snowbowl
 *
 * By Nick Kircos
 * MIT Licensed.
 */

Module.register("snowbowl", {
  defaults: {
    updateInterval: 60000,
    retryDelay: 5000
  },

  requiresVersion: "2.1.0", // Required version of MagicMirror

  start() {
    //Flag for check if module is loaded
    this.loaded = false;

    // Schedule update timer.
    this.getData();
    setInterval(() => this.updateDom(), this.config.updateInterval);
  },

  /*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
  getData() {
    this.sendSocketNotification("snowbowl-GET_REPORT");
  },

  /* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
  scheduleUpdate(delay) {
    var nextLoad = this.config.updateInterval;
    if (typeof delay !== "undefined" && delay >= 0) {
      nextLoad = delay;
    }
    nextLoad = nextLoad;

    setTimeout(() => self.getData(), nextLoad);
  },

  getDom() {
    var wrapper = document.createElement("div");
    wrapper.style.fontSize = "16px";
    wrapper.style.lineHeight = "normal";
    wrapper.style.maxWidth = "370px";

    if (this.snowbowlReportJson) {
      const {
        newstormtotal,
        lastupdated,
        "24hourtotal": twentyFourHourTotal,
        current_temp_base,
        current_weather_type,
        operations_hoursofweekday,
        operations_lifts,
        operations_trails,
        operations_peropen,
        surface_condition_primary,
        surface_condition_secondary,
        surface_depth_base,
        surface_depth_summit,
        specialevents,
        comments
      } = this.snowbowlReportJson;
      var report = document.createElement("label");
      report.innerHTML = `
      ${
        Number(newstormtotal)
          ? `<span class="wi weathericon wi-snow"></span> Storm ${newstormtotal}" </br>`
          : ""
      }
      ${
        Number(twentyFourHourTotal)
          ? `<span class="wi weathericon wi-snow"></span> 24hr ${twentyFourHourTotal}" </br>`
          : ""
      }
      ${Number(current_temp_base) ? `Base ${current_temp_base}° </br>` : ""}
      ${current_weather_type ? `${current_weather_type} </br>` : ""}
      ${
        operations_hoursofweekday
          ? `Hours ${operations_hoursofweekday}</br>`
          : ""
      }
      ${
        Number(surface_depth_summit)
          ? `Summit ${surface_depth_summit}" </br>`
          : ""
      }
      ${Number(surface_depth_base) ? `Base ${surface_depth_base}" </br>` : ""}
      ${specialevents ? `Events: ${specialevents}</br>` : ""}
      ${comments ? `${comments}</br>` : ""}
      ${`<span style="font-size: 12px;">${lastupdated}</span>`}
      ${this.discoReportJson ? this.discoReportJson.toString() : ""}
      `;

      wrapper.appendChild(report);
    }

    return wrapper;
  },

  getScripts: () => [],
  getStyles: () => ["snowbowl.css"],

  // Load translations files
  getTranslations: () => ({
    en: "translations/en.json",
    es: "translations/es.json"
  }),

  // socketNotificationReceived from helper
  socketNotificationReceived(notification, payload) {
    if (notification === "snowbowl-GET_REPORT") {
      this.processSnowbowlData(payload);
    }
    if (notification === "snowbowl-GET_REPORT_DISCO") {
      this.processDiscoData(payload);
    }
  },

  processSnowbowlData(report) {
    const startSearch = "<!-- BEGIN POLLING --";
    const endSearch = "-- END POLLING -->";

    const reportObj = report
      .substring(
        report.indexOf(startSearch) + startSearch.length,
        report.indexOf(endSearch)
      )
      .split("|~")
      .reduce((prev, line) => {
        let [key, val] = line.split("|");
        key = key.replace("\n", "");
        if (key) {
          prev[key] = val;
        }
        return prev;
      }, {});

    // { lastupdated: 'Tuesday Oct 02, 2018 07:00 PM',
    // newstormtotal: '0',
    // '24hourtotal': '0',
    // current_temp_base: '0',
    // current_weather_type: '',
    // operations_hoursofweekday: '',
    // operations_lifts: '',
    // operations_trails: '',
    // operations_peropen: '',
    // surface_condition_primary: '',
    // surface_condition_secondary: '',
    // surface_depth_base: '0',
    // surface_depth_summit: '0',
    // specialevents: '',
    // comments: 'Ski Shop Open House and Sale is coming up!  Saturday and Sunday, October 13 and 14, noon to 4:30 pm.' }

    this.snowbowlReportJson = reportObj;
    if (this.loaded === false) {
      this.updateDom(this.config.animationSpeed);
    }
    this.loaded = true;
  },

  processDiscoData(reportHtml) {
    const parsingDiv = document.createElement("div");
    parsingDiv.innerHTML = reportHtml;
    const rows = [].slice.call(
      parsingDiv.querySelector(".main-tile .main-content").children
    );

    const reportObj = rows.reduce((prev, row) => {
      const [key, val] = row.children;
      if (key.innerText) {
        prev[key.innerText] = val.innerText;
      }
      return prev;
    }, {});
    console.log("parsed disco", reportObj);
    this.discoReportJson = reportObj;
    // if (this.loaded === false) {
      this.updateDom(this.config.animationSpeed);
    // }
    this.loaded = true;
  }
});
