from flaskr import app

from flaskr.blueprints import bug_operation
from flaskr.blueprints import operator_management
from flaskr.blueprints import test_system

if __name__ == '__main__':
    app.register_blueprint(bug_operation.bp)
    app.register_blueprint(operator_management.bp)
    app.register_blueprint(test_system.bp)
    app.run(threaded=True)
