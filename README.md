# Intro to Authentication

## Overview

## Part 0: Authentication and Authorization
Authentication is determining if a user is who they say they are. A public field like email is not enough to make this determination, and this is why we have passwords. Only the _authentic_ owner of that email will know the password. That's why the process of verifying user credentials is called authentication.

Authorization is a separate process, and it can only happen after authentication. Once we've determined that a user is who they claim to be, we may want to check if they have permission to take a specific action. For example, the customers of our site may not have the same permissions as an admin. We are checking if the (already-authenticated) user is _authorized_ to take an action, which is why this is called authorization.

Today we will only be implementing authentication, but it's important to know that these are two separate processes.

## Part 1: Creating a user
Creating a user is what happens when you sign up on a site. In many ways, it is exactly like creating any other CRUDable resource: you submit a form, it `POST`s to a `/users` endpoint, and we INSERT INTO the users table.

1. Use sequelize to create a users table. It should have the columns of email and password.
1. It would make sense to create a users controller to hold all these user-related routes, as well as a users subfolder within views.
1. Create a route `GET /users/new` that serves up the form to create a new user. Put a link to this route in a nav bar inside layout.ejs.
1. Create a route `POST /users` that creates a new user, then redirects to the root route.
1. Submit this form, and use psql to confirm that the user got created.

After these steps are in place, we will take an extra step that we haven't taken before: we will store this user's id in a _cookie_. This sends the user's id to the client's browser, which holds onto it, and sends it along with all subsequent requests within this domain.

