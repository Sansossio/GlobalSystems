"use strict";
var TK1 = (function () {
    function TK1(Data) {
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
    TK1.prototype.Calculate = function (coord, type) {
        var integerPart = ~~(Math.round(coord) / 100);
        var decimalPart = (coord - (integerPart * 100)) / 60;
        var re = Number((integerPart + decimalPart).toFixed(7));
        re *= "SW".indexOf(type) > -1 ? -1 : 1;
        return re;
    };
    TK1.prototype.Status = function () {
        return this.Data.length < 13 ? false : true;
    };
    TK1.prototype.onlyNumbers = function (Data) {
        if (Data === void 0) { Data = "0"; }
        var re = Data.replace(/[^\d.-]/g, '');
        return re;
    };
    TK1.prototype.getSignal = function () {
        this.Signal = this.Data[4] == "F" ? true : false;
        return this.Signal;
    };
    TK1.prototype.getId = function () {
        this.ID = this.onlyNumbers(this.Data[0]).toString();
        return this.ID;
    };
    TK1.prototype.getOther = function () {
        this.Other = this.Data[1];
        return this.Other;
    };
    TK1.prototype.getCourse = function () {
        this.Course = Number(this.onlyNumbers(this.Data[12]));
        return this.Course;
    };
    TK1.prototype.getSpeed = function () {
        this.Speed = Number(this.Data[11]) * 1.60934;
        this.Speed = Number(this.Speed.toFixed(2));
        return this.Speed;
    };
    TK1.prototype.getCoords = function () {
        this.Lati = this.Calculate(Number(this.Data[7]), this.Data[8]);
        this.Long = this.Calculate(Number(this.Data[9]), this.Data[10]);
        this.Alti = this.Find.indexOf(this.Data[13]) > -1 ? 0 : Number(this.Data[13]);
        return [this.Lati, this.Long, this.Alti];
    };
    TK1.prototype.getFuel = function () {
        if (this.Data.length < 16) {
            this.Fuel = 0;
        }
        else {
            this.Fuel = this.Find.indexOf(this.Data[16]) > -1 ? 0 : Number(this.onlyNumbers(this.Data[16]));
        }
        return this.Fuel;
    };
    TK1.prototype.getDoor = function () {
        if (this.Data.length < 15) {
            this.Door = 0;
        }
        else {
            this.Door = this.Find.indexOf(this.Data[15]) > -1 ? 0 : Number(this.Data[15]);
        }
        return this.Door;
    };
    return TK1;
}());
module.exports = TK1;
