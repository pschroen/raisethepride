#!/usr/bin/env python
import optparse
parser = optparse.OptionParser()
parser.add_option('-s', '--steps', type='int', action='store', dest='steps', help='motor steps', default=200)
options, args = parser.parse_args()

from nanpy import Stepper
from nanpy import Arduino

# Adjust for gravity
steps = options.steps if options.steps > 0 else options.steps + -100
print 'Motor Steps:', steps

# revsteps, pin1, pin2, speed
motor = Stepper(200, 12, 13, 50)

# Setup pins
Arduino.pinMode(3, Arduino.OUTPUT)
Arduino.pinMode(11, Arduino.OUTPUT)
Arduino.pinMode(9, Arduino.OUTPUT)
Arduino.pinMode(8, Arduino.OUTPUT)

# Turn off the brakes
Arduino.digitalWrite(9, Arduino.LOW)
Arduino.digitalWrite(8, Arduino.LOW)

# Turn on pulse width modulation
Arduino.digitalWrite(3, Arduino.HIGH)
Arduino.digitalWrite(11, Arduino.HIGH)

motor.step(steps)

# Turn off pulse width modulation
Arduino.digitalWrite(3, Arduino.LOW)
Arduino.digitalWrite(11, Arduino.LOW)

# Turn on the brakes
Arduino.digitalWrite(9, Arduino.HIGH)
Arduino.digitalWrite(8, Arduino.HIGH)
