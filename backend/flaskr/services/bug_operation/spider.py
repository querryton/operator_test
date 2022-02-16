# -*- coding: utf-8 -*-
import math
import _thread
import requests
import time
from flaskr import db
from flaskr import classsifier
from flaskr.models.bug_operation import Bug

headers = {
    "Authorization": "token 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"
}


class Spider:
    def __init__(self, headers, db=None, Bug=None, classifier=None):
        self.headers = headers
        self.db = db
        self.Bug = Bug
        self.classifier = classifier
        self.request_session = requests.Session()

    def run(self, library, page):
        self.library = library
        self.url = "https://api.github.com/repos/%s/%s/issues" % (library, library)
        if page == 'all':
            bugs = self.crawl_all_pages()
        else:
            bugs = self.crawl_page(page)
        return bugs

    def crawl_page(self, page, per_page=30):
        params = {
            "state": "all",
            "labels": "type:bug",
            "page": page,
            "per_page": per_page
        }
        while True:
            try:
                ts = time.time()
                response = self.request_session.get(self.url, params=params, headers=self.headers, timeout=5)
                if response.status_code == 200:
                    print("spend %ss on crawling %s page %s " % (time.time() - ts, self.library, page))
                    bugs = self.process_data(response.json())
                    ts = time.time()
                    self.store(bugs)
                    print("spend %ss on storing %s page %s " % (time.time() - ts, self.library, page))
                    return bugs
                else:
                    print("!Code:", response.status_code)
                    time.sleep(5)
                    continue
            except requests.exceptions.RequestException as e:
                print("requests.exceptions.RequestException:", e)
                pass

    def crawl_all_pages(self):
        page = 0
        bugs = []
        ts = time.time()
        while True:
            page += 1
            bugs_page = self.crawl_page(page, 100)
            bugs.extend(bugs_page)
            if not bugs_page:
                print("spend totaly %ss on crawling all %s pages " % (time.time() - ts, self.library))
                break
        return bugs

    def process_data(self, bugs):
        new_bugs = []
        for bug in bugs:
            new_bug = dict()
            new_bug['id'] = bug['id']
            new_bug['library'] = self.library
            new_bug['number'] = bug['number']
            new_bug['title'] = bug['title']
            new_bug['author'] = bug['user']['login']
            new_bug['created_at'] = bug['created_at']
            new_bug['updated_at'] = bug['updated_at']
            new_bug['bug_description'] = bug['body']
            new_bug['link'] = bug['html_url']
            new_bug['labels'] = [{'name': label['name'], 'color': label['color']} for label in bug['labels']]
            new_bug['state'] = bug['state']
            new_bug['answered'] = False if bug['comments'] == 0 else True
            new_bug['comment_number'] = bug['comments']
            new_bugs.append(new_bug)
        return new_bugs

    def store(self, bugs):
        if self.db is None or self.Bug is None:
            return
        add = []
        for bug in bugs:
            bug_obj = self.Bug.query.get(bug["id"])
            if bug_obj is None:
                add.append(bug)
            else:
                self.Bug.query.filter(self.Bug.id == bug['id']).update(bug)
                self.db.session.commit()
        if len(add) != 0:
            self.db.session.execute(self.Bug.__table__.insert(), add)
            self.db.session.commit()
            if self.classifier:
                self.classifier.update_df(add)


def get_bugs(library, page):
    spider = Spider(headers, db, Bug, classsifier)
    bugs = spider.run(library, page)
    return {
        'bugs': bugs,
        'next_page': page + 1 if page != "all" else None
    }


def get_bugs_from_database(library, page_index, page_size):
    total = Bug.query.filter(Bug.library == library).count()
    total_pages = math.ceil(total / page_size)

    bugs = Bug.query.filter(Bug.library == library).limit(page_size).offset((page_index - 1) * page_size)
    bugs = [bug.serialize() for bug in bugs]
    return {
        'bugs': bugs,
        'total_pages': total_pages
    }
