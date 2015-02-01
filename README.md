# #RaiseThePride

The most common question we get on this project is how the positive/negative sentiment works, long story short, we tested out various sentiment analysis engines/APIs and found that (not only are they super expensive and over-complicated), that using a simple keyword matching technique worked just as well if not better.

You can see how it works by reviewing the code but there are two short keyword lists for positive and negative respectively, we selected keywords that are commonly used in situations that are definitely positive or negative, eliminating the grey-area keywords that could cause false-positives.

As a final scrub on positive matches we make sure none of the negative keywords are in the positive match, keeping the positive tweets clean.


## Technology

This project is built with today's common off-the-shelf [Maker](https://en.wikipedia.org/wiki/Maker_culture) components, though there are quite a few technologies going-on here so this project makes a great example of marrying them all together.

### Hardware

* [Raspberry Pi](http://www.raspberrypi.org/)
* [Arduino](http://www.arduino.cc/)
* [Arduino Motor Shield](http://arduino.cc/en/Main/ArduinoMotorShieldR3)
* [Stepper Motor](https://www.creatroninc.com/product/unipolarbipolar-stepper-motor-125ozin-200-stepsrev/)
* Additional power supply for the motor
* USB B-A cable to connect the Pi and Arduino
* Enclosure of your choosing (I retro-fitted an old Rogers cable box)
* Wheel assembly
* Heatsinks
* Blower fan

### Software

* [PiHead](https://github.com/pschroen/headless/wiki/PiHead) ([Raspbian](http://www.raspberrypi.org/downloads/) with [Node.js](http://nodejs.org/), [PhantomJS](http://phantomjs.org/) and the [Headless](https://headless.io/) framework)
* [Nanpy](http://nanpy.github.io/) - [v0.8](https://pypi.python.org/pypi/nanpy/0.8)
* [Python script](https://github.com/pschroen/raisethepride/blob/master/scripts/pflag.py) to move the motor
* [Headless script](https://github.com/pschroen/raisethepride/blob/master/scripts/pflag.js) as the controller
* [ntwitter](https://github.com/AvianFlu/ntwitter) for the Twitter stream
* [Express](http://expressjs.com/) framework for the website
* [Socket.IO](http://socket.io/) framework to broadcast a `flag` object

```js
/**
 * Flag object.
 *
 * @typedef Flag
 * @type {Object}
 * @property {number} position Stepper motor position
 * @property {Object} tweet Twitter's tweet object
 * @property {string} sentiment 'positive' or 'negative'
 */
{
    position: pos,
    tweet: data,
    sentiment: sentiment
}
```


## Installation

Download the [PiHead image](https://headless.io/), and follow the [Raspberry Pi Documentation](http://www.raspberrypi.org/documentation/installation/installing-images/README.md) image installation guides.

Or if you already have a system image you want to use you can follow the [PiHead](https://github.com/pschroen/headless/wiki/PiHead) steps.

Visit [https://headless.io/setup/](https://headless.io/setup/) with [Chrome](http://www.google.com/chrome/), and with your RPi running you should get `raspberrypi` on the setup page after a minute or so if you're booting for the first time. Create your user, and visit your login page to test-out Headless.

Use the IP address from your login page to SSH into your RPi (password is `raspberry`).

```sh
ssh pi@<ip address>
```

`1 Expand Filesystem`, and `16` MB memory split (under `8 Advanced Options` > `A3 Memory Split`) for the GPU.

```sh
sudo raspi-config
sudo reboot
```

Log back into your RPi, update and upgrade.

```sh
sudo apt-get update
sudo apt-get -y upgrade
sudo rpi-update
sudo reboot
```

Log back into your RPi and continue.

```sh
sudo apt-get -y install arduino
wget https://pypi.python.org/packages/2.7/s/setuptools/setuptools-0.6c11-py2.7.egg#md5=fe1f997bc722265116870bc7919059ea
sudo sh setuptools-0.6c11-py2.7.egg
wget https://pypi.python.org/packages/source/p/pyserial/pyserial-2.7.tar.gz#md5=794506184df83ef2290de0d18803dd11
tar xvzf pyserial-2.7.tar.gz
cd pyserial-2.7
sudo python setup.py install
cd ..
wget https://pypi.python.org/packages/source/n/nanpy/nanpy-v0.8.tar.gz
tar xvzf nanpy-v0.8.tar.gz
cd nanpy-0.8
sudo python setup.py install
cd firmware
export BOARD=uno
make
make upload
cd ../..
rm setuptools-0.6c11-py2.7.egg
sudo rm -Rf pyserial*
sudo rm -Rf nanpy*
```

Install the scripts.

```sh
cd headless-stable/users
ls -l
cd <user>
wget https://github.com/pschroen/raisethepride/archive/master.tar.gz
tar xvzf master.tar.gz --overwrite --strip=1
rm master.tar.gz
cd scripts
chmod +x pflag.py
```

Test-out the motor.

```sh
./pflag.py --steps 200
./pflag.py --steps -200
./pflag.py --steps 2000
./pflag.py --steps -2000
```

Install `express`, `socket.io` and `ntwitter`.

```sh
cd ../../..
npm install express
npm install socket.io
npm install ntwitter
```

Return to your login page, before running the scripts you'll need to specify your `express` and `ntwitter` configuration, add the following to your *Ghost* or *Shell* config. Private keys for Twitter can be obtained from your [Twitter Apps](https://apps.twitter.com/).

```json
...
    "express": {
        "port": 3000
    },
    "twitter": {
        "consumer_key": "<consumer key>",
        "consumer_secret": "<consumer secret>",
        "access_token_key": "<access token key>",
        "access_token_secret": "<access token secret>"
    }
...
```

Run the script named `raisethepride` from your *Scripts* *List*. Visit `http://<ip address>:3000/` and you should see the #RaiseThePride website running, but without tweets.

Next run the script named `pflag`. If all works well you should see *Log* output for the flag `Position`, `Total tweets`, `Positive/Negative split` and a JSON string of the matched tweet.

Return to `http://<ip address>:3000/` and you should now see the tweets from your device.
