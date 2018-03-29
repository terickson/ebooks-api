import * as fs from 'fs';
import * as xml2js from 'xml2js';
import {logger} from '../utils/logger'
import {properties} from '../utils/properties'
import {models} from '../models/index';
import {ValidationError, UniqueConstraintError, Op}  from "sequelize";
import * as goodreads from 'goodreads-api-node';
import * as sleep from 'await-sleep';

const gr = goodreads(properties.goodreadsInfo);

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
  syncBooksWithGr();
}

function parseOpf(rawData, fileName){
    let metaData = {"file": fileName.replace('.opf', ''), "isbn": null, "identifiers": [], "authors": [], "subjects": [], "description": null, "publisher": null, "series": null, "series_index": null};
    let rawMetafdata = rawData['package']['metadata'][0];
    for(let rawIdentifierIdx in rawMetafdata['dc:identifier']){
        let rawIdentifier = rawMetafdata['dc:identifier'][rawIdentifierIdx];
        if (rawIdentifier['$']['opf:scheme'] === "calibre"){
            continue;
        }
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
  try{
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
          try{
            if(!author){
              author = await models.Author.create({name: metaData['authors'][authorIdx]});
            }
          }catch(err){
            if(err instanceof UniqueConstraintError){
              author = await models.Author.find({ where: {name: metaData['authors'][authorIdx]} });
            }else{
              throw err;
            }
          }
          let authorBook = await models.AuthorBook.create({bookId:book.id, authorId:author.id});
      }

      for(let identIdx in metaData['identifiers']){
          let identifier = await models.Identifier.create({bookId:book.id, type: metaData['identifiers'][identIdx]['type'], identifier: metaData['identifiers'][identIdx]['id']});
      }

      for(let subIdx in metaData['subjects']){
          let subject = await models.Subject.create({bookId: book.id, subject: metaData['subjects'][subIdx]});
      }
    }catch(err){
      if(typeof err.message.array === 'function') {
        // express-validator error
        err.message.fields = err.array();
        logger.error("function based error creating book: ", err.message);
      } else if(err instanceof UniqueConstraintError){
        logger.error("Unique Constraint Error creating book: " + JSON.stringify((err as UniqueConstraintError).errors));
      } else if(err instanceof ValidationError){
        logger.error("Validation Error creating book: ", err.message);
      } else {
        logger.error("Error creating book: ", err);
      }
    }
}

async function syncBooksWithGr(){
  let books = await models.Book.findAll({ where: {grid: null, isbn: {[Op.ne]: null}}});
  logger.debug("books to sync with gr " + books.length);
  for(let book of books){
    try{
      await setGrInfo(book);
      logger.debug("book(" + book.id + ") synced with gr.");
    }catch(err){
      logger.error("Error sync book(" + book.id + "): ", err);
    }
    await sleep(1000);
  }
}

async function setGrInfo(book){
  if(!book.isbn) return;
  let params:any = {q: book.isbn};
  let srResp:any = await gr.searchBooks(params);
  if(!srResp.search.results.work.best_book.id._){
    return false;
  }
  book.grid = srResp.search.results.work.best_book.id._;
  let sbResp:any = await gr.showBook(srResp.search.results.work.best_book.id._);
  book.rating = sbResp.book.average_rating.trim();
  book.pages = sbResp.book.num_pages.trim()

  if(Array.isArray(sbResp.book.series_works.series_work)){
    for(let series of sbResp.book.series_works.series_work){
      if(!series.user_position.trim()){
        continue;
      }
      book.series_index = series.user_position.trim();
      book.series = series.series.title.trim();
    }
  }else if(sbResp.book.series_works.series_work){
    if(sbResp.book.series_works.series_work.user_position.trim()){
      book.series_index = sbResp.book.series_works.series_work.user_position.trim();
      book.series = sbResp.book.series_works.series_work.series.title.trim();
    }
  }
  book.save();
}
