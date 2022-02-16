from enum import Enum, unique


@unique
class Status(Enum):
    OK = {"200": "成功"}
    NOT_FOUND = {"404": "Not Found"}
    SUCCESS = {"100001": "成功"}
    FAIL = {"100000": "失败"}
    PARAM_IS_NULL = {"100002": "请求参数为空"}
    PARAM_ILLEGAL = {"100003": "请求参数非法"}
    JSON_PARSE_FAIL = {"100004": "JSON转换失败"}
    REPEATED_COMMIT = {"100005": "重复提交"}
    SQL_ERROR = {"100006": "数据库异常"}
    SQL_KEY_DUPLICATE = {"100007": "数据库主键重复"}
    NETWORK_ERROR = {"100015": "网络异常"}
    UNKNOWN_ERROR = {"100099": "未知异常"}

    def get_data(self):
        """
        根据枚举名称取状态码code
        :return: 状态status
        """
        return {
            "code": self.get_code(),
            "message": self.get_msg()
        }

    def get_code(self):
        """
        根据枚举名称取状态码code
        :return: 状态码code
        """
        return list(self.value.keys())[0]

    def get_msg(self):
        """
        根据枚举名称取状态说明message
        :return: 状态说明message
        """
        return list(self.value.values())[0]


if __name__ == '__main__':
    # 打印状态码信息
    code = Status.OK.get_code()
    print("code:", code)
    # 打印状态码说明信息
    msg = Status.OK.get_msg()
    print("msg:", msg)

    print()

    # 遍历枚举
    for status in Status:
        print(status.name, ":", status.value)
