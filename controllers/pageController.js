exports.home = (req, res, next) => {
	const payload = {
		title: 'Home Page',
	}

	res.render('page/home', payload)
}