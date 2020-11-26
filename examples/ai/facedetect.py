'''
Author: cijliu
Date: 2020-11-26 21:22:03
LastEditTime: 2020-11-26 21:28:06
'''
import tengine
id = tengine.FACE
models_path = "/root/ai/models/retinaface.tmfile"
input_type = tengine.IMAGE
tengine.load(models_path, id, input_type)
res = tengine.detect("/root/ai/image.jpg")
print(res)
