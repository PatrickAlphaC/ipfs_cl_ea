const { Requester, Validator } = require('@chainlink/external-adapter')
const FormData = require('form-data')
const fs = require('fs-extra')
const IPFS = require('ipfs-core')

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
}

// //  curl -X POST -F file=@test.json "http://127.0.0.1:5001/api/v0/add?quiet=<value>&quieter=<value>&silent=<value>&progress=<value>&trickle=<value>&only-hash=<value>&wrap-with-directory=<value>&chunker=size-262144&pin=true&raw-leaves=<value>&nocopy=<value>&fscache=<value>&cid-version=<value>&hash=sha2-256&inline=<value>&inline-limit=32"

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.
const customParams = {
  text_for_file: false,
  text_for_file_name: false,
  quiet: false,
  quieter: false,
  silent: false,
  progress: false,
  trickle: false,
  pin: false,
  file: false,
  ipfs_host: false,
  endpoint: false,
  arg: false,
  starting_char: false
}

const createRequest = (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id
  const quiet = validator.validated.data.quiet || 'false'
  const quieter = validator.validated.data.quieter || 'false'
  const silent = validator.validated.data.silent || 'false'
  const progress = validator.validated.data.progress || 'false'
  const trickle = validator.validated.data.trickle || 'false'
  const pin = validator.validated.data.pin || 'true'
  let file = validator.validated.data.file
  const arg = validator.validated.data.arg
  const text_for_file = validator.validated.data.text_for_file
  const text_for_file_name = validator.validated.data.text_for_file_name
  const ipfs_host = validator.validated.data.ipfs_host || 'http://127.0.0.1:5001/'
  const endpoint = validator.validated.data.endpoint || 'api/v0/add'
  const starting_char = validator.validated.data.starting_char || 0

  const url = `${ipfs_host}${endpoint}`

  const params = {
    pin,
    trickle,
    progress,
    silent,
    quieter,
    quiet,
    arg
  }

  // This is where you would add method and headers
  // you can add method like GET or POST and add it to the config
  // The default is GET requests
  // method = 'get' 
  // headers = 'headers.....'

  //application/x-www-form-urlencoded
  // headers: { 'content-type': 'application/x-www-form-urlencoded' },
  if (text_for_file_name != null) {
    fs.writeFileSync('./file_uploads/' + text_for_file_name, text_for_file)
    console.log(text_for_file + ' > ' + text_for_file_name)
    console.log(text_for_file_name)
    file = './file_uploads/' + text_for_file_name
    console.log(file)
  }


  const form = new FormData()
  let form_config = {}
  console.log("THIS  THIS THE FILE" + file)
  if (file != null) {
    form.append('file', fs.createReadStream(file))
    form_config = {
      data: form,
      headers: {
        "Content-Type": "multipart/form-data",
        ...form.getHeaders()
      }
    }
  }

  const config = {
    url,
    params,
    method: 'POST',
    ...form_config
  }
  console.log(config)
  // fileUpload(file){ 
  //   const url = 'http://example.com/file-upload'; 
  //   const formData = new FormData(); 
  //   formData.append('file',file) 
  //   const config = { headers: { 'content-type': 'multipart/form-data' } } 
  //   return post(url, formData, config) 
  // }

  // The Requester allows API calls be retry in case of timeout
  // or connection failure
  Requester.request(config, customError)
    .then(response => {
      // It's common practice to store the desired value at the top-level
      // result key. This allows different adapters to be compatible with
      // one another.
      console.log(response.data)
      response.data.result = response.data.Hash
      console.log(starting_char)
      if (starting_char > 0) {
        console.log("test")
        response.data.result = response.data.result.substring(starting_char, response.data.result.length)
        console.log(response.data.result)

      }

      callback(response.status, Requester.success(jobRunID, response))
    })
    .catch(error => {
      console.log(error)
      callback(500, Requester.errored(jobRunID, error))
    })
}

// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

// This is a wrapper to allow the function to work with
// newer AWS Lambda implementations
exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false
    })
  })
}

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest


// curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{ "id": 0, "data": {"file":"test.json"}}'
// curl -X POST "http://127.0.0.1:5001/api/v0/block/get?arg=QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1"
// curl -X POST "http://127.0.0.1:5001/api/v0/cat?arg=Qmc2gHt642hnf27iptGbbrEG94vwGnVH48KyeMtjCF5icH"

// curl -X POST "http://127.0.0.1:5001/api/v0/add" -F file=@test.json

// curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{ "id": 0, "data": {"endpoint":"api/v0/cat", "arg":"Qmc2gHt642hnf27iptGbbrEG94vwGnVH48KyeMtjCF5icH"}}'
