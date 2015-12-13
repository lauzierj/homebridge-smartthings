var request = require('request-promise'),
  _ = require('lodash'),
  SmartThingsAccessory = require('./smartThingsAccessory');

var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerPlatform("homebridge-smartthings", "SmartThings", SmartThingsPlatform);
};

function SmartThingsPlatform(log, config) {
  this.log = log;
  this.app_id = config["app_id"];
  this.access_token = config["access_token"];
}

SmartThingsPlatform.prototype.accessories = function(callback) {
  var self = this;

  this.log("Fetching SmartThings devices...");

  request.get({
    url: "https://graph.api.smartthings.com/api/smartapps/installations/"+this.app_id+"/devices?access_token="+this.access_token,
    json: true
  }).then(function(config) {
    var foundAccessories = _(config).pick([
      'switches',
      'hues'
    ]).values().flatten().map(function(acc) {
      return new SmartThingsAccessory(self.log, acc.name, acc.commands, Service, Characteristic);
    }).run();

    callback(foundAccessories);
  }).catch(function(err) {
    self.log(err);
  });
};