Inside the create user route, let's set the cookie with `res.cookie('userId', <the user's id>)`. Then, let's look at the cookie in our browser. It's important to note that you can clear the cookie manually from the browser: we'll have to do this by hand until we build the logout system.

## Part 2: Logging in
In this section we will build some new routes:

1. `GET /users/login`: this serves up a login form. It should be very much like the form to create a new user, but it should POST to `/users/login` instead of `/users`. Put a link to this route in a nav bar inside layout.ejs.
1. `POST /users/login`: this receives the login form. It looks up a user based on email, and then it checks if the looked-up-user's password matches the password from the form. If they match, it sets the userId cookie just like when we created a user, then redirects to the root. If they don't match, it re-renders the login form, ideally with an error message.
1. `GET /users/logout`: this clears out the cookie with `res.clearCookie()`, then renders the homepage.

## Part 3: Loading the user on each request
On subsequent requests, we want to look up the user from the userId cookie. The first step is to install a cookie parser: `npm i cookie-parser`, then in the middleware section of your server.js:
```js
const cookieParser = require('cookie-parser')
app.use(cookieParser())
```
This will give you access to `req.cookies`, which will contain the cookie we issued in the previous steps.

On to actually looking up the user! We could do it manually inside of every route that needs knowledge of who's logged in:
```js
app.get('/someNewRoute', async (req, res) => {
  const user = await models.user.findByPk(req.cookies.userId)
  // the rest of the route
})
```
But this will get repetitive fast. Instead, we are going to `app.use` a function that looks up the user on every request. This goes in server.js as part of our middleware section:
```js
app.use(async (req, res, next) => {
  // 1
  const userId = req.cookies.userId
  const user = await models.user.findByPk(userId)

  // 2
  res.locals.user = user

  // 3
  next()
})
```

Let's take a minute to digest what's going on here:

1. This just looks up the user based on the userId that's coming in from the cookie.
1. `res.locals` is a property of the res object that starts off as an empty object on every request. We can write stuff into this object, and in downstream functions we can access it as `res.locals.whatever`. res.locals has another magic property: anything stored there is automatically available in all our views. So we can just start referring to `user` in our views.
1. If we don't invoke `next`, express doesn't know that it should keep the server.js relay race going.

We can test this out by logging res.locals in any route, and by referring to user in a view file.

We should wrap parts 1 and 2 in an `if (req.cookies.userId)`, so that if no one is logged in, we don't try to look up a user with an id of undefined. What should we set the res.locals.user to if there was no req.cookies.userId?

## Part 4: Doing something with the logged in user
Let's do two things with this logged in user:
1. Modify our nav bar: if there is a logged in user, display 2 links: Log Out and Profile (explained below). If there is no logged in user, display Log In and Sign Up links.
1. Create a `GET /users/profile` route: If there is a logged in user, it should render a view file that just says "Hello, {user's email}!" (the world's simplest profile). If there is no logged in user, it should redirect them to the login page.

## Part 5: Security
### Part 5a: encrypting our cookies
Right now, there's nothing to stop someone from manually changing their userId cookie in their browser, effectively impersonating another user. To change that, we are going to encrypt the user id value using a secret string before we send it out in the cookie. And when it comes back on subsequent requests, we are going to decrypt it using the same secret string. Because no one else knows our secret string, no one can craft a cookie to impersonate another user.

1. `npm i crypto-js`, `const cryptojs = require('crypto-js')`
1. We need to encrypt cookies before they go out the door (note that this happens in 2 places!). Instead of `res.cookie('userId', user.id)`, we want:
```js
const encryptedUserId = cryptojs.AES.encrypt(user.id.toString(), 'super secret string')
const encryptedUserIdString = encryptedUserId.toString()
res.cookie('userId', encryptedUserIdString)
```
1. We also need to decrypt cookies as they come in the door. In our server.js, instead of just plucking the id from cookies:
```js
const decryptedId = cryptoJS.AES.decrypt(req.cookies.userId, 'super secret string')
const decryptedIdString = decryptedId.toString(cryptoJS.enc.Utf8)
const user = await models.user.findByPk(decryptedIdString)
```
1. We shouldn't actually have our super secret string in our code! If we commit it to github, anyone can look at it and use it to craft cookies. Instead, we should put it into a .env file to keep it secret. This works just like when we put our api keys into a .env file.

### Part 5b: hashing our passwords
Data security and breaches is a topic that some people devote their entire careers to. We are not those people. But those people advise us that we do not want to store our passwords in our db in plain text. Instead, we should hash them. Hashing is the process of convering a string into an obfuscated string. There is a key difference between hashing and encrypting: something that's been encrypted can be decrypted if you have the secret string. But something that's been hashed can _never_ be recovered into its original string. For this reason we say that hashing is _one-way_.

Here's how we will leverage this:
1. When a user creates an account, we hash the password that they give us and store that in the db (instead of the plaintext version).
1. On subsequent login attempts, we hash the password the user is giving us. If that hash matches the hash that we got when they created their account, we have a match! If not we have a failed login attempt.

Actual steps to achieve this:
1. `npm i bcrypt`
2.  When we are about to create a user, instead of saving their password, we will hash it first, and then save that hash instead of the plaintext password:
```js
// in our require zone
const bcrypt = require('bcrypt')
// right before user creation
const hashedPassword = bcrypt.hashSync('the incoming password', 10)
// then create the user with the hashedPassword, not the plaintext one
```
3. When a user attempts to login, we will hash the password they are attempting to log in with. Then we compare the hashed version of the incoming password to the one we saved in the db when the user was created. bcrypt comes with a built in function to help us with this.
```js
// replace 
if (user.password === req.body.password)
// with 
if (bcrypt.compareSync(req.body.password, user.password))
```

### Part 5c: understanding why we hash our passwords
Hashing our passwords is a countermeasure in case anyone ever gains access to our db. If our users' plaintext passwords were in there, the breacher could log in as all our users and take any action (withdraw all their money, post harmful content, etc). But if all the breacher has is emails and hashed passwords, they can't log in as our users.

Ok, so let's say that a breacher has our users' emails and hashed passwords. They could use brute force and compare every possible string to the hashed password until they get a match, and then they would know the user's password. For this reason, bcrypt is intentionally designed to take a long time to run (~500ms). Of course, the user will experience this delay when they log into the site, but it's not much time when you just experience it once. But someone trying to brute force every possible string will experience this delay millions of times, making it very expensive to do.

As engineers of the world develop faster and faster computers, a task that takes 500ms today might only take 50ms in the future. So, bcrypt allows you to specify a _cost factor_. When we say `bcrypt.hashSync(req.body.password, 10)`, the 10 means that bcrypt must hash the password, then hash the result of that, then hash the result of that, and so on, 2^10 (1,024) times. It is possible to crank up the cost factor, which will double the amount of time it takes to hash.

Ok, let's say I'm a next-level breacher: I know that brute force guessing passwords takes a long time. But I also know that I can find a list of the 1000 most commonly used passwords. And I can hash them all ahead of time, so that when I am trying to guess hashed passwords, I can just compare them to my pre-hashed list. This pre-hashed list is called a _rainbow table_, and it makes it much more feasible to crack hashed passwords. Rainbow tables are no secret and are widely published, but security engineers have found a defense against them.

Every time bcrypt hashes a password, it first concatenates a _salt_ onto the end. A salt is a randomly generated string that gets saved with the hashed password in the database:
```
$2b$10$eKH9xXBxnEVhruGsUoDE2.PCSvwGHBf7cgkPqsXGia/O03NHNI212
 ^  ^                       ^                 ^
 |  |                       |                 |
 | cost factor              |         this last chunk is the actual hash
 |          everything from the $ to here is salt
version of bcrypt  
```
The purpose of a salt is: let's say that the user made a dumb password like 'Password1234'. This will probably appear in most rainbow tables. But 'Password1234eKH9xXBxnEVhruGsUoDE2.' certainly will not. This post explains the salting process well: https://stackoverflow.com/questions/6832445/how-can-bcrypt-have-built-in-salts

