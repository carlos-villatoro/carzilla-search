# Intro to Authentication

## Overview

## Part 0: Authentication and Authorization
Authentication is determining if a user is who they say they are. A public field like email is not enough to make this determination, and this is why we have passwords. Only the _authentic_ owner of that email will know the password. That's why the process of verifying user credentials is called authentication.

Authorization is a separate process, and it can only happen after authentication. Once we've determined that a user is who they claim to be, we may want to check if they have permission to take a specific action. For example, the customers of our site may not have the same permissions as an admin. We are checking if the (already-authenticated) user is _authorized_ to take an action, which is why this is called authorization.

Today we will only be implementing authentication, but it's important to know that these are two separate processes.

## Part 1: Creating a user
Creating a user is what happens when you sign up on a site. In many ways, it is exactly like creating any other CRUDable resource: you submit a form, it `POST`s to a `/users` endpoint, and we INSERT INTO the users table.




## Part 2: Logging in

## Part 3: Loading the user on each request

## Part 4: Doing something with the logged in user

## Part 5: Security
