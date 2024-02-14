const mongoose = require('mongoose');

const newDeviceSchema = new mongoose.Schema({
    uniqueid:String,
    ip:String,
    port:Number,
    os:String,
    name:String,
    date:Number,
    lastTime:Number
});

const newDevice = mongoose.model('devices',newDeviceSchema);
module.exports = newDevice;