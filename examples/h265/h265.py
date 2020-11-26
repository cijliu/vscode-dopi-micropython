'''
Author: cijliu
Date: 2020-11-26 21:47:33
LastEditTime: 2020-11-26 21:48:30
'''
import VideoEncoder as venc 
#打开YUV测试文件，像素为320x240
f = open("/root/ai/hx.yuv", "rb+")
yuv = f.read()
f.close()

#初始化编码器
venc.create(venc.type.H265, venc.fmt.QVGA)
ret, size, data = venc.send(yuv)
if ret:
    #保存
    img = open("/root/image.h265", "wb+")
    img.write(data)
    img.close()
    print("image save successful.")
    
venc.destroy()