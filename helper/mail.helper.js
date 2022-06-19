const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const cf_oauth2 = require("../cf_oauth2");

module.exports = async function (to, subject, content) {
	// var transporter = nodemailer.createTransport({
	//     service: cf_mailer.service,
	//     auth: {
	//         user: cf_mailer.email,
	//         pass: cf_mailer.pass,
	//     }
	// });

	// Khởi tạo OAuth2Client với Client ID và Client Secret
	const myOAuth2Client = new OAuth2Client(
		cf_oauth2.GOOGLE_MAILER_CLIENT_ID,
		cf_oauth2.GOOGLE_MAILER_CLIENT_SECRET
	);
	// Set Refresh Token vào OAuth2Client Credentials
	myOAuth2Client.setCredentials({
		refresh_token: cf_oauth2.GOOGLE_MAILER_REFRESH_TOKEN,
	});
	/**
	 * Lấy AccessToken từ RefreshToken (bởi vì Access Token cứ một khoảng thời gian ngắn sẽ bị hết hạn)
	 * Vì vậy mỗi lần sử dụng Access Token, chúng ta sẽ generate ra một thằng mới là chắc chắn nhất.
	 */
	const myAccessTokenObject = await myOAuth2Client.getAccessToken();
	// Access Token sẽ nằm trong property 'token' trong Object mà chúng ta vừa get được ở trên
	const myAccessToken = myAccessTokenObject?.token;

	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			type: "OAuth2",
			user: cf_oauth2.ADMIN_EMAIL_ADDRESS,
			clientId: cf_oauth2.GOOGLE_MAILER_CLIENT_ID,
			clientSecret: cf_oauth2.GOOGLE_MAILER_CLIENT_SECRET,
			refresh_token: cf_oauth2.GOOGLE_MAILER_REFRESH_TOKEN,
			accessToken: myAccessToken,
		},
	});

	var mailOptions = {
		to: to, // Gửi đến ai?
		subject: subject, // Tiêu đề email
		html: content, // Nội dung email
	};

	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(error);
		} else {
			console.log("Email sent: " + info.response);
		}
	});
};
