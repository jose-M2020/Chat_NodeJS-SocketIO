const helpers = {};

helpers.isAuthenticated = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	}
	// req.flash('error', 'No autorizado');
	res.redirect('/signin');
};

helpers.guest = (req, res, next) => {
	if(!req.isAuthenticated()){
		return next();
	}

	res.redirect('/');
};

module.exports = helpers;
