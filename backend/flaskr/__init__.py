import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

test_config = None

# create and configure the app
app = Flask(__name__, instance_relative_config=True)
app.config.from_pyfile('.\\config.py')

# ensure the instance folder exists
try:
    os.makedirs(app.instance_path)
except OSError:
    pass

db = SQLAlchemy(app)

from flaskr import models

db.create_all()
init_mutate_methods = [
    {
        'url': 'http://127.0.0.1:5000/test_system/mutate_method/gauss_perturbation',
        'name': '高斯扰动',
        'checked': False
    }
]
for init_mutate_method in init_mutate_methods:
    mutate_method_obj = models.test_system.MutateMethod.query.filter_by(url=init_mutate_method['url']).first()
    if mutate_method_obj is None:
        mutate_method_obj = models.test_system.MutateMethod(init_mutate_method)
        db.session.add(mutate_method_obj)
        db.session.commit()

from flaskr.services.bug_operation.classifier import Classifier
from flaskr.models.bug_operation import Bug

classsifier = Classifier(db, Bug)
