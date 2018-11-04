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

  start: function() {
    var self = this;
    var dataRequest = null;
    var dataNotification = null;

    //Flag for check if module is loaded
    this.loaded = false;

    // Schedule update timer.
    this.getData();
    setInterval(function() {
      self.updateDom();
    }, this.config.updateInterval);
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
  scheduleUpdate: function(delay) {
    var nextLoad = this.config.updateInterval;
    if (typeof delay !== "undefined" && delay >= 0) {
      nextLoad = delay;
    }
    nextLoad = nextLoad;
    var self = this;
    setTimeout(function() {
      self.getData();
    }, nextLoad);
  },

  getDom: function() {
    var self = this;

    // create element wrapper for show into the module
    var wrapper = document.createElement("div");
    // If this.dataRequest is not empty
    if (this.dataRequest) {
      var lastupdated = document.createElement("div");
      lastupdated.innerHTML = this.dataRequest.lastupdated;
      wrapper.style.fontSize = "16px";

      var labelDataRequest = document.createElement("label");
      // Use translate function
      //             this id defined in translations files
      labelDataRequest.innerHTML =
        "New storm total:" + this.dataRequest.newstormtotal + '"';

      wrapper.appendChild(labelDataRequest);
      wrapper.appendChild(lastupdated);
    }

    // Data from helper
    if (this.dataNotification) {
      var wrapperDataNotification = document.createElement("div");
      // translations  + datanotification
      wrapperDataNotification.innerHTML =
        this.translate("UPDATE") + ": " + this.dataNotification.date;

      wrapper.appendChild(wrapperDataNotification);
    }
    return wrapper;
  },

  getScripts: function() {
    return [];
  },

  getStyles: function() {
    return ["snowbowl.css"];
  },

  // Load translations files
  getTranslations: function() {
    //FIXME: This can be load a one file javascript definition
    return {
      en: "translations/en.json",
      es: "translations/es.json"
    };
  },

  processData: function(report) {
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

    this.dataRequest = reportObj;
    if (this.loaded === false) {
      this.updateDom(this.config.animationSpeed);
    }
    this.loaded = true;
  },

  // socketNotificationReceived from helper
  socketNotificationReceived: function(notification, payload) {
    if (notification === "snowbowl-GET_REPORT") {
      this.processData(payload);
    }
  }
});
