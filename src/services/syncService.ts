/*
import os
import xmltodict
from collections import OrderedDict
from sqlalchemy.orm import sessionmaker
import lib.db as db
from lib.db import Book, Author, Author_Book, Identifier, Subject
import logging

logging.basicConfig(level=logging.DEBUG)
Session = sessionmaker(bind=db.engine)
ses = Session()


def googleInfo(isbn):
    # https://www.googleapis.com/books/v1/volumes?q=isbn=9781101543290&maxResults=1&key=AIzaSyAhMowOrpIijtT9jD_2T8vipx6v-Zzz4xM
    pass


def goodReadsInfo(isbn):
    # https://www.goodreads.com/book/isbn/<<isbn>>?key=Ed8MNpTve56VnJB8lVBfA&format=xml
    # https://www.goodreads.com/work/<<workid>>/series?format=xml&key=Ed8MNpTve56VnJB8lVBfA
    # key: Ed8MNpTve56VnJB8lVBfA
    #secret: M2nHcO3T6SS3sd6dY5ErBPpA5LAigpaNlSRib7l0Q
    #will need at least 1 second sleep
    pass


def file_get_contents(filename):
    with open(filename) as f:
        return f.read()


def parseOpf(opfFile, file):
    metaData = {"file": file, "isbn": None, "identifiers": [], "authors": [], "subjects": [], "description": None, "publisher": None, "series": None, "series_index": None}
    rawData = xmltodict.parse(file_get_contents(opfFile))
    rawMetafdata = rawData['package']['metadata']
    for rawIdentifier in rawMetafdata['dc:identifier']:
        if rawIdentifier['@opf:scheme'] == "ISBN":
            metaData["isbn"] = rawIdentifier['#text']
        metaData["identifiers"].append({'type': rawIdentifier['@opf:scheme'], 'id': rawIdentifier['#text']})
    metaData['publication_date'] = rawMetafdata['dc:date']
    if 'dc:description' in rawMetafdata:
        metaData['description'] = rawMetafdata['dc:description']
    metaData['title'] = rawMetafdata['dc:title']
    if 'dc:publisher' in rawMetafdata:
        metaData['publisher'] = rawMetafdata['dc:publisher']
    metaData['language'] = rawMetafdata['dc:language']
    if type(rawMetafdata['dc:creator']) is OrderedDict:
        rawCreator = rawMetafdata['dc:creator']
        if rawCreator['@opf:role'] == 'aut':
            metaData['authors'].append(rawCreator['#text'])
    else:
        for rawCreator in rawMetafdata['dc:creator']:
            if rawCreator['@opf:role'] == 'aut':
                metaData['authors'].append(rawCreator['#text'])
    if 'dc:subject' in rawMetafdata:
        if type(rawMetafdata['dc:subject']) is list:
            metaData["subjects"] = rawMetafdata['dc:subject']
        else:
            metaData["subjects"].append(rawMetafdata['dc:subject'])
    for meta in rawMetafdata['meta']:
        if meta['@name'] == 'calibre:series':
            metaData["series"] = meta['@content']
        if meta['@name'] == 'calibre:series_index':
            metaData["series_index"] = meta['@content']

    return metaData


ebooksDir = '/Volumes/Media/ebooks'
opfs = [x for x in os.listdir(ebooksDir) if x.endswith(".opf")]
print len(opfs)
for opf in opfs:
    metaData = parseOpf(ebooksDir + '/' + opf, opf.replace('.opf', ''))
    book = ses.query(Book).filter(Book.file == metaData['file']).scalar()
    if book:
        continue
    book = Book(
        isbn=metaData['isbn'],
        file=metaData['file'],
        title=metaData['title'],
        description=metaData['description'],
        publisher=metaData['publisher'],
        publication_date=metaData['publication_date'],
        language=metaData['language'],
        series=metaData["series"],
        series_index=metaData["series_index"])
    ses.add(book)
    for authorName in metaData['authors']:
        author = ses.query(Author).filter(Author.name == authorName).scalar()
        if not author:
            author = Author(name=authorName)
            ses.add(author)
        authorBook = Author_Book(book=book, author=author)
        ses.add(authorBook)
    for ident in metaData['identifiers']:
        identifier = Identifier(book=book, type=ident['type'], identifier=ident['id'])
        ses.add(identifier)
    for sub in metaData['subjects']:
        subject = Subject(book=book, subject=sub)
        ses.add(subject)
ses.commit()


*/
