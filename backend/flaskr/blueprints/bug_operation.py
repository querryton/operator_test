from flask import (Blueprint, request, jsonify)
from flaskr import classsifier
from flaskr.services.bug_operation import taxonomy
from flaskr.services.bug_operation import spider
from flaskr.models.bug_operation import Bug
from instance.status import Status

# from werkzeug.security import check_password_hash, generate_password_hash

bp = Blueprint('bug_operation', __name__, url_prefix='/bug_operation')


@bp.route(rule="/get_bug/<string:bug_id>", methods=["get", "post"])
def get_bug(bug_id):
    print(bug_id)
    bug = Bug.query.get(bug_id)
    data = {
        'status': Status.OK.get_data(),
        'data': bug.serialize()
    }
    return jsonify(data)


@bp.route(rule="/get_bugs", methods=["post"])
def get_bugs():
    library = request.json['library']
    page = request.json['page']
    data = spider.get_bugs(library, page)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/get_all_bugs", methods=["post"])
def get_all_bugs():
    library = request.json['library']
    data = spider.get_bugs(library, "all")
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/get_bugs_from_database", methods=["post"])
def get_bugs_from_database():
    library = request.json['library']
    page_index = request.json['page_index']  # 页码
    page_size = request.json['page_size']  # 每页信息数目
    data = spider.get_bugs_from_database(library, page_index, page_size)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/classify", methods=["get", "post"])
def classify():
    taxonomy_id = request.json['taxonomy_id']
    category_keywords_dict = taxonomy.get_category_keywords_dict(taxonomy_id)
    results = classsifier.classify(category_keywords_dict)
    data = {'results': results}
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/get_classifier_setting", methods=["get", "post"])
def get_classifier_setting():
    data = taxonomy.get_classifier_setting()
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/create_taxonomy", methods=["get", "post"])
def create_taxonomy():
    taxonomy = request.json['taxonomy']
    data = taxonomy.create_taxonomy(taxonomy)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/delete_taxonomy", methods=["get", "post"])
def delete_taxonomy():
    id = request.json['id']
    data = taxonomy.delete_taxonomy(id)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/update_taxonomy", methods=["get", "post"])
def update_taxonomy():
    taxonomy = request.json['taxonomy']
    data = taxonomy.update_taxonomy(taxonomy)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/create_category", methods=["get", "post"])
def create_category():
    tid = request.json['tid']
    category = request.json['category']
    data = taxonomy.create_category(tid, category)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/delete_category", methods=["get", "post"])
def delete_category():
    id = request.json['id']
    data = taxonomy.delete_category(id)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/update_category", methods=["get", "post"])
def update_category():
    category = request.json['category']
    data = taxonomy.update_category(category)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/", methods=["get", "post"])
def index():
    return "ok"
