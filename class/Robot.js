"use strict";
var Robot = (function () {
    function Robot(Data) {
        this.Data = Data.split(',');
        this.Other = null;
        this.Signal = true;
        this.ID = null;
        this.Lati = null;
        this.Long = null;
        this.Alti = null;
        this.Door = null;
        this.Speed = null;
        this.Course = null;
        this.Fuel = null;
    }
    Robot.prototype.Status = function () {
        return this.Signal;
    };
    Robot.prototype.Calculate = function (coord, type) {
        return 0;
    };
    Robot.prototype.getId = function () {
        this.ID = this.Data[0];
        return this.ID;
    };
    Robot.prototype.getSignal = function () {
        return this.Signal;
    };
    Robot.prototype.getCoords = function () {
        return [Number(this.Data[1]), Number(this.Data[2]), 0];
    };
    Robot.prototype.getSpeed = function () {
        this.Speed = Number(this.Data[4]);
        return this.Speed;
    };
    Robot.prototype.getFuel = function () {
        this.Fuel = 100;
        return this.Fuel;
    };
    Robot.prototype.getDoor = function () {
        this.Door = 0;
        return this.Door;
    };
    Robot.prototype.getOther = function () {
        this.Other = this.Data[5];
        return this.Other;
    };
    Robot.prototype.getCourse = function () {
        this.Course = Number(this.Data[3]);
        return this.Course;
    };
    return Robot;
}());
module.exports = Robot;
