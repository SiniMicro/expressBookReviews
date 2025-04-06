const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
 return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
 // Filter the users array for any user with the same username and password
 let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
});
// Return true if any valid user is found, otherwise false
if (validusers.length > 0) {
    return true;
} else {
    return false;
}

}

//only registered users can login
regd_users.post("/login", (req,res) => {
   const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }
 // Authenticate user
 if (authenticatedUser(username, password)) {
           // Generate JWT access token
           let accessToken = jwt.sign({
            username: username, 
            data: password
        }, 'access', { expiresIn: 60  });

  
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
       // return res.status(200).send("User successfully logged in");
       return res.status(200).json({ 
        message: "Login successful!", 
        token: accessToken , // Also return token for debugging
        username: username
    });
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }

    return res.status(200).json({ 
        message: "Login successful!", 
        token: token  // Also return token for debugging
    });

});


const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    console.log("Authorization Header:", authHeader);

    if (!authHeader) {
        return res.status(403).json({ message: "User not logged in - No Authorization Header" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Extracted Token:", token);

    jwt.verify(token, "access", (err, decoded) => {
        if (err) {
            console.log("Token Verification Failed:", err.message);
            return res.status(403).json({ message: "Invalid token" });
        }
        req.username = decoded.username;
        next();
    });
};




// Add a book review
regd_users.put("/auth/review/:isbn", verifyToken, (req, res) => {
    const {isbn} = req.params;
    const {review} = req.body;
    const username = req.username; // Extracted from JWT token

    if (!review) {
        return res.status(400).json({ message: "Review cannot be empty." });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Initialize reviews object if not present
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // Add or update review for the user
    books[isbn].reviews[username] = review;

    return res.status(200).json({ 
        message: "Review added/updated successfully!", 
        reviews: books[isbn].reviews 
    });
});
// Delete a book review
regd_users.delete("/auth/review/:isbn", verifyToken, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.username; // Extracted from JWT token
console.log('username',username);
    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Check if reviews exist for the book
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review found for this user." });
    }

    // Delete the review
    delete books[isbn].reviews[username];

    return res.status(200).json({ 
        message: "Review deleted successfully!", 
        reviews: books[isbn].reviews // Return remaining reviews
    });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
