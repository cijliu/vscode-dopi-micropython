'''
Author: cijliu
Date: 2020-11-26 23:06:31
LastEditTime: 2020-11-26 23:16:36
'''
import rtsp
import time

def find_nal(data, size):
    nals = data.split(b'\x00\x00\x00\x01')
    for i in range(len(nals)):
        nals[i] = b'\x00\x00\x00\x01' + nals[i]
    return nals[1:]

#打开事前准备的H264数据进行传输
f = open("/root/stream.h264","rb")
data = f.read()
size = len(data)
f.close()

#定义时间戳ts,每个nal包间隔40ms
ts = 0
tick = 40000
nals = find_nal(data,size)
rtsp.create(554, "/live.sdp")
while True:
    for i in range(len(nals)):
        rtsp.send_video(nals[i], len(nals[i]), ts)
        ts = ts + tick
	time.sleep_ms(10)#重复发送，发完后睡眠一段时间
	
rtsp.destroy()