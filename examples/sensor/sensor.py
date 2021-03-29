'''
Author: cijliu
Date: 2020-11-23 10:14:35
LastEditTime: 2020-12-01 09:49:17
'''
import sensor
import time
id = sensor.id.IMX307
fmt = sensor.fmt.QVGA
sensor.init(id, fmt)
sensor.preview() #打开预览
i=100 # 执行10秒，每秒10帧
while i>0:
    i =i-1
    ret, size, data = sensor.yuv420()
    time.sleep_ms(100)
# f = open("/root/app/res/image.yuv", "wb+")
# f.write(data)
# f.close()
sensor.destroy()