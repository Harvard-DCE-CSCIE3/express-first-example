const express = require('express');
const os = require('os');
const path = require('path');
const session = require('express-session');  
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 3000;  

// Example of middleware function. This is the function definiton. 
//    We'll still have to insert it into the middleware stack with app.use() to have it called for incoming requests. 
//    Note that we have to call next() to pass control to the next middleware or route handler
function logIt(req, res, next) {
   console.log(`Received request for ${req.url}`);
   next(); // call the next middleware or route handler   
}
// Here we insert this middleware function into the middleware stack for any paths that start with /img
app.use('/img', logIt);


// Configure express-session and insert it into the middleware stack. 
//   This will allow us to use req.session in our route handlers to store session data for each user.
app.use(session({
  secret: 'cscie31', // this should be a random string in a real app
  resave: false,
  saveUninitialized: true,
}));

// Configure cookie-parser and insert it into the middleware stack.
//   This will allow us to use req.cookies and req.signedCookies in our route handlers to read cookies from the request.
app.use(cookieParser( 'cscie31-secret' ))  // note the parentheses - factory function uses a closure to capture the secret value for signing cookies

// Example of a middleware function to set cookies on the response. 
//   This will be called for every incoming request and will set two cookies: 'name' and 'course'.
//   In a real application, you might want to set cookies only for certain routes or based on certain conditions, but this is just an example.
const setCookies = (req, res, next) => {
  res.cookie('name', 'Harvard');  // this will set a cookie named 'name' with value 'Harvard'
  res.cookie('course', 'CSCIE-31', { signed: true, maxAge: 60000 });  // this will set a cookie named 'name' with value 'Harvard' that is signed and will expire in 60 seconds
  next();
}
// Insert the setCookies middleware into the middleware stack. 
app.use( setCookies );

// Now let's do something with the session. 
//  We'll create a middleware function that increments a 'views' counter in the session for each request, and logs the session ID and number of views.
const incrementViews = (req, res, next) => {
    if (req.session.views) {
        req.session.views++ ;
    } else {
        req.session.views = 1;
    }
    console.log(`Session ID is ${req.session.id}, number visits this session: ${req.session.views}`);
    next();
}
// Insert incrementViews into the middleware stack
app.use( incrementViews );

// Now we can add some route handlers. 

// This will serve static files from the 'public' directory at the root path. So if we have 'public/index.html', it will be served at '/'.
app.use(express.static(path.join(__dirname, 'public'))); 

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/about', (req, res) => {
    res.send(`Hostname: ${os.hostname()}\nUptime: ${os.uptime()} seconds\n`);
});

app.get('/time', (req, res) => {
  res.send(`Current server time is: ${new Date().toLocaleString()}`);
});

// If we get here, then none of the above routes matched, so this is a catch-all for any paths that aren't handled above.
app.use( (req, res) => {
  //res.status(404).send('Sorry - I don\'t have that');
  // could also do this to serve a custom 404 page);
  res.status(404).redirect('/404.html'); 
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
