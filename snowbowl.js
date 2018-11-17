/* global Module */

/* Magic Mirror
 * Module: snowbowl
 *
 * By Nick Kircos
 * MIT Licensed.
 */

Module.register("snowbowl", {
  defaults: {
    updateInterval: 60 * 1000,
    fetchReportInterval: 1000 * 60 * 60,
    retryDelay: 5000
  },

  requiresVersion: "2.1.0", // Required version of MagicMirror

  start() {
    //Flag for check if module is loaded
    this.loaded = false;
    this.isDisplayingSnowBowl = false;

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
    var nextLoad = this.config.fetchReportInterval;
    if (typeof delay !== "undefined" && delay >= 0) {
      nextLoad = delay;
    }
    nextLoad = nextLoad;

    setTimeout(() => self.getData(), nextLoad);
  },
  getDom() {
    return this.isDisplayingSnowBowl
      ? this.getDiscoDom()
      : this.getSnowBowlDom();
  },
  getSnowBowlDom() {
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
      <div>Snowbowl</div>
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
      `;

      wrapper.appendChild(report);
    }
    this.isDisplayingSnowBowl = true;
    return wrapper;
  },

  getDiscoDom() {
    var wrapper = document.createElement("div");
    wrapper.style.fontSize = "16px";
    wrapper.style.lineHeight = "normal";
    wrapper.style.maxWidth = "370px";

    if (this.discoReportJson) {
      const {
        tempCurrent,
        weather,
        wind,
        liftsOpen,
        newSnow,
        snow24,
        snow48,
        snow72,
        snowDepthBottom,
        snowDepthTop,
        snowYTD,
        surfacePrimary,
        surfaceSecondary,
        terrainOpen,
        trails,
        lastUpdated
      } = this.discoReportJson;
      var report = document.createElement("div");
      report.innerHTML = `
      <div>Discovery</div>
      ${weather ? `${weather} </br>` : ""}
      ${Number(tempCurrent) ? `Base ${tempCurrent}° </br>` : ""}
      ${
        Number(newSnow)
          ? `<span class="wi weathericon wi-snow"></span> Storm ${newSnow}" </br>`
          : ""
      }
      ${
        Number(snow24)
          ? `<span class="wi weathericon wi-snow"></span> 24hr ${snow24}" </br>`
          : ""
      }
      ${
        Number(snow48)
          ? `<span class="wi weathericon wi-snow"></span> 48hr ${snow48}" </br>`
          : ""
      }
      ${
        Number(snow72)
          ? `<span class="wi weathericon wi-snow"></span> 72hr ${snow72}" </br>`
          : ""
      }
      ${Number(snowDepthTop) ? `Summit ${snowDepthTop}" </br>` : ""}
      ${Number(snowDepthBottom) ? `Base ${snowDepthBottom}" </br>` : ""}
      ${surfacePrimary ? `Surface: ${surfacePrimary}</br>` : ""}
      ${liftsOpen ? `Lifts ${liftsOpen}</br>` : ""}
      ${trails ? `Trails ${trails}</br>` : ""}
      ${`<span style="font-size: 12px;">${lastUpdated}</span>`}
      `;

      wrapper.appendChild(report);
    }
    this.isDisplayingSnowBowl = false;
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
    if (notification === "snowbowl-GET_REPORT_LOST") {
      this.processLostData(payload);
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

    this.updateDom(this.config.animationSpeed);
  },

  processDiscoData(reportHtml) {
    const newHTMLDocument = document.implementation.createHTMLDocument(
      "preview"
    );
    const parsingDiv = newHTMLDocument.createElement("div");
    parsingDiv.innerHTML = reportHtml;
    const lastUpdated = parsingDiv
      .querySelector("#non-tabbing-tab > span")
      .innerText.replace("Updated: ", "");
    const rows = [].slice.call(
      parsingDiv.querySelector(".main-tile .main-content").children
    );

    const reportObj = rows.reduce(
      (prev, row) => {
        const [key, val] = row.children;
        if (key.innerText) {
          prev[key.innerText] = val.innerText;
        }
        return prev;
      },
      { lastUpdated }
    );

    const {
      "Current Temperature": tempCurrent,
      "Current Weather": weather,
      "Current Wind": wind,
      "Lifts Open": liftsOpen,
      "New Snow (since lifts closed)": newSnow,
      "New Snow, 24 hours": snow24,
      "New Snow, 48 hours": snow48,
      "New Snow, 72 hours": snow72,
      "Snow Depth - Bottom": snowDepthBottom,
      "Snow Depth - Top": snowDepthTop,
      "Snowfall, YTD": snowYTD,
      "Surface Conditions (Primary)": surfacePrimary,
      "Surface Conditions (Secondary)": surfaceSecondary,
      "Terrain Open": terrainOpen,
      "Trails Open": trails
    } = reportObj;
    this.discoReportJson = {
      tempCurrent,
      weather,
      wind,
      liftsOpen,
      newSnow,
      snow24,
      snow48,
      snow72,
      snowDepthBottom,
      snowDepthTop,
      snowYTD,
      surfacePrimary,
      surfaceSecondary,
      terrainOpen,
      trails,
      lastUpdated
    };

    this.updateDom(this.config.animationSpeed);
  },

  processLostData() {
    const newHTMLDocument = document.implementation.createHTMLDocument(
      "losttrail"
    );
    const parsingDiv = newHTMLDocument.createElement("div");
    parsingDiv.innerHTML = reportHtml;
    const lastUpdated = parsingDiv
      .querySelector(
        "#content > div > div > div > article > div > div:nth-child(1) > div > div > div > div.vc_message_box.vc_message_box-standard.vc_message_box-rounded.vc_color-info > p:nth-child(3)"
      )
      .innerText.split("@")[1]
      .replace(")", "");
    const rows = [].slice.call(
      parsingDiv.querySelector("#t9 > tbody").children
    );

    const reportObj = rows.reduce(
      (prev, row) => {
        const [key, val] = row.children;
        if (key.innerText) {
          prev[key.innerText] = val.innerText;
        }
        return prev;
      },
      { lastUpdated }
    );

    console.log("lost:", reportObj);
    // const {
    //   "Current Temperature": tempCurrent,
    //   "Current Weather": weather,
    //   "Current Wind": wind,
    //   "Lifts Open": liftsOpen,
    //   "New Snow (since lifts closed)": newSnow,
    //   "New Snow, 24 hours": snow24,
    //   "New Snow, 48 hours": snow48,
    //   "New Snow, 72 hours": snow72,
    //   "Snow Depth - Bottom": snowDepthBottom,
    //   "Snow Depth - Top": snowDepthTop,
    //   "Snowfall, YTD": snowYTD,
    //   "Surface Conditions (Primary)": surfacePrimary,
    //   "Surface Conditions (Secondary)": surfaceSecondary,
    //   "Terrain Open": terrainOpen,
    //   "Trails Open": trails
    // } = reportObj;
    // this.discoReportJson = {
    //   tempCurrent,
    //   weather,
    //   wind,
    //   liftsOpen,
    //   newSnow,
    //   snow24,
    //   snow48,
    //   snow72,
    //   snowDepthBottom,
    //   snowDepthTop,
    //   snowYTD,
    //   surfacePrimary,
    //   surfaceSecondary,
    //   terrainOpen,
    //   trails,
    //   lastUpdated
    // };

    // this.updateDom(this.config.animationSpeed);
  }
});
