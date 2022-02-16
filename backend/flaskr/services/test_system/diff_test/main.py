import copy
import os
import time

import numpy as np
from PIL import Image

from . import test
from flaskr import db
from flaskr.models.test_system import Test
from flaskr.models.test_system import TestRecord
from flaskr.services.test_system.mutate_method import image
from flaskr.services.test_system.mutate_method import mutate_method as mutate_method_service
from flaskr.services.test_system import corpus_set as corpus_set_service

test_job = None


def initial_mutate_method():
    mutate_methods = mutate_method_service.o_get_checkeds()
    mutate_methods = [mutate_method.serialize() for mutate_method in mutate_methods]
    for mutate_method in mutate_methods:
        mutate_method['count'] = 0
        del mutate_method['checked']
    return mutate_methods


def fetch_results():
    test.lock_results.acquire()
    results_copy = copy.deepcopy(test.results)
    test.results.clear()
    test.lock_results.release()

    test.lock_suspects.acquire()
    suspects_copy = copy.deepcopy(test.suspects)
    test.suspects.clear()
    test.lock_suspects.release()

    end = False
    if len(results_copy) > 0:
        if isinstance(results_copy[-1], int) and results_copy[-1] < 0:
            results_copy.pop()
            end = True

    return {
        "results": results_copy,
        "suspects": suspects_copy,
        "sufficiency": test.sufficiency,
        "end": end
    }


def start_test(setting):
    library1 = setting['library1']
    library2 = setting['library2']
    model_name = setting['model_name']
    del setting['library1'], setting['library2'], setting['model_name']
    setting['mutate_methods'] = initial_mutate_method()

    test_obj = Test({
        "library1": library1,
        "library2": library2,
        "model": model_name,
        "dataset": corpus_set_service.get_dataset_id_from_name(setting['dataset_name']),
        "batch_size": setting['batch_size'],
        "iterate_times": setting['iterate_times'],
        "diff_threshold": setting['diff_threshold'],
        "active_value": setting['active_value']
    })
    db.session.add(test_obj)
    db.session.commit()

    try:
        global test_job
        if test_job is not None and test_job.is_alive():
            stop_test()
            while len(test.results) == 0 or not isinstance(test.results[-1], int) or test.results[-1] >= 0:
                time.sleep(0.5)
                print('waiting')
            test.results.clear()

        if (library1 == 'tensorflow' and library2 == 'pytorch') or \
                (library1 == 'pytorch' and library2 == 'tensorflow'):
            test_job = test.TensorflowPytorch(test_obj.id, setting, model_name=model_name)
            print(model_name, "TensorflowPytorch start")

        test_job.start()
    except Exception as e:
        print("[services.test_system.diff_test.main]Thread error: 无法启动线程AlexNetTensorflowPytorch,", e)


def pause_test():
    global test_job
    if test_job is not None and test_job.is_alive():
        test_job.pause()


def resume_test():
    global test_job
    if test_job is not None and test_job.is_alive():
        test_job.resume()


def stop_test():
    global test_job
    if test_job is not None and test_job.is_alive():
        test_job.stop()
        test_job = None


def getFileSize(filePath):
    fsize = os.path.getsize(filePath)  # 返回的是字节大小
    '''
    为了更好地显示，应该时刻保持显示一定整数形式，即单位自适应
    '''
    if fsize < 1024:
        return str(round(fsize, 2)) + 'Byte'
    else:
        KBX = fsize / 1024
        if KBX < 1024:
            return str(round(KBX, 2)) + 'K'
        else:
            MBX = KBX / 1024
            if MBX < 1024:
                return str(round(MBX, 2)) + 'M'
            else:
                return str(round(MBX / 1024, 2)) + 'G'


def get_test_record(tid, iterate_time):
    test_record = TestRecord.query.filter(TestRecord.tid == tid, TestRecord.iterate_time == iterate_time).first()
    images = list()
    labels = list()
    mode = None
    if test_record.inputs[0][0].shape[0] == 1:
        mode = "L"
    for test_input in test_record.inputs:
        if mode == "L":
            image_array = test_input[0].squeeze()
        else:
            image_array = test_input[0].transpose(1, 2, 0)
        image_array = image_array.astype(np.int32).clip(0, 255).astype(np.uint8)
        images.append(image.to_base64(Image.fromarray(image_array, mode=mode)))
        labels.append(test_input[1])

    base_path = r'.\flaskr\static\weights'
    file_name = str(tid) + '-' + str(iterate_time) + '.json'

    return {
        'images': images,
        'labels': labels,
        'weights_size': getFileSize(os.path.join(base_path, file_name)),
    }
