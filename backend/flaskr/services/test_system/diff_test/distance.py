import numpy as np

# 切比雪夫距离
def chebyshev(array1, array2):
    distance = abs(array1 - array2)
    distance = np.max(distance)
    return distance.astype('float64')

def mean(array1, array2):
    distance = abs(array1-array2)
    distance = distance.mean()
    return distance.astype('float64')