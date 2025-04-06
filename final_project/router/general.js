const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(400).json({ message: "Username already exists. Choose a different one." });
    }
    users.push({"username": username, "password": password});
    return res.status(201).json({ message: "User registered successfully!" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
 try {
        res.status(200).json(books);  // Directly returning the books object
    } catch (error) {
        res.status(500).json({ message: "Error fetching book list", error: error.message });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  const isbn = req.params.isbn;

    try {
        const response = await axios.get(`https://sinirajs08-5005.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai`);
        const books = response.data;

        if (books[isbn]) {
            res.status(200).json(books[isbn]);
        } else {
            res.status(404).json({ message: "Book not found." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching book details", error: error.message });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
    const author = req.params.author.toLowerCase();

    try {
        console.log("Fetching books from API...");
        const response = await axios.get(`https://sinirajs08-5005.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai`);
        const books = response.data;

        // Filter books by author
        const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase() === author);

        if (booksByAuthor.length > 0) {
            return res.status(200).json(booksByAuthor);
        } else {
            return res.status(404).json({ message: "No books found for this author." });
        }
    } catch (error) {
        console.error("Error fetching books:", error.message);
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
    const title = req.params.title.toLowerCase();

    try {
        console.log("Fetching books from API...");
        const response = await axios.get(`https://sinirajs08-5005.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai`);
        const books = response.data;

        // Filter books by title
        const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase() === title);

        if (booksByTitle.length > 0) {
            return res.status(200).json(booksByTitle);
        } else {
            return res.status(404).json({ message: "No books found with this title." });
        }
    } catch (error) {
        console.error("Error fetching books:", error.message);
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.json(books[isbn].reviews);
    } else {
        return res.status(300).json({message: "Yet to be implemented"});
    }
});

module.exports.general = public_users;
