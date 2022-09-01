const request = require('superagent');


module.exports = {
    send: function (username, push_title, push_body) {
        request.post(process.env.ONESIGNAL_HOST)
            .send({
                app_id: process.env.ONESIGNAL_APP_ID,
                contents: { "en": push_body },
                headings: { "en": push_title },
                channel_for_external_user_ids: "push",
                include_external_user_ids: [username]
            })
            .set('Content-Type', 'application/json; charset=utf-8')
            .set('Authorization', `Basic ${process.env.ONESIGNAL_REST_API_KEY}`)
            .then(response => {

            })
            .catch(err => {
                console.log(`ERROR OneSignal ${err.response.text}`)
            });
    }
};
