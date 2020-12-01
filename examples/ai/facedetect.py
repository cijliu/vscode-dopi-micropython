'''
Author: cijliu
Date: 2020-11-26 21:22:03
LastEditTime: 2020-12-01 09:48:08
'''
import tengine
id = tengine.FACE
models_path = "/root/app/models/retinaface.tmfile"
input_type = tengine.IMAGE
tengine.load(models_path, id, input_type)
res = tengine.detect("/root/app/res/image.jpg")
print(res)
