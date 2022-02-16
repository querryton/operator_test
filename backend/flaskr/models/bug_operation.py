from flaskr import db
from sqlalchemy.orm import class_mapper


class Bug(db.Model):
    id = db.Column(db.Integer, primary_key=True, index=True)
    library = db.Column(db.String(50))
    number = db.Column(db.Integer)
    title = db.Column(db.String(750))
    author = db.Column(db.String(30))
    created_at = db.Column(db.String(30))
    updated_at = db.Column(db.String(30))
    bug_description = db.Column(db.Text(1000000))
    link = db.Column(db.String(80))
    labels = db.Column(db.JSON)  # db.String(225)
    state = db.Column(db.String(10))
    answered = db.Column(db.Boolean)
    comment_number = db.Column(db.Integer)

    def __init__(self, bug):
        self.id = bug['id']
        self.library = bug['library']
        self.number = bug['number']
        self.title = bug['title']
        self.author = bug['author']
        self.created_at = bug['created_at']
        self.updated_at = bug['updated_at']
        self.bug_description = bug['bug_description']
        self.link = bug['link']
        self.labels = bug['labels']
        self.state = bug['state']
        self.answered = bug['answered']
        self.comment_number = bug['comment_number']

    def __repr__(self):
        return '<Bug %r>' % self.id

    def serialize(self):
        """Transforms a model into a dictionary which can be dumped to JSON."""
        # first we get the names of all the columns on your model
        columns = [c.key for c in class_mapper(self.__class__).columns]
        # then we return their values in a dict
        return dict((c, getattr(self, c)) for c in columns)


class Taxonomy(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True, index=True)
    name = db.Column(db.String(80))

    def __init__(self, taxonomy):
        self.name = taxonomy['name']

    def __repr__(self):
        return '<Taxonomy %r>' % self.id

    def serialize(self):
        """Transforms a model into a dictionary which can be dumped to JSON."""
        # first we get the names of all the columns on your model
        columns = [c.key for c in class_mapper(self.__class__).columns]
        # then we return their values in a dict
        return dict((c, getattr(self, c)) for c in columns)


class Category(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True, index=True)
    tid = db.Column(db.Integer, db.ForeignKey('taxonomy.id'))
    name = db.Column(db.String(80))

    def __init__(self, category):
        self.tid = category['tid']
        self.name = category['name']

    def __repr__(self):
        return '<Category %r>' % self.id

    def serialize(self):
        """Transforms a model into a dictionary which can be dumped to JSON."""
        # first we get the names of all the columns on your model
        columns = [c.key for c in class_mapper(self.__class__).columns]
        # then we return their values in a dict
        return dict((c, getattr(self, c)) for c in columns)


class Keyword(db.Model):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True, index=True)
    cid = db.Column(db.Integer, db.ForeignKey('category.id'))
    keyword = db.Column(db.String(100))

    def __init__(self, keyword):
        self.cid = keyword['cid']
        self.keyword = keyword['keyword']

    def __repr__(self):
        return '<Keyword %r>' % self.id

    def serialize(self):
        """Transforms a model into a dictionary which can be dumped to JSON."""
        # first we get the names of all the columns on your model
        columns = [c.key for c in class_mapper(self.__class__).columns]
        # then we return their values in a dict
        return dict((c, getattr(self, c)) for c in columns)
