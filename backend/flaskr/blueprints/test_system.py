import os

from flask import (Blueprint, request, jsonify, send_from_directory, make_response)
from instance.status import Status
from flaskr.services.test_system.mutate_method import mutate_method as mutate_method_service
from flaskr.services.test_system import corpus_set as corpus_set_service
from flaskr.services.test_system.diff_test import main as diff_test_service

bp = Blueprint('test_system', __name__, url_prefix='/test_system')


@bp.route(rule="/mutate_method/image_base64_mutate", methods=['post'])
def image_base64_mutate():
    data = request.json['data']
    url = request.json['url']
    new_data = mutate_method_service.image_base64_mutate(data, url)
    data = {
        'data': new_data
    }
    return jsonify(data)


@bp.route(rule="/mutate_method/data_list_mutate", methods=['post'])
def data_list_mutate():
    data = request.json['data']
    url = request.json['url']
    new_data = mutate_method_service.data_list_mutate(data, url)
    data = {
        'data': new_data
    }
    return jsonify(data)


@bp.route(rule="/mutate_method/gauss_perturbation", methods=['post'])
def gauss_perturbation():
    data = request.json['data']
    data = mutate_method_service.gauss_perturbation(data)
    return jsonify(data)


@bp.route(rule="/mutate_method/color_piece_covered", methods=['post'])
def color_piece_covered():
    data = request.json['data']
    data = mutate_method_service.color_piece_covered(data)
    return jsonify(data)


@bp.route(rule="/mutate_method/create", methods=['post'])
def create_mutate_method():
    mutate_method = request.json['mutate_method']
    data = mutate_method_service.create(mutate_method)
    if data['mutate_method'] is None:
        data = {
            'status': Status.SQL_KEY_DUPLICATE.get_data(),
            'data': data
        }
    else:
        data = {
            'status': Status.OK.get_data(),
            'data': data
        }

    return jsonify(data)


@bp.route(rule="/mutate_method/retrieve_page", methods=['post'])
def retrieve_mutate_method_page():
    field_name = request.json['field_name']
    keywords = request.json['keywords']
    page_index = request.json['page_index']
    page_size = request.json['page_size']
    data = mutate_method_service.retrieve_page(field_name, keywords, page_index, page_size)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/mutate_method/update", methods=['post'])
def update_mutate_method():
    mutate_method = request.json['mutate_method']
    data = mutate_method_service.update(mutate_method)
    if data['mutate_method'] is None:
        data = {
            'status': Status.SQL_KEY_DUPLICATE.get_data(),
            'data': data
        }
    else:
        data = {
            'status': Status.OK.get_data(),
            'data': data
        }
    return jsonify(data)


@bp.route(rule="/mutate_method/set_checkeds", methods=['post'])
def set_mutate_methods_checked():
    mutate_methods = request.json['mutate_methods']
    data = mutate_method_service.set_checkeds(mutate_methods)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/mutate_method/delete", methods=['post'])
def delete_mutate_method():
    id = request.json['id']
    data = mutate_method_service.delete(id)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/mutate_method/get_page", methods=['post'])
def get_mutate_method_page():
    page_index = request.json['page_index']  # 页码
    page_size = request.json['page_size']  # 每页信息数目
    data = mutate_method_service.get_page(page_index, page_size)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/mutate_method/verify", methods=['post'])
def mutate_method_verify():
    mutate_method = request.json['mutate_method']
    data = mutate_method_service.verify_mutate_method(mutate_method)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/corpus_set/data_to_base64", methods=['post'])
def corpus_set_data_to_base64():
    id = request.json['id']
    data = corpus_set_service.data_to_base64(id)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/corpus_set/get_page", methods=['post'])
def corpus_set_get_page():
    dataset_name = request.json['dataset_name']
    page_index = request.json['page_index']
    page_size = request.json['page_size']
    data = corpus_set_service.get_page(dataset_name, page_index, page_size)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/corpus_set/retrieve_page", methods=['post'])
def corpus_set_retrieve_page():
    dataset_name = request.json['dataset_name']
    field_name = request.json['field_name']
    keywords = request.json['keywords']
    page_index = request.json['page_index']
    page_size = request.json['page_size']
    data = corpus_set_service.retrieve_page(dataset_name, field_name, keywords, page_index, page_size)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/corpus_set/get_model", methods=['post'])
