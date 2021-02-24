# Chainlink NodeJS IPFS External Adapter

Send and get data from your IPFS node. 

## TODO
- Write tests
- Make `text_for_file` more robust (not allow one without the other)
- Any parameters can be passed instead of custom parameters

## Creating your own adapter from this template

Clone this repo and change "ExternalAdapterProject" below to the name of your project

```bash
git clone https://github.com/PatrickAlphaC/ipfs_cl_ea
```

Enter into the newly-created directory

```bash
cd ipfs_cl_ea
```

See [Install Locally](#install-locally) for a quickstart

## Input Params

This is currently a work in progress, and supports some of the [IPFS HTTP parameters.](https://docs.ipfs.io/reference/http/api/)

PRs are welcome :)

- `endpoint`: The endpoint to use from the IPFS API
- `ipfs_host`: The Base URL of you IPFS host
- `starting_char`: Which character to start at for returning the string

Parameters from the IPFS API: 
```
  quiet: false,
  quieter: false,
  silent: false,
  progress: false,
  trickle: false,
  pin: false,
  file: false, // The location of the file you want to upload
  arg: false
```

## Example input

```
curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{ "id": 0, "data": {"file":"./test/test.json"}}'
```

## Output

```json
{
  "jobRunID":0,
  "data":{
    "Name":"test.json",
    "Hash":"Qmd3zUksep8MQnjeSsXgEE4xa2DKgw48HJPjk5BiMDn1u7",
    "Size":"24",
    "result":"Qmd3zUksep8MQnjeSsXgEE4xa2DKgw48HJPjk5BiMDn1u7"
  },
  "result":"Qmd3zUksep8MQnjeSsXgEE4xa2DKgw48HJPjk5BiMDn1u7",
  "statusCode":200
}
```
or

## Example input

```bash
curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{ "id": 0, "data": {"endpoint":"api/v0/cat", "arg":"Qmd3zUksep8MQnjeSsXgEE4xa2DKgw48HJPjk5BiMDn1u7"}}'
```

## Output

```json
{"jobRunID":0,"data":{"cat":"dog"},"statusCode":200}
```

## Example Input 

```bash
curl -X POST -H "content-type:application/json" "http://localhost--data '{ "id": 0, "data": {"text_for_file_name":"patrick.json", "text_for_file":"[\"dog\"]"}}'
```

## Output

```json
{"jobRunID":0,"data":{"Name":"patrick.json","Hash":"QmWk8NQVeoXyMizcxT3D2y85eFDQGQfmRvupCnni3nuS1q","Size":"15","result":"QmWk8NQVeoXyMizcxT3D2y85eFDQGQfmRvupCnni3nuS1q"},"result":"QmWk8NQVeoXyMizcxT3D2y85eFDQGQfmRvupCnni3nuS1q","statusCode":200}
```

## Install Locally

Install dependencies:

```bash
yarn
```

### Test

Run the local tests:

```bash
yarn test
```

Natively run the application (defaults to port 8080):

### Run

```bash
yarn start
```

## Call the external adapter/API server

```bash
curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{ "id": 0, "data": {"file":"./test/test.json"}}'
```

## Docker

If you wish to use Docker to run the adapter, you can build the image by running the following command:

```bash
docker build . -t external-adapter
```

Then run it with:

```bash
docker run -p 8080:8080 -it external-adapter:latest
```

## Serverless hosts

After [installing locally](#install-locally):

### Create the zip

```bash
zip -r external-adapter.zip .
```

### Install to AWS Lambda

- In Lambda Functions, create function
- On the Create function page:
  - Give the function a name
  - Use Node.js 12.x for the runtime
  - Choose an existing role or create a new one
  - Click Create Function
- Under Function code, select "Upload a .zip file" from the Code entry type drop-down
- Click Upload and select the `external-adapter.zip` file
- Handler:
    - index.handler for REST API Gateways
    - index.handlerv2 for HTTP API Gateways
- Add the environment variable (repeat for all environment variables):
  - Key: API_KEY
  - Value: Your_API_key
- Save

#### To Set Up an API Gateway (HTTP API)

If using a HTTP API Gateway, Lambda's built-in Test will fail, but you will be able to externally call the function successfully.

- Click Add Trigger
- Select API Gateway in Trigger configuration
- Under API, click Create an API
- Choose HTTP API
- Select the security for the API
- Click Add

#### To Set Up an API Gateway (REST API)

If using a REST API Gateway, you will need to disable the Lambda proxy integration for Lambda-based adapter to function.

- Click Add Trigger
- Select API Gateway in Trigger configuration
- Under API, click Create an API
- Choose REST API
- Select the security for the API
- Click Add
- Click the API Gateway trigger
- Click the name of the trigger (this is a link, a new window opens)
- Click Integration Request
- Uncheck Use Lamba Proxy integration
- Click OK on the two dialogs
- Return to your function
- Remove the API Gateway and Save
- Click Add Trigger and use the same API Gateway
- Select the deployment stage and security
- Click Add

### Install to GCP

- In Functions, create a new function, choose to ZIP upload
- Click Browse and select the `external-adapter.zip` file
- Select a Storage Bucket to keep the zip in
- Function to execute: gcpservice
- Click More, Add variable (repeat for all environment variables)
  - NAME: API_KEY
  - VALUE: Your_API_key
