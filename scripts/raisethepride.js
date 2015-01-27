/**
 * Headless #RaiseThePride.
 *
 * @author   Patrick Schroen <ps@ufotechnologies.com>
 * @license  MIT Licensed
 */

/*jshint
 strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true,
 loopfunc:true, shadow:true, node:true, indent:4
*/

var utils = require(shell.path+'/modules/utils'),
    Script = utils.Script(module.id, "#RaiseThePride");

var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    flag = null;

/**
 * Initialize.
 *
 * @param    {Probe} probe Instance
 * @param    {undefined|initCallback} [callback]
 */
function init(probe, callback) {
    "use strict";
    app.use(express.static(shell.join(__dirname, 'public')));
    app.route('/').post(function (req, res) {
        if (req.headers.host.split(':')[0] === '127.0.0.1') {
            var body = '';
            req.on('data', function (data) {
                body += data;
            });
            req.on('end', function () {
                flag = JSON.parse(body);
                io.emit('flag', flag);
            });
            res.send('Post received');
        }
    });
    server.listen(shell.express.port);
    io.on('connection', function (socket) {
        if (flag) socket.emit('flag', flag);
    });
    var message = exports.name+" server listening on port "+shell.express.port;
    console.log(message);
    probe.log("["+exports.id+"] "+message);
    probe.next("["+exports.id+"] Forking");
    if (callback) callback();
}
Script.prototype.init = init;

module.exports = exports = new Script();
