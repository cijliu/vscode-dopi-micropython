'''
Author: cijliu
Date: 2020-11-23 10:14:35
LastEditTime: 2020-12-01 09:49:17
'''
import sensor
id = sensor.id.IMX307
fmt = sensor.fmt.QVGA
sensor.init(id, fmt)
ret, size, data = sensor.yuv420()
f = open("/root/app/res/image.yuv", "wb+")
f.write(data)
f.close()
sensor.destroy()