// Include the AWS SDK module

const AWS = require('aws-sdk');
const https = require('https');
let dynamodb = new AWS.DynamoDB.DocumentClient();
let date = new Date();
let now = date.toISOString();

let data_length = 100; 
let api_host = 'pro-api.coinmarketcap.com';
let api_path = '/v1/cryptocurrency/listings/latest'; // endpoint = cryptocurrency

// Make an API request
function https_request(){
     return new Promise((resolve, reject) => {
        const options = {
            host: api_host,
            path: api_path,
            method: 'GET',
            'headers': {
                'Accept': 'application/json',
                'X-CMC_PRO_API_KEY': '92eafc9b-cac6-4fdc-bd8a-c6d121c307c9'
            }
        };

        const req = https.request(options, (res) => {
            let rawData = '';

            res.on('data', chunk => {
                rawData += chunk;
            });

            res.on('end', () => {
                try {
                    resolve(JSON.parse(rawData));
                    }
                catch (err) {
                    reject(new Error(err));
                }
            });

        });

        req.on('error', (e) => {
            reject(e.message);
        });

        req.write('');
        req.end();
    });
}


//Get crypto Symbols
function httprequest_get_Symbol(rawData) {
    
   return new Promise((resolve, reject) => {
       
        
       var symbol_array = [];

          try {
                    for(var i=0; i<data_length; i++){
                    symbol_array.push(rawData.data[i].symbol);
                    }
                    resolve(symbol_array);
                } catch (err) {
                    reject(new Error(err));
                }
     
        
    });
    
    
}

// Get Crypto Price
function httprequest_get_Price(rawData) {
    
  return new Promise((resolve, reject) => {
       
        
       var price_array = [];

          try {
                    for(var i=0; i<data_length; i++){
                    price_array.push(rawData.data[i].quote.USD.price);
                    }
                    resolve(price_array);
                } catch (err) {
                    reject(new Error(err));
                }
     
        
    });
}

//Get crypto 24h transaction Volume
function httprequest_get_Volume(rawData) {
    
   return new Promise((resolve, reject) => {
       
        
       var volume_array = [];

          try {
                    for(var i=0; i<data_length; i++){
                    volume_array.push(rawData.data[i].quote.USD.volume_24h);
                    }
                    resolve(volume_array);
                } catch (err) {
                    reject(new Error(err));
                }
     
        
    });
}


// Store response in the database
exports.handler = async (event) => {
  
  
     let params = [] ; 
     let rawData = await https_request();
     let symbol_data = await httprequest_get_Symbol(rawData);
     let price_data = await httprequest_get_Price(rawData);
     let volume_data = await httprequest_get_Volume(rawData);
     for(var i=0 ; i<data_length ; i++) {
      params = {
            Item: {
                'ID': symbol_data[i],
                'Price': price_data[i],
                'Volume 24H': volume_data[i],
                'Date': now
            },

            TableName: 'MyNoteDatabase'
        };
     if(params !=null && params !=undefined && params != '')
    await dynamodb.put(params).promise();
     }
    let message = "Case successfully submitted";
    const response = {
        statusCode: 200,
        body: message
    };
    // Return the response constant
    return response;
};
