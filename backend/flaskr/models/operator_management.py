from flaskr import db
from sqlalchemy.orm import class_mapper


class Operator(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True, index=True)
    library = db.Column(db.String(50))
    version = db.Column(db.String(30))
    name = db.Column(db.String(50))
    input = db.Column(db.Text)
    output = db.Column(db.Text)

    def __init__(self, operator):
        self.library = operator['library']
        self.version = operator['version']
        self.name = operator['name']
        self.input = operator['input']
        self.output = operator['output']

    def __repr__(self):
        return '<Operator %r>' % self.id

    def serialize(self):
        """Transforms a model into a dictionary which can be dumped to JSON."""
        # first we get the names of all the columns on your model
        columns = [c.key for c in class_mapper(self.__class__).columns]
        # then we return their values in a dict
        return dict((c, getattr(self, c)) for c in columns)


class Parameter(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True, index=True)
    oid = db.Column(db.Integer, db.ForeignKey('operator.id'))
    name = db.Column(db.String(50))
    description = db.Column(db.Text)

    def __init__(self, parameter):
        self.oid = parameter['oid']
        self.name = parameter['name']
        self.description = parameter['description']

    def __repr__(self):
        return '<Parameter %r>' % self.id

    def serialize(self):
        """Transforms a model into a dictionary which can be dumped to JSON."""
        # first we get the names of all the columns on your model
        columns = [c.key for c in class_mapper(self.__class__).columns]
        # then we return their values in a dict
        return dict((c, getattr(self, c)) for c in columns)
