from flask import (Blueprint, request, jsonify)
from flaskr.services.operator_management import operator as operator_service
from instance.status import Status

bp = Blueprint('operator_management', __name__, url_prefix='/operator_management')


@bp.route(rule="/create_operator", methods=['post'])
def create_operator():
    # operator被解释为dict类型
    operator = request.json['operator']
    data = operator_service.create_operator(operator)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/retrieve_operator", methods=['post'])
def retrieve_operator():
    # operator被解释为dict类型
    field_name = request.json['field_name']
    keywords = request.json['keywords']
    data = operator_service.retrieve_operator(field_name, keywords)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/retrieve_operator_page", methods=['post'])
def retrieve_operator_page():
    field_name = request.json['field_name']
    keywords = request.json['keywords']
    page_index = request.json['page_index']
    page_size = request.json['page_size']
    data = operator_service.retrieve_operator_page(field_name, keywords, page_index, page_size)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/update_operator", methods=['post'])
def update_operator():
    # operator被解释为dict类型
    operator = request.json['operator']
    data = operator_service.update_operator(operator)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/delete_operator", methods=['post'])
def delete_operator():
    # id被解释为int类型
    id = request.json['id']
    data = operator_service.delete_operator(id)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/get_operator", methods=['post'])
def get_operator():
    data = operator_service.get_operator()
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/get_operator_page", methods=['post'])
def get_operator_page():
    page_index = request.json['page_index']  # 页码
    page_size = request.json['page_size']  # 每页信息数目
    data = operator_service.get_operator_page(page_index, page_size)
    data = {
        'status': Status.OK.get_data(),
        'data': data
    }
    return jsonify(data)


@bp.route(rule="/", methods=['get', 'post'])
def index():
    return "ok"
