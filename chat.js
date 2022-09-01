const db = require('./api/db');
const fs = require('fs');

var IO = null;

var VALID_TYPES = { client: true, operator: true };

function say(text) {
    console.log(`${text}`);
}

function setupIO(io) {
    io.use(function (socket, next) {

        console.log(`IO @token:${socket.handshake.query.token}`)
        next();

        //     if (socket.handshake.query && socket.handshake.query.token){
        //       jwt.verify(socket.handshake.query.token, 'SECRET_KEY', function(err, decoded) {
        //         if (err) return next(new Error('Authentication error'));
        //         socket.decoded = decoded;
        //         next();
        //       });
        //     }
        //     else {
        //       next(new Error('Authentication error'));
        //     }    

    }).on('connect', (socket) => {
        console.log(`${socket.id} is connected to server`)
        console.log(`Socket @token:${socket.handshake.query.token}`)

        // creating our custom info object
        socket.info = {}

        // and saving socket id to info object
        socket.info.socketid = socket.id

        function say(text) {
            console.log(`${socket.info.socketid} type:${socket.info.type} id:${socket.info.id} ==> ${text}`);
        }

        function getRoomClients(room) {
            return new Promise((resolve, reject) => {
                io.in(room).clients((error, clients) => {
                    resolve(clients);
                });
            });
        }

        //######################################################################################

        socket.on('disconnecting', (reason) => {
            // say(`disconnecting!`)
        });

        socket.on('disconnect', (reason) => {
            say(`disconnected!`)

            // console.log(`Total Rooms:`);
            // console.log(io.sockets.adapter.rooms);
        });

        //######################################################################################
        // START - Authentication ( Online ) 

        socket.on('setOnline', (info) => { // maybe need @auth. Anyway this must be called first! :)

            /** Binding an info to session
            * 
            * Required info
            *  type: client or operator
            *  id: client username or operator id
            */
            socket.info.type = info.type;
            socket.info.id = info.id;

            // We need a valid typed session
            if (!(info.type in VALID_TYPES)) {
                say(`Denied! Invalid type:${info.type}`);
                socket.disconnect();
                return;
            }

            socket.join('online:'.concat(info.id), () => {
                say(`online`)
            });

            // console.log(`Total Rooms:`);
            // console.log(io.sockets.adapter.rooms);
        });

        // END - Authentication ( Online ) 
        //######################################################################################

        //######################################################################################
        // START - Room by Order ID

        socket.on('joinOrder', (order) => {
            socket.join('order:'.concat(order), () => {
                say(`joining order:${order}`)
            });
        });

        socket.on('leaveOrder', (order) => {
            socket.leave('order:'.concat(order), () => {
                say(`leaving order:${order}`)
            });
        });

        socket.on('toOrder', async (msg) => {
            say(`sending message order:${msg.order} text:${msg.text} hasImage: ${msg.image != null}`);

            if (msg.image != null) {
                if (!fs.existsSync('chatImages')){
                    fs.mkdirSync('chatImages');
                }
                say(`Image name: ${msg.image.name} Base64 length: ${msg.image.base64.length}`);
                // just saving for human readable :D
                fs.writeFileSync(`chatImages/${msg.image.name}`, Buffer.from(msg.image.base64, 'base64'));
            }

            // setting received date
            msg.date = Date.now();

            // setting message type
            msg.type = socket.info.type

            // getting owner username of order
            let username = await new Promise((resolve, reject) => {
                db.query("call sp_getOwner(?)", msg.order, (err, results) => {
                    if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                        say(`Error on getting owner: ${err.message.replace('ER_SIGNAL_EXCEPTION: ', '')}`)
                    }
                    else if (err) {
                        say(`Error on getting owner: ${err.message}`)
                    } else {
                        resolve(results[0][0].username);
                    }
                });
            });
            say(`RoomOrder owner:${username}`);


            let owner_sessions = await getRoomClients('online:'.concat(username)); // oroo ezenii online session uud
            let inroom_sessions = await getRoomClients('order:'.concat(msg.order)); // oroon dotorh session uud
            let inroom_owners = owner_sessions.filter(session => inroom_sessions.includes(session)); // hereglegchiin session oroond bgag avah

            if (inroom_owners.length == 0) { // oroond baihgui bol Notification ilgeeh.
                // getting notif_id
                var notification = await new Promise((resolve, reject) => {
                    db.query("call sp_create_notification(?,1)", [msg.order],
                        (err, results) => {
                            if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                                say(`Error on saving notification: ${err.message.replace('ER_SIGNAL_EXCEPTION: ', '')}`)
                            }
                            else if (err) {
                                say(`Error on saving notification: ${err.message}`)
                            } else {
                                say('Notification saved. Type: msg')
                                resolve(results[0][0]);
                            }
                        });
                });

                msg.notif_id = notification.notif_id;
                msg.notif_count = notification.notif_count;

                say(`sending notification(${msg.notif_id}) to id:${username}`);
                socket.broadcast.to('online:'.concat(username)).emit('notif msg', msg);
            }


            say(`sending msg to room:${msg.order}`);
            // sending to orderRoom    
            socket.broadcast.to('order:'.concat(msg.order)).emit('msg', msg);
            // save to database
            db.query("call sp_save_message(?,?,?,?,?)",
                [
                    msg.order,
                    socket.info.type == 'client' ? 'client' : 'operator',
                    msg.text,
                    msg.image == null ? null : msg.image.name,
                    msg.image == null ? null : msg.image.base64,
                ],
                (err, results) => {
                    if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                        say(`Error on saving message: ${err.message.replace('ER_SIGNAL_EXCEPTION: ', '')}`)
                    }
                    else if (err) {
                        say(`Error on saving message: ${err.message}`)
                    } else {
                        say('Message saved')
                    }

                })

        });

        // END - Room by Order ID
        //######################################################################################
    });

    IO = io;
}


module.exports = {
    IO: () => IO,
    assign: (io) => setupIO(io),
    sendNotifStatus: async (msg) => {
        // setting received date
        msg.date = Date.now();

        // getting owner username of order
        let username = await new Promise((resolve, reject) => {
            db.query("call sp_getOwner(?)", msg.order, (err, results) => {
                if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                    say(`Error on getting owner: ${err.message.replace('ER_SIGNAL_EXCEPTION: ', '')}`)
                }
                else if (err) {
                    say(`Error on getting owner: ${err.message}`)
                } else {
                    resolve(results[0][0].username);
                }
            });
        });
        say(`RoomOrder owner:${username}`);

        // getting notif_id
        var notification = await new Promise((resolve, reject) => {
            db.query("call sp_create_notification(?,0)", [msg.order],
                (err, results) => {
                    if (err && err.message.startsWith("ER_SIGNAL_EXCEPTION")) {
                        say(`Error on saving notification status: ${err.message.replace('ER_SIGNAL_EXCEPTION: ', '')}`)
                    }
                    else if (err) {
                        say(`Error on saving notification status: ${err.message}`)
                    } else {
                        say('Notification saved. Type: status')
                        resolve(results[0][0]);
                    }
                });
        });

        msg.notif_id = notification.notif_id;
        msg.notif_count = notification.notif_count;

        say(`sending notification status(${msg.notif_id}) to id:${username}`);
        IO.to('online:'.concat(username)).emit('notif orderStatus', msg);
    }
};