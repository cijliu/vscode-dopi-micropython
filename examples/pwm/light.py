'''
Author: cijliu
Date: 2020-11-28 15:05:12
LastEditTime: 2020-11-28 15:22:27
'''
import pwm
import time
light = 0
diff = 10
while True:
    pwm.load(1000,light)
    if light == 100:
        diff = -10
    if light == 0:
        diff = 10
    light += diff
    time.sleep_ms(50)
    