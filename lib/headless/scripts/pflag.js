/**
 * Headless PFLAG.
 *
 * @author   Patrick Schroen / https://github.com/pschroen
 * @license  MIT Licensed
 */

/* jshint strict:true, eqeqeq:true, newcap:false, multistr:true, expr:true, loopfunc:true, shadow:true, node:true, indent:4 */
/* globals shell */
"use strict";

var utils = require(shell.path+'/modules/utils'),
    Script = utils.Script(module.id, "PFLAG");

var twit = new (require('twit'))(shell.twitter),
    twitstream = null,
    positive = [
        '#worldpride',
        '#wp14to',
        '#raisethepride',
        'toronto pflag',
        'pflag',
        'gay pride',
        'gaypride',
        'rainbow flag',
        'rainbowflag',
        'prideto',
        'equal rights',
        '"all love is equal"',
        'lgbt',
        'lgbtq',
        'pridesupporter',
        'prideflag',
        'proud gay',
        'proud lesbian',
        'gay positive',
        'gay marriage',
        'two spirited',
        'canqueer'
    ],
    negative = [
        'faggot',
        'faggots',
        'fag',
        'fags',
        'fgt',
        'fggt',
        'homo',
        'homos',
        'lesbo',
        'lesbos',
        'so gay',
        'rug muncher',
        'rug munchers',
        'carpet muncher',
        'carpet munchers',
        'muff diver',
        'muff divers',
        'cock sucker',
        'cock suckers',
        'pillow biter',
        'pillow biters',
        'hate homosexual',
        'hate homosexuals',
        'fuck homosexual',
        'fuck homosexuals',
        'hate gay',
        'hate gays',
        'fuck gay',
        'fuck gays',
        'hate lesbian',
        'hate lesbians',
        'fuck lesbian',
        'fuck lesbians',
        'hate equal rights',
        'fuck equal rights',
        'hate pride',
        'fuck pride',
        'hate lgbt',
        'fuck lgbt',
        'hate lgbtq',
        'fuck lgbtq',
        'hate transgender',
        'hate transgenders',
        'fuck transgender',
        'fuck transgenders',
        'hate bisexual',
        'hate bisexuals',
        'fuck bisexual',
        'fuck bisexuals',
        'hate two spirited',
        'fuck two spirited',
        'hate gay women',
        'fuck gay women',
        'hate gay men',
        'fuck gay men',
        'hate gay marriage',
        'fuck gay marriage'
    ],
    positivecount = null,
    negativecount = null,
    total = null,
    motor = __dirname+'/pflag.py --steps ',
    moving = false,
    pos = 0,
    bottom = 1200,
    raisethepride = null,
    raise = null;

/**
 * Initialize.
 *
 * @param    {Probe} probe Instance
 * @param    {undefined|initCallback} [callback]
 */
function init(probe, callback) {
    if (twitstream) {
        twitstream.destroy();
        twitstream = null;
    }
    positivecount = 0;
    negativecount = 0;
    total = 0;
    twitstream = twit.stream('statuses/filter', {track:positive.join(',')+','+negative.join(','), locations:'-79.639219,43.5810846,-79.1161932,43.8554579'});
    twitstream.on('tweet', function (data) {
        if (data.text.toLowerCase().match('#raisethepride')) {
            raisethepride = data;
            positivecount++;
            top(probe, positive[0], data);
        }
        if (raisethepride && !moving && pos > 0) {
            move(probe, 0, raisethepride, 'positive');
            raisethepride = null;
        }
        for (var i = 0; i < positive.length; i++) {
            var skip = false;
            for (var j = 0; j < negative.length; j++) if (data.text.toLowerCase().match(new RegExp('\\b'+negative[j]+'\\b'))) skip = true;
            if (data.text.toLowerCase().match(new RegExp('\\b'+positive[i]+'\\b')) && !skip) {
                raise = data;
                positivecount++;
                top(probe, positive[i], data);
            }
        }
        if (raise && !moving && pos > 0) {
            move(probe, pos-400 < 0 ? 0 : pos-400, raise, 'positive');
            raise = null;
        }
        for (var i = 0; i < negative.length; i++) {
            if (data.text.toLowerCase().match(new RegExp('\\b'+negative[i]+'\\b'))) {
                data.user.screen_name = (new Array(data.user.screen_name.length+1).join('*'))+data.user.screen_name.substring(data.user.screen_name.length-3, data.user.screen_name.length);
                data.user.name = (new Array(data.user.name.length+1).join('*'))+data.user.name.substring(data.user.name.length-3, data.user.name.length);
                negativecount++;
                top(probe, negative[i], data);
                if (!moving && pos < bottom) {
                    move(probe, pos+800 > bottom ? bottom : pos+800, data, 'negative');
                }
            }
        }
    });
    twitstream.on('disconnect', function (response) {
        reconnect(probe);
    });
    if (callback) callback();
}
Script.prototype.init = init;

/**
 * Move helper.
 *
 * @param    {Probe} probe Instance
 * @param    {number} newpos Stepper motor position
 * @param    {Object} data Twitter's tweet object
 * @param    {string} sentiment 'positive' or 'negative'
 */
function move(probe, newpos, data, sentiment) {
    moving = true;
    var steps = newpos-pos;
    pos = newpos;
    probe.log('Moving flag '+(steps < 0 ? steps*-1 : steps)+' steps '+(steps < 0 ? 'up' : 'down'));
    probe.exec({command:motor+steps}, function (error, args) {});
    var url = 'http://127.0.0.1:'+shell.express.port+'/',
        flag = JSON.stringify({position:pos, tweet:data, sentiment:sentiment});
    probe.log('Posting to '+url+', '+flag);
    probe.post({url:url, form:flag}, function (error, args) {});
    shell.setTimeout(function () {
        moving = false;
        probe.log('Done moving flag');
    }, ((steps < 0 ? steps*-1 : steps)/15)*1000); // 15 steps per second
}
Script.prototype.move = move;

/**
 * Log helper.
 *
 * @param    {Probe} probe Instance
 * @param    {string} match Keyword
 * @param    {Object} data Twitter's tweet object
 */
function top(probe, match, data) {
    total = positivecount+negativecount;
    probe.log('Position: '+pos+', Total tweets: '+total+', Positive/Negative split: '+Math.round((positivecount/total)*100)+'/'+Math.round((negativecount/total)*100)+', '+match+', '+JSON.stringify(data));
}
Script.prototype.top = top;

/**
 * Reconnect helper.
 *
 * @param    {Probe} probe Instance
 */
function reconnect(probe) {
    var message = 'Disconnected from Twitter, reconnecting in 20 seconds';
    console.log(message);
    probe.log(message);
    shell.setTimeout(function () {
        init(probe);
    }, 20000);
}
Script.prototype.reconnect = reconnect;

module.exports = exports = new Script();
