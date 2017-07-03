"use strict";
var TK = (function () {
    function TK(Data) {
        this.Find = "undefined|NaN|;";
        this.Data = Data.split(',');
        this.Other = null;
        this.ID = null;
        this.Lati = null;
        this.Long = null;
        this.Speed = null;
        this.Course = null;
        this.Signal = false;
        this.Fuel = null;
        this.Door = null;
        for (var i = 0; i < this.Data.length; i++) {
            this.Data[i] = this.Data[i].length == 0 ? "0" : this.Data[i];
        }
    }
    TK.prototype.Calculate = function (coord, type) {
        var integerPart = ~~(Math.round(coord) / 100);
        var decimalPart = (coord - (integerPart * 100)) / 60;
        var re = Number((integerPart + decimalPart).toFixed(7));
        re *= "SW".indexOf(type) > -1 ? -1 : 1;
        return re;
    };
    TK.prototype.Status = function () {
        return this.Data.length < 13 ? false : true;
    };
    TK.prototype.onlyNumbers = function (Data) {
        if (Data === void 0) { Data = "0"; }
        var re = Data.replace(/[^\d.-]/g, '');
        return re;
    };
    TK.prototype.getSignal = function () {
        this.Signal = this.Data[4] == "F" ? true : false;
        return this.Signal;
    };
    TK.prototype.getId = function () {
        this.ID = this.onlyNumbers(this.Data[0]).toString();
        return this.ID;
    };
    TK.prototype.getOther = function () {
        this.Other = this.Data[1];
        return this.Other;
    };
    TK.prototype.getCourse = function () {
        this.Course = Number(this.onlyNumbers(this.Data[12]));
        return this.Course;
    };
    TK.prototype.getSpeed = function () {
        this.Speed = Number(this.Data[11]) * 1.60934;
        this.Speed = Number(this.Speed.toFixed(2));
        return this.Speed;
    };
    TK.prototype.getCoords = function () {
        this.Lati = this.Calculate(Number(this.Data[7]), this.Data[8]);
        this.Long = this.Calculate(Number(this.Data[9]), this.Data[10]);
        this.Alti = this.Find.indexOf(this.Data[13]) > -1 ? 0 : Number(this.Data[13]);
        return [this.Lati, this.Long, this.Alti];
    };
    TK.prototype.getFuel = function () {
        if (this.Data.length < 16) {
            this.Fuel = 0;
        }
        else {
            this.Fuel = this.Find.indexOf(this.Data[16]) > -1 ? 0 : Number(this.onlyNumbers(this.Data[16]));
        }
        return this.Fuel;
    };
    TK.prototype.getDoor = function () {
        if (this.Data.length < 15) {
            this.Door = 0;
        }
        else {
            this.Door = this.Find.indexOf(this.Data[15]) > -1 ? 0 : Number(this.Data[15]);
        }
        return this.Door;
    };
    return TK;
}());
module.exports = TK;
