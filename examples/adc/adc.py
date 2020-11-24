'''
Author: cijliu
Date: 2020-11-28 10:12:00
LastEditTime: 2020-11-28 15:22:40
'''
import adc 
while True:
    val = adc.get()
    if val > 0 and val < 1000:#过滤掉启动和无按键被按下时的值，为了更精确可以增加判断次数来确定按键
        break
print("adc:",val)