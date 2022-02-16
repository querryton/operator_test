# -*- coding: utf-8 -*-
"""
Created on Fri Mar 26 16:06:35 2021

@author: querry
"""

import torch
import torch.nn as nn
from flaskr.services.test_system.diff_test import my_optimizer

torch.set_default_tensor_type(torch.FloatTensor)


class PyTorchModel:
    def __init__(self, model, optimizer, optimizer_params, loss_function):
        self._device = "cuda" if torch.cuda.is_available() else "cpu"
        # self._device = "cpu"
        self._model = model.to(self._device)
        self._optimizer = optimizer(self._model.parameters(), **optimizer_params)
        self._loss_function = loss_function

    def set_params_from_tensorflow(self, tensorflow_model):
        tensorflow_weights = tensorflow_model.get_weights()
        for idx, parameter in enumerate(self._model.parameters()):
            if parameter.ndim == 1:
                parameter.data = torch.nn.Parameter(torch.Tensor(tensorflow_weights[idx])).to(self._device)
            elif parameter.ndim == 2:
                parameter.data = torch.nn.Parameter(torch.Tensor(tensorflow_weights[idx].T)).to(self._device)
            elif parameter.ndim == 4:
                parameter.data = torch.nn.Parameter(torch.Tensor(tensorflow_weights[idx].T.swapaxes(-1, -2))).to(
                    self._device)

    def get_weights(self):
        weights = []
        for idx, parameter in enumerate(self._model.parameters()):
            weights.append(parameter.cpu().detach().numpy())
        return weights

    def train_step(self, images, labels):
        images, labels = torch.tensor(images).type(torch.FloatTensor), torch.tensor(labels).type(torch.long)
        images, labels = images.to(self._device), labels.to(self._device)
        pred = self._model(images)
        loss = self._loss_function(pred, labels)
        # print("PyTorch Loss:", loss)
        self._optimizer.zero_grad()
        loss.backward()
        self._optimizer.step()
        grads = [parameter.grad.cpu().detach().numpy() for parameter in self._model.parameters()]
        return pred, grads, list(self._model.parameters())


class AlexNet(PyTorchModel):
    def __init__(self):
        super().__init__(
            model=nn.Sequential(
                nn.Sequential(
                    nn.Conv2d(3, 96, kernel_size=11, stride=4), nn.ReLU(),
                    # nn.LocalResponseNorm(size=2, alpha=0.0001, beta=0.75, k=2.0),
                    nn.MaxPool2d(kernel_size=3, stride=2),

                    nn.Conv2d(96, 256, kernel_size=5, stride=1, padding=2), nn.ReLU(),
                    # nn.LocalResponseNorm(size=2, alpha=0.0001, beta=0.75, k=2.0),
                    nn.MaxPool2d(kernel_size=3, stride=2),

                    nn.Conv2d(256, 384, kernel_size=3, stride=1, padding=1), nn.ReLU(),
                    nn.Conv2d(384, 384, kernel_size=3, stride=1, padding=1), nn.ReLU(),
                    nn.Conv2d(384, 256, kernel_size=3, stride=1, padding=1), nn.ReLU(),
                    nn.MaxPool2d(kernel_size=(3, 3), stride=2),
                ),
                nn.Sequential(
                    nn.Flatten(),
                    nn.Linear(256 * 6 * 6, 4096), nn.ReLU(),  # nn.Dropout(0.5),
                    nn.Linear(4096, 4096), nn.ReLU(),  # nn.Dropout(0.5),
                    nn.Linear(4096, 10),
                )
            ),
            optimizer=my_optimizer.torch.SGD,  # weight_decay= 0.0005
            optimizer_params={"lr": 1e-2, "momentum": 0.9},
            loss_function=nn.CrossEntropyLoss()
        )


class LeNet5(PyTorchModel):
    def __init__(self):
        super().__init__(
            model=nn.Sequential(
                nn.Sequential(
                    nn.Conv2d(1, 6, kernel_size=5), nn.MaxPool2d(kernel_size=2, stride=2), nn.ReLU(),
                    nn.Conv2d(6, 16, kernel_size=5), nn.MaxPool2d(kernel_size=2, stride=2), nn.ReLU(),
                    nn.Conv2d(16, 120, kernel_size=5), nn.ReLU(),
                ),
                nn.Sequential(
                    nn.Flatten(),
                    # nn.Linear(5 * 5 * 16, 120), nn.ReLU(),
                    nn.Linear(120, 84), nn.ReLU(),
                    nn.Linear(84, 10),
                )
            ),
            optimizer=my_optimizer.torch.SGD,
            optimizer_params={"lr": 1e-2, "momentum": 0.99},
            loss_function=nn.CrossEntropyLoss()
        )
