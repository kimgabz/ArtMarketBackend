const functions = require('firebase-functions');
const admin = require('firebase-admin')

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions


admin.initializeApp();

// Set your secret key: remember to change this to your live secret key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')(functions.config().stripe.secret_test_key);

exports.createStripeCustomer = functions.firestore.document('users/{userId}').onCreate(async (snap, context) => {
    const data = snap.data();
    const email = data.email;

    const customer = await stripe.customers.create({ email : email })
    return admin.firestore().collection('users').doc(data.id).update({ stripeId : customer.id})
});

// exports.helloWorld = functions.https.onRequest((request, response) => {
//     console.log('console message ArtMarket')
//     response.send("Hello from KimG ArtMarket!");
// });
