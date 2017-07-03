"use strict";
var meitrack = (function () {
    function meitrack(Data) {
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
        this.Door = 0;
    }
    meitrack.prototype.convertHexa = function (num) {
        var re = parseInt(num, 16).toString(10);
        return Number(re);
    };
    meitrack.prototype.Calculate = function (coord, type) {
        var integerPart = ~~(Math.round(coord) / 100);
        var decimalPart = (coord - (integerPart * 100)) / 60;
        var re = Number((integerPart + decimalPart).toFixed(7));
        re *= "SW".indexOf(type) > -1 ? -1 : 1;
        return re;
    };
    meitrack.prototype.Status = function () {
        return this.Data.length < 13 || this.Data[2] != "AAA" ? false : true;
    };
    meitrack.prototype.onlyNumbers = function (Data) {
        if (Data === void 0) { Data = "0"; }
        var re = Data.replace(/[^\d.-]/g, '');
        return re;
    };
    meitrack.prototype.getSignal = function () {
        this.Signal = this.Data[7] == "A" ? true : false;
        return this.Signal;
    };
    meitrack.prototype.getId = function () {
        this.ID = this.onlyNumbers(this.Data[1]).toString();
        return this.ID;
    };
    meitrack.prototype.getOther = function () {
        var tmp = "tracker";
        this.Other = this.Data[3];
        switch (Number(this.Other)) {
            case 1:
                tmp = "help me";
                break;
            case 2, 3, 4:
                tmp = "acc on";
                break;
            case 10, 11, 12:
                tmp = "acc off";
                break;
            case 17:
                tmp = "low battery";
                break;
            case 18:
                tmp = "power alarm";
                break;
            case 19:
                tmp = "speed";
                break;
            case 35:
                tmp = "tracker";
                break;
        }
        this.Other = tmp;
        return this.Other;
    };
    meitrack.prototype.getCourse = function () {
        this.Course = Number(this.Data[11]) > 359 ? 0 : Number(this.Data[11]);
        return this.Course;
    };
    meitrack.prototype.getSpeed = function () {
        this.Speed = Number(this.Data[10]);
        return this.Speed;
    };
    meitrack.prototype.getCoords = function () {
        this.Lati = Number(this.Data[4]);
        this.Long = Number(this.Data[5]);
        this.Alti = this.Find.indexOf(this.Data[13]) > -1 ? 0 : Number(this.Data[13]);
        return [this.Lati, this.Long, this.Alti];
    };
    meitrack.prototype.getFuel = function () {
        if (this.Data.length < 22 || this.Data[22].indexOf("0000") > -1) {
            this.Fuel = 0;
        }
        else {
            var tm = this.Data[22].replace('*', '');
            try {
                this.Fuel = this.convertHexa(tm.substr(0, 2)) + (this.convertHexa(tm.substr(2, 4)) / 100);
            }
            catch (err) {
                this.Fuel = 0;
                console.log(err);
            }
        }
        return this.Fuel;
    };
    meitrack.prototype.getDoor = function () {
        this.Door = this.getOther() == "acc on" ? 1 : 0;
        return this.Door;
    };
    return meitrack;
}());
module.exports = meitrack;
