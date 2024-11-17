## TO BUILD AND RUN:
* To run you'll need:
    * node v16, or node v20 (installed with nvm use 16 or 20)
* Install the packages from `package.json` using `npm install`
* Then run `npm build` to build the server and `npm run server:nodexx` where `xx` is the version of node you're using to run the production server. By default this will listen on port 9000.

### EXPOSING THE SERVER
* If you want to expose the server publicly, you'll need to install `ngrok`
* Then build your current set of changes with `npm run build`
* Finally run `npm run server` in one terminal, and `npm run forwardServer` in the other.

## DEV BUILD
* To run the development builds of the server use `npm run server:dev:nodexx`
    * Again -- the `xx`corresponds to the verison of node you're running
* If you want to develop the client/UI, you'll need to run `npm run client:dev` in another terminal while the server is running.

## PROJECT STRUCTURE:
* All of the UI code is in the `client/` directory, and the server code is in the `server/` directory
* Common types and infomration are found in the `common` directory. Currently this is just the type definitions.


## DEBUGGING:
* To debug the client side: 
    * run `npm run client:dev:nodexx` from the command line
    * then run the `launch chrome npm `ctrl + shift + p`)
    * set `Debug: Toggle auto-attach` to always, then restart the terminal. 
    * run `npm run server:dev` in the command line and observe breakpoints are hit

## FAQs
* I see `ERR_CERT_AUTHORITY_INVALID` when connecting to the sockets server on a local dev client. How do I fix this?
    * Ctrl + click on the link and click `Trust this domain` on the resultant page. This will tell your browser to accept the self-signed cert and enable the sockets locally