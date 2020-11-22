import sensor
id = sensor.id.IMX307
fmt = sensor.fmt.QVGA
sensor.init(id, fmt)
ret, size, data = sensor.yuv420()
f = open("./image.yuv", "wb+")
f.write(data)
f.close()
sensor.destroy()