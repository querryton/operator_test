from flaskr import db
from flaskr.models.operator_management import Parameter


def create_parameter(parameter):
    parameter_obj = Parameter(parameter)
    db.session.add(parameter_obj)
    db.session.commit()
    parameter['id'] = parameter_obj.id
    return {
        "parameter": parameter
    }


def retrieve_parameter(field_name, keywords):
    if field_name == 'id':
        return {
            'parameter': Parameter.query.get(keywords)
        }
    if field_name == 'oid':
        parameters = Parameter.query.filter_by(oid=keywords).all()
    elif field_name == 'name':
        parameters = Parameter.query.filter(Parameter.name.like('%' + keywords + '%')).all()
    parameters = [parameter.serialize() for parameter in parameters]

    return {
        'parameters': parameters
    }


def update_parameter(parameter):
    Parameter.query.filter_by(id=parameter['id']).update(parameter)
    db.session.commit()
    return {
        'parameter': parameter
    }


def delete_paramter(id):
    parameter = Parameter.query.get(id)
    db.session.delete(parameter)
    db.session.commit()
    return {
        'id': id
    }
