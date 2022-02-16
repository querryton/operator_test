SECRET_KEY = 'dev'
# 配置项目运行再debug调试模式下
DEBUG = True
# 数据库连接配置
SQLALCHEMY_DATABASE_URI = "mysql://root:root@127.0.0.1:3306/operator_test?charset=utf8mb4"
# 动态追踪修改设置，如未设置只会提示警告
SQLALCHEMY_TRACK_MODIFICATIONS = True
# 查询时会显示原始SQL语句
SQLALCHEMY_ECHO = False
# 设置连接池大小
SQLALCHEMY_POOL_SIZE = 500
# 连接池会允许“上溢”无限多的新连接
SQLALCHEMY_MAX_OVERFLOW = -1