var request = require('request-promise');

var Service, Characteristic;

function SmartThingsAccessory(log, name, commands, service, characteristic) {
  Service = service;
  Characteristic = characteristic;

  // device info
  this.name = name;
  this.commands = commands;
  this.log = log;
}

SmartThingsAccessory.prototype.getCommandName = function(characteristic, value) {
  switch(characteristic) {
    case Characteristic.On:
      return value ? 'on' : 'off';
  }
};

SmartThingsAccessory.prototype.command = function(characteristic, value) {
  var self = this;

  var c = this.getCommandName(characteristic, value);
  var url = this.commands[c];

  this.log(this.name + ' sending command ' + c + ' based on value ' value);

  request.put({
    url: url
  }).then(function(response) {
    self.log(self.name + ' sent command ' + c);
  }).catch(function(err) {
    self.log('There was a problem sending command ' + c + ' to ' + self.name);
  });
};

SmartThingsAccessory.prototype.getServices = function() {
  var switchService = new Service.Switch(this.name);

  switchService
    .getCharacteristic(Characteristic.On)
    .on('set', this.command.bind(this, Characteristic.On));

  return [switchService];
};

module.exports = SmartThingsAccessory;