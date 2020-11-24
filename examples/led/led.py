'''
Author: cijliu
Date: 2020-11-28 10:12:00
LastEditTime: 2020-11-28 14:40:45
'''
import led
import time
while True:
    led.on()
    time.sleep_ms(500)
    led.off()
    time.sleep_ms(500)
