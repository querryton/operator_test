import re
import math
import json
import base64
import numpy as np
from io import BytesIO
from PIL import Image
from tensorflow import keras

from flaskr.models.test_system import Dataset, Data


# Convert Base64 String to PIL.Image
def base64_to_image(base64_str, image_path=None):
    base64_data = re.sub('^data:image/.+;base64,', '', base64_str)
    byte_data = base64.b64decode(base64_data)
    image_data = BytesIO(byte_data)
    img = Image.open(image_data)
    if image_path:
        img.save(image_path)
    return img


# Convert PIL.Image to Base64 String
def image_to_base64(img):
    output_buffer = BytesIO()
    img.save(output_buffer, format='JPEG')
    byte_data = output_buffer.getvalue()
    base64_str = base64.b64encode(byte_data)
    return "data:image/jpeg;base64," + str(base64_str, 'utf-8')


def d1_channel_first_to_base64(data_array, channels, cols, rols):
    '''
    将一维格式[channels*cols*rols]的数据，转换成图片
    :param data: [channels*cols*rols] - ndarray
    :param channels: int
    :param cols: int
    :param rols: int
    :return: img
    '''
    mode = None
    if channels == 1:
        mode = "L"
        data_array = np.reshape(data_array, (cols, rols))
    else:
        data_array = np.reshape(data_array, (channels, cols, rols))
        data_array = data_array.transpose(1, 2, 0)

    img = Image.fromarray(data_array, mode=mode)
    data_base64 = image_to_base64(img)
    return data_base64


def data_to_base64(id):
    data_obj = Data.query.get(id)
    dataset_obj = Dataset.query.get(data_obj.dsid)
    if dataset_obj.name == "CIFAR-10":
        data_base64 = d1_channel_first_to_base64(data_obj.data, 3, 32, 32)
        return data_base64
    if dataset_obj.name == "MNIST":
        data_base64 = d1_channel_first_to_base64(data_obj.data, 1, 28, 28)
        return data_base64


def retrieve_page(dataset_name, field_name, keywords, page_index, page_size):
    dataset_obj = Dataset.query.filter_by(name=dataset_name).first()
    if field_name == "filename":
        datas_obj = Data.query.filter(
            Data.dsid == dataset_obj.id,
            Data.filename.like('%' + keywords + '%')
        ).limit(page_size).offset((page_index - 1) * page_size)
        total = Data.query.filter(
            Data.dsid == dataset_obj.id,
            Data.filename.like('%' + keywords + '%')
        ).count()
    elif field_name == "labelDescription":
        datas_obj = Data.query.filter(
            Data.dsid == dataset_obj.id,
            Data.label_description.like('%' + keywords + '%')
        ).limit(page_size).offset((page_index - 1) * page_size)

        total = Data.query.filter(
            Data.dsid == dataset_obj.id,
            Data.label_description.like('%' + keywords + '%')
        ).count()

    total_pages = math.ceil(total / page_size)

    for data_obj in datas_obj:
        data_obj.data = data_obj.data.tolist()
    datas = [data_obj.serialize() for data_obj in datas_obj]

    return {
        'datas': datas,
        'total_pages': total_pages
    }


def get_page(dataset_name, page_index, page_size):
    dataset_obj = Dataset.query.filter_by(name=dataset_name).first()
    if dataset_obj is None:
        return {
            "datas": [],
            "total_pages": 0
        }

    datas_obj = Data.query.filter_by(dsid=dataset_obj.id).limit(page_size).offset((page_index - 1) * page_size)
    for data_obj in datas_obj:
        data_obj.data = data_obj.data.tolist()
    datas = [data_obj.serialize() for data_obj in datas_obj]

    total = Data.query.filter_by(dsid=dataset_obj.id).count()
    total_pages = math.ceil(total / page_size)

    return {
        "datas": datas,
        "total_pages": total_pages
    }


def get_model(model_name):
    with open(r'.\flaskr\static\models.json') as f:
        models = json.load(f)

    layers = []
    summary = ''
    if model_name in models.keys():
        model = models[model_name]
        layers = model['layers']
        summary = model['summary']

    return {
        "model_name": model_name,
        "layers": layers,
        "summary": summary
    }


def o_get_all(dataset_name):
    dataset_obj = Dataset.query.filter_by(name=dataset_name).first()
    if dataset_obj is None:
        return []
    datas_obj = Data.query.filter_by(dsid=dataset_obj.id)
    return datas_obj


def get_dataset_id_from_name(dataset_name):
    dataset_obj = Dataset.query.filter_by(name=dataset_name).first()
    return dataset_obj.id
