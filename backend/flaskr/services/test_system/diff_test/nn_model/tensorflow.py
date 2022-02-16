import tensorflow as tf
from tensorflow import keras

gpus = tf.config.experimental.list_physical_devices('GPU')

if gpus:
    # Restrict TensorFlow to only use the first GPU
    tf.config.experimental.set_virtual_device_configuration(
        gpus[0],
        [tf.config.experimental.VirtualDeviceConfiguration(memory_limit=3072)]
    )


class LRNLayer(keras.layers.Layer):
    def __init__(self, depth_radius=5, bias=1, alpha=1, beta=0.5, name=None):
        super().__init__()
        self.depth_radius = depth_radius
        self.bias = bias
        self.alpha = alpha
        self.beta = beta
        self.lrn_name = name

    def call(self, input):
        return tf.nn.local_response_normalization(
            input,
            self.depth_radius,
            self.bias,
            self.alpha,
            self.beta,
            self.lrn_name
        )


class TensorflowModel:
    def __init__(self, model, optimizer, loss_function):
        self._model = model
        self._optimizer = optimizer
        self._loss_function = loss_function

    def get_weights(self):
        return self._model.get_weights()

    def train_step(self, images, labels):
        with tf.GradientTape() as tape:
            pred = self._model(images, training=True)
            loss_value = self._loss_function(labels, pred)

        grads = tape.gradient(loss_value, self._model.trainable_variables)
        grads = [grad.numpy() for grad in grads]
        # print("Tensorflow Loss:", loss_value)
        self._optimizer.apply_gradients(zip(grads, self._model.trainable_variables))
        return pred, grads, self._model.trainable_variables


class AlexNet(TensorflowModel):
    def __init__(self):
        super().__init__(
            model=keras.Sequential([
                keras.layers.Conv2D(96, 11, 4, input_shape=(3, 227, 227), data_format="channels_first"),
                keras.layers.ReLU(),
                # LRNLayer(depth_radius=2,alpha=0.0001, beta=0.75, bias=2.0),
                keras.layers.MaxPooling2D((3, 3), 2, data_format="channels_first"),

                keras.layers.Conv2D(256, 5, 1, padding='same', data_format="channels_first"), keras.layers.ReLU(),
                # LRNLayer(depth_radius=2,alpha=0.0001, beta=0.75, bias=2.0),
                keras.layers.MaxPooling2D((3, 3), 2, data_format="channels_first"),

                keras.layers.Conv2D(384, 3, 1, padding='same', data_format="channels_first"), keras.layers.ReLU(),
                keras.layers.Conv2D(384, 3, 1, padding='same', data_format="channels_first"), keras.layers.ReLU(),
                keras.layers.Conv2D(256, 3, 1, padding='same', data_format="channels_first"), keras.layers.ReLU(),
                keras.layers.MaxPooling2D((3, 3), 2, data_format="channels_first"),

                keras.layers.Flatten(),
                keras.layers.Dense(4096), keras.layers.ReLU(),  # keras.layers.Dropout(0.5),
                keras.layers.Dense(4096), keras.layers.ReLU(),  # keras.layers.Dropout(0.5),
                keras.layers.Dense(10)
            ]),
            optimizer=keras.optimizers.SGD(learning_rate=1e-2, momentum=0.9),  # weight_decay= 0.0005
            loss_function=keras.losses.SparseCategoricalCrossentropy(from_logits=True)
        )


class LeNet5(TensorflowModel):
    def __init__(self):
        super().__init__(
            model=keras.Sequential([
                keras.layers.Conv2D(filters=6, kernel_size=5, input_shape=(1, 32, 32), data_format="channels_first"),
                keras.layers.MaxPool2D(pool_size=2, strides=2, data_format="channels_first"), keras.layers.ReLU(),

                keras.layers.Conv2D(filters=16, kernel_size=5, data_format="channels_first"),
                keras.layers.MaxPool2D(pool_size=2, strides=2, data_format="channels_first"), keras.layers.ReLU(),

                keras.layers.Conv2D(filters=120, kernel_size=5, data_format="channels_first"), keras.layers.ReLU(),

                keras.layers.Flatten(),
                keras.layers.Dense(84), keras.layers.ReLU(),
                keras.layers.Dense(10)
            ]),
            optimizer=keras.optimizers.SGD(learning_rate=1e-2, momentum=0.99),  # weight_decay= 0.0005
            loss_function=keras.losses.SparseCategoricalCrossentropy(from_logits=True)
        )
