'''
Author: cijliu
Date: 2020-11-26 22:08:19
LastEditTime: 2020-11-27 14:00:11
'''
import venc
#打开YUV测试文件，像素为320x240
f = open("/root/app/res/image.yuv", "rb+")
yuv = f.read()
f.close()

#初始化编码器
venc.create(venc.type.MJPEG, venc.fmt.QVGA)
ret, size, data = venc.send(yuv)
if ret:
    #保存
    img = open("/root/app/res/image.jpg", "wb+")
    img.write(data)
    img.close()
    print("image save successful.")
    
venc.destroy()