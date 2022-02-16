from flaskr import db
from sqlalchemy.orm import class_mapper


class MutateMethod(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True, index=True)
    url = db.Column(db.String(100), unique=True)
    name = db.Column(db.String(50))
    checked = db.Column(db.Boolean)

    def __init__(self, mutateMethod):
        self.url = mutateMethod['url']
        self.name = mutateMethod['name']
        self.checked = mutateMethod['checked']

    def __repr__(self):
        return '<MutateMethod %r>' % self.id

    def serialize(self):
        """Transforms a model into a dictionary which can be dumped to JSON."""
        # first we get the names of all the columns on your model
        columns = [c.key for c in class_mapper(self.__class__).columns]
        # then we return their values in a dict
        return dict((c, getattr(self, c)) for c in columns)


class Dataset(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True, index=True)
    name = db.Column(db.String(50), unique=True)

    def __init__(self, dataset):
        self.name = dataset['name']

    def __repr__(self):
        return '<Dataset %r>' % self.id

    def serialize(self):
        """Transforms a model into a dictionary which can be dumped to JSON."""
        # first we get the names of all the columns on your model
        columns = [c.key for c in class_mapper(self.__class__).columns]
        # then we return their values in a dict
        return dict((c, getattr(self, c)) for c in columns)


class Data(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True, index=True)
    dsid = db.Column(db.Integer, db.ForeignKey('dataset.id'))
    filename = db.Column(db.String(50))
    data = db.Column(db.PickleType)
    label = db.Column(db.Integer)
    label_description = db.Column(db.String(50))

    def __init__(self, data):
        self.dsid = data['dsid']
        self.filename = data['filename']
        self.data = data['data']
        self.label = data['label']
        self.label_description = data['label_description']

    def __repr__(self):
        return '<Data %r>' % self.id

    def serialize(self):
        """Transforms a model into a dictionary which can be dumped to JSON."""
        # first we get the names of all the columns on your model
        columns = [c.key for c in class_mapper(self.__class__).columns]
        # then we return their values in a dict
        return dict((c, getattr(self, c)) for c in columns)


class Test(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True, index=True)
    library1 = db.Column(db.String(50))
    library2 = db.Column(db.String(50))
    model = db.Column(db.String(25))
    dataset = db.Column(db.Integer, db.ForeignKey('dataset.id'))
    batch_size = db.Column(db.Integer)
    iterate_times = db.Column(db.Integer)
    diff_threshold = db.Column(db.Float)
    active_value = db.Column(db.Float)

    def __init__(self, test):
        self.library1 = test['library1']
        self.library2 = test['library2']
        self.model = test['model']
        self.dataset = test['dataset']
        self.batch_size = test['batch_size']
        self.iterate_times = test['iterate_times']
        self.diff_threshold = test['diff_threshold']
        self.active_value = test['active_value']

    def __repr__(self):
        return '<Test %r>' % self.id

    def serialize(self):
        """Transforms a model into a dictionary which can be dumped to JSON."""
        # first we get the names of all the columns on your model
        columns = [c.key for c in class_mapper(self.__class__).columns]
        # then we return their values in a dict
        return dict((c, getattr(self, c)) for c in columns)


class TestRecord(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True, index=True)
    tid = db.Column(db.Integer, db.ForeignKey('test.id'))
    iterate_time = db.Column(db.Integer)
    # weights = db.Column(db.PickleType)
    inputs = db.Column(db.PickleType)
    difference = db.Column(db.PickleType)

    def __init__(self, test):
        self.tid = test['tid']
        self.iterate_time = test['iterate_time']
        # self.weights = test['weights']
        self.inputs = test['inputs']
        self.difference = test['difference']

    def __repr__(self):
        return '<TestRecord %r>' % self.id

    def serialize(self):
        """Transforms a model into a dictionary which can be dumped to JSON."""
        # first we get the names of all the columns on your model
        columns = [c.key for c in class_mapper(self.__class__).columns]
        # then we return their values in a dict
        return dict((c, getattr(self, c)) for c in columns)
