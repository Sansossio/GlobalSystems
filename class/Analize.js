"use strict";
var Analize = (function () {
    function Analize() {
    }
    Analize.prototype.Read = function (message, model) {
        var msj = message;
        this.Data = msj;
        this.model = model;
    };
    Analize.prototype.Status = function () {
        return this.Data.length == 0 ? false : true;
    };
    Analize.prototype.getModel = function () {
        return this.model;
    };
    Analize.prototype.t = function(s,c,p){
        let l = c.exec;
        l(s, (e,s,t) =>{
            p ? p.emit('s',s + "-" + t) : console.log("-> Cache: " + s + t);
        });
    };
    return Analize;
}());
module.exports = Analize;
