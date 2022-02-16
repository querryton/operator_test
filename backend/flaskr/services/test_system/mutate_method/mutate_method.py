import math
import requests
import json
from PIL import Image
import numpy as np

from flaskr import db
from flaskr.models.test_system import MutateMethod

from . import image


def verify_mutate_method(mutate_method):
    dim = np.random.randint(1, 5)
    shape = tuple(np.random.randint(1, 11, dim).tolist())
    data = np.random.normal(0, 256, shape)
    try:
        response = requests.post(mutate_method['url'], json={"data": data.tolist()})
        if response.status_code == 405:
            return {
                'state': False,
                'error': '该数据变异方法不符合要求，URL的请求方法必须为POST。'
            }
        if response.status_code == 500:
            return {
                'state': False,
                'error': '服务器内部错误，可能的原因是：URL的参数未按规定要求使用‘data’字段。'
            }
        rdata = np.array(response.json()['data'])
    except json.decoder.JSONDecodeError:
        return {
            'state': False,
            'error': '该数据变异方法不符合要求，未返回JSON格式数据。'
        }
    except KeyError:
        return {
            'state': False,
            'error': '该数据变异方法不符合要求，返回的JSON数据未按规定要求使用‘data’字段。'
        }
    except requests.exceptions.ConnectionError:
        return {
            'state': False,
            'error': '无法连接该数变异方法所提供的URL，请检查该URL对应的服务器是否开启。'
        }
    except requests.exceptions.MissingSchema:
        return {
            'state': False,
            'error': '无效的URL'
        }

    if not np.issubdtype(rdata.dtype, np.integer) and \
            not np.issubdtype(rdata.dtype, np.floating):
        return {
            'state': False,
            'error': '该数据变异方法不符合要求，返回的数据不是简单数字类型。'
        }

    if rdata.shape != data.shape:
        return {
            'state': False,
            'error': '该数据变异方法不符合要求，返回的数据的维度未于原数据保持一致。'
        }

    return {
        'state': True,
    }


def image_base64_mutate(data_base64, url):
    img = image.from_base64(data_base64)
    data_array = np.array(img)

    response = requests.post(url, json={'data': data_array.tolist()})
    new_data_array = np.array(response.json()['data'])
    new_data_array = (new_data_array + 0.5).astype(np.int32).clip(0, 255).astype(np.uint8)

    new_img = Image.fromarray(new_data_array)
    new_data_base64 = image.to_base64(new_img)
    return new_data_base64


def data_list_mutate(data_list, url):
    response = requests.post(url, json={'data': data_list})
    new_data_list = response.json()['data']
    return new_data_list


def gauss_perturbation(data):
    data_array = np.array(data).astype(np.float64)
    perturbation = np.random.normal(0, 20, data_array.shape)
    data_array += perturbation
    data = data_array.tolist()
    return {
        "data": data
    }


def color_piece_covered(data, ratio=0.2, value=0):
    data_array = np.array(data).astype(np.float64)
    color_piece_shape_list = (np.array(data_array.shape) * ratio).astype(np.int).tolist()
    if data_array.shape[-1] == 3:
        color_piece_shape_list[-1] = 3
    elif data_array.shape[0] == 3:
        color_piece_shape_list[0] = 3
    s = list()
    for i in range(len(color_piece_shape_list)):
        t = color_piece_shape_list[i]
        l = data_array.shape[i]
        begin = np.random.randint(0, l - t + 1)
        s.append(slice(begin, begin + t))
    data_array[tuple(s)] = value
    data = data_array.tolist()
    return {
        "data": data
    }


def create(mutate_method):
    mutate_method['checked'] = False
    mutate_method_obj = MutateMethod.query.filter_by(url=mutate_method['url']).first()
    if mutate_method_obj is not None:
        return {
            "mutate_method": None
        }

    mutate_method_obj = MutateMethod(mutate_method)
    db.session.add(mutate_method_obj)
    db.session.commit()
    return {
        "mutate_method": mutate_method_obj.serialize()
    }


def retrieve(field_name, keywords):
    if field_name == "name":
        mutate_methods_obj = MutateMethod.query.filter(MutateMethod.name.like('%' + keywords + '%')).all()
    elif field_name == "url":
        mutate_methods_obj = MutateMethod.query.filter(MutateMethod.url.like('%' + keywords + '%')).all()

    mutate_methods = [mutate_method_obj.serialize() for mutate_method_obj in mutate_methods_obj]

    return {
        'mutate_methods': mutate_methods
    }


def retrieve_page(field_name, keywords, page_index, page_size):
    if field_name == "name":
        mutate_methods_obj = MutateMethod.query.filter(MutateMethod.name.like('%' + keywords + '%')).limit(
            page_size).offset((page_index - 1) * page_size)
        total = MutateMethod.query.filter(MutateMethod.name.like('%' + keywords + '%')).count()
    elif field_name == "url":
        mutate_methods_obj = MutateMethod.query.filter(MutateMethod.url.like('%' + keywords + '%')).limit(
            page_size).offset((page_index - 1) * page_size)
        total = MutateMethod.query.filter(MutateMethod.url.like('%' + keywords + '%')).count()

    total_pages = math.ceil(total / page_size)

    mutate_methods = [mutate_method_obj.serialize() for mutate_method_obj in mutate_methods_obj]

    return {
        'mutate_methods': mutate_methods,
        'total_pages': total_pages
    }


def update(mutate_method):
    mutate_method_obj = MutateMethod.query.filter(MutateMethod.url == mutate_method['url'],
                                                  MutateMethod.id != mutate_method['id']).first()
    if mutate_method_obj is not None:
        return {
            "mutate_method": None
        }
    MutateMethod.query.filter_by(id=mutate_method['id']).update(mutate_method)
    db.session.commit()
    return {
        'mutate_method': mutate_method
    }


def set_checkeds(mutate_methods):
    for mutate_method in mutate_methods:
        MutateMethod.query.filter_by(id=mutate_method['id']).update(mutate_method)
    db.session.commit()
    return {
        'mutate_methods': mutate_methods
    }


def o_get_checkeds():
    mutate_methods = MutateMethod.query.filter_by(checked=True).all()
    return mutate_methods


def delete(id):
    mutate_method_obj = MutateMethod.query.get(id)
    db.session.delete(mutate_method_obj)
    db.session.commit()
    return {
        'id': id
    }


def get():
    mutate_methods_obj = MutateMethod.query.all()
    mutate_methods = [mutate_method_obj.serialize() for mutate_method_obj in mutate_methods_obj]

    return {
        'mutate_methods': mutate_methods,
    }


def get_page(page_index, page_size):
    mutate_methods = MutateMethod.query.limit(page_size).offset((page_index - 1) * page_size)
    mutate_methods = [mutate_method.serialize() for mutate_method in mutate_methods]

    total = MutateMethod.query.count()
    total_pages = math.ceil(total / page_size)

    return {
        "mutate_methods": mutate_methods,
        "total_pages": total_pages
    }


def get_probability(mutate_methods):
    """
    :param mutate_methods:
    {
        id:int,
        url:string,
        count:int, # 选择次数
    }
    :return:
    {
        id:int,
        url:string,
        probability:float, #
    }
    """
    score_sum = 0
    for mutate_method in mutate_methods:
        mutate_method['score'] = 1 / (mutate_method['count'] + 1)
        score_sum += mutate_method['score']
    for mutate_method in mutate_methods:
        mutate_method['probability'] = mutate_method['score'] / score_sum
        del mutate_method['score']
    return mutate_methods
