var request = require('request-promise');

var Service, Characteristic;

function SmartThingsAccessory(log, name, commands, state, service, characteristic) {
  Service = service;
  Characteristic = characteristic;

  // device info
  this.name = name;
  this.commands = commands;
  this.state = state;
  this.log = log;
}

SmartThingsAccessory.prototype.getCommandName = function(characteristic, value) {
  switch(characteristic) {
    case Characteristic.On:
      return value ? 'on' : 'off';
  }
};

SmartThingsAccessory.prototype.command = function(characteristic, callback) {
  var self = this;

  var c = this.getCommandName(characteristic, value);
  var url = this.commands[c];

  this.log(this.name + ' sending command ' + c + ' based on value ' + value);

  request.put({
    url: url
  }).then(function(response) {
    self.log(self.name + ' sent command ' + c);
    callback(null);
  }).catch(function(err) {
    callback(err);
    self.log('There was a problem sending command ' + c + ' to ' + self.name);
  });
};

SmartThingsAccessory.prototype.getState = function(callback) {
  var self = this;

  var url = this.state;

  this.log(this.name + ' getting state ' + url);

  request(url).then(function(response) {
    callback(null, response == '"on"');
    self.log(self.name + ' got state of ' + response);
  }).catch(function(err) {
    self.log('There was a problem getting state for ' + self.name);
    self.log(err);
  });
};

SmartThingsAccessory.prototype.getServices = function() {
  var switchService = new Service.Switch(this.name);

  switchService
    .getCharacteristic(Characteristic.On)
    .on('get', this.getState.bind(this))
    .on('set', this.command.bind(this, Characteristic.On));

  return [switchService];
};

module.exports = SmartThingsAccessory;