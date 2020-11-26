'''
Author: cijliu
Date: 2020-11-26 21:47:28
LastEditTime: 2020-11-26 21:56:40
'''
import VideoEncoder as venc 
#打开YUV测试文件，像素为320x240
f = open("/root/ai/hx.yuv", "rb+")
yuv = f.read()
f.close()

#初始化编码器
venc.create(venc.type.H264, venc.fmt.QVGA)
i=0
while i<10:
    ret, size, data = venc.send(yuv)
    print("size:",size)
    i=i+1

# if ret:
#     #保存
#     img = open("/root/image.h264", "wb+")
#     img.write(data)
#     img.close()
#     print("image save successful.")

venc.destroy()