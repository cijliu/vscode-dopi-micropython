'''
Author: cijliu
Date: 2020-11-28 10:12:00
LastEditTime: 2020-11-28 14:40:45
'''
import led
import adc
import time
import _thread as th
def adc_thread():
    while True:
        time.sleep_ms(100)          #线程每100毫秒检测一次按键是否被按下
        val = adc.get()
        if val > 0 and val < 1000:  #过滤掉启动和无按键被按下时的值
            led.on()                #有按键按下，我们让led亮
            print("val:",val)       #打印采集值
        else:
            led.off()
th.start_new_thread(adc_thread,())
while True:
    time.sleep_ms(1000)