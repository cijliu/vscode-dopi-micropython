'''
Author: cijliu
Date: 2020-11-26 21:22:09
LastEditTime: 2020-12-01 10:36:59
'''
import tengine
id = tengine.OCR #目前支持OCR和FACE两个AI应用
models_path = "/root/app/models/crnn_lite_dense.tmfile"
keys_path = "/root/app/models/keys.txt"
input_type = tengine.IMAGE
tengine.load(models_path, id, input_type)#加载模型文件，指定输入数据为图片
res = tengine.detect("/root/app/res/ocr.jpg", keys_path)
print(res)