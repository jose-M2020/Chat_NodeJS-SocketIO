const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const bodyParser = require("body-parser");
const session  = require('express-session');
const flash = require('connect-flash')
const passport = require('passport');
const express = require('express');

// initializations
const app = express();
require('./config/passport');

app.use(bodyParser.json());
// Settings
app.use(express.static(path.join(__dirname, 'public')));

app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));

app.engine('.hbs', exphbs({				
	defaultLayout: 'main',
	layoutsDir: path.join(app.get('views'), 'layouts'), //define la ruta del main.hbs, concatenando con la dir de views ya creada
	partialsDir: path.join(app.get('views'), 'partials'),  //los partials son pequeñas partes de html que podemos reutiliar en cualquier vista
	extname: '.hbs',     //extension que van a tener nuestros archivos
	helpers: require('./helpers/moment')
}));
app.set('view engine', '.hbs');

// Middleware
app.use(express.urlencoded({extended: false}));	//urlencoded sirve cuando un determinado dato se envia, pueda entenderlo
app.use(methodOverride('_method')); 
app.use(session ({
	secret: 'secretApp',
	resave: true,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global variables
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;	//obtenemos la informacion del usuario logueado, ya que cuando se autentica un usuario, passport gusrda la info. de usuario en un arreglo
	next();
});

// Server
const server = app.listen(app.get('port'), () => {
	console.log('Server on port', app.get('port'));
});

// Sockets
const socketIO = require('./socket/socket');;
socketIO(server);
 
//Routes
app.use((require('./routes/index')));
