"use strict";
var Commands = (function () {
    function Commands() {
    }
    Commands.prototype.Data = function (Command, id) {
        this.Command = Command;
        this.id = id;
    };
    Commands.prototype.Status = function () {
        return !this.Command ? false : true;
    };
    Commands.prototype.getCommand = function () {
        return this.Command.replace('%1%', this.id);
    };
    return Commands;
}());
module.exports = Commands;
