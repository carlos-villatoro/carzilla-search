const bcrypt = require('bcryptjs')
const cryptojs = require('crypto-js')

const testBcrypt = () =>{
    const password = 'hello_1234'
    // turn this password string into a hash
    // when a user signs up, we will hash their pass and store it in our db
    const salt = 12
    const hash = bcrypt.hashSync(password, salt)
    console.log(hash)

    // when a user logs in we can compare sync to match passwords to db hashes
    const compare = bcrypt.compareSync(password, hash)
    console.log(compare)
}   
// testBcrypt()

const textCrypto = ()=>{
    // this passphrase will be known only to server admins
    const passphrase = '1234_hello'
    // this message will be in the cookie as the user id
    const message = 'hi i am encrypted'

    const encrypted = cryptojs.AES.encrypt(message, passphrase).toString()
    console.log(encrypted)
    // in thhe middleare we will decrypt
    const decrypted = cryptojs.AES.decrypt(encrypted, passphrase).toString(cryptojs.enc.Utf8)
    console.log(decrypted)
}
textCrypto()

