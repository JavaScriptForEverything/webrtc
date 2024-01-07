exports.home = (req, res, next) => {
	// return next(new Error('App Error'))

	const payload = {
		title: 'Home Page',
	}

	res.render('page/home', payload)
}