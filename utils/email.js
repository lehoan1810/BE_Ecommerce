const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
	constructor(user, url) {
		this.to = user.email;
		this.name = user.name;
		this.url = url;
		this.from = `Shop admin <${process.env.EMAIL_FROM}>`;
	}
	myOAuth2Client() {
		new OAuth2Client(
			"117061799709-mkneukuac41isbdg0r56b1c2l391pkct.apps.googleusercontent.com",
			"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"
		).setCredentials({
			refresh_token:
				"1//04UOQ6iEdnI8mCgYIARAAGAQSNwF-L9IrHA46wmdGaRSV29lE768tL3XMju122q8OfFJQZKic2SpoMqqLfZLmb9yFkaLnzbr5wC8",
		});
	}
	// myOAuth2Client

	myAccessTokenObject() {
		myOAuth2Client.getAccessToken();
	}
	// Access Token sẽ nằm trong property 'token' trong Object mà chúng ta vừa get được ở trên
	myAccessToken() {
		myAccessTokenObject?.token;
	}

	newTransport() {
		if (process.env.NODE_ENV === "production") {
			//create transporter for sendgrid
			return nodemailer.createTransport({
				service: "Gmail",
				// secure: false, // secure:true for port 465, secure:false for port 587
				auth: {
					type: "OAuth2",
					user: "hoanhao18102000@gmail.com",
					clientId:
						"117061799709-mkneukuac41isbdg0r56b1c2l391pkct.apps.googleusercontent.com",
					clientSecret: "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",
					refresh_token:
						"1//04UOQ6iEdnI8mCgYIARAAGAQSNwF-L9IrHA46wmdGaRSV29lE768tL3XMju122q8OfFJQZKic2SpoMqqLfZLmb9yFkaLnzbr5wC8",
					accessToken: myAccessToken,
				},
			});
		}

		//in development
		return nodemailer.createTransport({
			service: "Gmail",

			auth: {
				user: "sandaugiaduythien",
				pass: "hadesduy13051999",
			},
		});
	}

	//Send the actual email
	async send(template, subject) {
		// 1) render html based
		const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
			name: this.name,
			url: this.url,
			subject,
		});

		// 2) define the mail options
		const mailOptions = {
			from: this.from,
			to: this.to,
			subject,
			text: htmlToText.fromString(html),
			html,
			//html
		};

		// 3) create a transport and send email
		await this.newTransport().sendMail(mailOptions);
	}

	async sendWelcome() {
		await this.send("welcome", "Welcome to our shop");
	}

	async sendPasswordReset() {
		await this.send(
			"passwordReset",
			"Your password reset token (valid for only 10 minutes)"
		);
	}

	async sendVerifyEmail() {
		const html = pug.renderFile(`${__dirname}/../views/email/verify.pug`, {
			name: this.name,
			url: this.url,
			subject: "Welcome to our shop",
		});

		const mailOptions = {
			from: this.from,
			to: this.to,
			subject: "Welcome to our shop",
			text: htmlToText.fromString(html),
			html,
			//html
		};
		try {
			await this.newTransport().sendMail(mailOptions);
		} catch (error) {
			console.log(error);
		}
	}
};
