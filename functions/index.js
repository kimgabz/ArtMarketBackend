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

exports.createCharge = functions.https.onCall(async (data, context) => {
    const customerId = data.customerId;
    const totalAmout = data.total;
    const idempotency = data.idempotency;
    const uid = context.auth.uid

    if (uid === null) {
        console.log('illegal access attempt due to unauthenticated user');
        throw new functions.https.HttpsError('permission-denied', ' Illegal access attempt')
    }

    return stripe.charges.create({
        amount: totalAmount,
        currency: 'usd',
        customer: customerId
    }, {
        idempotency_key: idempotency
    }).then(_ => {
        return
    }).catch( err => {
        console.log(err);
        throw new functions.https.HttpsError('internal', 'Unableto create charge')
    })
});
exports.createEphemeralKey = functions.https.onCall(async (data, context) => {
    const customerId = data.customer_id;
    const stripeVersion = data.stripe_version;
    const uid = context.auth.uid

    if (uid === null) {
        console.log('illegal access attempt due to unauthenticated user');
        throw new functions.https.HttpsError('permission-denied', ' Illegal access attempt')
    }

    return stripe.ephemeralKeys.create(
        {customer: customerId},
        {stripe_version: stripeVersion}
    ).then((key) => {
        return key
    }).catch((err) => {
        console.log(err)
        throw new functions.https.HttpsError('internal', 'Unable to create ephemeral key')
    })
});

// exports.helloWorld = functions.https.onRequest((request, response) => {
//     console.log('console message ArtMarket')
//     response.send("Hello from KimG ArtMarket!");
// });
