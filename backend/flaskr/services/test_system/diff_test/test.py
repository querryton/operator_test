import os
import threading
import random
import copy
import requests

import numpy as np
import tensorflow as tf

from ..corpus_set import o_get_all
from . import nn_model
from . import distance
from flaskr import db
from flaskr.services.test_system.mutate_method import mutate_method as mutate_method_service
from flaskr.models.test_system import TestRecord

# 用来存储测试结果
lock_results = threading.Lock()
results = []

# 用来存储嫌疑点
lock_suspects = threading.Lock()
suspects = []

lock_mutated_dataset = threading.Lock()
mutated_dataset = []

sufficiency = {}


def lock_push(lock, container, item, clear=False, extend=False):
    lock.acquire()
    if extend:
        container.extend(item)
    else:
        container.append(item)
    if clear:
        item.clear()
    lock.release()


def store_result(test_record):
    base_path = r'.\flaskr\static\weights'
    file_name = str(test_record['tid']) + '-' + str(test_record['iterate_time']) + '.json'
    with open(os.path.join(base_path, file_name), 'w') as f:
        f.write(str([weight.tolist() for weight in test_record['weights']]))
    del test_record['weights']

    test_record_obj = TestRecord(test_record)
    db.session.add(test_record_obj)
    db.session.commit()