def corpus_set_get_model():
    model_name = request.json['model_name'].lower()
    data = corpus_set_service.get_model(model_name)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="diff_test/start_test", methods=['post'])
def start_test():
    setting = {
        "model_name": request.json['model_name'].lower(),
        "dataset_name": request.json['dataset_name'].lower(),
        "library1": request.json['library1'].lower(),
        "library2": request.json['library2'].lower(),
        "batch_size": request.json['batch_size'],
        "iterate_times": request.json['iterate_times'],
        "diff_threshold": request.json['diff_threshold'],
        "active_value": request.json['active_value'],
    }

    diff_test_service.start_test(setting)
    return "ok"


@bp.route(rule="/diff_test/fetch_results", methods=['post'])
def fetch_results():
    data = diff_test_service.fetch_results()
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="diff_test/pause_test", methods=['post'])
def pause_test():
    diff_test_service.pause_test()
    return "ok"


@bp.route(rule="diff_test/resume_test", methods=['post'])
def resume_test():
    diff_test_service.resume_test()
    return "ok"


@bp.route(rule="diff_test/stop_test", methods=['post'])
def stop_test():
    diff_test_service.stop_test()
    return "ok"


@bp.route(rule="diff_test/get_test_record", methods=['post'])
def get_test_record():
    print('get_test_tecord start')
    tid = request.json['tid']
    iterate_time = request.json['iterate_time']
    data = diff_test_service.get_test_record(tid, iterate_time)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="diff_test/get_test_record_weights", methods=['post'])
def get_test_record_weights():
    tid = request.json['tid']
    iterate_time = request.json['iterate_time']
    filename = str(tid) + '-' + str(iterate_time) + '.json'
    response = make_response(
        send_from_directory(os.path.abspath(r'.\flaskr\static\weights'), filename, as_attachment=True))
    response.headers["Content-Disposition"] = "attachment; filename={}".format(filename.encode().decode('latin-1'))
    print(response)
    return response


import pickle
from flaskr import db
from flaskr.models.test_system import Data

label_descriptions = ['airplane', 'automobile', 'bird', 'cat', 'deer', 'dog', 'frog', 'horse', 'ship', 'truck']


@bp.route(rule="/data/cifar-10/write", methods=['get', 'post'])
def cifar10_write():
    filename = 'C:/Users/Administrator/Desktop/cifar-10-batches-py/test_batch'
    with open(filename, 'rb') as f:
        data_raw = pickle.load(f, encoding='latin1')

    for i in range(len(data_raw['labels'])):
        data = {
            "dsid": 1,
            "filename": data_raw['filenames'][i],
            'data': data_raw['data'][i],
            'label': data_raw['labels'][i],
            'label_description': label_descriptions[data_raw['labels'][i]]
        }
        print(type(data['data']))
    #     data_obj = Data(data)
    #     db.session.add(data_obj)
    # db.session.commit()

    return "ok"


@bp.route(rule="/data/cifar-10/read", methods=['get', 'post'])
def cifar10_read():
    data_obj = Data.query.get(1)
    print(type(data_obj.data))
    data = data_obj.serialize()

    data['data'] = data['data'].tolist()
    return data


import tensorflow as tf


@bp.route(rule="/data/mnist/write", methods=['get', 'post'])
def mnist_write():
    mnist = tf.keras.datasets.mnist
    (x_train, y_train), (x_test, y_test) = mnist.load_data()
    for i in range(len(y_train)):
        data = {
            "dsid": 2,
            "filename": str(y_train[i]),
            'data': x_train[i],
            'label': y_train[i],
            'label_description': y_train[i]
        }
        data_obj = Data(data)
        db.session.add(data_obj)
    db.session.commit()
    return "ok"

@bp.route(rule="/data/mnist/read", methods=['get', 'post'])
def mnist_read():
    data_obj = Data.query.get(10001)
    print(type(data_obj.data))
    data = data_obj.serialize()
    data['data'] = data['data'].tolist()
    return data


from flaskr.models.test_system import Data


@bp.route(rule="/", methods=['post'])
def index():
    data_obj = Data.query.first()
    data = corpus_set_service.d1_channel_first_to_base64(data_obj.data, 3, 32, 32)
    return jsonify(data)
