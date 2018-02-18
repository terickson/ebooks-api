import * as fs from 'fs';
import * as xml2js from 'xml2js';
import {logger} from '../utils/logger'
import {properties} from '../utils/properties'
import { models } from '../models/index';

export function sync()
{
  let parser = new xml2js.Parser()
  fs.readdir(properties.server.ebooksDir, function(err, files) {
      if (err){
        logger.error("Could not read dir", err);
        return;
      }
      files.forEach(function(fileName) {
        if(fileName.indexOf('.opf') === -1){
          return;
        }
        fs.readFile(properties.server.ebooksDir+'/'+fileName, 'utf8', function(err, contents) {
          if (err){
            logger.error("Could not read contents of file: " + fileName, err);
            return;
          }
          parser.parseString(contents, function (err, parsedData) {
            if (err){
              logger.error("Could not parse contents of file: " + fileName, err);
              return;
            }
            let metadata = parseOpf(parsedData, fileName);
            createBook(metadata);
          });
        });
      });
  });
}

function parseOpf(rawData, fileName){
    let metaData = {"file": fileName.replace('.opf', ''), "isbn": null, "identifiers": [], "authors": [], "subjects": [], "description": null, "publisher": null, "series": null, "series_index": null};
    let rawMetafdata = rawData['package']['metadata'][0];
    for(let rawIdentifierIdx in rawMetafdata['dc:identifier']){
        let rawIdentifier = rawMetafdata['dc:identifier'][rawIdentifierIdx];
        if (rawIdentifier['$']['opf:scheme'] === "ISBN"){
            metaData["isbn"] = rawIdentifier['_'];
        }
        metaData["identifiers"].push({'type': rawIdentifier['$']['opf:scheme'], 'id': rawIdentifier['_']});
    }
    metaData['publication_date'] = rawMetafdata['dc:date'][0];

    if (rawMetafdata.hasOwnProperty('dc:description')){
        metaData['description'] = rawMetafdata['dc:description'][0];
    }
    metaData['title'] = rawMetafdata['dc:title'][0];

    if (rawMetafdata.hasOwnProperty('dc:publisher')){
        metaData['publisher'] = rawMetafdata['dc:publisher'][0];
    }
    metaData['language'] = rawMetafdata['dc:language'][0];

    for(let rawCreatorIdx in rawMetafdata['dc:creator']){
      let rawCreator = rawMetafdata['dc:creator'][rawCreatorIdx];
      if(rawCreator['$']['opf:role'] === 'aut'){
        metaData['authors'].push(rawCreator['_'])
      }
    }

    if (rawMetafdata.hasOwnProperty('dc:subject')){
        if(rawMetafdata['dc:subject'].hasOwnProperty('length')){
            metaData["subjects"] = rawMetafdata['dc:subject'];
        }else{
            metaData["subjects"].push(rawMetafdata['dc:subject']);
        }
    }

    for(let metaIdx in rawMetafdata['meta']){
        let meta = rawMetafdata['meta'][metaIdx];
        if(meta['$']['name'] === 'calibre:series'){
            metaData["series"] = meta['$']['content'];
        }
        if(meta['$']['name'] === 'calibre:series_index'){
            metaData["series_index"] = meta['$']['content'];
        }
    }
    return metaData
}

async function createBook(metaData){
  let book = await models.Book.find({ where: {file: metaData['file']} });
  if(book){
    return;
  }
  book = await models.Book.create({
      isbn: metaData['isbn'],
      file: metaData['file'],
      title: metaData['title'],
      description: metaData['description'],
      publisher: metaData['publisher'],
      publication_date: metaData['publication_date'],
      language: metaData['language'],
      series: metaData["series"],
      series_index: metaData["series_index"]});

  for(let authorIdx in metaData['authors']){
      let author = await models.Author.find({ where: {name: metaData['authors'][authorIdx]} });
      if(!author){
        author = await models.Author.create({name: metaData['authors'][authorIdx]});
      }
      let authorBook = await models.AuthorBook.create({bookId:book.id, authorId:author.id});
  }

  for(let identIdx in metaData['identifiers']){
      let identifier = await models.Identifier.create({bookId:book.id, type: metaData['identifiers'][identIdx]['type'], identifier: metaData['identifiers'][identIdx]['id']});
  }

  for(let subIdx in metaData['subjects']){
      let subject = await models.Subject.create({bookId: book.id, subject: metaData['subjects'][subIdx]});
  }
}

/*
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

*/
