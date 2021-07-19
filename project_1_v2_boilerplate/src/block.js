/**
 *                          Block class
 *  The Block class is a main component into any Blockchain platform, 
 *  it will store the data and act as a dataset for your application.
 *  The class will expose a method to validate the data... The body of
 *  the block will contain an Object that contain the data to be stored,
 *  the data should be stored encoded.
 *  All the exposed methods should return a Promise to allow all the methods 
 *  run asynchronous.
 */

const SHA256 = require('crypto-js/sha256');
const hex2ascii = require('hex2ascii');

class Block {

    // Constructor - argument data will be the object containing the transaction data
	constructor(data){
		this.hash = null;                                           // Hash of the block
		this.height = 0;                                            // Block Height (consecutive number of each block)
		this.body = Buffer.from(JSON.stringify(data)).toString('hex');   // Will contain the transactions stored in the block, by default it will encode the data
		this.time = 0;                                              // Timestamp for the Block creation
		this.previousBlockHash = null;                              // Reference to the previous Block Hash
    }
    
    /**
     *  validate() method will validate if the block has been tampered or not.
     *  Been tampered means that someone from outside the application tried to change
     *  values in the block data as a consecuence the hash of the block should be different.
     *  Steps:
     *  1. Return a new promise to allow the method be called asynchronous.
     *  2. Save the in auxiliary variable the current hash of the block (`this` represent the block object)
     *  3. Recalculate the hash of the entire block (Use SHA256 from crypto-js library)
     *  4. Compare if the auxiliary hash value is different from the calculated one.
     *  5. Resolve true or false depending if it is valid or not.
     *  Note: to access the class values inside a Promise code you need to create an auxiliary value `let self = this;`
     */
    validate() {
        let self = this;
        return new Promise((resolve, reject) => {
            // Save in auxiliary variable the current block hash
            let blockHashCurrent = self.hash; 
            
            // Make the hash of block null to calculate his hash
            self.hash = null;

            // Recalculate the hash of the Block
            let blockHashRecalculated = SHA256(JSON.stringify(self));

            // re-assign hash value self.hash
            self.hash = blockHashCurrent;

            // Comparing if the hashes changed
            // Returning the Block is not valid
            // console.log(`Block is not valid cause
            //     block hash is: ${blockHashCurrent} 
            //     and block hash recalculated is : ${blockHashRecalculated}`);
                
            // Returning the Block is valid
            //console.log("Current block is valid");
            resolve(blockHashCurrent !== blockHashRecalculated);
        });
    }

    /**
     *  Auxiliary Method to return the block body (decoding the data)
     *  Steps:
     *  
     *  1. Use hex2ascii module to decode the data
     *  2. Because data is a javascript object use JSON.parse(string) to get the Javascript Object
     *  3. Resolve with the data and make sure that you don't need to return the data for the `genesis block` 
     *     or Reject with an error.
     */
    getBData() {
        // good practice to have in my opinion
        let self = this;

        return new Promise((resolve, reject) => {
                
            // Getting the encoded data saved in the Block
            let encodedData = self.body;
            // console.log(`encodedData : ${encodedData}`);

            // Decoding the data to retrieve the JSON representation of the object
            /** The hex2ascii is not an asynchronous function. So, you can simply return the output without using the promises.
            * Wow, I didnt know, Thank you! But the template of method getBData was with promise!
            */
            let decodeData = hex2ascii(encodedData);
            // console.log(`decodeData : ${decodeData}`);

            // Parse the data to an object to be retrieve.
            let parsedData = JSON.parse(decodeData);
            // console.log(`parsedData : ${parsedData}`);

            // Resolve with the data if the object isn't the Genesis block
            if (self.height === 0) {
                //console.log(`It's Genesis block for data ; ${parsedData}`);
                resolve("Genesis Block");
            } else if(parsedData) {
                //console.log(`It's not Genesis block then resolve data ; ${parsedData}`);
                resolve(parsedData);
            } else {
                //console.log(`ERROR : No Data ; ${parsedData}`);
                reject();
            }
        });
    }

}

module.exports.Block = Block;                    // Exposing the Block class as a module