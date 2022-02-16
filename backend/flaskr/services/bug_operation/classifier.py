import re
import math
import collections
from string import punctuation
import nltk
from nltk.stem.lancaster import LancasterStemmer


class Classifier:

    def __init__(self, n_gram=1, db=None, Bug=None):
        self.n_gram = n_gram
        self.db = db
        self.Bug = Bug
        self.document_dict = dict()
        self.df = dict()
        self.stop_words = self.__get_stop_words()
        self.init_df()

    @staticmethod
    def __get_stop_words():
        stop_words = []
        stop_words_file = r'F:\graduate_design\operator_test\backend\flaskr\static\enStopWords.txt'
        with open(stop_words_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            for line in lines:
                stop_words.append(line.strip());
        return stop_words

    def __n_gram_bag(self, text):
        text = text.lower()
        text = re.sub("[{}]".format(punctuation), " ", text)
        text = nltk.word_tokenize(text)

        lancaster_stemmer = LancasterStemmer()
        text = [lancaster_stemmer.stem(word) for word in text if word not in self.stop_words]

        n_gram_text = []
        for n in range(1, self.n_gram + 1):
            for i in range(0, len(text) - n + 1):
                init = ""
                for j in range(n):
                    if init != "":
                        init += " "
                    init += text[i + j]
                n_gram_text.append(init)

        return collections.Counter(n_gram_text)

    def init_df(self):
        if self.db and self.Bug:
            bug_result_list = self.db.session.query(self.Bug.id, self.Bug.title, self.Bug.bug_description).all()
            self.update_df([dict(zip(result.keys(), result)) for result in bug_result_list])

    def update_df(self, bugs):
        for bug in bugs:
            text = " " if bug['bug_description'] is None else bug['bug_description']
            text += bug['title']
            word_bag = self.__n_gram_bag(text)
            self.document_dict[bug['id']] = word_bag
            for key in word_bag.keys():
                if key in self.df.keys():
                    self.df[key] += 1
                else:
                    self.df[key] = 1
        self.N = len(self.document_dict)
        print("document Number:", self.N)
        return self.N

    def get_score(self, document_id, keyword_str):
        """
        获取关键词keyword_str关于document_id对应的文档的得分
        :param document_id: 文档的id
        :param keyword_str: 关键词字符串，关键词可能是一个词组或句子
        :return: 关键词keyword_str关于document_id对应的文档的得分
        """

        keyword_list = self.__n_gram_bag(keyword_str)
        document_word_bag = self.document_dict[document_id]

        score = 0
        for keyword in keyword_list:
            tf = (1 + math.log(document_word_bag[keyword], 10)) \
                if keyword in document_word_bag.keys() else 0
            idf = math.log(self.N / self.df[keyword], 10) \
                if keyword in self.df.keys() else math.log(self.N / 1e-10, 10)
            score += (tf * idf) * math.exp(len(nltk.word_tokenize(keyword)) - 1)
        return score

    def classify(self, category_keywords_dict=None):
        """
        分类
        :param category_keywords_dict:
            一个{类别:关键词}的字典，形如下：
            category_keywords_dict = {
                "numerical bug": ["numerical", "inf", "nan"],
                "logical bug": ["system", "design error"]
            }
        :return:一个列表
        """
        if category_keywords_dict is None:
            category_keywords_dict = {
                "Invalid Range": ["zero division", "non-positive value for log function", "Inf", "NaN"],
                "API Misuse": ["order of parameters", "miss parameters"],
                "Incorrect Data Preprocessing": ["incorrect data preprocessing",
                                                 "missing or repeated data normalization", "NaN"],
                "Incorrect Floating Point Type": ["incorrect floating point type", "float16", "float32", "NaN"],
                "Code Logic Error": ["mistakenly implement the functionality", "code logic"],
                "Gradient Explosion": ["gradient explosion", "immediate flashpoint",
                                       "gradient becomes extremely large", "numerical overflow of weights"],
                "Runtime Environment": ["runtime environment", "third-party libraries"],
                "Bad Inputs": ["bad inputs", "ill-formed inputs", "images and labels"],
                "Improper Model Configuration": ["improper model configuration",
                                                 "improper model structure or parameters"],
            }

        results = list()
        for document_id in self.document_dict.keys():
            score = dict()
            for category, keywords in category_keywords_dict.items():
                score[category] = 0
                for keyword in keywords:
                    score[category] += self.get_score(document_id, keyword)
            item = {
                "id": document_id,
                "category": None
            }
            max_score = 0
            for category, score in score.items():
                if score > max_score:
                    item = {
                        "id": document_id,
                        "category": category
                    }
                    max_score = score
            results.append(item)

        if self.Bug:
            for result in results:
                bug = self.Bug.query.get(result['id'])
                del result['id']
                result['bug'] = bug.serialize()

        return results

