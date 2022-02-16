import math

from flaskr import db
from flaskr.models.operator_management import Operator
from flaskr.services.operator_management import parameter as parameter_service


def create_operator(operator):
    operator_obj = Operator(operator)
    db.session.add(operator_obj)
    db.session.commit()
    operator['id'] = operator_obj.id
    for parameter in operator['parameters']:
        parameter['oid'] = operator['id']
        parameter_service.create_parameter(parameter)
    db.session.commit()
    return {
        'operator': operator
    }


def retrieve_operator(field_name, keywords):
    if field_name == "name":
        operators = Operator.query.filter(Operator.name.like('%' + keywords + '%')).all()
    elif field_name == "library":
        operators = Operator.query.filter(Operator.library.like('%' + keywords + '%')).all()

    operators = [operator.serialize() for operator in operators]
    for operator in operators:
        operator['parameters'] = parameter_service.retrieve_parameter("oid", operator['id'])['parameters']
    return {
        'operators': operators
    }


def retrieve_operator_page(field_name, keywords, page_index, page_size):
    if field_name == "name":
        operators_obj = Operator.query.filter(Operator.name.like('%' + keywords + '%')).limit(page_size).offset(
            (page_index - 1) * page_size)
        total = Operator.query.filter(Operator.name.like('%' + keywords + '%')).count()
    elif field_name == "library":
        operators_obj = Operator.query.filter(Operator.library.like('%' + keywords + '%')).limit(page_size).offset(
            (page_index - 1) * page_size)
        total = Operator.query.filter(Operator.library.like('%' + keywords + '%')).count()

    total_pages = math.ceil(total / page_size)

    operators = [operator_obj.serialize() for operator_obj in operators_obj]
    for operator in operators:
        operator['parameters'] = parameter_service.retrieve_parameter("oid", operator['id'])['parameters']
    return {
        'operators': operators,
        'total_pages': total_pages
    }


def update_operator(operator):
    parameters = operator['parameters']
    del (operator['parameters'])

    pids = set()
    for parameter in parameters:
        if 'id' in parameter:
            parameter_service.update_parameter(parameter)
        else:
            parameter['oid'] = operator['id']
            parameter_service.create_parameter(parameter)
        pids.add(parameter['id'])

    Operator.query.filter_by(id=operator['id']).update(operator)
    operator['parameters'] = parameters
    db.session.commit()

    parameters = parameter_service.retrieve_parameter('oid', operator['id'])['parameters']
    for parameter in parameters:
        if parameter['id'] not in pids:
            parameter_service.delete_paramter(parameter['id'])

    return {
        'operator': operator
    }


def delete_operator(id):
    operator_obj = Operator.query.get(id)
    parameters = parameter_service.retrieve_parameter('oid', operator_obj.id)['parameters']
    for parameter in parameters:
        parameter_service.delete_paramter(parameter['id'])
    db.session.delete(operator_obj)
    db.session.commit()
    return {
        'id': id
    }


def get_operator():
    operators = Operator.query.all()
    operators = [operator.serialize() for operator in operators]

    for operator in operators:
        operator['parameters'] = parameter_service.retrieve_parameter("oid", operator['id'])['parameters']
    return {
        'operators': operators,
    }


def get_operator_page(page_index, page_size):
    operators = Operator.query.limit(page_size).offset((page_index - 1) * page_size)
    operators = [operator.serialize() for operator in operators]

    total = Operator.query.count()
    total_pages = math.ceil(total / page_size)

    for operator in operators:
        operator['parameters'] = parameter_service.retrieve_parameter("oid", operator['id'])['parameters']
    return {
        "operators": operators,
        "total_pages": total_pages
    }
