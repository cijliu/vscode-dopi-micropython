'''
Author: cijliu
Date: 2020-11-16 17:38:30
LastEditTime: 2020-11-16 17:49:49
'''
import led
import time
while True:
    led.on()
    time.sleep_ms(500)
    led.off()
    time.sleep_ms(500)