class Mutate(threading.Thread):

    def __init__(self, mutate_methods, dataset_batch, result, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.__flag = threading.Event()  # 用于暂停线程的标识
        self.__flag.set()  # 设置为True
        self.__running = threading.Event()  # 用于停止线程的标识
        self.__running.set()  # 将running设置为True
        self.mutate_methods = mutate_methods
        self.dataset_batch = dataset_batch
        self.result = result

    def run(self):
        self.update_count()
        rdata_batch = list()

        for data in self.dataset_batch:
            if not self.__running.isSet():
                break
            self.__flag.wait()  # 为True时立即返回, 为False时阻塞直到内部的标识位为True后返回
            p = random.random()
            mutate_methods = mutate_method_service.get_probability(self.mutate_methods)
            sum_p = 0
            for idx, mutate_method in enumerate(mutate_methods):
                sum_p += mutate_method['probability']
                if p < sum_p:
                    response = requests.post(mutate_method['url'], json={"data": data[0].tolist()})
                    rdata = (
                        (np.array(response.json()['data']) + 0.5).astype(np.int32).clip(0, 255),
                        data[1],
                        idx
                    )
                    rdata_batch.append(rdata)
                    break
        lock_push(lock_mutated_dataset, mutated_dataset, rdata_batch, extend=True)
        self.__flag.set()  # 将线程从暂停状态恢复, 如何已经暂停的话
        self.__running.clear()  # 设置为False

    def pause(self):
        self.__flag.clear()  # 设置为False, 让线程阻塞

    def resume(self):
        self.__flag.set()  # 设置为True, 让线程停止阻塞

    def stop(self):
        self.__flag.set()  # 将线程从暂停状态恢复, 如何已经暂停的话
        self.__running.clear()  # 设置为False

    def update_count(self):
        if not self.result['previous']:
            return
        if self.result['current'][0] > self.result['previous'][0]:
            for data in self.dataset_batch:
                if data[2] != -1:
                    self.mutate_methods[data[2]]['count'] += 1


class Sufficiency:
    def __init__(self, weights, threshold):
        super(Sufficiency, self).__init__()
        self.actived = np.array([]).astype(np.bool)
        for i in range(len(weights)):
            self.actived = np.append(self.actived, np.zeros(weights[i].flatten().shape))
        self.shape = self.actived.shape
        self.threshold = threshold

    def active(self, grads):
        grads_flat = np.array([])
        for i in range(len(grads)):
            grads_flat = np.append(grads_flat, grads[i].flatten())
        if grads_flat.shape == self.shape:
            for i in range(len(grads_flat)):
                if grads_flat[i] > self.threshold:
                    self.actived[i] = 1
        return self.get()

    def get(self):
        return self.actived.sum() / len(self.actived)

    def is_sufficient(self):
        return self.actived.sum() == len(self.actived)


class TensorflowPytorch(threading.Thread):
    def __init__(self, id, setting, model_name, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.__flag = threading.Event()  # 用于暂停线程的标识
        self.__flag.set()  # 设置为True
        self.__running = threading.Event()  # 用于停止线程的标识
        self.__running.set()  # 将running设置为True
        self.id = id
        self.dataset_name = setting['dataset_name']
        self.mutate_methods = setting['mutate_methods']
        self.iterate_times = setting['iterate_times']
        self.active_value = setting['active_value']
        self.batch_size = setting['batch_size']
        self.diff_threshold = setting['diff_threshold']
        self.model_name = model_name

    def run(self):
        global sufficiency
        sufficiency = {"tensorflow": 0.0, "pytorch": 0.0}
        result = {'previous': [], 'current': []}
        results.clear()

        torch_model, tf_model, input_size = self.get_model()
        torch_sufficiency, tf_sufficiency = self.get_sufficiency(torch_model, tf_model)
        dataset = self.get_dataset()

        thread_list = list()  # 用来存放数据变异进程
        for iterate_time in range(self.iterate_times):
            if not self.__running.isSet():
                break
            self.__flag.wait()  # 为True时立即返回, 为False时阻塞直到内部的标识位为True后返回

            dataset_batch = dataset.__next__()
            for item in dataset_batch:
                if type(item[0]) == tuple:
                    for i in range(len(item[0])):
                        print(i, ":", type(item[0][i]))
            datas, labels = np.array([tf.image.resize(item[0].transpose(1, 2, 0), input_size)
                                     .numpy().transpose(2, 0, 1) / 255 for item in dataset_batch]), \
                            np.array([item[1] for item in dataset_batch])

            # 在测试开始前，记录当前模型参数权重值，因为训练后模型权重会变
            test_record = {'tid': self.id, 'iterate_time': iterate_time, 'weights': tf_model.get_weights()}

            # if iterate_time == 0:
            torch_model.set_params_from_tensorflow(tf_model)
            torch_pred, torch_grads, torch_weights = torch_model.train_step(datas, labels)
            tf_pred, tf_grads, tf_weights = tf_model.train_step(datas, labels)

            result['current'] = self.difference(torch_grads, tf_grads, distance.chebyshev)
            self.suspect_judge(result['current'], test_record, dataset_batch)  # 判断此次测试是否测试出异常值
            print(iterate_time, '@', result['current'])

            print('sufficiency active and get')
            sufficiency = {
                "pytorch": torch_sufficiency.active(torch_grads),
                "tensorflow": tf_sufficiency.active(tf_grads)
            }

            t = Mutate(self.mutate_methods, copy.deepcopy(dataset_batch), copy.deepcopy(result))
            t.start()
            thread_list.append(t)

            result['previous'] = copy.deepcopy(result['current'])

        lock_push(lock_results, results, -1)
        for t in thread_list:
            t.stop()
        self.__flag.set()  # 将线程从暂停状态恢复, 如何已经暂停的话
        self.__running.clear()  # 设置为False

    def pause(self):
        self.__flag.clear()  # 设置为False, 让线程阻塞

    def resume(self):
        self.__flag.set()  # 设置为True, 让线程停止阻塞

    def stop(self):
        self.__flag.set()  # 将线程从暂停状态恢复, 如何已经暂停的话
        self.__running.clear()  # 设置为False

    def get_model(self):
        if self.model_name == 'alexnet':
            input_size = (227, 227)
            torch_model = nn_model.pytorch.AlexNet()
            tf_model = nn_model.tensorflow.AlexNet()
        else:  # elif self.model_name == 'lenet5':
            input_size = (32, 32)
            torch_model = nn_model.pytorch.LeNet5()
            tf_model = nn_model.tensorflow.LeNet5()
        return torch_model, tf_model, input_size

    def get_sufficiency(self, torch_model, tf_model):
        torch_sufficiency = Sufficiency(torch_model.get_weights(), self.active_value)
        tf_sufficiency = Sufficiency(tf_model.get_weights(), self.active_value)
        return torch_sufficiency, tf_sufficiency

    def get_dataset(self):
        datas_obj = o_get_all(self.dataset_name)
        if self.dataset_name == 'cifar-10':
            dataset = [(data_obj.data.reshape(3, 32, 32), data_obj.label, -1)
                       for data_obj in datas_obj]
        elif self.dataset_name == 'mnist':
            dataset = [(data_obj.data.reshape(1, 28, 28), data_obj.label, -1)
                       for data_obj in datas_obj]
        begin_idx = 0
        while True:
            if begin_idx == 0:
                lock_push(lock_mutated_dataset, dataset, mutated_dataset, clear=True, extend=True)
                random.shuffle(dataset)
            end_idx = (begin_idx + self.batch_size) if (begin_idx + self.batch_size) <= len(dataset) else len(dataset)
            dataset_batch = dataset[begin_idx:end_idx]
            if end_idx == len(dataset):
                begin_idx = 0
            else:
                begin_idx = end_idx
            yield dataset_batch

    @staticmethod
    def difference(torch_value, tf_value, distance_fun):
        print('difference start')
        result = []
        for i in range(len(tf_value)):
            if tf_value[i].ndim == 1:
                d = distance_fun(tf_value[i], torch_value[i])
            elif tf_value[i].ndim == 2:
                d = distance_fun(tf_value[i].T, torch_value[i])
            elif tf_value[i].ndim == 4:
                d = distance_fun(tf_value[i].T.transpose(0, 1, 3, 2), torch_value[i])
            result.append(d)
        lock_push(lock_results, results, result)
        return result

    def suspect_judge(self, difference, test_record, inputs):
        print('suspect_judge start')
        flag = False
        for idx, d in enumerate(difference):
            if idx % 2 == 0 and d >= self.diff_threshold:
                flag = True
                suspect = {
                    "tid": self.id,
                    "iterate_time": test_record['iterate_time'],
                    "layer": idx,
                    "suspect_value": d
                }
                lock_push(lock_suspects, suspects, suspect)

        if flag:
            test_record['inputs'] = inputs
            test_record['difference'] = difference
            threading.Thread(target=store_result, args=[test_record]).start()
