const { initializeApp } = require("firebase/app");
const { getStorage } = require("firebase/storage");

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyArZ4GUlpmRgIq0B59tuToQOS3Du606UAI",
	authDomain: "shopphukien-cbc21.firebaseapp.com",
	projectId: "shopphukien-cbc21",
	storageBucket: "shopphukien-cbc21.appspot.com",
	messagingSenderId: "61389022198",
	appId: "1:61389022198:web:07ac9739fac2a6836a9dd7",
	measurementId: "G-KB0HN7B05N",
};
const firebaseApp = initializeApp(firebaseConfig);

module.exports = getStorage(firebaseApp);
