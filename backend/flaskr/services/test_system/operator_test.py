import time

def yield_number():
    number = 1
    while True:
        yield number
        number += 1
        if number % 1000 == 0:
            print(number)
        time.sleep(0.2)

