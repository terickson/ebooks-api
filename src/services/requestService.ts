import requestPromise = require('request-promise-native');
import request = require('request');

export function getRequestPromise(requestUrl:string, headers:any): Promise<requestPromise.FullResponse>{
  let requestOptions:requestPromise.OptionsWithUrl = ({
      url: requestUrl,
      method: "GET",
      strictSSL: false,
      resolveWithFullResponse: true,
      headers: headers,
      json: true
    } as requestPromise.OptionsWithUrl);
    return requestPromise(requestOptions).promise();
}

export function getStream(requestUrl:string, headers:any): any{
  let requestOptions:any = {
      url: requestUrl,
      method: "GET",
      strictSSL: false,
      headers: headers
    };
    return request(requestOptions);
}

export function postRequestPromise(requestUrl:string, headers:any, data:any): Promise<requestPromise.FullResponse>{
  let requestOptions:requestPromise.OptionsWithUrl = ({
      url: requestUrl,
      method: "POST",
      strictSSL: false,
      resolveWithFullResponse: true,
      headers: headers,
      json: data
    } as requestPromise.OptionsWithUrl);
    return requestPromise(requestOptions).promise();
}
