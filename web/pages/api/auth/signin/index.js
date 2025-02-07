import nextConnect from 'next-connect';
import bcrypt from 'bcrypt';
import { query } from '../../../../utils/query';

const handler = nextConnect().post(async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) res.status(400).json({ error: 'Email or Password cannot be blank' });

	try {
		var [results] = await query(
			`
              SELECT password, id FROM users WHERE email = ?
            `,
			[email]
		);
		if (results.length < 1) res.status(401).json({ error: 'Email not found' });

		const { password: hashedPW, id } = results[0];
		const isValid = await bcrypt.compare(password, hashedPW);
		if (!isValid) res.status(401).json({ error: 'Incorrect Password' });
		else if (isValid) {
			const user = { id: id, email: email };
			req.session.user = user;
			req.login(user, function (err) {
				res.status(200).json({ message: 'Session created' });
			});

			res.status(200).json({ message: 'Success' });
		}
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

export default handler;
