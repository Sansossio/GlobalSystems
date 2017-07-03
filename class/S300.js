"use strict";
var S300 = (function () {
    function S300(Data) {
        this.Find = "undefined|NaN|;";
        this.Data = Data.split(';');
        this.Other = null;
        this.ID = null;
        this.Lati = null;
        this.Long = null;
        this.Speed = null;
        this.Course = null;
        this.Signal = false;
        this.Fuel = null;
        this.Door = null;
    }
    S300.prototype.Calculate = function (coord, type) {
        var integerPart = ~~(Math.round(coord) / 100);
        var decimalPart = (coord - (integerPart * 100)) / 60;
        var re = Number((integerPart + decimalPart).toFixed(7));
        re *= "SW".indexOf(type) > -1 ? -1 : 1;
        return re;
    };
    S300.prototype.Status = function () {
        return this.Data.length < 9 ? false : true;
    };
    S300.prototype.onlyNumbers = function (Data) {
        if (Data === void 0) { Data = "0"; }
        var re = Data.replace(/[^\d.-]/g, '');
        return re;
    };
    S300.prototype.getSignal = function () {
        this.Signal = this.Data[12] == "1" ? true : false;
        return this.Signal;
    };
    S300.prototype.getId = function () {
        this.ID = this.onlyNumbers(this.Data[1]).toString();
        return this.ID;
    };
    S300.prototype.getOther = function () {
        this.Other = this.Data[15].substr(0, 1);
        var re = "tracker";
        switch (this.Other) {
            case "1":
                re = "acc on";
                break;
        }
        this.Other = re;
        return this.Other;
    };
    S300.prototype.getCourse = function () {
        this.Course = Number(this.Data[10]);
        return this.Course;
    };
    S300.prototype.getSpeed = function () {
        this.Speed = Number(this.Data[9]) * 1.60934;
        this.Speed = Number(this.Speed.toFixed(2));
        return this.Speed;
    };
    S300.prototype.getCoords = function () {
        this.Lati = Number(this.Data[7]);
        this.Long = Number(this.Data[8]);
        this.Alti = 0;
        return [this.Lati, this.Long, this.Alti];
    };
    S300.prototype.getFuel = function () {
        this.Fuel = 0;
        return this.Fuel;
    };
    S300.prototype.getDoor = function () {
        this.Door = 0;
        return this.Door;
    };
    return S300;
}());
module.exports = S300;
