from flaskr import db
from flaskr.models.bug_operation import Taxonomy, Category, Keyword


def get_category_keywords_dict(taxonomy_id):
    category_keywords_dict = dict()
    categorys_obj = Category.query.filter(Category.tid == taxonomy_id).all()
    for category_obj in categorys_obj:
        category_keywords_dict[category_obj.name] = list()
        keywords_obj = Keyword.query.filter(Keyword.cid == category_obj.id).all()
        for keyword_obj in keywords_obj:
            category_keywords_dict[category_obj.name].append(keyword_obj.keyword)
    return category_keywords_dict


def get_classifier_setting():
    classifier_setting = list()
    taxonomys_obj = Taxonomy.query.all()
    for taxonomy_obj in taxonomys_obj:
        classifier_setting.append(taxonomy_obj.serialize())
        categorys_obj = Category.query.filter(Category.tid == taxonomy_obj.id).all()
        categorys = list()
        for category_obj in categorys_obj:
            categorys.append(category_obj.serialize())
            del categorys[-1]['tid']
            keywords_obj = Keyword.query.filter(Keyword.cid == category_obj.id).all()
            keywords = list()
            for keyword_obj in keywords_obj:
                keywords.append(keyword_obj.serialize())
                del keywords[-1]['cid']
            categorys[-1]['keywords'] = keywords
        classifier_setting[-1]['categorys'] = categorys
    return {
        'classifier_setting': classifier_setting
    }


def create_taxonomy(taxonomy):
    taxonomy_obj = Taxonomy(taxonomy)
    db.session.add(taxonomy_obj)
    db.session.commit()
    return {
        'taxonomy': taxonomy_obj.serialize()
    }


def update_taxonomy(taxonomy):
    Taxonomy.query.filter_by(id=taxonomy['id']).update(taxonomy)
    db.session.commit()
    return {
        'taxonomy': taxonomy
    }


def delete_taxonomy(id):
    categorys_obj = Category.query.filter(Category.tid == id).all()
    for category_obj in categorys_obj:
        keywords_obj = Keyword.query.filter(Keyword.cid == category_obj.id).all()
        for keyword_obj in keywords_obj:
            db.session.delete(keyword_obj)
        db.session.commit()
        db.session.delete(category_obj)
    db.session.commit()
    taxonomy_obj = Taxonomy.query.get(id)
    db.session.delete(taxonomy_obj)
    db.session.commit()
    return {
        'id': id
    }


def create_category(tid, category):
    keywords = category['keywords']
    del category['keywords']
    category['tid'] = tid
    category_obj = Category(category)
    db.session.add(category_obj)
    db.session.commit()
    category['id'] = category_obj.id
    del category['tid']

    for keyword in keywords:
        if 'id' in keyword.keys():
            del keyword['id']
        keyword['cid'] = category_obj.id
        keyword_obj = Keyword(keyword)
        db.session.add(keyword_obj)
        db.session.commit()
        keyword['id'] = keyword_obj.id
        del keyword['cid']

    category['keywords'] = keywords
    return {
        'category': category
    }


def delete_category(id):
    keywords_obj = Keyword.query.filter(Keyword.cid == id).all()
    for keyword_obj in keywords_obj:
        db.session.delete(keyword_obj)
    category_obj = Category.query.get(id)
    db.session.delete(category_obj)
    db.session.commit()
    return {
        'id': id
    }


def update_category(category):
    keywords = category['keywords']
    cid = category['id']
    del category['keywords'], category['id']
    Category.query.filter_by(id=cid).update(category)
    db.session.commit()

    for keyword in keywords:
        if 'id' not in keyword.keys() or keyword['id'] < 0:
            if 'id' in keyword.keys():
                del keyword['id']
            keyword['cid'] = cid
            keyword_obj = Keyword(keyword)
            db.session.add(keyword_obj)
            db.session.commit()
            keyword['id'] = keyword_obj.id
            del keyword['cid']
        else:
            Keyword.query.filter_by(id=keyword['id']).update(keyword)
            db.session.commit()

    new_KIDs = [keyword['id'] for keyword in keywords]
    keywords_db = Keyword.query.filter_by(cid=cid).all()
    for keyword_db in keywords_db:
        if keyword_db.id not in new_KIDs:
            db.session.delete(keyword_db)
            db.session.commit()

    category['keywords'] = keywords
    category['id'] = cid
    return {
        'category': category
    }


def create_keyword(keyword):
    keyword_obj = Keyword(keyword)
    db.session.add(keyword_obj)
    db.session.commit()
    return {
        'keyword': keyword.serialize()
    }


def delete_keyword(id):
    keyword_obj = Keyword.query.get(id)
    db.session.delete(keyword_obj)
    db.session.commit()
    return {
        'id': id
    }
