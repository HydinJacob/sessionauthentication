const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();


app.use(bodyParser.urlencoded({ extended: true }))
const TWO_HOURS = 2 * 60 * 60 * 1000;

const {
    PORT = 3000,
    NODE_ENV = 'development',
    SESS_NAME = 'sid',
    SESS_SECRET = 'hjyadcionbozne!',
    SESS_LIFETIME = TWO_HOURS
} = process.env;

const IN_PROD = NODE_ENV === 'production';

const users = [ {id: 1, name : 'Binu', email:'binu1989@gamil.com', password: 'test'},
                {id: 2, name : 'Anu', email:'anu1991@gamil.com', password: 'test'},
                {id: 3, name : 'Arjun', email:'arjun1995@gamil.com', password: 'test'}    ]

// middleware

const redirectLogin = (req, res, next) => {
    if(!req.session.userId) {
        res.redirect('/login');
    }
    else {
        next()
    }
}

const redirectHome = (req, res, next) => {
    if(req.session.userId) {
        res.redirect('/home');
    }
    else {
        next()
    }
}


app.use(session ({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
        maxAge: SESS_LIFETIME,
        sameSite: true,
        secure: IN_PROD
    }
}))


app.use( (req, res, next) => {
    const { userId } = req.session;
    if ( userId ) {
        res.locals.user = users.find(
            user => user.id === userId
        )
    }
    next();
})

app.get('/', (req, res) => {                                //Main page

    //console.log(req.session);
    const { userId }  = req.session;

       res.send(`                                   
        <h1>Welcome!</h1>    
        ${ userId ?  `
        <a href = "/home">Home </a>
    <form method = "POST" action="/logout">
        <button>Logout</button>
    </form>
    ` : 
    `<a href = "/login">Login</a>
    <a href = "/register">Register</a>
    `}
    `);
    console.log(userId);
})

app.get('/home', redirectLogin, (req, res) => {                 //Home page
    const { user } = res.locals;
    res.send(`
    <h1>Welcome to Home Page !!</h1>
    <a href = '/'> Main</a>
    <ul>
       <li>Name: ${user.name} </li> 
        <li>Email: ${user.email} </li> 
    </ul>
    `)
})

app.get('/login',  redirectHome, (req, res) => {
    res.send( `
    <h1>Welcome to Login Page !!</h1>
    <form method = 'POST' action = '/login'>
        <input type="email" name = 'email' placeholder = 'Email' required />
        <input type="password" name = 'password' placeholder = 'Password' required />
        <input type = 'submit' />      
        
    </form>

    <a href = "/register">Register</a>
    `)
})

app.get('/register',  redirectHome, (req, res) => {
    res.send(`
    <h1>Welcome to Registration Page !!</h1>
    <form method = 'POST' action = '/register'>
        <input type="text" name = 'name' placeholder = 'Full Name'  required/>
        <input type="email" name = 'email' placeholder = 'Email' required />
        <input type="password" name = 'password' placeholder = 'Password' required />
        <input type = 'submit' />        
    </form>

    <a href = "/login">Login</a>
    `)
})


app.post('/login',  redirectHome, (req, res) => {
    const {email, password } = req.body;

    if(email && password) {
        const user = users.find(user => user.email === email && user.password === password);    

        if(user) {
            req.session.userId = user.id;
            return res.redirect('/home');
        }
    }
    return res.redirect('/login');
})

app.post('/register',  redirectHome, (req, res) => {
    const { name, email, password } = req.body;

    if( name && email && password ) {
        const exists = users.some(
            user => user.email === email
        )   
    
        if (!exists) {
            const user = {
                id: users.length + 1,
                name,
                email,
                password
            }
    
            users.push(user);
            //console.log(users);
            req.session.userId = user.id;
            return res.redirect('/home');
        } 
    }
    res.redirect('/register');    
})

app.post('/logout', redirectLogin,  (req, res) => {
    req.session.destroy(err=> {
        if(err) {
            return res.redirect('/home');
        }
        res.clearCookie('SESS_NAME');
        res.redirect('/login');
    })  

})

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})